/**
 * Tests for generate-port-stories.ts: the stories file of each framework
 * (imports, title, story names shared with React, the example rendered and
 * its code), the names a package's barrels export, and the plan built from
 * the repository's own ports — one file per component a port implements in
 * full, under its category.
 */

import { describe, expect, it } from "vitest";
import path from "node:path";
import ts from "typescript";
import {
  exportedNames,
  planPortStories,
  portStoriesPath,
  renderPortStories,
  type PortStoriesInput,
} from "../generate-port-stories";
import { KIT_PORTS, type KitPort } from "../_lib/ports";
import { scanManifests } from "../scan-manifests";

const vue = KIT_PORTS.find((port) => port.framework === "vue")!;
const angular = KIT_PORTS.find((port) => port.framework === "angular")!;
const repoRoot = path.resolve(__dirname, "../../..");

function input(port: KitPort, overrides: Partial<PortStoriesInput> = {}): PortStoriesInput {
  return {
    port,
    componentName: "PixelButton",
    title: "UI Kit / Actions / PixelButton",
    description: "A button — with 'quotes'.",
    status: "stable",
    category: "actions",
    examplesSpecifier:
      port.framework === "vue" ? "../../examples/actions/PixelButton" : "../../examples/actions/pixel-button.examples",
    exportsComponent: true,
    examples: [
      { id: "default", label: "Default", exportName: "Default", code: "<PixelButton>Click me</PixelButton>\n" },
      {
        id: "with-icons",
        label: "With icons",
        description: "Icons on both sides.",
        exportName: "WithIcons",
        code: "const a = 'x';\n// */ in code\n",
      },
    ],
    ...overrides,
  };
}

/** Syntax errors of a rendered file (transpiling checks syntax, not types). */
function syntaxErrors(code: string): string[] {
  const out = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  return (out.diagnostics ?? []).map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
}

describe("renderPortStories", () => {
  it("renders the Vue examples under the React title and story names", () => {
    const out = renderPortStories(input(vue));
    expect(syntaxErrors(out)).toEqual([]);
    expect(out).toContain(`import type { Meta, StoryObj } from '@storybook/vue3-vite';`);
    expect(out).toContain(`import { PixelButton } from '@pxlkit/ui-kit-vue';`);
    expect(out).toContain(`import WithIconsExample from '../../examples/actions/PixelButton/WithIcons.vue';`);
    expect(out).toContain(`title: 'UI Kit / Actions / PixelButton',`);
    expect(out).toContain(`component: PixelButton,`);
    expect(out).toContain(`tags: ['autodocs', 'status-stable', 'cat-actions'],`);
    expect(out).toContain(`description: { component: 'A button — with \\'quotes\\'.' },`);
    expect(out).toContain("export const WithIcons: Story = {");
    expect(out).toContain("  name: 'With icons',");
    expect(out).toContain("  render: () => WithIconsExample,");
    expect(out).toContain(`description: { story: 'Icons on both sides.' },`);
    expect(out).toContain(`source: { language: 'html', code: '<PixelButton>Click me</PixelButton>' },`);
  });

  it("casts a generic Vue component, whose type is a function, for the meta", () => {
    const out = renderPortStories(input(vue, { genericComponent: true }));
    expect(out).toContain("  component: PixelButton as unknown as Meta['component'],");
    expect(syntaxErrors(out)).toEqual([]);
  });

  it("leaves the component out of a Vue meta when the package does not export it", () => {
    const out = renderPortStories(input(vue, { exportsComponent: false }));
    expect(out).not.toMatch(/^  component:/m);
    expect(out).not.toContain("from '@pxlkit/ui-kit-vue'");
  });

  it("renders the Angular examples through NgComponentOutlet", () => {
    const out = renderPortStories(input(angular));
    expect(syntaxErrors(out)).toEqual([]);
    expect(out).toContain(`import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';`);
    expect(out).toContain("  WithIcons as WithIconsExample,");
    expect(out).toContain(`} from '../../examples/actions/pixel-button.examples';`);
    expect(out).toContain("decorators: [moduleMetadata({ imports: [NgComponentOutlet] })],");
    expect(out).toContain(
      `render: () => ({ props: { example: WithIconsExample }, template: '<ng-container *ngComponentOutlet="example" />' }),`,
    );
    expect(out).toContain(`source: { language: 'typescript', code: 'const a = \\'x\\';\\n// */ in code' },`);
    expect(out).not.toMatch(/^  component:/m);
  });

  it("keeps story names apart when two example ids collide", () => {
    const out = renderPortStories(
      input(vue, {
        examples: [
          { id: "with-icon", label: "A", exportName: "WithIconA", code: "a" },
          { id: "with_icon", label: "B", exportName: "WithIconB", code: "b" },
        ],
      }),
    );
    expect(out).toContain("export const WithIcon: Story");
    expect(out).toContain("export const WithIcon2: Story");
    expect(syntaxErrors(out)).toEqual([]);
  });

  it("keeps a comment-closing label from ending its doc comment", () => {
    const out = renderPortStories(input(vue, { examples: [{ id: "x", label: "a */ b", exportName: "X", code: "x" }] }));
    expect(syntaxErrors(out)).toEqual([]);
  });

  it("refuses a component without examples", () => {
    expect(() => renderPortStories(input(vue, { examples: [] }))).toThrow(/no examples/);
  });
});

describe("exportedNames", () => {
  it("reads the value exports of barrels, aliases and defaults included, types left out", () => {
    const names = exportedNames([
      "export { default as PixelButton, type PixelButtonProps } from './PixelButton.vue';",
      "export {\n  PixelSlider,\n  type PixelSliderMark, // the marks\n} from './pixel-slider';",
      "export type { Option } from './option';",
      "export { inner as Outer } from './x';",
    ]);
    expect([...names].sort()).toEqual(["Outer", "PixelButton", "PixelSlider"]);
  });
});

describe("portStoriesPath", () => {
  it("files a Vue component by name and an Angular one by its kebab-case name, under its category", () => {
    const component = { category: "forms", exports: new Set<string>(), path: "x" };
    expect(portStoriesPath(vue, component, "PixelOTPInput")).toBe("packages/ui-kit-vue/stories/forms/PixelOTPInput.stories.ts");
    expect(portStoriesPath(angular, component, "PixelOTPInput")).toBe(
      "packages/ui-kit-angular/stories/forms/pixel-otpinput.stories.ts",
    );
  });
});

describe("planPortStories (the repository's ports)", () => {
  it("plans one stories file per component each port implements in full", async () => {
    const manifests = (await scanManifests(repoRoot)).filter((record) =>
      ["PixelButton", "PixelBadge", "PixelSlider"].includes(record.manifest.name),
    );
    const outputs = await planPortStories(repoRoot, manifests);
    const files = outputs.map((output) => path.relative(repoRoot, output.path).split(path.sep).join("/")).sort();
    expect(files).toEqual([
      "packages/ui-kit-angular/stories/actions/pixel-button.stories.ts",
      "packages/ui-kit-angular/stories/data/pixel-badge.stories.ts",
      "packages/ui-kit-angular/stories/forms/pixel-slider.stories.ts",
      "packages/ui-kit-vue/stories/actions/PixelButton.stories.ts",
      "packages/ui-kit-vue/stories/data/PixelBadge.stories.ts",
      "packages/ui-kit-vue/stories/forms/PixelSlider.stories.ts",
    ]);
    for (const output of outputs) expect(syntaxErrors(output.content)).toEqual([]);
    const vueButton = outputs.find((output) => output.path.endsWith("PixelButton.stories.ts"))!;
    expect(vueButton.content).toContain("component: PixelButton,");
    const vueSlider = outputs.find((output) => output.path.endsWith("PixelSlider.stories.ts") && output.path.includes("ui-kit-vue"))!;
    expect(vueSlider.content).toContain("component: PixelSlider as unknown as Meta['component'],");
  }, 60_000);
});
