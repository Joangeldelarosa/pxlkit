import { describe, expect, it, vi } from 'vitest';
import { createElement, type ReactElement } from 'react';
import {
  VisualRegressionGate,
  snapshotBasename,
  snapshotAbsPath,
  SNAPSHOT_DIR_REL,
  DIFF_THRESHOLD,
  defaultDiffer,
  type Screenshotter,
  type ImageDiffer,
} from '../../gates/12-visual-regression.js';
import type {
  AuditContext,
  ManifestRecord,
} from '../../_lib/load-context.js';

interface MockLoggerCalls {
  info: string[];
  warn: string[];
  error: string[];
  debug: string[];
}

function createMockLogger(): {
  logger: AuditContext['logger'];
  calls: MockLoggerCalls;
} {
  const calls: MockLoggerCalls = { info: [], warn: [], error: [], debug: [] };
  return {
    calls,
    logger: {
      info: (m) => calls.info.push(m),
      warn: (m) => calls.warn.push(m),
      error: (m) => calls.error.push(m),
      debug: (m) => calls.debug.push(m),
    },
  };
}

function makeContext(manifests: ManifestRecord[]): {
  ctx: AuditContext;
  calls: MockLoggerCalls;
} {
  const { logger, calls } = createMockLogger();
  return {
    calls,
    ctx: {
      repoRoot: '/tmp/pxlkit',
      manifests,
      uiKitSrcDir: '/tmp/pxlkit/packages/ui-kit/src',
      appsWebSrcDir: '/tmp/pxlkit/apps/web/src',
      tokensFile: '/tmp/pxlkit/packages/ui-kit/src/tokens.ts',
      registryFile: '/tmp/pxlkit/packages/ui-kit/src/registry.ts',
      readmeFiles: [],
      changelogFiles: [],
      packageJsons: [],
      logger,
    },
  };
}

const Good = (): ReactElement => createElement('div', null, 'ok');

describe('snapshotBasename', () => {
  it('slugifies component and example id, lowercase, hyphen-separated', () => {
    expect(snapshotBasename('Button', 'primary')).toBe(
      'button-primary.snapshot.png',
    );
  });

  it('normalizes spaces, slashes, and uppercase to hyphens', () => {
    expect(snapshotBasename('My Card', 'with/Slash')).toBe(
      'my-card-with-slash.snapshot.png',
    );
  });

  it('collapses repeated separators and strips edges', () => {
    expect(snapshotBasename('  Foo___Bar  ', '--baz--')).toBe(
      'foo-bar-baz.snapshot.png',
    );
  });
});

describe('snapshotAbsPath', () => {
  it('joins SNAPSHOT_DIR_REL under the repo root with the snapshot basename', () => {
    const p = snapshotAbsPath('/tmp/pxlkit', 'Button', 'primary');
    // Path separators are OS-specific; normalize before asserting.
    const normalized = p.split(/[\\/]/).join('/');
    expect(normalized).toContain(SNAPSHOT_DIR_REL);
    expect(normalized.endsWith('/button-primary.snapshot.png')).toBe(true);
  });
});

describe('defaultDiffer', () => {
  it('returns ratio 0 for identical buffers', async () => {
    const a = Buffer.from([1, 2, 3, 4]);
    const b = Buffer.from([1, 2, 3, 4]);
    const r = await defaultDiffer.diff({ baseline: a, candidate: b });
    expect(r.ratio).toBe(0);
    expect(r.note).toBeUndefined();
  });

  it('returns positive ratio for differing buffers of equal length', async () => {
    const a = Buffer.from([1, 2, 3, 4]);
    const b = Buffer.from([1, 9, 9, 4]);
    const r = await defaultDiffer.diff({ baseline: a, candidate: b });
    expect(r.ratio).toBeGreaterThan(0);
    expect(r.ratio).toBeLessThanOrEqual(1);
  });

  it('flags length deltas via note and counts them as differing bytes', async () => {
    const a = Buffer.from([1, 2, 3, 4]);
    const b = Buffer.from([1, 2, 3, 4, 5, 6]);
    const r = await defaultDiffer.diff({ baseline: a, candidate: b });
    expect(r.ratio).toBeGreaterThan(0);
    expect(r.note).toMatch(/byte length changed/);
  });

  it('returns 0 for two empty buffers', async () => {
    const a = Buffer.alloc(0);
    const b = Buffer.alloc(0);
    const r = await defaultDiffer.diff({ baseline: a, candidate: b });
    expect(r.ratio).toBe(0);
  });
});

describe('VisualRegressionGate', () => {
  it('exposes id=12, name="visual-regression", and a description', () => {
    const gate = new VisualRegressionGate();
    expect(gate.id).toBe(12);
    expect(gate.name).toBe('visual-regression');
    expect(gate.description).toMatch(/screenshot/i);
    expect(gate.description).toMatch(/baseline/i);
  });

  it('passes vacuously when there are no manifests', async () => {
    const gate = new VisualRegressionGate();
    const { ctx } = makeContext([]);
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(result.name).toBe('visual-regression');
    expect(typeof result.duration_ms).toBe('number');
  });

  it('Ola 4c.1 bootstrap: missing baseline logs info and passes', async () => {
    const readBaseline = vi.fn().mockResolvedValue(null);
    const screenshotter: Screenshotter = { capture: vi.fn() };
    const differ: ImageDiffer = { diff: vi.fn() };
    const gate = new VisualRegressionGate({
      screenshotter,
      differ,
      readBaseline,
    });
    const manifests: ManifestRecord[] = [
      {
        component: 'Button',
        file: 'packages/ui-kit/src/actions.tsx',
        examples: [{ id: 'primary', label: 'Primary', Component: Good }],
      },
    ];
    const { ctx, calls } = makeContext(manifests);
    const result = await gate.run(ctx);

    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(readBaseline).toHaveBeenCalledTimes(1);
    expect(screenshotter.capture).not.toHaveBeenCalled();
    expect(differ.diff).not.toHaveBeenCalled();
    // info log mentions "no baseline yet"
    const joined = calls.info.join('\n');
    expect(joined).toMatch(/no baseline yet/i);
    expect(joined).toMatch(/Button/);
    expect(joined).toMatch(/primary/);
  });

  it('passes when diff is within tolerance (e.g. 0.05%)', async () => {
    const readBaseline = vi.fn().mockResolvedValue(Buffer.from('BASELINE'));
    const screenshotter: Screenshotter = {
      capture: vi.fn().mockResolvedValue({ bytes: Buffer.from('CANDIDATE') }),
    };
    const differ: ImageDiffer = {
      diff: vi.fn().mockResolvedValue({ ratio: 0.0005 }), // 0.05% < 0.1%
    };
    const gate = new VisualRegressionGate({
      screenshotter,
      differ,
      readBaseline,
    });
    const manifests: ManifestRecord[] = [
      {
        component: 'Card',
        file: 'packages/ui-kit/src/cards.tsx',
        examples: [{ id: 'default', label: 'Default', Component: Good }],
      },
    ];
    const { ctx } = makeContext(manifests);
    const result = await gate.run(ctx);

    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(screenshotter.capture).toHaveBeenCalledTimes(1);
    expect(differ.diff).toHaveBeenCalledTimes(1);
  });

  it('fails (major) when diff strictly exceeds the 0.1% threshold', async () => {
    const readBaseline = vi.fn().mockResolvedValue(Buffer.from('BASELINE'));
    const screenshotter: Screenshotter = {
      capture: vi.fn().mockResolvedValue({ bytes: Buffer.from('CANDIDATE') }),
    };
    const differ: ImageDiffer = {
      diff: vi.fn().mockResolvedValue({ ratio: 0.05 }), // 5% > 0.1%
    };
    const gate = new VisualRegressionGate({
      screenshotter,
      differ,
      readBaseline,
    });
    const manifests: ManifestRecord[] = [
      {
        component: 'Modal',
        file: 'packages/ui-kit/src/overlay.tsx',
        examples: [{ id: 'open', label: 'Open', Component: Good }],
      },
    ];
    const { ctx } = makeContext(manifests);
    const result = await gate.run(ctx);

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const f = result.findings[0];
    expect(f.severity).toBe('major');
    expect(f.component).toBe('Modal');
    expect(f.file).toBe('packages/ui-kit/src/overlay.tsx');
    expect(f.message).toMatch(/5\.000% pixels differ/);
    expect(f.message).toMatch(/threshold 0\.100%/);
    expect(f.suggestion).toBeDefined();
    expect(f.suggestion).toMatch(/Modal/);
    expect(f.suggestion).toMatch(/open/);
  });

  it('treats the threshold as strict (>) — exactly 0.1% still passes', async () => {
    const readBaseline = vi.fn().mockResolvedValue(Buffer.from('B'));
    const screenshotter: Screenshotter = {
      capture: vi.fn().mockResolvedValue({ bytes: Buffer.from('C') }),
    };
    const differ: ImageDiffer = {
      diff: vi.fn().mockResolvedValue({ ratio: DIFF_THRESHOLD }),
    };
    const gate = new VisualRegressionGate({
      screenshotter,
      differ,
      readBaseline,
    });
    const manifests: ManifestRecord[] = [
      {
        component: 'Edge',
        examples: [{ id: 'tight', label: 'Tight', Component: Good }],
      },
    ];
    const { ctx } = makeContext(manifests);
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  it('records a minor finding when the screenshotter throws', async () => {
    const readBaseline = vi.fn().mockResolvedValue(Buffer.from('B'));
    const screenshotter: Screenshotter = {
      capture: vi.fn().mockRejectedValue(new Error('browser missing')),
    };
    const differ: ImageDiffer = { diff: vi.fn() };
    const gate = new VisualRegressionGate({
      screenshotter,
      differ,
      readBaseline,
    });
    const manifests: ManifestRecord[] = [
      {
        component: 'Toast',
        file: 'packages/ui-kit/src/feedback.tsx',
        examples: [{ id: 'success', label: 'Success', Component: Good }],
      },
    ];
    const { ctx } = makeContext(manifests);
    const result = await gate.run(ctx);

    // minor != blocking, so gate still passes
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(1);
    const f = result.findings[0];
    expect(f.severity).toBe('minor');
    expect(f.component).toBe('Toast');
    expect(f.message).toMatch(/Failed to capture screenshot/);
    expect(f.message).toMatch(/browser missing/);
    expect(differ.diff).not.toHaveBeenCalled();
  });

  it('records a minor finding when the differ throws', async () => {
    const readBaseline = vi.fn().mockResolvedValue(Buffer.from('B'));
    const screenshotter: Screenshotter = {
      capture: vi.fn().mockResolvedValue({ bytes: Buffer.from('C') }),
    };
    const differ: ImageDiffer = {
      diff: vi.fn().mockRejectedValue(new Error('malformed png')),
    };
    const gate = new VisualRegressionGate({
      screenshotter,
      differ,
      readBaseline,
    });
    const manifests: ManifestRecord[] = [
      {
        component: 'Avatar',
        examples: [{ id: 'circle', label: 'Circle', Component: Good }],
      },
    ];
    const { ctx } = makeContext(manifests);
    const result = await gate.run(ctx);

    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('minor');
    expect(result.findings[0].message).toMatch(/Failed to diff/);
    expect(result.findings[0].message).toMatch(/malformed png/);
  });

  it('records a minor finding when reading the baseline throws', async () => {
    const readBaseline = vi.fn().mockRejectedValue(new Error('EACCES'));
    const screenshotter: Screenshotter = { capture: vi.fn() };
    const differ: ImageDiffer = { diff: vi.fn() };
    const gate = new VisualRegressionGate({
      screenshotter,
      differ,
      readBaseline,
    });
    const manifests: ManifestRecord[] = [
      {
        component: 'Badge',
        examples: [{ id: 'dot', label: 'Dot', Component: Good }],
      },
    ];
    const { ctx } = makeContext(manifests);
    const result = await gate.run(ctx);

    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('minor');
    expect(result.findings[0].message).toMatch(/Failed to read baseline/);
    expect(screenshotter.capture).not.toHaveBeenCalled();
  });

  it('skips examples whose Component is missing (gate 10 owns that finding)', async () => {
    const readBaseline = vi.fn();
    const screenshotter: Screenshotter = { capture: vi.fn() };
    const differ: ImageDiffer = { diff: vi.fn() };
    const gate = new VisualRegressionGate({
      screenshotter,
      differ,
      readBaseline,
    });
    const manifests: ManifestRecord[] = [
      {
        component: 'Skipme',
        examples: [{ id: 'broken', label: 'Broken', Component: undefined }],
      },
    ];
    const { ctx } = makeContext(manifests);
    const result = await gate.run(ctx);

    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(readBaseline).not.toHaveBeenCalled();
    expect(screenshotter.capture).not.toHaveBeenCalled();
  });

  it('handles multi-example, mixed-baseline scenarios (1 missing + 1 ok + 1 regressed)', async () => {
    const baselineMap: Record<string, Buffer | null> = {
      'button-primary': Buffer.from('B1'),
      'button-secondary': Buffer.from('B2'),
      'button-ghost': null, // no baseline yet
    };
    const readBaseline = vi.fn(async (absPath: string) => {
      const base = absPath.split(/[\\/]/).pop() ?? '';
      const key = base.replace(/\.snapshot\.png$/, '');
      return baselineMap[key] ?? null;
    });
    const screenshotter: Screenshotter = {
      capture: vi.fn(async (req) => ({
        bytes: Buffer.from(`shot-${req.exampleId}`),
      })),
    };
    const differ: ImageDiffer = {
      diff: vi.fn(async ({ candidate }) => {
        // primary stable, secondary regressed
        if (candidate.toString().includes('secondary')) return { ratio: 0.2 };
        return { ratio: 0 };
      }),
    };
    const gate = new VisualRegressionGate({
      screenshotter,
      differ,
      readBaseline,
    });
    const manifests: ManifestRecord[] = [
      {
        component: 'Button',
        file: 'packages/ui-kit/src/actions.tsx',
        examples: [
          { id: 'primary', label: 'Primary', Component: Good },
          { id: 'secondary', label: 'Secondary', Component: Good },
          { id: 'ghost', label: 'Ghost', Component: Good },
        ],
      },
    ];
    const { ctx, calls } = makeContext(manifests);
    const result = await gate.run(ctx);

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('major');
    expect(result.findings[0].message).toMatch(/secondary/);
    expect(readBaseline).toHaveBeenCalledTimes(3);
    expect(screenshotter.capture).toHaveBeenCalledTimes(2); // ghost skipped
    expect(differ.diff).toHaveBeenCalledTimes(2);
    expect(calls.info.join('\n')).toMatch(/no baseline yet/i);
    expect(calls.info.join('\n')).toMatch(/ghost/);
  });

  it('respects an injected custom threshold', async () => {
    const readBaseline = vi.fn().mockResolvedValue(Buffer.from('B'));
    const screenshotter: Screenshotter = {
      capture: vi.fn().mockResolvedValue({ bytes: Buffer.from('C') }),
    };
    const differ: ImageDiffer = {
      diff: vi.fn().mockResolvedValue({ ratio: 0.02 }),
    };
    const gate = new VisualRegressionGate({
      screenshotter,
      differ,
      readBaseline,
      threshold: 0.05, // 5%
    });
    const manifests: ManifestRecord[] = [
      {
        component: 'Tolerant',
        examples: [{ id: 'one', label: 'One', Component: Good }],
      },
    ];
    const { ctx } = makeContext(manifests);
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  it('passes the diff note through into the finding message when present', async () => {
    const readBaseline = vi.fn().mockResolvedValue(Buffer.from('B'));
    const screenshotter: Screenshotter = {
      capture: vi.fn().mockResolvedValue({ bytes: Buffer.from('C') }),
    };
    const differ: ImageDiffer = {
      diff: vi.fn().mockResolvedValue({
        ratio: 0.3,
        note: 'dimensions changed 800x600 -> 810x600',
      }),
    };
    const gate = new VisualRegressionGate({
      screenshotter,
      differ,
      readBaseline,
    });
    const manifests: ManifestRecord[] = [
      {
        component: 'Resized',
        examples: [{ id: 'wide', label: 'Wide', Component: Good }],
      },
    ];
    const { ctx } = makeContext(manifests);
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].message).toMatch(/dimensions changed/);
  });
});
