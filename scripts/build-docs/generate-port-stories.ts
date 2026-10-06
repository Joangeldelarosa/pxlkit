/**
 * generate-port-stories
 *
 * The stories of the Vue and Angular Storybooks, generated from the ports'
 * examples: one CSF file per component a port implements in full (every
 * manifest example present, as the READMEs and audit gate 37 count it),
 * under the React Storybook's titles and story names — so the three
 * Storybooks share story ids — each story rendering the port's example of
 * the same name and showing its code.
 *
 *   Vue      packages/ui-kit-vue/stories/<category>/<Component>.stories.ts
 *   Angular  packages/ui-kit-angular/stories/<category>/<component-kebab>.stories.ts
 *
 * The files are generated whole: edit the examples, not the stories.
 *
 * Programmatic API + thin CLI wrapper (`--dry-run`, `--json`).
 */

import fs from "fs-extra";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  Generator,
  writeOutput,
  type GeneratorContext,
  type GeneratorResult,
  type ManifestRecord,
} from "./_lib/generator-base.js";
import { createLogger, defaultLogger, type Logger } from "./_lib/logger.js";
import {
  KIT_PORTS,
  implementsInFull,
  manifestExampleExports,
  portComponents,
  portKey,
  type KitPort,
  type PortedComponent,
} from "./_lib/ports.js";
import { selfContainedExamples } from "./extract-example-source.js";
import { deriveStorybookTitle, exampleIdToExportName } from "./generate-stories.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PortStoryExample {
  /** The manifest example's id: the story's name derives from it, as in React. */
  id: string;
  label: string;
  description?: string;
  /** The example's export name in the port (the React export's). */
  exportName: string;
  /** The example's code, shown in the docs. */
  code: string;
  tags?: string[];
}

export interface PortStoriesInput {
  port: KitPort;
  componentName: string;
  /** Storybook title, the React Storybook's. */
  title: string;
  description?: string;
  status?: string;
  category?: string;
  /**
   * The module the examples come from, relative to the stories file and
   * without an extension: the examples folder (Vue) or file (Angular).
   */
  examplesSpecifier: string;
  /** Whether the port's package exports a component of the manifest's name (the Vue docs' props table). */
  exportsComponent: boolean;
  /**
   * Whether that component is generic (`<script setup generic="…">`): its type
   * is then a function, which `Meta['component']` does not take without a cast.
   */
  genericComponent?: boolean;
  examples: PortStoryExample[];
}

export interface PortStoriesOutput {
  /** Absolute POSIX path of the stories file. */
  path: string;
  content: string;
}

export interface GeneratePortStoriesOptions {
  repoRoot: string;
  /** The React manifests; scanned when omitted. */
  manifests: ManifestRecord[];
  dryRun?: boolean;
  logger?: Logger;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

/**
 * U+2028 LINE SEPARATOR and U+2029 PARAGRAPH SEPARATOR, built from their
 * codes: in this file's source they would end the line of a literal.
 */
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

/** A string as a single-quoted TypeScript literal. */
function quote(s: string): string {
  return `'${s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .split(LINE_SEPARATOR)
    .join("\\u2028")
    .split(PARAGRAPH_SEPARATOR)
    .join("\\u2029")}'`;
}

/** Text inlined into a block comment, on one line and unable to close it. */
function commentText(s: string): string {
  return s
    .replace(/\*\//g, "*\\/")
    .split(LINE_SEPARATOR)
    .join(" ")
    .split(PARAGRAPH_SEPARATOR)
    .join(" ")
    .replace(/\s*[\r\n]+\s*/g, " ");
}

/** Where a port's stories file for a component goes, from the repository root. */
export function portStoriesPath(port: KitPort, component: PortedComponent, componentName: string): string {
  const file = port.framework === "vue" ? `${componentName}.stories.ts` : `${portKey(port, componentName)}.stories.ts`;
  return toPosix(path.join(port.dir, "stories", component.category, file));
}

/**
 * The names a package's barrels export (`export { A, default as B, type C }
 * from …` — `C` left out, being a type): what a story may import from the
 * package by name.
 */
export function exportedNames(barrelSources: readonly string[]): Set<string> {
  const names = new Set<string>();
  for (const source of barrelSources) {
    for (const match of source.matchAll(/export\s+(?!type\b)\{([^}]*)\}/g)) {
      for (const raw of match[1]!.split(",")) {
        const spec = raw.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "").trim();
        if (!spec || spec.startsWith("type ")) continue;
        const alias = /\bas\s+(\w+)$/.exec(spec);
        names.add(alias ? alias[1]! : spec);
      }
    }
  }
  return names;
}

/** The names of a Vue package's generic single-file components (`<script setup generic="…">`). */
async function genericComponents(repoRoot: string, port: KitPort): Promise<Set<string>> {
  const out = new Set<string>();
  if (port.framework !== "vue") return out;
  const walk = async (dir: string): Promise<void> => {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.name === "__tests__") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith(".vue") && /<script\b[^>]*\bgeneric=/.test(await fs.readFile(full, "utf8"))) {
        out.add(entry.name.slice(0, -".vue".length));
      }
    }
  };
  const src = path.join(repoRoot, port.dir, "src");
  if (await fs.pathExists(src)) await walk(src);
  return out;
}

async function barrelSources(repoRoot: string, port: KitPort): Promise<string[]> {
  const src = path.join(repoRoot, port.dir, "src");
  const out: string[] = [];
  const walk = async (dir: string): Promise<void> => {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.name === "__tests__" || entry.name.startsWith("_")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name === "index.ts" || entry.name === "public-api.ts") out.push(await fs.readFile(full, "utf8"));
    }
  };
  if (await fs.pathExists(src)) await walk(src);
  return out;
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

/** The stories file of one component in one port. Pure; exposed for tests. */
export function renderPortStories(input: PortStoriesInput): string {
  const { port, componentName, title, description, status, category, examplesSpecifier, exportsComponent, genericComponent, examples } =
    input;
  if (examples.length === 0) throw new Error(`renderPortStories: ${componentName} has no examples`);
  const vue = port.framework === "vue";
  const framework = vue ? "Vue" : "Angular";
  const tags = ["autodocs", ...(status ? [`status-${status}`] : []), ...(category ? [`cat-${category}`] : [])];

  const lines: string[] = [
    "/**",
    ` * ${componentName}'s ${framework} examples as stories, under the React`,
    " * Storybook's titles and names. Generated by",
    " * scripts/build-docs/generate-port-stories.ts (`npm run docs:build`):",
    " * edit the examples, not this file.",
    " */",
  ];
  if (vue) {
    lines.push(`import type { Meta, StoryObj } from '@storybook/vue3-vite';`);
    if (exportsComponent) lines.push(`import { ${componentName} } from '${port.package}';`);
    for (const example of examples) {
      lines.push(`import ${example.exportName}Example from '${examplesSpecifier}/${example.exportName}.vue';`);
    }
  } else {
    lines.push(
      `import { NgComponentOutlet } from '@angular/common';`,
      `import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';`,
      "import {",
      ...examples.map((example) => `  ${example.exportName} as ${example.exportName}Example,`),
      `} from '${examplesSpecifier}';`,
    );
  }

  lines.push(
    "",
    "const meta: Meta = {",
    `  title: ${quote(title)},`,
    ...(vue && exportsComponent
      ? [
          genericComponent
            ? `  component: ${componentName} as unknown as Meta['component'],`
            : `  component: ${componentName},`,
        ]
      : []),
    `  tags: ${JSON.stringify(tags).replace(/"/g, "'").replace(/,/g, ", ")},`,
    // The examples render whole; an example built with the component's own
    // controls would need its args, which the kits' examples do not take.
    ...(vue ? [] : ["  decorators: [moduleMetadata({ imports: [NgComponentOutlet] })],"]),
    "  parameters: {",
    "    controls: { disable: true },",
    ...(description ? ["    docs: {", `      description: { component: ${quote(description)} },`, "    },"] : []),
    "  },",
    "};",
    "",
    "export default meta;",
    "type Story = StoryObj;",
  );

  // Story names derive from the example ids as in React; distinct ids can
  // collide once PascalCased, and a duplicate export is a SyntaxError.
  const used = new Map<string, number>();
  for (const example of examples) {
    const base = exampleIdToExportName(example.id);
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    const storyName = seen === 0 ? base : `${base}${seen + 1}`;
    const exampleTags = Array.from(new Set([...(example.tags ?? []), `example-${example.id}`]));
    lines.push(
      "",
      `/** ${commentText(example.label)}${example.description ? ` — ${commentText(example.description)}` : ""} */`,
      `export const ${storyName}: Story = {`,
      `  name: ${quote(example.label)},`,
      `  tags: ${JSON.stringify(exampleTags).replace(/"/g, "'").replace(/,/g, ", ")},`,
      vue
        ? `  render: () => ${example.exportName}Example,`
        : `  render: () => ({ props: { example: ${example.exportName}Example }, template: '<ng-container *ngComponentOutlet="example" />' }),`,
      "  parameters: {",
      "    docs: {",
      ...(example.description ? [`      description: { story: ${quote(example.description)} },`] : []),
      `      source: { language: '${vue ? "html" : "typescript"}', code: ${quote(example.code.trimEnd())} },`,
      "    },",
      "  },",
      "};",
    );
  }
  return `${lines.join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// Planning
// ---------------------------------------------------------------------------

interface ManifestExampleShape {
  id?: unknown;
  label?: unknown;
  description?: unknown;
  tags?: unknown;
}

/** Every port's stories files, for the components it implements in full. */
export async function planPortStories(repoRoot: string, manifests: ManifestRecord[]): Promise<PortStoriesOutput[]> {
  const outputs: PortStoriesOutput[] = [];
  for (const port of KIT_PORTS) {
    const components = await portComponents(repoRoot, port);
    const exported = exportedNames(await barrelSources(repoRoot, port));
    const generic = await genericComponents(repoRoot, port);
    for (const record of [...manifests].sort((a, b) => a.manifest.name.localeCompare(b.manifest.name))) {
      if (record.package !== "@pxlkit/ui-kit") continue;
      const name = record.manifest.name;
      const component = components.get(portKey(port, name));
      const exportNames = await manifestExampleExports(record);
      if (!implementsInFull(component, exportNames)) continue;

      const storiesFile = portStoriesPath(port, component, name);
      const examplesPath =
        port.framework === "vue" ? component.path : component.path.replace(/\.ts$/, "");
      let specifier = toPosix(path.relative(path.dirname(storiesFile), examplesPath));
      if (!specifier.startsWith(".")) specifier = `./${specifier}`;

      const codes =
        port.framework === "vue"
          ? Object.fromEntries(
              exportNames.map((exportName) => [
                exportName,
                fs.readFileSync(path.join(repoRoot, component.path, `${exportName}.vue`), "utf8"),
              ]),
            )
          : selfContainedExamples(fs.readFileSync(path.join(repoRoot, component.path), "utf8"), { kind: "ts" });

      const manifestExamples = (Array.isArray(record.manifest.examples) ? record.manifest.examples : []) as ManifestExampleShape[];
      const examples = manifestExamples.map((example, index): PortStoryExample => {
        const exportName = exportNames[index]!;
        const code = codes[exportName];
        if (code === undefined) throw new Error(`${name}: the ${port.framework} example ${exportName} has no source`);
        return {
          id: String(example.id ?? exportName),
          label: String(example.label ?? exportName),
          description: typeof example.description === "string" ? example.description : undefined,
          exportName,
          code,
          tags: Array.isArray(example.tags) ? (example.tags as string[]) : undefined,
        };
      });

      outputs.push({
        path: toPosix(path.join(repoRoot, storiesFile)),
        content: renderPortStories({
          port,
          componentName: name,
          title: deriveStorybookTitle(record),
          description: typeof record.manifest.description === "string" ? record.manifest.description : undefined,
          status: typeof record.manifest.status === "string" ? record.manifest.status : undefined,
          category: typeof record.manifest.category === "string" ? record.manifest.category : undefined,
          examplesSpecifier: specifier,
          exportsComponent: exported.has(name),
          genericComponent: generic.has(name),
          examples,
        }),
      });
    }
  }
  return outputs;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generatePortStories(opts: GeneratePortStoriesOptions): Promise<PortStoriesOutput[]> {
  const logger = opts.logger ?? createLogger("port-stories");
  const outputs = await planPortStories(opts.repoRoot, opts.manifests);
  if (!opts.dryRun) {
    for (const output of outputs) await writeOutput(output.path, output.content);
  }
  logger.info(`${opts.dryRun ? "planned" : "wrote"} ${outputs.length} port stories files`);
  return outputs;
}

export class GeneratePortStoriesGenerator extends Generator {
  name = "generate-port-stories";

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const outputs = await planPortStories(ctx.repoRoot, ctx.manifests);
    return { writes: outputs.map((output) => ({ path: output.path, content: output.content })) };
  }
}

export default GeneratePortStoriesGenerator;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function run(argv: string[]): Promise<number> {
  const json = argv.includes("--json");
  const dryRun = argv.includes("--dry-run");
  const rootArg = argv.find((arg) => arg.startsWith("--root="));
  const repoRoot = rootArg ? path.resolve(rootArg.slice("--root=".length)) : process.cwd();
  const logger = json ? createLogger("port-stories") : defaultLogger;
  try {
    const { scanManifests } = await import("./scan-manifests.js");
    const manifests = await scanManifests(repoRoot, { logger });
    const outputs = await generatePortStories({ repoRoot, manifests, dryRun, logger });
    if (json) process.stdout.write(`${JSON.stringify({ ok: true, wrote: outputs.map((output) => output.path) }, null, 2)}\n`);
    return 0;
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    if (json) process.stdout.write(`${JSON.stringify({ ok: false, error: String(error) })}\n`);
    return 1;
  }
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  void run(process.argv.slice(2)).then((code) => process.exit(code));
}
