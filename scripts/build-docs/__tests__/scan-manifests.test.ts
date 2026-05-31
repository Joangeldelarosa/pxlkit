/**
 * Tests for scan-manifests.ts.
 *
 * Strategy: build a fully-formed temp monorepo skeleton inside the OS tmpdir
 * (packages/<pkg>/src/<Component>/{<Component>.tsx,<Component>.manifest.ts})
 * for every scenario — valid manifests, schema-invalid manifests, missing
 * source siblings, bad import — then assert against scanManifestsFull().
 */

import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { scanManifests, scanManifestsFull } from "../scan-manifests";

const FIXTURE_ROOT = path.join(
  os.tmpdir(),
  `pxlkit-scan-manifests-${process.pid}-${Date.now()}`,
);

interface FixtureSpec {
  pkg: string;
  pkgName: string;
  component: string;
  manifestSource: string;
  /** when false, the .tsx sibling is omitted (simulates orphaned manifest). */
  withSource?: boolean;
  withExamples?: boolean;
}

async function writeFixture(spec: FixtureSpec): Promise<{
  manifestFile: string;
  sourceFile: string;
  examplesFile?: string;
}> {
  const dir = path.join(FIXTURE_ROOT, "packages", spec.pkg, "src", spec.component);
  await fs.ensureDir(dir);

  await fs.writeJson(path.join(FIXTURE_ROOT, "packages", spec.pkg, "package.json"), {
    name: spec.pkgName,
    version: "0.0.0",
  });

  const manifestFile = path.join(dir, `${spec.component}.manifest.ts`);
  await fs.writeFile(manifestFile, spec.manifestSource, "utf8");

  const sourceFile = path.join(dir, `${spec.component}.tsx`);
  if (spec.withSource !== false) {
    await fs.writeFile(
      sourceFile,
      `export const ${spec.component} = () => null;\n`,
      "utf8",
    );
  }

  let examplesFile: string | undefined;
  if (spec.withExamples) {
    examplesFile = path.join(dir, `${spec.component}.examples.tsx`);
    await fs.writeFile(
      examplesFile,
      `export const examples = [];\n`,
      "utf8",
    );
  }

  return { manifestFile, sourceFile, examplesFile };
}

const VALID_BUTTON_MANIFEST = `
import { defineManifest } from ${JSON.stringify(
  path.resolve(__dirname, "../manifest-schema.ts").split(path.sep).join("/"),
)};

const Stub = () => null;

export default defineManifest({
  name: "PixelButton",
  category: "actions",
  since: "1.0.0",
  status: "stable",
  description: "Primary action button.",
  highlights: ["Switchable surface", "Tone-aware focus ring"],
  examples: [{ id: "default", label: "Default", Component: Stub }],
  props: "auto",
  a11y: { wcag: "2.1 AA", patterns: ["button"] },
  related: [],
  apiStability: "stable",
  ssrSafe: true,
  treeShakable: true,
});
`;

const VALID_CARD_MANIFEST = `
import { defineManifest } from ${JSON.stringify(
  path.resolve(__dirname, "../manifest-schema.ts").split(path.sep).join("/"),
)};

const Stub = () => null;

export const manifest = defineManifest({
  name: "PixelCard",
  category: "cards",
  since: "1.1.0",
  status: "beta",
  description: "Surface card.",
  highlights: ["Surface", "Variants"],
  examples: [{ id: "default", label: "Default", Component: Stub }],
  props: "auto",
  a11y: { wcag: "2.1 AA", patterns: ["region"] },
  related: [],
  apiStability: "evolving",
  ssrSafe: true,
  treeShakable: true,
});
`;

const INVALID_MANIFEST = `
const Stub = () => null;
// Intentionally invalid: name is not PascalCase + missing required fields.
export default {
  name: "not-pascal",
  category: "actions",
  since: "1.0.0",
  status: "stable",
};
`;

const BAD_IMPORT_MANIFEST = `
// This file throws at import-time.
throw new Error("boom");
export default {};
`;

const ORPHAN_MANIFEST = `
export default { name: "Orphan" };
`;

beforeAll(async () => {
  await fs.ensureDir(FIXTURE_ROOT);

  await writeFixture({
    pkg: "ui-kit",
    pkgName: "@pxlkit/ui-kit",
    component: "PixelButton",
    manifestSource: VALID_BUTTON_MANIFEST,
    withExamples: true,
  });

  await writeFixture({
    pkg: "ui-kit",
    pkgName: "@pxlkit/ui-kit",
    component: "PixelCard",
    manifestSource: VALID_CARD_MANIFEST,
  });

  await writeFixture({
    pkg: "feedback",
    pkgName: "@pxlkit/feedback",
    component: "PixelBadInvalid",
    manifestSource: INVALID_MANIFEST,
  });

  await writeFixture({
    pkg: "feedback",
    pkgName: "@pxlkit/feedback",
    component: "PixelBadImport",
    manifestSource: BAD_IMPORT_MANIFEST,
  });

  await writeFixture({
    pkg: "feedback",
    pkgName: "@pxlkit/feedback",
    component: "PixelOrphan",
    manifestSource: ORPHAN_MANIFEST,
    withSource: false,
  });
});

afterAll(async () => {
  await fs.remove(FIXTURE_ROOT);
});

describe("scanManifestsFull", () => {
  it("discovers every *.manifest.ts under packages/*/src/**", async () => {
    const result = await scanManifestsFull(FIXTURE_ROOT, { continueOnError: true });
    expect(result.scanned).toBe(5);
  });

  it("returns valid records and tags issues separately", async () => {
    const result = await scanManifestsFull(FIXTURE_ROOT, { continueOnError: true });
    expect(result.records).toHaveLength(2);
    expect(result.issues).toHaveLength(3);
  });

  it("sorts records by package then by manifest name", async () => {
    const result = await scanManifestsFull(FIXTURE_ROOT, { continueOnError: true });
    const order = result.records.map((r) => `${r.package}/${r.manifest.name}`);
    expect(order).toEqual(["@pxlkit/ui-kit/PixelButton", "@pxlkit/ui-kit/PixelCard"]);
  });

  it("resolves sibling examples files when present", async () => {
    const result = await scanManifestsFull(FIXTURE_ROOT, { continueOnError: true });
    const button = result.records.find((r) => r.manifest.name === "PixelButton");
    expect(button?.examplesFile).toBeTruthy();
    expect(button?.examplesFile).toMatch(/PixelButton\.examples\.tsx$/);

    const card = result.records.find((r) => r.manifest.name === "PixelCard");
    expect(card?.examplesFile).toBeUndefined();
  });

  it("reports schema-invalid manifests with the failing paths", async () => {
    const result = await scanManifestsFull(FIXTURE_ROOT, { continueOnError: true });
    const issue = result.issues.find((i) => i.manifestFile.includes("PixelBadInvalid"));
    expect(issue).toBeDefined();
    expect(issue?.reason).toBe("schema-invalid");
    expect(issue?.paths).toContain("name");
  });

  it("reports import-time failures as `import-failed`", async () => {
    const result = await scanManifestsFull(FIXTURE_ROOT, { continueOnError: true });
    const issue = result.issues.find((i) => i.manifestFile.includes("PixelBadImport"));
    expect(issue).toBeDefined();
    expect(issue?.reason).toBe("import-failed");
    expect(issue?.message).toContain("boom");
  });

  it("reports orphan manifests (no sibling .tsx) as `missing-source`", async () => {
    const result = await scanManifestsFull(FIXTURE_ROOT, { continueOnError: true });
    const issue = result.issues.find((i) => i.manifestFile.includes("PixelOrphan"));
    expect(issue).toBeDefined();
    expect(issue?.reason).toBe("missing-source");
  });

  it("resolves package name from the closest package.json", async () => {
    const result = await scanManifestsFull(FIXTURE_ROOT, { continueOnError: true });
    for (const r of result.records) {
      expect(r.package).toBe("@pxlkit/ui-kit");
    }
  });

  it("returns POSIX-style paths even on Windows", async () => {
    const result = await scanManifestsFull(FIXTURE_ROOT, { continueOnError: true });
    for (const r of result.records) {
      expect(r.sourceFile).not.toMatch(/\\\\/);
      expect(r.sourceFile).not.toMatch(/\\/);
      expect(r.manifestFile).not.toMatch(/\\/);
    }
  });
});

describe("scanManifests (default export)", () => {
  it("throws when continueOnError is omitted and a manifest is invalid", async () => {
    await expect(scanManifests(FIXTURE_ROOT)).rejects.toThrow();
  });

  it("returns only valid records when continueOnError=true", async () => {
    const records = await scanManifests(FIXTURE_ROOT, { continueOnError: true });
    expect(records).toHaveLength(2);
    expect(records.map((r) => r.manifest.name)).toEqual(["PixelButton", "PixelCard"]);
  });

  it("returns an empty array (and warns) when the root has no manifests", async () => {
    const emptyRoot = path.join(FIXTURE_ROOT, "empty-island");
    await fs.ensureDir(emptyRoot);
    const records = await scanManifests(emptyRoot, { continueOnError: true });
    expect(records).toEqual([]);
  });
});
