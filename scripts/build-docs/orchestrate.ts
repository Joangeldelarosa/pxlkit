/**
 * orchestrate — top-level docs build pipeline.
 *
 * Runs every Generator in DAG order, sharing a single GeneratorContext so
 * downstream steps (registry, readme, showcase, …) reuse the manifests
 * discovered by `scan-manifests`. Generators only contribute writes; the
 * orchestrator is responsible for flushing them to disk (atomic per file).
 *
 * CLI:
 *   tsx scripts/build-docs/orchestrate.ts [--only=name1,name2] [--watch]
 *                                         [--quiet] [--json] [--root <dir>]
 *                                         [--dry-run]
 *
 * Exit codes:
 *   0 — every selected step completed successfully
 *   1 — one or more steps failed (or invalid CLI args)
 *
 * Safety:
 *   - read-only on packages/ui-kit/src/*.tsx (component impls)
 *   - read-only on packages/ui-kit/src/__tests__/*
 *   - read-only on apps/web/*  (the docs site rewrites generated section
 *     modules, but each individual generator already enforces its own
 *     output-path allowlist — we just trust those guards here)
 *   - never overwrites hand-authored files; every generator emits to a
 *     `.generated.*` (or sibling `_generated/`) location
 */

import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "fs-extra";
import fg from "fast-glob";
import pc from "picocolors";

import {
  Generator,
  writeOutput,
  type GeneratorContext,
  type GeneratorResult,
  type GeneratorWrite,
  type ManifestRecord,
} from "./_lib/generator-base.js";
import { createLogger, type Logger } from "./_lib/logger.js";
import { ScanManifestsGenerator } from "./scan-manifests.js";
import {
  ExtractBundleSizeGenerator,
  DEFAULT_OUT_RELATIVE as EXTRACT_BUNDLE_DEFAULT_OUT,
} from "./extract-bundle-size.js";
import { GenerateRegistryGenerator } from "./generate-registry.js";
import { GenerateStoriesGenerator } from "./generate-stories.js";
import { GenerateShowcaseGenerator } from "./generate-showcase.js";
import { GenerateDocsPageGenerator } from "./generate-docs-page.js";
import { GenerateReadmePackageGenerator } from "./generate-readme-package.js";
import { GenerateRootReadmeGenerator } from "./generate-root-readme.js";
import { ChangelogGenerator } from "./generate-changelog.js";
import { GenerateOgImagesGenerator } from "./generate-og-images.js";
import { GenerateMetadataGenerator } from "./generate-metadata.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface OrchestrateStepResult {
  name: string;
  status: "ok" | "failed" | "skipped";
  durationMs: number;
  writeCount: number;
  error?: string;
}

export interface OrchestrateResult {
  ok: boolean;
  durationMs: number;
  manifestCount: number;
  steps: OrchestrateStepResult[];
  writtenFiles: string[];
}

export interface OrchestrateOptions {
  /** Repo root. Defaults to process.cwd(). */
  repoRoot?: string;
  /** Optional allow-list of step names. `scan` always runs. */
  only?: string[];
  /** Plan writes but skip flushing to disk. */
  dryRun?: boolean;
  /** Suppress per-step info logs. Errors still print. */
  quiet?: boolean;
  /** Custom logger (replaces `quiet` if supplied). */
  logger?: Logger;
  /**
   * Override the pipeline. Mostly for tests; production callers should leave
   * this undefined so the canonical `defaultPipelineSteps(repoRoot)` runs.
   */
  steps?: StepDescriptor[];
}

// ---------------------------------------------------------------------------
// Step registry — declarative DAG. `scan` is implicit and always runs first.
// Each entry maps a CLI name to a Generator factory; ordering here is the
// execution order. Generators *may* be parallelized in the future, but for
// now we run them sequentially for deterministic logs.
// ---------------------------------------------------------------------------

export type GeneratorFactory = () => Generator;

export interface StepDescriptor {
  name: string;
  factory: GeneratorFactory;
  /** Optional: when true, failure aborts the pipeline. Defaults to true. */
  required?: boolean;
}

/** Default output roots resolved relative to repoRoot. */
function defaultOutRoots(repoRoot: string): {
  docsPage: string;
  ogImages: string;
  metadata: string;
  bundleSizes: string;
} {
  return {
    docsPage: path.join(repoRoot, "apps/web/src/app/docs/sections"),
    ogImages: path.join(repoRoot, "apps/web/public/og"),
    metadata: path.join(repoRoot, "apps/web/src/app/ui-kit"),
    bundleSizes: path.join(repoRoot, EXTRACT_BUNDLE_DEFAULT_OUT),
  };
}

/**
 * Build the canonical pipeline for a given repo root. Generators that need
 * a configured output directory get one derived from `repoRoot`; everything
 * else uses its own internal defaults.
 */
export function defaultPipelineSteps(repoRoot: string): StepDescriptor[] {
  const out = defaultOutRoots(repoRoot);
  return [
    { name: "scan", factory: () => new ScanManifestsGenerator(), required: true },
    // extract-bundle measures gzipped per-component bundle size. Optional —
    // it spawns esbuild and depends on the target package being installed, so
    // a failure here must not abort the rest of the docs pipeline.
    {
      name: "extract-bundle",
      factory: () => new ExtractBundleSizeGenerator(out.bundleSizes),
      required: false,
    },
    { name: "generate-registry", factory: () => new GenerateRegistryGenerator() },
    { name: "generate-stories", factory: () => new GenerateStoriesGenerator() },
    { name: "generate-showcase", factory: () => new GenerateShowcaseGenerator() },
    { name: "generate-docs-page", factory: () => new GenerateDocsPageGenerator(out.docsPage) },
    { name: "generate-readme-package", factory: () => new GenerateReadmePackageGenerator() },
    { name: "generate-readme-root", factory: () => new GenerateRootReadmeGenerator() },
    { name: "generate-changelog", factory: () => new ChangelogGenerator() },
    { name: "generate-og-images", factory: () => new GenerateOgImagesGenerator(out.ogImages) },
    { name: "generate-metadata", factory: () => new GenerateMetadataGenerator(out.metadata) },
  ];
}

/**
 * Static reference pipeline (uses `process.cwd()` for output roots). Useful
 * for tests that want to inspect step names/order without standing up a repo.
 * For execution, prefer `defaultPipelineSteps(repoRoot)` (called automatically
 * by `orchestrate()`).
 */
export const PIPELINE_STEPS: StepDescriptor[] = defaultPipelineSteps(process.cwd());

/** Canonical alias map so `--only=registry` works in addition to `--only=generate-registry`. */
const STEP_ALIASES: Record<string, string> = {
  bundle: "extract-bundle",
  "extract-bundle-size": "extract-bundle",
  registry: "generate-registry",
  stories: "generate-stories",
  showcase: "generate-showcase",
  "docs-page": "generate-docs-page",
  docs: "generate-docs-page",
  "readme-package": "generate-readme-package",
  readme: "generate-readme-package",
  "readme-root": "generate-readme-root",
  changelog: "generate-changelog",
  "og-images": "generate-og-images",
  og: "generate-og-images",
  metadata: "generate-metadata",
};

class NoopGenerator extends Generator {
  override name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
  override async run(): Promise<GeneratorResult> {
    return { writes: [] };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function createSilentLogger(): Logger {
  return {
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
    success: () => undefined,
    table: () => undefined,
  };
}

function resolveStepName(input: string): string {
  return STEP_ALIASES[input] ?? input;
}

/** Resolves which steps to run, preserving DAG order. `scan` is always included. */
export function resolveSelectedSteps(
  only: string[] | undefined,
  steps: StepDescriptor[] = PIPELINE_STEPS,
): StepDescriptor[] {
  if (!only || only.length === 0) return steps;
  const wanted = new Set<string>(only.map(resolveStepName));
  // scan is always required
  wanted.add("scan");
  return steps.filter((s) => wanted.has(s.name));
}

async function flushWrites(
  writes: GeneratorWrite[],
  ctx: GeneratorContext,
  dryRun: boolean,
): Promise<string[]> {
  if (dryRun) {
    for (const w of writes) ctx.outputs.set(w.path, w.content);
    return writes.map((w) => toPosix(w.path));
  }
  const written: string[] = [];
  for (const w of writes) {
    await writeOutput(w.path, w.content);
    ctx.outputs.set(w.path, w.content);
    written.push(toPosix(w.path));
  }
  return written;
}

async function runStep(
  step: StepDescriptor,
  ctx: GeneratorContext,
  options: { dryRun: boolean; logger: Logger },
): Promise<{ result: OrchestrateStepResult; writes: string[] }> {
  const { dryRun, logger } = options;
  const generator = step.factory();
  const start = Date.now();
  logger.info(`→ ${step.name}`);
  try {
    const out = await generator.run(ctx);
    const written = await flushWrites(out.writes, ctx, dryRun);
    const durationMs = Date.now() - start;
    if (out.writes.length === 0 && step.name === "extract-bundle") {
      logger.warn(`  ${step.name}: skipped (no generator wired)`);
      return {
        result: { name: step.name, status: "skipped", durationMs, writeCount: 0 },
        writes: [],
      };
    }
    logger.success(`  ${step.name}: ${out.writes.length} write(s) in ${durationMs}ms`);
    return {
      result: {
        name: step.name,
        status: "ok",
        durationMs,
        writeCount: out.writes.length,
      },
      writes: written,
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = (err as Error).message;
    logger.error(`  ${step.name}: failed — ${message}`);
    return {
      result: {
        name: step.name,
        status: "failed",
        durationMs,
        writeCount: 0,
        error: message,
      },
      writes: [],
    };
  }
}

// ---------------------------------------------------------------------------
// Programmatic API
// ---------------------------------------------------------------------------

/**
 * Run every selected generator in DAG order and return a structured report.
 * Throws only on programmer errors (bad inputs); individual step failures
 * surface via `result.steps[i].status === "failed"` and `result.ok === false`.
 */
export async function orchestrate(
  options: OrchestrateOptions = {},
): Promise<OrchestrateResult> {
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd());
  const logger =
    options.logger ?? (options.quiet ? createSilentLogger() : createLogger("orchestrate"));
  const dryRun = options.dryRun ?? false;

  const ctx: GeneratorContext = {
    repoRoot,
    manifests: [] as ManifestRecord[],
    outputs: new Map<string, string>(),
    logger,
  };

  const pipeline = options.steps ?? defaultPipelineSteps(repoRoot);
  const selected = resolveSelectedSteps(options.only, pipeline);
  const overallStart = Date.now();
  const steps: OrchestrateStepResult[] = [];
  const writtenFiles: string[] = [];
  let aborted = false;

  for (const step of selected) {
    if (aborted) {
      steps.push({
        name: step.name,
        status: "skipped",
        durationMs: 0,
        writeCount: 0,
      });
      continue;
    }
    const { result, writes } = await runStep(step, ctx, { dryRun, logger });
    steps.push(result);
    for (const w of writes) writtenFiles.push(w);
    if (result.status === "failed" && (step.required ?? true)) {
      aborted = true;
    }
  }

  const durationMs = Date.now() - overallStart;
  const ok = steps.every((s) => s.status !== "failed");

  return {
    ok,
    durationMs,
    manifestCount: ctx.manifests.length,
    steps,
    writtenFiles,
  };
}

export default orchestrate;

// ---------------------------------------------------------------------------
// Watch mode — poll manifest sources at a fixed interval and re-run the
// pipeline whenever a *.manifest.ts or *.examples.tsx changes.
// Single-flight: a new run is queued only after the previous one finishes.
// ---------------------------------------------------------------------------

const WATCH_GLOB = [
  "packages/*/src/**/*.manifest.ts",
  "packages/*/src/**/*.examples.tsx",
];
const WATCH_IGNORE = ["**/node_modules/**", "**/dist/**"];

export interface WatchOptions extends OrchestrateOptions {
  /** Polling interval in ms. Defaults to 500. */
  intervalMs?: number;
  /** Bail after this many rebuilds (handy for tests). Omit for forever. */
  maxRebuilds?: number;
  /** Async hook fired after every pipeline run (for tests). */
  onCycle?: (result: OrchestrateResult) => void | Promise<void>;
}

interface FileFingerprint {
  size: number;
  mtimeMs: number;
}

async function snapshot(repoRoot: string): Promise<Map<string, FileFingerprint>> {
  const files = await fg(WATCH_GLOB, {
    cwd: repoRoot,
    absolute: true,
    ignore: WATCH_IGNORE,
    onlyFiles: true,
  });
  const map = new Map<string, FileFingerprint>();
  await Promise.all(
    files.map(async (f) => {
      try {
        const st = await fs.stat(f);
        map.set(toPosix(f), { size: st.size, mtimeMs: st.mtimeMs });
      } catch {
        // race with delete; just skip
      }
    }),
  );
  return map;
}

function snapshotsDiffer(
  a: Map<string, FileFingerprint>,
  b: Map<string, FileFingerprint>,
): boolean {
  if (a.size !== b.size) return true;
  for (const [k, v] of a) {
    const other = b.get(k);
    if (!other) return true;
    if (other.size !== v.size || other.mtimeMs !== v.mtimeMs) return true;
  }
  return false;
}

export async function watch(options: WatchOptions = {}): Promise<OrchestrateResult[]> {
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd());
  const logger =
    options.logger ?? (options.quiet ? createSilentLogger() : createLogger("orchestrate:watch"));
  const intervalMs = Math.max(50, options.intervalMs ?? 500);
  const maxRebuilds = options.maxRebuilds;
  const results: OrchestrateResult[] = [];

  logger.info(`watching ${WATCH_GLOB.join(", ")} (every ${intervalMs}ms)`);

  // Initial build
  let lastSnapshot = await snapshot(repoRoot);
  const first = await orchestrate({ ...options, logger });
  results.push(first);
  if (options.onCycle) await options.onCycle(first);

  if (maxRebuilds !== undefined && results.length - 1 >= maxRebuilds) {
    return results;
  }

  // Loop
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    const next = await snapshot(repoRoot);
    if (!snapshotsDiffer(lastSnapshot, next)) continue;
    lastSnapshot = next;
    logger.info("changes detected, rebuilding");
    const result = await orchestrate({ ...options, logger });
    results.push(result);
    if (options.onCycle) await options.onCycle(result);
    if (maxRebuilds !== undefined && results.length - 1 >= maxRebuilds) {
      return results;
    }
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface CliArgs {
  only?: string[];
  watch: boolean;
  quiet: boolean;
  json: boolean;
  dryRun: boolean;
  repoRoot?: string;
  help: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = { watch: false, quiet: false, json: false, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--watch") {
      out.watch = true;
    } else if (arg === "--quiet" || arg === "-q") {
      out.quiet = true;
    } else if (arg === "--json") {
      out.json = true;
    } else if (arg === "--dry-run") {
      out.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      out.help = true;
    } else if (arg.startsWith("--only=")) {
      const value = arg.slice("--only=".length);
      out.only = value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else if (arg === "--only") {
      const next = argv[++i];
      if (!next) throw new Error("--only requires a comma-separated list");
      out.only = next
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else if (arg === "--root") {
      const next = argv[++i];
      if (!next) throw new Error("--root requires a path");
      out.repoRoot = path.resolve(next);
    } else if (arg.startsWith("--root=")) {
      out.repoRoot = path.resolve(arg.slice("--root=".length));
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }
  return out;
}

function printHelp(): void {
  // eslint-disable-next-line no-console
  console.log(
    [
      "Usage: tsx scripts/build-docs/orchestrate.ts [options]",
      "",
      "Options:",
      "  --only=a,b,c    Run only the named steps (scan always runs).",
      "                  Aliases: registry, stories, showcase, docs, readme,",
      "                  readme-root, changelog, og, metadata.",
      "  --watch         Re-run the pipeline on manifest/example changes.",
      "  --quiet, -q     Suppress info logs.",
      "  --json          Print a JSON report to stdout.",
      "  --dry-run       Plan writes but skip flushing to disk.",
      "  --root <dir>    Repo root (defaults to process.cwd()).",
      "  --help, -h      Show this message.",
      "",
      "Exit codes:",
      "  0  every selected step succeeded",
      "  1  any step failed or CLI args were invalid",
    ].join("\n"),
  );
}

function printSummary(result: OrchestrateResult, logger: Logger): void {
  const ok = result.steps.filter((s) => s.status === "ok").length;
  const failed = result.steps.filter((s) => s.status === "failed").length;
  const skipped = result.steps.filter((s) => s.status === "skipped").length;
  const verdict = result.ok ? pc.green("OK") : pc.red("FAIL");
  logger.info(
    `${verdict}  steps: ${ok} ok, ${failed} failed, ${skipped} skipped — wrote ${result.writtenFiles.length} file(s) in ${result.durationMs}ms`,
  );
}

export async function run(argv: string[] = process.argv.slice(2)): Promise<number> {
  let args: CliArgs;
  try {
    args = parseArgs(argv);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error((err as Error).message);
    printHelp();
    return 1;
  }

  if (args.help) {
    printHelp();
    return 0;
  }

  const logger = args.json
    ? createSilentLogger()
    : args.quiet
      ? createSilentLogger()
      : createLogger("orchestrate");

  if (args.watch) {
    let lastResult: OrchestrateResult | null = null;
    try {
      await watch({
        repoRoot: args.repoRoot,
        only: args.only,
        dryRun: args.dryRun,
        quiet: args.quiet || args.json,
        logger,
        onCycle: (result) => {
          lastResult = result;
          if (!args.json) printSummary(result, logger);
        },
      });
      return lastResult && (lastResult as OrchestrateResult).ok ? 0 : 1;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`watch failed: ${(err as Error).message}`);
      return 1;
    }
  }

  const result = await orchestrate({
    repoRoot: args.repoRoot,
    only: args.only,
    dryRun: args.dryRun,
    quiet: args.quiet || args.json,
    logger,
  });

  if (args.json) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  } else {
    printSummary(result, logger);
  }
  return result.ok ? 0 : 1;
}

// ---------------------------------------------------------------------------
// CLI guard — only invoke when executed directly via `tsx`, never on import.
// ---------------------------------------------------------------------------

const invokedDirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  (() => {
    try {
      return import.meta.url === pathToFileURL(process.argv[1] as string).href;
    } catch {
      return false;
    }
  })();

if (invokedDirectly) {
  void run().then((code) => {
    process.exit(code);
  });
}

// ---------------------------------------------------------------------------
// Internal exports — for tests only.
// ---------------------------------------------------------------------------

export const __internal = {
  NoopGenerator,
  STEP_ALIASES,
  resolveStepName,
  snapshot,
  snapshotsDiffer,
  flushWrites,
};
