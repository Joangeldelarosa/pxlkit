/**
 * Tests for generate-stories.ts
 *
 * Strategy: drive the pure helpers (renderStoryStub, manifestToStubInput,
 * deriveStoriesPath, deriveStorybookTitle, exampleIdToExportName) directly to
 * keep the suite hermetic, then exercise generateStories end-to-end against an
 * in-memory tmpdir to prove:
 *   - emits a stub when no sibling .stories.tsx exists
 *   - skips when a sibling .stories.tsx already exists
 *   - skips when the manifest has zero examples
 *   - honours dryRun (no fs writes)
 *   - honours force (overwrites)
 */

import { afterAll, beforeEach, describe, expect, it } from "vitest";
import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import ts from "typescript";
import {
  deriveStoriesPath,
  deriveStorybookTitle,
  exampleIdToExportName,
  generateStories,
  manifestToStubInput,
  renderStoryStub,
  type StoryStubInput,
} from "../generate-stories";
import type { ManifestRecord } from "../_lib/generator-base";

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe("deriveStoriesPath", () => {
  it("places stub next to the source TSX file with .stories.tsx extension", () => {
    const src = "C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.tsx";
    expect(deriveStoriesPath(src)).toBe(
      "C:/pxlkit/packages/ui-kit/src/cards/PixelFeatureCard.stories.tsx",
    );
  });
});

describe("deriveStorybookTitle", () => {
  const baseRecord = (overrides: Partial<ManifestRecord>): ManifestRecord => ({
    manifest: {
      name: "PixelFeatureCard",
      category: "cards",
      description: "x",
    } as unknown as ManifestRecord["manifest"],
    sourceFile: "/r/packages/ui-kit/src/cards/PixelFeatureCard.tsx",
    manifestFile: "/r/packages/ui-kit/src/cards/PixelFeatureCard.manifest.ts",
    package: "@pxlkit/ui-kit",
    ...overrides,
  });

  it("maps @pxlkit/ui-kit to 'UI Kit / <Category> / <Name>'", () => {
    expect(deriveStorybookTitle(baseRecord({}))).toBe(
      "UI Kit / Cards / PixelFeatureCard",
    );
  });

  it("uses PascalCased package leaf for non-ui-kit packages", () => {
    const rec = baseRecord({
      package: "@pxlkit/effects",
      manifest: {
        name: "PixelGlitch",
        category: "animations",
        description: "x",
      } as unknown as ManifestRecord["manifest"],
    });
    expect(deriveStorybookTitle(rec)).toBe("Effects / Animations / PixelGlitch");
  });

  it("falls back to 'Misc' when category is missing", () => {
    const rec = baseRecord({
      manifest: {
        name: "Lone",
        description: "x",
      } as unknown as ManifestRecord["manifest"],
    });
    expect(deriveStorybookTitle(rec)).toBe("UI Kit / Misc / Lone");
  });
});

describe("exampleIdToExportName", () => {
  it("PascalCases kebab-case ids", () => {
    expect(exampleIdToExportName("with-icon")).toBe("WithIcon");
    expect(exampleIdToExportName("default")).toBe("Default");
  });

  it("prefixes leading-digit ids so the export stays a valid identifier", () => {
    expect(exampleIdToExportName("3d-tilt")).toBe("Story3dTilt");
    expect(/^[A-Za-z_$]/.test(exampleIdToExportName("3d-tilt"))).toBe(true);
  });

  it("falls back to 'Default' when the id is empty after sanitisation", () => {
    expect(exampleIdToExportName("///")).toBe("Default");
  });
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

describe("renderStoryStub", () => {
  const stub: StoryStubInput = {
    componentName: "PixelFeatureCard",
    storybookTitle: "UI Kit / Cards / PixelFeatureCard",
    componentImport: "./PixelFeatureCard",
    manifestImport: "./PixelFeatureCard.manifest",
    examplesImport: "./PixelFeatureCard.examples",
    examples: [
      { id: "default", label: "Default" },
      {
        id: "with-icon",
        label: "With Icon",
        description: "Icon in the leading slot",
        tags: ["icon"],
      },
    ],
    status: "stable",
    category: "cards",
  };

  it("imports the component, examples, and manifest", () => {
    const out = renderStoryStub(stub);
    expect(out).toContain(`import * as Component from './PixelFeatureCard';`);
    expect(out).toContain(
      `import * as examples from './PixelFeatureCard.examples';`,
    );
    expect(out).toContain(
      `import manifest from './PixelFeatureCard.manifest';`,
    );
  });

  it("exposes the storybook title and autodocs tag at the meta level", () => {
    const out = renderStoryStub(stub);
    expect(out).toContain(`title: 'UI Kit / Cards / PixelFeatureCard'`);
    expect(out).toContain(`"autodocs"`);
    expect(out).toContain(`"status-stable"`);
    expect(out).toContain(`"cat-cards"`);
  });

  it("exports one story per example with the kebab id PascalCased", () => {
    const out = renderStoryStub(stub);
    expect(out).toContain("export const Default: Story");
    expect(out).toContain("export const WithIcon: Story");
    expect(out).toContain(`name: 'With Icon'`);
    expect(out).toContain(`example-default`);
    expect(out).toContain(`example-with-icon`);
  });

  it("falls back to manifest.examples when the examples module is missing", () => {
    const out = renderStoryStub({
      ...stub,
      examplesImport: undefined,
    });
    expect(out).toContain(
      `const examples: Record<string, unknown> = {};`,
    );
    expect(out).toContain(`(manifest as any)?.examples?.find?.`);
  });

  it("refuses to render when no examples are provided", () => {
    expect(() =>
      renderStoryStub({
        ...stub,
        examples: [],
      }),
    ).toThrow(/zero examples/);
  });
});

// ---------------------------------------------------------------------------
// Renderer — escaping / syntax safety
//
// Regression suite for the Ola 4c.x bug where 7 of 111 generated stories were
// syntactically invalid TypeScript. Root cause: example ids were inlined as
// dot-access (`(examples as any).collapsed-by-default`), which parses as
// subtraction and becomes a hard syntax error whenever a kebab segment is a
// reserved word (`class`, `in`, `with`, `default`). The renderer must produce
// valid TSX for ANY schema-valid manifest content.
// ---------------------------------------------------------------------------

/**
 * Syntax oracle: transpile the rendered stub with the TypeScript compiler and
 * return its syntactic diagnostics. transpileModule does no type checking, so
 * any diagnostic here is a genuine parse error — exactly the failure class
 * that broke `tsc --noEmit -p packages/ui-kit`.
 */
function syntaxErrors(code: string): string[] {
  const out = ts.transpileModule(code, {
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
    fileName: "Stub.stories.tsx",
  });
  return (out.diagnostics ?? []).map((d) =>
    ts.flattenDiagnosticMessageText(d.messageText, "\n"),
  );
}

describe("renderStoryStub — escaping / syntax safety", () => {
  const base: StoryStubInput = {
    componentName: "PixelAccordion",
    storybookTitle: "UI Kit / Navigation / PixelAccordion",
    componentImport: "./PixelAccordion",
    manifestImport: "./PixelAccordion.manifest",
    examplesImport: "./PixelAccordion.examples",
    examples: [{ id: "default", label: "Default" }],
    status: "stable",
    category: "navigation",
  };

  it("emits syntactically valid TSX for kebab ids whose segments are reserved words", () => {
    // The exact ids that broke 7 real components in Ola 4c.x.
    const out = renderStoryStub({
      ...base,
      examples: [
        { id: "collapsed-by-default", label: "Collapsed" }, // `default`
        { id: "inline-in-prose", label: "Inline" }, // `in`
        { id: "with-custom-class", label: "Custom class" }, // `class`
        { id: "range-with-marks", label: "Marks" }, // `with`
      ],
    });
    expect(syntaxErrors(out)).toEqual([]);
  });

  it("never dot-accesses a raw non-identifier id; looks up the PascalCase export instead", () => {
    const out = renderStoryStub({
      ...base,
      examples: [{ id: "collapsed-by-default", label: "Collapsed" }],
    });
    expect(out).not.toContain("(examples as any).collapsed-by-default");
    // Examples modules export PascalCase functions (e.g. CollapsedByDefault),
    // so the identifier lookup must use the derived export name…
    expect(out).toContain("(examples as any).CollapsedByDefault");
    // …while keeping the raw-id bracket lookup as a fallback.
    expect(out).toContain(`(examples as any)['collapsed-by-default']`);
  });

  it("escapes quotes and newlines in labels and descriptions", () => {
    const out = renderStoryStub({
      ...base,
      examples: [
        {
          id: "default",
          label: "It's 'quoted'",
          description: "line one\nline two with a backslash \\ and 'quotes'",
        },
      ],
    });
    expect(syntaxErrors(out)).toEqual([]);
    expect(out).toContain(`name: 'It\\'s \\'quoted\\''`);
  });

  it("does not let '*/' in labels or descriptions terminate the JSDoc banner", () => {
    const out = renderStoryStub({
      ...base,
      examples: [
        {
          id: "default",
          label: "evil */ label",
          description: "desc with */ inside",
        },
      ],
    });
    expect(syntaxErrors(out)).toEqual([]);
  });

  it("keeps the missing-example JSX fallback valid when ids contain JSX-hostile characters", () => {
    const out = renderStoryStub({
      ...base,
      examples: [{ id: "weird{id}<x>", label: "Weird" }],
    });
    expect(syntaxErrors(out)).toEqual([]);
  });

  it("dedupes colliding export names so the module never declares duplicate exports", () => {
    const out = renderStoryStub({
      ...base,
      examples: [
        { id: "with-icon", label: "A" },
        { id: "with_icon", label: "B" },
      ],
    });
    expect(syntaxErrors(out)).toEqual([]);
    expect(out).toContain("export const WithIcon: Story");
    expect(out).toContain("export const WithIcon2: Story");
  });

  it("renders a fully parseable stub for the realistic worst-case manifest", () => {
    const out = renderStoryStub({
      ...base,
      examples: [
        { id: "default", label: "Default" },
        {
          id: "phone-with-country-code",
          label: "Phone — with 'country' code",
          description: "Uses the <PixelSelect /> sibling.\nMulti-line.",
          tags: ["forms", "composed"],
        },
      ],
    });
    expect(syntaxErrors(out)).toEqual([]);
    expect(out).toContain("export const Default: Story");
    expect(out).toContain("export const PhoneWithCountryCode: Story");
  });
});

// ---------------------------------------------------------------------------
// manifestToStubInput
// ---------------------------------------------------------------------------

describe("manifestToStubInput", () => {
  const StubComponent = () => null;
  const fakeRecord = (overrides: Partial<ManifestRecord> = {}): ManifestRecord =>
    ({
      manifest: {
        name: "PixelFeatureCard",
        category: "cards",
        description: "x",
        status: "stable",
        examples: [
          { id: "default", label: "Default", Component: StubComponent },
        ],
      } as unknown as ManifestRecord["manifest"],
      sourceFile: "/r/packages/ui-kit/src/cards/PixelFeatureCard.tsx",
      manifestFile: "/r/packages/ui-kit/src/cards/PixelFeatureCard.manifest.ts",
      examplesFile: "/r/packages/ui-kit/src/cards/PixelFeatureCard.examples.tsx",
      package: "@pxlkit/ui-kit",
      ...overrides,
    }) as ManifestRecord;

  it("computes relative POSIX module specifiers without extensions", () => {
    const stub = manifestToStubInput(fakeRecord());
    expect(stub).not.toBeNull();
    expect(stub!.componentImport).toBe("./PixelFeatureCard");
    expect(stub!.manifestImport).toBe("./PixelFeatureCard.manifest");
    expect(stub!.examplesImport).toBe("./PixelFeatureCard.examples");
    expect(stub!.storybookTitle).toBe(
      "UI Kit / Cards / PixelFeatureCard",
    );
  });

  it("returns null when the manifest declares no examples", () => {
    const rec = fakeRecord({
      manifest: {
        name: "Empty",
        category: "cards",
        description: "x",
        examples: [],
      } as unknown as ManifestRecord["manifest"],
    });
    expect(manifestToStubInput(rec)).toBeNull();
  });

  it("omits the examples specifier when no sibling examples file exists", () => {
    const rec = fakeRecord({ examplesFile: undefined });
    const stub = manifestToStubInput(rec);
    expect(stub!.examplesImport).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// End-to-end against a tmp workspace
// ---------------------------------------------------------------------------

const TMP_ROOTS: string[] = [];

async function makeTmpRoot(): Promise<string> {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "pxlkit-gen-stories-"),
  );
  TMP_ROOTS.push(root);
  return root;
}

afterAll(async () => {
  for (const r of TMP_ROOTS) {
    await fs.remove(r).catch(() => undefined);
  }
});

function buildRecord(root: string, componentName: string, opts?: {
  examples?: Array<{ id: string; label: string }>;
  withExamplesFile?: boolean;
}): ManifestRecord {
  const StubComponent = () => null;
  const dir = path.join(root, "packages", "ui-kit", "src", "cards");
  const sourceFile = toPosix(path.join(dir, `${componentName}.tsx`));
  const manifestFile = toPosix(path.join(dir, `${componentName}.manifest.ts`));
  const examplesFile = toPosix(path.join(dir, `${componentName}.examples.tsx`));
  return {
    manifest: {
      name: componentName,
      category: "cards",
      description: "x",
      status: "stable",
      examples:
        opts?.examples ??
        [{ id: "default", label: "Default", Component: StubComponent } as unknown],
    } as unknown as ManifestRecord["manifest"],
    sourceFile,
    manifestFile,
    examplesFile: opts?.withExamplesFile === false ? undefined : examplesFile,
    package: "@pxlkit/ui-kit",
  };
}

describe("generateStories (E2E)", () => {
  let root: string;

  beforeEach(async () => {
    root = await makeTmpRoot();
  });

  it("emits a stub for a component with no existing *.stories.tsx", async () => {
    const record = buildRecord(root, "PixelFeatureCard");
    const out = await generateStories({
      repoRoot: root,
      manifests: [record],
    });

    expect(out.outputs).toHaveLength(1);
    expect(out.skippedExisting).toHaveLength(0);
    expect(out.skippedNoExamples).toHaveLength(0);

    const target = deriveStoriesPath(record.sourceFile);
    expect(await fs.pathExists(target)).toBe(true);
    const written = await fs.readFile(target, "utf8");
    expect(written).toContain("export default meta");
    expect(written).toContain("export const Default: Story");
  });

  it("skips emission when a hand-authored *.stories.tsx already exists", async () => {
    const record = buildRecord(root, "PixelFeatureCard");
    const target = deriveStoriesPath(record.sourceFile);
    await fs.ensureDir(path.dirname(target));
    await fs.writeFile(target, "// hand authored\n", "utf8");

    const out = await generateStories({
      repoRoot: root,
      manifests: [record],
    });

    expect(out.outputs).toHaveLength(0);
    expect(out.skippedExisting).toEqual([target]);

    const after = await fs.readFile(target, "utf8");
    expect(after).toBe("// hand authored\n");
  });

  it("skips emission when the manifest has zero examples", async () => {
    const record = buildRecord(root, "PixelFeatureCard", { examples: [] });
    const out = await generateStories({
      repoRoot: root,
      manifests: [record],
    });

    expect(out.outputs).toHaveLength(0);
    expect(out.skippedNoExamples).toEqual(["PixelFeatureCard"]);

    const target = deriveStoriesPath(record.sourceFile);
    expect(await fs.pathExists(target)).toBe(false);
  });

  it("honours dryRun: returns outputs but writes nothing", async () => {
    const record = buildRecord(root, "PixelFeatureCard");
    const out = await generateStories({
      repoRoot: root,
      manifests: [record],
      dryRun: true,
    });

    expect(out.outputs).toHaveLength(1);
    const target = deriveStoriesPath(record.sourceFile);
    expect(await fs.pathExists(target)).toBe(false);
  });

  it("honours force=true and overwrites an existing file", async () => {
    const record = buildRecord(root, "PixelFeatureCard");
    const target = deriveStoriesPath(record.sourceFile);
    await fs.ensureDir(path.dirname(target));
    await fs.writeFile(target, "// hand authored\n", "utf8");

    const out = await generateStories({
      repoRoot: root,
      manifests: [record],
      force: true,
    });

    expect(out.outputs).toHaveLength(1);
    const written = await fs.readFile(target, "utf8");
    expect(written).toContain("export const Default: Story");
  });
});
