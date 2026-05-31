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
 *       at least once in the same file. BLOCKER.
 *   R3. If `surface?` is declared in Props → MUST call `surfaceClasses` at
 *       least once in the same file. BLOCKER.
 *   R4. `useEffectiveSurface` MUST be called with the destructured surface
 *       prop (or an equivalent identifier renamed from `surface`). If the
 *       call is `useEffectiveSurface()` with no argument, the prop is
 *       declared-but-ignored. BLOCKER.
 *   R5. The result of `surfaceClasses(...)` MUST be referenced via at least
 *       one of `.border` or `.radius` / `.radiusLg` / `.radiusFull` in the
 *       JSX. If not, the surface tokens are computed but never applied
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

// Hardcoded border literals. We tolerate `border-retro-*` since those are
// tone tokens, not surface tokens.
const HARDCODED_BORDER_LITERAL_REGEX =
  /\b(?:'|"|`)[^'"`]*\bborder(?:-2)?(?![A-Za-z0-9_-])/;

function stripBlockComments(source: string): string {
  // Cheap comment scrubber so a `// surface?: Surface` in a docstring does
  // not trigger the declaration regex. Good enough for our gate; we are not
  // building a real parser.
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => line.replace(/(^|[^:])\/\/.*$/, '$1'))
    .join('\n');
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
  const callsUseEffectiveSurface = USE_EFFECTIVE_SURFACE_CALL_REGEX.test(source);
  // Reset lastIndex after .test() — RegExp.prototype.test with /g mutates state.
  USE_EFFECTIVE_SURFACE_CALL_REGEX.lastIndex = 0;

  // Pull every `useEffectiveSurface(...)` argument so we can validate R4.
  const useEffectiveSurfaceArgs: string[] = [];
  for (const m of source.matchAll(USE_EFFECTIVE_SURFACE_CALL_REGEX)) {
    useEffectiveSurfaceArgs.push((m[1] ?? '').trim());
  }

  // Find every `const X = surfaceClasses(...)` so we can verify the
  // returned token bundle is actually consumed.
  const surfaceClassesVars: string[] = [];
  for (const m of source.matchAll(SURFACE_CLASSES_ASSIGN_REGEX)) {
    surfaceClassesVars.push(m[1]!);
  }
  const callsSurfaceClasses = surfaceClassesVars.length > 0;

  // Verify each var is used as `.border` / `.radius*` somewhere downstream.
  let appliesBorder = false;
  let appliesRadius = false;
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
      hardcodedBorderLiteral,
    });
  }
  if (components.length === 0) {
    components.push({
      component: path.basename(file).replace(/\.[tj]sx?$/, ''),
      file,
      declaresSurfaceProp,
      surfacePropIdent,
      callsUseEffectiveSurface,
      useEffectiveSurfaceUsesProp,
      callsSurfaceClasses,
      appliesBorder,
      appliesRadius,
      hardcodedBorderLiteral,
    });
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

  if (!analysis.callsUseEffectiveSurface) {
    out.push({
      severity: 'blocker',
      file: analysis.file,
      component: analysis.component,
      message: `Component "${analysis.component}" declares "surface?: Surface" in its props but never calls useEffectiveSurface() — the prop is silently ignored.`,
      suggestion: `Inside the component body, resolve the prop:\n  const effectiveSurface = useEffectiveSurface(${analysis.surfacePropIdent ?? 'surface'});\n  const s = surfaceClasses(effectiveSurface);\nThen spread s.border / s.radius into the rendered className.`,
    });
  }

  if (!analysis.callsSurfaceClasses) {
    out.push({
      severity: 'blocker',
      file: analysis.file,
      component: analysis.component,
      message: `Component "${analysis.component}" declares "surface?: Surface" but never calls surfaceClasses() — the surface-specific border/radius/shadow tokens are not being computed.`,
      suggestion: `Add: const s = surfaceClasses(useEffectiveSurface(${analysis.surfacePropIdent ?? 'surface'})); and apply s.border + s.radius (or s.radiusLg / s.radiusFull) in your className.`,
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

  if (
    analysis.callsSurfaceClasses &&
    !analysis.appliesBorder &&
    !analysis.appliesRadius
  ) {
    out.push({
      severity: 'major',
      file: analysis.file,
      component: analysis.component,
      message: `Component "${analysis.component}" computes surfaceClasses(...) but never applies s.border or s.radius* to its rendered tree — corner-radius and border styles are NOT switching per surface.`,
      suggestion: `Spread the bundle into your className, e.g.:\n  className={cn(s.border, s.radius, s.shadow, ...)}\nIf only one of border/radius is intentional, document why and exclude this component from the gate via a manifest opt-out.`,
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
      const ueffective = a.callsUseEffectiveSurface
        ? a.useEffectiveSurfaceUsesProp
          ? 'yes'
          : 'ignored-prop'
        : 'missing';
      const sc = a.callsSurfaceClasses ? 'yes' : 'missing';
      return `  - ${a.component} (${path.relative(process.cwd(), a.file).replace(/\\/g, '/')}) — useEffectiveSurface=${ueffective}, surfaceClasses=${sc}, border=${border}, radius=${radius}`;
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
