/**
 * Tests for extract-bundle-size.ts
 *
 * Strategy: build a tiny synthetic "package" inside a tmpdir that exposes a
 * couple of named exports, then run the measurement against ManifestRecord[]
 * pointing at those names. This avoids touching real ui-kit sources and keeps
 * the test hermetic.
 *
 * What we verify:
 *  - buildVirtualEntry emits a syntactically valid re-export
 *  - measureComponent returns positive byte counts and respects tree-shaking
 *    (asking for only ComponentA must NOT pull in ComponentB)
 *  - extractBundleSize end-to-end writes a JSON file at the configured path
 *  - dryRun mode skips disk writes
 *  - malformed manifests are reported as errors, never thrown
 *  - output sizes JSON is sorted alphabetically (deterministic)
 */

import path from "node:path";
import os from "node:os";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_OUT_RELATIVE,
  DEFAULT_PACKAGE,
  buildVirtualEntry,
  extractBundleSize,
  measureComponent,
} from "../extract-bundle-size";
import type { ManifestRecord } from "../_lib/generator-base";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const FAKE_PKG = "@pxlkit-test/fake-kit";

interface Fixture {
  tmpRoot: string;
  /** Where node will resolve `@pxlkit-test/fake-kit` from. */
  resolveDir: string;
  /** A long, repetitive string we plant inside ComponentB so that if it ever
   *  leaks into ComponentA's bundle the size jump is unmistakable. */
  bMarker: string;
}

async function setupFakeKit(): Promise<Fixture> {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "extract-bundle-size-"));
  const pkgDir = path.join(tmpRoot, "node_modules", FAKE_PKG);
  await fs.ensureDir(pkgDir);

  // Big sentinel string so leakage is obvious.
  const bMarker = `__B_LEAK_${"x".repeat(2048)}__`;

  await fs.writeJson(path.join(pkgDir, "package.json"), {
    name: FAKE_PKG,
    version: "0.0.0",
    type: "module",
    main: "index.js",
    module: "index.js",
  });

  // ComponentA: small. ComponentB: contains the giant sentinel string.
  // Both are plain JS so we don't need a TS toolchain in node_modules.
  const indexSource = [
    `export function ComponentA(props) { return props; }`,
    `const __B_PAYLOAD__ = ${JSON.stringify(bMarker)};`,
    `export function ComponentB(props) { return [__B_PAYLOAD__, props]; }`,
    ``,
  ].join("\n");
  await fs.writeFile(path.join(pkgDir, "index.js"), indexSource, "utf8");

  return { tmpRoot, resolveDir: tmpRoot, bMarker };
}

function fakeRecord(
  name: string,
  description = `${name} description.`,
): ManifestRecord {
  return {
    sourceFile: `/repo/packages/ui-kit/src/${name}.tsx`,
    manifestFile: `/repo/packages/ui-kit/src/${name}.manifest.ts`,
    package: "@pxlkit/ui-kit",
    manifest: {
      name,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// buildVirtualEntry
// ---------------------------------------------------------------------------

describe("buildVirtualEntry", () => {
  it("emits a named re-export from the target package", () => {
    const src = buildVirtualEntry("PixelButton", "@pxlkit/ui-kit");
    expect(src).toContain("export { PixelButton } from '@pxlkit/ui-kit';");
  });

  it("escapes single quotes in the package specifier", () => {
    const src = buildVirtualEntry("X", "weird'pkg");
    expect(src).toContain("export { X } from 'weird\\'pkg';");
  });

  it("includes a banner comment with the component + package", () => {
    const src = buildVirtualEntry("PixelChip", "@pxlkit/ui-kit");
    expect(src).toContain("component: PixelChip");
    expect(src).toContain("package:   @pxlkit/ui-kit");
  });
});

// ---------------------------------------------------------------------------
// measureComponent — hits real esbuild against the fake kit
// ---------------------------------------------------------------------------

describe("measureComponent", () => {
  let fx: Fixture;

  beforeEach(async () => {
    fx = await setupFakeKit();
  });

  afterEach(async () => {
    await fs.remove(fx.tmpRoot);
  });

  it("returns positive byte counts for a real bundle", async () => {
    const m = await measureComponent("ComponentA", {
      packageName: FAKE_PKG,
      externals: [],
      resolveDir: fx.resolveDir,
    });
    expect(m.name).toBe("ComponentA");
    expect(m.bytesMinified).toBeGreaterThan(0);
    expect(m.bytesGzipped).toBeGreaterThan(0);
    // gzip should at least not grow the artifact for non-trivial input.
    expect(m.bytesGzipped).toBeLessThanOrEqual(m.bytesMinified + 32);
  });

  it("tree-shakes neighbours — ComponentA bundle must not contain ComponentB's payload", async () => {
    const a = await measureComponent("ComponentA", {
      packageName: FAKE_PKG,
      externals: [],
      resolveDir: fx.resolveDir,
    });
    const b = await measureComponent("ComponentB", {
      packageName: FAKE_PKG,
      externals: [],
      resolveDir: fx.resolveDir,
    });
    // With a ~2KB sentinel in B, B should be meaningfully larger than A.
    // (We use raw minified bytes to compare — gzip would also work but minified
    // is the clearer signal.)
    expect(b.bytesMinified).toBeGreaterThan(a.bytesMinified + 1500);
  });

  it("rejects with a useful error when the package cannot be resolved", async () => {
    await expect(
      measureComponent("Whatever", {
        packageName: "@does-not-exist/nope",
        externals: [],
        resolveDir: fx.resolveDir,
      }),
    ).rejects.toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// extractBundleSize — end-to-end against a tmpdir
// ---------------------------------------------------------------------------

describe("extractBundleSize (e2e against tmpdir)", () => {
  let fx: Fixture;
  let outFile: string;

  beforeEach(async () => {
    fx = await setupFakeKit();
    outFile = path.join(fx.tmpRoot, "out", "bundle-sizes.json");
  });

  afterEach(async () => {
    await fs.remove(fx.tmpRoot);
  });

  it("writes one entry per manifest, keyed by component name", async () => {
    const manifests: ManifestRecord[] = [
      fakeRecord("ComponentA"),
      fakeRecord("ComponentB"),
    ];

    const report = await extractBundleSize({
      repoRoot: fx.tmpRoot,
      packageName: FAKE_PKG,
      resolveDir: fx.resolveDir,
      outFile,
      manifests,
    });

    expect(report.ok).toBe(true);
    expect(report.count).toBe(2);
    expect(report.measured).toBe(2);
    expect(report.skipped).toBe(0);
    expect(report.errors).toEqual([]);

    expect(await fs.pathExists(outFile)).toBe(true);
    const json = (await fs.readJson(outFile)) as Record<string, number>;
    expect(Object.keys(json).sort()).toEqual(["ComponentA", "ComponentB"]);
    expect(json.ComponentA).toBeGreaterThan(0);
    expect(json.ComponentB).toBeGreaterThan(json.ComponentA!);
  });

  it("emits sizes sorted alphabetically for deterministic diffs", async () => {
    // Pass them in reverse order; output must come back sorted.
    const manifests: ManifestRecord[] = [
      fakeRecord("ComponentB"),
      fakeRecord("ComponentA"),
    ];

    const report = await extractBundleSize({
      repoRoot: fx.tmpRoot,
      packageName: FAKE_PKG,
      resolveDir: fx.resolveDir,
      outFile,
      manifests,
    });

    const keys = Object.keys(report.sizes);
    expect(keys).toEqual([...keys].sort());
    // And the on-disk file too.
    const raw = await fs.readFile(outFile, "utf8");
    const idxA = raw.indexOf('"ComponentA"');
    const idxB = raw.indexOf('"ComponentB"');
    expect(idxA).toBeGreaterThanOrEqual(0);
    expect(idxB).toBeGreaterThan(idxA);
  });

  it("dryRun does not write to disk", async () => {
    const manifests: ManifestRecord[] = [fakeRecord("ComponentA")];

    const report = await extractBundleSize({
      repoRoot: fx.tmpRoot,
      packageName: FAKE_PKG,
      resolveDir: fx.resolveDir,
      outFile,
      manifests,
      dryRun: true,
    });

    expect(report.ok).toBe(true);
    expect(report.measured).toBe(1);
    expect(report.sizes.ComponentA).toBeGreaterThan(0);
    expect(await fs.pathExists(outFile)).toBe(false);
  });

  it("records errors without throwing when a manifest is malformed", async () => {
    const good = fakeRecord("ComponentA");
    const bad: ManifestRecord = {
      sourceFile: "/repo/src/Bad.tsx",
      manifestFile: "/repo/src/Bad.manifest.ts",
      package: "@pxlkit/ui-kit",
      manifest: { description: "no name" } as unknown as ManifestRecord["manifest"],
    };

    const report = await extractBundleSize({
      repoRoot: fx.tmpRoot,
      packageName: FAKE_PKG,
      resolveDir: fx.resolveDir,
      outFile,
      manifests: [good, bad],
    });

    expect(report.ok).toBe(false);
    expect(report.measured).toBe(1);
    expect(report.errors).toHaveLength(1);
    expect(report.errors[0]!.message).toMatch(/missing a string `name`/);
    // Good measurement still made it through.
    expect(report.sizes.ComponentA).toBeGreaterThan(0);
  });

  it("records errors for components that fail to bundle without throwing", async () => {
    const manifests: ManifestRecord[] = [
      fakeRecord("ComponentA"),
      // Name that does NOT exist on the package: esbuild will still bundle
      // (importing an undefined named export from an ESM module is allowed
      // statically) but to provoke an error we point at a non-existent package
      // via packageName override for just this assertion path below.
    ];

    const report = await extractBundleSize({
      repoRoot: fx.tmpRoot,
      packageName: "@nope/does-not-exist",
      resolveDir: fx.resolveDir,
      outFile,
      manifests,
    });

    expect(report.ok).toBe(false);
    expect(report.measured).toBe(0);
    expect(report.skipped).toBe(1);
    expect(report.errors).toHaveLength(1);
    expect(report.errors[0]!.name).toBe("ComponentA");
  });

  it("uses the default out path under <repoRoot> when --out is omitted", async () => {
    const manifests: ManifestRecord[] = [fakeRecord("ComponentA")];

    const report = await extractBundleSize({
      repoRoot: fx.tmpRoot,
      packageName: FAKE_PKG,
      resolveDir: fx.resolveDir,
      manifests,
      dryRun: true,
    });

    // outFile resolution must put the JSON inside the repo root using the
    // documented constant.
    const expectedSuffix = DEFAULT_OUT_RELATIVE;
    const out = report.outFile.split(path.sep).join("/");
    expect(out.endsWith(expectedSuffix)).toBe(true);
  });

  it("exports the documented default package name", () => {
    expect(DEFAULT_PACKAGE).toBe("@pxlkit/ui-kit");
  });
});
