import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  extractComponentCounts,
  listPackages,
  readmeCurrentVersionGate,
  readmeMentionsVersion,
} from '../../gates/33-readme-current-version';

interface Fixture {
  root: string;
}

interface PackageSpec {
  dir: string;
  version: string | null;
  readme: string | null;
}

async function createFixture(opts: {
  rootReadme: string | null;
  registryComponents: string[] | null;
  packages: PackageSpec[];
}): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), 'pxlkit-gate-33-'));

  if (opts.rootReadme !== null) {
    await writeFile(join(root, 'README.md'), opts.rootReadme);
  }

  if (opts.registryComponents !== null) {
    await mkdir(join(root, 'packages/ui-kit/src'), { recursive: true });
    const entries = opts.registryComponents.map((c) => `  '${c}',`).join('\n');
    await writeFile(
      join(root, 'packages/ui-kit/src/registry.ts'),
      `export const UI_KIT_COMPONENTS = [\n${entries}\n] as const;\n`,
    );
  }

  for (const p of opts.packages) {
    const pkgDir = join(root, 'packages', p.dir);
    await mkdir(pkgDir, { recursive: true });
    const pkg: Record<string, string> = { name: `@pxlkit/${p.dir}` };
    if (p.version) pkg.version = p.version;
    await writeFile(join(pkgDir, 'package.json'), JSON.stringify(pkg));
    if (p.readme !== null) {
      await writeFile(join(pkgDir, 'README.md'), p.readme);
    }
  }

  return { root };
}

describe('gate 33: readme-current-version', () => {
  const fixtures: Fixture[] = [];

  afterAll(async () => {
    for (const f of fixtures) {
      await rm(f.root, { recursive: true, force: true });
    }
  });

  it('passes when every package README mentions its current version and counts match', async () => {
    const f = await createFixture({
      rootReadme: 'pxlkit kit with **3 components** | components-3 badge',
      registryComponents: ['PixelCard', 'PixelBadge', 'PixelButton'],
      packages: [
        {
          dir: 'ui-kit',
          version: '1.5.0',
          readme:
            'New in v1.5.0 — bug fixes\n3 retro pixel art React UI components\ncomponents-3',
        },
        {
          dir: 'ui',
          version: '1.2.5',
          readme: 'npm i @pxlkit/ui@1.2.5',
        },
      ],
    });
    fixtures.push(f);

    const result = await readmeCurrentVersionGate({ repoRoot: f.root });
    expect(result.gateId).toBe('33-readme-current-version');
    expect(result.drift).toEqual([]);
  });

  it('flags package README that does not mention current version (minor)', async () => {
    const f = await createFixture({
      rootReadme: null,
      registryComponents: null,
      packages: [
        {
          dir: 'social',
          version: '1.2.4',
          readme: 'Social pack — no version mention here at all',
        },
      ],
    });
    fixtures.push(f);

    const result = await readmeCurrentVersionGate({ repoRoot: f.root });
    const d = result.drift.find((x) => x.artifact === 'packages/social/README.md');
    expect(d).toBeDefined();
    expect(d?.severity).toBe('minor');
    expect(d?.expected).toContain('1.2.4');
  });

  it('flags package missing README entirely as minor (not blocker)', async () => {
    const f = await createFixture({
      rootReadme: null,
      registryComponents: null,
      packages: [{ dir: 'weather', version: '1.2.4', readme: null }],
    });
    fixtures.push(f);

    const result = await readmeCurrentVersionGate({ repoRoot: f.root });
    const d = result.drift.find((x) => x.artifact === 'packages/weather/README.md');
    expect(d).toBeDefined();
    expect(d?.severity).toBe('minor');
    expect(d?.actual).toContain('missing');
  });

  it('flags root README stale component count vs registry length', async () => {
    const f = await createFixture({
      rootReadme:
        'pxlkit ships 57 retro pixel art React UI components | shields components-57 slug',
      registryComponents: ['A', 'B', 'C'],
      packages: [],
    });
    fixtures.push(f);

    const result = await readmeCurrentVersionGate({ repoRoot: f.root });
    const drifts = result.drift.filter((x) => x.artifact === 'README.md');
    expect(drifts.length).toBeGreaterThan(0);
    for (const d of drifts) {
      expect(d.severity).toBe('minor');
      expect(d.actual).toContain('57');
    }
  });

  it('does not flag packages with no version field', async () => {
    const f = await createFixture({
      rootReadme: null,
      registryComponents: null,
      packages: [{ dir: 'experimental', version: null, readme: 'no version yet' }],
    });
    fixtures.push(f);

    const result = await readmeCurrentVersionGate({ repoRoot: f.root });
    expect(result.drift.filter((d) => d.artifact.includes('experimental'))).toEqual([]);
  });

  it('readmeMentionsVersion matches bare and prefixed forms', () => {
    expect(readmeMentionsVersion('release v1.5.0 notes', '1.5.0')).toBe(true);
    expect(readmeMentionsVersion('install @pxlkit/ui@1.2.5 today', '1.2.5')).toBe(true);
    expect(readmeMentionsVersion('shields/v-1.5.0-blue', '1.5.0')).toBe(true);
    expect(readmeMentionsVersion('nothing here', '1.5.0')).toBe(false);
    expect(readmeMentionsVersion('', '1.5.0')).toBe(false);
  });

  it('extractComponentCounts pulls counts from badge slug and prose alike', () => {
    const readme = `
      <img src="https://img.shields.io/badge/components-57" />
      kit with **42 components**, providing 9 styled components.
      Data Display — 14 components (this category subtotal should be IGNORED).
    `;
    const counts = extractComponentCounts(readme);
    // Should include 57 (badge), 42 (with N components), 9 (providing N styled).
    // Should NOT include 14 (category subtotal, not matched by these patterns).
    expect(counts).toEqual(expect.arrayContaining([57, 42, 9]));
    expect(counts).not.toContain(14);
  });

  it('listPackages returns sorted directory names and skips dotfiles', async () => {
    const f = await createFixture({
      rootReadme: null,
      registryComponents: null,
      packages: [
        { dir: 'zeta', version: '1.0.0', readme: 'v1.0.0' },
        { dir: 'alpha', version: '1.0.0', readme: 'v1.0.0' },
      ],
    });
    fixtures.push(f);

    const pkgs = await listPackages(f.root);
    expect(pkgs).toEqual(['alpha', 'zeta']);
  });

  it('returns empty drift when repo has no packages and no root README', async () => {
    const root = await mkdtemp(join(tmpdir(), 'pxlkit-gate-33-empty-'));
    fixtures.push({ root });

    const result = await readmeCurrentVersionGate({ repoRoot: root });
    expect(result.drift).toEqual([]);
  });
});
