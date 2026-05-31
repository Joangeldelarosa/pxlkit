/**
 * Tests for orchestrate.ts.
 *
 * Strategy: stub out the heavy generators with NoopGenerator-style fakes and
 * drive `orchestrate()` against a tiny temp repo. This exercises:
 *  - DAG ordering (scan first, then user-selected steps)
 *  - --only filtering (always re-includes scan)
 *  - dry-run mode (no disk writes)
 *  - error propagation + aborted-after-failure semantics
 *  - parseArgs CLI behavior
 *  - watch() single-cycle short-circuit
 */

import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  __internal,
  orchestrate,
  parseArgs,
  PIPELINE_STEPS,
  resolveSelectedSteps,
  run,
  watch,
  type OrchestrateResult,
  type StepDescriptor,
} from "../orchestrate";
import {
  Generator,
  type GeneratorContext,
  type GeneratorResult,
} from "../_lib/generator-base";
import { createLogger } from "../_lib/logger";

const silent = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  success: () => undefined,
  table: () => undefined,
};

// ---------------------------------------------------------------------------
// Temp-repo helpers
// ---------------------------------------------------------------------------

let tmpRoot: string;

async function makeRepo(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "pxlkit-orchestrate-"));
  await fs.ensureDir(path.join(root, "packages", "ui-kit", "src"));
  await fs.writeJson(path.join(root, "package.json"), {
    name: "pxlkit-monorepo",
    private: true,
    version: "0.0.0",
    workspaces: ["packages/*"],
  });
  await fs.writeJson(path.join(root, "packages", "ui-kit", "package.json"), {
    name: "@pxlkit/ui-kit",
    version: "0.0.0",
  });
  return root;
}

beforeEach(async () => {
  tmpRoot = await makeRepo();
});

afterEach(async () => {
  if (tmpRoot) await fs.remove(tmpRoot);
});

// ---------------------------------------------------------------------------
// Stub generators — replace PIPELINE_STEPS entries to keep the test hermetic.
// ---------------------------------------------------------------------------

class RecordingGenerator extends Generator {
  override name: string;
  calls = 0;
  shouldFail = false;
  writes: { path: string; content: string }[];
  constructor(name: string, writes: { path: string; content: string }[] = []) {
    super();
    this.name = name;
    this.writes = writes;
  }
  override async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    this.calls += 1;
    if (this.shouldFail) throw new Error(`${this.name} boom`);
    // Seed manifests if this is the scan stub
    if (this.name === "scan" && ctx.manifests.length === 0) {
      ctx.manifests.push({
        sourceFile: "/fake/Stub.tsx",
        manifestFile: "/fake/Stub.manifest.ts",
        package: "@pxlkit/ui-kit",
        manifest: { name: "Stub" },
      });
    }
    return { writes: this.writes };
  }
}

function buildFakeSteps(repoRoot: string): {
  steps: StepDescriptor[];
  registry: Record<string, RecordingGenerator>;
} {
  const writeOut = path.join(repoRoot, "out", "registry.generated.ts");
  const registry: Record<string, RecordingGenerator> = {
    scan: new RecordingGenerator("scan"),
    "extract-bundle": new RecordingGenerator("extract-bundle"),
    "generate-registry": new RecordingGenerator("generate-registry", [
      { path: writeOut, content: "export const R = []" },
    ]),
    "generate-stories": new RecordingGenerator("generate-stories"),
  };
  const steps: StepDescriptor[] = [
    { name: "scan", factory: () => registry.scan!, required: true },
    { name: "extract-bundle", factory: () => registry["extract-bundle"]!, required: false },
    { name: "generate-registry", factory: () => registry["generate-registry"]! },
    { name: "generate-stories", factory: () => registry["generate-stories"]! },
  ];
  return { steps, registry };
}

// (The orchestrate API accepts `steps` directly, so we pass our fakes through
// without monkey-patching anything.)

// ---------------------------------------------------------------------------
// resolveSelectedSteps
// ---------------------------------------------------------------------------

describe("resolveSelectedSteps", () => {
  const sample: StepDescriptor[] = [
    { name: "scan", factory: () => new RecordingGenerator("scan"), required: true },
    { name: "generate-registry", factory: () => new RecordingGenerator("generate-registry") },
    { name: "generate-stories", factory: () => new RecordingGenerator("generate-stories") },
  ];

  it("returns every step when --only is omitted", () => {
    expect(resolveSelectedSteps(undefined, sample).map((s) => s.name)).toEqual([
      "scan",
      "generate-registry",
      "generate-stories",
    ]);
  });

  it("filters down to selected steps but always keeps scan", () => {
    const out = resolveSelectedSteps(["generate-registry"], sample).map((s) => s.name);
    expect(out).toEqual(["scan", "generate-registry"]);
  });

  it("resolves aliases (registry → generate-registry)", () => {
    const out = resolveSelectedSteps(["registry", "stories"], sample).map((s) => s.name);
    expect(out).toEqual(["scan", "generate-registry", "generate-stories"]);
  });

  it("preserves the DAG order regardless of --only ordering", () => {
    const out = resolveSelectedSteps(["stories", "registry"], sample).map((s) => s.name);
    expect(out).toEqual(["scan", "generate-registry", "generate-stories"]);
  });

  it("returns just scan when no known step matches", () => {
    const out = resolveSelectedSteps(["does-not-exist"], sample).map((s) => s.name);
    expect(out).toEqual(["scan"]);
  });
});

// ---------------------------------------------------------------------------
// orchestrate() — end-to-end with fake pipeline
// ---------------------------------------------------------------------------

describe("orchestrate", () => {
  it("runs every step in DAG order and returns ok=true on success", async () => {
    const { steps, registry } = buildFakeSteps(tmpRoot);
    const result = await orchestrate({ repoRoot: tmpRoot, logger: silent, steps });
    expect(result.ok).toBe(true);
    expect(result.steps.map((s) => s.name)).toEqual([
      "scan",
      "extract-bundle",
      "generate-registry",
      "generate-stories",
    ]);
    expect(registry.scan!.calls).toBe(1);
    expect(registry["generate-registry"]!.calls).toBe(1);
    expect(result.steps.find((s) => s.name === "extract-bundle")!.status).toBe("skipped");
  });

  it("propagates manifest count from the scan stub", async () => {
    const { steps } = buildFakeSteps(tmpRoot);
    const result = await orchestrate({ repoRoot: tmpRoot, logger: silent, steps });
    expect(result.manifestCount).toBe(1);
  });

  it("flushes writes to disk in non-dry-run mode", async () => {
    const { steps } = buildFakeSteps(tmpRoot);
    const result = await orchestrate({ repoRoot: tmpRoot, logger: silent, steps });
    expect(result.writtenFiles.length).toBe(1);
    expect(
      await fs.pathExists(path.join(tmpRoot, "out", "registry.generated.ts")),
    ).toBe(true);
  });

  it("does not write to disk in dry-run mode", async () => {
    const { steps } = buildFakeSteps(tmpRoot);
    const result = await orchestrate({
      repoRoot: tmpRoot,
      logger: silent,
      dryRun: true,
      steps,
    });
    expect(result.ok).toBe(true);
    expect(result.writtenFiles.length).toBe(1);
    expect(
      await fs.pathExists(path.join(tmpRoot, "out", "registry.generated.ts")),
    ).toBe(false);
  });

  it("aborts downstream steps when a required step fails", async () => {
    const { steps, registry } = buildFakeSteps(tmpRoot);
    registry.scan!.shouldFail = true;
    const result = await orchestrate({ repoRoot: tmpRoot, logger: silent, steps });
    expect(result.ok).toBe(false);
    const byName = Object.fromEntries(result.steps.map((s) => [s.name, s.status]));
    expect(byName.scan).toBe("failed");
    expect(byName["generate-registry"]).toBe("skipped");
    expect(registry["generate-registry"]!.calls).toBe(0);
  });

  it("continues past failures of optional steps", async () => {
    const { steps, registry } = buildFakeSteps(tmpRoot);
    registry["extract-bundle"]!.shouldFail = true;
    const result = await orchestrate({ repoRoot: tmpRoot, logger: silent, steps });
    expect(result.ok).toBe(false);
    const byName = Object.fromEntries(result.steps.map((s) => [s.name, s.status]));
    expect(byName["extract-bundle"]).toBe("failed");
    expect(byName["generate-registry"]).toBe("ok");
    expect(registry["generate-registry"]!.calls).toBe(1);
  });

  it("respects --only filtering", async () => {
    const { steps, registry } = buildFakeSteps(tmpRoot);
    const result = await orchestrate({
      repoRoot: tmpRoot,
      only: ["registry"],
      logger: silent,
      steps,
    });
    expect(result.steps.map((s) => s.name)).toEqual(["scan", "generate-registry"]);
    expect(registry["generate-stories"]!.calls).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe("parseArgs", () => {
  it("parses no args", () => {
    const a = parseArgs([]);
    expect(a).toMatchObject({
      watch: false,
      quiet: false,
      json: false,
      dryRun: false,
      help: false,
    });
    expect(a.only).toBeUndefined();
  });

  it("parses --only=a,b,c", () => {
    const a = parseArgs(["--only=registry,readme"]);
    expect(a.only).toEqual(["registry", "readme"]);
  });

  it("parses --only a,b (space form)", () => {
    const a = parseArgs(["--only", "stories,docs"]);
    expect(a.only).toEqual(["stories", "docs"]);
  });

  it("parses every long flag", () => {
    const a = parseArgs(["--watch", "--quiet", "--json", "--dry-run"]);
    expect(a.watch).toBe(true);
    expect(a.quiet).toBe(true);
    expect(a.json).toBe(true);
    expect(a.dryRun).toBe(true);
  });

  it("parses --root <dir>", () => {
    const a = parseArgs(["--root", "C:/some/where"]);
    expect(a.repoRoot).toBe(path.resolve("C:/some/where"));
  });

  it("throws on unknown flags", () => {
    expect(() => parseArgs(["--nope"])).toThrow(/Unknown flag/);
  });

  it("throws when --only is missing its value", () => {
    expect(() => parseArgs(["--only"])).toThrow(/--only requires/);
  });
});

// ---------------------------------------------------------------------------
// run() — CLI entrypoint surface (returns exit code)
// ---------------------------------------------------------------------------

describe("run (CLI)", () => {
  it("prints help and exits 0 on --help", async () => {
    const code = await run(["--help"]);
    expect(code).toBe(0);
  });

  it("returns 1 on invalid args", async () => {
    const code = await run(["--bogus"]);
    expect(code).toBe(1);
  });

  it("returns 0 when the real pipeline runs against an empty repo in dry-run", async () => {
    // No manifests in tmpRoot → scan exits clean; downstream generators emit
    // empty stubs (or skip cleanly). The CLI should still exit 0.
    const code = await run([
      "--root",
      tmpRoot,
      "--quiet",
      "--dry-run",
      "--only=registry",
    ]);
    expect(code).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// __internal — small unit cases
// ---------------------------------------------------------------------------

describe("__internal.resolveStepName", () => {
  it("returns the canonical name for known aliases", () => {
    expect(__internal.resolveStepName("registry")).toBe("generate-registry");
    expect(__internal.resolveStepName("og")).toBe("generate-og-images");
  });
  it("passes through unknown names unchanged", () => {
    expect(__internal.resolveStepName("scan")).toBe("scan");
    expect(__internal.resolveStepName("custom-step")).toBe("custom-step");
  });
});

describe("__internal.snapshotsDiffer", () => {
  it("returns false for two identical empty maps", () => {
    expect(__internal.snapshotsDiffer(new Map(), new Map())).toBe(false);
  });
  it("returns true when sizes differ", () => {
    const a = new Map([["x", { size: 1, mtimeMs: 1 }]]);
    const b = new Map();
    expect(__internal.snapshotsDiffer(a, b)).toBe(true);
  });
  it("returns true when mtimes differ", () => {
    const a = new Map([["x", { size: 1, mtimeMs: 1 }]]);
    const b = new Map([["x", { size: 1, mtimeMs: 2 }]]);
    expect(__internal.snapshotsDiffer(a, b)).toBe(true);
  });
  it("returns false when both are identical", () => {
    const a = new Map([["x", { size: 1, mtimeMs: 1 }]]);
    const b = new Map([["x", { size: 1, mtimeMs: 1 }]]);
    expect(__internal.snapshotsDiffer(a, b)).toBe(false);
  });
});

describe("__internal.NoopGenerator", () => {
  it("emits zero writes", async () => {
    const g = new __internal.NoopGenerator("noop");
    const result = await g.run();
    expect(result.writes).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// watch() — bounded by maxRebuilds for tests
// ---------------------------------------------------------------------------

describe("watch", () => {
  it("runs the pipeline at least once and exits after maxRebuilds", async () => {
    const { steps } = buildFakeSteps(tmpRoot);
    const cycles: OrchestrateResult[] = [];
    const results = await watch({
      repoRoot: tmpRoot,
      intervalMs: 50,
      maxRebuilds: 0, // bail right after the initial build
      quiet: true,
      logger: silent,
      steps,
      onCycle: (r) => {
        cycles.push(r);
      },
    });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(cycles.length).toBeGreaterThanOrEqual(1);
    expect(cycles[0]!.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PIPELINE_STEPS (smoke check that the real steps are in the expected order)
// ---------------------------------------------------------------------------

describe("PIPELINE_STEPS", () => {
  it("lists every spec'd step in DAG order", () => {
    const names = PIPELINE_STEPS.map((s) => s.name);
    expect(names).toEqual([
      "scan",
      "extract-bundle",
      "generate-registry",
      "generate-stories",
      "generate-showcase",
      "generate-docs-page",
      "generate-readme-package",
      "generate-readme-root",
      "generate-changelog",
      "generate-og-images",
      "generate-metadata",
    ]);
  });

  it("marks extract-bundle as optional and everything else as required by default", () => {
    const optional = PIPELINE_STEPS.filter((s) => s.required === false).map((s) => s.name);
    expect(optional).toEqual(["extract-bundle"]);
  });
});

// Reference createLogger to keep imports honest (test that it is callable).
describe("createLogger smoke", () => {
  it("returns an object with the expected methods", () => {
    const l = createLogger("test");
    expect(typeof l.info).toBe("function");
    expect(typeof l.warn).toBe("function");
    expect(typeof l.error).toBe("function");
    expect(typeof l.success).toBe("function");
    expect(typeof l.table).toBe("function");
  });
});
