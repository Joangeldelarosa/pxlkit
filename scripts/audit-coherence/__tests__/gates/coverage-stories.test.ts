import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs-extra';
import CoverageStoriesGate from '../../gates/03-coverage-stories.js';
import type {
  AuditContext,
  Logger,
  ManifestRecord,
} from '../../_lib/load-context.js';

function silentLogger(): Logger {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  };
}

interface FakeContextOptions {
  manifests: ManifestRecord[];
}

async function makeFakeContext(
  repoRoot: string,
  opts: FakeContextOptions,
): Promise<AuditContext> {
  const uiKitSrcDir = path.join(repoRoot, 'packages/ui-kit/src');
  const appsWebSrcDir = path.join(repoRoot, 'apps/web/src');
  await fs.ensureDir(uiKitSrcDir);
  await fs.ensureDir(appsWebSrcDir);
  return {
    repoRoot,
    manifests: opts.manifests,
    uiKitSrcDir,
    appsWebSrcDir,
    tokensFile: path.join(uiKitSrcDir, 'tokens.ts'),
    registryFile: path.join(uiKitSrcDir, 'registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [],
    logger: silentLogger(),
  };
}

describe('CoverageStoriesGate', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'cov-stories-'));
  });

  afterEach(async () => {
    await fs.remove(tmp);
  });

  it('exposes correct metadata', () => {
    const gate = new CoverageStoriesGate();
    expect(gate.id).toBe(3);
    expect(gate.name).toBe('coverage-stories');
    expect(gate.description).toMatch(/\.stories\.tsx/);
  });

  it('passes when every component has a sibling story file', async () => {
    const compDir = path.join(tmp, 'packages/ui-kit/src/cards');
    await fs.ensureDir(compDir);
    await fs.writeFile(path.join(compDir, 'PixelHero.tsx'), 'export const PixelHero = () => null;');
    await fs.writeFile(
      path.join(compDir, 'PixelHero.stories.tsx'),
      'export default {};',
    );

    const ctx = await makeFakeContext(tmp, {
      manifests: [
        { component: 'PixelHero', file: 'packages/ui-kit/src/cards/PixelHero.tsx' },
      ],
    });

    const result = await new CoverageStoriesGate().run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.name).toBe('coverage-stories');
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('flags a minor finding when story is missing next to component', async () => {
    const compDir = path.join(tmp, 'packages/ui-kit/src/cards');
    await fs.ensureDir(compDir);
    await fs.writeFile(path.join(compDir, 'PixelGhost.tsx'), 'export const PixelGhost = () => null;');

    const ctx = await makeFakeContext(tmp, {
      manifests: [
        { component: 'PixelGhost', file: 'packages/ui-kit/src/cards/PixelGhost.tsx' },
      ],
    });

    const result = await new CoverageStoriesGate().run(ctx);
    expect(result.passed).toBe(true); // minor → does not block
    expect(result.findings).toHaveLength(1);
    const [finding] = result.findings;
    expect(finding.severity).toBe('minor');
    expect(finding.component).toBe('PixelGhost');
    expect(finding.file).toContain('PixelGhost.tsx');
    expect(finding.message).toMatch(/no \.stories\.tsx found/);
    expect(finding.suggestion).toMatch(/PixelGhost\.stories\.tsx/);
  });

  it('accepts a generic *.stories.tsx in same directory as coverage', async () => {
    const compDir = path.join(tmp, 'packages/ui-kit/src');
    await fs.ensureDir(compDir);
    await fs.writeFile(path.join(compDir, 'actions.tsx'), 'export const PixelButton = () => null;');
    await fs.writeFile(path.join(compDir, 'actions.stories.tsx'), 'export default {};');

    const ctx = await makeFakeContext(tmp, {
      manifests: [{ component: 'PixelButton', file: 'packages/ui-kit/src/actions.tsx' }],
    });

    const result = await new CoverageStoriesGate().run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('falls back to discovering the component file when manifest omits "file"', async () => {
    const compDir = path.join(tmp, 'packages/ui-kit/src/forms');
    await fs.ensureDir(compDir);
    await fs.writeFile(path.join(compDir, 'PixelFormX.tsx'), 'export const PixelFormX = () => null;');

    const ctx = await makeFakeContext(tmp, {
      manifests: [{ component: 'PixelFormX' }],
    });

    const result = await new CoverageStoriesGate().run(ctx);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('minor');
    expect(result.findings[0].message).toMatch(/no \.stories\.tsx found/);
  });

  it('emits a minor finding when component file cannot be located at all', async () => {
    const ctx = await makeFakeContext(tmp, {
      manifests: [{ component: 'PixelGhostNotOnDisk' }],
    });

    const result = await new CoverageStoriesGate().run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('minor');
    expect(result.findings[0].message).toMatch(/cannot locate component file/);
  });

  it('passes cleanly when manifests array is empty', async () => {
    const ctx = await makeFakeContext(tmp, { manifests: [] });
    const result = await new CoverageStoriesGate().run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });
});
