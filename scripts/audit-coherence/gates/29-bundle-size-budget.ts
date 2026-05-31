/**
 * Gate 29 — bundle-size-budget.
 *
 * Coherence gate (deeper than the core 1–19 family): enforce per-component
 * bundle-size budgets declared on the manifest. The brief from Joangel was
 * "mantener coherencia entre todo, el theme, como se heredan cosas, props,
 * etc." — and bundle weight is one of the silent ways component-level
 * decisions go incoherent with the rest of the surface. A "small primitive"
 * that quietly grew 8× in three Olas should fail loudly, not slip in.
 *
 * Rule:
 *
 *   For every component manifest with a numeric `bundleSize` budget (bytes),
 *   measure the actual size of that component's source artifact and compare:
 *
 *     - actual > budget                 → MAJOR (over budget — must fix)
 *     - actual > budget * 0.9 (≥ 90%)   → MINOR (approaching limit — warn)
 *     - actual ≤ budget * 0.9           → pass
 *     - no budget declared              → INFO (suggest a budget — measure-only)
 *     - source file missing             → MAJOR (cannot enforce — fix manifest)
 *     - non-numeric / negative budget   → MAJOR (broken manifest)
 *
 *   Measurement modes (manifest `bundleSizeMode`):
 *     "raw"  — raw byte length of the source file (default)
 *     "gzip" — gzip-compressed byte length (closer to wire weight)
 *
 *   Source file resolution order:
 *     1. manifest.file          (preferred, explicit)
 *     2. manifest.source        (fallback — same field load-context uses)
 *     3. heuristic: <uiKitSrcDir>/<component>.tsx | <component>/index.tsx
 *
 *   Suggestion field is always actionable:
 *     - over budget    → "Component grew from X to Y bytes. Either trim
 *                        the implementation or raise the budget to Z bytes
 *                        (current + 15% headroom)."
 *     - no budget      → "Declare bundleSize: <ceil(actual * 1.15)> on the
 *                        manifest so future regressions trigger this gate."
 *
 * Programmatic API:
 *
 *     const gate = new BundleSizeBudgetGate();
 *     const result = await gate.run(ctx);
 *
 *     // measureSize(...) is pure — exposed for unit tests + tooling.
 *
 * CLI:
 *
 *     tsx scripts/audit-coherence/gates/29-bundle-size-budget.ts \
 *       [--repo <dir>] [--json] [--verbose]
 *
 * Exit codes:
 *   0 — every component with a declared budget is within range
 *   1 — at least one MAJOR finding (over budget, broken budget, missing file)
 */

import { gzipSync } from 'node:zlib';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import * as fs from 'fs-extra';
import * as pc from 'picocolors';

import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';
import {
  createLogger,
  loadAuditContext,
  type Logger,
} from '../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BundleSizeMode = 'raw' | 'gzip';

interface ManifestLike {
  component?: string;
  file?: string;
  source?: string;
  bundleSize?: unknown;
  bundleSizeMode?: unknown;
  [key: string]: unknown;
}

export interface MeasureSizeInput {
  /** Absolute path to the source file we will measure. */
  filePath: string;
  /** Measurement mode — defaults to "raw". */
  mode?: BundleSizeMode;
  /** Override fs reader (tests inject an in-memory map). */
  readFile?: (absPath: string) => Promise<Buffer>;
}

export interface MeasureSizeResult {
  /** Measured byte length (raw or gzip depending on mode). */
  bytes: number;
  /** Raw byte length, always reported for reference. */
  rawBytes: number;
  /** Gzip byte length, always reported for reference. */
  gzipBytes: number;
  /** Mode actually used (resolved with default). */
  mode: BundleSizeMode;
}

export interface BundleSizeBudgetGateOptions {
  /**
   * Override the file reader. Defaults to fs-extra. Tests inject this so
   * the gate can run against a fully in-memory fixture set.
   */
  readFile?: (absPath: string) => Promise<Buffer>;
  /**
   * Override pathExists. Defaults to fs-extra. Tests inject this so the
   * gate can answer "does this source file exist?" without touching disk.
   */
  pathExists?: (absPath: string) => Promise<boolean>;
}

const GATE_NAME = 'bundle-size-budget';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Normalise the manifest's `bundleSizeMode` field into a strict union.
 * Anything other than "gzip" collapses to "raw" so a typo never silently
 * changes the measurement mode.
 */
export function normaliseMode(input: unknown): BundleSizeMode {
  return input === 'gzip' ? 'gzip' : 'raw';
}

export type BudgetValidation =
  | { kind: 'ok'; budget: number }
  | { kind: 'missing' }
  | { kind: 'invalid'; raw: unknown };

/**
 * Validate a manifest's bundleSize value. Returns:
 *   - { kind: "ok", budget }     when it is a finite, positive integer (bytes)
 *   - { kind: "missing" }        when the field is undefined/null
 *   - { kind: "invalid", raw }   when it is the wrong shape (string, NaN,
 *                                negative, zero, fractional, etc.)
 */
export function validateBudget(input: unknown): BudgetValidation {
  if (input === undefined || input === null) return { kind: 'missing' };
  if (typeof input !== 'number') return { kind: 'invalid', raw: input };
  if (!Number.isFinite(input)) return { kind: 'invalid', raw: input };
  if (input <= 0) return { kind: 'invalid', raw: input };
  if (!Number.isInteger(input)) return { kind: 'invalid', raw: input };
  return { kind: 'ok', budget: input };
}

/**
 * Suggest a budget value for a component that does not yet declare one.
 * 15% headroom above current measured size, rounded up to the nearest 64
 * bytes so suggestions stay tidy and stable across re-runs of the audit.
 */
export function suggestBudgetBytes(measuredBytes: number): number {
  const withHeadroom = Math.ceil(measuredBytes * 1.15);
  const rounded = Math.ceil(withHeadroom / 64) * 64;
  return Math.max(rounded, 64);
}

/**
 * Resolve the source file we should measure for a given manifest.
 *
 * Priority:
 *   1. manifest.file        — explicit, preferred
 *   2. manifest.source      — fallback, same field load-context sets
 *   3. heuristic            — <uiKitSrcDir>/<component>.tsx,
 *                             <uiKitSrcDir>/<component>/index.tsx,
 *                             <uiKitSrcDir>/<component>.ts
 *
 * Returned paths are absolute and may not exist; the caller must check
 * existence and emit a finding when nothing resolves.
 */
export function resolveSourceCandidates(
  manifest: ManifestLike,
  uiKitSrcDir: string,
): string[] {
  const out: string[] = [];
  const push = (p: string | undefined) => {
    if (!p) return;
    const abs = path.isAbsolute(p) ? p : path.resolve(uiKitSrcDir, p);
    if (!out.includes(abs)) out.push(abs);
  };
  push(typeof manifest.file === 'string' ? manifest.file : undefined);
  push(typeof manifest.source === 'string' ? manifest.source : undefined);
  if (typeof manifest.component === 'string' && manifest.component.length > 0) {
    const c = manifest.component;
    push(path.join(uiKitSrcDir, `${c}.tsx`));
    push(path.join(uiKitSrcDir, c, 'index.tsx'));
    push(path.join(uiKitSrcDir, `${c}.ts`));
    push(path.join(uiKitSrcDir, c, 'index.ts'));
  }
  return out;
}

/**
 * Format a byte count in a human-friendly way for messages/suggestions.
 * Keeps two decimals for kB/MB, integer for bytes. Pure — no IO.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return `${bytes}B`;
  if (bytes < 1024) return `${bytes}B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)}kB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)}MB`;
}

// ---------------------------------------------------------------------------
// Measurement (pure, with injectable reader)
// ---------------------------------------------------------------------------

const defaultReadFile = async (absPath: string): Promise<Buffer> =>
  fs.readFile(absPath);

export async function measureSize(
  input: MeasureSizeInput,
): Promise<MeasureSizeResult> {
  const reader = input.readFile ?? defaultReadFile;
  const mode = normaliseMode(input.mode);
  const buf = await reader(input.filePath);
  const rawBytes = buf.byteLength;
  // gzipSync handles Buffer directly; we always compute gzip so the report
  // can suggest a tighter budget even when raw mode is the default.
  const gzipBytes = gzipSync(buf).byteLength;
  const bytes = mode === 'gzip' ? gzipBytes : rawBytes;
  return { bytes, rawBytes, gzipBytes, mode };
}

// ---------------------------------------------------------------------------
// Per-finding pure builders (kept separate so tests can assert the exact
// shape of each kind of finding without spinning up a full Gate.run()).
// ---------------------------------------------------------------------------

export type BudgetFindingInput =
  | {
      kind: 'over-budget';
      component: string;
      file: string;
      mode: BundleSizeMode;
      budget: number;
      actual: number;
      rawBytes: number;
      gzipBytes: number;
    }
  | {
      kind: 'approaching-limit';
      component: string;
      file: string;
      mode: BundleSizeMode;
      budget: number;
      actual: number;
      ratio: number; // actual / budget, in [0.9, 1]
    }
  | {
      kind: 'no-budget';
      component: string;
      file: string;
      mode: BundleSizeMode;
      actual: number;
      rawBytes: number;
      gzipBytes: number;
    }
  | {
      kind: 'invalid-budget';
      component: string;
      file?: string;
      raw: unknown;
    }
  | {
      kind: 'missing-source';
      component: string;
      tried: string[];
    };

export function buildFinding(input: BudgetFindingInput): GateFinding {
  switch (input.kind) {
    case 'over-budget': {
      const overBy = input.actual - input.budget;
      const overPct = (overBy / input.budget) * 100;
      const suggested = suggestBudgetBytes(input.actual);
      return {
        severity: 'major',
        file: input.file,
        component: input.component,
        message: `Component "${input.component}" is over its ${input.mode} bundle-size budget: ${formatBytes(input.actual)} > ${formatBytes(input.budget)} (over by ${formatBytes(overBy)}, +${overPct.toFixed(1)}%). raw=${formatBytes(input.rawBytes)}, gzip=${formatBytes(input.gzipBytes)}.`,
        suggestion: `Trim the implementation back under ${formatBytes(input.budget)} (split sub-components, drop dead imports, lazy-load heavy deps), OR explicitly raise the manifest budget to bundleSize: ${suggested} (current + 15% headroom, rounded). Do not silently bump the budget without a CHANGELOG note.`,
      };
    }
    case 'approaching-limit': {
      const headroom = input.budget - input.actual;
      const pct = input.ratio * 100;
      return {
        severity: 'minor',
        file: input.file,
        component: input.component,
        message: `Component "${input.component}" is at ${pct.toFixed(1)}% of its ${input.mode} bundle-size budget (${formatBytes(input.actual)} / ${formatBytes(input.budget)}, only ${formatBytes(headroom)} headroom left).`,
        suggestion: `Either trim ${formatBytes(headroom)} of weight before the next addition pushes this over, or plan a budget increase with a CHANGELOG entry.`,
      };
    }
    case 'no-budget': {
      const suggested = suggestBudgetBytes(input.actual);
      return {
        severity: 'info',
        file: input.file,
        component: input.component,
        message: `Component "${input.component}" has no bundleSize budget declared. Measured ${formatBytes(input.actual)} (${input.mode}). raw=${formatBytes(input.rawBytes)}, gzip=${formatBytes(input.gzipBytes)}.`,
        suggestion: `Add bundleSize: ${suggested} to the manifest (and optionally bundleSizeMode: "${input.mode}") so future regressions trigger this gate. Suggested value is current + 15%, rounded up to the nearest 64B.`,
      };
    }
    case 'invalid-budget': {
      return {
        severity: 'major',
        file: input.file,
        component: input.component,
        message: `Component "${input.component}" has an invalid bundleSize value: ${JSON.stringify(input.raw)} — expected a positive integer byte count.`,
        suggestion: `Set bundleSize to a positive integer (bytes), e.g. bundleSize: 4096. Strings, floats, NaN, and non-positive numbers are rejected to keep the budget unambiguous.`,
      };
    }
    case 'missing-source': {
      const triedList = input.tried.length > 0 ? input.tried.join(', ') : '(none)';
      return {
        severity: 'major',
        component: input.component,
        message: `Component "${input.component}" declares (or would inherit) a bundle-size budget but no source file was found. Tried: ${triedList}.`,
        suggestion: `Set manifest.file to an existing source path (relative to packages/ui-kit/src), or remove the bundleSize budget if the component no longer exists.`,
      };
    }
    default: {
      const _exhaustive: never = input;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export class BundleSizeBudgetGate extends Gate {
  readonly id = 29;
  readonly name = GATE_NAME;
  readonly description =
    'For each component manifest: if bundleSize budget declared, measure source size and fail (major) when actual > budget; minor when actual ≥ 90% of budget; info (with suggested budget) when no budget declared.';

  private readonly readFileImpl: (absPath: string) => Promise<Buffer>;
  private readonly pathExistsImpl: (absPath: string) => Promise<boolean>;

  constructor(options: BundleSizeBudgetGateOptions = {}) {
    super();
    this.readFileImpl = options.readFile ?? defaultReadFile;
    this.pathExistsImpl =
      options.pathExists ?? ((p) => fs.pathExists(p));
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    const manifests = ctx.manifests as ManifestLike[];
    if (manifests.length === 0) {
      ctx.logger.debug(
        `${GATE_NAME}: no manifests in context — gate passes vacuously`,
      );
      return gateOk(this.name, Date.now() - started);
    }

    for (const manifest of manifests) {
      const component =
        typeof manifest.component === 'string' && manifest.component.length > 0
          ? manifest.component
          : '<unknown>';

      const validation = validateBudget(manifest.bundleSize);

      // Resolve source candidates first — we need it for both the measure
      // path and the suggestion-on-missing-budget path.
      const candidates = resolveSourceCandidates(manifest, ctx.uiKitSrcDir);
      let resolvedFile: string | null = null;
      for (const cand of candidates) {
        if (await this.pathExistsImpl(cand)) {
          resolvedFile = cand;
          break;
        }
      }

      if (validation.kind === 'invalid') {
        findings.push(
          buildFinding({
            kind: 'invalid-budget',
            component,
            file: resolvedFile ?? undefined,
            raw: validation.raw,
          }),
        );
        continue;
      }

      if (resolvedFile === null) {
        // Only emit missing-source for manifests where we actually have to
        // measure something (budget declared or we want to emit an INFO).
        // Skipping when budget is missing keeps non-component manifest
        // records (e.g. token-only records) from spamming the report.
        if (validation.kind === 'ok') {
          findings.push(
            buildFinding({
              kind: 'missing-source',
              component,
              tried: candidates.map((c) => path.relative(ctx.repoRoot, c)),
            }),
          );
        } else {
          ctx.logger.debug(
            `${GATE_NAME}: ${component} has no budget and no resolvable source — skipping silently`,
          );
        }
        continue;
      }

      const mode = normaliseMode(manifest.bundleSizeMode);
      let measurement: MeasureSizeResult;
      try {
        measurement = await measureSize({
          filePath: resolvedFile,
          mode,
          readFile: this.readFileImpl,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        findings.push({
          severity: 'major',
          file: resolvedFile,
          component,
          message: `Failed to measure source size for "${component}": ${message}.`,
          suggestion:
            'Confirm the source file is readable and is not a broken symlink or directory.',
        });
        continue;
      }

      const relFile = path.relative(ctx.repoRoot, resolvedFile);

      if (validation.kind === 'missing') {
        findings.push(
          buildFinding({
            kind: 'no-budget',
            component,
            file: relFile,
            mode,
            actual: measurement.bytes,
            rawBytes: measurement.rawBytes,
            gzipBytes: measurement.gzipBytes,
          }),
        );
        continue;
      }

      // validation.kind === 'ok' → enforce budget
      const budget = validation.budget;
      const actual = measurement.bytes;

      if (actual > budget) {
        findings.push(
          buildFinding({
            kind: 'over-budget',
            component,
            file: relFile,
            mode,
            budget,
            actual,
            rawBytes: measurement.rawBytes,
            gzipBytes: measurement.gzipBytes,
          }),
        );
        continue;
      }

      const ratio = actual / budget;
      if (ratio >= 0.9) {
        findings.push(
          buildFinding({
            kind: 'approaching-limit',
            component,
            file: relFile,
            mode,
            budget,
            actual,
            ratio,
          }),
        );
        continue;
      }

      ctx.logger.debug(
        `${GATE_NAME}: ${component} ${formatBytes(actual)} / ${formatBytes(budget)} (${(ratio * 100).toFixed(1)}%) — under budget`,
      );
    }

    if (findings.length === 0) {
      return gateOk(this.name, Date.now() - started);
    }
    return gateFail(this.name, findings, Date.now() - started);
  }
}

const gate = new BundleSizeBudgetGate();
export default gate;

// ---------------------------------------------------------------------------
// CLI wrapper
// ---------------------------------------------------------------------------

interface CliOptions {
  root: string;
  json: boolean;
  verbose: boolean;
}

function parseCliArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    root: process.cwd(),
    json: false,
    verbose: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--repo' || arg === '--root' || arg === '-r') {
      const next = argv[i + 1];
      if (!next) throw new Error(`${arg} requires a value`);
      opts.root = path.resolve(next);
      i++;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--verbose' || arg === '-v') {
      opts.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        [
          'Usage: tsx scripts/audit-coherence/gates/29-bundle-size-budget.ts [options]',
          '',
          'Options:',
          '  --repo, -r <dir>   Repo root to audit (default: cwd)',
          '  --json             Emit JSON GateResult on stdout',
          '  --verbose, -v      Enable debug logging on stderr',
          '  --help, -h         Show this help',
          '',
        ].join('\n'),
      );
      process.exit(0);
    }
  }
  return opts;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return pathToFileURL(entry).href === import.meta.url;
  } catch {
    return false;
  }
}

async function cliMain(argv: string[], logger?: Logger): Promise<number> {
  const opts = parseCliArgs(argv);
  const log = logger ?? createLogger(opts.verbose);
  const ctx = await loadAuditContext(opts.root, { logger: log });
  const result = await new BundleSizeBudgetGate().run(ctx);

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const badge = result.passed ? pc.green('PASS') : pc.red('FAIL');
    process.stdout.write(
      `${badge} ${result.name} (${result.duration_ms}ms) — ${result.findings.length} finding(s)\n`,
    );
    for (const f of result.findings) {
      const who = f.component ? ` [${f.component}]` : '';
      const where = f.file ? ` ${f.file}` : '';
      process.stdout.write(
        `  - ${pc.yellow(f.severity)}${who}${where}: ${f.message}\n`,
      );
      if (f.suggestion) {
        process.stdout.write(`      ${pc.dim('-> ' + f.suggestion)}\n`);
      }
    }
  }
  return result.passed ? 0 : 1;
}

if (isMainModule()) {
  cliMain(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((err) => {
      const message = err instanceof Error ? err.stack ?? err.message : String(err);
      process.stderr.write(`fatal: ${message}\n`);
      process.exit(1);
    });
}
