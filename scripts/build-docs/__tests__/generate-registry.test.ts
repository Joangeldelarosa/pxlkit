/**
 * Unit tests for generate-registry.
 *
 * Strategy: exercise the programmatic API with synthetic ManifestRecord[]
 * (so we don't touch real component files) plus a temp-dir round-trip to
 * verify the safety guards and the written file content.
 */

import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  __internal,
  GenerateRegistryGenerator,
  generateRegistry,
  type ComponentMeta,
} from "../generate-registry";
import type { ManifestRecord } from "../_lib/generator-base";
import { createLogger } from "../_lib/logger";

function makeRecord(partial: {
  name: string;
  category?: string;
  since?: string;
  status?: string;
  description?: string;
  related?: string[];
  deprecatedNote?: string;
  bundleSize?: number | "auto";
}): ManifestRecord {
  return {
    sourceFile: `/fake/${partial.name}.tsx`,
    manifestFile: `/fake/${partial.name}.manifest.ts`,
    package: "@pxlkit/ui-kit",
    manifest: {
      name: partial.name,
      category: partial.category ?? "actions",
      since: partial.since ?? "1.0.0",
      status: (partial.status ?? "stable") as never,
      description: partial.description ?? `${partial.name} description.`,
      related: partial.related ?? [],
      deprecatedNote: partial.deprecatedNote,
      bundleSize: partial.bundleSize,
    },
  };
}

const silentLogger = createLogger("test");

describe("toComponentMeta", () => {
  it("flattens a manifest into a ComponentMeta", () => {
    const record = makeRecord({
      name: "PixelButton",
      category: "actions",
      since: "1.2.3",
      status: "stable",
      description: "Primary button.",
      related: ["LinkButton"],
      bundleSize: 1024,
    });
    const meta = __internal.toComponentMeta(record);
    expect(meta).toEqual({
      name: "PixelButton",
      category: "actions",
      since: "1.2.3",
      status: "stable",
      description: "Primary button.",
      related: ["LinkButton"],
      bundleSize: 1024,
    });
  });

  it("omits optional fields when absent", () => {
    const record = makeRecord({ name: "PixelCard" });
    const meta = __internal.toComponentMeta(record);
    expect(meta.deprecatedNote).toBeUndefined();
    expect(meta.bundleSize).toBeUndefined();
  });

  it("falls back to defaults for unknown shapes", () => {
    const record: ManifestRecord = {
      sourceFile: "/fake/Weird.tsx",
      manifestFile: "/fake/Weird.manifest.ts",
      package: "@pxlkit/ui-kit",
      manifest: { name: "Weird" } as never,
    };
    const meta = __internal.toComponentMeta(record);
    expect(meta.category).toBe("uncategorized");
    expect(meta.since).toBe("0.0.0");
    expect(meta.status).toBe("experimental");
    expect(meta.description).toBe("");
    expect(meta.related).toEqual([]);
  });

  it("reads deprecatedNote from the legacy `deprecated.note` shape", () => {
    const record: ManifestRecord = {
      sourceFile: "/fake/Old.tsx",
      manifestFile: "/fake/Old.manifest.ts",
      package: "@pxlkit/ui-kit",
      manifest: {
        name: "Old",
        category: "actions",
        since: "1.0.0",
        status: "deprecated",
        description: "Old component.",
        related: [],
        deprecated: { note: "Use NewThing." },
      } as never,
    };
    const meta = __internal.toComponentMeta(record);
    expect(meta.deprecatedNote).toBe("Use NewThing.");
  });

  it("ignores non-string related entries", () => {
    const record: ManifestRecord = {
      sourceFile: "/fake/X.tsx",
      manifestFile: "/fake/X.manifest.ts",
      package: "@pxlkit/ui-kit",
      manifest: {
        name: "X",
        category: "actions",
        since: "1.0.0",
        status: "stable",
        description: "X.",
        related: ["A", 42, null, "B"] as unknown as string[],
      },
    };
    const meta = __internal.toComponentMeta(record);
    expect(meta.related).toEqual(["A", "B"]);
  });
});

describe("sortComponents", () => {
  it("sorts alphabetically by name", () => {
    const metas: ComponentMeta[] = [
      { name: "PixelZeta", category: "x", since: "1.0.0", status: "stable", description: "", related: [] },
      { name: "PixelAlpha", category: "x", since: "1.0.0", status: "stable", description: "", related: [] },
      { name: "PixelMike", category: "x", since: "1.0.0", status: "stable", description: "", related: [] },
    ];
    const sorted = __internal.sortComponents(metas);
    expect(sorted.map((m) => m.name)).toEqual(["PixelAlpha", "PixelMike", "PixelZeta"]);
  });
});

describe("dedupeByName", () => {
  it("keeps the last manifest when names collide", () => {
    const metas: ComponentMeta[] = [
      { name: "PixelDup", category: "a", since: "1.0.0", status: "stable", description: "first", related: [] },
      { name: "PixelDup", category: "b", since: "1.0.0", status: "stable", description: "second", related: [] },
    ];
    const out = __internal.dedupeByName(metas, silentLogger);
    expect(out).toHaveLength(1);
    expect(out[0]!.description).toBe("second");
  });
});

describe("serializeRegistry", () => {
  it("emits both UI_KIT_COMPONENTS and UI_KIT_REGISTRY", () => {
    const metas: ComponentMeta[] = [
      __internal.toComponentMeta(makeRecord({ name: "PixelButton" })),
      __internal.toComponentMeta(makeRecord({ name: "PixelCard", category: "cards" })),
    ];
    const code = __internal.serializeRegistry(metas);
    expect(code).toContain("export const UI_KIT_COMPONENTS = [");
    expect(code).toContain("\"PixelButton\",");
    expect(code).toContain("\"PixelCard\",");
    expect(code).toContain("export const UI_KIT_REGISTRY: Record<string, ComponentMeta> = {");
    expect(code).toContain("export interface ComponentMeta");
    expect(code).toContain("\"PixelButton\": {");
    expect(code).toContain("category: \"cards\"");
  });

  it("sorts UI_KIT_COMPONENTS alphabetically", () => {
    const metas: ComponentMeta[] = [
      __internal.toComponentMeta(makeRecord({ name: "PixelZulu" })),
      __internal.toComponentMeta(makeRecord({ name: "PixelAlpha" })),
      __internal.toComponentMeta(makeRecord({ name: "PixelMike" })),
    ];
    const code = __internal.serializeRegistry(metas);
    const alphaIdx = code.indexOf("\"PixelAlpha\"");
    const mikeIdx = code.indexOf("\"PixelMike\"");
    const zuluIdx = code.indexOf("\"PixelZulu\"");
    expect(alphaIdx).toBeGreaterThan(0);
    expect(mikeIdx).toBeGreaterThan(alphaIdx);
    expect(zuluIdx).toBeGreaterThan(mikeIdx);
  });

  it("includes deprecatedNote and bundleSize only when present", () => {
    const meta1 = __internal.toComponentMeta(
      makeRecord({ name: "PixelOld", deprecatedNote: "Use new." }),
    );
    const meta2 = __internal.toComponentMeta(
      makeRecord({ name: "PixelNew", bundleSize: 2048 }),
    );
    const code = __internal.serializeRegistry([meta1, meta2]);
    expect(code).toContain("deprecatedNote: \"Use new.\"");
    expect(code).toContain("bundleSize: 2048");
    // PixelNew has no deprecatedNote → must NOT appear inside its block.
    const newBlock = code.slice(code.indexOf("\"PixelNew\": {"));
    const newBlockEnd = newBlock.indexOf("},");
    const newBlockOnly = newBlock.slice(0, newBlockEnd);
    expect(newBlockOnly).not.toContain("deprecatedNote");
  });

  it("emits an empty registry shape when given no manifests", () => {
    const code = __internal.serializeRegistry([]);
    expect(code).toContain("export const UI_KIT_COMPONENTS = [");
    expect(code).toContain("] as const;");
    expect(code).toContain("export const UI_KIT_REGISTRY: Record<string, ComponentMeta> = {");
  });
});

describe("assertSafeOutputPath", () => {
  const repoRoot = path.resolve("/tmp/fake-repo");

  it("accepts a path under packages/ui-kit/src ending in .generated.ts", () => {
    expect(() =>
      __internal.assertSafeOutputPath(
        repoRoot,
        path.join(repoRoot, "packages/ui-kit/src/registry.generated.ts"),
      ),
    ).not.toThrow();
  });

  it("rejects writes outside packages/ui-kit/src", () => {
    expect(() =>
      __internal.assertSafeOutputPath(
        repoRoot,
        path.join(repoRoot, "packages/other/src/registry.generated.ts"),
      ),
    ).toThrow(/refusing to write outside/);
  });

  it("rejects writes that don't end with .generated.ts", () => {
    expect(() =>
      __internal.assertSafeOutputPath(
        repoRoot,
        path.join(repoRoot, "packages/ui-kit/src/registry.ts"),
      ),
    ).toThrow(/\.generated\.ts/);
  });
});

describe("defaultOutputPath", () => {
  it("returns a POSIX path under packages/ui-kit/src", () => {
    const out = __internal.defaultOutputPath("/repo");
    expect(out).toBe("/repo/packages/ui-kit/src/registry.generated.ts");
  });
});

describe("generateRegistry (programmatic, temp-dir round trip)", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "gen-registry-"));
    await fs.ensureDir(path.join(tmpDir, "packages/ui-kit/src"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("writes a parseable .generated.ts file from synthetic manifests", async () => {
    const manifests: ManifestRecord[] = [
      makeRecord({ name: "PixelButton", category: "actions", since: "1.0.0" }),
      makeRecord({ name: "PixelCard", category: "cards", since: "1.1.0", bundleSize: 1024 }),
      makeRecord({
        name: "PixelOld",
        category: "actions",
        status: "deprecated",
        deprecatedNote: "Use PixelButton.",
      }),
    ];
    const result = await generateRegistry({
      repoRoot: tmpDir,
      manifests,
      logger: silentLogger,
    });

    expect(result.componentCount).toBe(3);
    expect(result.components).toEqual(["PixelButton", "PixelCard", "PixelOld"]);

    const expectedPath = path.join(tmpDir, "packages/ui-kit/src/registry.generated.ts");
    const written = await fs.readFile(expectedPath, "utf8");
    expect(written).toBe(result.content);
    expect(written).toContain("UI_KIT_COMPONENTS");
    expect(written).toContain("UI_KIT_REGISTRY");
    expect(written).toContain("deprecatedNote: \"Use PixelButton.\"");
    expect(written).toContain("bundleSize: 1024");
  });

  it("does not overwrite a hand-authored registry.ts in the same dir", async () => {
    const handPath = path.join(tmpDir, "packages/ui-kit/src/registry.ts");
    await fs.writeFile(handPath, "// hand-authored — keep me\n", "utf8");

    await generateRegistry({
      repoRoot: tmpDir,
      manifests: [makeRecord({ name: "PixelButton" })],
      logger: silentLogger,
    });

    const handAfter = await fs.readFile(handPath, "utf8");
    expect(handAfter).toBe("// hand-authored — keep me\n");

    const gen = await fs.readFile(
      path.join(tmpDir, "packages/ui-kit/src/registry.generated.ts"),
      "utf8",
    );
    expect(gen).toContain("UI_KIT_COMPONENTS");
  });

  it("emits an empty-but-valid stub when no manifests are provided", async () => {
    const result = await generateRegistry({
      repoRoot: tmpDir,
      manifests: [],
      logger: silentLogger,
    });
    expect(result.componentCount).toBe(0);
    expect(result.components).toEqual([]);
    expect(result.content).toContain("UI_KIT_COMPONENTS = [");
    expect(result.content).toContain("UI_KIT_REGISTRY: Record<string, ComponentMeta> = {");
  });

  it("refuses to write outside packages/ui-kit/src", async () => {
    await expect(
      generateRegistry({
        repoRoot: tmpDir,
        outputPath: path.join(tmpDir, "evil/registry.generated.ts"),
        manifests: [makeRecord({ name: "PixelButton" })],
        logger: silentLogger,
      }),
    ).rejects.toThrow(/refusing to write outside/);
  });

  it("refuses to write a path that isn't .generated.ts", async () => {
    await expect(
      generateRegistry({
        repoRoot: tmpDir,
        outputPath: path.join(tmpDir, "packages/ui-kit/src/registry.ts"),
        manifests: [makeRecord({ name: "PixelButton" })],
        logger: silentLogger,
      }),
    ).rejects.toThrow(/\.generated\.ts/);
  });
});

describe("GenerateRegistryGenerator (class form)", () => {
  it("returns a write entry without touching disk", async () => {
    const generator = new GenerateRegistryGenerator();
    const result = await generator.run({
      repoRoot: "/repo",
      manifests: [
        makeRecord({ name: "PixelButton" }),
        makeRecord({ name: "PixelAlpha" }),
      ],
      outputs: new Map(),
      logger: silentLogger,
    });
    expect(result.writes).toHaveLength(1);
    expect(result.writes[0]!.path).toBe(
      "/repo/packages/ui-kit/src/registry.generated.ts",
    );
    // Sorted: Alpha before Button
    const code = result.writes[0]!.content;
    expect(code.indexOf("PixelAlpha")).toBeLessThan(code.indexOf("PixelButton"));
  });

  it("populates the shared outputs map", async () => {
    const outputs = new Map<string, string>();
    const generator = new GenerateRegistryGenerator();
    await generator.run({
      repoRoot: "/repo",
      manifests: [makeRecord({ name: "PixelButton" })],
      outputs,
      logger: silentLogger,
    });
    expect(outputs.size).toBe(1);
    expect(
      outputs.get("/repo/packages/ui-kit/src/registry.generated.ts"),
    ).toContain("UI_KIT_COMPONENTS");
  });
});
