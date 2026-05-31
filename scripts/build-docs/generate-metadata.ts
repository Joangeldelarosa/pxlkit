/**
 * generate-metadata
 *
 * For each component manifest (per the SSOT contract in manifest-schema.ts),
 * emit a Next.js metadata object as `apps/web/src/app/ui-kit/<slug>/metadata.generated.ts`.
 *
 * The generator is SAFE: it only writes `.generated.ts` files alongside the
 * route, never overwriting hand-authored sources. It is invocable both as a
 * programmatic API (the default export) and via tsx as a CLI.
 *
 *   - title       : "<Component Display Name> — pxlkit"   (truncated to <=60)
 *   - description : manifest.description                  (truncated to <=155)
 *   - openGraph   : image -> /og/<slug>.png
 *   - twitter     : summary_large_image, image -> /og/<slug>.png
 *   - alternates  : canonical -> https://pxlkit.xyz/ui-kit/<slug>
 *
 * Usage (CLI):
 *   tsx scripts/build-docs/generate-metadata.ts                # writes files
 *   tsx scripts/build-docs/generate-metadata.ts --dry          # prints plan
 *   tsx scripts/build-docs/generate-metadata.ts --json         # machine-readable
 *   tsx scripts/build-docs/generate-metadata.ts --root <path>  # custom repo root
 *
 * Exit codes:
 *   0  success
 *   1  failure (load error, write error, validation issue)
 */

import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import fs from "fs-extra";
import pc from "picocolors";
import { kebabCase } from "change-case";

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

export const MAX_TITLE_LEN = 60;
export const MAX_DESCRIPTION_LEN = 155;
export const SITE_ORIGIN = "https://pxlkit.xyz";
export const ROUTE_PREFIX = "/ui-kit";

export interface MetadataPlanEntry {
  /** Component name from the manifest (PascalCase, e.g. PixelButton). */
  name: string;
  /** Route slug (kebab-case, e.g. pixel-button). */
  slug: string;
  /** Absolute POSIX path of the output file. */
  outFile: string;
  /** Route-relative URL, e.g. /ui-kit/pixel-button. */
  route: string;
  /** Final title (already truncated). */
  title: string;
  /** Final description (already truncated). */
  description: string;
  /** OpenGraph image URL relative to site origin. */
  ogImage: string;
  /** Canonical absolute URL. */
  canonical: string;
}

export interface GenerateMetadataOptions {
  repoRoot: string;
  /** Output directory root; default: <root>/apps/web/src/app/ui-kit */
  outRoot?: string;
  /** Pre-loaded manifests; if omitted the generator scans the FS. */
  manifests?: ManifestRecord[];
  /** When true, do not write files — return the plan only. */
  dryRun?: boolean;
  logger?: Logger;
}

export interface GenerateMetadataReport {
  ok: boolean;
  count: number;
  written: number;
  skipped: number;
  entries: MetadataPlanEntry[];
  errors: Array<{ name?: string; file?: string; message: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Truncate `s` to at most `max` chars, appending an ellipsis when cut. */
export function truncate(s: string, max: number): string {
  if (typeof s !== "string") return "";
  const trimmed = s.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  // Reserve one char for the ellipsis (single Unicode codepoint).
  const ellipsis = "…";
  const room = Math.max(1, max - 1);
  // Prefer cutting on a word boundary when one exists in the last 20% of room.
  const slice = trimmed.slice(0, room);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > 0 && lastSpace >= Math.floor(room * 0.6)) {
    return `${slice.slice(0, lastSpace).trimEnd()}${ellipsis}`;
  }
  return `${slice}${ellipsis}`;
}

/** Convert a component PascalCase name to a kebab-case route slug. */
export function slugFor(name: string): string {
  return kebabCase(name);
}

/** Format the SEO title for a component. */
export function formatTitle(name: string, brand = "pxlkit"): string {
  const raw = `${name} — ${brand}`;
  return truncate(raw, MAX_TITLE_LEN);
}

/** Default fallback description for manifests that ship without one. */
export function fallbackDescription(name: string): string {
  return `${name} — a pxlkit retro UI component with accessible, tree-shakable React API.`;
}

function ensurePosix(p: string): string {
  return p.split(path.sep).join("/");
}

/** Build a single Next metadata plan entry from a manifest record. */
export function planEntryFor(
  rec: ManifestRecord,
  outRoot: string,
): MetadataPlanEntry {
  const manifest = rec.manifest as PermissiveManifest;
  const name = manifest.name;
  if (!name || typeof name !== "string") {
    throw new Error(
      `manifest at ${rec.manifestFile} is missing a string \`name\` field`,
    );
  }
  const slug = slugFor(name);
  const title = formatTitle(name);
  const desc =
    typeof manifest.description === "string" && manifest.description.trim().length > 0
      ? manifest.description
      : fallbackDescription(name);
  const description = truncate(desc, MAX_DESCRIPTION_LEN);
  const route = `${ROUTE_PREFIX}/${slug}`;
  const ogImage = `/og/${slug}.png`;
  const canonical = `${SITE_ORIGIN}${route}`;
  const outFile = ensurePosix(path.join(outRoot, slug, "metadata.generated.ts"));

  return { name, slug, outFile, route, title, description, ogImage, canonical };
}

// ---------------------------------------------------------------------------
// Code emitter
// ---------------------------------------------------------------------------

const FILE_BANNER = `// AUTO-GENERATED by scripts/build-docs/generate-metadata.ts
// Do NOT edit by hand. Re-run \`tsx scripts/build-docs/generate-metadata.ts\`.
`;

/** Serialize a string as a TypeScript single-quoted literal. */
function tsString(s: string): string {
  const escaped = s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n");
  return `'${escaped}'`;
}

export function renderMetadataModule(entry: MetadataPlanEntry): string {
  const lines: string[] = [];
  lines.push(FILE_BANNER);
  lines.push(`import type { Metadata } from 'next';`);
  lines.push("");
  lines.push(`export const metadata: Metadata = {`);
  lines.push(`  title: ${tsString(entry.title)},`);
  lines.push(`  description: ${tsString(entry.description)},`);
  lines.push(`  alternates: {`);
  lines.push(`    canonical: ${tsString(entry.canonical)},`);
  lines.push(`  },`);
  lines.push(`  openGraph: {`);
  lines.push(`    type: 'article',`);
  lines.push(`    url: ${tsString(entry.canonical)},`);
  lines.push(`    title: ${tsString(entry.title)},`);
  lines.push(`    description: ${tsString(entry.description)},`);
  lines.push(`    siteName: 'pxlkit',`);
  lines.push(`    images: [`);
  lines.push(`      {`);
  lines.push(`        url: ${tsString(entry.ogImage)},`);
  lines.push(`        width: 1200,`);
  lines.push(`        height: 630,`);
  lines.push(`        alt: ${tsString(`${entry.name} — pxlkit UI component`)},`);
  lines.push(`      },`);
  lines.push(`    ],`);
  lines.push(`  },`);
  lines.push(`  twitter: {`);
  lines.push(`    card: 'summary_large_image',`);
  lines.push(`    title: ${tsString(entry.title)},`);
  lines.push(`    description: ${tsString(entry.description)},`);
  lines.push(`    images: [${tsString(entry.ogImage)}],`);
  lines.push(`  },`);
  lines.push(`};`);
  lines.push(``);
  lines.push(`export default metadata;`);
  lines.push(``);
  return lines.join("\n");
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
          `skip manifest ${ensurePosix(file)}: ${(err as Error).message}`,
        );
      }
    }
  }
  return records;
}

// ---------------------------------------------------------------------------
// Generator class (inherits the GeneratorBase contract)
// ---------------------------------------------------------------------------

export class GenerateMetadataGenerator extends Generator {
  name = "generate-metadata";

  constructor(private readonly outRoot: string) {
    super();
  }

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const writes = ctx.manifests.map((rec) => {
      const entry = planEntryFor(rec, this.outRoot);
      return { path: entry.outFile, content: renderMetadataModule(entry) };
    });
    return { writes };
  }
}

// ---------------------------------------------------------------------------
// Programmatic API (default export)
// ---------------------------------------------------------------------------

export async function generateMetadata(
  opts: GenerateMetadataOptions,
): Promise<GenerateMetadataReport> {
  const logger = opts.logger ?? createLogger("generate-metadata");
  const repoRoot = path.resolve(opts.repoRoot);
  const outRoot =
    opts.outRoot ??
    ensurePosix(path.join(repoRoot, "apps", "web", "src", "app", "ui-kit"));

  const errors: GenerateMetadataReport["errors"] = [];

  let manifests: ManifestRecord[];
  if (opts.manifests) {
    manifests = opts.manifests;
  } else {
    manifests = await loadManifestsForRoot(repoRoot, logger);
  }

  const entries: MetadataPlanEntry[] = [];
  let written = 0;
  let skipped = 0;

  for (const rec of manifests) {
    try {
      const entry = planEntryFor(rec, outRoot);
      entries.push(entry);
      if (opts.dryRun) {
        skipped++;
        continue;
      }
      const code = renderMetadataModule(entry);
      await writeOutput(entry.outFile, code);
      written++;
    } catch (err) {
      errors.push({
        name: (rec.manifest as PermissiveManifest).name,
        file: rec.manifestFile,
        message: (err as Error).message,
      });
    }
  }

  const ok = errors.length === 0;
  return {
    ok,
    count: manifests.length,
    written,
    skipped,
    entries,
    errors,
  };
}

export default generateMetadata;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface CliArgs {
  root: string;
  dry: boolean;
  json: boolean;
  outRoot?: string;
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
    else if (a === "--out-root") args.outRoot = String(argv[++i] ?? "");
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return args;
}

function printHelp(): void {
  // eslint-disable-next-line no-console
  console.log(`generate-metadata — emit Next metadata.generated.ts per manifest

Options:
  --root <path>     Repository root (default: cwd)
  --out-root <path> Output root (default: <root>/apps/web/src/app/ui-kit)
  --dry, --dry-run  Plan only — do not write files
  --json            Emit a machine-readable JSON report on stdout
  -h, --help        Show this help`);
}

export async function run(argv: string[] = process.argv.slice(2)): Promise<number> {
  const args = parseArgs(argv);
  const logger = createLogger("generate-metadata");

  try {
    const report = await generateMetadata({
      repoRoot: args.root,
      outRoot: args.outRoot,
      dryRun: args.dry,
      logger,
    });

    if (args.json) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(report, null, 2));
    } else {
      logger.info(
        `manifests: ${report.count} | written: ${report.written} | skipped: ${report.skipped} | errors: ${report.errors.length}`,
      );
      for (const e of report.entries.slice(0, 10)) {
        logger.info(`  ${pc.cyan(e.slug)} -> ${ensurePosix(e.outFile)}`);
      }
      if (report.entries.length > 10) {
        logger.info(`  …and ${report.entries.length - 10} more`);
      }
      for (const err of report.errors) {
        logger.error(`${err.name ?? "?"}: ${err.message}`);
      }
      if (report.ok) logger.success("done");
      else logger.error("completed with errors");
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
          written: 0,
          skipped: 0,
          entries: [],
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
