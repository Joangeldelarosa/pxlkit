/**
 * Unit tests for Gate 30 — related-graph-consistency.
 *
 * No file IO — the gate is pure over `ctx.manifests`. Each describe block
 * exercises one rule in isolation, plus a few end-to-end runs through
 * `RelatedGraphConsistencyGate.run`.
 *
 * Required fixture: at least one test demonstrates a KNOWN VIOLATION (the
 * canonical asymmetric link A→B with no B→A back-reference) and verifies
 * detection. That fixture is `ASYMMETRIC_FIXTURE` below.
 */

import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

import type { AuditContext, ManifestRecord } from '../../_lib/load-context.js';
import gate, {
  RelatedGraphConsistencyGate,
  normalizeRelated,
  buildRelatedGraph,
  analyzeGraph,
  shapeFindingsFor,
  asymmetricFindingFor,
  unresolvedFindingFor,
  buildSummaryFinding,
  suggestNearestComponents,
  type NormalizedRelated,
} from '../../gates/30-related-graph-consistency.js';

// ---------------------------------------------------------------------------
// Synthetic AuditContext + manifest helpers
// ---------------------------------------------------------------------------

const repoRoot = path.resolve('/virtual/repo');
const uiKitSrc = path.join(repoRoot, 'packages', 'ui-kit', 'src');

function mkManifest(fields: Record<string, unknown>): ManifestRecord {
  return {
    component: 'PixelComponent',
    source: path.join(uiKitSrc, 'pixel-component.manifest.ts'),
    ...fields,
  } as unknown as ManifestRecord;
}

function makeCtx(manifests: ManifestRecord[]): AuditContext {
  return {
    repoRoot,
    manifests,
    uiKitSrcDir: uiKitSrc,
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(uiKitSrc, 'tokens.ts'),
    registryFile: path.join(uiKitSrc, 'registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [],
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
  };
}

// ---------------------------------------------------------------------------
// THE canonical violation fixture: A says "related: ['B']", B says nothing
// about A. This is the bug the gate exists to surface.
// ---------------------------------------------------------------------------

const ASYMMETRIC_FIXTURE: ManifestRecord[] = [
  mkManifest({
    component: 'PixelButton',
    source: path.join(uiKitSrc, 'pixel-button.manifest.ts'),
    related: ['PixelLink'],
  }),
  mkManifest({
    component: 'PixelLink',
    source: path.join(uiKitSrc, 'pixel-link.manifest.ts'),
    related: [], // <- the bug. Should include 'PixelButton'.
  }),
];

// ---------------------------------------------------------------------------
// normalizeRelated — pure
// ---------------------------------------------------------------------------

describe('normalizeRelated', () => {
  it('returns empty related when the field is absent', () => {
    const r = normalizeRelated(mkManifest({ component: 'PixelA' }));
    expect(r.component).toBe('PixelA');
    expect(r.related).toEqual([]);
    expect(r.malformed).toBeNull();
    expect(r.duplicates).toEqual([]);
    expect(r.selfReferences).toEqual([]);
  });

  it('returns the related list verbatim when well-formed', () => {
    const r = normalizeRelated(
      mkManifest({ component: 'PixelA', related: ['PixelB', 'PixelC'] }),
    );
    expect(r.related).toEqual(['PixelB', 'PixelC']);
  });

  it('drops self-references silently (R4)', () => {
    const r = normalizeRelated(
      mkManifest({
        component: 'PixelA',
        related: ['PixelA', 'PixelB'],
      }),
    );
    expect(r.related).toEqual(['PixelB']);
    expect(r.selfReferences).toEqual(['PixelA']);
  });

  it('collects duplicates separately (R5) and keeps first occurrence', () => {
    const r = normalizeRelated(
      mkManifest({ component: 'PixelA', related: ['PixelB', 'PixelB', 'PixelC'] }),
    );
    expect(r.related).toEqual(['PixelB', 'PixelC']);
    expect(r.duplicates).toEqual(['PixelB']);
  });

  it('flags non-array `related` (R6, not-array variant)', () => {
    const r = normalizeRelated(
      mkManifest({ component: 'PixelA', related: 'PixelB' }),
    );
    expect(r.malformed).toEqual({ kind: 'not-array', describe: '"PixelB"' });
    expect(r.related).toEqual([]);
  });

  it('flags non-string entries inside the array (R6, non-string-entry variant)', () => {
    const r = normalizeRelated(
      mkManifest({ component: 'PixelA', related: ['PixelB', 42, 'PixelC'] }),
    );
    expect(r.malformed).toEqual({
      kind: 'non-string-entry',
      index: 1,
      describe: '42',
    });
    // The non-string is dropped; well-formed strings around it survive.
    expect(r.related).toEqual(['PixelB', 'PixelC']);
  });

  it('falls back to manifest.file when source is missing', () => {
    const r = normalizeRelated({
      component: 'PixelA',
      file: '/abs/pixel-a.tsx',
      // source intentionally omitted
    } as RelatedManifestLike);
    expect(r.source).toBe('/abs/pixel-a.tsx');
  });
});

// Type alias to avoid leaking ManifestRecord into the line above.
type RelatedManifestLike = Parameters<typeof normalizeRelated>[0];

// ---------------------------------------------------------------------------
// buildRelatedGraph — pure
// ---------------------------------------------------------------------------

describe('buildRelatedGraph', () => {
  it('indexes nodes by component name', () => {
    const g = buildRelatedGraph(ASYMMETRIC_FIXTURE);
    expect(g.nodes.has('PixelButton')).toBe(true);
    expect(g.nodes.has('PixelLink')).toBe(true);
    expect(g.nodes.size).toBe(2);
  });

  it('records edges in declaration order', () => {
    const g = buildRelatedGraph([
      mkManifest({ component: 'A', related: ['B', 'C'] }),
      mkManifest({ component: 'B', related: ['A'] }),
      mkManifest({ component: 'C', related: ['A'] }),
    ]);
    expect(g.edges).toEqual([
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'A' },
      { from: 'C', to: 'A' },
    ]);
  });

  it('skips manifests without a component name', () => {
    const g = buildRelatedGraph([
      mkManifest({ component: undefined as unknown as string, related: ['X'] }),
      mkManifest({ component: 'A', related: [] }),
    ]);
    expect(g.nodes.size).toBe(1);
    expect(g.edges).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// analyzeGraph — the heart of the gate
// ---------------------------------------------------------------------------

describe('analyzeGraph', () => {
  it('classifies an A→B with matching B→A as symmetric and deduplicates the pair', () => {
    const g = buildRelatedGraph([
      mkManifest({ component: 'A', related: ['B'] }),
      mkManifest({ component: 'B', related: ['A'] }),
    ]);
    const a = analyzeGraph(g);
    expect(a.symmetric).toEqual([{ a: 'A', b: 'B' }]);
    expect(a.asymmetric).toEqual([]);
    expect(a.unresolved).toEqual([]);
  });

  it('detects the canonical asymmetric case (A→B exists, B→A does not)', () => {
    const g = buildRelatedGraph(ASYMMETRIC_FIXTURE);
    const a = analyzeGraph(g);
    expect(a.asymmetric).toHaveLength(1);
    // The node missing the back-ref is B (PixelLink), not A.
    expect(a.asymmetric[0]!.missingFrom).toBe('PixelLink');
    expect(a.asymmetric[0]!.expectedTo).toBe('PixelButton');
    expect(a.asymmetric[0]!.missingFromSource).toContain('pixel-link.manifest.ts');
  });

  it('classifies an edge to an unknown component as unresolved and not asymmetric (R3)', () => {
    const g = buildRelatedGraph([
      mkManifest({ component: 'A', related: ['Ghost'] }),
      mkManifest({ component: 'B', related: [] }),
    ]);
    const a = analyzeGraph(g);
    expect(a.unresolved).toHaveLength(1);
    expect(a.unresolved[0]!.from).toBe('A');
    expect(a.unresolved[0]!.to).toBe('Ghost');
    // Crucially: no asymmetric finding piles on top of the unresolved one.
    expect(a.asymmetric).toEqual([]);
  });

  it('handles a mixed graph: one symmetric pair + one asymmetric + one unresolved', () => {
    const g = buildRelatedGraph([
      mkManifest({ component: 'A', related: ['B', 'C', 'Ghost'] }),
      mkManifest({ component: 'B', related: ['A'] }), // symmetric with A
      mkManifest({ component: 'C', related: [] }),   // asymmetric: missing A
    ]);
    const a = analyzeGraph(g);
    expect(a.symmetric.map((p) => `${p.a}-${p.b}`)).toEqual(['A-B']);
    expect(a.asymmetric).toHaveLength(1);
    expect(a.asymmetric[0]!.missingFrom).toBe('C');
    expect(a.asymmetric[0]!.expectedTo).toBe('A');
    expect(a.unresolved).toHaveLength(1);
    expect(a.unresolved[0]!.to).toBe('Ghost');
  });

  it('attaches "did you mean?" suggestions to unresolved edges when names are close', () => {
    const g = buildRelatedGraph([
      mkManifest({ component: 'PixelDialog', related: [] }),
      mkManifest({ component: 'PixelModal', related: ['PixelDailog'] }),
    ]);
    const a = analyzeGraph(g);
    expect(a.unresolved).toHaveLength(1);
    expect(a.unresolved[0]!.suggestions[0]).toBe('PixelDialog');
  });
});

// ---------------------------------------------------------------------------
// suggestNearestComponents — heuristic
// ---------------------------------------------------------------------------

describe('suggestNearestComponents', () => {
  it('returns the typo target when a close-name candidate exists', () => {
    const names = ['PixelDialog', 'PixelMenu', 'PixelTooltip'];
    const out = suggestNearestComponents('PixelDailog', names);
    expect(out[0]).toBe('PixelDialog');
  });

  it('returns an empty list when there are no plausible candidates', () => {
    const out = suggestNearestComponents('Zzzzz', []);
    expect(out).toEqual([]);
  });

  it('never suggests the typo itself even if accidentally present', () => {
    const out = suggestNearestComponents('PixelDialog', ['PixelDialog']);
    expect(out).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// shapeFindingsFor — pure rule (R5, R6)
// ---------------------------------------------------------------------------

function mkNorm(
  overrides: Partial<NormalizedRelated>,
): NormalizedRelated {
  return {
    component: 'PixelA',
    source: '/abs/pixel-a.manifest.ts',
    related: [],
    duplicates: [],
    selfReferences: [],
    malformed: null,
    ...overrides,
  };
}

describe('shapeFindingsFor', () => {
  it('returns no findings for a clean manifest', () => {
    expect(shapeFindingsFor(mkNorm({}))).toEqual([]);
  });

  it('emits an INFO finding for not-array malformed shape', () => {
    const fs = shapeFindingsFor(
      mkNorm({ malformed: { kind: 'not-array', describe: '"oops"' } }),
    );
    expect(fs).toHaveLength(1);
    expect(fs[0]!.severity).toBe('info');
    expect(fs[0]!.message).toContain('expected an array');
    expect(fs[0]!.suggestion).toContain('related: [');
  });

  it('emits an INFO finding for a non-string entry', () => {
    const fs = shapeFindingsFor(
      mkNorm({
        malformed: { kind: 'non-string-entry', index: 2, describe: 'null' },
      }),
    );
    expect(fs).toHaveLength(1);
    expect(fs[0]!.severity).toBe('info');
    expect(fs[0]!.message).toContain('related[2]');
  });

  it('emits an INFO finding for duplicate entries, listing each unique duplicate once', () => {
    const fs = shapeFindingsFor(
      mkNorm({ duplicates: ['PixelB', 'PixelB', 'PixelC'] }),
    );
    expect(fs).toHaveLength(1);
    expect(fs[0]!.severity).toBe('info');
    expect(fs[0]!.message).toContain("'PixelB'");
    expect(fs[0]!.message).toContain("'PixelC'");
    expect(fs[0]!.suggestion).toMatch(/dedupe/i);
  });

  it('does NOT emit a finding for self-references (R4)', () => {
    expect(
      shapeFindingsFor(mkNorm({ selfReferences: ['PixelA'] })),
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Finding shapers
// ---------------------------------------------------------------------------

describe('asymmetricFindingFor', () => {
  it('pins the finding to the node that needs the edit (missingFrom)', () => {
    const f = asymmetricFindingFor({
      missingFrom: 'PixelLink',
      expectedTo: 'PixelButton',
      missingFromSource: '/abs/pixel-link.manifest.ts',
    });
    expect(f.severity).toBe('info');
    expect(f.component).toBe('PixelLink');
    expect(f.file).toBe('/abs/pixel-link.manifest.ts');
    expect(f.message).toContain('PixelButton');
    // Actionable suggestion: literal replacement code.
    expect(f.suggestion).toContain("'PixelButton'");
    expect(f.suggestion).toContain('related: [');
  });

  it('tolerates a missing source path', () => {
    const f = asymmetricFindingFor({
      missingFrom: 'X',
      expectedTo: 'Y',
      missingFromSource: null,
    });
    expect(f.file).toBeUndefined();
  });
});

describe('unresolvedFindingFor', () => {
  it('includes the "did you mean?" hint when suggestions exist', () => {
    const f = unresolvedFindingFor({
      from: 'PixelModal',
      to: 'PixelDailog',
      fromSource: '/abs/pixel-modal.manifest.ts',
      suggestions: ['PixelDialog'],
    });
    expect(f.severity).toBe('info');
    expect(f.message).toContain('PixelDailog');
    expect(f.suggestion).toContain('Did you mean');
    expect(f.suggestion).toContain('PixelDialog');
  });

  it('omits the hint when no suggestions are available', () => {
    const f = unresolvedFindingFor({
      from: 'A',
      to: 'Ghost',
      fromSource: null,
      suggestions: [],
    });
    expect(f.suggestion ?? '').not.toContain('Did you mean');
  });
});

// ---------------------------------------------------------------------------
// buildSummaryFinding
// ---------------------------------------------------------------------------

describe('buildSummaryFinding', () => {
  it('reports zeros for an empty graph', () => {
    const g = buildRelatedGraph([]);
    const a = analyzeGraph(g);
    const f = buildSummaryFinding(g, a);
    expect(f.severity).toBe('info');
    expect(f.message).toContain('0 component node(s)');
    expect(f.message).toContain('0 declared edge(s)');
  });

  it('lists asymmetric edges in the summary message', () => {
    const g = buildRelatedGraph(ASYMMETRIC_FIXTURE);
    const a = analyzeGraph(g);
    const f = buildSummaryFinding(g, a);
    expect(f.message).toContain('asymmetric edges (one-way): 1');
    expect(f.message).toContain('PixelButton → PixelLink');
  });
});

// ---------------------------------------------------------------------------
// RelatedGraphConsistencyGate.run — end-to-end
// ---------------------------------------------------------------------------

describe('RelatedGraphConsistencyGate.run', () => {
  it('passes (always) on the canonical asymmetric violation, surfacing it as INFO', async () => {
    const g = new RelatedGraphConsistencyGate();
    const r = await g.run(makeCtx(ASYMMETRIC_FIXTURE));
    expect(r.passed).toBe(true);
    expect(r.name).toBe('related-graph-consistency');
    // The canonical asymmetric finding is present.
    const asymFinding = r.findings.find(
      (f) =>
        f.severity === 'info' &&
        f.component === 'PixelLink' &&
        f.message.includes('Asymmetric'),
    );
    expect(asymFinding).toBeDefined();
    expect(asymFinding!.suggestion).toContain("'PixelButton'");
    // The summary is always appended.
    expect(
      r.findings.some(
        (f) =>
          f.severity === 'info' &&
          f.message.includes('related-graph-consistency:'),
      ),
    ).toBe(true);
    // The gate NEVER emits a blocker/major from content alone.
    expect(
      r.findings.every((f) => f.severity === 'info'),
    ).toBe(true);
  });

  it('passes cleanly on a fully symmetric graph (only the summary INFO is emitted)', async () => {
    const r = await new RelatedGraphConsistencyGate().run(
      makeCtx([
        mkManifest({ component: 'A', related: ['B'] }),
        mkManifest({ component: 'B', related: ['A'] }),
      ]),
    );
    expect(r.passed).toBe(true);
    // Only the summary, no asymmetric/unresolved/shape findings.
    expect(r.findings.length).toBe(1);
    expect(r.findings[0]!.message).toContain('symmetric pairs: 1');
    expect(r.findings[0]!.message).toContain('asymmetric edges (one-way): 0');
  });

  it('surfaces unresolved references with a "did you mean?" suggestion', async () => {
    const r = await new RelatedGraphConsistencyGate().run(
      makeCtx([
        mkManifest({ component: 'PixelDialog', related: [] }),
        mkManifest({ component: 'PixelModal', related: ['PixelDailog'] }),
      ]),
    );
    expect(r.passed).toBe(true);
    const unresolved = r.findings.find(
      (f) =>
        f.severity === 'info' &&
        f.message.includes('unknown component "PixelDailog"'),
    );
    expect(unresolved).toBeDefined();
    expect(unresolved!.suggestion).toContain('PixelDialog');
  });

  it('emits shape findings for malformed `related` values without crashing', async () => {
    const r = await new RelatedGraphConsistencyGate().run(
      makeCtx([
        mkManifest({ component: 'A', related: 'PixelB' }),
        mkManifest({ component: 'B', related: ['A', 'A'] }),
      ]),
    );
    expect(r.passed).toBe(true);
    expect(
      r.findings.some(
        (f) =>
          f.severity === 'info' &&
          f.component === 'A' &&
          f.message.includes('expected an array'),
      ),
    ).toBe(true);
    expect(
      r.findings.some(
        (f) =>
          f.severity === 'info' &&
          f.component === 'B' &&
          f.message.includes('duplicate'),
      ),
    ).toBe(true);
  });

  it('processes a heterogeneous batch and surfaces only the offenders', async () => {
    const r = await new RelatedGraphConsistencyGate().run(
      makeCtx([
        mkManifest({ component: 'A', related: ['B'] }), // sym with B
        mkManifest({ component: 'B', related: ['A', 'C'] }), // asym vs C
        mkManifest({ component: 'C', related: ['Ghost'] }), // unresolved
      ]),
    );
    expect(r.passed).toBe(true);
    // C is asymmetric: B lists it but C doesn't list B back.
    expect(
      r.findings.some(
        (f) =>
          f.component === 'C' && f.message.includes('Asymmetric'),
      ),
    ).toBe(true);
    // Ghost is unresolved (no manifest declares it).
    expect(
      r.findings.some(
        (f) => f.message.includes('unknown component "Ghost"'),
      ),
    ).toBe(true);
    // A-B is symmetric; A should NOT be flagged.
    expect(
      r.findings.some(
        (f) => f.component === 'A' && f.message.includes('Asymmetric'),
      ),
    ).toBe(false);
  });

  it('returns a blocker if ctx.manifests is not iterable (loader bug)', async () => {
    const ctx = makeCtx([]);
    // Force the defensive branch — simulate a malformed context.
    (ctx as unknown as { manifests: unknown }).manifests = 'not-an-array';
    const r = await new RelatedGraphConsistencyGate().run(ctx);
    expect(r.passed).toBe(false);
    expect(r.findings[0]!.severity).toBe('blocker');
    expect(r.findings[0]!.message).toContain('cannot iterate manifests');
  });

  it('exposes id, name, description matching the contract', () => {
    const g = new RelatedGraphConsistencyGate();
    expect(g.id).toBe(30);
    expect(g.name).toBe('related-graph-consistency');
    expect(g.description.toLowerCase()).toContain('related');
  });

  it('default export is a usable singleton', () => {
    expect(gate.id).toBe(30);
    expect(gate.name).toBe('related-graph-consistency');
    expect(typeof gate.run).toBe('function');
  });
});
