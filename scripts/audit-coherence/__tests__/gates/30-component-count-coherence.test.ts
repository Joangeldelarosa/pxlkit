import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { componentCountCoherenceGate } from '../../gates/30-component-count-coherence';

interface Fixture {
  root: string;
}

async function createFixture(opts: {
  registryCount: number;
  pkgDescriptionCount: number;
  uiKitReadmeCounts: number[];
  rootReadmeCounts: number[];
}): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), 'pxlkit-gate-30-'));

  await mkdir(join(root, 'packages/ui-kit/src'), { recursive: true });

  const entries = Array.from({ length: opts.registryCount }, (_, i) => `  'PixelComp${i}',`).join('\n');
  await writeFile(
    join(root, 'packages/ui-kit/src/registry.ts'),
    `export const UI_KIT_COMPONENTS = [\n${entries}\n] as const;\n`,
  );

  await writeFile(
    join(root, 'packages/ui-kit/package.json'),
    JSON.stringify({
      name: '@pxlkit/ui-kit',
      version: '1.5.0',
      description: `Retro pixel art UI kit — ${opts.pkgDescriptionCount} production-ready React components`,
    }),
  );

  const uiKitReadme = opts.uiKitReadmeCounts
    .map((n, i) => `Body mention ${i}: providing ${n} retro pixel art styled components for building apps.`)
    .join('\n');
  await writeFile(join(root, 'packages/ui-kit/README.md'), uiKitReadme || '# ui-kit\n');

  const rootReadme = opts.rootReadmeCounts
    .map((n, i) => `Root mention ${i}: a retro React UI kit with ${n} components.`)
    .join('\n');
  await writeFile(join(root, 'README.md'), rootReadme || '# pxlkit\n');

  return { root };
}

describe('gate 30: component count coherence', () => {
  const fixtures: Fixture[] = [];

  beforeAll(() => {
    // no-op — fixtures are created per-test
  });

  afterAll(async () => {
    for (const f of fixtures) {
      await rm(f.root, { recursive: true, force: true });
    }
  });

  it('reports no drift when registry, package.json, and READMEs all align', async () => {
    const f = await createFixture({
      registryCount: 57,
      pkgDescriptionCount: 57,
      uiKitReadmeCounts: [57, 57],
      rootReadmeCounts: [57, 57, 57],
    });
    fixtures.push(f);

    const result = await componentCountCoherenceGate({ repoRoot: f.root });

    expect(result.gateId).toBe('30-component-count-coherence');
    expect(result.drift).toEqual([]);
  });

  it('reports drift when package.json description count mismatches registry', async () => {
    const f = await createFixture({
      registryCount: 57,
      pkgDescriptionCount: 56,
      uiKitReadmeCounts: [57],
      rootReadmeCounts: [57],
    });
    fixtures.push(f);

    const result = await componentCountCoherenceGate({ repoRoot: f.root });

    const pkgDrift = result.drift.find((d) => d.artifact === 'packages/ui-kit/package.json');
    expect(pkgDrift).toBeDefined();
    expect(pkgDrift?.severity).toBe('major');
    expect(pkgDrift?.expected).toContain('57');
    expect(pkgDrift?.actual).toContain('56');
  });

  it('reports drift when ui-kit README has stale counts', async () => {
    const f = await createFixture({
      registryCount: 57,
      pkgDescriptionCount: 57,
      uiKitReadmeCounts: [54, 54, 54, 54],
      rootReadmeCounts: [57],
    });
    fixtures.push(f);

    const result = await componentCountCoherenceGate({ repoRoot: f.root });

    const readmeDrift = result.drift.filter((d) => d.artifact === 'packages/ui-kit/README.md');
    expect(readmeDrift.length).toBeGreaterThan(0);
    expect(readmeDrift[0]?.severity).toBe('blocker');
  });

  it('reports drift when root README has stale counts', async () => {
    const f = await createFixture({
      registryCount: 57,
      pkgDescriptionCount: 57,
      uiKitReadmeCounts: [57],
      rootReadmeCounts: [54, 54, 54],
    });
    fixtures.push(f);

    const result = await componentCountCoherenceGate({ repoRoot: f.root });

    const rootDrift = result.drift.filter((d) => d.artifact === 'README.md');
    expect(rootDrift.length).toBeGreaterThan(0);
    expect(rootDrift[0]?.severity).toBe('blocker');
  });

  it('reports blocker when registry is empty', async () => {
    const f = await createFixture({
      registryCount: 0,
      pkgDescriptionCount: 57,
      uiKitReadmeCounts: [57],
      rootReadmeCounts: [57],
    });
    fixtures.push(f);

    const result = await componentCountCoherenceGate({ repoRoot: f.root });

    const registryDrift = result.drift.find(
      (d) => d.artifact === 'packages/ui-kit/src/registry.ts',
    );
    expect(registryDrift).toBeDefined();
    expect(registryDrift?.severity).toBe('blocker');
  });
});
