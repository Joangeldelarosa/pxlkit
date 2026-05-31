/**
 * generate-registry — emits packages/ui-kit/src/registry.generated.ts.
 *
 * Reads every <Component>.manifest.ts via the shared loader (`readManifest`),
 * normalizes it into a flat `ComponentMeta`, and serializes two named exports:
 *
 *   export const UI_KIT_COMPONENTS = [...] as const;       // sorted alphabetically
 *   export const UI_KIT_REGISTRY: Record<string, ComponentMeta> = {...};
 *
 * This file is parallel to the hand-authored `registry.ts` and never overwrites
 * it. Downstream tooling can switch to the generated registry incrementally.
 *
 * SAFETY:
 *  - Output path is fixed to <repoRoot>/packages/ui-kit/src/registry.generated.ts
 *  - Refuses to write outside packages/ui-kit/src
 *  - If no manifests are discovered, still emits an empty-but-valid file so the
 *    project keeps compiling (degraded mode, exits 0 with a warning).
 */

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "fs-extra";
import {
  Generator,
  readManifest,
  writeOutput,
  type GeneratorContext,
  type GeneratorResult,
  type ManifestRecord,
} from "./_lib/generator-base.js";
import { createLogger, type Logger } from "./_lib/logger.js";
import { findComponentDirs } from "./_lib/scan-fs.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ComponentMeta {
  name: string;
  category: string;
  since: string;
  status: string;
  deprecatedNote?: string;
  description: string;
  related: string[];
  bundleSize?: number | "auto";
}

export interface GenerateRegistryOptions {
  repoRoot?: string;
  outputPath?: string;
  manifests?: ManifestRecord[];
  logger?: Logger;
  json?: boolean;
}

export interface GenerateRegistryResult {
  outputPath: string;
  componentCount: number;
  components: string[];
  content: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function defaultOutputPath(repoRoot: string): string {
  return toPosix(path.join(repoRoot, "packages/ui-kit/src/registry.generated.ts"));
}

function assertSafeOutputPath(repoRoot: string, outputPath: string): void {
  const allowedDir = toPosix(path.join(repoRoot, "packages/ui-kit/src"));
  const resolvedOut = toPosix(path.resolve(outputPath));
  if (!resolvedOut.startsWith(`${allowedDir}/`)) {
    throw new Error(
      `generate-registry: refusing to write outside packages/ui-kit/src (got ${resolvedOut})`,
    );
  }
  if (!resolvedOut.endsWith(".generated.ts")) {
    throw new Error(
      `generate-registry: output must end with .generated.ts (got ${resolvedOut})`,
    );
  }
}

function normalizeRelated(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function normalizeBundleSize(value: unknown): number | "auto" | undefined {
  if (value === "auto") return "auto";
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }
  return undefined;
}

function extractDeprecatedNote(m: ManifestRecord["manifest"]): string | undefined {
  if (typeof m.deprecatedNote === "string" && m.deprecatedNote.length > 0) {
    return m.deprecatedNote;
  }
  // Tolerate the older `deprecated: { note }` shape from generator-base.Manifest.
  if (m.deprecated && typeof m.deprecated === "object") {
    const note = (m.deprecated as { note?: unknown }).note;
    if (typeof note === "string" && note.length > 0) return note;
  }
  return undefined;
}

function toComponentMeta(record: ManifestRecord): ComponentMeta {
  const m = record.manifest;
  const meta: ComponentMeta = {
    name: m.name,
    category: typeof m.category === "string" ? m.category : "uncategorized",
    since: typeof m.since === "string" ? m.since : "0.0.0",
    status: typeof m.status === "string" ? m.status : "experimental",
    description: typeof m.description === "string" ? m.description : "",
    related: normalizeRelated(m.related),
  };
  const deprecatedNote = extractDeprecatedNote(m);
  if (deprecatedNote !== undefined) meta.deprecatedNote = deprecatedNote;
  const bundleSize = normalizeBundleSize(m.bundleSize);
  if (bundleSize !== undefined) meta.bundleSize = bundleSize;
  return meta;
}

function sortComponents(metas: ComponentMeta[]): ComponentMeta[] {
  return [...metas].sort((a, b) => a.name.localeCompare(b.name));
}

function dedupeByName(metas: ComponentMeta[], logger: Logger): ComponentMeta[] {
  const seen = new Map<string, ComponentMeta>();
  for (const meta of metas) {
    if (seen.has(meta.name)) {
      logger.warn(`generate-registry: duplicate manifest name "${meta.name}" — last one wins`);
    }
    seen.set(meta.name, meta);
  }
  return Array.from(seen.values());
}

// ---------------------------------------------------------------------------
// Serialization — emit a stable, lint-friendly TypeScript module.
// ---------------------------------------------------------------------------

function quote(s: string): string {
  return JSON.stringify(s);
}

function serializeMeta(meta: ComponentMeta, indent: string): string {
  const lines: string[] = [];
  lines.push(`${indent}name: ${quote(meta.name)},`);
  lines.push(`${indent}category: ${quote(meta.category)},`);
  lines.push(`${indent}since: ${quote(meta.since)},`);
  lines.push(`${indent}status: ${quote(meta.status)},`);
  if (meta.deprecatedNote !== undefined) {
    lines.push(`${indent}deprecatedNote: ${quote(meta.deprecatedNote)},`);
  }
  lines.push(`${indent}description: ${quote(meta.description)},`);
  const related = meta.related.length
    ? `[${meta.related.map(quote).join(", ")}]`
    : "[]";
  lines.push(`${indent}related: ${related},`);
  if (meta.bundleSize !== undefined) {
    const value = meta.bundleSize === "auto" ? `"auto"` : String(meta.bundleSize);
    lines.push(`${indent}bundleSize: ${value},`);
  }
  return lines.join("\n");
}

function serializeRegistry(metas: ComponentMeta[]): string {
  const sorted = sortComponents(metas);
  const names = sorted.map((m) => m.name);

  const header = [
    "/**",
    " * AUTO-GENERATED by scripts/build-docs/generate-registry.ts.",
    " * DO NOT EDIT BY HAND — re-run `npm run docs:registry` (or `tsx`) to refresh.",
    " *",
    " * This file is parallel to `registry.ts` and is safe to import from runtime",
    " * code, docs builders, and the coherence auditor.",
    " */",
    "",
    "export interface ComponentMeta {",
    "  name: string;",
    "  category: string;",
    "  since: string;",
    "  status: string;",
    "  deprecatedNote?: string;",
    "  description: string;",
    "  related: string[];",
    "  bundleSize?: number | \"auto\";",
    "}",
    "",
  ].join("\n");

  const componentsBlock = [
    "export const UI_KIT_COMPONENTS = [",
    ...names.map((n) => `  ${quote(n)},`),
    "] as const;",
    "",
    "export type UiKitComponentName = (typeof UI_KIT_COMPONENTS)[number];",
    "",
  ].join("\n");

  const entries = sorted
    .map((meta) => {
      const body = serializeMeta(meta, "    ");
      return `  ${quote(meta.name)}: {\n${body}\n  },`;
    })
    .join("\n");

  const registryBlock = [
    "export const UI_KIT_REGISTRY: Record<string, ComponentMeta> = {",
    entries,
    "};",
    "",
  ].join("\n");

  // Trailing newline so editors / git don't complain.
  return `${header}\n${componentsBlock}\n${registryBlock}`;
}

// ---------------------------------------------------------------------------
// Manifest discovery — used when the caller doesn't pre-load them.
// ---------------------------------------------------------------------------

async function discoverManifests(repoRoot: string, logger: Logger): Promise<ManifestRecord[]> {
  const dirs = await findComponentDirs(repoRoot);
  const records: ManifestRecord[] = [];
  for (const dir of dirs) {
    const fg = (await import("fast-glob")).default;
    const tsxFiles = await fg("*.tsx", {
      cwd: dir,
      absolute: true,
      ignore: ["*.stories.tsx", "*.test.tsx", "*.spec.tsx", "*.examples.tsx"],
    });
    for (const tsx of tsxFiles) {
      const record = await readManifest(tsx);
      if (record) records.push(record);
    }
  }
  logger.info(`generate-registry: discovered ${records.length} manifest(s)`);
  return records;
}

// ---------------------------------------------------------------------------
// Programmatic API
// ---------------------------------------------------------------------------

export async function generateRegistry(
  options: GenerateRegistryOptions = {},
): Promise<GenerateRegistryResult> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const logger = options.logger ?? createLogger("generate-registry");
  const outputPath = options.outputPath ?? defaultOutputPath(repoRoot);

  assertSafeOutputPath(repoRoot, outputPath);

  const manifests = options.manifests ?? (await discoverManifests(repoRoot, logger));
  const metas = dedupeByName(manifests.map(toComponentMeta), logger);

  if (metas.length === 0) {
    logger.warn(
      "generate-registry: no manifests found — emitting an empty registry stub",
    );
  }

  const content = serializeRegistry(metas);
  await writeOutput(outputPath, content);

  const sorted = sortComponents(metas);
  logger.success(
    `generate-registry: wrote ${sorted.length} component(s) → ${toPosix(outputPath)}`,
  );

  return {
    outputPath: toPosix(outputPath),
    componentCount: sorted.length,
    components: sorted.map((m) => m.name),
    content,
  };
}

export default generateRegistry;

// ---------------------------------------------------------------------------
// Generator class — drop into the orchestrator alongside other generators.
// ---------------------------------------------------------------------------

export class GenerateRegistryGenerator extends Generator {
  name = "generate-registry";

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const outputPath = defaultOutputPath(ctx.repoRoot);
    const metas = dedupeByName(ctx.manifests.map(toComponentMeta), ctx.logger);
    const content = serializeRegistry(metas);
    ctx.outputs.set(outputPath, content);
    return { writes: [{ path: outputPath, content }] };
  }
}

// ---------------------------------------------------------------------------
// CLI entry — `tsx scripts/build-docs/generate-registry.ts [--json] [--out PATH]`
// ---------------------------------------------------------------------------

interface ParsedArgs {
  json: boolean;
  outputPath?: string;
  repoRoot?: string;
  help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const out: ParsedArgs = { json: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      out.json = true;
    } else if (arg === "--help" || arg === "-h") {
      out.help = true;
    } else if (arg === "--out" || arg === "-o") {
      const next = argv[i + 1];
      if (!next) throw new Error("--out requires a path argument");
      out.outputPath = path.resolve(next);
      i++;
    } else if (arg === "--root") {
      const next = argv[i + 1];
      if (!next) throw new Error("--root requires a path argument");
      out.repoRoot = path.resolve(next);
      i++;
    } else if (arg && arg.startsWith("--")) {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }
  return out;
}

function printHelp(): void {
  // eslint-disable-next-line no-console
  console.log(
    [
      "Usage: tsx scripts/build-docs/generate-registry.ts [options]",
      "",
      "Options:",
      "  --out, -o <path>   Write to <path> (must live under packages/ui-kit/src and",
      "                     end with .generated.ts). Defaults to",
      "                     packages/ui-kit/src/registry.generated.ts.",
      "  --root <path>      Repo root (defaults to process.cwd()).",
      "  --json             Print a JSON summary to stdout instead of a human log.",
      "  --help, -h         Show this message.",
      "",
      "Exit codes:",
      "  0  success",
      "  1  any failure (invalid args, unsafe output path, IO error, etc.)",
    ].join("\n"),
  );
}

export async function run(argv: string[] = process.argv.slice(2)): Promise<number> {
  let args: ParsedArgs;
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
    ? { info() {}, warn() {}, error() {}, success() {}, table() {} }
    : createLogger("generate-registry");

  try {
    const result = await generateRegistry({
      repoRoot: args.repoRoot,
      outputPath: args.outputPath,
      logger,
    });
    if (args.json) {
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify(
          {
            ok: true,
            outputPath: result.outputPath,
            componentCount: result.componentCount,
            components: result.components,
          },
          null,
          2,
        ),
      );
    }
    return 0;
  } catch (err) {
    const message = (err as Error).message;
    if (args.json) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ ok: false, error: message }, null, 2));
    } else {
      // eslint-disable-next-line no-console
      console.error(`generate-registry failed: ${message}`);
    }
    return 1;
  }
}

// CLI guard — runs only when invoked directly (not when imported).
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

// Export utility for tests / external callers.
export const __internal = {
  serializeRegistry,
  toComponentMeta,
  sortComponents,
  dedupeByName,
  assertSafeOutputPath,
  defaultOutputPath,
  fileURLToPath,
};
