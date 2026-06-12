/**
 * generate-docs-page
 *
 * For each component manifest (per the SSOT contract in manifest-schema.ts),
 * emit a docs page React section at
 *   apps/web/src/app/docs/sections/<Name>.section.tsx
 *
 * Each section is a self-contained, server-renderable React component that
 * mirrors the existing showcase but with deeper docs detail:
 *   - Status / deprecation banner (when applicable)
 *   - Component name + description
 *   - Full Props table (name, type, required, default, description)
 *   - A11y block (WCAG level, ARIA patterns, notes)
 *   - Keyboard bindings table (key, action, when)
 *   - Examples list (label + code block, when codeOverride is provided)
 *
 * Safety: NEVER overwrites hand-authored files. Always writes
 *   <Name>.section.tsx into a NEW `sections/` subtree; the orchestrator owns
 *   wiring sections into the docs route (out of scope for this generator).
 *
 * Usage (CLI):
 *   tsx scripts/build-docs/generate-docs-page.ts                 # writes files
 *   tsx scripts/build-docs/generate-docs-page.ts --dry           # plan only
 *   tsx scripts/build-docs/generate-docs-page.ts --json          # CI report
 *   tsx scripts/build-docs/generate-docs-page.ts --root <path>   # custom repo root
 *   tsx scripts/build-docs/generate-docs-page.ts --out-root <p>  # custom out root
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

export const FILE_EXT = ".section.tsx";
export const DEFAULT_OUT_SUBPATH = "apps/web/src/app/docs/sections";

export interface PropEntry {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string;
  description: string;
}

export interface KeyboardEntry {
  key: string;
  does: string;
  when: string;
}

export interface ExampleEntry {
  id: string;
  label: string;
  description: string;
  code: string;
}

export interface DeprecationInfo {
  deprecated: boolean;
  note: string;
  replacement: string;
  removedIn: string;
}

export interface DocsPagePlanEntry {
  /** Component name from the manifest (PascalCase). */
  name: string;
  /** Route slug (kebab-case). */
  slug: string;
  /** Absolute POSIX path of the output file. */
  outFile: string;
  /** Status (stable/beta/deprecated/experimental/auto-drafted). */
  status: string;
  /** Category (actions/forms/etc). */
  category: string;
  /** SemVer string of `since`. */
  since: string;
  /** Description (cleaned). */
  description: string;
  /** Highlights list (1–N). */
  highlights: string[];
  /** Props normalized as a flat table. */
  props: PropEntry[];
  /** WCAG level, e.g. "2.1 AA". */
  wcagLevel: string;
  /** ARIA patterns array. */
  ariaPatterns: string[];
  /** Long-form a11y notes (may be empty). */
  ariaNotes: string;
  /** Keyboard bindings (may be empty). */
  keyboard: KeyboardEntry[];
  /** Examples with code (may be empty). */
  examples: ExampleEntry[];
  /** Related component names (may be empty). */
  related: string[];
  /** Tags (may be empty). */
  tags: string[];
  /** Deprecation banner data. */
  deprecation: DeprecationInfo;
}

export interface GenerateDocsPageOptions {
  repoRoot: string;
  /** Output directory root; default: <root>/apps/web/src/app/docs/sections */
  outRoot?: string;
  /** Pre-loaded manifests; if omitted the generator scans the FS. */
  manifests?: ManifestRecord[];
  /** When true, do not write files — return the plan only. */
  dryRun?: boolean;
  logger?: Logger;
}

export interface GenerateDocsPageReport {
  ok: boolean;
  count: number;
  written: number;
  skipped: number;
  entries: DocsPagePlanEntry[];
  errors: Array<{ name?: string; file?: string; message: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensurePosix(p: string): string {
  return p.split(path.sep).join("/");
}

/** PascalCase -> kebab-case via change-case. */
export function slugFor(name: string): string {
  return kebabCase(name);
}

/** Normalize whitespace and trim. */
function clean(s: unknown): string {
  if (typeof s !== "string") return "";
  return s.trim().replace(/\s+/g, " ");
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.length > 0);
}

function stringifyDefault(v: unknown): string {
  if (v === undefined) return "";
  if (v === null) return "null";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/** Normalize manifest.props (either "auto", {extractedFrom}, or a permissive list). */
export function normalizeProps(manifest: PermissiveManifest): PropEntry[] {
  const raw = manifest.props as unknown;
  // The strict schema only allows 'auto' | { extractedFrom?: string }; in those
  // cases there are no props to render until a separate extractor populates
  // them. The permissive Manifest type (used by readManifest) also accepts an
  // array, which we honour here so docs pages can be rendered offline.
  if (!Array.isArray(raw)) return [];
  const out: PropEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const name = clean(rec.name);
    if (!name) continue;
    out.push({
      name,
      type: clean(rec.type) || "unknown",
      required: rec.required === true,
      defaultValue: stringifyDefault(rec.default),
      description: clean(rec.description),
    });
  }
  return out;
}

/** Normalize keyboard bindings into a stable flat shape. */
export function normalizeKeyboard(manifest: PermissiveManifest): KeyboardEntry[] {
  const a11y = manifest.a11y as unknown;
  if (!a11y || typeof a11y !== "object") return [];
  const kbd = (a11y as { keyboard?: unknown }).keyboard;
  if (!Array.isArray(kbd)) return [];
  const out: KeyboardEntry[] = [];
  for (const b of kbd) {
    if (!b || typeof b !== "object") continue;
    const rec = b as Record<string, unknown>;
    const key = clean(rec.key);
    const does = clean(rec.does);
    if (!key || !does) continue;
    out.push({ key, does, when: clean(rec.when) });
  }
  return out;
}

/** Normalize examples: only include examples that carry a renderable code string. */
export function normalizeExamples(manifest: PermissiveManifest): ExampleEntry[] {
  const ex = manifest.examples as unknown;
  if (!Array.isArray(ex)) return [];
  const out: ExampleEntry[] = [];
  for (const e of ex) {
    if (!e || typeof e !== "object") continue;
    const rec = e as Record<string, unknown>;
    const id = clean(rec.id);
    const label = clean(rec.label) || id;
    if (!id && !label) continue;
    // Examples carrying a renderable code snippet — either `codeOverride`
    // (strict schema) or a permissive `code` field — are emitted as <pre>
    // blocks. Examples without code are skipped: the runtime <Component>
    // cannot survive serialization through a generated file.
    const code = clean(
      typeof rec.codeOverride === "string" ? rec.codeOverride : (rec.code as string | undefined),
    );
    if (!code) continue;
    out.push({
      id: id || slugFor(label),
      label,
      description: clean(rec.description),
      code,
    });
  }
  return out;
}

/** Normalize deprecation block. Accepts strict-shape fields OR permissive `deprecated`. */
export function normalizeDeprecation(manifest: PermissiveManifest): DeprecationInfo {
  const status = clean(manifest.status as string);
  const dep = manifest.deprecated as unknown;
  // Strict-schema fields take precedence; fall back to a permissive object.
  let note = clean(manifest.deprecatedNote as string);
  let replacement = clean(manifest.deprecatedReplacement as string);
  let removedIn = clean(manifest.deprecatedRemovedIn as string);

  if (dep && typeof dep === "object") {
    const rec = dep as Record<string, unknown>;
    note = note || clean(rec.note as string);
    replacement = replacement || clean(rec.replacement as string);
    removedIn = removedIn || clean(rec.since as string);
  }

  const deprecated = status === "deprecated" || dep === true || (typeof dep === "object" && dep !== null);

  return { deprecated, note, replacement, removedIn };
}

/** Build a fully-resolved plan entry from a manifest record. */
export function planEntryFor(
  rec: ManifestRecord,
  outRoot: string,
): DocsPagePlanEntry {
  const manifest = rec.manifest as PermissiveManifest;
  const name = manifest.name;
  if (!name || typeof name !== "string") {
    throw new Error(
      `manifest at ${rec.manifestFile} is missing a string \`name\` field`,
    );
  }
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    throw new Error(
      `manifest at ${rec.manifestFile}: name "${name}" must be PascalCase`,
    );
  }

  const slug = slugFor(name);
  const outFile = ensurePosix(path.join(outRoot, `${name}${FILE_EXT}`));

  const a11y = (manifest.a11y as Record<string, unknown> | undefined) ?? {};
  const wcagLevel = clean((a11y.wcag as string) ?? "");
  const ariaPatterns = asStringArray(a11y.patterns);
  const ariaNotes = clean((a11y.notes as string) ?? "");

  return {
    name,
    slug,
    outFile,
    status: clean(manifest.status as string) || "stable",
    category: clean(manifest.category as string),
    since: clean(manifest.since as string),
    description: clean(manifest.description as string),
    highlights: asStringArray(manifest.highlights),
    props: normalizeProps(manifest),
    wcagLevel,
    ariaPatterns,
    ariaNotes,
    keyboard: normalizeKeyboard(manifest),
    examples: normalizeExamples(manifest),
    related: asStringArray(manifest.related),
    tags: asStringArray(manifest.tags),
    deprecation: normalizeDeprecation(manifest),
  };
}

// ---------------------------------------------------------------------------
// Code emitter — produces a self-contained React Server Component module.
// ---------------------------------------------------------------------------

const FILE_BANNER = `// AUTO-GENERATED by scripts/build-docs/generate-docs-page.ts
// Do NOT edit by hand. Re-run \`tsx scripts/build-docs/generate-docs-page.ts\`.
// Source manifest: see <Component>.manifest.ts beside the implementation.
`;

/**
 * JSX-safe escape: replace &, <, >, { and } plus the quote characters that
 * eslint's react/no-unescaped-entities forbids as raw JSX text — manifest
 * prose routinely contains `"like this"` and apostrophes.
 */
export function escapeJsxText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** JS template-literal-safe escape: protect backticks, backslashes, and ${. */
export function escapeForTemplateLiteral(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

/** JSX attribute literal: single-quoted, with backslash + apostrophe escaped. */
function jsxAttr(s: string): string {
  return `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function renderHighlights(highlights: string[]): string {
  if (highlights.length === 0) return "";
  const lis = highlights
    .map((h) => `        <li>${escapeJsxText(h)}</li>`)
    .join("\n");
  return [
    `      <ul className="docs-highlights">`,
    lis,
    `      </ul>`,
  ].join("\n");
}

function renderDeprecationBanner(d: DeprecationInfo): string {
  if (!d.deprecated) return "";
  const parts: string[] = [];
  parts.push(`        <strong>Deprecated.</strong>`);
  if (d.note) parts.push(`{' '}${escapeJsxText(d.note)}`);
  if (d.replacement) {
    parts.push(`{' '}Use <code>${escapeJsxText(d.replacement)}</code> instead.`);
  }
  if (d.removedIn) {
    parts.push(`{' '}Removed in v${escapeJsxText(d.removedIn)}.`);
  }
  return [
    `      <aside role="alert" className="docs-deprecation">`,
    `        ${parts.join("")}`,
    `      </aside>`,
  ].join("\n");
}

function renderPropsTable(props: PropEntry[]): string {
  if (props.length === 0) {
    return `      <p className="docs-empty">No props documented yet.</p>`;
  }
  const rows = props
    .map((p) =>
      [
        `          <tr>`,
        `            <td><code>${escapeJsxText(p.name)}</code>${p.required ? `<span className="docs-required" aria-label="required">*</span>` : ""}</td>`,
        `            <td><code>${escapeJsxText(p.type)}</code></td>`,
        `            <td>${p.defaultValue ? `<code>${escapeJsxText(p.defaultValue)}</code>` : `<span className="docs-muted">—</span>`}</td>`,
        `            <td>${escapeJsxText(p.description) || `<span className="docs-muted">—</span>`}</td>`,
        `          </tr>`,
      ].join("\n"),
    )
    .join("\n");
  return [
    `      <table className="docs-props">`,
    `        <thead>`,
    `          <tr>`,
    `            <th scope="col">Prop</th>`,
    `            <th scope="col">Type</th>`,
    `            <th scope="col">Default</th>`,
    `            <th scope="col">Description</th>`,
    `          </tr>`,
    `        </thead>`,
    `        <tbody>`,
    rows,
    `        </tbody>`,
    `      </table>`,
  ].join("\n");
}

function renderKeyboardTable(rows: KeyboardEntry[]): string {
  if (rows.length === 0) return "";
  const body = rows
    .map((r) =>
      [
        `          <tr>`,
        `            <td><kbd>${escapeJsxText(r.key)}</kbd></td>`,
        `            <td>${escapeJsxText(r.does)}</td>`,
        `            <td>${r.when ? escapeJsxText(r.when) : `<span className="docs-muted">—</span>`}</td>`,
        `          </tr>`,
      ].join("\n"),
    )
    .join("\n");
  return [
    `      <table className="docs-keyboard">`,
    `        <thead>`,
    `          <tr>`,
    `            <th scope="col">Key</th>`,
    `            <th scope="col">Action</th>`,
    `            <th scope="col">When</th>`,
    `          </tr>`,
    `        </thead>`,
    `        <tbody>`,
    body,
    `        </tbody>`,
    `      </table>`,
  ].join("\n");
}

function renderA11ySection(entry: DocsPagePlanEntry): string {
  const lines: string[] = [];
  lines.push(`    <section aria-labelledby="${entry.slug}-a11y">`);
  lines.push(`      <h3 id="${entry.slug}-a11y">Accessibility</h3>`);
  if (entry.wcagLevel) {
    lines.push(
      `      <p>WCAG target: <strong>${escapeJsxText(entry.wcagLevel)}</strong></p>`,
    );
  }
  if (entry.ariaPatterns.length > 0) {
    lines.push(`      <ul className="docs-aria-patterns">`);
    for (const p of entry.ariaPatterns) {
      lines.push(`        <li><code>${escapeJsxText(p)}</code></li>`);
    }
    lines.push(`      </ul>`);
  }
  if (entry.ariaNotes) {
    lines.push(`      <p className="docs-aria-notes">${escapeJsxText(entry.ariaNotes)}</p>`);
  }
  const kbd = renderKeyboardTable(entry.keyboard);
  if (kbd) {
    lines.push(`      <h4>Keyboard</h4>`);
    lines.push(kbd);
  }
  lines.push(`    </section>`);
  return lines.join("\n");
}

function renderExamples(examples: ExampleEntry[]): string {
  if (examples.length === 0) return "";
  const blocks = examples
    .map((e) => {
      const code = escapeForTemplateLiteral(e.code);
      const desc = e.description
        ? `        <p>${escapeJsxText(e.description)}</p>\n`
        : "";
      return [
        `      <article className="docs-example" id="example-${e.id}">`,
        `        <h4>${escapeJsxText(e.label)}</h4>`,
        desc + `        <pre className="docs-code"><code>{\`${code}\`}</code></pre>`,
        `      </article>`,
      ].join("\n");
    })
    .join("\n");
  return [
    `    <section aria-label="Examples">`,
    `      <h3>Examples</h3>`,
    blocks,
    `    </section>`,
  ].join("\n");
}

function renderRelated(related: string[]): string {
  if (related.length === 0) return "";
  const items = related
    .map((r) => `        <li><a href="#${slugFor(r)}">${escapeJsxText(r)}</a></li>`)
    .join("\n");
  return [
    `    <section aria-label="Related components">`,
    `      <h3>Related</h3>`,
    `      <ul className="docs-related">`,
    items,
    `      </ul>`,
    `    </section>`,
  ].join("\n");
}

function renderMeta(entry: DocsPagePlanEntry): string {
  const tags = entry.tags.length
    ? `      <p className="docs-tags">${entry.tags.map((t) => `<span>${escapeJsxText(t)}</span>`).join("")}</p>\n`
    : "";
  return [
    `    <dl className="docs-meta">`,
    `      <dt>Status</dt><dd>${escapeJsxText(entry.status)}</dd>`,
    entry.category
      ? `      <dt>Category</dt><dd>${escapeJsxText(entry.category)}</dd>`
      : ``,
    entry.since
      ? `      <dt>Since</dt><dd>v${escapeJsxText(entry.since)}</dd>`
      : ``,
    `    </dl>`,
    tags,
  ]
    .filter(Boolean)
    .join("\n");
}

export function renderSectionModule(entry: DocsPagePlanEntry): string {
  const lines: string[] = [];
  lines.push(FILE_BANNER);
  lines.push(`import * as React from 'react';`);
  lines.push(``);
  lines.push(`export interface ${entry.name}DocsSectionProps {`);
  lines.push(`  className?: string;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(
    `export const ${entry.name}DocsMeta = {`,
  );
  lines.push(`  name: ${jsxAttr(entry.name)},`);
  lines.push(`  slug: ${jsxAttr(entry.slug)},`);
  lines.push(`  status: ${jsxAttr(entry.status)},`);
  lines.push(`  category: ${jsxAttr(entry.category)},`);
  lines.push(`  since: ${jsxAttr(entry.since)},`);
  lines.push(`  deprecated: ${entry.deprecation.deprecated ? "true" : "false"},`);
  lines.push(`} as const;`);
  lines.push(``);
  lines.push(
    `export function ${entry.name}DocsSection({ className }: ${entry.name}DocsSectionProps): React.ReactElement {`,
  );
  lines.push(`  return (`);
  lines.push(
    `    <section id={${jsxAttr(entry.slug)}} aria-labelledby={${jsxAttr(`${entry.slug}-heading`)}} className={className} data-status=${jsxAttr(entry.status)}>`,
  );
  lines.push(
    `      <h2 id=${jsxAttr(`${entry.slug}-heading`)}>${escapeJsxText(entry.name)}</h2>`,
  );

  const banner = renderDeprecationBanner(entry.deprecation);
  if (banner) lines.push(banner);

  if (entry.description) {
    lines.push(`      <p className="docs-lead">${escapeJsxText(entry.description)}</p>`);
  }
  const highlights = renderHighlights(entry.highlights);
  if (highlights) lines.push(highlights);

  lines.push(renderMeta(entry));

  lines.push(`    <section aria-label="Props">`);
  lines.push(`      <h3>Props</h3>`);
  lines.push(renderPropsTable(entry.props));
  lines.push(`    </section>`);

  lines.push(renderA11ySection(entry));

  const examples = renderExamples(entry.examples);
  if (examples) lines.push(examples);

  const related = renderRelated(entry.related);
  if (related) lines.push(related);

  lines.push(`    </section>`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export default ${entry.name}DocsSection;`);
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

export class GenerateDocsPageGenerator extends Generator {
  name = "generate-docs-page";

  constructor(private readonly outRoot: string) {
    super();
  }

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const writes = ctx.manifests.map((rec) => {
      const entry = planEntryFor(rec, this.outRoot);
      return { path: entry.outFile, content: renderSectionModule(entry) };
    });
    return { writes };
  }
}

// ---------------------------------------------------------------------------
// Programmatic API (default export)
// ---------------------------------------------------------------------------

export async function generateDocsPage(
  opts: GenerateDocsPageOptions,
): Promise<GenerateDocsPageReport> {
  const logger = opts.logger ?? createLogger("generate-docs-page");
  const repoRoot = path.resolve(opts.repoRoot);
  const outRoot =
    opts.outRoot ?? ensurePosix(path.join(repoRoot, DEFAULT_OUT_SUBPATH));

  const errors: GenerateDocsPageReport["errors"] = [];

  let manifests: ManifestRecord[];
  if (opts.manifests) {
    manifests = opts.manifests;
  } else {
    manifests = await loadManifestsForRoot(repoRoot, logger);
  }

  const entries: DocsPagePlanEntry[] = [];
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
      const code = renderSectionModule(entry);
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

  return {
    ok: errors.length === 0,
    count: manifests.length,
    written,
    skipped,
    entries,
    errors,
  };
}

export default generateDocsPage;

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
  console.log(`generate-docs-page — emit <Name>.section.tsx per manifest

Options:
  --root <path>     Repository root (default: cwd)
  --out-root <path> Output root (default: <root>/${DEFAULT_OUT_SUBPATH})
  --dry, --dry-run  Plan only — do not write files
  --json            Emit a machine-readable JSON report on stdout
  -h, --help        Show this help`);
}

export async function run(argv: string[] = process.argv.slice(2)): Promise<number> {
  const args = parseArgs(argv);
  const logger = createLogger("generate-docs-page");

  try {
    const report = await generateDocsPage({
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
        logger.info(`  ${pc.cyan(e.name)} -> ${ensurePosix(e.outFile)}`);
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
