/**
 * Unit tests for Gate 29 — bundle-size-budget.
 *
 * The AuditContext is fully mocked. File reads and pathExists are stubbed
 * through the gate's options so we never touch the real filesystem.
 */

import { randomBytes } from 'node:crypto';
import * as path from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it, vi } from 'vitest';

import type { AuditContext, ManifestRecord } from '../../_lib/load-context.js';
import gate, {
  BundleSizeBudgetGate,
  buildFinding,
  formatBytes,
  measureSize,
  normaliseMode,
  resolveSourceCandidates,
  suggestBudgetBytes,
  validateBudget,
} from '../../gates/29-bundle-size-budget.js';

// ---------------------------------------------------------------------------
// Helpers — synthetic in-memory repo
// ---------------------------------------------------------------------------

const repoRoot = path.resolve('/virtual/pxlkit');
const uiKitDir = path.join(repoRoot, 'packages', 'ui-kit');
const uiKitSrcDir = path.join(uiKitDir, 'src');
const uiKitPkgJson = path.join(uiKitDir, 'package.json');

function mkManifest(
  component: string,
  fields: Record<string, unknown> = {},
): ManifestRecord {
  return {
    component,
    source: path.join(uiKitSrcDir, `${component}.manifest.ts`),
    ...fields,
  } as unknown as ManifestRecord;
}

function makeCtx(manifests: ManifestRecord[]): AuditContext {
  return {
    repoRoot,
    manifests,
    uiKitSrcDir,
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(uiKitSrcDir, 'tokens.ts'),
    registryFile: path.join(uiKitSrcDir, 'registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [{ package: '@pxlkit/ui-kit', path: uiKitPkgJson }],
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
  };
}

/**
 * Build a (readFile, pathExists) pair backed by an in-memory file map.
 * Keys MUST be absolute paths (we resolve them through path.resolve so
 * Windows/POSIX separators normalise identically).
 */
function fakeFs(entries: Record<string, string | Buffer>) {
  const norm = (p: string) => path.resolve(p);
  const map = new Map<string, Buffer>();
  for (const [key, val] of Object.entries(entries)) {
    map.set(norm(key), typeof val === 'string' ? Buffer.from(val, 'utf8') : val);
  }
  const readFile = vi.fn(async (absPath: string): Promise<Buffer> => {
    const buf = map.get(norm(absPath));
    if (!buf) throw new Error(`ENOENT: ${absPath}`);
    return buf;
  });
  const pathExists = vi.fn(async (absPath: string): Promise<boolean> =>
    map.has(norm(absPath)),
  );
  return { readFile, pathExists };
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe('normaliseMode', () => {
  it('keeps gzip as gzip', () => {
    expect(normaliseMode('gzip')).toBe('gzip');
  });
  it('collapses anything else (including typos) to raw', () => {
    expect(normaliseMode('raw')).toBe('raw');
    expect(normaliseMode('GZIP')).toBe('raw');
    expect(normaliseMode(undefined)).toBe('raw');
    expect(normaliseMode(null)).toBe('raw');
    expect(normaliseMode(42)).toBe('raw');
  });
});

describe('validateBudget', () => {
  it('accepts positive integers', () => {
    expect(validateBudget(4096)).toEqual({ kind: 'ok', budget: 4096 });
  });
  it('reports missing on undefined/null', () => {
    expect(validateBudget(undefined)).toEqual({ kind: 'missing' });
    expect(validateBudget(null)).toEqual({ kind: 'missing' });
  });
  it('rejects strings, NaN, Infinity, zero, negatives, fractions', () => {
    expect(validateBudget('4096').kind).toBe('invalid');
    expect(validateBudget(Number.NaN).kind).toBe('invalid');
    expect(validateBudget(Number.POSITIVE_INFINITY).kind).toBe('invalid');
    expect(validateBudget(0).kind).toBe('invalid');
    expect(validateBudget(-1).kind).toBe('invalid');
    expect(validateBudget(4096.5).kind).toBe('invalid');
  });
});

describe('suggestBudgetBytes', () => {
  it('adds 15% headroom and rounds up to nearest 64B', () => {
    // 1000 * 1.15 = 1150, ceil to 64 → 1152
    expect(suggestBudgetBytes(1000)).toBe(1152);
    // exact 64 multiple still gets headroom + rounding
    expect(suggestBudgetBytes(64)).toBeGreaterThanOrEqual(64);
  });
  it('never returns less than 64B', () => {
    expect(suggestBudgetBytes(1)).toBeGreaterThanOrEqual(64);
    expect(suggestBudgetBytes(0)).toBeGreaterThanOrEqual(64);
  });
});

describe('formatBytes', () => {
  it('formats bytes, kB, MB', () => {
    expect(formatBytes(512)).toBe('512B');
    expect(formatBytes(2048)).toBe('2.00kB');
    expect(formatBytes(1024 * 1024 * 3)).toBe('3.00MB');
  });
});

describe('resolveSourceCandidates', () => {
  it('prefers manifest.file (absolute or relative to src dir)', () => {
    const rel = resolveSourceCandidates(
      { component: 'PixelButton', file: 'PixelButton.tsx' },
      uiKitSrcDir,
    );
    expect(rel[0]).toBe(path.join(uiKitSrcDir, 'PixelButton.tsx'));

    const absPath = path.resolve('/abs/some/PixelButton.tsx');
    const abs = resolveSourceCandidates(
      { component: 'PixelButton', file: absPath },
      uiKitSrcDir,
    );
    expect(abs[0]).toBe(absPath);
  });

  it('falls back to manifest.source then heuristic component paths', () => {
    const cands = resolveSourceCandidates(
      { component: 'PixelButton' },
      uiKitSrcDir,
    );
    expect(cands).toContain(path.join(uiKitSrcDir, 'PixelButton.tsx'));
    expect(cands).toContain(path.join(uiKitSrcDir, 'PixelButton', 'index.tsx'));
  });

  it('deduplicates candidates', () => {
    const cands = resolveSourceCandidates(
      {
        component: 'PixelButton',
        file: 'PixelButton.tsx',
        source: path.join(uiKitSrcDir, 'PixelButton.tsx'),
      },
      uiKitSrcDir,
    );
    expect(cands.filter((c) => c.endsWith('PixelButton.tsx'))).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

describe('measureSize', () => {
  it('measures raw bytes by default and always reports gzip too', async () => {
    const content = 'x'.repeat(2000);
    const { readFile } = fakeFs({ '/v/file.tsx': content });
    const r = await measureSize({ filePath: '/v/file.tsx', readFile });
    expect(r.mode).toBe('raw');
    expect(r.rawBytes).toBe(2000);
    expect(r.bytes).toBe(2000);
    expect(r.gzipBytes).toBe(gzipSync(Buffer.from(content)).byteLength);
    expect(r.gzipBytes).toBeLessThan(r.rawBytes);
  });

  it('measures gzip bytes when mode is gzip', async () => {
    const content = 'y'.repeat(4096);
    const { readFile } = fakeFs({ '/v/file.tsx': content });
    const r = await measureSize({
      filePath: '/v/file.tsx',
      mode: 'gzip',
      readFile,
    });
    expect(r.mode).toBe('gzip');
    expect(r.bytes).toBe(r.gzipBytes);
    expect(r.bytes).toBeLessThan(r.rawBytes);
  });
});

// ---------------------------------------------------------------------------
// Per-finding builders
// ---------------------------------------------------------------------------

describe('buildFinding', () => {
  it('over-budget finding is MAJOR with actionable suggestion', () => {
    const f = buildFinding({
      kind: 'over-budget',
      component: 'PixelButton',
      file: 'packages/ui-kit/src/PixelButton.tsx',
      mode: 'raw',
      budget: 1000,
      actual: 1500,
      rawBytes: 1500,
      gzipBytes: 600,
    });
    expect(f.severity).toBe('major');
    expect(f.component).toBe('PixelButton');
    expect(f.message).toMatch(/over its raw bundle-size budget/);
    expect(f.message).toContain('1.46kB');
    expect(f.suggestion).toMatch(/bundleSize: \d+/);
  });

  it('approaching-limit finding is MINOR', () => {
    const f = buildFinding({
      kind: 'approaching-limit',
      component: 'PixelInput',
      file: 'packages/ui-kit/src/PixelInput.tsx',
      mode: 'raw',
      budget: 1000,
      actual: 950,
      ratio: 0.95,
    });
    expect(f.severity).toBe('minor');
    expect(f.message).toContain('95.0%');
  });

  it('no-budget finding is INFO with suggested budget value', () => {
    const f = buildFinding({
      kind: 'no-budget',
      component: 'PixelCard',
      file: 'packages/ui-kit/src/PixelCard.tsx',
      mode: 'raw',
      actual: 1000,
      rawBytes: 1000,
      gzipBytes: 400,
    });
    expect(f.severity).toBe('info');
    expect(f.suggestion).toMatch(/bundleSize: \d+/);
  });

  it('invalid-budget finding is MAJOR', () => {
    const f = buildFinding({
      kind: 'invalid-budget',
      component: 'PixelBroken',
      raw: 'big',
    });
    expect(f.severity).toBe('major');
    expect(f.message).toContain('"big"');
  });

  it('missing-source finding is MAJOR', () => {
    const f = buildFinding({
      kind: 'missing-source',
      component: 'PixelGhost',
      tried: ['packages/ui-kit/src/PixelGhost.tsx'],
    });
    expect(f.severity).toBe('major');
    expect(f.message).toContain('PixelGhost.tsx');
  });
});

// ---------------------------------------------------------------------------
// Gate.run() — end-to-end against mocked AuditContext
// ---------------------------------------------------------------------------

describe('BundleSizeBudgetGate.run', () => {
  it('passes vacuously when there are no manifests', async () => {
    const ctx = makeCtx([]);
    const { readFile, pathExists } = fakeFs({});
    const r = await new BundleSizeBudgetGate({ readFile, pathExists }).run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
    expect(r.name).toBe('bundle-size-budget');
    expect(typeof r.duration_ms).toBe('number');
  });

  it('passes when actual size is well under the declared budget', async () => {
    const file = path.join(uiKitSrcDir, 'PixelButton.tsx');
    const { readFile, pathExists } = fakeFs({
      [file]: 'export const PixelButton = () => null;',
    });
    const ctx = makeCtx([
      mkManifest('PixelButton', {
        file: 'PixelButton.tsx',
        bundleSize: 4096,
      }),
    ]);
    const r = await new BundleSizeBudgetGate({ readFile, pathExists }).run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
  });

  // Headline fixture: KNOWN VIOLATION → must be detected as MAJOR.
  it('FAILS (major) when actual > budget (over-budget fixture)', async () => {
    const file = path.join(uiKitSrcDir, 'PixelHeavy.tsx');
    const { readFile, pathExists } = fakeFs({
      // 5000 bytes of source vs 1000 byte budget — clear violation.
      [file]: 'a'.repeat(5000),
    });
    const ctx = makeCtx([
      mkManifest('PixelHeavy', {
        file: 'PixelHeavy.tsx',
        bundleSize: 1000,
      }),
    ]);
    const r = await new BundleSizeBudgetGate({ readFile, pathExists }).run(ctx);
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(1);
    const f = r.findings[0]!;
    expect(f.severity).toBe('major');
    expect(f.component).toBe('PixelHeavy');
    expect(f.message).toMatch(/over its raw bundle-size budget/);
    expect(f.message).toContain('4.88kB');
    expect(f.suggestion).toMatch(/bundleSize: \d+/);
  });

  it('respects gzip mode and detects gzip over-budget', async () => {
    // Truly random bytes do not compress, so gzip ≈ raw size — exactly what
    // we need to keep gzipped size above a tight budget.
    const file = path.join(uiKitSrcDir, 'PixelRandom.tsx');
    const content = randomBytes(3000);
    const { readFile, pathExists } = fakeFs({ [file]: content });
    const ctx = makeCtx([
      mkManifest('PixelRandom', {
        file: 'PixelRandom.tsx',
        bundleSize: 500,
        bundleSizeMode: 'gzip',
      }),
    ]);
    const r = await new BundleSizeBudgetGate({ readFile, pathExists }).run(ctx);
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]!.severity).toBe('major');
    expect(r.findings[0]!.message).toMatch(/gzip bundle-size budget/);
  });

  it('warns (minor) when actual is between 90% and 100% of budget', async () => {
    const file = path.join(uiKitSrcDir, 'PixelTight.tsx');
    const { readFile, pathExists } = fakeFs({
      // 950 bytes vs 1000 byte budget → 95% utilisation.
      [file]: 'b'.repeat(950),
    });
    const ctx = makeCtx([
      mkManifest('PixelTight', {
        file: 'PixelTight.tsx',
        bundleSize: 1000,
      }),
    ]);
    const r = await new BundleSizeBudgetGate({ readFile, pathExists }).run(ctx);
    expect(r.passed).toBe(true); // minor is not blocking
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]!.severity).toBe('minor');
    expect(r.findings[0]!.message).toContain('95.0%');
  });

  it('emits INFO (with suggested budget) when no budget is declared', async () => {
    const file = path.join(uiKitSrcDir, 'PixelOpen.tsx');
    const { readFile, pathExists } = fakeFs({
      [file]: 'c'.repeat(2000),
    });
    const ctx = makeCtx([
      mkManifest('PixelOpen', { file: 'PixelOpen.tsx' }),
    ]);
    const r = await new BundleSizeBudgetGate({ readFile, pathExists }).run(ctx);
    expect(r.passed).toBe(true); // info is not blocking
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]!.severity).toBe('info');
    expect(r.findings[0]!.suggestion).toMatch(/bundleSize: \d+/);
  });

  it('fails (major) when manifest declares an invalid budget', async () => {
    const file = path.join(uiKitSrcDir, 'PixelBroken.tsx');
    const { readFile, pathExists } = fakeFs({
      [file]: 'd'.repeat(100),
    });
    const ctx = makeCtx([
      mkManifest('PixelBroken', {
        file: 'PixelBroken.tsx',
        bundleSize: 'four-thousand', // invalid
      }),
    ]);
    const r = await new BundleSizeBudgetGate({ readFile, pathExists }).run(ctx);
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]!.severity).toBe('major');
    expect(r.findings[0]!.message).toContain('invalid bundleSize');
  });

  it('fails (major) when declared budget exists but source file is missing', async () => {
    // No file entries → pathExists returns false for everything tried.
    const { readFile, pathExists } = fakeFs({});
    const ctx = makeCtx([
      mkManifest('PixelGhost', {
        file: 'PixelGhost.tsx',
        bundleSize: 4096,
      }),
    ]);
    const r = await new BundleSizeBudgetGate({ readFile, pathExists }).run(ctx);
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(1);
    const f = r.findings[0]!;
    expect(f.severity).toBe('major');
    expect(f.message).toContain('no source file was found');
    expect(readFile).not.toHaveBeenCalled();
  });

  it('skips silently when no budget AND no resolvable source (non-component manifest)', async () => {
    const { readFile, pathExists } = fakeFs({});
    const ctx = makeCtx([
      // No file, no source, no budget — e.g. a token-only manifest.
      {
        component: 'design-token-record',
      } as unknown as ManifestRecord,
    ]);
    const r = await new BundleSizeBudgetGate({ readFile, pathExists }).run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
  });

  it('produces one finding per offending manifest with no cross-talk', async () => {
    const overFile = path.join(uiKitSrcDir, 'Over.tsx');
    const tightFile = path.join(uiKitSrcDir, 'Tight.tsx');
    const okFile = path.join(uiKitSrcDir, 'Ok.tsx');
    const openFile = path.join(uiKitSrcDir, 'Open.tsx');
    const { readFile, pathExists } = fakeFs({
      [overFile]: 'a'.repeat(5000),
      [tightFile]: 'b'.repeat(950),
      [okFile]: 'c'.repeat(100),
      [openFile]: 'd'.repeat(800),
    });
    const ctx = makeCtx([
      mkManifest('Over', { file: 'Over.tsx', bundleSize: 1000 }),
      mkManifest('Tight', { file: 'Tight.tsx', bundleSize: 1000 }),
      mkManifest('Ok', { file: 'Ok.tsx', bundleSize: 4096 }),
      mkManifest('Open', { file: 'Open.tsx' }), // no budget → info
    ]);
    const r = await new BundleSizeBudgetGate({ readFile, pathExists }).run(ctx);
    const byComponent = new Map(r.findings.map((f) => [f.component, f]));
    expect(byComponent.get('Over')?.severity).toBe('major');
    expect(byComponent.get('Tight')?.severity).toBe('minor');
    expect(byComponent.get('Ok')).toBeUndefined();
    expect(byComponent.get('Open')?.severity).toBe('info');
    // Major present → gate fails overall.
    expect(r.passed).toBe(false);
  });

  it('exposes id, name, description matching the contract', () => {
    const g = new BundleSizeBudgetGate();
    expect(g.id).toBe(29);
    expect(g.name).toBe('bundle-size-budget');
    expect(g.description.toLowerCase()).toContain('bundle');
    expect(g.description.toLowerCase()).toContain('budget');
  });

  it('default export is a usable singleton', () => {
    expect(gate.id).toBe(29);
    expect(gate.name).toBe('bundle-size-budget');
    expect(typeof gate.run).toBe('function');
  });

  it('falls back to manifest.source when manifest.file is absent', async () => {
    const sourceFile = path.join(uiKitSrcDir, 'PixelFromSource.tsx');
    const { readFile, pathExists } = fakeFs({
      [sourceFile]: 'e'.repeat(2000),
    });
    const ctx = makeCtx([
      {
        component: 'PixelFromSource',
        source: sourceFile,
        bundleSize: 4096,
      } as unknown as ManifestRecord,
    ]);
    const r = await new BundleSizeBudgetGate({ readFile, pathExists }).run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
  });
});
