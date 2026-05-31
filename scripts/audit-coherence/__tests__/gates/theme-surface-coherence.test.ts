/**
 * Unit tests for Gate 22 — theme-surface-coherence.
 *
 * All file IO is stubbed via the `readFiles` constructor option. Each test
 * is a fixture demonstrating either a known violation (to verify
 * detection) or a known-good shape (to verify no false positive).
 */

import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

import type { AuditContext } from '../../_lib/load-context.js';
import gate, {
  ThemeSurfaceCoherenceGate,
  analyzeSurfaceCoherence,
  findingsFor,
  buildSummaryFinding,
  type ComponentSurfaceAnalysis,
} from '../../gates/22-theme-surface-coherence.js';

// ---------------------------------------------------------------------------
// Synthetic AuditContext
// ---------------------------------------------------------------------------

const repoRoot = path.resolve('/virtual/repo');

function makeCtx(): AuditContext {
  return {
    repoRoot,
    manifests: [],
    uiKitSrcDir: path.join(repoRoot, 'packages/ui-kit/src'),
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(repoRoot, 'packages/ui-kit/src/tokens.ts'),
    registryFile: path.join(repoRoot, 'packages/ui-kit/src/registry.ts'),
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

function readFilesStub(
  entries: Array<{ file: string; source: string }>,
): (repoRoot: string) => Promise<Array<{ file: string; source: string }>> {
  return async () => entries;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const COMPLIANT_SOURCE = `
import { Surface, useEffectiveSurface, surfaceClasses, cn } from "../common";

export interface PixelChipProps {
  surface?: Surface;
  label: string;
}

export function PixelChip({ surface: surfaceProp, label }: PixelChipProps) {
  const effective = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(effective);
  return <span className={cn(s.border, s.radiusFull, s.shadow)}>{label}</span>;
}
`;

// surface declared in Props but the body never reads it. The classic
// "silent decoupling" bug — IntelliSense lies.
const MISSING_USE_EFFECTIVE_SURFACE_SOURCE = `
import { Surface, surfaceClasses, cn } from "../common";

export interface PixelGhostProps {
  surface?: Surface;
  label: string;
}

export function PixelGhost({ surface, label }: PixelGhostProps) {
  const s = surfaceClasses("pixel");
  return <span className={cn(s.border, s.radius)}>{label}</span>;
}
`;

// surface declared, useEffectiveSurface called, but surfaceClasses is
// never invoked — so the tokens are never computed.
const MISSING_SURFACE_CLASSES_SOURCE = `
import { Surface, useEffectiveSurface, cn } from "../common";

export interface PixelHalfProps {
  surface?: Surface;
}

export function PixelHalf({ surface }: PixelHalfProps) {
  const effective = useEffectiveSurface(surface);
  return <span className={cn("border-2 pxl-corner-sm", effective)}>x</span>;
}
`;

// useEffectiveSurface is called with NO argument — the prop is declared
// but the per-instance override never takes effect.
const IGNORED_PROP_SOURCE = `
import { Surface, useEffectiveSurface, surfaceClasses, cn } from "../common";

export interface PixelStraySurfaceProps {
  surface?: Surface;
}

export function PixelStraySurface({ surface }: PixelStraySurfaceProps) {
  const effective = useEffectiveSurface();
  const s = surfaceClasses(effective);
  return <span className={cn(s.border, s.radius)}>x</span>;
}
`;

// surfaceClasses is called but its return value is never applied.
const COMPUTED_BUT_UNAPPLIED_SOURCE = `
import { Surface, useEffectiveSurface, surfaceClasses, cn } from "../common";

export interface PixelUnappliedProps {
  surface?: Surface;
}

export function PixelUnapplied({ surface }: PixelUnappliedProps) {
  const effective = useEffectiveSurface(surface);
  const s = surfaceClasses(effective);
  // Whoops — never spread s.border / s.radius into className.
  return <span className={cn("border-2 pxl-corner-sm")}>{String(s.font)}</span>;
}
`;

// Component without a surface prop should NEVER be flagged.
const NO_SURFACE_PROP_SOURCE = `
import { cn } from "../common";

export interface PixelStaticProps {
  label: string;
}

export function PixelStatic({ label }: PixelStaticProps) {
  return <span className={cn("border-2")}>{label}</span>;
}
`;

// ---------------------------------------------------------------------------
// Pure analyzer
// ---------------------------------------------------------------------------

describe('analyzeSurfaceCoherence', () => {
  it('marks compliant components as having the full surface plumbing', () => {
    const r = analyzeSurfaceCoherence(COMPLIANT_SOURCE, 'PixelChip.tsx');
    expect(r.importsSurfaceType).toBe(true);
    expect(r.components).toHaveLength(1);
    const c = r.components[0]!;
    expect(c.component).toBe('PixelChip');
    expect(c.declaresSurfaceProp).toBe(true);
    expect(c.callsUseEffectiveSurface).toBe(true);
    expect(c.useEffectiveSurfaceUsesProp).toBe(true);
    expect(c.callsSurfaceClasses).toBe(true);
    expect(c.appliesBorder).toBe(true);
    expect(c.appliesRadius).toBe(true);
  });

  it('detects surface prop declared but useEffectiveSurface missing', () => {
    const r = analyzeSurfaceCoherence(
      MISSING_USE_EFFECTIVE_SURFACE_SOURCE,
      'PixelGhost.tsx',
    );
    const c = r.components[0]!;
    expect(c.declaresSurfaceProp).toBe(true);
    expect(c.callsUseEffectiveSurface).toBe(false);
    expect(c.callsSurfaceClasses).toBe(true);
  });

  it('detects surface prop declared but surfaceClasses missing', () => {
    const r = analyzeSurfaceCoherence(
      MISSING_SURFACE_CLASSES_SOURCE,
      'PixelHalf.tsx',
    );
    const c = r.components[0]!;
    expect(c.declaresSurfaceProp).toBe(true);
    expect(c.callsUseEffectiveSurface).toBe(true);
    expect(c.callsSurfaceClasses).toBe(false);
  });

  it('detects useEffectiveSurface called without the declared prop', () => {
    const r = analyzeSurfaceCoherence(IGNORED_PROP_SOURCE, 'PixelStray.tsx');
    const c = r.components[0]!;
    expect(c.declaresSurfaceProp).toBe(true);
    expect(c.callsUseEffectiveSurface).toBe(true);
    expect(c.useEffectiveSurfaceUsesProp).toBe(false);
  });

  it('detects surfaceClasses called but neither border nor radius applied', () => {
    const r = analyzeSurfaceCoherence(
      COMPUTED_BUT_UNAPPLIED_SOURCE,
      'PixelUnapplied.tsx',
    );
    const c = r.components[0]!;
    expect(c.callsSurfaceClasses).toBe(true);
    expect(c.appliesBorder).toBe(false);
    expect(c.appliesRadius).toBe(false);
  });

  it('leaves non-surface-aware components alone', () => {
    const r = analyzeSurfaceCoherence(NO_SURFACE_PROP_SOURCE, 'PixelStatic.tsx');
    const c = r.components[0]!;
    expect(c.declaresSurfaceProp).toBe(false);
  });

  it('strips comments so docstring mentions of "surface?: Surface" do not false-positive', () => {
    const source = `
      /**
       * Some docs that mention surface?: Surface for narrative reasons.
       */
      export function PixelDocOnly() {
        return <span>hi</span>;
      }
    `;
    const r = analyzeSurfaceCoherence(source, 'PixelDocOnly.tsx');
    expect(r.components[0]!.declaresSurfaceProp).toBe(false);
  });

  it('records a synthetic component when no declarations are detected', () => {
    const r = analyzeSurfaceCoherence('// empty file', 'mystery.tsx');
    expect(r.components).toHaveLength(1);
    expect(r.components[0]!.component).toBe('mystery');
  });
});

// ---------------------------------------------------------------------------
// findingsFor — pure rule
// ---------------------------------------------------------------------------

function mkAnalysis(
  overrides: Partial<ComponentSurfaceAnalysis>,
): ComponentSurfaceAnalysis {
  return {
    component: 'PixelX',
    file: 'PixelX.tsx',
    declaresSurfaceProp: true,
    surfacePropIdent: 'surface',
    callsUseEffectiveSurface: true,
    useEffectiveSurfaceUsesProp: true,
    callsSurfaceClasses: true,
    appliesBorder: true,
    appliesRadius: true,
    hardcodedBorderLiteral: false,
    ...overrides,
  };
}

describe('findingsFor', () => {
  it('returns no findings for a fully compliant component', () => {
    expect(findingsFor(mkAnalysis({}))).toEqual([]);
  });

  it('returns no findings for components without a surface prop', () => {
    expect(
      findingsFor(
        mkAnalysis({
          declaresSurfaceProp: false,
          callsUseEffectiveSurface: false,
          callsSurfaceClasses: false,
          appliesBorder: false,
          appliesRadius: false,
        }),
      ),
    ).toEqual([]);
  });

  it('returns a BLOCKER when useEffectiveSurface is missing', () => {
    const fs = findingsFor(mkAnalysis({ callsUseEffectiveSurface: false }));
    expect(fs).toHaveLength(1);
    expect(fs[0]!.severity).toBe('blocker');
    expect(fs[0]!.suggestion).toContain('useEffectiveSurface');
  });

  it('returns a BLOCKER when surfaceClasses is missing', () => {
    const fs = findingsFor(mkAnalysis({ callsSurfaceClasses: false }));
    expect(fs).toHaveLength(1);
    expect(fs[0]!.severity).toBe('blocker');
    expect(fs[0]!.message).toContain('surfaceClasses');
  });

  it('returns a BLOCKER when useEffectiveSurface ignores the prop', () => {
    const fs = findingsFor(
      mkAnalysis({ useEffectiveSurfaceUsesProp: false }),
    );
    expect(fs).toHaveLength(1);
    expect(fs[0]!.severity).toBe('blocker');
    expect(fs[0]!.message).toContain('without passing');
  });

  it('returns a MAJOR when surfaceClasses is computed but not applied', () => {
    const fs = findingsFor(
      mkAnalysis({ appliesBorder: false, appliesRadius: false }),
    );
    expect(fs).toHaveLength(1);
    expect(fs[0]!.severity).toBe('major');
    expect(fs[0]!.message).toContain('never applies');
  });

  it('stacks multiple findings when several rules fire', () => {
    const fs = findingsFor(
      mkAnalysis({
        callsUseEffectiveSurface: false,
        callsSurfaceClasses: false,
        appliesBorder: false,
        appliesRadius: false,
      }),
    );
    // Missing useEffectiveSurface + missing surfaceClasses = 2 blockers.
    // The "computed but not applied" rule does not fire because
    // callsSurfaceClasses is false (the precondition).
    expect(fs.length).toBe(2);
    for (const f of fs) {
      expect(f.severity).toBe('blocker');
    }
  });
});

// ---------------------------------------------------------------------------
// Summary table
// ---------------------------------------------------------------------------

describe('buildSummaryFinding', () => {
  it('reports "no surface-aware components" when the scope is empty', () => {
    const r = buildSummaryFinding([]);
    expect(r.severity).toBe('info');
    expect(r.message).toContain('no surface-aware components');
  });

  it('lists every surface-aware component with applied flags', () => {
    const r = buildSummaryFinding([
      mkAnalysis({ component: 'PixelA' }),
      mkAnalysis({
        component: 'PixelB',
        appliesBorder: false,
        appliesRadius: false,
      }),
      mkAnalysis({ component: 'PixelStatic', declaresSurfaceProp: false }),
    ]);
    expect(r.severity).toBe('info');
    expect(r.message).toContain('PixelA');
    expect(r.message).toContain('PixelB');
    // PixelStatic is not surface-aware → not in the summary.
    expect(r.message).not.toContain('PixelStatic');
  });
});

// ---------------------------------------------------------------------------
// Gate.run() — end-to-end against the in-memory context
// ---------------------------------------------------------------------------

describe('ThemeSurfaceCoherenceGate.run', () => {
  it('passes (with info summary) when every component is compliant', async () => {
    const g = new ThemeSurfaceCoherenceGate({
      readFiles: readFilesStub([
        { file: 'PixelChip.tsx', source: COMPLIANT_SOURCE },
      ]),
    });
    const r = await g.run(makeCtx());
    expect(r.passed).toBe(true);
    expect(r.name).toBe('theme-surface-coherence');
    // The summary finding is always appended.
    expect(r.findings.some((f) => f.severity === 'info')).toBe(true);
    // No blockers / majors.
    expect(
      r.findings.some(
        (f) => f.severity === 'blocker' || f.severity === 'major',
      ),
    ).toBe(false);
  });

  it('fails (blocker) on the known-violation fixture: surface declared but useEffectiveSurface missing', async () => {
    const g = new ThemeSurfaceCoherenceGate({
      readFiles: readFilesStub([
        {
          file: 'PixelGhost.tsx',
          source: MISSING_USE_EFFECTIVE_SURFACE_SOURCE,
        },
      ]),
    });
    const r = await g.run(makeCtx());
    expect(r.passed).toBe(false);
    const blockers = r.findings.filter((f) => f.severity === 'blocker');
    expect(blockers.length).toBeGreaterThan(0);
    expect(
      blockers.some((f) =>
        f.message.toLowerCase().includes('useeffectivesurface'),
      ),
    ).toBe(true);
    // Suggestion is actionable — gives exact replacement code.
    expect(
      blockers.some((f) =>
        (f.suggestion ?? '').includes('surfaceClasses'),
      ),
    ).toBe(true);
  });

  it('fails (blocker) when useEffectiveSurface() is called without the prop', async () => {
    const g = new ThemeSurfaceCoherenceGate({
      readFiles: readFilesStub([
        { file: 'PixelStray.tsx', source: IGNORED_PROP_SOURCE },
      ]),
    });
    const r = await g.run(makeCtx());
    expect(r.passed).toBe(false);
    expect(
      r.findings.some(
        (f) =>
          f.severity === 'blocker' &&
          f.message.includes('without passing'),
      ),
    ).toBe(true);
  });

  it('fails (major) when surfaceClasses is computed but never applied', async () => {
    const g = new ThemeSurfaceCoherenceGate({
      readFiles: readFilesStub([
        { file: 'PixelUnapplied.tsx', source: COMPUTED_BUT_UNAPPLIED_SOURCE },
      ]),
    });
    const r = await g.run(makeCtx());
    expect(r.passed).toBe(false);
    expect(
      r.findings.some(
        (f) => f.severity === 'major' && f.message.includes('never applies'),
      ),
    ).toBe(true);
  });

  it('does not flag components that opt out of the surface system entirely', async () => {
    const g = new ThemeSurfaceCoherenceGate({
      readFiles: readFilesStub([
        { file: 'PixelStatic.tsx', source: NO_SURFACE_PROP_SOURCE },
      ]),
    });
    const r = await g.run(makeCtx());
    expect(r.passed).toBe(true);
    expect(
      r.findings.some(
        (f) => f.severity === 'blocker' || f.severity === 'major',
      ),
    ).toBe(false);
  });

  it('processes a heterogeneous batch and only flags the bad ones', async () => {
    const g = new ThemeSurfaceCoherenceGate({
      readFiles: readFilesStub([
        { file: 'PixelChip.tsx', source: COMPLIANT_SOURCE },
        {
          file: 'PixelGhost.tsx',
          source: MISSING_USE_EFFECTIVE_SURFACE_SOURCE,
        },
        { file: 'PixelStatic.tsx', source: NO_SURFACE_PROP_SOURCE },
      ]),
    });
    const r = await g.run(makeCtx());
    expect(r.passed).toBe(false);
    const offending = r.findings
      .filter((f) => f.severity === 'blocker' || f.severity === 'major')
      .map((f) => f.component);
    expect(offending).toContain('PixelGhost');
    expect(offending).not.toContain('PixelChip');
    expect(offending).not.toContain('PixelStatic');
  });

  it('returns a blocker when file enumeration throws', async () => {
    const g = new ThemeSurfaceCoherenceGate({
      readFiles: async () => {
        throw new Error('disk full');
      },
    });
    const r = await g.run(makeCtx());
    expect(r.passed).toBe(false);
    expect(r.findings[0]!.severity).toBe('blocker');
    expect(r.findings[0]!.message).toContain('disk full');
  });

  it('exposes id, name, description matching the contract', () => {
    const g = new ThemeSurfaceCoherenceGate();
    expect(g.id).toBe(22);
    expect(g.name).toBe('theme-surface-coherence');
    expect(g.description.toLowerCase()).toContain('surface');
  });

  it('default export is a usable singleton', () => {
    expect(gate.id).toBe(22);
    expect(gate.name).toBe('theme-surface-coherence');
    expect(typeof gate.run).toBe('function');
  });
});
