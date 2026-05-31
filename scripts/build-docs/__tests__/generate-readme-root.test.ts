/**
 * Tests for generate-root-readme.ts
 *
 * Verifies:
 *  - hero (title + tagline) rendered from root package.json
 *  - badge row includes license + coverage when summary present
 *  - workspaces grouped by bucket (packages / apps) and sorted by name
 *  - each workspace row carries description + version from its package.json
 *  - safe write path: <repoRoot>/README.generated.md (never README.md)
 *  - dryRun mode does not touch the filesystem
 *  - error path: missing root package.json reported, never thrown
 */

import path from "node:path";
import os from "node:os";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  coverageBadge,
  discoverWorkspaces,
  generateRootReadme,
  renderRootReadme,
  type RootPackageJsonLike,
  type WorkspaceEntry,
} from "../generate-root-readme";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

async function makeFakeRepo(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "pxlkit-rootreadme-"));

  const rootPkg = {
    name: "pxlkit-monorepo",
    version: "1.0.0",
    private: true,
    description: "Source-available retro React toolkit — UI kit + icons + voxel.",
    license: "MIT",
    homepage: "https://pxlkit.xyz",
    repository: "https://github.com/joangeldelarosa/pxlkit",
    workspaces: ["packages/*", "apps/*"],
  };
  await fs.writeJson(path.join(root, "package.json"), rootPkg, { spaces: 2 });

  await fs.ensureDir(path.join(root, "packages", "ui-kit"));
  await fs.writeJson(
    path.join(root, "packages", "ui-kit", "package.json"),
    {
      name: "@pxlkit/ui-kit",
      version: "1.9.0",
      description: "Retro pixel art UI kit — 117 React components.",
      license: "MIT",
    },
    { spaces: 2 },
  );

  await fs.ensureDir(path.join(root, "packages", "core"));
  await fs.writeJson(
    path.join(root, "packages", "core", "package.json"),
    {
      name: "@pxlkit/core",
      version: "1.3.3",
      description: "Core rendering engine + SVG utilities.",
      license: "MIT",
    },
    { spaces: 2 },
  );

  await fs.ensureDir(path.join(root, "apps", "web"));
  await fs.writeJson(
    path.join(root, "apps", "web", "package.json"),
    {
      name: "@pxlkit/web",
      version: "0.0.0",
      private: true,
      description: "Next.js showcase site.",
    },
    { spaces: 2 },
  );

  // Workspace without a name: must be ignored.
  await fs.ensureDir(path.join(root, "packages", "_anonymous"));
  await fs.writeJson(
    path.join(root, "packages", "_anonymous", "package.json"),
    { version: "0.0.0" },
    { spaces: 2 },
  );

  return root;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe("coverageBadge", () => {
  it("returns null when no coverage data is present", () => {
    expect(coverageBadge(undefined)).toBeNull();
    expect(coverageBadge({})).toBeNull();
    expect(coverageBadge({ total: {} })).toBeNull();
  });

  it("renders a brightgreen badge for ≥90% lines", () => {
    const b = coverageBadge({ total: { lines: { pct: 91.4 } } });
    expect(b).toContain("brightgreen");
    expect(b).toContain("91.4");
  });

  it("renders a red badge for <50% lines", () => {
    const b = coverageBadge({ total: { lines: { pct: 12 } } });
    expect(b).toContain("red");
  });
});

// ---------------------------------------------------------------------------
// renderRootReadme — pure renderer
// ---------------------------------------------------------------------------

describe("renderRootReadme", () => {
  const rootPkg: RootPackageJsonLike = {
    name: "pxlkit-monorepo",
    description: "monorepo tagline",
    license: "MIT",
    homepage: "https://pxlkit.xyz",
    repository: "https://github.com/joangeldelarosa/pxlkit",
  };

  const workspaces: WorkspaceEntry[] = [
    {
      name: "@pxlkit/core",
      version: "1.3.3",
      description: "core engine",
      dir: "/tmp/pxlkit/packages/core",
      relDir: "packages/core",
      bucket: "packages",
      isPrivate: false,
    },
    {
      name: "@pxlkit/ui-kit",
      version: "1.9.0",
      description: "retro UI components",
      dir: "/tmp/pxlkit/packages/ui-kit",
      relDir: "packages/ui-kit",
      bucket: "packages",
      isPrivate: false,
    },
    {
      name: "@pxlkit/web",
      version: "0.0.0",
      description: "showcase",
      dir: "/tmp/pxlkit/apps/web",
      relDir: "apps/web",
      bucket: "apps",
      isPrivate: true,
    },
  ];

  it("includes the title + tagline + generated banner", () => {
    const md = renderRootReadme({ rootPkg, workspaces });
    expect(md.startsWith("# pxlkit-monorepo")).toBe(true);
    expect(md).toContain("monorepo tagline");
    expect(md).toContain("scripts/build-docs/generate-root-readme.ts");
    expect(md).toContain("never edit by hand");
  });

  it("emits a license badge in the hero", () => {
    const md = renderRootReadme({ rootPkg, workspaces });
    expect(md).toContain("license-MIT-blue.svg");
  });

  it("groups workspaces under per-bucket headings (Apps before Packages)", () => {
    const md = renderRootReadme({ rootPkg, workspaces });
    const appsIdx = md.indexOf("### Apps");
    const packagesIdx = md.indexOf("### Packages");
    expect(appsIdx).toBeGreaterThan(-1);
    expect(packagesIdx).toBeGreaterThan(-1);
    expect(appsIdx).toBeLessThan(packagesIdx);
  });

  it("renders each workspace row with version + description + relative link", () => {
    const md = renderRootReadme({ rootPkg, workspaces });
    expect(md).toContain("[`@pxlkit/ui-kit`](./packages/ui-kit)");
    expect(md).toContain("`1.9.0`");
    expect(md).toContain("retro UI components");
    expect(md).toContain("_(private)_"); // web app is private
  });

  it("renders a coverage badge when coverage summary is provided", () => {
    const md = renderRootReadme({
      rootPkg,
      workspaces,
      coverage: { total: { lines: { pct: 84.7 } } },
    });
    expect(md).toContain("coverage-");
    expect(md).toContain("84.7");
  });

  it("handles a repo with no workspaces gracefully", () => {
    const md = renderRootReadme({ rootPkg, workspaces: [] });
    expect(md).toContain("_No workspaces discovered._");
  });

  it("escapes pipe characters in descriptions", () => {
    const md = renderRootReadme({
      rootPkg,
      workspaces: [
        {
          ...workspaces[0]!,
          description: "danger | unsafe pipe",
        },
      ],
    });
    expect(md).toContain("danger \\| unsafe pipe");
  });
});

// ---------------------------------------------------------------------------
// discoverWorkspaces — fs-driven
// ---------------------------------------------------------------------------

describe("discoverWorkspaces", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await makeFakeRepo();
  });

  afterEach(async () => {
    await fs.remove(tmp);
  });

  it("expands workspace globs and reads each package.json", async () => {
    const pkg = (await fs.readJson(
      path.join(tmp, "package.json"),
    )) as RootPackageJsonLike;
    const ws = await discoverWorkspaces(tmp, pkg);
    const names = ws.map((w) => w.name).sort();
    expect(names).toEqual(["@pxlkit/core", "@pxlkit/ui-kit", "@pxlkit/web"]);
  });

  it("attributes bucket from the workspace relative path", async () => {
    const pkg = (await fs.readJson(
      path.join(tmp, "package.json"),
    )) as RootPackageJsonLike;
    const ws = await discoverWorkspaces(tmp, pkg);
    const map = Object.fromEntries(ws.map((w) => [w.name, w.bucket]));
    expect(map["@pxlkit/ui-kit"]).toBe("packages");
    expect(map["@pxlkit/web"]).toBe("apps");
  });

  it("marks private workspaces", async () => {
    const pkg = (await fs.readJson(
      path.join(tmp, "package.json"),
    )) as RootPackageJsonLike;
    const ws = await discoverWorkspaces(tmp, pkg);
    const web = ws.find((w) => w.name === "@pxlkit/web");
    expect(web?.isPrivate).toBe(true);
  });

  it("returns an empty list when no workspaces are declared", async () => {
    const pkg: RootPackageJsonLike = { name: "x" };
    const ws = await discoverWorkspaces(tmp, pkg);
    expect(ws).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// generateRootReadme — end-to-end
// ---------------------------------------------------------------------------

describe("generateRootReadme", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await makeFakeRepo();
  });

  afterEach(async () => {
    await fs.remove(tmp);
  });

  it("writes README.generated.md at the repo root (never README.md)", async () => {
    const before = await fs.pathExists(path.join(tmp, "README.md"));
    expect(before).toBe(false);

    const res = await generateRootReadme({ repoRoot: tmp });
    expect(res.ok).toBe(true);
    expect(res.path.endsWith("README.generated.md")).toBe(true);

    const stillNoHandReadme = await fs.pathExists(path.join(tmp, "README.md"));
    expect(stillNoHandReadme).toBe(false);

    const written = await fs.readFile(
      path.join(tmp, "README.generated.md"),
      "utf8",
    );
    expect(written).toContain("# pxlkit-monorepo");
    expect(written).toContain("@pxlkit/ui-kit");
  });

  it("does NOT overwrite an existing hand-authored README.md", async () => {
    const original = "# hand-authored\n\nDo not touch.";
    await fs.writeFile(path.join(tmp, "README.md"), original, "utf8");

    const res = await generateRootReadme({ repoRoot: tmp });
    expect(res.ok).toBe(true);

    const after = await fs.readFile(path.join(tmp, "README.md"), "utf8");
    expect(after).toBe(original);
  });

  it("dryRun does not touch the filesystem", async () => {
    const res = await generateRootReadme({ repoRoot: tmp, dryRun: true });
    expect(res.ok).toBe(true);
    expect(res.content.length).toBeGreaterThan(0);
    expect(await fs.pathExists(path.join(tmp, "README.generated.md"))).toBe(
      false,
    );
  });

  it("returns ok=false with errors[] when the root package.json is missing", async () => {
    await fs.remove(path.join(tmp, "package.json"));
    const res = await generateRootReadme({ repoRoot: tmp });
    expect(res.ok).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors[0]).toMatch(/package\.json/);
  });

  it("returns ok=false when the root package.json is malformed", async () => {
    await fs.writeFile(
      path.join(tmp, "package.json"),
      "{ this is not json",
      "utf8",
    );
    const res = await generateRootReadme({ repoRoot: tmp });
    expect(res.ok).toBe(false);
    expect(res.errors.join("\n")).toMatch(/parse/i);
  });

  it("emits coverage badge when a coverage summary file exists", async () => {
    await fs.ensureDir(path.join(tmp, "coverage"));
    await fs.writeJson(path.join(tmp, "coverage", "coverage-summary.json"), {
      total: { lines: { pct: 88.2 } },
    });

    const res = await generateRootReadme({ repoRoot: tmp, dryRun: true });
    expect(res.ok).toBe(true);
    expect(res.content).toContain("coverage-");
    expect(res.content).toContain("88.2");
  });
});
