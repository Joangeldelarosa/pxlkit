/**
 * One TypeScript program over the three UI kits, for the API extractor
 * (extract-api.ts): the React kit's sources, the Angular kit's, and the Vue
 * kit's — each single-file component read as a TypeScript module of its
 * `<script>` and `<script setup>` blocks, so the checker resolves the types
 * its macros name (`defineProps<PixelButtonProps>()`) like any other.
 *
 * The kits import `@pxlkit/ui-kit-core` by name; the program reads it from
 * source, so the extraction needs no build and sees the core's own types.
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { parse as parseSfc, type SFCDescriptor } from "@vue/compiler-sfc";

/** The kits' entry modules, relative to the repository root. */
export const KIT_ENTRIES = {
  react: "packages/ui-kit/src/index.tsx",
  vue: "packages/ui-kit-vue/src/index.ts",
  angular: "packages/ui-kit-angular/src/public-api.ts",
} as const;

export type KitName = keyof typeof KIT_ENTRIES;

const CORE_ENTRY = "packages/ui-kit-core/src/index.ts";

/** Whether `repoRoot` has any of the kits. */
export function hasKit(repoRoot: string): boolean {
  return Object.values(KIT_ENTRIES).some((entry) => fs.existsSync(path.join(repoRoot, entry)));
}

/**
 * Type packages whose declarations no reader needs: a documented member that
 * names one of their types (`ColumnDef<TData, TValue>[]`, `UseFormReturn<T>`)
 * prints it as written, and none is expanded or inferred through them. Read as `any`
 * modules — React's `style` types, Vue's template compiler, Angular's forms,
 * common module and observables, and the table, carousel, positioning, form
 * and class-merging libraries the kits wrap — they take a third off the
 * program.
 */
const UNREAD_TYPE_PACKAGES = new Set([
  "@angular/common",
  "@angular/forms",
  "@babel/parser",
  "@babel/types",
  "@floating-ui/core",
  "@floating-ui/dom",
  "@floating-ui/react-dom",
  "@floating-ui/utils",
  "@tanstack/angular-table",
  "@tanstack/react-table",
  "@tanstack/table-core",
  "@tanstack/vue-table",
  "@vue/compiler-core",
  "@vue/compiler-dom",
  "csstype",
  "embla-carousel",
  "embla-carousel-react",
  "react-hook-form",
  "rxjs",
  "tailwind-merge",
  "type-fest",
  "vee-validate",
]);
const STUB_TEXT = "declare const unread: any;\nexport = unread;\n";

/** The suffix of the module a `.vue` file is read as. */
const SFC_MODULE_SUFFIX = ".ts";

/** A single-file component, parsed. */
export interface SfcModule {
  /** The `.vue` file, absolute. */
  file: string;
  descriptor: SFCDescriptor;
  /** Its `<script setup lang="ts" generic="…">` type parameters, as written. */
  generic?: string;
}

export interface ApiProgram {
  repoRoot: string;
  program: ts.Program;
  checker: ts.TypeChecker;
  /** Entry module per kit present in the repository. */
  entries: Partial<Record<KitName, ts.SourceFile>>;
  /** Single-file components by the path of the module they are read as. */
  sfcs: Map<string, SfcModule>;
}

/** A path as the compiler writes file names: POSIX, on every platform. */
function posix(file: string): string {
  return file.split(path.sep).join("/");
}

/** The module a `.vue` file is read as. */
export function sfcModulePath(vueFile: string): string {
  return `${posix(vueFile)}${SFC_MODULE_SUFFIX}`;
}

/** The `.vue` file a module was read from, if it was one. */
export function sfcFileOf(moduleFile: string): string | undefined {
  return moduleFile.endsWith(`.vue${SFC_MODULE_SUFFIX}`) ? moduleFile.slice(0, -SFC_MODULE_SUFFIX.length) : undefined;
}

/**
 * The module text of a single-file component: its `<script>` then its
 * `<script setup>`. A generic component's type parameters are declared as
 * aliases of their constraint (else their default, else `unknown`), so the
 * types that name them resolve, and a prop typed by one reads as what it can
 * be; a default export stands for the component, so barrels re-exporting it
 * resolve too.
 */
function sfcModuleText(sfc: SfcModule): string {
  const { script, scriptSetup } = sfc.descriptor;
  const parts: string[] = [];
  for (const parameter of genericParameters(sfc.generic)) {
    parts.push(`type ${parameter.name} = ${parameter.constraint ?? parameter.default ?? "unknown"};`);
  }
  if (script) parts.push(script.content);
  if (scriptSetup) parts.push(scriptSetup.content);
  if (!/^\s*export\s+default\b/m.test(script?.content ?? "")) {
    parts.push("declare const __component: unknown;\nexport default __component;");
  }
  return parts.join("\n");
}

/** The type parameters of a `generic="…"` attribute: names, constraints and defaults as written. */
export function genericParameters(generic: string | undefined): Array<{ name: string; constraint?: string; default?: string }> {
  if (!generic) return [];
  const probe = ts.createSourceFile("generic.ts", `type __Generic<${generic}> = 0;`, ts.ScriptTarget.Latest, true);
  const alias = probe.statements[0];
  if (!alias || !ts.isTypeAliasDeclaration(alias)) return [];
  return (alias.typeParameters ?? []).map((parameter) => ({
    name: parameter.name.text,
    ...(parameter.constraint ? { constraint: parameter.constraint.getText(probe) } : {}),
    ...(parameter.default ? { default: parameter.default.getText(probe) } : {}),
  }));
}

function readSfcs(repoRoot: string, kitSrc: string): Map<string, SfcModule> {
  const out = new Map<string, SfcModule>();
  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "__tests__" && entry.name !== "node_modules") walk(full);
      } else if (entry.name.endsWith(".vue")) {
        const { descriptor } = parseSfc(fs.readFileSync(full, "utf8"), { filename: full });
        const generic = descriptor.scriptSetup?.attrs.generic;
        out.set(sfcModulePath(full), {
          file: full,
          descriptor,
          ...(typeof generic === "string" ? { generic } : {}),
        });
      }
    }
  };
  const root = path.join(repoRoot, kitSrc);
  if (fs.existsSync(root)) walk(root);
  return out;
}

/**
 * The program over every kit present under `repoRoot`. Kits that are not
 * there are left out; with none, the program is empty.
 */
export function createApiProgram(repoRoot: string): ApiProgram {
  const roots: string[] = [];
  for (const entry of Object.values(KIT_ENTRIES)) {
    const file = path.join(repoRoot, entry);
    if (fs.existsSync(file)) roots.push(file);
  }
  const sfcs = fs.existsSync(path.join(repoRoot, KIT_ENTRIES.vue))
    ? readSfcs(repoRoot, path.dirname(KIT_ENTRIES.vue))
    : new Map<string, SfcModule>();
  const corePath = path.join(repoRoot, CORE_ENTRY);
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    experimentalDecorators: true,
    useDefineForClassFields: false,
    esModuleInterop: true,
    skipLibCheck: true,
    noEmit: true,
    types: [],
    ...(fs.existsSync(corePath) ? { paths: { "@pxlkit/ui-kit-core": [corePath] } } : {}),
  };
  const host = ts.createCompilerHost(options, true);
  // Where the unread type packages resolve: files no disk has.
  const stubRoot = `${posix(repoRoot)}/__unread_types__/`;
  const sfcText = new Map<string, string>();
  const textOf = (file: string): string | undefined => {
    const sfc = sfcs.get(file);
    if (!sfc) return undefined;
    let text = sfcText.get(file);
    if (text === undefined) {
      text = sfcModuleText(sfc);
      sfcText.set(file, text);
    }
    return text;
  };
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    if (fileName.startsWith(stubRoot)) return ts.createSourceFile(fileName, STUB_TEXT, languageVersion, true);
    const text = textOf(fileName);
    return text === undefined
      ? getSourceFile(fileName, languageVersion, onError, shouldCreate)
      : ts.createSourceFile(fileName, text, languageVersion, true, ts.ScriptKind.TS);
  };
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (fileName) => fileName.startsWith(stubRoot) || sfcs.has(fileName) || fileExists(fileName);
  const readFile = host.readFile.bind(host);
  host.readFile = (fileName) => textOf(fileName) ?? readFile(fileName);
  const cache = ts.createModuleResolutionCache(repoRoot, host.getCanonicalFileName, options);
  host.resolveModuleNameLiterals = (literals, containingFile, redirectedReference, compilerOptions) =>
    literals.map((literal) => {
      const pkg = literal.text.startsWith("@") ? literal.text.split("/").slice(0, 2).join("/") : literal.text.split("/")[0]!;
      if (UNREAD_TYPE_PACKAGES.has(pkg)) {
        const resolvedFileName = `${stubRoot}${pkg}.d.ts`;
        return { resolvedModule: { resolvedFileName, extension: ts.Extension.Dts, isExternalLibraryImport: true } };
      }
      if (literal.text.endsWith(".vue")) {
        const resolvedFileName = sfcModulePath(path.resolve(path.dirname(containingFile), literal.text));
        return sfcs.has(resolvedFileName)
          ? { resolvedModule: { resolvedFileName, extension: ts.Extension.Ts, isExternalLibraryImport: false } }
          : { resolvedModule: undefined };
      }
      return ts.resolveModuleName(literal.text, containingFile, compilerOptions, host, cache, redirectedReference);
    });

  const program = ts.createProgram({ rootNames: [...roots, ...sfcs.keys()], options, host });
  const entries: ApiProgram["entries"] = {};
  for (const [kit, entry] of Object.entries(KIT_ENTRIES) as Array<[KitName, string]>) {
    const sourceFile = program.getSourceFile(posix(path.join(repoRoot, entry)));
    if (sourceFile) entries[kit] = sourceFile;
  }
  return { repoRoot, program, checker: program.getTypeChecker(), entries, sfcs };
}

/** Whether a declaration is the kits' own (not React's, Vue's or Angular's). */
export function isKitDeclaration(node: ts.Node, repoRoot: string): boolean {
  const file = node.getSourceFile().fileName;
  return file.startsWith(`${posix(path.join(repoRoot, "packages"))}/`) && !file.includes("/node_modules/");
}

/** A module's exports by name, aliases resolved to what they export. */
export function moduleExports(api: ApiProgram, entry: ts.SourceFile): Map<string, ts.Symbol> {
  const out = new Map<string, ts.Symbol>();
  const moduleSymbol = api.checker.getSymbolAtLocation(entry);
  if (!moduleSymbol) return out;
  for (const symbol of api.checker.getExportsOfModule(moduleSymbol)) {
    out.set(symbol.name, symbol.flags & ts.SymbolFlags.Alias ? api.checker.getAliasedSymbol(symbol) : symbol);
  }
  return out;
}
