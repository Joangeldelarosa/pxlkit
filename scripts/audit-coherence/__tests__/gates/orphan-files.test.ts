/**
 * Tests for Gate 18 — orphan-files.
 *
 * Strategy: build a tiny ui-kit fixture in os.tmpdir() per test, configure
 * a mocked AuditContext pointing at it, run the gate, and inspect findings.
 *
 * The fixture is intentionally minimal — only what each scenario needs to
 * exercise the orphan detection rule.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs-extra';

import OrphanFilesGate, {
  detectComponentExports,
  parseReExports,
  readRegistry,
  collectReachableFiles,
} from '../../gates/18-orphan-files.js';
import type { AuditContext, Logger } from '../../_lib/load-context.js';

function silentLogger(): Logger {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  };
}

function ctxFor(repoRoot: string): AuditContext {
  const uiKitSrcDir = path.join(repoRoot, 'packages/ui-kit/src');
  return {
    repoRoot,
    manifests: [],
    uiKitSrcDir,
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(uiKitSrcDir, 'tokens.ts'),
    registryFile: path.join(uiKitSrcDir, 'registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [],
    logger: silentLogger(),
  };
}

async function writeFile(repoRoot: string, rel: string, body: string): Promise<void> {
  const abs = path.join(repoRoot, 'packages/ui-kit/src', rel);
  await fs.outputFile(abs, body, 'utf8');
}

async function writeRegistry(repoRoot: string, names: string[]): Promise<void> {
  const body = `export const UI_KIT_COMPONENTS = [\n${names.map((n) => `  '${n}',`).join('\n')}\n] as const;\n`;
  await writeFile(repoRoot, 'registry.ts', body);
}

describe('OrphanFilesGate', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'orphan-files-'));
  });

  afterEach(async () => {
    await fs.remove(tmp).catch(() => undefined);
  });

  // -----------------------------------------------------------------------
  // Metadata
  // -----------------------------------------------------------------------

  it('exposes the expected gate metadata', () => {
    const gate = new OrphanFilesGate();
    expect(gate.id).toBe(18);
    expect(gate.name).toBe('orphan-files');
    expect(gate.description).toContain('orphan');
    expect(gate.description).toContain('Major');
  });

  // -----------------------------------------------------------------------
  // Happy path
  // -----------------------------------------------------------------------

  it('passes when every component-exporting file is registered AND re-exported from index.tsx', async () => {
    await writeRegistry(tmp, ['PixelFeatureCard']);
    await writeFile(tmp, 'index.tsx', `export * from './cards/PixelFeatureCard';\n`);
    await writeFile(
      tmp,
      'cards/PixelFeatureCard.tsx',
      `export const PixelFeatureCard = () => null;\n`,
    );

    const result = await new OrphanFilesGate().run(ctxFor(tmp));
    expect(result.name).toBe('orphan-files');
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('passes when a non-component .tsx file (helper / utility) is unreferenced', async () => {
    await writeRegistry(tmp, []);
    await writeFile(tmp, 'index.tsx', `export {};\n`);
    // Lowercase identifier → does NOT match the Pixel/PxlKit convention.
    await writeFile(
      tmp,
      'utils/helpers.tsx',
      `export const helperFn = () => 42;\n`,
    );

    const result = await new OrphanFilesGate().run(ctxFor(tmp));
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  it('ignores test, story, and example files even if they export components', async () => {
    await writeRegistry(tmp, []);
    await writeFile(tmp, 'index.tsx', `export {};\n`);
    await writeFile(
      tmp,
      'cards/PixelGhost.stories.tsx',
      `export const PixelGhostStory = () => null;\nexport default {};\n`,
    );
    await writeFile(
      tmp,
      'cards/PixelGhost.examples.tsx',
      `export const PixelGhostExample = () => null;\n`,
    );
    await writeFile(
      tmp,
      '__tests__/cards/PixelGhost.test.tsx',
      `export const PixelGhostTest = () => null;\n`,
    );

    const result = await new OrphanFilesGate().run(ctxFor(tmp));
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  // -----------------------------------------------------------------------
  // Orphan: not registered, not re-exported
  // -----------------------------------------------------------------------

  it('flags a major finding when a component file is neither registered nor re-exported', async () => {
    await writeRegistry(tmp, ['PixelFeatureCard']);
    await writeFile(tmp, 'index.tsx', `export * from './cards/PixelFeatureCard';\n`);
    await writeFile(
      tmp,
      'cards/PixelFeatureCard.tsx',
      `export const PixelFeatureCard = () => null;\n`,
    );
    // Orphan: real file, exports a real-looking component, never registered.
    await writeFile(
      tmp,
      'cards/PixelGhost.tsx',
      `export const PixelGhost = () => null;\n`,
    );

    const result = await new OrphanFilesGate().run(ctxFor(tmp));
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const finding = result.findings[0];
    expect(finding.severity).toBe('major');
    expect(finding.component).toBe('PixelGhost');
    expect(finding.file).toContain('PixelGhost.tsx');
    expect(finding.message).toMatch(/orphan/i);
    expect(finding.suggestion).toBeDefined();
    expect(finding.suggestion).toContain('UI_KIT_COMPONENTS');
  });

  // -----------------------------------------------------------------------
  // Orphan: registered but NOT re-exported from index.tsx
  // -----------------------------------------------------------------------

  it('flags an orphan when a component is registered but never re-exported from index.tsx', async () => {
    await writeRegistry(tmp, ['PixelOrphan']);
    await writeFile(tmp, 'index.tsx', `export {};\n`);
    await writeFile(
      tmp,
      'cards/PixelOrphan.tsx',
      `export const PixelOrphan = () => null;\n`,
    );

    const result = await new OrphanFilesGate().run(ctxFor(tmp));
    expect(result.passed).toBe(false);
    const ghost = result.findings.find((f) => f.component === 'PixelOrphan');
    expect(ghost).toBeDefined();
    expect(ghost?.severity).toBe('major');
    expect(ghost?.message).toMatch(/never re-exported from index\.tsx/);
    expect(ghost?.suggestion).toContain('index.tsx');
  });

  // -----------------------------------------------------------------------
  // Reachability through barrels (one hop)
  // -----------------------------------------------------------------------

  it('treats a component as reachable when accessible via a one-hop barrel', async () => {
    await writeRegistry(tmp, ['PixelButton']);
    // index.tsx → actions.tsx → ./actions/PixelButton
    await writeFile(tmp, 'index.tsx', `export * from './actions';\n`);
    await writeFile(
      tmp,
      'actions.tsx',
      `export * from './actions/PixelButton';\n`,
    );
    await writeFile(
      tmp,
      'actions/PixelButton.tsx',
      `export const PixelButton = () => null;\n`,
    );

    const result = await new OrphanFilesGate().run(ctxFor(tmp));
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  it('treats a component as reachable through an index.ts barrel inside a directory', async () => {
    await writeRegistry(tmp, ['PixelBox']);
    await writeFile(tmp, 'index.tsx', `export * from './layout';\n`);
    await writeFile(
      tmp,
      'layout/index.ts',
      `export * from './PixelBox';\n`,
    );
    await writeFile(
      tmp,
      'layout/PixelBox.tsx',
      `export const PixelBox = () => null;\n`,
    );

    const result = await new OrphanFilesGate().run(ctxFor(tmp));
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  // -----------------------------------------------------------------------
  // Default-exported components
  // -----------------------------------------------------------------------

  it('flags an orphan when only a default-exported component is present and unreferenced', async () => {
    await writeRegistry(tmp, []);
    await writeFile(tmp, 'index.tsx', `export {};\n`);
    await writeFile(
      tmp,
      'cards/Stuff.tsx',
      `export default function PixelStuff() { return null; }\n`,
    );

    const result = await new OrphanFilesGate().run(ctxFor(tmp));
    expect(result.passed).toBe(false);
    const finding = result.findings.find((f) => f.file?.includes('Stuff.tsx'));
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe('major');
  });

  // -----------------------------------------------------------------------
  // Named re-export ({ Foo } from './x') counts as reachable
  // -----------------------------------------------------------------------

  it('treats { Foo } from "./x" named re-exports as reachable', async () => {
    await writeRegistry(tmp, ['PixelMultiSelect']);
    await writeFile(
      tmp,
      'index.tsx',
      `export { PixelMultiSelect, type PixelMultiSelectProps } from './forms/PixelMultiSelect';\n`,
    );
    await writeFile(
      tmp,
      'forms/PixelMultiSelect.tsx',
      `export const PixelMultiSelect = () => null;\nexport type PixelMultiSelectProps = {};\n`,
    );

    const result = await new OrphanFilesGate().run(ctxFor(tmp));
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  // -----------------------------------------------------------------------
  // Empty / missing src is a vacuous pass
  // -----------------------------------------------------------------------

  it('passes vacuously when packages/ui-kit/src does not exist', async () => {
    // tmp exists but no packages/ui-kit/src inside
    const result = await new OrphanFilesGate().run(ctxFor(tmp));
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  // -----------------------------------------------------------------------
  // Pure helper / parser tests — kept compact, only the ones load-bearing.
  // -----------------------------------------------------------------------

  describe('detectComponentExports', () => {
    it('detects export const Foo = () => …', () => {
      const out = detectComponentExports(`export const PixelFoo = () => null;`);
      expect(out.named.has('PixelFoo')).toBe(true);
      expect(out.hasDefaultComponent).toBe(false);
    });

    it('detects export function Foo', () => {
      const out = detectComponentExports(`export function PxlKitBar() { return null; }`);
      expect(out.named.has('PxlKitBar')).toBe(true);
    });

    it('detects export { Foo, Bar as Baz } where Baz is a component', () => {
      const out = detectComponentExports(`const X = () => null; const Y = () => null; export { X as PixelX, Y };`);
      expect(out.named.has('PixelX')).toBe(true);
    });

    it('detects export default function PixelFoo', () => {
      const out = detectComponentExports(`export default function PixelFoo() { return null; }`);
      expect(out.hasDefaultComponent).toBe(true);
    });

    it('ignores non-component identifiers (camelCase helpers, lowercase, etc.)', () => {
      const out = detectComponentExports(`export const helperFn = () => 42; export function someUtil() {}`);
      expect(out.named.size).toBe(0);
      expect(out.hasDefaultComponent).toBe(false);
    });
  });

  describe('parseReExports', () => {
    it('captures `export * from` and named re-exports', () => {
      const src = [
        `export * from './a';`,
        `export { Foo, Bar as Baz } from './b';`,
        `export type * from './c';`,
      ].join('\n');
      const { starFrom, namedFrom } = parseReExports(src);
      expect(starFrom).toContain('./a');
      expect(starFrom).toContain('./c');
      expect(namedFrom).toHaveLength(1);
      expect(namedFrom[0].rel).toBe('./b');
      expect(namedFrom[0].names).toEqual(expect.arrayContaining(['Foo', 'Baz']));
    });
  });

  describe('readRegistry', () => {
    it('returns the set of registered component names', async () => {
      await writeRegistry(tmp, ['PixelFoo', 'PxlKitBar', 'NotAComponent']);
      const set = await readRegistry(path.join(tmp, 'packages/ui-kit/src/registry.ts'));
      expect(set.has('PixelFoo')).toBe(true);
      expect(set.has('PxlKitBar')).toBe(true);
      // Non-Pixel/PxlKit names are filtered out — registry hygiene.
      expect(set.has('NotAComponent')).toBe(false);
    });

    it('returns an empty set when the file does not exist', async () => {
      const set = await readRegistry(path.join(tmp, 'does/not/exist.ts'));
      expect(set.size).toBe(0);
    });
  });

  describe('collectReachableFiles', () => {
    it('returns an empty set when index.tsx is missing', async () => {
      const reachable = await collectReachableFiles(
        path.join(tmp, 'packages/ui-kit/src'),
        path.join(tmp, 'packages/ui-kit/src/index.tsx'),
      );
      expect(reachable.size).toBe(0);
    });
  });
});
