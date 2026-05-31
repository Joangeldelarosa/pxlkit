/**
 * Tests for generate-metadata.ts
 *
 * Verifies:
 *  - title truncation (<=60) and description truncation (<=155)
 *  - slug derivation (PascalCase -> kebab-case)
 *  - canonical / openGraph image URLs
 *  - emitted module is valid Next metadata shape
 *  - safe write path: <outRoot>/<slug>/metadata.generated.ts
 *  - dryRun mode does NOT touch the filesystem
 *  - error path: malformed manifest reported, never thrown
 */

import path from "node:path";
import os from "node:os";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  MAX_DESCRIPTION_LEN,
  MAX_TITLE_LEN,
  ROUTE_PREFIX,
  SITE_ORIGIN,
  fallbackDescription,
  formatTitle,
  generateMetadata,
  planEntryFor,
  renderMetadataModule,
  slugFor,
  truncate,
} from "../generate-metadata";
import type { ManifestRecord } from "../_lib/generator-base";

function fakeRecord(
  partial: Partial<{ name: string; description: string }>,
  manifestFile = "/repo/packages/ui-kit/src/PixelButton.manifest.ts",
): ManifestRecord {
  return {
    manifest: {
      name: partial.name ?? "PixelButton",
      description: partial.description ?? "Primary action button.",
    },
    sourceFile: manifestFile.replace(/\.manifest\.ts$/, ".tsx"),
    manifestFile,
    package: "@pxlkit/ui-kit",
  };
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe("truncate", () => {
  it("returns the input unchanged when within the limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("collapses whitespace before measuring", () => {
    expect(truncate("a   b\n c", 10)).toBe("a b c");
  });

  it("cuts on a word boundary when one is near the end", () => {
    const out = truncate("alpha bravo charlie delta", 14);
    expect(out.length).toBeLessThanOrEqual(14);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toContain("delt"); // partial word avoided
  });

  it("hard-cuts when there is no useful word boundary", () => {
    const out = truncate("supercalifragilistic", 10);
    expect(out.length).toBeLessThanOrEqual(10);
    expect(out.endsWith("…")).toBe(true);
  });

  it("guards against non-string input", () => {
    expect(truncate(undefined as unknown as string, 10)).toBe("");
  });
});

describe("slugFor", () => {
  it("converts PascalCase to kebab-case", () => {
    expect(slugFor("PixelButton")).toBe("pixel-button");
    expect(slugFor("PxlKitButton")).toBe("pxl-kit-button");
    expect(slugFor("PixelEmptyState")).toBe("pixel-empty-state");
  });
});

describe("formatTitle", () => {
  it("includes the brand and respects MAX_TITLE_LEN", () => {
    const t = formatTitle("PixelButton");
    expect(t).toContain("PixelButton");
    expect(t).toContain("pxlkit");
    expect(t.length).toBeLessThanOrEqual(MAX_TITLE_LEN);
  });

  it("truncates an absurdly long component name", () => {
    const t = formatTitle("PixelButtonWithReallyLongAndAbsurdGratuitouslyExcessiveName");
    expect(t.length).toBeLessThanOrEqual(MAX_TITLE_LEN);
  });
});

describe("fallbackDescription", () => {
  it("references the component name", () => {
    expect(fallbackDescription("PixelButton")).toContain("PixelButton");
  });
});

// ---------------------------------------------------------------------------
// planEntryFor
// ---------------------------------------------------------------------------

describe("planEntryFor", () => {
  const outRoot = "/repo/apps/web/src/app/ui-kit";

  it("produces a fully-resolved plan entry", () => {
    const entry = planEntryFor(
      fakeRecord({ name: "PixelButton", description: "Primary action." }),
      outRoot,
    );
    expect(entry.name).toBe("PixelButton");
    expect(entry.slug).toBe("pixel-button");
    expect(entry.route).toBe(`${ROUTE_PREFIX}/pixel-button`);
    expect(entry.canonical).toBe(`${SITE_ORIGIN}${ROUTE_PREFIX}/pixel-button`);
    expect(entry.ogImage).toBe("/og/pixel-button.png");
    expect(entry.title.length).toBeLessThanOrEqual(MAX_TITLE_LEN);
    expect(entry.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LEN);
    expect(entry.outFile).toBe(
      `${outRoot}/pixel-button/metadata.generated.ts`,
    );
  });

  it("uses a fallback description when none is provided", () => {
    const entry = planEntryFor(fakeRecord({ name: "PixelChip", description: "" }), outRoot);
    expect(entry.description).toContain("PixelChip");
    expect(entry.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LEN);
  });

  it("truncates a description exceeding the SEO limit", () => {
    const long = "x".repeat(400);
    const entry = planEntryFor(
      fakeRecord({ name: "PixelInput", description: long }),
      outRoot,
    );
    expect(entry.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LEN);
    expect(entry.description.endsWith("…")).toBe(true);
  });

  it("throws when the manifest is missing a name", () => {
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
// renderMetadataModule
// ---------------------------------------------------------------------------

describe("renderMetadataModule", () => {
  it("emits a banner + Metadata import + default export", () => {
    const entry = planEntryFor(fakeRecord({ name: "PixelBadge" }), "/o");
    const src = renderMetadataModule(entry);
    expect(src).toContain("AUTO-GENERATED");
    expect(src).toContain("import type { Metadata } from 'next';");
    expect(src).toContain("export const metadata: Metadata = {");
    expect(src).toContain("export default metadata;");
  });

  it("includes OG image, twitter card, and canonical URL", () => {
    const entry = planEntryFor(fakeRecord({ name: "PixelCard" }), "/o");
    const src = renderMetadataModule(entry);
    expect(src).toContain("/og/pixel-card.png");
    expect(src).toContain("summary_large_image");
    expect(src).toContain(`canonical: '${SITE_ORIGIN}/ui-kit/pixel-card'`);
  });

  it("escapes single quotes in titles/descriptions safely", () => {
    const entry = planEntryFor(
      fakeRecord({ name: "PixelInput", description: "It's smart." }),
      "/o",
    );
    const src = renderMetadataModule(entry);
    expect(src).toContain("It\\'s smart.");
    // Sanity-check there's no bare apostrophe inside a string literal.
    expect(src).not.toMatch(/'It's/);
  });
});

// ---------------------------------------------------------------------------
// generateMetadata end-to-end with a real tmp directory
// ---------------------------------------------------------------------------

describe("generateMetadata (e2e against tmpdir)", () => {
  let tmpRoot: string;
  let outRoot: string;

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "gen-meta-"));
    outRoot = path.join(tmpRoot, "out");
  });

  afterEach(async () => {
    await fs.remove(tmpRoot);
  });

  it("writes one metadata.generated.ts per manifest", async () => {
    const manifests: ManifestRecord[] = [
      fakeRecord({ name: "PixelButton", description: "Action button." }),
      fakeRecord({ name: "PixelChip", description: "Compact tag." }),
    ];

    const report = await generateMetadata({
      repoRoot: tmpRoot,
      outRoot,
      manifests,
    });

    expect(report.ok).toBe(true);
    expect(report.count).toBe(2);
    expect(report.written).toBe(2);
    expect(report.errors).toEqual([]);

    const buttonFile = path.join(outRoot, "pixel-button", "metadata.generated.ts");
    const chipFile = path.join(outRoot, "pixel-chip", "metadata.generated.ts");
    expect(await fs.pathExists(buttonFile)).toBe(true);
    expect(await fs.pathExists(chipFile)).toBe(true);

    const content = await fs.readFile(buttonFile, "utf8");
    expect(content).toContain("PixelButton");
    expect(content).toContain("/og/pixel-button.png");
  });

  it("dryRun does not write to disk", async () => {
    const manifests: ManifestRecord[] = [fakeRecord({ name: "PixelAvatar" })];
    const report = await generateMetadata({
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

    const written = path.join(outRoot, "pixel-avatar", "metadata.generated.ts");
    expect(await fs.pathExists(written)).toBe(false);
  });

  it("records errors without throwing when a manifest is malformed", async () => {
    const goodRec = fakeRecord({ name: "PixelGood" });
    const badRec: ManifestRecord = {
      manifest: { description: "no name" } as unknown as ManifestRecord["manifest"],
      sourceFile: "/repo/src/Bad.tsx",
      manifestFile: "/repo/src/Bad.manifest.ts",
      package: "@pxlkit/ui-kit",
    };

    const report = await generateMetadata({
      repoRoot: tmpRoot,
      outRoot,
      manifests: [goodRec, badRec],
    });

    expect(report.ok).toBe(false);
    expect(report.written).toBe(1);
    expect(report.errors).toHaveLength(1);
    expect(report.errors[0]!.message).toMatch(/missing a string `name`/);
  });

  it("uses default outRoot under apps/web/src/app/ui-kit when not specified", async () => {
    // Reuse default outRoot; just confirm the resolved entry path is in the expected place.
    const manifests: ManifestRecord[] = [fakeRecord({ name: "PixelKbd" })];
    const report = await generateMetadata({
      repoRoot: tmpRoot,
      manifests,
      dryRun: true,
    });

    expect(report.entries).toHaveLength(1);
    const expectedSuffix = "apps/web/src/app/ui-kit/pixel-kbd/metadata.generated.ts";
    // Compare using forward slashes regardless of host.
    const out = report.entries[0]!.outFile.split(path.sep).join("/");
    expect(out.endsWith(expectedSuffix)).toBe(true);
  });
});
