/**
 * extract-bundle-size
 *
 * For each component (identified by its manifest), measure the production
 * bundle cost of importing JUST that component from the workspace UI kit.
 *
 * Strategy:
 *   - Generate a virtual entry per component: `export { <Name> } from '<pkg>';`
 *   - Bundle with esbuild (minified, no sourcemap, react/react-dom external)
 *   - gzip-compress the resulting JS and report the gzipped byte count
 *
 * esbuild was chosen over `rollup-plugin-visualizer` because:
 *   1. it is already installed in the monorepo (vitest depends on it),
 *   2. it natively supports virtual entries via the `stdin` API — no extra
 *      `@rollup/plugin-virtual` dependency,
 *   3. its tree-shaking output is comparable to rollup's for our use case,
 *   4. it is ~10x faster, which matters when running across 100+ components.
 *
 * Output:
 *   scripts/build-docs/bundle-sizes.json    →    { [Component: string]: bytesGzipped }
 *
 * The orchestrator (in a downstream step) merges this back into each
 * manifest's `bundleSize` field via the registry generator.
 *
 * Usage (CLI):
 *   tsx scripts/build-docs/extract-bundle-size.ts                # measure + write
 *   tsx scripts/build-docs/extract-bundle-size.ts --dry          # measure only
 *   tsx scripts/build-docs/extract-bundle-size.ts --json         # machine-readable
 *   tsx scripts/build-docs/extract-bundle-size.ts --root <path>  # custom repo root
 *   tsx scripts/build-docs/extract-bundle-size.ts --out <path>   # custom output JSON
 *   tsx scripts/build-docs/extract-bundle-size.ts --pkg <name>   # override package name
 *
 * Exit codes:
 *   0  success
 *   1  failure (load error, bundle error, write error)
 */

import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import fs from "fs-extra";
import pc from "picocolors";
import * as esbuild from "esbuild";

import {
  Generator,
  readManifest,
  writeOutput,
  type GeneratorContext,
  type GeneratorResult,
  type ManifestRecord,
  type Manifest as PermissiveManifest,
} from "./_lib/generator-base.js";
import { createLogger, type Logger } from "./_lib/logger.js";
import { findComponentDirs } from "./_lib/scan-fs.js";

// ---------------------------------------------------------------------------
// Public contract
// ---------------------------------------------------------------------------

export const DEFAULT_PACKAGE = "@pxlkit/ui-kit";
export const DEFAULT_OUT_RELATIVE = "scripts/build-docs/bundle-sizes.json";
export const DEFAULT_EXTERNALS: readonly string[] = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
];

/** A bundle measurement for a single component. */
export interface BundleMeasurement {
  /** Component name (PascalCase, matches the manifest). */
  name: string;
  /** Gzipped byte count. */
  bytesGzipped: number;
  /** Raw (un-gzipped, but already minified) byte count. */
  bytesMinified: number;
}

/** Final on-disk shape — just { component: bytesGzipped }. */
export type BundleSizesJson = Record<string, number>;

export interface ExtractBundleSizeOptions {
  repoRoot: string;
  /** Target package name that exports each component; default "@pxlkit/ui-kit". */
  packageName?: string;
  /** Output JSON file (absolute or repo-relative); default scripts/build-docs/bundle-sizes.json. */
  outFile?: string;
  /** Pre-loaded manifests; if omitted the generator scans the FS. */
  manifests?: ManifestRecord[];
  /** When true, do not write the JSON file — return the report only. */
  dryRun?: boolean;
  /** Additional module IDs to mark as external for the per-component bundle. */
  externals?: readonly string[];
  /** Custom resolveDir to anchor the synthetic entry's module resolution. */
  resolveDir?: string;
  logger?: Logger;
}

export interface ExtractBundleSizeReport {
  ok: boolean;
  count: number;
  measured: number;
  skipped: number;
  outFile: string;
  measurements: BundleMeasurement[];
  /** The exact JSON object that was (or would be) written to disk. */
  sizes: BundleSizesJson;
  errors: Array<{ name?: string; message: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

/** TS-string-escape — single-quoted literal embedded in synthetic source. */
function tsString(s: string): string {
  return `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

/**
 * Build the virtual entry source that imports JUST one component from the
 * target package. The named re-export is what unlocks tree-shaking — if the
 * package's index re-exports everything, esbuild will still drop all the
 * neighbours because nothing else is referenced.
 */
export function buildVirtualEntry(componentName: string, packageName: string): string {
  return [
    `// Auto-generated synthetic entry for bundle measurement.`,
    `// component: ${componentName}`,
    `// package:   ${packageName}`,
    `export { ${componentName} } from ${tsString(packageName)};`,
    ``,
  ].join("\n");
}

/**
 * Measure a single component's bundle cost.
 *
 * Internal — exported only for unit testing. Production callers should use
 * `extractBundleSize` which batches across manifests.
 */
export async function measureComponent(
  componentName: string,
  opts: {
    packageName: string;
    externals: readonly string[];
    resolveDir: string;
  },
): Promise<BundleMeasurement> {
  const entry = buildVirtualEntry(componentName, opts.packageName);

  const result = await esbuild.build({
    stdin: {
      contents: entry,
      loader: "ts",
      resolveDir: opts.resolveDir,
      sourcefile: `__virtual__/${componentName}.entry.ts`,
    },
    bundle: true,
    write: false,
    minify: true,
    treeShaking: true,
    format: "esm",
    platform: "neutral",
    target: ["es2022"],
    external: [...opts.externals],
    legalComments: "none",
    logLevel: "silent",
  });

  // Concatenate all emitted output files (in practice esbuild emits one).
  const code = result.outputFiles
    .map((f) => Buffer.from(f.contents))
    .reduce((acc, buf) => Buffer.concat([acc, buf]), Buffer.alloc(0));

  const gz = gzipSync(code, { level: 9 });

  return {
    name: componentName,
    bytesMinified: code.byteLength,
    bytesGzipped: gz.byteLength,
  };
}

// ---------------------------------------------------------------------------
// Manifest loading
// ---------------------------------------------------------------------------

async function loadManifestsForRoot(
  root: string,
  logger: Logger,
): Promise<ManifestRecord[]> {
  const dirs = await findComponentDirs(root);
  const records: ManifestRecord[] = [];
  for (const dir of dirs) {
    const entries = await fs.readdir(dir);
    const manifests = entries.filter((e) => e.endsWith(".manifest.ts"));
    for (const m of manifests) {
      const file = path.join(dir, m);
      try {
        const rec = await readManifest(file);
        if (rec) records.push(rec);
      } catch (err) {
        logger.warn(
          `skip manifest ${toPosix(file)}: ${(err as Error).message}`,
        );
      }
    }
  }
  return records;
}

function resolveOutFile(repoRoot: string, outFile?: string): string {
  if (!outFile) return toPosix(path.join(repoRoot, DEFAULT_OUT_RELATIVE));
  return path.isAbsolute(outFile)
    ? toPosix(outFile)
    : toPosix(path.resolve(repoRoot, outFile));
}

// ---------------------------------------------------------------------------
// Generator class (inherits the GeneratorBase contract)
// ---------------------------------------------------------------------------

export class ExtractBundleSizeGenerator extends Generator {
  name = "extract-bundle-size";

  constructor(
    private readonly outFile: string,
    private readonly packageName: string = DEFAULT_PACKAGE,
    private readonly externals: readonly string[] = DEFAULT_EXTERNALS,
    private readonly resolveDir?: string,
  ) {
    super();
  }

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const resolveDir = this.resolveDir ?? ctx.repoRoot;
    const sizes: BundleSizesJson = {};
    for (const rec of ctx.manifests) {
      const name = (rec.manifest as PermissiveManifest).name;
      if (typeof name !== "string" || name.length === 0) continue;
      try {
        const m = await measureComponent(name, {
          packageName: this.packageName,
          externals: this.externals,
          resolveDir,
        });
        sizes[name] = m.bytesGzipped;
      } catch (err) {
        ctx.logger.warn(`bundle measure failed for ${name}: ${(err as Error).message}`);
      }
    }
    return {
      writes: [{ path: this.outFile, content: `${JSON.stringify(sizes, null, 2)}\n` }],
    };
  }
}

// ---------------------------------------------------------------------------
// Programmatic API (default export)
// ---------------------------------------------------------------------------

export async function extractBundleSize(
  opts: ExtractBundleSizeOptions,
): Promise<ExtractBundleSizeReport> {
  const logger = opts.logger ?? createLogger("extract-bundle-size");
  const repoRoot = path.resolve(opts.repoRoot);
  const packageName = opts.packageName ?? DEFAULT_PACKAGE;
  const externals = opts.externals ?? DEFAULT_EXTERNALS;
  const resolveDir = opts.resolveDir ?? repoRoot;
  const outFile = resolveOutFile(repoRoot, opts.outFile);

  const errors: ExtractBundleSizeReport["errors"] = [];

  let manifests: ManifestRecord[];
  if (opts.manifests) {
    manifests = opts.manifests;
  } else {
    manifests = await loadManifestsForRoot(repoRoot, logger);
  }

  const measurements: BundleMeasurement[] = [];
  const sizes: BundleSizesJson = {};
  let measured = 0;
  let skipped = 0;

  for (const rec of manifests) {
    const name = (rec.manifest as PermissiveManifest).name;
    if (typeof name !== "string" || name.length === 0) {
      errors.push({
        name: undefined,
        message: `manifest at ${rec.manifestFile} is missing a string \`name\` field`,
      });
      continue;
    }

    try {
      const m = await measureComponent(name, {
        packageName,
        externals,
        resolveDir,
      });
      measurements.push(m);
      sizes[name] = m.bytesGzipped;
      measured++;
    } catch (err) {
      skipped++;
      errors.push({ name, message: (err as Error).message });
    }
  }

  // Sort keys alphabetically so output is deterministic across runs.
  const sortedSizes: BundleSizesJson = {};
  for (const k of Object.keys(sizes).sort()) {
    sortedSizes[k] = sizes[k]!;
  }

  if (!opts.dryRun) {
    try {
      await writeOutput(outFile, `${JSON.stringify(sortedSizes, null, 2)}\n`);
    } catch (err) {
      errors.push({ message: `failed to write ${outFile}: ${(err as Error).message}` });
    }
  }

  const ok = errors.length === 0;
  return {
    ok,
    count: manifests.length,
    measured,
    skipped,
    outFile,
    measurements,
    sizes: sortedSizes,
    errors,
  };
}

export default extractBundleSize;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface CliArgs {
  root: string;
  dry: boolean;
  json: boolean;
  outFile?: string;
  pkg?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    root: process.cwd(),
    dry: false,
    json: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry" || a === "--dry-run") args.dry = true;
    else if (a === "--json") args.json = true;
    else if (a === "--root") args.root = String(argv[++i] ?? args.root);
    else if (a === "--out") args.outFile = String(argv[++i] ?? "");
    else if (a === "--pkg" || a === "--package") args.pkg = String(argv[++i] ?? "");
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return args;
}

function printHelp(): void {
  // eslint-disable-next-line no-console
  console.log(`extract-bundle-size — measure per-component gzipped bundle size

Options:
  --root <path>     Repository root (default: cwd)
  --out <path>      Output JSON path (default: <root>/${DEFAULT_OUT_RELATIVE})
  --pkg <name>      Target package name (default: ${DEFAULT_PACKAGE})
  --dry, --dry-run  Measure only — do not write the JSON file
  --json            Emit a machine-readable JSON report on stdout
  -h, --help        Show this help`);
}

export async function run(argv: string[] = process.argv.slice(2)): Promise<number> {
  const args = parseArgs(argv);
  const logger = createLogger("extract-bundle-size");

  try {
    const report = await extractBundleSize({
      repoRoot: args.root,
      outFile: args.outFile,
      packageName: args.pkg,
      dryRun: args.dry,
      logger,
    });

    if (args.json) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(report, null, 2));
    } else {
      logger.info(
        `manifests: ${report.count} | measured: ${report.measured} | skipped: ${report.skipped} | errors: ${report.errors.length}`,
      );
      const top = report.measurements
        .slice()
        .sort((a, b) => b.bytesGzipped - a.bytesGzipped)
        .slice(0, 10);
      for (const m of top) {
        logger.info(
          `  ${pc.cyan(m.name.padEnd(28))} ${pc.yellow(`${m.bytesGzipped} B gz`)} ${pc.dim(`(${m.bytesMinified} B min)`)}`,
        );
      }
      if (report.measurements.length > 10) {
        logger.info(`  …and ${report.measurements.length - 10} more`);
      }
      for (const err of report.errors) {
        logger.error(`${err.name ?? "?"}: ${err.message}`);
      }
      if (report.ok) {
        logger.success(args.dry ? "done (dry-run, no file written)" : `wrote ${report.outFile}`);
      } else {
        logger.error("completed with errors");
      }
    }

    return report.ok ? 0 : 1;
  } catch (err) {
    logger.error((err as Error).stack ?? (err as Error).message);
    if (args.json) {
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          ok: false,
          count: 0,
          measured: 0,
          skipped: 0,
          outFile: "",
          measurements: [],
          sizes: {},
          errors: [{ message: (err as Error).message }],
        }),
      );
    }
    return 1;
  }
}

// CLI guard — invoked only when executed directly via tsx/node.
if (
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run().then(
    (code) => process.exit(code),
    (err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    },
  );
}
