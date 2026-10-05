/**
 * Tests for extract-api.ts and its _lib/api-* modules: how types, defaults
 * and doc comments print (on a small program of their own), the API each
 * kit's extractor reads from known components of the repository — props,
 * defaults, descriptions, events and payloads, slots and their props, the
 * `v-model` / `[(x)]` bindings, Angular selectors, transforms and form
 * controls, the parts of compound components, the notes on native
 * attributes — the section the docs build renders from it, and what the
 * coherence audit checks.
 */

import path from "node:path";
import ts from "typescript";
import { beforeAll, describe, expect, it } from "vitest";

import { ExtractApiGenerator, apiIndexFor, extractApi } from "../extract-api";
import { planEntryFor, renderSectionModule } from "../generate-docs-page";
import { apiCoherenceFindings } from "../_lib/api-coherence";
import type { ApiComponent, ApiIndex, ApiProp, ApiReference, ComponentApi } from "../_lib/api-model";
import { docText, printDefault, printTypeNode, unionOf } from "../_lib/api-print";
import { renderApiBlock, renderApiConstant } from "../_lib/api-section";
import type { GeneratorContext, ManifestRecord } from "../_lib/generator-base";

const repoRoot = path.resolve(__dirname, "../../..");

// ---------------------------------------------------------------------------
// Printing, on a program of its own
// ---------------------------------------------------------------------------

const PRINT_SOURCE = `
export type Size = 'sm' | 'md' | 'lg';
export type Width = Size | 'xl' | number;
export type Trigger = 'mount' | 'hover' | boolean;
export type Align = 'start' | 'center' | 'end' | 'baseline';
export type GridAlign = Exclude<Align, 'baseline'>;
export type Lines = 2 | 3 | 4;
export const gap = { 0: 'gap-0', 2: 'gap-2', 10: 'gap-10' } as const;
export type Gap = keyof typeof gap;
export type ShowCount = boolean | { max?: number };
export type Content<C = unknown> = string | Template<C>;
export interface Template<C> { context: C }
export interface Badge { label: string }
const DEFAULT_SIZE = 'md';
const LABELS = { open: 'Open' };
export interface Probe {
  size?: Size;
  width?: Width;
  trigger?: Trigger;
  align: GridAlign;
  lines?: Lines | \`\${Lines}\`;
  gap?: Gap;
  showCount?: ShowCount;
  content?: Content;
  badge?: Badge;
  either?: string | undefined;
  flag?: true | false;
  filter?: Date[] | ((date: Date) => boolean);
}
export const defaults = {
  size: DEFAULT_SIZE,
  labels: LABELS,
  items: () => [],
  options: () => ({ open: 200 }),
  nothing: undefined,
  quoted: "it's",
};
/**
 * Opens it, see {@link Probe} and {@link Badge | the badge}.
 */
export const documented = 1;
`;

function printProgram() {
  const file = "/print/probe.ts";
  const options: ts.CompilerOptions = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, lib: ["lib.es2022.d.ts"] };
  const host = ts.createCompilerHost(options, true);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (name, version, onError, create) =>
    name === file ? ts.createSourceFile(name, PRINT_SOURCE, version, true) : getSourceFile(name, version, onError, create);
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (name) => name === file || fileExists(name);
  const program = ts.createProgram({ rootNames: [file], options, host });
  const sourceFile = program.getSourceFile(file)!;
  return { checker: program.getTypeChecker(), sourceFile };
}

describe("printing types, defaults and doc comments", () => {
  const { checker, sourceFile } = printProgram();
  const probe = sourceFile.statements.find(
    (s): s is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(s) && s.name.text === "Probe",
  )!;
  const member = (name: string) => {
    const signature = probe.members.find((m) => m.name?.getText() === name) as ts.PropertySignature;
    return printTypeNode(signature.type!, checker, { optional: Boolean(signature.questionToken) });
  };

  it("spells out an alias of literals in its own order, through aliases of aliases", () => {
    expect(member("size")).toBe("'sm' | 'md' | 'lg'");
    expect(member("width")).toBe("'sm' | 'md' | 'lg' | 'xl' | number");
    expect(member("trigger")).toBe("'mount' | 'hover' | boolean");
  });

  it("reads what Exclude leaves, the strings a template literal stands for, and a token object's keys", () => {
    expect(member("align")).toBe("'start' | 'center' | 'end'");
    expect(member("lines")).toBe("2 | 3 | 4 | '2' | '3' | '4'");
    expect(member("gap")).toBe("0 | 2 | 10");
  });

  it("spells out a short union alias, and a generic one used with its defaults", () => {
    expect(member("showCount")).toBe("boolean | { max?: number }");
    expect(member("content")).toBe("string | Template<unknown>");
  });

  it("keeps an object type by its name", () => {
    expect(member("badge")).toBe("Badge");
  });

  it("drops the undefined an optional member allows, reads true | false as boolean, and keeps needed parentheses", () => {
    expect(member("either")).toBe("string");
    expect(member("flag")).toBe("boolean");
    expect(member("filter")).toBe("Date[] | ((date: Date) => boolean)");
  });

  it("groups function types when it joins declarations into a union", () => {
    expect(unionOf(["(next: number) => void", "(next: string[]) => void"])).toBe(
      "((next: number) => void) | ((next: string[]) => void)",
    );
    expect(unionOf(["string", "string", "number"])).toBe("string | number");
  });

  it("prints a default as source: a constant's literal value, what a Vue factory makes, nothing for undefined", () => {
    const defaults = sourceFile.statements
      .filter(ts.isVariableStatement)
      .flatMap((s) => [...s.declarationList.declarations])
      .find((d) => d.name.getText() === "defaults")!;
    const value = (key: string) =>
      (defaults.initializer as ts.ObjectLiteralExpression).properties
        .filter(ts.isPropertyAssignment)
        .find((p) => p.name.getText() === key)!.initializer;
    expect(printDefault(value("size"), checker)).toBe("'md'");
    expect(printDefault(value("labels"), checker)).toBe("LABELS");
    expect(printDefault(value("items"), checker, { factory: true })).toBe("[]");
    expect(printDefault(value("options"), checker, { factory: true })).toBe("{ open: 200 }");
    // Outside Vue's factories, a function is the default itself.
    expect(printDefault(value("items"), checker)).toBe("() => []");
    expect(printDefault(value("nothing"), checker)).toBeUndefined();
    expect(printDefault(value("quoted"), checker)).toBe("'it\\'s'");
  });

  it("reads {@link} tags as code or as their label", () => {
    const documented = sourceFile.statements
      .filter(ts.isVariableStatement)
      .flatMap((s) => [...s.declarationList.declarations])
      .find((d) => d.name.getText() === "documented")!;
    const symbol = checker.getSymbolAtLocation(documented.name)!;
    expect(docText(symbol.getDocumentationComment(checker))).toBe("Opens it, see `Probe` and the badge.");
  });
});

// ---------------------------------------------------------------------------
// The kits
// ---------------------------------------------------------------------------

const NAMES = [
  "PixelBareButton",
  "PixelButton",
  "PixelCard",
  "PixelForm",
  "PixelGrid",
  "PixelInput",
  "PixelPopover",
  "PixelSkeleton",
  "PixelSlider",
  "PixelSwitch",
  "PixelTable",
  "PixelTimeline",
];

describe("extractApi over the repository's kits", () => {
  let index: ApiIndex;
  beforeAll(async () => {
    index = await extractApi(repoRoot, NAMES);
  }, 120_000);

  const reference = (name: string, framework: "react" | "vue" | "angular"): ApiReference => index.get(name)![framework]!;
  const component = (name: string, framework: "react" | "vue" | "angular", part = name): ApiComponent =>
    reference(name, framework).components.find((c) => c.name === part)!;
  const prop = (c: ApiComponent, name: string): ApiProp | undefined => c.props.find((p) => p.name === name);

  it("reads every component in the three kits", () => {
    for (const name of NAMES) {
      expect(Object.keys(index.get(name)!).sort(), name).toEqual(["angular", "react", "vue"]);
    }
  });

  it("reads the same in the docs build, in a worker thread beside the steps after extract-api", async () => {
    const lines: string[] = [];
    const ctx: GeneratorContext = {
      repoRoot,
      manifests: NAMES.map((name) => ({ manifest: { name } }) as unknown as ManifestRecord),
      outputs: new Map(),
      logger: { info: (line: string) => lines.push(line), warn() {}, error() {}, success() {}, table() {} },
    };
    expect(await new ExtractApiGenerator().run(ctx)).toEqual({ writes: [] });
    expect(await apiIndexFor(ctx)).toEqual(index);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/^ {2}extract-api: 12 components \(react 12, vue 12, angular 12\) read in \d+\.\ds \(worker thread\); \d+ props, events or slots without a description$/);
  }, 120_000);

  describe("React", () => {
    it("lists a component's own props in declaration order, with type, default and description", () => {
      const button = component("PixelButton", "react");
      expect(button.props.map((p) => p.name).slice(0, 4)).toEqual(["tone", "size", "variant", "surface"]);
      expect(prop(button, "tone")).toEqual({
        name: "tone",
        type: "'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'pink' | 'neutral'",
        default: "'green'",
        description: "Color tone (maps to `toneMap`).",
      });
      expect(prop(button, "iconLeft")?.type).toBe("React.ReactNode");
      expect(prop(button, "loading")).toMatchObject({ type: "boolean" });
      expect(prop(button, "loading")?.default).toBeUndefined();
      expect(reference("PixelButton", "react").import).toBe("import { PixelButton } from '@pxlkit/ui-kit';");
    });

    it("sums up the native attributes in a note, with where ref points, instead of listing them", () => {
      const button = component("PixelButton", "react");
      expect(prop(button, "onClick")).toBeUndefined();
      expect(button.notes).toEqual([
        "Also takes the native attributes and event handlers of `<button>` (`ButtonHTMLAttributes<HTMLButtonElement>`).",
        "`ref` points to `<button>`.",
      ]);
      expect(component("PixelSkeleton", "react").notes[0]).toBe(
        "Also takes the native attributes and event handlers of `<div>` (`HTMLAttributes<HTMLDivElement>`), except `role`, `aria-label`.",
      );
    });

    it("says what a native attribute defaults to when the component sets it", () => {
      const bare = component("PixelBareButton", "react");
      expect(bare.props).toEqual([]);
      expect(bare.notes[0]).toBe(
        "Also takes the native attributes and event handlers of `<button>` (`ButtonHTMLAttributes<HTMLButtonElement>`); `type` defaults to `'button'`.",
      );
    });

    it("documents the parts of a compound component under their static names, and the parts exported beside it", () => {
      expect(reference("PixelPopover", "react").components.map((c) => c.name)).toEqual([
        "PixelPopover",
        "PixelPopover.Trigger",
        "PixelPopover.Content",
        "PixelPopover.Arrow",
      ]);
      const form = reference("PixelForm", "react");
      expect(form.components.map((c) => c.name)).not.toContain("PixelForm.Root");
      expect(form.components[0]!.notes).toContain("`PixelForm.Root` is the same component.");
      expect(prop(form.components[0]!, "onSubmit")).toMatchObject({ type: "(data: T) => void | Promise<void>", required: true });
      const timeline = reference("PixelTimeline", "react");
      expect(timeline.import).toBe("import { PixelTimeline, PixelTimelineItem } from '@pxlkit/ui-kit';");
      expect(timeline.components.map((c) => c.name)).toEqual(["PixelTimeline", "PixelTimelineItem"]);
    });

    it("joins a prop declared in each bag of a union props type", () => {
      expect(prop(component("PixelSlider", "react"), "onChange")?.type).toBe(
        "((next: number) => void) | ((next: [number, number]) => void)",
      );
    });
  });

  describe("Vue", () => {
    it("reads defineProps with withDefaults, and names v-model from the update: events", () => {
      const toggle = component("PixelSwitch", "vue");
      expect(prop(toggle, "label")).toEqual({
        name: "label",
        type: "string",
        required: true,
        description: "Label rendered next to the switch.",
      });
      expect(prop(toggle, "checked")).toMatchObject({ type: "boolean", binding: "v-model:checked" });
      expect(prop(toggle, "checked")?.default).toBeUndefined();
      expect(prop(toggle, "defaultChecked")).toMatchObject({ default: "false" });
      expect(prop(toggle, "value")).toMatchObject({ default: "'on'" });
      expect(toggle.events).toEqual([
        { name: "update:checked", payload: "checked: boolean", description: "The new checked state, after each toggle." },
      ]);
      expect(toggle.notes).toContain("Other attributes and listeners go to the `<button>`.");
    });

    it("reads defineSlots, the plain v-model, the attributes' target and what the template ref exposes", () => {
      const input = component("PixelInput", "vue");
      expect(prop(input, "modelValue")).toMatchObject({ type: "string | number", binding: "v-model" });
      expect(input.slots.map((s) => s.name)).toEqual(["prefix", "icon", "suffix", "addon-left", "addon-right"]);
      expect(input.slots[0]).toEqual({ name: "prefix", props: "", description: "Content inside the shell on the left (icon or short text)." });
      expect(input.events.map((e) => e.name)).toEqual(["update:modelValue", "clear"]);
      expect(input.notes).toEqual([
        "Other attributes and listeners go to the `<input>`.",
        "Its template ref exposes `element`: the native input.",
      ]);
    });

    it("reads a defineComponent's runtime props, emits and slots, with listener props bound as events", () => {
      const card = reference("PixelCard", "vue");
      expect(card.components.map((c) => c.name)).toEqual(["PixelCard", "PixelCardBody", "PixelCardFooter", "PixelCardHeader"]);
      const main = card.components[0]!;
      expect(prop(main, "title")).toMatchObject({ type: "string" });
      expect(prop(main, "title")?.default).toBeUndefined();
      expect(prop(main, "interactive")).toMatchObject({ type: "boolean", default: "false" });
      expect(prop(main, "tone")?.type).toBe("'neutral' | 'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'pink'");
      expect(prop(main, "onClick")).toMatchObject({ type: "(event: MouseEvent | KeyboardEvent) => void", binding: "@click" });
      expect(main.slots.map((s) => s.name)).toEqual(["default", "icon", "media", "footer"]);
    });

    it("reads a generic component's props as written, with kebab-case bindings", () => {
      const table = component("PixelTable", "vue");
      expect(prop(table, "data")).toMatchObject({ type: "Row[]", required: true });
      expect(prop(table, "selectedIds")?.binding).toBe("v-model:selected-ids");
      expect(prop(table, "onRowClick")?.binding).toBe("@row-click");
      expect(table.events.find((e) => e.name === "update:sort")?.payload).toBe("sort: PixelTableSortState");
    });
  });

  describe("Angular", () => {
    it("reads the selector, input() and model() with defaults, what transforms accept, and the change output", () => {
      const toggle = component("PixelSwitch", "angular");
      expect(toggle.selector).toBe("pxl-switch");
      expect(prop(toggle, "label")).toMatchObject({ type: "string", required: true });
      expect(prop(toggle, "checked")).toMatchObject({ type: "boolean", binding: "[(checked)]" });
      expect(prop(toggle, "defaultChecked")).toMatchObject({ type: "boolean", default: "false", accepts: "unknown" });
      expect(prop(toggle, "tone")).toMatchObject({ default: "'green'" });
      expect(prop(toggle, "tone")?.accepts).toBeUndefined();
      expect(toggle.events).toContainEqual({
        name: "checkedChange",
        payload: "boolean",
        description: "The new `checked`: the event half of `[(checked)]`.",
      });
    });

    it("says when a component is a form control, and which model the form reads and writes", () => {
      expect(component("PixelSwitch", "angular").notes).toContain(
        "A form control: works with `ngModel`, `formControl` and `formControlName`, which read and write `checked` (`boolean`).",
      );
      expect(component("PixelButton", "angular").notes.join(" ")).not.toContain("form control");
    });

    it("says what an attribute directive goes on, and what a template projects", () => {
      const button = component("PixelButton", "angular");
      expect(button.selector).toBe("button[pxlButton], a[pxlButton]");
      expect(button.notes).toEqual([
        "Goes on a native `<button>` or `<a>`, which keeps its own attributes and events.",
        "Projects its content (`<ng-content>`).",
      ]);
      expect(prop(button, "iconLeft")?.type).toBe("string | TemplateRef<any>");
    });

    it("reads the inputs a directive inherits, and names an aliased input by its alias", () => {
      const grid = component("PixelGrid", "angular");
      expect(grid.props.map((p) => p.name).slice(0, 3)).toEqual(["cols", "rows", "gap"]);
      expect(prop(grid, "gap")).toMatchObject({ type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16", default: "4" });
      expect(prop(component("PixelInput", "angular"), "aria-label")).toBeDefined();
    });

    it("binds an input two-way beside its xChange output, and notes a structural directive", () => {
      const popover = reference("PixelPopover", "angular");
      expect(prop(popover.components[0]!, "open")).toMatchObject({ required: true, binding: "[(open)]" });
      const content = popover.components.find((c) => c.name === "PixelPopoverContent")!;
      expect(content.selector).toBe("[pxlPopoverContent]");
      expect(content.notes).toContain("Structural: write it as `*pxlPopoverContent` on the content, or on an `<ng-template>`.");
    });
  });

  it("keeps machine paths out of the reference", () => {
    const text = JSON.stringify(Object.fromEntries(index));
    expect(text).not.toContain(repoRoot);
    expect(text).not.toContain("node_modules");
    expect(text).not.toContain("import(");
  });

  it("renders the reference into the section, in place of the empty props table", () => {
    const record: ManifestRecord = {
      manifest: { name: "PixelSwitch", description: "Toggle.", props: "auto", examples: [] } as unknown as ManifestRecord["manifest"],
      sourceFile: "/repo/src/PixelSwitch.tsx",
      manifestFile: "/repo/src/PixelSwitch.manifest.ts",
      package: "@pxlkit/ui-kit",
    };
    const entry = planEntryFor(record, "/o");
    entry.api = index.get("PixelSwitch");
    const source = renderSectionModule(entry);
    expect(source).toContain("import { FrameworkApi, type FrameworkApiReferences } from '@/components/FrameworkApi';");
    expect(source).toContain(renderApiConstant("PixelSwitch", entry.api!));
    expect(source).toContain(
      "<FrameworkApi label={'PixelSwitch API'} react={api.react} vue={api.vue} angular={api.angular} />",
    );
    expect(source).toContain('<h3 id="pixel-switch-api">API</h3>');
    expect(source).not.toContain("No props documented yet.");
  });
});

// ---------------------------------------------------------------------------
// The section's data, and the coherence audit
// ---------------------------------------------------------------------------

const toy: ComponentApi = {
  react: {
    import: "import { PixelToy } from '@pxlkit/ui-kit';",
    components: [
      {
        name: "PixelToy",
        props: [{ name: "size", type: "'sm' | 'md'", default: "'md'", description: "Its size, in `px`." }],
        events: [],
        slots: [],
        notes: ["`ref` points to `<div>`."],
      },
    ],
  },
  vue: {
    import: "import { PixelToy } from '@pxlkit/ui-kit-vue';",
    components: [{ name: "PixelToy", props: [], events: [], slots: [{ name: "default", props: "", description: "" }], notes: [] }],
  },
};

describe("the section's API data", () => {
  it("writes each framework's reference as a literal, quoted for the fewest escapes, without empty fields", () => {
    expect(renderApiConstant("PixelToy", toy)).toBe(
      [
        "/** PixelToy's API in each kit, read from its sources by `npm run docs:build`. */",
        "const api: FrameworkApiReferences = {",
        "  react: {",
        `    import: "import { PixelToy } from '@pxlkit/ui-kit';",`,
        "    components: [",
        "      {",
        "        name: 'PixelToy',",
        "        props: [",
        `          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Its size, in \`px\`.' },`,
        "        ],",
        "        notes: [",
        "          '`ref` points to `<div>`.',",
        "        ],",
        "      },",
        "    ],",
        "  },",
        "  vue: {",
        `    import: "import { PixelToy } from '@pxlkit/ui-kit-vue';",`,
        "    components: [",
        "      {",
        "        name: 'PixelToy',",
        "        slots: [",
        "          { name: 'default' },",
        "        ],",
        "      },",
        "    ],",
        "  },",
        "};",
      ].join("\n"),
    );
  });

  it("passes the tabs only the frameworks that have the component", () => {
    expect(renderApiBlock("PixelToy", "pixel-toy", toy)).toContain(
      "<FrameworkApi label={'PixelToy API'} react={api.react} vue={api.vue} />",
    );
  });
});

describe("apiCoherenceFindings", () => {
  const section = (api: ComponentApi, name = "PixelToy") => ({
    file: `apps/web/src/app/docs/sections/${name}.section.tsx`,
    source: `${renderApiConstant(name, api)}\n<FrameworkApi label={'${name} API'} />`,
  });
  const angular: ApiReference = {
    import: "import { PixelToy } from '@pxlkit/ui-kit-angular';",
    components: [{ name: "PixelToy", selector: "pxl-toy", props: [], events: [], slots: [], notes: [] }],
  };

  it("passes an up-to-date reference in every framework", () => {
    const api = { ...toy, angular: { ...angular, components: [{ ...angular.components[0]!, props: toy.react!.components[0]!.props }] } };
    const findings = apiCoherenceFindings({
      index: new Map<string, ComponentApi>([["PixelToy", api]]),
      sections: new Map([["PixelToy", section(api)]]),
      released: new Set(["vue", "angular"]),
      emptyReasons: {},
    });
    expect(findings.filter((f) => f.severity !== "info")).toEqual([]);
    // The Vue default slot has no description.
    expect(findings).toEqual([expect.objectContaining({ severity: "info", message: expect.stringContaining("PixelToy.default") })]);
  });

  it("fails a missing framework once its kit is released, an empty reference without a reason, and a stale section", () => {
    const api = { ...toy, angular };
    const findings = apiCoherenceFindings({
      index: new Map<string, ComponentApi>([
        ["PixelToy", api],
        ["PixelGone", { vue: toy.vue! }],
      ]),
      sections: new Map([
        ["PixelToy", { file: "PixelToy.section.tsx", source: section(toy).source }],
        ["PixelGone", { file: "PixelGone.section.tsx" }],
      ]),
      released: new Set(["vue"]),
      emptyReasons: { "react PixelOld": "Gone." },
    });
    const majors = findings.filter((f) => f.severity === "major").map((f) => f.message);
    expect(majors).toEqual([
      "PixelToy's angular API reference lists no prop, event or slot.",
      "PixelToy.section.tsx does not show PixelToy's API as its kits' sources have it.",
      "PixelGone has no react API reference: its kit does not export it, or its source cannot be read.",
    ]);
    // Angular is not released at the React kit's version yet: its gap is information.
    expect(findings.find((f) => f.message.startsWith("PixelGone has no angular"))?.severity).toBe("info");
    expect(findings.find((f) => f.severity === "minor")?.message).toContain('"react PixelOld"');
  });

  it("accepts an empty reference with a reason, and a port not released yet without the component", () => {
    const api = { ...toy, angular };
    const findings = apiCoherenceFindings({
      index: new Map<string, ComponentApi>([
        ["PixelToy", api],
        ["PixelNew", { react: toy.react! }],
      ]),
      sections: new Map([
        ["PixelToy", section(api)],
        ["PixelNew", section({ react: toy.react! }, "PixelNew")],
      ]),
      released: new Set(),
      emptyReasons: { "angular PixelToy": "A directive without inputs." },
    });
    expect(findings.filter((f) => f.severity === "major" || f.severity === "minor")).toEqual([]);
  });
});
