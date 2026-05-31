/**
 * generate-showcase
 *
 * Emits one `<Name>.section.tsx` file per manifest into
 *   apps/web/src/app/ui-kit/sections/
 *
 * Each section file exposes a default React component shaped as:
 *
 *   <div id="<kebab-name>" data-component="<Name>">
 *     <header>
 *       <h2>Name</h2>
 *       <span data-badge="category">category</span>
 *       <span data-badge="since">vX.Y.Z</span>
 *       <span data-badge="status">status</span>
 *     </header>
 *     <p>description</p>
 *
 *     <Tabs>
 *       Preview  - renders each example's Component
 *       Code     - raw-imports each example source file
 *       Props    - dumps manifest.props or "auto" placeholder
 *       A11y     - dumps a11y block (wcag, patterns, keyboard)
 *     </Tabs>
 *   </div>
 *
 * SAFETY: never overwrites hand-authored files. If a `<Name>.section.tsx`
 * already exists at the target path the generator writes
 * `<Name>.generated.section.tsx` next to it instead.
 *
 * NOTE: this ola does NOT wire the produced sections into /ui-kit page.tsx.
 * That is Ola 4c.3's job.
 */

import fs from "fs-extra";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { kebabCase } from "change-case";
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
// Public types
// ---------------------------------------------------------------------------

export interface ShowcaseSectionOutput {
  /** Absolute POSIX path to the emitted .section.tsx (or .generated.section.tsx). */
  path: string;
  /** Rendered TSX source. */
  content: string;
  /** PascalCase component name from the manifest. */
  componentName: string;
  /** kebab-case anchor id. */
  anchorId: string;
  /** true when a hand-authored target already existed and we wrote .generated. */
  fellBackToGenerated: boolean;
}

export interface GenerateShowcaseOptions {
  repoRoot: string;
  /** When omitted, the generator will scan the repo for manifests itself. */
  manifests?: ManifestRecord[];
  /**
   * Output directory, absolute or relative to repoRoot.
   * Defaults to `apps/web/src/app/ui-kit/sections`.
   */
  outDir?: string;
  /** When true, do not write files; just return outputs. */
  dryRun?: boolean;
  logger?: Logger;
}

export interface GenerateShowcaseResult {
  outputs: ShowcaseSectionOutput[];
  /** Manifests skipped because their name was unusable. */
  skipped: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_OUT_DIR = "apps/web/src/app/ui-kit/sections";

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function isPascalCase(name: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

/**
 * Escape a string for safe embedding inside a single double-quoted JSX/TS literal.
 * Backslashes, double quotes and newlines are the only characters we expect to
 * see; everything else passes through unchanged.
 */
function escapeJsString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}

/**
 * Encode an arbitrary JSON-serialisable value as a JS expression. Used to
 * embed manifest sub-trees (props list, a11y block) directly into the file as
 * a typed object literal.
 */
function jsLiteral(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function resolveOutDir(repoRoot: string, outDir: string | undefined): string {
  const candidate = outDir ?? DEFAULT_OUT_DIR;
  return path.isAbsolute(candidate) ? candidate : path.join(repoRoot, candidate);
}

function relativeImportSpecifier(fromFile: string, toFile: string): string {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, toFile).split(path.sep).join("/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  // Strip .tsx / .ts extension — Next.js / bundlers resolve it.
  return rel.replace(/\.tsx?$/, "");
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

interface RenderInput {
  manifest: ManifestRecord["manifest"];
  /** Absolute POSIX path of the .tsx file that owns this manifest. */
  sourceFile: string;
  /** Absolute POSIX path of the .examples.tsx sibling, if any. */
  examplesFile: string | undefined;
  /** Absolute POSIX path of the section file we are emitting. */
  sectionFile: string;
}

/**
 * Render the full TSX source for a single component section.
 * Exported so unit tests can exercise the template without filesystem writes.
 */
export function renderShowcaseSection(input: RenderInput): string {
  const { manifest: m, sourceFile, examplesFile, sectionFile } = input;
  const name = m.name;
  const anchorId = kebabCase(name);
  const category = String(m.category ?? "uncategorized");
  const since = String(m.since ?? "0.0.0");
  const status = String(m.status ?? "experimental");
  const description = m.description ?? "";

  const sourceImport = relativeImportSpecifier(sectionFile, sourceFile);
  const examplesImport = examplesFile
    ? relativeImportSpecifier(sectionFile, examplesFile)
    : undefined;

  const examples = Array.isArray(m.examples) ? m.examples : [];
  const exampleIds = examples.map((e) => {
    const ex = e as { id?: string; label?: string };
    return {
      id: typeof ex.id === "string" ? ex.id : "default",
      label: typeof ex.label === "string" ? ex.label : "Default",
    };
  });

  const a11y = (m.a11y ?? {
    wcag: "2.1 AA",
    patterns: [],
  }) as Record<string, unknown>;
  const propsField =
    typeof m.props === "string"
      ? `"auto"`
      : jsLiteral(m.props ?? { extractedFrom: undefined });

  const lines: string[] = [];
  lines.push(
    "/* eslint-disable */",
    "// AUTO-GENERATED by scripts/build-docs/generate-showcase.ts — DO NOT EDIT.",
    `// Source manifest: ${toPosix(sourceFile)}`,
    "",
    `import * as React from "react";`,
    `import * as Source from "${sourceImport}";`,
  );

  if (examplesImport) {
    lines.push(`import * as Examples from "${examplesImport}";`);
  }

  lines.push(
    "",
    "type TabKey = \"preview\" | \"code\" | \"props\" | \"a11y\";",
    "",
    `const COMPONENT_NAME = "${escapeJsString(name)}" as const;`,
    `const ANCHOR_ID = "${escapeJsString(anchorId)}" as const;`,
    `const CATEGORY = "${escapeJsString(category)}" as const;`,
    `const SINCE = "${escapeJsString(since)}" as const;`,
    `const STATUS = "${escapeJsString(status)}" as const;`,
    `const DESCRIPTION = "${escapeJsString(description)}" as const;`,
    "",
    `const EXAMPLE_LIST = ${jsLiteral(exampleIds)} as const;`,
    "",
    `const PROPS_BLOCK = ${propsField} as const;`,
    `const A11Y_BLOCK = ${jsLiteral(a11y)} as const;`,
    "",
    "/**",
    " * Resolve the example component from either the examples module (preferred)",
    " * or the source module (fallback). Returns null when the example cannot be",
    " * located — the Preview tab will then render a placeholder.",
    " */",
    "function resolveExampleComponent(id: string): React.ComponentType | null {",
    "  const examplesMod = (typeof Examples !== \"undefined\" ? Examples : undefined) as",
    "    | Record<string, unknown>",
    "    | undefined;",
    "  const sourceMod = Source as unknown as Record<string, unknown>;",
    "  const candidates: Array<string> = [",
    "    id,",
    "    id.replace(/(^|-)(.)/g, (_m, _p, c: string) => c.toUpperCase()),",
    "    `Example_${id.replace(/-/g, \"_\")}`,",
    "  ];",
    "  for (const mod of [examplesMod, sourceMod]) {",
    "    if (!mod) continue;",
    "    for (const key of candidates) {",
    "      const val = mod[key];",
    "      if (typeof val === \"function\") return val as React.ComponentType;",
    "    }",
    "  }",
    "  return null;",
    "}",
    "",
    "function CodeTab(): React.ReactElement {",
    "  // Raw import string — wired by Ola 4c.3 to read source as text at build time.",
    `  const sourceSpecifier = "${escapeJsString(sourceImport)}" as const;`,
    examplesImport
      ? `  const examplesSpecifier = "${escapeJsString(examplesImport)}" as const;`
      : `  const examplesSpecifier: string | null = null;`,
    "  return (",
    "    <div data-tab=\"code\">",
    "      <pre data-source-specifier={sourceSpecifier}>{`// source: ${sourceSpecifier}`}</pre>",
    "      {examplesSpecifier ? (",
    "        <pre data-examples-specifier={examplesSpecifier}>{`// examples: ${examplesSpecifier}`}</pre>",
    "      ) : null}",
    "    </div>",
    "  );",
    "}",
    "",
    "function PropsTab(): React.ReactElement {",
    "  return (",
    "    <div data-tab=\"props\">",
    "      <pre>{JSON.stringify(PROPS_BLOCK, null, 2)}</pre>",
    "    </div>",
    "  );",
    "}",
    "",
    "function A11yTab(): React.ReactElement {",
    "  return (",
    "    <div data-tab=\"a11y\">",
    "      <pre>{JSON.stringify(A11Y_BLOCK, null, 2)}</pre>",
    "    </div>",
    "  );",
    "}",
    "",
    "function PreviewTab(): React.ReactElement {",
    "  if (EXAMPLE_LIST.length === 0) {",
    "    return (",
    "      <div data-tab=\"preview\" data-empty=\"true\">",
    "        <p>No examples registered.</p>",
    "      </div>",
    "    );",
    "  }",
    "  return (",
    "    <div data-tab=\"preview\">",
    "      {EXAMPLE_LIST.map((ex) => {",
    "        const Cmp = resolveExampleComponent(ex.id);",
    "        return (",
    "          <figure key={ex.id} data-example-id={ex.id}>",
    "            <figcaption>{ex.label}</figcaption>",
    "            {Cmp ? <Cmp /> : <em>example unavailable</em>}",
    "          </figure>",
    "        );",
    "      })}",
    "    </div>",
    "  );",
    "}",
    "",
    `export default function ${name}Section(): React.ReactElement {`,
    "  const [tab, setTab] = React.useState<TabKey>(\"preview\");",
    "  return (",
    "    <div id={ANCHOR_ID} data-component={COMPONENT_NAME} data-section=\"showcase\">",
    "      <header data-section-header=\"true\">",
    "        <h2>{COMPONENT_NAME}</h2>",
    "        <span data-badge=\"category\">{CATEGORY}</span>",
    "        <span data-badge=\"since\">v{SINCE}</span>",
    "        <span data-badge=\"status\" data-status={STATUS}>",
    "          {STATUS}",
    "        </span>",
    "      </header>",
    "      <p data-section-description=\"true\">{DESCRIPTION}</p>",
    "      <nav role=\"tablist\" aria-label={`${COMPONENT_NAME} sections`}>",
    "        {([\"preview\", \"code\", \"props\", \"a11y\"] as const).map((key) => (",
    "          <button",
    "            key={key}",
    "            role=\"tab\"",
    "            aria-selected={tab === key}",
    "            onClick={() => setTab(key)}",
    "            data-tab-trigger={key}",
    "          >",
    "            {key}",
    "          </button>",
    "        ))}",
    "      </nav>",
    "      <div role=\"tabpanel\" data-active-tab={tab}>",
    "        {tab === \"preview\" && <PreviewTab />}",
    "        {tab === \"code\" && <CodeTab />}",
    "        {tab === \"props\" && <PropsTab />}",
    "        {tab === \"a11y\" && <A11yTab />}",
    "      </div>",
    "    </div>",
    "  );",
    "}",
    "",
    `export const __showcase_meta = {`,
    `  name: COMPONENT_NAME,`,
    `  anchorId: ANCHOR_ID,`,
    `  category: CATEGORY,`,
    `  since: SINCE,`,
    `  status: STATUS,`,
    `  exampleIds: EXAMPLE_LIST.map((e) => e.id),`,
    `} as const;`,
    "",
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Discovery (re-used from generate-readme-package style)
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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateShowcase(
  opts: GenerateShowcaseOptions,
): Promise<GenerateShowcaseResult> {
  const logger = opts.logger ?? createLogger("showcase");
  const repoRoot = opts.repoRoot;
  const outDir = resolveOutDir(repoRoot, opts.outDir);

  const manifests =
    opts.manifests ?? (await scanManifestsForRoot(repoRoot, logger));

  const outputs: ShowcaseSectionOutput[] = [];
  const skipped: string[] = [];

  for (const rec of manifests) {
    const name = rec.manifest.name;
    if (typeof name !== "string" || !isPascalCase(name)) {
      skipped.push(
        rec.sourceFile + ` (invalid component name: ${String(name)})`,
      );
      continue;
    }

    const primaryPath = path.join(outDir, `${name}.section.tsx`);
    const fallbackPath = path.join(outDir, `${name}.generated.section.tsx`);

    // Safety: never overwrite a hand-authored file in this ola.
    const handAuthoredExists =
      (await fs.pathExists(primaryPath)) &&
      !(await isGeneratedFile(primaryPath));
    const targetPath = handAuthoredExists ? fallbackPath : primaryPath;
    const targetPosix = toPosix(targetPath);

    const content = renderShowcaseSection({
      manifest: rec.manifest,
      sourceFile: rec.sourceFile,
      examplesFile: rec.examplesFile,
      sectionFile: targetPosix,
    });

    outputs.push({
      path: targetPosix,
      content,
      componentName: name,
      anchorId: kebabCase(name),
      fellBackToGenerated: handAuthoredExists,
    });
  }

  if (!opts.dryRun) {
    for (const o of outputs) {
      await writeOutput(o.path, o.content);
      logger.success(`wrote ${o.path}`);
    }
  }

  return { outputs, skipped };
}

/**
 * A file is considered "generated by us" when it starts with the auto-gen
 * banner. Anything else is treated as hand-authored.
 */
async function isGeneratedFile(file: string): Promise<boolean> {
  try {
    const head = (await fs.readFile(file, "utf8")).slice(0, 200);
    return head.includes("AUTO-GENERATED by scripts/build-docs/generate-showcase.ts");
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Generator base wrapper (orchestrator-friendly)
// ---------------------------------------------------------------------------

export class GenerateShowcaseGenerator extends Generator {
  name = "generate-showcase";

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const res = await generateShowcase({
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

export default GenerateShowcaseGenerator;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function run(argv: string[]): Promise<number> {
  const json = argv.includes("--json");
  const dryRun = argv.includes("--dry-run");
  const repoRootArg = argv.find((a) => a.startsWith("--root="));
  const outDirArg = argv.find((a) => a.startsWith("--out="));
  const repoRoot = repoRootArg
    ? path.resolve(repoRootArg.slice("--root=".length))
    : process.cwd();
  const outDir = outDirArg ? outDirArg.slice("--out=".length) : undefined;

  const logger = json ? createLogger("showcase") : defaultLogger;
  try {
    const result = await generateShowcase({
      repoRoot,
      outDir,
      dryRun,
      logger,
    });
    if (json) {
      const payload = {
        ok: true,
        wrote: result.outputs.map((o) => ({
          path: o.path,
          component: o.componentName,
          fellBackToGenerated: o.fellBackToGenerated,
        })),
        skipped: result.skipped,
      };
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(payload, null, 2));
    } else {
      logger.success(
        `Generated ${result.outputs.length} *.section.tsx ` +
          `(${result.skipped.length} skipped)`,
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
