/**
 * Tests for generate-og-images.ts
 *
 * Verifies:
 *  - slug derivation (PascalCase -> kebab-case)
 *  - tone resolution (explicit > tag hint > category default > neutral)
 *  - version resolution from manifest.since (with v-prefix normalization)
 *  - HTML template embeds name + tone + category + version + slug
 *  - HTML escaping does not break when name/category contain unsafe chars
 *  - planEntryFor throws when name is missing
 *  - generateOgImages writes one PNG per manifest, with PNG signature
 *  - dryRun does not invoke the renderer or touch disk
 *  - error path: malformed manifest reported, never thrown
 *  - --only filter narrows manifest set
 */

import path from "node:path";
import os from "node:os";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_TONE,
  GenerateOgImagesGenerator,
  MemoryRenderer,
  OG_HEIGHT,
  OG_WIDTH,
  TONE_TINTS,
  escapeHtml,
  generateOgImages,
  normalizeCategory,
  planEntryFor,
  renderOgHtml,
  resolveTone,
  resolveVersion,
  slugFor,
} from "../generate-og-images";
import type { GeneratorContext, Logger, ManifestRecord } from "../_lib/generator-base";

function fakeRecord(
  partial: Partial<{
    name: string;
    description: string;
    category: string;
    since: string;
    tone: string;
    tags: string[];
  }>,
  manifestFile = "/repo/packages/ui-kit/src/PixelButton.manifest.ts",
): ManifestRecord {
  return {
    manifest: {
      name: partial.name ?? "PixelButton",
      description: partial.description ?? "Primary action button.",
      ...(partial.category !== undefined ? { category: partial.category } : {}),
      ...(partial.since !== undefined ? { since: partial.since } : {}),
      ...(partial.tone !== undefined ? { tone: partial.tone } : {}),
      ...(partial.tags !== undefined ? { tags: partial.tags } : {}),
    },
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
    expect(slugFor("PixelEmptyState")).toBe("pixel-empty-state");
    expect(slugFor("PxlKitButton")).toBe("pxl-kit-button");
  });
});

describe("escapeHtml", () => {
  it("escapes the five basic HTML entities", () => {
    const out = escapeHtml(`<>&"'`);
    expect(out).toBe("&lt;&gt;&amp;&quot;&#39;");
  });

  it("is a no-op on already-safe input", () => {
    expect(escapeHtml("PixelButton")).toBe("PixelButton");
  });
});

describe("normalizeCategory", () => {
  it("returns kebab-case of the input", () => {
    expect(normalizeCategory("Actions")).toBe("actions");
    expect(normalizeCategory("overlay-foundation")).toBe("overlay-foundation");
  });

  it("falls back to 'components' on empty/non-string", () => {
    expect(normalizeCategory("")).toBe("components");
    expect(normalizeCategory(undefined)).toBe("components");
    expect(normalizeCategory(123)).toBe("components");
  });
});

describe("resolveTone", () => {
  it("uses an explicit tone field when present", () => {
    const rec = fakeRecord({ name: "X", tone: "gold" });
    expect(resolveTone(rec.manifest)).toBe("gold");
  });

  it("falls back to a tone hint from tags", () => {
    const rec = fakeRecord({ name: "X", tags: ["compact", "purple"] });
    expect(resolveTone(rec.manifest)).toBe("purple");
  });

  it("falls back to the category default", () => {
    const rec = fakeRecord({ name: "X", category: "actions" });
    expect(resolveTone(rec.manifest)).toBe("cyan");
  });

  it("falls back to DEFAULT_TONE for unknown categories with no tone", () => {
    const rec = fakeRecord({ name: "X", category: "marketing" });
    expect(resolveTone(rec.manifest)).toBe(DEFAULT_TONE);
  });

  it("ignores tone strings that are not in the palette", () => {
    const rec = fakeRecord({ name: "X", tone: "chartreuse", category: "forms" });
    expect(resolveTone(rec.manifest)).toBe("green");
  });
});

describe("resolveVersion", () => {
  it("renders v-prefixed semver from manifest.since", () => {
    expect(resolveVersion({ name: "X", since: "1.2.3" })).toBe("v1.2.3");
  });

  it("normalizes a v-prefixed since", () => {
    expect(resolveVersion({ name: "X", since: "v0.9.0" })).toBe("v0.9.0");
  });

  it("defaults to v1.0.0 when since is missing", () => {
    expect(resolveVersion({ name: "X" })).toBe("v1.0.0");
  });
});

// ---------------------------------------------------------------------------
// planEntryFor
// ---------------------------------------------------------------------------

describe("planEntryFor", () => {
  const outRoot = "/repo/apps/web/public/og";

  it("produces a fully-resolved plan entry", () => {
    const entry = planEntryFor(
      fakeRecord({
        name: "PixelButton",
        category: "actions",
        since: "1.0.0",
      }),
      outRoot,
    );
    expect(entry.name).toBe("PixelButton");
    expect(entry.slug).toBe("pixel-button");
    expect(entry.category).toBe("actions");
    expect(entry.version).toBe("v1.0.0");
    expect(entry.tone).toBe("cyan");
    expect(entry.outFile).toBe(`${outRoot}/pixel-button.png`);
  });

  it("falls back to components/v1.0.0/neutral when manifest is minimal", () => {
    const entry = planEntryFor(fakeRecord({ name: "Mystery" }), outRoot);
    expect(entry.category).toBe("components");
    expect(entry.version).toBe("v1.0.0");
    expect(entry.tone).toBe(DEFAULT_TONE);
    expect(entry.outFile).toBe(`${outRoot}/mystery.png`);
  });

  it("throws when manifest is missing a name", () => {
    expect(() =>
      planEntryFor(
        {
          manifest: { description: "no name" } as unknown as ManifestRecord["manifest"],
          sourceFile: "/x.tsx",
          manifestFile: "/x.manifest.ts",
          package: "@pxlkit/ui-kit",
        },
        outRoot,
      ),
    ).toThrow(/missing a string `name`/);
  });
});

// ---------------------------------------------------------------------------
// renderOgHtml
// ---------------------------------------------------------------------------

describe("renderOgHtml", () => {
  it("embeds the component name, category, version, slug, and tone", () => {
    const entry = planEntryFor(
      fakeRecord({ name: "PixelBadge", category: "feedback", since: "2.3.4" }),
      "/o",
    );
    const html = renderOgHtml(entry);
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("PixelBadge");
    expect(html).toContain("feedback");
    expect(html).toContain("v2.3.4");
    expect(html).toContain("pixel-badge");
    expect(html).toContain(`data-tone="${entry.tone}"`);
    expect(html).toContain(`data-component="PixelBadge"`);
  });

  it("declares a viewport of the OG canvas dimensions", () => {
    const entry = planEntryFor(fakeRecord({ name: "PixelCard" }), "/o");
    const html = renderOgHtml(entry);
    expect(html).toContain(`width: ${OG_WIDTH}px`);
    expect(html).toContain(`height: ${OG_HEIGHT}px`);
  });

  it("uses the tone accent color in the badge", () => {
    const entry = planEntryFor(
      fakeRecord({ name: "PixelInput", category: "forms" }),
      "/o",
    );
    const html = renderOgHtml(entry);
    expect(entry.tone).toBe("green");
    expect(html).toContain(TONE_TINTS.green.accent);
  });

  it("escapes unsafe characters in the component name", () => {
    const html = renderOgHtml({
      name: "<script>",
      slug: "script",
      outFile: "/x.png",
      category: "actions",
      version: "v1.0.0",
      tone: "cyan",
    });
    expect(html).not.toContain("<script>X");
    expect(html).toContain("&lt;script&gt;");
  });
});

// ---------------------------------------------------------------------------
// generateOgImages end-to-end with MemoryRenderer
// ---------------------------------------------------------------------------

describe("generateOgImages (e2e with MemoryRenderer)", () => {
  let tmpRoot: string;
  let outRoot: string;

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "gen-og-"));
    outRoot = path.join(tmpRoot, "out");
  });

  afterEach(async () => {
    await fs.remove(tmpRoot);
  });

  it("writes one PNG per manifest with a valid PNG signature", async () => {
    const renderer = new MemoryRenderer();
    const manifests: ManifestRecord[] = [
      fakeRecord({ name: "PixelButton", category: "actions", since: "1.0.0" }),
      fakeRecord({ name: "PixelChip", category: "data", since: "1.1.0" }),
    ];

    const report = await generateOgImages({
      repoRoot: tmpRoot,
      outRoot,
      manifests,
      renderer,
    });

    expect(report.ok).toBe(true);
    expect(report.count).toBe(2);
    expect(report.written).toBe(2);
    expect(report.errors).toEqual([]);

    const buttonFile = path.join(outRoot, "pixel-button.png");
    const chipFile = path.join(outRoot, "pixel-chip.png");
    expect(await fs.pathExists(buttonFile)).toBe(true);
    expect(await fs.pathExists(chipFile)).toBe(true);

    const head = await fs.readFile(buttonFile);
    expect(head[0]).toBe(0x89);
    expect(head[1]).toBe(0x50);
    expect(head[2]).toBe(0x4e);
    expect(head[3]).toBe(0x47);

    expect(renderer.captured).toHaveLength(2);
    expect(renderer.captured[0]!.html).toContain("PixelButton");
  });

  it("dryRun does not invoke the renderer or touch disk", async () => {
    const renderer = new MemoryRenderer();
    const manifests: ManifestRecord[] = [
      fakeRecord({ name: "PixelAvatar", category: "data" }),
    ];

    const report = await generateOgImages({
      repoRoot: tmpRoot,
      outRoot,
      manifests,
      renderer,
      dryRun: true,
    });

    expect(report.ok).toBe(true);
    expect(report.count).toBe(1);
    expect(report.written).toBe(0);
    expect(report.skipped).toBe(1);
    expect(report.entries).toHaveLength(1);

    expect(renderer.captured).toHaveLength(0);
    const written = path.join(outRoot, "pixel-avatar.png");
    expect(await fs.pathExists(written)).toBe(false);
  });

  it("records errors without throwing when a manifest is malformed", async () => {
    const renderer = new MemoryRenderer();
    const goodRec = fakeRecord({ name: "PixelGood" });
    const badRec: ManifestRecord = {
      manifest: { description: "no name" } as unknown as ManifestRecord["manifest"],
      sourceFile: "/repo/src/Bad.tsx",
      manifestFile: "/repo/src/Bad.manifest.ts",
      package: "@pxlkit/ui-kit",
    };

    const report = await generateOgImages({
      repoRoot: tmpRoot,
      outRoot,
      manifests: [goodRec, badRec],
      renderer,
    });

    expect(report.ok).toBe(false);
    expect(report.written).toBe(1);
    expect(report.errors).toHaveLength(1);
    expect(report.errors[0]!.message).toMatch(/missing a string `name`/);
  });

  it("--only filter narrows the manifest set", async () => {
    const renderer = new MemoryRenderer();
    const manifests: ManifestRecord[] = [
      fakeRecord({ name: "PixelButton" }),
      fakeRecord({ name: "PixelInput", category: "forms" }),
      fakeRecord({ name: "Toast", category: "feedback" }),
    ];

    const report = await generateOgImages({
      repoRoot: tmpRoot,
      outRoot,
      manifests,
      renderer,
      only: "Pixel*",
    });

    expect(report.ok).toBe(true);
    expect(report.count).toBe(2);
    expect(report.entries.map((e) => e.name).sort()).toEqual([
      "PixelButton",
      "PixelInput",
    ]);
  });

  it("defaults outRoot to apps/web/public/og when not provided", async () => {
    const renderer = new MemoryRenderer();
    const manifests: ManifestRecord[] = [fakeRecord({ name: "PixelKbd" })];

    const report = await generateOgImages({
      repoRoot: tmpRoot,
      manifests,
      renderer,
      dryRun: true,
    });

    expect(report.entries).toHaveLength(1);
    const expectedSuffix = "apps/web/public/og/pixel-kbd.png";
    const out = report.entries[0]!.outFile.split(path.sep).join("/");
    expect(out.endsWith(expectedSuffix)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GenerateOgImagesGenerator — orchestrator step contract
//
// The step must NEVER funnel HTML template bytes through the orchestrator's
// text-write contract as fake `.png` files. It either renders real PNGs via
// the render backend (Playwright in production, MemoryRenderer here) or
// SKIPs honestly with a logged instruction and zero writes.
// ---------------------------------------------------------------------------

describe("GenerateOgImagesGenerator (orchestrator step)", () => {
  let tmpRoot: string;
  let outRoot: string;

  function stubLogger(sink?: { warns: string[] }): Logger {
    return {
      info: () => undefined,
      warn: (msg: string) => {
        sink?.warns.push(msg);
      },
      error: () => undefined,
      success: () => undefined,
      table: () => undefined,
    } as unknown as Logger;
  }

  function ctxFor(manifests: ManifestRecord[], logger: Logger = stubLogger()): GeneratorContext {
    return {
      repoRoot: tmpRoot,
      manifests,
      outputs: new Map<string, string>(),
      logger,
    };
  }

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "gen-og-step-"));
    outRoot = path.join(tmpRoot, "out");
  });

  afterEach(async () => {
    await fs.remove(tmpRoot);
  });

  it("renders PNGs via the injected backend and contributes ZERO orchestrator text writes", async () => {
    const renderer = new MemoryRenderer();
    const gen = new GenerateOgImagesGenerator(outRoot, { renderer });

    const result = await gen.run(
      ctxFor([
        fakeRecord({ name: "PixelButton", category: "actions", since: "1.0.0" }),
        fakeRecord({ name: "PixelChip", category: "data" }),
      ]),
    );

    // PNG bytes never travel through the utf-8 write contract.
    expect(result.writes).toEqual([]);

    const buttonFile = path.join(outRoot, "pixel-button.png");
    expect(await fs.pathExists(buttonFile)).toBe(true);
    const head = await fs.readFile(buttonFile);
    expect(head[0]).toBe(0x89); // PNG signature, NOT '<' from an HTML doc
    expect(head[1]).toBe(0x50);
    expect(renderer.captured).toHaveLength(2);
  });

  it("SKIPs with a logged instruction and zero writes when playwright is unavailable", async () => {
    const sink = { warns: [] as string[] };
    const gen = new GenerateOgImagesGenerator(outRoot, { probe: async () => false });

    const result = await gen.run(
      ctxFor([fakeRecord({ name: "PixelChip", category: "data" })], stubLogger(sink)),
    );

    expect(result.writes).toEqual([]);
    expect(await fs.pathExists(path.join(outRoot, "pixel-chip.png"))).toBe(false);
    const logged = sink.warns.join("\n");
    expect(logged).toMatch(/SKIP/);
    expect(logged).toMatch(/generate-og-images/);
  });

  it("an injected renderer bypasses the availability probe", async () => {
    const renderer = new MemoryRenderer();
    const gen = new GenerateOgImagesGenerator(outRoot, {
      renderer,
      probe: async () => false, // would skip if consulted
    });

    const result = await gen.run(ctxFor([fakeRecord({ name: "PixelKbd" })]));
    expect(result.writes).toEqual([]);
    expect(await fs.pathExists(path.join(outRoot, "pixel-kbd.png"))).toBe(true);
  });

  it("throws (failing the step honestly) when the render report contains errors", async () => {
    const renderer = new MemoryRenderer();
    const badRec: ManifestRecord = {
      manifest: { description: "no name" } as unknown as ManifestRecord["manifest"],
      sourceFile: "/repo/src/Bad.tsx",
      manifestFile: "/repo/src/Bad.manifest.ts",
      package: "@pxlkit/ui-kit",
    };
    const gen = new GenerateOgImagesGenerator(outRoot, { renderer });

    await expect(gen.run(ctxFor([badRec]))).rejects.toThrow(/missing a string `name`/);
  });
});
