/**
 * scan-manifests — discover, import, and validate every *.manifest.ts under
 * packages/*\/src/** and emit a sorted, normalized array of ManifestRecord.
 *
 * Programmatic API:
 *   const records = await scanManifests("C:/pxlkit");
 *
 * CLI:
 *   tsx scripts/build-docs/scan-manifests.ts [--root <dir>] [--json] [--quiet]
 *
 * Exit codes:
 *   0 — at least one manifest scanned and all validated
 *   1 — a manifest failed Zod validation, OR an import error occurred
 *
 * Safety: read-only. Never writes to disk. Never modifies source files.
 */

import fg from "fast-glob";
import fs from "fs-extra";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  Generator,
  type GeneratorContext,
  type GeneratorResult,
  type Manifest as LooseManifest,
  type ManifestRecord,
} from "./_lib/generator-base.js";
import { createLogger, defaultLogger, type Logger } from "./_lib/logger.js";
import { ManifestSchema, safeParseManifest, type Manifest } from "./manifest-schema.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MANIFEST_GLOB = "packages/*/src/**/*.manifest.ts";
const IGNORE = [
  "**/node_modules/**",
  "**/dist/**",
  "**/__tests__/**",
  "**/*.stories.tsx",
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScanIssue {
  manifestFile: string;
  reason: "missing-source" | "import-failed" | "no-manifest-export" | "schema-invalid";
  message: string;
  paths?: string[];
}

export interface ScanResult {
  records: ManifestRecord[];
  issues: ScanIssue[];
  scanned: number;
  durationMs: number;
}

export interface ScanOptions {
  /** Custom logger. Defaults to the shared logger. */
  logger?: Logger;
  /** When true, soft-fail individual broken manifests instead of throwing. */
  continueOnError?: boolean;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function deriveSourceFile(manifestFile: string): string {
  return manifestFile.replace(/\.manifest\.ts$/, ".tsx");
}

function deriveExamplesFile(manifestFile: string): string {
  return manifestFile.replace(/\.manifest\.ts$/, ".examples.tsx");
}

async function detectPackageName(file: string): Promise<string> {
  let dir = path.dirname(file);
  const root = path.parse(dir).root;
  while (dir && dir !== root) {
    const pkgPath = path.join(dir, "package.json");
    if (await fs.pathExists(pkgPath)) {
      try {
        const pkg = (await fs.readJson(pkgPath)) as { name?: string };
        if (pkg && typeof pkg.name === "string" && pkg.name.length > 0) {
          return pkg.name;
        }
      } catch {
        // unreadable package.json; keep walking up
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return "unknown";
}

function pickManifestExport(mod: Record<string, unknown>): unknown {
  if (mod.default !== undefined) return mod.default;
  if (mod.manifest !== undefined) return mod.manifest;
  // Heuristic: a single non-utility named export that looks like a manifest.
  const candidates = Object.entries(mod).filter(([k]) => k !== "__esModule");
  if (candidates.length === 1) return candidates[0]![1];
  return undefined;
}

function looksLikeManifest(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as { name?: unknown }).name === "string"
  );
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Scan a repo root for every *.manifest.ts file, import each, validate against
 * the SSOT ManifestSchema, and return a deterministically sorted array.
 *
 * Throws on the FIRST validation/import error unless `continueOnError` is set.
 */
export async function scanManifests(
  root: string,
  options: ScanOptions = {},
): Promise<ManifestRecord[]> {
  const result = await scanManifestsFull(root, { ...options, continueOnError: true });
  if (!options.continueOnError && result.issues.length > 0) {
    const first = result.issues[0]!;
    throw new Error(`scan-manifests: ${first.reason} at ${first.manifestFile}: ${first.message}`);
  }
  return result.records;
}

/**
 * Detailed variant — returns records AND a list of structured issues. CLI mode
 * uses this to surface every problem in a single run.
 */
export async function scanManifestsFull(
  root: string,
  options: ScanOptions = {},
): Promise<ScanResult> {
  const logger = options.logger ?? defaultLogger;
  const start = Date.now();

  const absRoot = path.resolve(root);

  const matched = await fg(MANIFEST_GLOB, {
    cwd: absRoot,
    ignore: IGNORE,
    absolute: true,
    onlyFiles: true,
    dot: false,
  });

  const records: ManifestRecord[] = [];
  const issues: ScanIssue[] = [];

  for (const manifestFileRaw of matched.sort()) {
    const manifestFile = toPosix(manifestFileRaw);
    const sourceFile = deriveSourceFile(manifestFile);

    if (!(await fs.pathExists(sourceFile))) {
      issues.push({
        manifestFile,
        reason: "missing-source",
        message: `expected sibling component at ${sourceFile}`,
      });
      continue;
    }

    let mod: Record<string, unknown>;
    try {
      mod = (await import(pathToFileURL(manifestFile).href)) as Record<string, unknown>;
    } catch (err) {
      issues.push({
        manifestFile,
        reason: "import-failed",
        message: (err as Error).message,
      });
      continue;
    }

    const candidate = pickManifestExport(mod);
    if (!looksLikeManifest(candidate)) {
      issues.push({
        manifestFile,
        reason: "no-manifest-export",
        message: "expected `default` or `manifest` export with a string `name`",
      });
      continue;
    }

    const parsed = safeParseManifest(candidate);
    if (!parsed.success) {
      const paths = parsed.error.issues.map((i) => i.path.join("."));
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "<root>"}: ${i.message}`)
        .join("; ");
      issues.push({
        manifestFile,
        reason: "schema-invalid",
        message: detail,
        paths,
      });
      continue;
    }

    const manifest: Manifest = parsed.data;
    const examplesPath = deriveExamplesFile(manifestFile);
    const examplesFile = (await fs.pathExists(examplesPath))
      ? toPosix(examplesPath)
      : undefined;
    const pkg = await detectPackageName(sourceFile);

    // ManifestRecord.manifest is typed loosely in generator-base for downstream
    // tooling that doesn't import the strict schema. We've already validated
    // against the strict schema above, so this widening cast is safe.
    records.push({
      manifest: manifest as unknown as LooseManifest,
      sourceFile,
      manifestFile,
      examplesFile,
      package: pkg,
    });
  }

  records.sort((a, b) => {
    const pkgCmp = a.package.localeCompare(b.package);
    if (pkgCmp !== 0) return pkgCmp;
    return a.manifest.name.localeCompare(b.manifest.name);
  });

  const durationMs = Date.now() - start;

  if (matched.length === 0) {
    logger.warn(`scan-manifests: no *.manifest.ts files found under ${toPosix(absRoot)}`);
  } else {
    logger.info(
      `scan-manifests: scanned ${matched.length} file(s), ${records.length} valid, ${issues.length} issue(s) in ${durationMs}ms`,
    );
  }

  return { records, issues, scanned: matched.length, durationMs };
}

// ---------------------------------------------------------------------------
// Generator wrapper (orchestrator-compatible)
// ---------------------------------------------------------------------------

/**
 * Generator adapter so `scanManifests` can be plugged into the orchestrator.
 * Side-effect: populates `ctx.manifests` in place. Produces no writes.
 */
export class ScanManifestsGenerator extends Generator {
  override name = "scan-manifests";

  override async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const records = await scanManifests(ctx.repoRoot, {
      logger: ctx.logger,
      continueOnError: false,
    });
    ctx.manifests.splice(0, ctx.manifests.length, ...records);
    return { writes: [] };
  }
}

// ---------------------------------------------------------------------------
// Default export — the programmatic API requested by the spec.
// ---------------------------------------------------------------------------

export default scanManifests;

// Re-export the schema for downstream consumers.
export { ManifestSchema };
export type { Manifest };

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface CliArgs {
  root: string;
  json: boolean;
  quiet: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    root: process.cwd(),
    json: false,
    quiet: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") {
      args.json = true;
    } else if (a === "--quiet" || a === "-q") {
      args.quiet = true;
    } else if (a === "--root") {
      const next = argv[++i];
      if (!next) throw new Error("--root requires a path");
      args.root = next;
    } else if (a === "--help" || a === "-h") {
      // eslint-disable-next-line no-console
      console.log(
        "Usage: tsx scripts/build-docs/scan-manifests.ts [--root <dir>] [--json] [--quiet]",
      );
      process.exit(0);
    } else if (a && !a.startsWith("-")) {
      args.root = a;
    }
  }
  return args;
}

async function run(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const logger = args.quiet
    ? createSilentLogger()
    : args.json
      ? createSilentLogger()
      : createLogger("scan");

  const result = await scanManifestsFull(args.root, {
    logger,
    continueOnError: true,
  });

  if (args.json) {
    const payload = {
      scanned: result.scanned,
      validCount: result.records.length,
      issueCount: result.issues.length,
      durationMs: result.durationMs,
      records: result.records.map((r) => {
        const m = r.manifest as unknown as Manifest;
        return {
          package: r.package,
          name: m.name,
          category: m.category,
          status: m.status,
          since: m.since,
          sourceFile: r.sourceFile,
          manifestFile: r.manifestFile,
          examplesFile: r.examplesFile,
        };
      }),
      issues: result.issues,
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload, null, 2));
  } else if (!args.quiet) {
    const cliLogger = createLogger("scan");
    cliLogger.table(
      result.records.map((r) => {
        const m = r.manifest as unknown as Manifest;
        return {
          package: r.package,
          name: m.name,
          category: m.category,
          status: m.status,
          since: m.since,
        };
      }),
    );
    if (result.issues.length > 0) {
      cliLogger.warn(`${result.issues.length} issue(s):`);
      for (const issue of result.issues) {
        cliLogger.error(`  [${issue.reason}] ${issue.manifestFile} — ${issue.message}`);
      }
    } else {
      cliLogger.success(
        `${result.records.length} manifest(s) validated in ${result.durationMs}ms`,
      );
    }
  }

  process.exit(result.issues.length > 0 ? 1 : 0);
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

// CLI guard — run only when invoked directly via tsx, not on import.
if (
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
