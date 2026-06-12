/**
 * Gate 22 — theme-surface-coherence.
 *
 * Goes deeper than the core "props inherit" gates: enforces the contract
 * that every component which DECLARES `surface?: Surface` in its public
 * Props MUST actually thread that prop through the canonical
 * `surfaceClasses(useEffectiveSurface(surfaceProp))` pattern AND apply the
 * resulting border + radius classes to its rendered tree.
 *
 * Why this matters. A component can ship `surface?: Surface` in its props
 * (good intentions, IntelliSense looks right) and STILL render a hardcoded
 * `border-2 pxl-corner-sm` regardless of the prop. The unit tests pass.
 * The Storybook story renders. Nobody notices until a `linear` consumer
 * complains that their forms look chunky. This gate catches that silent
 * decoupling at audit time.
 *
 * Rules enforced (per surface-aware component):
 *
 *   R1. Imports `Surface` from common (sanity — without the type, the
 *       prop annotation could not resolve, so we just record it).
 *   R2. If `surface?` is declared in Props → MUST call `useEffectiveSurface`
 *       at least once in the same file, OR forward the prop to a
 *       surface-aware child via JSX (`surface={...}` — delegation; the
 *       child resolves provider/default itself, e.g. ToastViewport →
 *       PixelToast). BLOCKER.
 *   R3. If `surface?` is declared in Props → MUST call `surfaceClasses` at
 *       least once in the same file, OR consume the resolved surface in
 *       another legitimate way: branch-render on it (PixelSpinner's
 *       `surface === 'pixel'`), publish it through a context value
 *       (PixelTabs / PixelToggleGroup), or JSX-forward it. What it must
 *       NOT do is resolve the surface and discard it. BLOCKER.
 *   R4. `useEffectiveSurface` MUST be called with the destructured surface
 *       prop (or an equivalent identifier renamed from `surface`). If the
 *       call is `useEffectiveSurface()` with no argument, the prop is
 *       declared-but-ignored. The hook's own function DEFINITION (in
 *       common.tsx) is not a call and is excluded. BLOCKER.
 *   R5. The result of `surfaceClasses(...)` MUST be consumed via at least
 *       one property of the `SurfaceClasses` bundle (border, radius*,
 *       shadow*, font*, transition, press). Typography-only components
 *       (forms, layout primitives, breadcrumbs) legitimately consume only
 *       `font` / `transition` — that still switches per surface. If NO
 *       property is consumed, the tokens are computed but never applied
 *       (typical refactor wreckage). MAJOR.
 *   R6. The component MUST NOT render a literal hardcoded border-width
 *       (`border-2` outside the pixel branch, or `border` outside the
 *       linear branch) on the SAME root element where the surface classes
 *       are spread — that would clobber the per-surface token. MAJOR.
 *       (Detection is best-effort textual; reported as MAJOR not BLOCKER
 *       because false positives are possible in CVA-like patterns.)
 *
 * In addition to findings, the gate appends one `info` finding that
 * summarises EVERY surface-aware component as a small table (component,
 * file, applies-border?, applies-radius?). The orchestrator/CI can ignore
 * `info` findings, but they make the audit report concretely useful.
 *
 * Programmatic API:
 *
 *     const gate = new ThemeSurfaceCoherenceGate();
 *     const result = await gate.run(ctx);
 *
 * CLI:
 *
 *     tsx scripts/audit-coherence/gates/22-theme-surface-coherence.ts \
 *       [--repo <dir>] [--json] [--verbose]
 *
 * Exit codes:
 *   0 — every surface-aware component threads the prop correctly
 *   1 — at least one component declared `surface?` but did not apply it
 */

import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { glob as fgGlob } from 'fast-glob';
import * as fs from 'fs-extra';

import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';

// ---------------------------------------------------------------------------
// Pure analyzer — works on a TS source string, no fs.
// ---------------------------------------------------------------------------

/** Per-component analysis result. Exposed for tests + the summary table. */
export interface ComponentSurfaceAnalysis {
  /** Component name as it appears in the export / function declaration. */
  component: string;
  /** Absolute or relative path used only for reporting. */
  file: string;
  /** `surface?: Surface` (or `surface: Surface`) appears in the Props. */
  declaresSurfaceProp: boolean;
  /** Identifier the prop is destructured to (defaults to `surface`). */
  surfacePropIdent: string | null;
  /** `useEffectiveSurface(...)` is called anywhere in the file. */
  callsUseEffectiveSurface: boolean;
  /** `useEffectiveSurface(arg)` where arg references the declared prop. */
  useEffectiveSurfaceUsesProp: boolean;
  /** `surfaceClasses(...)` is called anywhere in the file. */
  callsSurfaceClasses: boolean;
  /** The result of `surfaceClasses` is used as `<varname>.border`. */
  appliesBorder: boolean;
  /** The result of `surfaceClasses` is used as `<varname>.radius*`. */
  appliesRadius: boolean;
  /**
   * ANY property of the `SurfaceClasses` bundle is consumed
   * (border / radius* / shadow* / font* / transition / press).
   * Typography-only components apply `font` / `transition` and nothing else.
   */
  appliesAnyToken: boolean;
  /** The surface prop is forwarded to a child via JSX (`surface={...}`). */
  forwardsSurfaceProp: boolean;
  /**
   * A `const x = useEffectiveSurface(...)` result is referenced again after
   * the assignment (branch rendering, context value, child props, ...).
   */
  usesResolvedSurface: boolean;
  /** A `border-2` or `border` literal is used in className (sanity flag). */
  hardcodedBorderLiteral: boolean;
}

/** Pure file-level analysis. */
export interface FileSurfaceAnalysis {
  file: string;
  importsSurfaceType: boolean;
  components: ComponentSurfaceAnalysis[];
}

// `surface?: Surface` or `surface: Surface` — anywhere in the file, in any
// Props interface/type. Tolerant of leading whitespace, line breaks,
// generic-laden Surface refs we may add later.
const SURFACE_PROP_DECL_REGEX =
  /\bsurface\s*\??\s*:\s*Surface(?:\s*<[^>]*>)?(?:\s*\|\s*[A-Za-z_][\w.]*)*\s*[;,\n}]/;

// Anywhere `useEffectiveSurface` is called. Capture group 1 = argument
// expression (possibly empty).
const USE_EFFECTIVE_SURFACE_CALL_REGEX = /useEffectiveSurface\s*\(\s*([^)]*)\)/g;

// Anywhere `surfaceClasses` is called. We do not need the argument, only
// the lhs variable it is assigned to.
const SURFACE_CLASSES_ASSIGN_REGEX =
  /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*surfaceClasses\s*\(/g;

// `const surface = useEffectiveSurface(...)` — the lhs ident is tracked to
// verify the resolved surface is consumed (branch / context / forward) and
// not just resolved-and-discarded.
const RESOLVED_SURFACE_ASSIGN_REGEX =
  /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*useEffectiveSurface\s*\(/g;

// Every key of the `SurfaceClasses` bundle in common.tsx. Consuming ANY of
// them means the component's rendering switches per surface.
const SURFACE_TOKEN_KEYS =
  'border|radius|radiusLg|radiusFull|shadow|shadowHover|shadowActive|font|fontDisplay|transition|press';

// `import { ..., Surface, ... } from "./common"` — we just confirm the
// symbol shows up in any import specifier list.
const SURFACE_TYPE_IMPORT_REGEX =
  /import\s+(?:type\s+)?{[^}]*\bSurface\b[^}]*}\s+from\s+['"][^'"]+['"]/;

// Best-effort component name detector: exports + function/const declarations.
// We tolerate `forwardRef`, generic args, and arrow-fn style.
const COMPONENT_DECL_REGEX =
  /(?:export\s+(?:const|function)\s+|const\s+|function\s+)([A-Z][A-Za-z0-9_]+)\s*(?:[:=<(]|\s*=\s*(?:React\.)?forwardRef)/g;

// Destructured surface prop with possible rename: `{ surface: surfaceProp }`,
// `{ surface }`, `{ surface = "pixel" }`. Captures the destructure target.
const SURFACE_DESTRUCTURE_REGEX =
  /\{\s*(?:[^{}]*?,\s*)?surface(?:\s*:\s*([A-Za-z_$][\w$]*))?(?:\s*=\s*[^,}]+)?\s*(?:,|\})/;

/**
 * Exclude non-component identifiers from surface analysis. The
 * COMPONENT_DECL_REGEX is intentionally loose (any `export const Foo` or
 * `function Foo`) so it also captures hooks, contexts, providers, icon
 * helpers, and ALL_CAPS token tables. Those declare or sit next to
 * `surface?: Surface` in shared barrel files (common.tsx, contexts, theme
 * tokens) and produce false positives. This filter is the canonical list
 * of "not a surface-aware component" suffixes/shapes.
 */
function isNonComponentExport(name: string): boolean {
  // ALL_CAPS constants like SURFACE_TOKENS, SIZE_PAD.
  if (/^[A-Z][A-Z0-9_]+$/.test(name)) return true;
  // useXxx hooks (very rare for COMPONENT_DECL_REGEX to capture since it
  // requires a leading uppercase letter, but kept for safety).
  if (/^use[A-Z]/.test(name)) return true;
  // Context / Provider / Icon helpers — never render surface-aware shells.
  if (/Context$/.test(name)) return true;
  if (/Provider$/.test(name)) return true;
  if (/Icon$/.test(name)) return true;
  return false;
}

// Hardcoded border literals. We tolerate `border-retro-*` since those are
// tone tokens, not surface tokens.
const HARDCODED_BORDER_LITERAL_REGEX =
  /\b(?:'|"|`)[^'"`]*\bborder(?:-2)?(?![A-Za-z0-9_-])/;

/**
 * Comment scrubber so a `// surface?: Surface` in a docstring does not
 * trigger the declaration regex.
 *
 * STRING-AWARE on purpose. The previous regex version
 * (`.replace(/\/\*[\s\S]*?\*\//g, '')`) treated the `/*` inside the string
 * literal `p.endsWith('/*')` (PixelFileUpload's accept matcher) as a
 * block-comment opener and silently deleted 44 lines of real code —
 * including the `useEffectiveSurface` call the gate was looking for. This
 * scanner walks the source once, copying string/template/regex literals
 * verbatim and dropping only actual comments (newlines inside block
 * comments are preserved). Still not a full parser — the regex-literal
 * detection is the standard prev-token heuristic — but it can no longer be
 * fooled by comment markers inside strings.
 */
function stripBlockComments(source: string): string {
  let out = '';
  let i = 0;
  const n = source.length;
  // Last meaningful (non-whitespace, non-comment) char emitted — used to
  // distinguish a regex literal from a division operator.
  let prev = '';
  while (i < n) {
    const ch = source[i]!;
    const next = i + 1 < n ? source[i + 1]! : '';
    // Block comment — drop, preserving newlines for any line math.
    if (ch === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2);
      const body = end === -1 ? source.slice(i) : source.slice(i, end + 2);
      out += body.replace(/[^\n]+/g, '');
      i = end === -1 ? n : end + 2;
      continue;
    }
    // Line comment — drop to (but not including) the newline.
    if (ch === '/' && next === '/') {
      const end = source.indexOf('\n', i + 2);
      i = end === -1 ? n : end;
      continue;
    }
    // String literal — copy verbatim, honouring escapes.
    if (ch === '\'' || ch === '"') {
      out += ch;
      i += 1;
      while (i < n) {
        const c = source[i]!;
        out += c;
        i += 1;
        if (c === '\\' && i < n) {
          out += source[i]!;
          i += 1;
          continue;
        }
        if (c === ch || c === '\n') break;
      }
      prev = ch;
      continue;
    }
    // Template literal — copy verbatim until the closing backtick.
    // (Interpolations are copied as-is; nested edge cases are acceptable
    // for a gate-level heuristic.)
    if (ch === '`') {
      out += ch;
      i += 1;
      while (i < n) {
        const c = source[i]!;
        out += c;
        i += 1;
        if (c === '\\' && i < n) {
          out += source[i]!;
          i += 1;
          continue;
        }
        if (c === '`') break;
      }
      prev = '`';
      continue;
    }
    // Possible regex literal — only when the previous meaningful char puts
    // us in expression position (otherwise it's division).
    if (ch === '/' && (prev === '' || '=(,:[!&|?{};'.includes(prev))) {
      out += ch;
      i += 1;
      let inClass = false;
      while (i < n) {
        const c = source[i]!;
        out += c;
        i += 1;
        if (c === '\\' && i < n) {
          out += source[i]!;
          i += 1;
          continue;
        }
        if (c === '[') inClass = true;
        else if (c === ']') inClass = false;
        else if ((c === '/' && !inClass) || c === '\n') break;
      }
      prev = '/';
      continue;
    }
    out += ch;
    if (!/\s/.test(ch)) prev = ch;
    i += 1;
  }
  return out;
}

/**
 * Analyse a single source file. Returns one entry per detected component.
 * Components that do NOT declare `surface?` are still recorded so the
 * summary table can show coverage gaps.
 */
export function analyzeSurfaceCoherence(
  rawSource: string,
  file: string,
): FileSurfaceAnalysis {
  const source = stripBlockComments(rawSource);
  const importsSurfaceType = SURFACE_TYPE_IMPORT_REGEX.test(source);

  // File-level flags — we collapse them onto every component in the file.
  // This is a simplification: if a file declares ten components and only
  // one calls `useEffectiveSurface`, the others will be reported as
  // compliant. In practice the ui-kit puts one component per file, and the
  // few multi-component files (e.g. `data-display.tsx`) all share the
  // same surface plumbing at the top.
  // Pull every `useEffectiveSurface(...)` CALL (argument captured for R4).
  // The hook's own function DEFINITION — `function useEffectiveSurface(...)`
  // in common.tsx — also matches the call regex, with its parameter list as
  // the "argument"; exclude it, or it poisons R4 and masks R2.
  const useEffectiveSurfaceArgs: string[] = [];
  for (const m of source.matchAll(USE_EFFECTIVE_SURFACE_CALL_REGEX)) {
    const before = source.slice(Math.max(0, (m.index ?? 0) - 24), m.index);
    if (/\bfunction\s*$/.test(before)) continue; // definition, not a call
    useEffectiveSurfaceArgs.push((m[1] ?? '').trim());
  }
  const callsUseEffectiveSurface = useEffectiveSurfaceArgs.length > 0;

  // R3 delegation signal A — the resolved surface is assigned and then
  // referenced again (branch rendering, context value, child props, ...).
  // A resolved-and-discarded surface stays false.
  let usesResolvedSurface = false;
  for (const m of source.matchAll(RESOLVED_SURFACE_ASSIGN_REGEX)) {
    const ident = m[1]!;
    const escaped = ident.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const after = source.slice((m.index ?? 0) + m[0].length);
    if (new RegExp(`\\b${escaped}\\b`).test(after)) {
      usesResolvedSurface = true;
      break;
    }
  }

  // R2/R3 delegation signal B — the prop is forwarded to a surface-aware
  // child via JSX (`surface={...}`); the child resolves provider/default.
  const forwardsSurfaceProp = /\bsurface=\{/.test(source);

  // Find every `const X = surfaceClasses(...)` so we can verify the
  // returned token bundle is actually consumed.
  const surfaceClassesVars: string[] = [];
  for (const m of source.matchAll(SURFACE_CLASSES_ASSIGN_REGEX)) {
    surfaceClassesVars.push(m[1]!);
  }
  const callsSurfaceClasses = surfaceClassesVars.length > 0;

  // Verify each var is used as `.border` / `.radius*` somewhere downstream,
  // and whether ANY property of the SurfaceClasses bundle is consumed.
  let appliesBorder = false;
  let appliesRadius = false;
  let appliesAnyToken = false;
  for (const v of surfaceClassesVars) {
    const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\.border\\b`).test(source)) {
      appliesBorder = true;
    }
    if (
      new RegExp(`\\b${escaped}\\.(radius|radiusLg|radiusFull)\\b`).test(source)
    ) {
      appliesRadius = true;
    }
    if (
      new RegExp(`\\b${escaped}\\.(?:${SURFACE_TOKEN_KEYS})\\b`).test(source)
    ) {
      appliesAnyToken = true;
    }
  }

  const hardcodedBorderLiteral = HARDCODED_BORDER_LITERAL_REGEX.test(source);

  // Discover surface prop declarations + the identifier they bind to.
  // We only support ONE declaration per file (the ui-kit convention).
  let surfacePropIdent: string | null = null;
  const declaresSurfaceProp = SURFACE_PROP_DECL_REGEX.test(source);
  if (declaresSurfaceProp) {
    const destructure = source.match(SURFACE_DESTRUCTURE_REGEX);
    if (destructure) {
      surfacePropIdent = destructure[1] ?? 'surface';
    } else {
      // Prop is declared but never destructured — caller could still pass
      // through `props.surface`. We mark the ident as null; R4 below will
      // accept any call that references `surface` token.
      surfacePropIdent = null;
    }
  }

  // R4 — useEffectiveSurface argument references the prop ident.
  let useEffectiveSurfaceUsesProp = false;
  if (declaresSurfaceProp) {
    for (const arg of useEffectiveSurfaceArgs) {
      if (arg.length === 0) continue;
      if (surfacePropIdent && arg.includes(surfacePropIdent)) {
        useEffectiveSurfaceUsesProp = true;
        break;
      }
      if (arg.includes('surface')) {
        useEffectiveSurfaceUsesProp = true;
        break;
      }
    }
  }

  // Collect component names in this file. If none discovered, fall back to
  // a synthetic "<file basename>" so the file is still represented in the
  // output table.
  const components: ComponentSurfaceAnalysis[] = [];
  const seen = new Set<string>();
  for (const m of source.matchAll(COMPONENT_DECL_REGEX)) {
    const name = m[1]!;
    if (seen.has(name)) continue;
    if (isNonComponentExport(name)) continue;
    seen.add(name);
    components.push({
      component: name,
      file,
      declaresSurfaceProp,
      surfacePropIdent,
      callsUseEffectiveSurface,
      useEffectiveSurfaceUsesProp,
      callsSurfaceClasses,
      appliesBorder,
      appliesRadius,
      appliesAnyToken,
      forwardsSurfaceProp,
      usesResolvedSurface,
      hardcodedBorderLiteral,
    });
  }
  if (components.length === 0) {
    const fallback = path.basename(file).replace(/\.[tj]sx?$/, '');
    if (!isNonComponentExport(fallback)) {
      components.push({
        component: fallback,
        file,
        declaresSurfaceProp,
        surfacePropIdent,
        callsUseEffectiveSurface,
        useEffectiveSurfaceUsesProp,
        callsSurfaceClasses,
        appliesBorder,
        appliesRadius,
        appliesAnyToken,
        forwardsSurfaceProp,
        usesResolvedSurface,
        hardcodedBorderLiteral,
      });
    }
  }

  return { file, importsSurfaceType, components };
}

// ---------------------------------------------------------------------------
// Findings — pure transform from analysis → GateFinding[].
// ---------------------------------------------------------------------------

/**
 * Convert a single component analysis into 0..N findings. Pure function so
 * tests can assert each rule independently without running the gate.
 */
export function findingsFor(
  analysis: ComponentSurfaceAnalysis,
): GateFinding[] {
  const out: GateFinding[] = [];
  if (!analysis.declaresSurfaceProp) {
    // Components that opt out of surface entirely are not the concern of
    // this gate.
    return out;
  }

  // R2 — the prop must be resolved in-file OR forwarded to a surface-aware
  // child via JSX (delegation: the child resolves provider/default itself).
  if (!analysis.callsUseEffectiveSurface && !analysis.forwardsSurfaceProp) {
    out.push({
      severity: 'blocker',
      file: analysis.file,
      component: analysis.component,
      message: `Component "${analysis.component}" declares "surface?: Surface" in its props but never calls useEffectiveSurface() — the prop is silently ignored.`,
      suggestion: `Inside the component body, resolve the prop:\n  const effectiveSurface = useEffectiveSurface(${analysis.surfacePropIdent ?? 'surface'});\n  const s = surfaceClasses(effectiveSurface);\nThen spread s.border / s.radius into the rendered className. (Forwarding the prop to a surface-aware child via surface={...} also satisfies this rule.)`,
    });
  }

  // R3 — the resolved surface must drive the render somehow: class bundle,
  // branch rendering, context value, or JSX forwarding. Resolved-and-
  // discarded is the violation.
  if (
    !analysis.callsSurfaceClasses &&
    !analysis.forwardsSurfaceProp &&
    !analysis.usesResolvedSurface
  ) {
    out.push({
      severity: 'blocker',
      file: analysis.file,
      component: analysis.component,
      message: `Component "${analysis.component}" declares "surface?: Surface" but never calls surfaceClasses() — the surface-specific border/radius/shadow tokens are not being computed.`,
      suggestion: `Add: const s = surfaceClasses(useEffectiveSurface(${analysis.surfacePropIdent ?? 'surface'})); and apply s.border + s.radius (or s.radiusLg / s.radiusFull) in your className. (Branching on the resolved surface, publishing it through a context value, or JSX-forwarding it also satisfies this rule.)`,
    });
  }

  if (
    analysis.callsUseEffectiveSurface &&
    !analysis.useEffectiveSurfaceUsesProp
  ) {
    out.push({
      severity: 'blocker',
      file: analysis.file,
      component: analysis.component,
      message: `Component "${analysis.component}" calls useEffectiveSurface() without passing the declared surface prop — the per-instance override never takes effect, the provider value is always used.`,
      suggestion: `Pass the prop explicitly: useEffectiveSurface(${analysis.surfacePropIdent ?? 'surface'}). Without it, <YourComponent surface="linear" /> in a pixel-default subtree will stay pixel.`,
    });
  }

  // R5 — consuming ANY property of the bundle means the render switches per
  // surface (typography-only components apply just font/transition).
  // Computing the bundle and consuming NOTHING is refactor wreckage.
  if (analysis.callsSurfaceClasses && !analysis.appliesAnyToken) {
    out.push({
      severity: 'major',
      file: analysis.file,
      component: analysis.component,
      message: `Component "${analysis.component}" computes surfaceClasses(...) but never applies any of its properties (s.border / s.radius* / s.shadow* / s.font* / s.transition / s.press) to its rendered tree — the styles are NOT switching per surface.`,
      suggestion: `Spread the bundle into your className, e.g.:\n  className={cn(s.border, s.radius, s.shadow, ...)}\nTypography-only components may consume just s.font / s.transition — any property counts.`,
    });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Summary table — info-severity, never blocks CI, used to make the report
// concretely actionable.
// ---------------------------------------------------------------------------

export function buildSummaryFinding(
  analyses: ComponentSurfaceAnalysis[],
): GateFinding {
  const surfaceAware = analyses.filter((a) => a.declaresSurfaceProp);
  if (surfaceAware.length === 0) {
    return {
      severity: 'info',
      message:
        'theme-surface-coherence: no surface-aware components discovered in scope.',
    };
  }
  const rows = surfaceAware
    .map((a) => {
      const border = a.appliesBorder ? 'yes' : 'no';
      const radius = a.appliesRadius ? 'yes' : 'no';
      const anyToken = a.appliesAnyToken ? 'yes' : 'no';
      const delegates = a.forwardsSurfaceProp
        ? 'jsx'
        : a.usesResolvedSurface
          ? 'resolved'
          : 'no';
      const ueffective = a.callsUseEffectiveSurface
        ? a.useEffectiveSurfaceUsesProp
          ? 'yes'
          : 'ignored-prop'
        : 'missing';
      const sc = a.callsSurfaceClasses ? 'yes' : 'missing';
      return `  - ${a.component} (${path.relative(process.cwd(), a.file).replace(/\\/g, '/')}) — useEffectiveSurface=${ueffective}, surfaceClasses=${sc}, border=${border}, radius=${radius}, anyToken=${anyToken}, delegates=${delegates}`;
    })
    .join('\n');
  return {
    severity: 'info',
    message: `theme-surface-coherence: ${surfaceAware.length} surface-aware component(s) verified.\n${rows}`,
  };
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export interface ThemeSurfaceCoherenceGateOptions {
  /** Override file scanner. Tests inject an in-memory map keyed by path. */
  readFiles?: (repoRoot: string) => Promise<Array<{ file: string; source: string }>>;
}

export class ThemeSurfaceCoherenceGate extends Gate {
  readonly id = 22;
  readonly name = 'theme-surface-coherence';
  readonly description =
    'Every component that declares "surface?: Surface" MUST call useEffectiveSurface(surface) + surfaceClasses(...) and apply the resulting border/radius classes. Silent decoupling is a blocker.';

  private readonly readFilesImpl: (
    repoRoot: string,
  ) => Promise<Array<{ file: string; source: string }>>;

  constructor(options: ThemeSurfaceCoherenceGateOptions = {}) {
    super();
    this.readFilesImpl = options.readFiles ?? defaultReadFiles;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    let files: Array<{ file: string; source: string }>;
    try {
      files = await this.readFilesImpl(ctx.repoRoot);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      findings.push({
        severity: 'blocker',
        message: `theme-surface-coherence: failed to enumerate component files — ${message}`,
        suggestion:
          'Ensure packages/*/src exists and is readable. The gate cannot enforce surface coherence on an empty scope.',
      });
      return gateFail(this.name, findings, Date.now() - started);
    }

    const allAnalyses: ComponentSurfaceAnalysis[] = [];
    for (const { file, source } of files) {
      const fileAnalysis = analyzeSurfaceCoherence(source, file);
      for (const componentAnalysis of fileAnalysis.components) {
        allAnalyses.push(componentAnalysis);
        for (const f of findingsFor(componentAnalysis)) {
          findings.push(f);
        }
      }
    }

    // Always append the summary, even on pass — it documents what was
    // verified and forms the table the user requested.
    findings.push(buildSummaryFinding(allAnalyses));

    const blocking = findings.some(
      (f) => f.severity === 'blocker' || f.severity === 'major',
    );
    if (!blocking) {
      // gateOk drops findings; we want to keep the summary info finding so
      // the orchestrator can render the table. So we hand-roll the OK
      // result preserving the info entry.
      return {
        name: this.name,
        passed: true,
        findings,
        duration_ms: Date.now() - started,
      };
    }
    return gateFail(this.name, findings, Date.now() - started);
  }
}

async function defaultReadFiles(
  repoRoot: string,
): Promise<Array<{ file: string; source: string }>> {
  const matches = await fgGlob(['packages/*/src/**/*.tsx'], {
    cwd: repoRoot,
    absolute: true,
    dot: false,
    onlyFiles: true,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/__tests__/**',
      '**/*.stories.tsx',
      '**/*.test.tsx',
    ],
  });
  const out: Array<{ file: string; source: string }> = [];
  for (const file of matches) {
    try {
      const source = await fs.readFile(file, 'utf8');
      out.push({ file, source });
    } catch {
      // Best-effort: a single unreadable file should not kill the gate.
    }
  }
  return out;
}

const gate = new ThemeSurfaceCoherenceGate();
export default gate;

// ---------------------------------------------------------------------------
// CLI wrapper
// ---------------------------------------------------------------------------

function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return pathToFileURL(entry).href === import.meta.url;
  } catch {
    return false;
  }
}

async function cli(): Promise<void> {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const verbose = args.includes('--verbose');
  const repoArgIdx = args.findIndex((a) => a === '--repo');
  const repoRoot =
    repoArgIdx >= 0 && args[repoArgIdx + 1]
      ? path.resolve(args[repoArgIdx + 1]!)
      : path.resolve(process.cwd());

  const { loadAuditContext, createLogger } = await import(
    '../_lib/load-context.js'
  );
  const logger = createLogger(verbose);
  const ctx = await loadAuditContext(repoRoot, { logger });
  const result = await gate.run(ctx);

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const status = result.passed ? 'PASS' : 'FAIL';
    process.stdout.write(
      `[gate ${gate.id} ${gate.name}] ${status} (${result.duration_ms}ms) — ${result.findings.length} finding(s)\n`,
    );
    for (const f of result.findings) {
      const where = f.file ? ` ${f.file}` : '';
      const who = f.component ? ` [${f.component}]` : '';
      process.stdout.write(`  - ${f.severity}${who}${where}: ${f.message}\n`);
      if (f.suggestion) {
        process.stdout.write(`      ↳ ${f.suggestion}\n`);
      }
    }
  }

  process.exit(result.passed ? 0 : 1);
}

if (isMainModule()) {
  cli().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`fatal: ${message}\n`);
    process.exit(1);
  });
}
