/**
 * Tests for generate-docs-page.ts
 *
 * Verifies:
 *  - slug derivation
 *  - prop / keyboard / example normalization
 *  - deprecation banner emission
 *  - JSX/template-literal escaping
 *  - rendered module shape (banner, named export, default export, accessibility attrs)
 *  - safe write path: <outRoot>/<Name>.section.tsx
 *  - dryRun does NOT touch the filesystem
 *  - error path: malformed manifest is recorded, never thrown
 */

import path from "node:path";
import os from "node:os";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_OUT_SUBPATH,
  FILE_EXT,
  escapeForTemplateLiteral,
  escapeJsxText,
  generateDocsPage,
  normalizeExamples,
  normalizeKeyboard,
  normalizeProps,
  normalizeDeprecation,
  planEntryFor,
  renderSectionModule,
  slugFor,
} from "../generate-docs-page";
import type { ManifestRecord } from "../_lib/generator-base";

function fakeRecord(
  manifest: Record<string, unknown>,
  manifestFile = "/repo/packages/ui-kit/src/PixelButton.manifest.ts",
): ManifestRecord {
  return {
    manifest: { name: "PixelButton", ...manifest } as ManifestRecord["manifest"],
    sourceFile: manifestFile.replace(/\.manifest\.ts$/, ".tsx"),
    manifestFile,
    package: "@pxlkit/ui-kit",
  };
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe("slugFor", () => {
  it("converts PascalCase to kebab-case", () => {
    expect(slugFor("PixelButton")).toBe("pixel-button");
    expect(slugFor("PxlKitToast")).toBe("pxl-kit-toast");
  });
});

describe("escapeJsxText", () => {
  it("escapes the five JSX-hostile chars", () => {
    const out = escapeJsxText("<a> & {x} > b</a>");
    // No raw hostile chars remain (only the entity forms below).
    expect(out).not.toMatch(/<[a-zA-Z/]/);
    expect(out).not.toMatch(/[<>]/);
    expect(out).not.toMatch(/[{}]/);
    expect(out).toContain("&lt;");
    expect(out).toContain("&gt;");
    expect(out).toContain("&amp;");
    expect(out).toContain("&#123;");
    expect(out).toContain("&#125;");
  });

  it("escapes & before other entities so output is well-formed", () => {
    expect(escapeJsxText("&")).toBe("&amp;");
    // Make sure we did not double-escape: input "<" -> "&lt;", not "&amp;lt;"
    expect(escapeJsxText("<")).toBe("&lt;");
  });
});

describe("escapeForTemplateLiteral", () => {
  it("escapes backticks, backslashes, and ${ interpolation", () => {
    const out = escapeForTemplateLiteral("a `b` \\ ${ c }");
    expect(out).toBe("a \\`b\\` \\\\ \\${ c }");
  });
});

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

describe("normalizeProps", () => {
  it("returns [] when manifest.props is 'auto'", () => {
    const out = normalizeProps({ name: "X", props: "auto" } as never);
    expect(out).toEqual([]);
  });

  it("accepts a permissive prop array and fills defaults", () => {
    const out = normalizeProps({
      name: "X",
      props: [
        {
          name: "tone",
          type: "ToneKey",
          required: true,
          default: "neutral",
          description: "Color tone",
        },
        { name: "icon" },
      ],
    } as never);
    expect(out).toHaveLength(2);
    expect(out[0]!.name).toBe("tone");
    expect(out[0]!.required).toBe(true);
    expect(out[0]!.defaultValue).toBe("neutral");
    expect(out[1]!.name).toBe("icon");
    expect(out[1]!.type).toBe("unknown");
    expect(out[1]!.required).toBe(false);
  });

  it("drops props missing a name", () => {
    const out = normalizeProps({
      name: "X",
      props: [{ type: "string" }, { name: "ok" }],
    } as never);
    expect(out).toHaveLength(1);
    expect(out[0]!.name).toBe("ok");
  });
});

describe("normalizeKeyboard", () => {
  it("normalizes a11y.keyboard bindings", () => {
    const out = normalizeKeyboard({
      name: "X",
      a11y: {
        wcag: "2.1 AA",
        patterns: ["button"],
        keyboard: [
          { key: "Enter", does: "activate" },
          { key: "Space", does: "activate", when: "focused" },
          { key: "", does: "ignore-me" }, // dropped
        ],
      },
    } as never);
    expect(out).toHaveLength(2);
    expect(out[0]!.key).toBe("Enter");
    expect(out[1]!.when).toBe("focused");
  });

  it("returns [] when a11y or keyboard is missing", () => {
    expect(normalizeKeyboard({ name: "X" } as never)).toEqual([]);
    expect(normalizeKeyboard({ name: "X", a11y: { wcag: "2.1 AA", patterns: [] } } as never)).toEqual([]);
  });
});

describe("normalizeExamples", () => {
  it("only keeps examples that carry renderable code", () => {
    const StubComponent = () => null;
    const out = normalizeExamples({
      name: "X",
      examples: [
        { id: "default", label: "Default", Component: StubComponent }, // no code -> dropped
        {
          id: "with-icon",
          label: "With Icon",
          Component: StubComponent,
          codeOverride: "<Button icon='star' />",
          description: "Has an icon",
        },
        { id: "alt", label: "Alt", code: "<Button alt />" } as never, // permissive `code`
      ],
    } as never);
    expect(out).toHaveLength(2);
    expect(out[0]!.id).toBe("with-icon");
    expect(out[0]!.code).toContain("Button");
    expect(out[0]!.description).toBe("Has an icon");
    expect(out[1]!.id).toBe("alt");
  });
});

describe("normalizeDeprecation", () => {
  it("flags a deprecated status with the strict fields", () => {
    const d = normalizeDeprecation({
      name: "X",
      status: "deprecated",
      deprecatedNote: "Use Y.",
      deprecatedReplacement: "Y",
      deprecatedRemovedIn: "2.0.0",
    } as never);
    expect(d.deprecated).toBe(true);
    expect(d.note).toBe("Use Y.");
    expect(d.replacement).toBe("Y");
    expect(d.removedIn).toBe("2.0.0");
  });

  it("flags a permissive `deprecated` object", () => {
    const d = normalizeDeprecation({
      name: "X",
      deprecated: { note: "gone", replacement: "Z", since: "1.5.0" },
    } as never);
    expect(d.deprecated).toBe(true);
    expect(d.note).toBe("gone");
    expect(d.replacement).toBe("Z");
    expect(d.removedIn).toBe("1.5.0");
  });

  it("returns deprecated:false for a stable manifest", () => {
    const d = normalizeDeprecation({ name: "X", status: "stable" } as never);
    expect(d.deprecated).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// planEntryFor
// ---------------------------------------------------------------------------

describe("planEntryFor", () => {
  const outRoot = "/repo/apps/web/src/app/docs/sections";

  it("produces a fully-resolved plan entry", () => {
    const entry = planEntryFor(
      fakeRecord({
        name: "PixelButton",
        description: "Primary action.",
        category: "actions",
        status: "stable",
        since: "1.0.0",
        highlights: ["Tone-aware", "Pixel/linear"],
        a11y: { wcag: "2.1 AA", patterns: ["button"] },
        tags: ["action", "button"],
        related: ["LinkButton"],
      }),
      outRoot,
    );
    expect(entry.name).toBe("PixelButton");
    expect(entry.slug).toBe("pixel-button");
    expect(entry.outFile).toBe(`${outRoot}/PixelButton${FILE_EXT}`);
    expect(entry.status).toBe("stable");
    expect(entry.category).toBe("actions");
    expect(entry.wcagLevel).toBe("2.1 AA");
    expect(entry.ariaPatterns).toContain("button");
    expect(entry.tags).toEqual(["action", "button"]);
    expect(entry.related).toEqual(["LinkButton"]);
  });

  it("throws when name is missing", () => {
    expect(() =>
      planEntryFor(
        {
          manifest: { description: "no name" } as unknown as ManifestRecord["manifest"],
          sourceFile: "/r.tsx",
          manifestFile: "/r.manifest.ts",
          package: "@pxlkit/ui-kit",
        },
        outRoot,
      ),
    ).toThrow(/missing a string `name`/);
  });

  it("throws when name is not PascalCase", () => {
    expect(() =>
      planEntryFor(
        {
          manifest: { name: "pixelButton" } as unknown as ManifestRecord["manifest"],
          sourceFile: "/r.tsx",
          manifestFile: "/r.manifest.ts",
          package: "@pxlkit/ui-kit",
        },
        outRoot,
      ),
    ).toThrow(/PascalCase/);
  });
});

// ---------------------------------------------------------------------------
// renderSectionModule
// ---------------------------------------------------------------------------

describe("renderSectionModule", () => {
  const baseRec = () =>
    fakeRecord({
      name: "PixelButton",
      description: "Primary action button.",
      status: "stable",
      since: "1.0.0",
      category: "actions",
      highlights: ["Tone-aware", "SSR-safe"],
      a11y: {
        wcag: "2.1 AA",
        patterns: ["button"],
        notes: "Mind focus ring contrast on dark tones.",
        keyboard: [
          { key: "Enter", does: "activate" },
          { key: "Space", does: "activate", when: "focused" },
        ],
      },
      props: [
        {
          name: "tone",
          type: "'neutral' | 'cyan'",
          required: false,
          default: "neutral",
          description: "Color tone.",
        },
        { name: "label", type: "string", required: true },
      ],
      examples: [
        {
          id: "default",
          label: "Default",
          codeOverride: "<PixelButton label='Save' />",
        },
      ],
      related: ["LinkButton"],
      tags: ["action"],
    });

  it("emits banner + named + default export", () => {
    const entry = planEntryFor(baseRec(), "/o");
    const src = renderSectionModule(entry);
    expect(src).toContain("AUTO-GENERATED");
    expect(src).toContain("import * as React from 'react';");
    expect(src).toContain("export function PixelButtonDocsSection");
    expect(src).toContain("export default PixelButtonDocsSection");
    expect(src).toContain("export const PixelButtonDocsMeta");
  });

  it("includes Props table headings and rows", () => {
    const entry = planEntryFor(baseRec(), "/o");
    const src = renderSectionModule(entry);
    expect(src).toContain("<h3>Props</h3>");
    expect(src).toContain("<th scope=\"col\">Prop</th>");
    expect(src).toContain("<code>tone</code>");
    expect(src).toContain("<code>label</code>");
    // required prop gets a marker
    expect(src).toContain('docs-required');
  });

  it("includes A11y block + keyboard table when bindings exist", () => {
    const entry = planEntryFor(baseRec(), "/o");
    const src = renderSectionModule(entry);
    expect(src).toContain("Accessibility");
    expect(src).toContain("WCAG target:");
    expect(src).toContain("2.1 AA");
    expect(src).toContain("<h4>Keyboard</h4>");
    expect(src).toContain("<kbd>Enter</kbd>");
    expect(src).toContain("<kbd>Space</kbd>");
  });

  it("emits a deprecation banner when status=deprecated", () => {
    const dep = fakeRecord({
      name: "OldButton",
      description: "x",
      status: "deprecated",
      since: "0.9.0",
      category: "actions",
      highlights: ["a", "b"],
      a11y: { wcag: "2.1 AA", patterns: ["button"] },
      deprecatedNote: "Switch to PixelButton.",
      deprecatedReplacement: "PixelButton",
      deprecatedRemovedIn: "2.0.0",
      props: "auto",
      examples: [],
      related: [],
    });
    const entry = planEntryFor(dep, "/o");
    const src = renderSectionModule(entry);
    expect(src).toContain('role="alert"');
    expect(src).toContain("Deprecated.");
    expect(src).toContain("Switch to PixelButton.");
    expect(src).toContain("<code>PixelButton</code>");
    expect(src).toContain("v2.0.0");
  });

  it("renders examples with escaped code in a template literal", () => {
    const rec = fakeRecord({
      name: "PixelButton",
      description: "x",
      status: "stable",
      since: "1.0.0",
      category: "actions",
      highlights: ["a", "b"],
      a11y: { wcag: "2.1 AA", patterns: ["button"] },
      props: "auto",
      examples: [
        {
          id: "tricky",
          label: "Tricky `quoted` ${name}",
          codeOverride: "const x = `a ${b} \\n`;",
        },
      ],
      related: [],
    });
    const entry = planEntryFor(rec, "/o");
    const src = renderSectionModule(entry);
    expect(src).toContain("docs-example");
    // Backticks inside the example must be escaped so the surrounding template literal closes correctly.
    expect(src).toContain("\\`a \\${b}");
  });

  it("escapes hostile JSX text in description / label", () => {
    const rec = fakeRecord({
      name: "PixelButton",
      description: "<script>alert(1)</script> & {x}",
      status: "stable",
      since: "1.0.0",
      category: "actions",
      highlights: ["a", "b"],
      a11y: { wcag: "2.1 AA", patterns: ["button"] },
      props: "auto",
      examples: [],
      related: [],
    });
    const entry = planEntryFor(rec, "/o");
    const src = renderSectionModule(entry);
    expect(src).toContain("&lt;script&gt;");
    expect(src).toContain("&amp;");
    expect(src).toContain("&#123;x&#125;");
    expect(src).not.toMatch(/<script>alert\(1\)<\/script>/);
  });

  it("renders an empty-props placeholder when no props are provided", () => {
    const rec = fakeRecord({
      name: "PixelCard",
      description: "x",
      status: "stable",
      since: "1.0.0",
      category: "cards",
      highlights: ["a", "b"],
      a11y: { wcag: "2.1 AA", patterns: ["region"] },
      props: "auto",
      examples: [],
      related: [],
    });
    const entry = planEntryFor(rec, "/o");
    const src = renderSectionModule(entry);
    expect(src).toContain("No props documented yet.");
  });
});

// ---------------------------------------------------------------------------
// generateDocsPage end-to-end against a real tmp directory
// ---------------------------------------------------------------------------

describe("generateDocsPage (e2e against tmpdir)", () => {
  let tmpRoot: string;
  let outRoot: string;

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "gen-docs-"));
    outRoot = path.join(tmpRoot, "out");
  });

  afterEach(async () => {
    await fs.remove(tmpRoot);
  });

  function rec(name: string, extras: Record<string, unknown> = {}): ManifestRecord {
    return {
      manifest: {
        name,
        description: `${name} description.`,
        status: "stable",
        since: "1.0.0",
        category: "actions",
        highlights: ["a", "b"],
        a11y: { wcag: "2.1 AA", patterns: ["button"] },
        props: "auto",
        examples: [],
        related: [],
        ...extras,
      } as unknown as ManifestRecord["manifest"],
      sourceFile: `/repo/src/${name}.tsx`,
      manifestFile: `/repo/src/${name}.manifest.ts`,
      package: "@pxlkit/ui-kit",
    };
  }

  it("writes one <Name>.section.tsx per manifest", async () => {
    const manifests = [rec("PixelButton"), rec("PixelChip")];
    const report = await generateDocsPage({ repoRoot: tmpRoot, outRoot, manifests });

    expect(report.ok).toBe(true);
    expect(report.count).toBe(2);
    // 2 sections + the usage-snippets map module
    expect(report.written).toBe(3);
    expect(report.errors).toEqual([]);

    const a = path.join(outRoot, `PixelButton${FILE_EXT}`);
    const b = path.join(outRoot, `PixelChip${FILE_EXT}`);
    expect(await fs.pathExists(a)).toBe(true);
    expect(await fs.pathExists(b)).toBe(true);

    const content = await fs.readFile(a, "utf8");
    expect(content).toContain("export default PixelButtonDocsSection");
    expect(content).toContain("PixelButton description.");
  });

  it("dryRun does not write to disk", async () => {
    const manifests = [rec("PixelAvatar")];
    const report = await generateDocsPage({
      repoRoot: tmpRoot,
      outRoot,
      manifests,
      dryRun: true,
    });

    expect(report.ok).toBe(true);
    expect(report.count).toBe(1);
    expect(report.written).toBe(0);
    expect(report.skipped).toBe(1);
    expect(report.entries).toHaveLength(1);
    expect(await fs.pathExists(path.join(outRoot, `PixelAvatar${FILE_EXT}`))).toBe(false);
  });

  it("records errors without throwing when a manifest is malformed", async () => {
    const good = rec("PixelGood");
    const bad: ManifestRecord = {
      manifest: { description: "no name" } as unknown as ManifestRecord["manifest"],
      sourceFile: "/repo/src/Bad.tsx",
      manifestFile: "/repo/src/Bad.manifest.ts",
      package: "@pxlkit/ui-kit",
    };

    const report = await generateDocsPage({
      repoRoot: tmpRoot,
      outRoot,
      manifests: [good, bad],
    });

    expect(report.ok).toBe(false);
    // 1 valid section + the usage-snippets map module
    expect(report.written).toBe(2);
    expect(report.errors).toHaveLength(1);
    expect(report.errors[0]!.message).toMatch(/missing a string `name`/);
  });

  it("uses the default outRoot when not specified", async () => {
    const manifests = [rec("PixelKbd")];
    const report = await generateDocsPage({
      repoRoot: tmpRoot,
      manifests,
      dryRun: true,
    });

    expect(report.entries).toHaveLength(1);
    const expectedSuffix = `${DEFAULT_OUT_SUBPATH}/PixelKbd${FILE_EXT}`;
    const out = report.entries[0]!.outFile.split(path.sep).join("/");
    expect(out.endsWith(expectedSuffix)).toBe(true);
  });
});
