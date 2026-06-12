/**
 * generate-stories
 *
 * For each component that has a sibling *.manifest.ts but NO sibling
 * *.stories.tsx, emit a stub story file at
 *   packages/<pkg>/src/<cat>/<Name>.stories.tsx
 *
 * The stub:
 *   - Imports the Component (default + named when available is unknown at gen
 *     time, so we re-export everything as `* as Component` and pick a Story
 *     wrapper per example via the manifest's example registry).
 *   - Imports the manifest's examples (Component refs) and the manifest meta.
 *   - Exposes each ManifestExample as a Storybook CSF3 `StoryObj`.
 *   - Tags `["autodocs"]` at the meta level so Storybook autodocs builds the
 *     reference docs page from the manifest + props extraction.
 *
 * Safety:
 *   - NEVER overwrites a hand-authored *.stories.tsx file. If one already
 *     exists at the destination path the component is skipped.
 *   - NEVER touches the existing root-level category stories at
 *     packages/ui-kit/src/<cat>.stories.tsx (Ola 4b territory). Those are
 *     never the emission target because emission targets are per-component
 *     siblings inside category subdirectories.
 *   - When the manifest declares zero examples, the component is still
 *     skipped (a story file with no stories would be a Storybook error).
 *
 * Programmatic API + thin CLI wrapper. JSON mode for CI consumption.
 * Exit codes: 0 success, 1 unhandled error.
 */

import fs from "fs-extra";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  Generator,
  type GeneratorContext,
  type GeneratorResult,
  type ManifestRecord,
  readManifest,
  writeOutput,
} from "./_lib/generator-base.js";
import { createLogger, defaultLogger, type Logger } from "./_lib/logger.js";
import { findComponentDirs } from "./_lib/scan-fs.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoryStubInput {
  /** PascalCase component name, taken from the manifest. */
  componentName: string;
  /** Storybook title path, e.g. "UI Kit / Cards / PixelFeatureCard". */
  storybookTitle: string;
  /** Module specifier used to import the Component (POSIX, no extension). */
  componentImport: string;
  /** Module specifier used to import the manifest (POSIX, no extension). */
  manifestImport: string;
  /** Module specifier used to import examples; undefined when no examples file. */
  examplesImport?: string;
  /** Examples declared by the manifest. */
  examples: Array<{
    id: string;
    label: string;
    description?: string;
    tags?: string[];
  }>;
  /** Component status — surfaces as a story tag for filtering in Storybook. */
  status?: string;
  /** Category — surfaces as a story tag for filtering in Storybook. */
  category?: string;
}

export interface StoryStubOutput {
  /** Absolute POSIX path to the destination *.stories.tsx file. */
  path: string;
  /** Rendered TSX content. */
  content: string;
}

export interface GenerateStoriesOptions {
  repoRoot: string;
  /**
   * When omitted, the generator will scan the repo for manifests itself.
   */
  manifests?: ManifestRecord[];
  /**
   * When true, do not write files; just return outputs. CLI accepts --dry-run.
   */
  dryRun?: boolean;
  /**
   * When true, allow overwriting existing *.stories.tsx siblings. Off by default
   * to preserve hand-authored stories. Reserved for forced re-emit flows; CLI
   * does NOT expose this flag in Ola 4c.1.
   */
  force?: boolean;
  logger?: Logger;
}

export interface GenerateStoriesResult {
  outputs: StoryStubOutput[];
  /** Components skipped because a sibling *.stories.tsx already exists. */
  skippedExisting: string[];
  /** Components skipped because the manifest has zero examples. */
  skippedNoExamples: string[];
  /** Manifests that could not be classified to a Storybook title. */
  failed: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function stripExt(file: string): string {
  return file.replace(/\.tsx?$/, "");
}

/**
 * Build the destination *.stories.tsx path for a manifest's source component.
 * Mirrors the source location exactly: <dir>/<Name>.stories.tsx.
 */
export function deriveStoriesPath(sourceFile: string): string {
  const dir = path.dirname(sourceFile);
  const base = path.basename(sourceFile, ".tsx");
  return toPosix(path.join(dir, `${base}.stories.tsx`));
}

/**
 * Title-case helper for Storybook title segments. Splits on hyphens and
 * uppercases the first letter of each token.
 */
export function titleCaseSegment(segment: string): string {
  if (segment.length === 0) return segment;
  return segment
    .split(/[-_]/)
    .filter((s) => s.length > 0)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

/**
 * Build a Storybook title for a manifest. Conventions:
 *   - root namespace: "UI Kit" when the package is "@pxlkit/ui-kit",
 *     otherwise the package name with the @ scope stripped and PascalCased.
 *   - second segment: the category (Title-Cased).
 *   - leaf: the component name verbatim.
 *
 * Examples:
 *   @pxlkit/ui-kit + cards + PixelFeatureCard
 *     → "UI Kit / Cards / PixelFeatureCard"
 *   @pxlkit/effects + animations + PixelGlitch
 *     → "Effects / Animations / PixelGlitch"
 */
export function deriveStorybookTitle(record: ManifestRecord): string {
  const m = record.manifest;
  const root =
    record.package === "@pxlkit/ui-kit"
      ? "UI Kit"
      : titleCaseSegment(record.package.replace(/^@[^/]+\//, "").replace(/^@/, ""));
  const category = m.category ? titleCaseSegment(String(m.category)) : "Misc";
  const name = m.name;
  return `${root} / ${category} / ${name}`;
}

/**
 * Derive the module specifier used inside the generated stories file to
 * import a sibling file. We use a relative POSIX path WITHOUT extension so the
 * existing TS/Vite resolution rules apply (Storybook's vite-builder handles
 * both .ts and .tsx).
 */
function siblingSpecifier(fromFile: string, targetFile: string): string {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, targetFile);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return toPosix(stripExt(rel));
}

/**
 * CSF3 identifier safe-ifier for story export names.
 * "with-icon"  -> "WithIcon"
 * "default"    -> "Default"
 * "with/slash" -> "WithSlash"
 * Strips leading digits (TS identifiers can't start with a digit).
 */
export function exampleIdToExportName(id: string): string {
  const cleaned = id.replace(/[^a-zA-Z0-9-_]/g, "-");
  const parts = cleaned.split(/[-_]+/).filter((p) => p.length > 0);
  const pascal = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
  return /^[0-9]/.test(pascal) ? `Story${pascal}` : pascal || "Default";
}

/**
 * U+2028 LINE SEPARATOR / U+2029 PARAGRAPH SEPARATOR. Built via fromCharCode
 * so the characters themselves never appear in this source file (they are
 * line terminators and would be invalid inside regex/string literals).
 */
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);

/**
 * Single quote escaper for inlining literals safely.
 * Also escapes line terminators (\r, \n, U+2028, U+2029) — a raw newline
 * inside a single-quoted literal is a syntax error.
 */
function escSingle(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .split(LINE_SEP)
    .join("\\u2028")
    .split(PARA_SEP)
    .join("\\u2029");
}

/**
 * Sanitizer for text inlined into block comments. A literal star-slash in a
 * label or description would terminate the comment early and break the parse.
 * Newlines are flattened so the JSDoc banner stays a single line.
 */
function escComment(s: string): string {
  return s
    .replace(/\*\//g, "*\\/")
    .replace(/\r?\n/g, " ")
    .split(LINE_SEP)
    .join(" ")
    .split(PARA_SEP)
    .join(" ");
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

/**
 * Render the stub *.stories.tsx contents.
 * Pure function; no filesystem access. Exposed for unit tests.
 */
export function renderStoryStub(input: StoryStubInput): string {
  const {
    componentName,
    storybookTitle,
    componentImport,
    manifestImport,
    examplesImport,
    examples,
    status,
    category,
  } = input;

  if (examples.length === 0) {
    throw new Error(
      `renderStoryStub: refusing to render '${componentName}' with zero examples`,
    );
  }

  const lines: string[] = [];
  lines.push(
    "// @ts-nocheck — generated stub. Delete this comment after curating.",
    "/* eslint-disable */",
    "/**",
    ` * AUTO-GENERATED stub story for ${componentName}.`,
    " * Source: scripts/build-docs/generate-stories.ts",
    " *",
    " * Safe to edit — once this file is committed the generator will refuse",
    " * to overwrite it (a hand-authored *.stories.tsx is detected).",
    " */",
    "",
    `import type { Meta, StoryObj } from '@storybook/react';`,
    `import * as Component from '${escSingle(componentImport)}';`,
    `import manifest from '${escSingle(manifestImport)}';`,
  );

  if (examplesImport) {
    lines.push(
      `import * as examples from '${escSingle(examplesImport)}';`,
    );
  } else {
    lines.push(
      `// No sibling examples file detected; relying on manifest.examples.`,
      `const examples: Record<string, unknown> = {};`,
    );
  }

  const tagList: string[] = ["autodocs"];
  if (status) tagList.push(`status-${status}`);
  if (category) tagList.push(`cat-${category}`);

  lines.push(
    "",
    `const meta: Meta = {`,
    `  title: '${escSingle(storybookTitle)}',`,
    `  component: (Component as any).${componentName} ?? (Component as any).default,`,
    `  tags: ${JSON.stringify(tagList)},`,
    `  parameters: {`,
    `    layout: 'padded',`,
    `    docs: {`,
    `      description: {`,
    `        component:`,
    `          (manifest as any)?.description ?? '${escSingle(componentName)} — generated stub.',`,
    `      },`,
    `    },`,
    `    manifest,`,
    `  },`,
    `};`,
    "",
    `export default meta;`,
    `type Story = StoryObj<typeof meta>;`,
    "",
  );

  // Export names are PascalCased from example ids; distinct ids can collide
  // (e.g. "with-icon" / "with_icon"). Duplicate exports are a module-level
  // SyntaxError at runtime, so suffix repeats with a counter.
  const usedExportNames = new Map<string, number>();

  for (const ex of examples) {
    const baseExportName = exampleIdToExportName(ex.id);
    const seen = usedExportNames.get(baseExportName) ?? 0;
    usedExportNames.set(baseExportName, seen + 1);
    const exportName = seen === 0 ? baseExportName : `${baseExportName}${seen + 1}`;
    // NEVER dot-access the raw id: kebab ids parse as subtraction and break
    // outright when a segment is a reserved word (`class`, `in`, `with`,
    // `default`). Examples modules export PascalCase functions, so the
    // identifier lookup uses the derived export name; the raw id stays
    // available via (always-valid) bracket access.
    const sourceRef = `(examples as any).${baseExportName} ?? (examples as any)['${escSingle(ex.id)}']`;
    const manifestRef = `(manifest as any)?.examples?.find?.((e: any) => e?.id === '${escSingle(ex.id)}')?.Component`;
    const descLiteral = ex.description ? `'${escSingle(ex.description)}'` : "undefined";
    const labelLiteral = `'${escSingle(ex.label)}'`;
    const tagsLiteral = JSON.stringify(
      Array.from(new Set([...(ex.tags ?? []), `example-${ex.id}`])),
    );

    lines.push(
      `/** ${escComment(ex.label)}${ex.description ? ` — ${escComment(ex.description)}` : ""} */`,
      `export const ${exportName}: Story = {`,
      `  name: ${labelLiteral},`,
      `  tags: ${tagsLiteral},`,
      `  parameters: {`,
      `    docs: { description: { story: ${descLiteral} } },`,
      `  },`,
      `  render: () => {`,
      `    const ExampleComponent =`,
      `      (${sourceRef}) ??`,
      `      (${manifestRef});`,
      `    if (!ExampleComponent) {`,
      `      return (`,
      `        <pre style={{ color: 'crimson' }}>`,
      // JSX expression container with a JSON-escaped literal: ids may contain
      // characters that are JSX-hostile as raw text ({, }, <, >).
      `          {${JSON.stringify(`Missing example '${ex.id}' for ${componentName}.`)}}`,
      `        </pre>`,
      `      );`,
      `    }`,
      `    return <ExampleComponent />;`,
      `  },`,
      `};`,
      "",
    );
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

async function scanManifestsForRoot(
  repoRoot: string,
  logger: Logger,
): Promise<ManifestRecord[]> {
  const dirs = await findComponentDirs(repoRoot);
  const out: ManifestRecord[] = [];
  for (const dir of dirs) {
    const tsxFiles = (await fs.readdir(dir)).filter(
      (f) =>
        f.endsWith(".tsx") &&
        !f.includes(".stories.") &&
        !f.includes(".test.") &&
        !f.includes(".examples."),
    );
    for (const tsx of tsxFiles) {
      const rec = await readManifest(path.join(dir, tsx));
      if (rec) out.push(rec);
      else
        logger.warn(
          `no manifest loaded for ${toPosix(path.join(dir, tsx))} (skipped)`,
        );
    }
  }
  return out;
}

/**
 * Normalise a manifest record into the StoryStubInput consumed by the renderer.
 * Pure transform — no filesystem access (specifiers are computed only).
 * Exposed so tests can drive renderStoryStub directly without disk I/O.
 */
export function manifestToStubInput(record: ManifestRecord): StoryStubInput | null {
  const m = record.manifest;
  const examples = Array.isArray(m.examples) ? m.examples : [];
  if (examples.length === 0) return null;

  const storiesPath = deriveStoriesPath(record.sourceFile);
  const componentImport = siblingSpecifier(storiesPath, record.sourceFile);
  const manifestImport = siblingSpecifier(storiesPath, record.manifestFile);
  const examplesImport = record.examplesFile
    ? siblingSpecifier(storiesPath, record.examplesFile)
    : undefined;

  return {
    componentName: m.name,
    storybookTitle: deriveStorybookTitle(record),
    componentImport,
    manifestImport,
    examplesImport,
    examples: examples.map((e) => ({
      id: String((e as { id?: string }).id ?? "default"),
      label: String((e as { label?: string }).label ?? (e as { name?: string }).name ?? "Default"),
      description:
        typeof (e as { description?: string }).description === "string"
          ? (e as { description?: string }).description
          : undefined,
      tags:
        Array.isArray((e as { tags?: string[] }).tags)
          ? ((e as { tags?: string[] }).tags as string[])
          : undefined,
    })),
    status: typeof m.status === "string" ? m.status : undefined,
    category: typeof m.category === "string" ? m.category : undefined,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateStories(
  opts: GenerateStoriesOptions,
): Promise<GenerateStoriesResult> {
  const logger = opts.logger ?? createLogger("stories");
  const repoRoot = opts.repoRoot;

  const manifests =
    opts.manifests ?? (await scanManifestsForRoot(repoRoot, logger));

  const outputs: StoryStubOutput[] = [];
  const skippedExisting: string[] = [];
  const skippedNoExamples: string[] = [];
  const failed: string[] = [];

  for (const record of manifests) {
    const stub = manifestToStubInput(record);
    if (!stub) {
      skippedNoExamples.push(record.manifest.name);
      logger.warn(
        `skipped '${record.manifest.name}' — manifest declares no examples`,
      );
      continue;
    }

    const outPath = deriveStoriesPath(record.sourceFile);

    if (!opts.force && (await fs.pathExists(outPath))) {
      skippedExisting.push(outPath);
      logger.info(
        `skipped ${outPath} — hand-authored *.stories.tsx already present`,
      );
      continue;
    }

    let content: string;
    try {
      content = renderStoryStub(stub);
    } catch (err) {
      failed.push(record.manifest.name);
      logger.error(
        `failed to render stub for '${record.manifest.name}': ${(err as Error).message}`,
      );
      continue;
    }

    outputs.push({ path: outPath, content });
  }

  if (!opts.dryRun) {
    for (const o of outputs) {
      await writeOutput(o.path, o.content);
      logger.success(`wrote ${o.path}`);
    }
  }

  return { outputs, skippedExisting, skippedNoExamples, failed };
}

// ---------------------------------------------------------------------------
// Generator base wrapper (for orchestrator use)
// ---------------------------------------------------------------------------

export class GenerateStoriesGenerator extends Generator {
  name = "generate-stories";

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const res = await generateStories({
      repoRoot: ctx.repoRoot,
      manifests: ctx.manifests,
      dryRun: true,
      logger: ctx.logger,
    });
    return {
      writes: res.outputs.map((o) => ({ path: o.path, content: o.content })),
    };
  }
}

export default GenerateStoriesGenerator;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function run(argv: string[]): Promise<number> {
  const json = argv.includes("--json");
  const dryRun = argv.includes("--dry-run");
  const repoRootArg = argv.find((a) => a.startsWith("--root="));
  const repoRoot = repoRootArg
    ? path.resolve(repoRootArg.slice("--root=".length))
    : process.cwd();

  const logger = json ? createLogger("stories") : defaultLogger;
  try {
    const result = await generateStories({ repoRoot, dryRun, logger });
    if (json) {
      const payload = {
        ok: true,
        wrote: result.outputs.map((o) => o.path),
        skippedExisting: result.skippedExisting,
        skippedNoExamples: result.skippedNoExamples,
        failed: result.failed,
      };
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(payload, null, 2));
    } else {
      logger.success(
        `Generated ${result.outputs.length} story stubs ` +
          `(${result.skippedExisting.length} skipped existing, ` +
          `${result.skippedNoExamples.length} skipped no examples, ` +
          `${result.failed.length} failed)`,
      );
    }
    return 0;
  } catch (err) {
    const msg = (err as Error).message;
    if (json) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ ok: false, error: msg }, null, 2));
    } else {
      logger.error(msg);
    }
    return 1;
  }
}

const isMain =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  void run(process.argv.slice(2)).then((code) => process.exit(code));
}
