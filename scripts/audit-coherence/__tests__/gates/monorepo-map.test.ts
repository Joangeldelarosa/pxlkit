/**
 * Tests for Gate 16 — monorepo-map.
 *
 * Builds a temp filesystem with a root package.json + README.md and a set
 * of fake workspaces, then exercises the gate against a mocked AuditContext.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  MonorepoMapGate,
  WORKSPACES_END_MARKER,
  WORKSPACES_START_MARKER,
  auditMonorepoMap,
  blockMentionsWorkspace,
  discoverWorkspaceRefs,
  extractWorkspacesBlock,
  findOrphanTokens,
  workspacePatterns,
} from '../../gates/16-monorepo-map.js';
import type { AuditContext, Logger } from '../../_lib/load-context.js';

const silentLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'gate16-'));
});

afterEach(async () => {
  await fs.remove(tmpRoot);
});

interface FixturePkg {
  /** Repo-relative directory, e.g. `packages/ui-kit` or `apps/web`. */
  relDir: string;
  /** npm package name to write into package.json. */
  name: string;
}

interface FixtureOptions {
  workspaces?: string[] | { packages?: string[] };
  pkgs?: FixturePkg[];
  readme?: string | null;
  rootName?: string;
}

async function buildFixture(opts: FixtureOptions): Promise<AuditContext> {
  const rootPkg: Record<string, unknown> = {
    name: opts.rootName ?? 'mono-fixture',
    private: true,
    version: '0.0.0',
  };
  if (opts.workspaces !== undefined) {
    rootPkg.workspaces = opts.workspaces;
  }
  await fs.writeJson(path.join(tmpRoot, 'package.json'), rootPkg, { spaces: 2 });

  for (const pkg of opts.pkgs ?? []) {
    const pkgDir = path.join(tmpRoot, pkg.relDir);
    await fs.ensureDir(pkgDir);
    await fs.writeJson(path.join(pkgDir, 'package.json'), { name: pkg.name });
  }

  if (opts.readme !== null && opts.readme !== undefined) {
    await fs.writeFile(path.join(tmpRoot, 'README.md'), opts.readme, 'utf8');
  }

  return {
    repoRoot: tmpRoot,
    manifests: [],
    uiKitSrcDir: path.join(tmpRoot, 'packages/ui-kit/src'),
    appsWebSrcDir: path.join(tmpRoot, 'apps/web/src'),
    tokensFile: path.join(tmpRoot, 'packages/ui-kit/src/tokens.ts'),
    registryFile: path.join(tmpRoot, 'packages/ui-kit/src/registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [],
    logger: silentLogger,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

describe('workspacePatterns', () => {
  it('returns the array form unchanged', () => {
    expect(workspacePatterns({ workspaces: ['packages/*', 'apps/*'] })).toEqual([
      'packages/*',
      'apps/*',
    ]);
  });

  it('reads the object form { packages: [...] }', () => {
    expect(
      workspacePatterns({ workspaces: { packages: ['libs/*'] } }),
    ).toEqual(['libs/*']);
  });

  it('returns [] when workspaces is missing', () => {
    expect(workspacePatterns({})).toEqual([]);
  });
});

describe('extractWorkspacesBlock', () => {
  it('returns the slice between the markers', () => {
    const src = `intro\n${WORKSPACES_START_MARKER}\nrow A\nrow B\n${WORKSPACES_END_MARKER}\ntail`;
    expect(extractWorkspacesBlock(src)).toContain('row A');
    expect(extractWorkspacesBlock(src)).toContain('row B');
    expect(extractWorkspacesBlock(src)).not.toContain('intro');
    expect(extractWorkspacesBlock(src)).not.toContain('tail');
  });

  it('returns null when either marker is missing', () => {
    expect(extractWorkspacesBlock(`only ${WORKSPACES_START_MARKER}`)).toBeNull();
    expect(extractWorkspacesBlock(`only ${WORKSPACES_END_MARKER}`)).toBeNull();
    expect(extractWorkspacesBlock('no markers at all')).toBeNull();
  });

  it('returns null when the markers appear in the wrong order', () => {
    const src = `${WORKSPACES_END_MARKER} then ${WORKSPACES_START_MARKER}`;
    expect(extractWorkspacesBlock(src)).toBeNull();
  });
});

describe('blockMentionsWorkspace', () => {
  const ws = { packageName: '@pxlkit/ui-kit', relDir: 'packages/ui-kit', slug: 'ui-kit' };

  it('matches on full package name', () => {
    expect(blockMentionsWorkspace('see [`@pxlkit/ui-kit`](./packages/ui-kit)', ws)).toBe(true);
  });

  it('matches on repo-relative path', () => {
    expect(blockMentionsWorkspace('packages/ui-kit lives here', ws)).toBe(true);
  });

  it('matches on bare slug as a whole word', () => {
    expect(blockMentionsWorkspace('the ui-kit package', ws)).toBe(true);
  });

  it('does not match a slug as a substring of a longer token', () => {
    const onlyUi = { packageName: '', relDir: '', slug: 'ui' };
    expect(blockMentionsWorkspace('ui-kit only', onlyUi)).toBe(false);
  });

  it('returns false when none of the fields appear', () => {
    expect(blockMentionsWorkspace('nothing relevant here', ws)).toBe(false);
  });
});

describe('findOrphanTokens', () => {
  const real = [
    { packageName: '@pxlkit/ui-kit', relDir: 'packages/ui-kit', slug: 'ui-kit' },
    { packageName: '@pxlkit/core', relDir: 'packages/core', slug: 'core' },
  ];

  it('flags scoped package names that no workspace owns', () => {
    const block = '`@pxlkit/ghost` is gone but still in the table';
    expect(findOrphanTokens(block, real)).toEqual(['@pxlkit/ghost']);
  });

  it('flags workspace-shaped repo paths with no workspace on disk', () => {
    const block = 'packages/legacy and apps/old';
    expect(findOrphanTokens(block, real).sort()).toEqual([
      'apps/old',
      'packages/legacy',
    ]);
  });

  it('returns [] when block only references real workspaces', () => {
    const block = '`@pxlkit/ui-kit` (packages/ui-kit) and `@pxlkit/core`';
    expect(findOrphanTokens(block, real)).toEqual([]);
  });
});

describe('discoverWorkspaceRefs', () => {
  it('expands packages/* + apps/* globs and reads names', async () => {
    const ctx = await buildFixture({
      workspaces: ['packages/*', 'apps/*'],
      pkgs: [
        { relDir: 'packages/ui-kit', name: '@fix/ui-kit' },
        { relDir: 'packages/core', name: '@fix/core' },
        { relDir: 'apps/web', name: '@fix/web' },
      ],
    });

    const refs = await discoverWorkspaceRefs(ctx.repoRoot, {
      workspaces: ['packages/*', 'apps/*'],
    });

    expect(refs.map((r) => r.relDir).sort()).toEqual([
      'apps/web',
      'packages/core',
      'packages/ui-kit',
    ]);
    expect(refs.find((r) => r.slug === 'ui-kit')?.packageName).toBe('@fix/ui-kit');
  });

  it('returns [] when no workspaces field is configured', async () => {
    const ctx = await buildFixture({ pkgs: [] });
    expect(await discoverWorkspaceRefs(ctx.repoRoot, {})).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

describe('MonorepoMapGate', () => {
  it('has the expected static metadata', () => {
    const gate = new MonorepoMapGate();
    expect(gate.id).toBe(16);
    expect(gate.name).toBe('monorepo-map');
    expect(gate.description).toMatch(/monorepo|WORKSPACES:START|workspace/i);
  });

  it('passes when every workspace is mentioned inside the markers', async () => {
    const readme = [
      '# mono',
      '',
      '## Monorepo map',
      '',
      WORKSPACES_START_MARKER,
      '',
      '| Package | Path |',
      '| --- | --- |',
      '| `@fix/ui-kit` | packages/ui-kit |',
      '| `@fix/core`   | packages/core   |',
      '| `@fix/web`    | apps/web        |',
      '',
      WORKSPACES_END_MARKER,
      '',
    ].join('\n');

    const ctx = await buildFixture({
      workspaces: ['packages/*', 'apps/*'],
      pkgs: [
        { relDir: 'packages/ui-kit', name: '@fix/ui-kit' },
        { relDir: 'packages/core', name: '@fix/core' },
        { relDir: 'apps/web', name: '@fix/web' },
      ],
      readme,
    });

    const result = await new MonorepoMapGate().run(ctx);
    expect(result.name).toBe('monorepo-map');
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(typeof result.duration_ms).toBe('number');
  });

  it('fails major when the markers are missing entirely', async () => {
    const readme = '# mono\n\nNo workspaces block here.\n';
    const ctx = await buildFixture({
      workspaces: ['packages/*'],
      pkgs: [{ relDir: 'packages/ui-kit', name: '@fix/ui-kit' }],
      readme,
    });

    const result = await new MonorepoMapGate().run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const f = result.findings[0]!;
    expect(f.severity).toBe('major');
    expect(f.message).toMatch(/markers/i);
    expect(f.file).toMatch(/README\.md$/);
  });

  it('fails major when a declared workspace is missing from the block', async () => {
    const readme = [
      WORKSPACES_START_MARKER,
      '- `@fix/ui-kit` (packages/ui-kit)',
      WORKSPACES_END_MARKER,
    ].join('\n');

    const ctx = await buildFixture({
      workspaces: ['packages/*', 'apps/*'],
      pkgs: [
        { relDir: 'packages/ui-kit', name: '@fix/ui-kit' },
        { relDir: 'apps/web', name: '@fix/web' },
      ],
      readme,
    });

    const result = await new MonorepoMapGate().run(ctx);
    expect(result.passed).toBe(false);
    const webFinding = result.findings.find((f) => f.component === '@fix/web');
    expect(webFinding).toBeDefined();
    expect(webFinding?.severity).toBe('major');
    expect(webFinding?.suggestion).toMatch(/WORKSPACES:START/);
  });

  it('fails major when the block lists a workspace that no longer exists', async () => {
    const readme = [
      WORKSPACES_START_MARKER,
      '- `@fix/ui-kit` (packages/ui-kit)',
      '- `@fix/ghost` (packages/ghost)',
      WORKSPACES_END_MARKER,
    ].join('\n');

    const ctx = await buildFixture({
      workspaces: ['packages/*'],
      pkgs: [{ relDir: 'packages/ui-kit', name: '@fix/ui-kit' }],
      readme,
    });

    const result = await new MonorepoMapGate().run(ctx);
    expect(result.passed).toBe(false);
    const ghostByPkg = result.findings.find((f) => f.component === '@fix/ghost');
    const ghostByPath = result.findings.find((f) => f.component === 'packages/ghost');
    expect(ghostByPkg ?? ghostByPath).toBeDefined();
    const flagged = (ghostByPkg ?? ghostByPath)!;
    expect(flagged.severity).toBe('major');
    expect(flagged.message).toMatch(/no such workspace/i);
  });

  it('passes (trivially) when the root has no workspaces field', async () => {
    const readme = `${WORKSPACES_START_MARKER}\n_no workspaces_\n${WORKSPACES_END_MARKER}\n`;
    const ctx = await buildFixture({ readme });
    const result = await new MonorepoMapGate().run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('audit helper returns the parsed block + workspace lists', async () => {
    const readme = `${WORKSPACES_START_MARKER}\n@fix/ui-kit\n${WORKSPACES_END_MARKER}`;
    const ctx = await buildFixture({
      workspaces: ['packages/*'],
      pkgs: [
        { relDir: 'packages/ui-kit', name: '@fix/ui-kit' },
        { relDir: 'packages/core', name: '@fix/core' },
      ],
      readme,
    });

    const report = await auditMonorepoMap(ctx);
    expect(report.markersFound).toBe(true);
    expect(report.workspaces.map((w) => w.slug).sort()).toEqual(['core', 'ui-kit']);
    expect(report.missing.map((m) => m.slug)).toEqual(['core']);
    expect(report.orphanTokens).toEqual([]);
  });
});
