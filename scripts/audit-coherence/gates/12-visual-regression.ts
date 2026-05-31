/**
 * 12-visual-regression — Per-example visual regression gate.
 *
 * For each example surfaced by the component manifests, this gate takes a
 * Playwright screenshot of the rendered example and diffs it against the
 * baseline PNG stored at:
 *
 *   docs/coherence-snapshots/<component>-<example>.snapshot.png
 *
 * Findings:
 *   - If diff ratio > 0.1% (> 0.001 of the pixels)  -> `major` finding.
 *   - If the baseline does NOT exist yet            -> `info` log + PASS.
 *     (Ola 4c.1 bootstrap: no baselines have been captured yet. Once the
 *     `audit:coherence:snapshot` script is run, baselines materialize and
 *     this gate starts enforcing.)
 *
 * Programmatic API:
 *   const gate = new VisualRegressionGate({ screenshotter, differ });
 *   const result = await gate.run(ctx);
 *
 * CLI (thin wrapper):
 *   tsx scripts/audit-coherence/gates/12-visual-regression.ts [--root <dir>] [--json]
 *
 * Exit codes:
 *   0 — all examples within tolerance (or no baselines yet)
 *   1 — at least one example regressed beyond the 0.1% threshold
 *
 * Safety: read-only against the repo. The screenshotter implementation is
 * injected, so unit tests can stub it without spawning a real browser.
 */

import * as path from 'node:path';
import { performance } from 'node:perf_hooks';
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
} from '../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Snapshot directory, relative to repoRoot. */
export const SNAPSHOT_DIR_REL = 'docs/coherence-snapshots';

/**
 * Maximum tolerated fraction of differing pixels. 0.001 = 0.1%.
 * Anything strictly greater than this is flagged as a `major` regression.
 */
export const DIFF_THRESHOLD = 0.001;

const GATE_NAME = 'visual-regression';

// ---------------------------------------------------------------------------
// Manifest example shape (mirrors gate 10)
// ---------------------------------------------------------------------------

interface RawExampleLike {
  id?: unknown;
  label?: unknown;
  Component?: unknown;
}

interface ManifestLike {
  component: string;
  file?: string;
  examples?: unknown;
}

interface NormalizedExample {
  index: number;
  id: string;
  label: string;
  hasComponent: boolean;
}

function normalizeExamples(examples: unknown): NormalizedExample[] {
  if (!Array.isArray(examples)) return [];
  return examples.map((raw, index): NormalizedExample => {
    const ex = (raw ?? {}) as RawExampleLike;
    const id =
      typeof ex.id === 'string' && ex.id.length > 0 ? ex.id : `example-${index}`;
    const label =
      typeof ex.label === 'string' && ex.label.length > 0 ? ex.label : id;
    const hasComponent = typeof ex.Component === 'function';
    return { index, id, label, hasComponent };
  });
}

function manifestExamples(manifest: ManifestLike): NormalizedExample[] {
  const direct = normalizeExamples(manifest.examples);
  if (direct.length > 0) return direct;
  const recordExamples = (manifest as unknown as { props?: unknown }).props;
  if (
    recordExamples &&
    typeof recordExamples === 'object' &&
    'examples' in (recordExamples as object)
  ) {
    return normalizeExamples((recordExamples as { examples?: unknown }).examples);
  }
  return [];
}

// ---------------------------------------------------------------------------
// Snapshot identity / filesystem helpers
// ---------------------------------------------------------------------------

/**
 * Build the canonical snapshot file basename for a (component, example) pair.
 * Slug both sides — lowercase, only [a-z0-9-] — so spaces, slashes, or
 * non-ASCII labels never produce surprising paths on Windows or POSIX.
 */
export function snapshotBasename(component: string, exampleId: string): string {
  return `${slugify(component)}-${slugify(exampleId)}.snapshot.png`;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function snapshotAbsPath(
  repoRoot: string,
  component: string,
  exampleId: string,
): string {
  return path.join(
    repoRoot,
    SNAPSHOT_DIR_REL,
    snapshotBasename(component, exampleId),
  );
}

// ---------------------------------------------------------------------------
// Probes — injected for testability; defaults work without Playwright present.
// ---------------------------------------------------------------------------

export interface ScreenshotRequest {
  component: string;
  exampleId: string;
  exampleLabel: string;
  /** Absolute file the example originates from (manifest.file), if known. */
  file?: string;
  /** Repo root — useful if the screenshotter spawns a dev server. */
  repoRoot: string;
}

export interface ScreenshotResult {
  /** PNG bytes captured by the headless browser. */
  bytes: Buffer;
}

export interface Screenshotter {
  /**
   * Capture a PNG of the rendered example. Implementations SHOULD throw
   * when they cannot capture (browser not installed, example failed to
   * mount, etc.) so the gate can report a structured finding.
   */
  capture(req: ScreenshotRequest): Promise<ScreenshotResult>;
}

export interface DiffRequest {
  baseline: Buffer;
  candidate: Buffer;
}

export interface DiffResult {
  /**
   * Fraction of pixels (0..1) that differ between baseline and candidate.
   * Implementations that cannot pixel-diff (e.g. mismatched dimensions)
   * MAY return 1 to signal a total regression.
   */
  ratio: number;
  /** Optional human note (e.g. "dimensions changed 800x600 -> 810x600"). */
  note?: string;
}

export interface ImageDiffer {
  diff(req: DiffRequest): Promise<DiffResult>;
}

/**
 * Default screenshotter — refuses to run silently. Real screenshotting needs
 * Playwright + a dev server, both of which are wired up in a separate
 * `audit:coherence:snapshot` script. From the gate's perspective: if no
 * screenshotter is injected and no baselines exist, we treat it as the Ola
 * 4c.1 bootstrap case (info + pass). If baselines DO exist but we have no
 * way to capture a candidate, we surface a single `minor` finding so the
 * audit log explains why we couldn't enforce.
 */
export const noopScreenshotter: Screenshotter = {
  capture(): Promise<ScreenshotResult> {
    return Promise.reject(
      new Error(
        'no screenshotter configured — pass one via VisualRegressionGate({ screenshotter })',
      ),
    );
  },
};

/**
 * Default differ — a deliberately conservative byte-level comparator.
 * Identical byte sequences => 0 (no diff). Different sizes / contents =>
 * the fraction of differing bytes, clamped to [0, 1]. This is intentionally
 * a coarse heuristic so the gate can still operate without pixelmatch/pngjs
 * installed. Real pixel diffing happens in the snapshotter script; this
 * differ exists so unit tests can wire deterministic ratios.
 */
export const defaultDiffer: ImageDiffer = {
  async diff({ baseline, candidate }: DiffRequest): Promise<DiffResult> {
    if (baseline.equals(candidate)) return { ratio: 0 };
    const longer = Math.max(baseline.length, candidate.length);
    const shorter = Math.min(baseline.length, candidate.length);
    if (longer === 0) return { ratio: 0 };
    let differing = longer - shorter; // size delta counts fully
    for (let i = 0; i < shorter; i++) {
      if (baseline[i] !== candidate[i]) differing++;
    }
    const ratio = Math.min(1, differing / longer);
    return {
      ratio,
      note:
        baseline.length === candidate.length
          ? undefined
          : `byte length changed ${baseline.length} -> ${candidate.length}`,
    };
  },
};

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export interface VisualRegressionGateOptions {
  /** Inject a screenshot capture mechanism (e.g. Playwright wrapper). */
  screenshotter?: Screenshotter;
  /** Inject an image differ (pixelmatch wrapper, byte differ, etc.). */
  differ?: ImageDiffer;
  /** Override the diff ratio threshold. Defaults to {@link DIFF_THRESHOLD}. */
  threshold?: number;
  /**
   * Override existence check + read. Tests use this to feed in synthetic
   * baselines without touching the real filesystem.
   */
  readBaseline?: (absPath: string) => Promise<Buffer | null>;
}

interface VisitedExample {
  manifestFile?: string;
  component: string;
  example: NormalizedExample;
  baselinePath: string;
}

export class VisualRegressionGate extends Gate {
  readonly id = 12;
  readonly name = GATE_NAME;
  readonly description =
    'For each example, take a Playwright screenshot and diff against baseline at docs/coherence-snapshots/<component>-<example>.snapshot.png. Major if diff > 0.1%. In Ola 4c.1, if NO baseline exists yet, the gate logs info "no baseline yet" and passes.';

  private readonly screenshotter: Screenshotter;
  private readonly differ: ImageDiffer;
  private readonly threshold: number;
  private readonly readBaselineImpl: (absPath: string) => Promise<Buffer | null>;

  constructor(options: VisualRegressionGateOptions = {}) {
    super();
    this.screenshotter = options.screenshotter ?? noopScreenshotter;
    this.differ = options.differ ?? defaultDiffer;
    this.threshold = options.threshold ?? DIFF_THRESHOLD;
    this.readBaselineImpl = options.readBaseline ?? defaultReadBaseline;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = performance.now();
    const findings: GateFinding[] = [];

    const manifests = ctx.manifests as unknown as ManifestLike[];
    const examples = this.collectExamples(ctx, manifests);

    if (examples.length === 0) {
      ctx.logger.debug(
        'visual-regression: no examples in any manifest — gate passes vacuously',
      );
      return gateOk(this.name, Math.round(performance.now() - started));
    }

    let baselinesFound = 0;
    let baselinesMissing = 0;
    let regressions = 0;

    for (const visited of examples) {
      const { component, example, baselinePath, manifestFile } = visited;

      if (!example.hasComponent) {
        ctx.logger.debug(
          `visual-regression: ${component}/${example.id} has no Component — skipping (gate 10 will flag).`,
        );
        continue;
      }

      const baseline = await this.safeReadBaseline(baselinePath, ctx, findings, {
        component,
        example,
        file: manifestFile,
      });
      if (baseline === undefined) continue; // hard error already recorded
      if (baseline === null) {
        baselinesMissing++;
        ctx.logger.info(
          `visual-regression: no baseline yet for ${component}/${example.id} (expected ${toPosix(
            path.relative(ctx.repoRoot, baselinePath),
          )})`,
        );
        continue;
      }

      baselinesFound++;

      let captured: ScreenshotResult;
      try {
        captured = await this.screenshotter.capture({
          component,
          exampleId: example.id,
          exampleLabel: example.label,
          file: manifestFile,
          repoRoot: ctx.repoRoot,
        });
      } catch (err) {
        const msg = describeError(err);
        findings.push({
          severity: 'minor',
          file: manifestFile,
          component,
          message: `Failed to capture screenshot for example "${example.id}" (${example.label}): ${msg}`,
          suggestion:
            'Install Playwright and run `npm run audit:coherence:snapshot` to (re)capture baselines, or pass a custom screenshotter to the gate.',
        });
        continue;
      }

      let diff: DiffResult;
      try {
        diff = await this.differ.diff({
          baseline,
          candidate: captured.bytes,
        });
      } catch (err) {
        const msg = describeError(err);
        findings.push({
          severity: 'minor',
          file: manifestFile,
          component,
          message: `Failed to diff screenshot for example "${example.id}" (${example.label}): ${msg}`,
          suggestion:
            'Check that the candidate PNG is well-formed and that pixelmatch/pngjs (or the configured differ) is installed.',
        });
        continue;
      }

      const pct = (diff.ratio * 100).toFixed(3);
      if (diff.ratio > this.threshold) {
        regressions++;
        const noteTail = diff.note ? ` (${diff.note})` : '';
        findings.push({
          severity: 'major',
          file: manifestFile,
          component,
          message: `Visual regression on example "${example.id}" (${example.label}): ${pct}% pixels differ (threshold ${(
            this.threshold * 100
          ).toFixed(3)}%)${noteTail}.`,
          suggestion: `Review the change. If intentional, refresh the baseline at ${toPosix(
            path.relative(ctx.repoRoot, baselinePath),
          )} via \`npm run audit:coherence:snapshot -- --component ${component} --example ${example.id}\`.`,
        });
      } else {
        ctx.logger.debug(
          `visual-regression: ${component}/${example.id} within tolerance (${pct}% <= ${(
            this.threshold * 100
          ).toFixed(3)}%)`,
        );
      }
    }

    const duration_ms = Math.round(performance.now() - started);
    ctx.logger.debug(
      `visual-regression: ${examples.length} example(s); ${baselinesFound} baselines present, ${baselinesMissing} missing, ${regressions} regression(s) in ${duration_ms}ms`,
    );

    if (findings.length === 0) {
      return gateOk(this.name, duration_ms);
    }
    return gateFail(this.name, findings, duration_ms);
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  private collectExamples(
    ctx: AuditContext,
    manifests: ManifestLike[],
  ): VisitedExample[] {
    const out: VisitedExample[] = [];
    for (const manifest of manifests) {
      const component =
        typeof manifest.component === 'string' && manifest.component.length > 0
          ? manifest.component
          : '<unknown>';
      const examples = manifestExamples(manifest);
      for (const example of examples) {
        out.push({
          manifestFile: typeof manifest.file === 'string' ? manifest.file : undefined,
          component,
          example,
          baselinePath: snapshotAbsPath(ctx.repoRoot, component, example.id),
        });
      }
    }
    return out;
  }

  private async safeReadBaseline(
    baselinePath: string,
    ctx: AuditContext,
    findings: GateFinding[],
    where: { component: string; example: NormalizedExample; file?: string },
  ): Promise<Buffer | null | undefined> {
    try {
      return await this.readBaselineImpl(baselinePath);
    } catch (err) {
      const msg = describeError(err);
      findings.push({
        severity: 'minor',
        file: where.file,
        component: where.component,
        message: `Failed to read baseline for "${where.example.id}" at ${toPosix(
          path.relative(ctx.repoRoot, baselinePath),
        )}: ${msg}`,
        suggestion:
          'Ensure the baseline file is committed and readable. Regenerate with `npm run audit:coherence:snapshot` if needed.',
      });
      return undefined;
    }
  }
}

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------

async function defaultReadBaseline(absPath: string): Promise<Buffer | null> {
  if (!(await fs.pathExists(absPath))) return null;
  const buf = await fs.readFile(absPath);
  return buf;
}

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function describeError(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

// ---------------------------------------------------------------------------
// CLI wrapper
// ---------------------------------------------------------------------------

interface CliOptions {
  root: string;
  json: boolean;
  quiet: boolean;
}

function parseCliArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { root: process.cwd(), json: false, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--root' || arg === '-r') {
      const next = argv[i + 1];
      if (!next) throw new Error('--root requires a value');
      opts.root = path.resolve(next);
      i++;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--quiet' || arg === '-q') {
      opts.quiet = true;
    } else if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        [
          'Usage: tsx scripts/audit-coherence/gates/12-visual-regression.ts [options]',
          '',
          'Options:',
          '  --root, -r <dir>   Repo root to audit (default: cwd)',
          '  --json             Emit JSON GateResult on stdout',
          '  --quiet, -q        Suppress non-JSON log output',
          '  --help, -h         Show this help',
          '',
        ].join('\n'),
      );
      process.exit(0);
    }
  }
  return opts;
}

async function cliMain(argv: string[]): Promise<number> {
  const opts = parseCliArgs(argv);
  const logger = createLogger(!opts.quiet);
  const ctx = await loadAuditContext(opts.root, { logger });
  const gate = new VisualRegressionGate();
  const result = await gate.run(ctx);
  if (opts.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (!opts.quiet) {
    const badge = result.passed ? pc.green('PASS') : pc.red('FAIL');
    process.stdout.write(`${badge} ${result.name} (${result.duration_ms}ms)\n`);
    for (const f of result.findings) {
      process.stdout.write(
        `  ${pc.yellow(f.severity)} ${f.component ?? '?'} ${f.file ?? ''}\n    ${f.message}\n`,
      );
      if (f.suggestion) {
        process.stdout.write(`    ${pc.dim('-> ' + f.suggestion)}\n`);
      }
    }
  }
  return result.passed ? 0 : 1;
}

const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) {
  cliMain(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((err) => {
      process.stderr.write(
        `visual-regression failed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`,
      );
      process.exit(1);
    });
}

export default VisualRegressionGate;
