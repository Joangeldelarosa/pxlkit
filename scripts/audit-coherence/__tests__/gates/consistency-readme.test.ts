import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ConsistencyReadmeGate,
  auditReadmeRegistryConsistency,
  parseReadmeComponents,
  parseRegistryComponents,
} from '../../gates/07-consistency-readme.js';
import type { AuditContext, Logger, PackageFileRef } from '../../_lib/load-context.js';

const silentLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

interface FixturePackage {
  name: string;
  registry?: string;
  readme?: string;
}

async function buildFixture(pkgs: FixturePackage[]): Promise<{
  ctx: AuditContext;
  cleanup: () => Promise<void>;
}> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gate7-'));
  const packageJsons: PackageFileRef[] = [];
  const readmeFiles: PackageFileRef[] = [];

  for (const p of pkgs) {
    const pkgDir = path.join(root, 'packages', p.name);
    await fs.ensureDir(path.join(pkgDir, 'src'));
    const pkgJsonPath = path.join(pkgDir, 'package.json');
    await fs.writeJson(pkgJsonPath, { name: `@fix/${p.name}` });
    packageJsons.push({ package: `@fix/${p.name}`, path: pkgJsonPath });

    if (p.registry !== undefined) {
      await fs.writeFile(path.join(pkgDir, 'src/registry.ts'), p.registry, 'utf8');
    }
    if (p.readme !== undefined) {
      const readmePath = path.join(pkgDir, 'README.md');
      await fs.writeFile(readmePath, p.readme, 'utf8');
      readmeFiles.push({ package: `@fix/${p.name}`, path: readmePath });
    }
  }

  const ctx: AuditContext = {
    repoRoot: root,
    manifests: [],
    uiKitSrcDir: path.join(root, 'packages/ui-kit/src'),
    appsWebSrcDir: path.join(root, 'apps/web/src'),
    tokensFile: path.join(root, 'packages/ui-kit/src/tokens.ts'),
    registryFile: path.join(root, 'packages/ui-kit/src/registry.ts'),
    readmeFiles,
    changelogFiles: [],
    packageJsons,
    logger: silentLogger,
  };

  return {
    ctx,
    cleanup: async () => {
      await fs.remove(root);
    },
  };
}

const REGISTRY_OK = `export const PKG_COMPONENTS = [
  'PixelButton',
  'PixelCard',
  'PixelTable',
] as const;
`;

const README_OK = `# pkg

## Overview

stuff

## Components

### Layout

| Component | Description |
| --- | --- |
| \`PixelCard\` | A card |
| \`PixelTable\` | A table |

### Actions

| Component | Description |
| --- | --- |
| \`PixelButton\` | A button |

## Storybook

unrelated tail content with \`SomethingElse\` that should not count.
`;

describe('parseRegistryComponents', () => {
  it('extracts component identifiers from an as-const tuple', () => {
    const out = parseRegistryComponents(REGISTRY_OK);
    expect(out.sort()).toEqual(['PixelButton', 'PixelCard', 'PixelTable']);
  });

  it('ignores non-PascalCase strings', () => {
    const src = `export const X = ['notExported', 'PixelButton'] as const;`;
    expect(parseRegistryComponents(src)).toEqual(['PixelButton']);
  });

  it('returns empty for a file with no as-const tuple', () => {
    expect(parseRegistryComponents("// nothing here\nexport const x = 1;")).toEqual([]);
  });
});

describe('parseReadmeComponents', () => {
  it('captures backticked component tokens only inside ## Components', () => {
    const out = parseReadmeComponents(README_OK);
    expect(out.sort()).toEqual(['PixelButton', 'PixelCard', 'PixelTable']);
  });

  it('stops scanning at the next top-level heading', () => {
    const md = `## Components\n\n| \`PixelA\` |\n\n## Other\n\n| \`PixelB\` |\n`;
    expect(parseReadmeComponents(md)).toEqual(['PixelA']);
  });

  it('returns empty if there is no Components section', () => {
    expect(parseReadmeComponents('## Overview\n\n| `PixelA` |')).toEqual([]);
  });

  it('skips identifiers written as function calls', () => {
    const md = "## Components\n\n| `usePxlKitLocale()` | hook |\n| `PixelButton` | comp |\n";
    expect(parseReadmeComponents(md)).toEqual(['PixelButton']);
  });
});

describe('ConsistencyReadmeGate', () => {
  let cleanup: (() => Promise<void>) | null = null;

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
      cleanup = null;
    }
  });

  it('passes when registry and README list the same components', async () => {
    const fixture = await buildFixture([
      { name: 'kit', registry: REGISTRY_OK, readme: README_OK },
    ]);
    cleanup = fixture.cleanup;

    const gate = new ConsistencyReadmeGate();
    const result = await gate.run(fixture.ctx);

    expect(result.name).toBe('consistency-readme');
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(typeof result.duration_ms).toBe('number');
  });

  it('fails major when a registry component is missing from the README', async () => {
    const partialReadme = `## Components\n\n| \`PixelButton\` | btn |\n| \`PixelCard\` | card |\n`;
    const fixture = await buildFixture([
      { name: 'kit', registry: REGISTRY_OK, readme: partialReadme },
    ]);
    cleanup = fixture.cleanup;

    const result = await new ConsistencyReadmeGate().run(fixture.ctx);
    expect(result.passed).toBe(false);
    const missingTable = result.findings.find((f) => f.component === 'PixelTable');
    expect(missingTable).toBeDefined();
    expect(missingTable?.severity).toBe('major');
    expect(missingTable?.file).toMatch(/README\.md$/);
    expect(missingTable?.suggestion).toMatch(/PixelTable/);
  });

  it('fails major when README lists a component absent from registry', async () => {
    const readmeWithExtra = `## Components\n\n| \`PixelButton\` | b |\n| \`PixelCard\` | c |\n| \`PixelTable\` | t |\n| \`PixelGhost\` | ghost |\n`;
    const fixture = await buildFixture([
      { name: 'kit', registry: REGISTRY_OK, readme: readmeWithExtra },
    ]);
    cleanup = fixture.cleanup;

    const result = await new ConsistencyReadmeGate().run(fixture.ctx);
    expect(result.passed).toBe(false);
    const ghost = result.findings.find((f) => f.component === 'PixelGhost');
    expect(ghost).toBeDefined();
    expect(ghost?.severity).toBe('major');
    expect(ghost?.message).toMatch(/not in registry/);
  });

  it('reports major when a package has registry.ts but no README.md', async () => {
    const fixture = await buildFixture([{ name: 'kit', registry: REGISTRY_OK }]);
    cleanup = fixture.cleanup;

    const result = await new ConsistencyReadmeGate().run(fixture.ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('major');
    expect(result.findings[0].message).toMatch(/no README\.md/);
  });

  it('skips packages that have no registry.ts (icon-only packages)', async () => {
    const fixture = await buildFixture([
      { name: 'icons-only', readme: '# icons\n\nno registry here' },
    ]);
    cleanup = fixture.cleanup;

    const result = await new ConsistencyReadmeGate().run(fixture.ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('audit helper returns per-package diff details', async () => {
    const fixture = await buildFixture([
      { name: 'kit', registry: REGISTRY_OK, readme: README_OK },
      { name: 'icons-only', readme: '# icons' },
    ]);
    cleanup = fixture.cleanup;

    const reports = await auditReadmeRegistryConsistency(fixture.ctx);
    expect(reports).toHaveLength(1);
    expect(reports[0].package).toBe('@fix/kit');
    expect(reports[0].missingInReadme).toEqual([]);
    expect(reports[0].missingInRegistry).toEqual([]);
    expect(reports[0].registryComponents).toEqual([
      'PixelButton',
      'PixelCard',
      'PixelTable',
    ]);
  });
});
