/**
 * Tests for generate-changelog.ts — manifest-timeline + git-log changelog builder.
 */

import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ChangelogGenerator,
  classifyCommit,
  composeChangelog,
  readPackageCommits,
  renderChangelog,
  seedChangelogVersions,
  type ChangelogPackage,
  type GitCommit,
} from "../generate-changelog";
import type { GeneratorContext, ManifestRecord } from "../_lib/generator-base";
import { createLogger } from "../_lib/logger";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const REPO_ROOT = "/fake/repo";
const PKG_DIR = "/fake/repo/packages/ui-kit";

function manifestRec(name: string, since: string, extra: Record<string, unknown> = {}): ManifestRecord {
  return {
    manifest: {
      name,
      since,
      description: `desc of ${name}`,
      ...extra,
    },
    sourceFile: `${PKG_DIR}/src/${name}.tsx`,
    manifestFile: `${PKG_DIR}/src/${name}.manifest.ts`,
    package: "@pxlkit/ui-kit",
  };
}

function commit(partial: Partial<GitCommit>): GitCommit {
  return {
    sha: partial.sha ?? "abcdef1234567890",
    shortSha: partial.shortSha ?? "abcdef1",
    date: partial.date ?? "2026-01-15",
    subject: partial.subject ?? "feat: something",
    body: partial.body ?? "",
  };
}

// ---------------------------------------------------------------------------
// classifyCommit
// ---------------------------------------------------------------------------

describe("classifyCommit", () => {
  it("maps feat → Added", () => {
    const r = classifyCommit("feat: add PixelButton");
    expect(r.category).toBe("Added");
    expect(r.description).toBe("add PixelButton");
    expect(r.breaking).toBe(false);
  });

  it("maps fix → Fixed", () => {
    const r = classifyCommit("fix(ui-kit): focus ring leaks");
    expect(r.category).toBe("Fixed");
    expect(r.scope).toBe("ui-kit");
  });

  it("maps refactor → Changed", () => {
    expect(classifyCommit("refactor: split modules").category).toBe("Changed");
  });

  it("detects breaking via !", () => {
    const r = classifyCommit("feat!: drop legacy API");
    expect(r.breaking).toBe(true);
  });

  it("falls back to Changed for non-conventional subjects", () => {
    const r = classifyCommit("misc tweaks");
    expect(r.category).toBe("Changed");
    expect(r.description).toBe("misc tweaks");
  });

  it("treats revert as Removed", () => {
    expect(classifyCommit("revert: drop X").category).toBe("Removed");
  });
});

// ---------------------------------------------------------------------------
// composeChangelog
// ---------------------------------------------------------------------------

describe("composeChangelog", () => {
  it("creates an Added entry per manifest, anchored to since", () => {
    const out = composeChangelog({
      repoRoot: REPO_ROOT,
      packageName: "@pxlkit/ui-kit",
      packageDir: PKG_DIR,
      manifests: [manifestRec("PixelButton", "1.0.0"), manifestRec("PixelCard", "1.2.0")],
      commits: [],
    });
    const v100 = out.versions.find((v) => v.version === "1.0.0");
    const v120 = out.versions.find((v) => v.version === "1.2.0");
    expect(v100).toBeDefined();
    expect(v120).toBeDefined();
    expect(v100!.entries.some((e) => e.category === "Added" && e.text.includes("PixelButton"))).toBe(true);
    expect(v120!.entries.some((e) => e.category === "Added" && e.text.includes("PixelCard"))).toBe(true);
  });

  it("sorts versions newest first, with Unreleased pinned to top", () => {
    const out = composeChangelog({
      repoRoot: REPO_ROOT,
      packageName: "@pxlkit/ui-kit",
      packageDir: PKG_DIR,
      manifests: [manifestRec("A", "1.0.0"), manifestRec("B", "2.1.3")],
      commits: [commit({ subject: "chore: cleanup", shortSha: "deadbee" })],
    });
    const order = out.versions.map((v) => v.version);
    expect(order[0]).toBe("Unreleased");
    expect(order.indexOf("2.1.3")).toBeLessThan(order.indexOf("1.0.0"));
  });

  it("bins commits with v-tagged subjects under the right version", () => {
    const out = composeChangelog({
      repoRoot: REPO_ROOT,
      packageName: "@pxlkit/ui-kit",
      packageDir: PKG_DIR,
      manifests: [],
      commits: [
        commit({ subject: "feat(ui-kit): v1.9.0 — Ola 4a Depth", shortSha: "035ba2a", date: "2026-04-10" }),
        commit({ subject: "fix: dangling ref", shortSha: "deadbee", date: "2026-03-01" }),
      ],
    });
    const v190 = out.versions.find((v) => v.version === "1.9.0");
    expect(v190).toBeDefined();
    expect(v190!.entries.some((e) => e.category === "Added")).toBe(true);
    const unreleased = out.versions.find((v) => v.version === "Unreleased");
    expect(unreleased).toBeDefined();
    expect(unreleased!.entries.some((e) => e.category === "Fixed")).toBe(true);
  });

  it("emits a Deprecated entry when manifest.status === 'deprecated'", () => {
    const out = composeChangelog({
      repoRoot: REPO_ROOT,
      packageName: "@pxlkit/ui-kit",
      packageDir: PKG_DIR,
      manifests: [
        manifestRec("OldThing", "1.4.0", { status: "deprecated", deprecatedNote: "use NewThing" }),
      ],
      commits: [],
    });
    const v = out.versions.find((b) => b.version === "1.4.0")!;
    expect(v.entries.some((e) => e.category === "Deprecated" && /use NewThing/.test(e.text))).toBe(true);
  });

  it("dedups identical entries within a version", () => {
    const out = composeChangelog({
      repoRoot: REPO_ROOT,
      packageName: "@pxlkit/ui-kit",
      packageDir: PKG_DIR,
      manifests: [],
      commits: [
        commit({ subject: "fix: same bug", shortSha: "a1" }),
        commit({ subject: "fix: same bug", shortSha: "a2" }),
      ],
    });
    const unreleased = out.versions.find((v) => v.version === "Unreleased")!;
    const fixed = unreleased.entries.filter((e) => e.category === "Fixed");
    expect(fixed).toHaveLength(1);
  });

  it("skips merge commits", () => {
    const out = composeChangelog({
      repoRoot: REPO_ROOT,
      packageName: "@pxlkit/ui-kit",
      packageDir: PKG_DIR,
      manifests: [],
      commits: [
        commit({ subject: "Merge pull request #42 from feat/x" }),
        commit({ subject: "feat: real change", shortSha: "feedface" }),
      ],
    });
    const unreleased = out.versions.find((v) => v.version === "Unreleased")!;
    expect(unreleased.entries).toHaveLength(1);
    expect(unreleased.entries[0]!.category).toBe("Added");
  });
});

// ---------------------------------------------------------------------------
// renderChangelog
// ---------------------------------------------------------------------------

describe("renderChangelog", () => {
  it("renders a header and one section per category", () => {
    const pkg: ChangelogPackage = {
      package: "@pxlkit/ui-kit",
      packageDir: "packages/ui-kit",
      versions: [
        {
          version: "1.0.0",
          date: "2026-01-15",
          entries: [
            { category: "Added", text: "PixelButton — desc", source: "manifest" },
            { category: "Fixed", text: "ring leak", source: "abc1234", date: "2026-01-15" },
          ],
        },
      ],
    };
    const md = renderChangelog(pkg);
    expect(md).toContain("# Changelog — @pxlkit/ui-kit");
    expect(md).toContain("## 1.0.0 — 2026-01-15");
    expect(md).toContain("### Added");
    expect(md).toContain("### Fixed");
    expect(md).toContain("PixelButton — desc");
    expect(md).toContain("_(manifest)_");
    expect(md).toContain("_(abc1234)_");
  });

  it("renders an empty-history placeholder when no versions", () => {
    const md = renderChangelog({
      package: "@pxlkit/ui-kit",
      packageDir: "packages/ui-kit",
      versions: [],
    });
    expect(md).toContain("_No history yet._");
  });

  it("renders a seed header instead of the do-not-edit header when seeded", () => {
    const pkg: ChangelogPackage = {
      package: "@pxlkit/core",
      packageDir: "packages/core",
      versions: [
        {
          version: "1.3.3",
          date: "2026-05-01",
          entries: [{ category: "Added", text: "thing", source: "abc1234", date: "2026-05-01" }],
        },
      ],
    };
    const md = renderChangelog(pkg, { seeded: true });
    expect(md).toContain("Seeded from git history");
    expect(md).toContain("hand-maintained");
    expect(md).not.toContain("Do not edit by hand");
    expect(md).toContain("## 1.3.3 — 2026-05-01");
  });
});

// ---------------------------------------------------------------------------
// seedChangelogVersions — anchor the derived history to the package version
// ---------------------------------------------------------------------------

describe("seedChangelogVersions", () => {
  const base: ChangelogPackage = {
    package: "@pxlkit/core",
    packageDir: "packages/core",
    versions: [
      {
        version: "Unreleased",
        date: "2026-05-01",
        entries: [{ category: "Added", text: "new thing", source: "abc1234", date: "2026-05-01" }],
      },
      {
        version: "2.0.0",
        date: "2026-04-01",
        entries: [{ category: "Changed", text: "stray monorepo release token", source: "def5678", date: "2026-04-01" }],
      },
      {
        version: "1.0.0",
        date: "2025-01-01",
        entries: [{ category: "Added", text: "genesis", source: "0a1b2c3", date: "2025-01-01" }],
      },
    ],
  };

  it("relabels Unreleased to the current package version", () => {
    const out = seedChangelogVersions(base, "1.3.3");
    expect(out.versions[0]!.version).toBe("1.3.3");
    expect(out.versions[0]!.entries.some((e) => e.text === "new thing")).toBe(true);
  });

  it("folds blocks above the current version into the current version block", () => {
    const out = seedChangelogVersions(base, "1.3.3");
    expect(out.versions.map((v) => v.version)).toEqual(["1.3.3", "1.0.0"]);
    expect(out.versions[0]!.entries.some((e) => e.text === "stray monorepo release token")).toBe(true);
  });

  it("keeps blocks at or below the current version intact", () => {
    const out = seedChangelogVersions(base, "1.3.3");
    const v1 = out.versions.find((v) => v.version === "1.0.0");
    expect(v1).toBeDefined();
    expect(v1!.entries[0]!.text).toBe("genesis");
  });

  it("uses the newest merged date for the anchored block", () => {
    const out = seedChangelogVersions(base, "1.3.3");
    expect(out.versions[0]!.date).toBe("2026-05-01");
  });

  it("merges into an existing block when one already matches the current version", () => {
    const withCurrent: ChangelogPackage = {
      ...base,
      versions: [
        ...base.versions,
        {
          version: "1.3.3",
          date: "2026-03-15",
          entries: [{ category: "Fixed", text: "pinned fix", source: "feed123", date: "2026-03-15" }],
        },
      ],
    };
    const out = seedChangelogVersions(withCurrent, "1.3.3");
    const anchored = out.versions.filter((v) => v.version === "1.3.3");
    expect(anchored).toHaveLength(1);
    expect(anchored[0]!.entries.some((e) => e.text === "pinned fix")).toBe(true);
    expect(anchored[0]!.entries.some((e) => e.text === "new thing")).toBe(true);
  });

  it("returns the package unchanged when no valid version is supplied", () => {
    expect(seedChangelogVersions(base, undefined)).toBe(base);
    expect(seedChangelogVersions(base, "not-semver")).toBe(base);
  });
});

// ---------------------------------------------------------------------------
// readPackageCommits — uses an injected runner
// ---------------------------------------------------------------------------

describe("readPackageCommits", () => {
  it("parses commits via the injected git runner", () => {
    const fakeRunner = (_args: string[]): string => {
      const F = "FIELD";
      const C = "COMMIT";
      return [
        ["aaaaaaa1111", "aaaaaaa", "2026-04-10", "feat(ui-kit): v1.9.0", ""].join(F) + C,
        ["bbbbbbb2222", "bbbbbbb", "2026-03-01", "fix: ring leak", ""].join(F) + C,
      ].join("");
    };
    const commits = readPackageCommits({
      repoRoot: REPO_ROOT,
      packageDir: PKG_DIR,
      runner: fakeRunner,
    });
    expect(commits).toHaveLength(2);
    expect(commits[0]!.subject).toBe("feat(ui-kit): v1.9.0");
    expect(commits[1]!.shortSha).toBe("bbbbbbb");
  });

  it("returns [] when runner throws", () => {
    const throwingRunner = (): string => {
      throw new Error("no git here");
    };
    const commits = readPackageCommits({
      repoRoot: REPO_ROOT,
      packageDir: PKG_DIR,
      runner: throwingRunner,
    });
    expect(commits).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// ChangelogGenerator end-to-end (fake workspaces + fake git)
// ---------------------------------------------------------------------------

describe("ChangelogGenerator.run", () => {
  it("emits one write per workspace with content", async () => {
    const fakeRunner = (_args: string[]): string => {
      const F = "FIELD";
      const C = "COMMIT";
      return (
        ["c0ffee11111", "c0ffee1", "2026-04-10", "feat(ui-kit): v1.9.0 — Ola 4a", ""].join(F) + C
      );
    };
    const generator = new ChangelogGenerator({
      gitRunner: fakeRunner,
      workspaces: [{ name: "@pxlkit/ui-kit", dir: PKG_DIR }],
    });

    const ctx: GeneratorContext = {
      repoRoot: REPO_ROOT,
      manifests: [manifestRec("PixelButton", "1.0.0")],
      outputs: new Map<string, string>(),
      logger: createLogger("test"),
    };

    const result = await generator.run(ctx);
    expect(result.writes).toHaveLength(1);
    const w = result.writes[0]!;
    // The fake workspace dir has no CHANGELOG.md, so the generator seeds one.
    expect(w.path.endsWith("/CHANGELOG.md")).toBe(true);
    expect(w.content).toContain("# Changelog — @pxlkit/ui-kit");
    expect(w.content).toContain("PixelButton");
    expect(w.content).toContain("1.9.0");
  });

  it("respects packageFilter", async () => {
    const generator = new ChangelogGenerator({
      gitRunner: () => "",
      packageFilter: "@pxlkit/other",
      workspaces: [
        { name: "@pxlkit/ui-kit", dir: PKG_DIR },
        { name: "@pxlkit/other", dir: "/fake/repo/packages/other" },
      ],
    });
    const ctx: GeneratorContext = {
      repoRoot: REPO_ROOT,
      manifests: [
        manifestRec("Foo", "0.1.0"),
        {
          manifest: { name: "Bar", since: "0.2.0" },
          sourceFile: "/fake/repo/packages/other/src/Bar.tsx",
          manifestFile: "/fake/repo/packages/other/src/Bar.manifest.ts",
          package: "@pxlkit/other",
        },
      ],
      outputs: new Map<string, string>(),
      logger: createLogger("test"),
    };
    const result = await generator.run(ctx);
    expect(result.writes).toHaveLength(1);
    expect(result.writes[0]!.path).toContain("packages/other");
  });

  it("skips packages with no manifests AND no commits", async () => {
    const generator = new ChangelogGenerator({
      gitRunner: () => "",
      workspaces: [{ name: "@pxlkit/empty", dir: "/fake/repo/packages/empty" }],
    });
    const ctx: GeneratorContext = {
      repoRoot: REPO_ROOT,
      manifests: [],
      outputs: new Map<string, string>(),
      logger: createLogger("test"),
    };
    const result = await generator.run(ctx);
    expect(result.writes).toHaveLength(0);
  });

  it("seeds CHANGELOG.md anchored to the workspace version when none exists", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "pxl-changelog-test-"));
    try {
      const pkgDir = path.join(tmp, "packages", "core");
      await fs.ensureDir(pkgDir);

      const fakeRunner = (_args: string[]): string => {
        const F = "FIELD";
        const C = "COMMIT";
        return [
          ["aaaa1111", "aaaa111", "2026-05-01", "feat: brand new util", ""].join(F) + C,
          ["bbbb2222", "bbbb222", "2026-04-01", "release(ui-kit): v2.0.0 launch", ""].join(F) + C,
        ].join("");
      };
      const generator = new ChangelogGenerator({
        gitRunner: fakeRunner,
        workspaces: [{ name: "@pxlkit/core", dir: pkgDir.split(path.sep).join("/"), version: "1.3.3" }],
      });
      const ctx: GeneratorContext = {
        repoRoot: tmp,
        manifests: [],
        outputs: new Map<string, string>(),
        logger: createLogger("test"),
      };

      const result = await generator.run(ctx);
      expect(result.writes).toHaveLength(1);
      const w = result.writes[0]!;
      expect(w.path.endsWith("packages/core/CHANGELOG.md")).toBe(true);
      expect(w.content).toContain("Seeded from git history");
      // first version heading is the package's current version, not 2.0.0
      const firstHeading = /^##\s+(.+)$/m.exec(w.content);
      expect(firstHeading![1]).toMatch(/^1\.3\.3\b/);
      // entries from the v2.0.0-tagged commit got folded into 1.3.3
      expect(w.content).toContain("v2.0.0 launch");
    } finally {
      await fs.remove(tmp);
    }
  });

  it("keeps the sibling .generated.md when a hand-authored CHANGELOG.md exists", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "pxl-changelog-test-"));
    try {
      const pkgDir = path.join(tmp, "packages", "ui-kit");
      await fs.ensureDir(pkgDir);
      const handAuthored = "# Changelog\n\n## 2.0.1 — 2026-06-01\n\n- hand entry\n";
      await fs.writeFile(path.join(pkgDir, "CHANGELOG.md"), handAuthored, "utf8");

      const generator = new ChangelogGenerator({
        gitRunner: () => "",
        workspaces: [{ name: "@pxlkit/ui-kit", dir: pkgDir.split(path.sep).join("/"), version: "2.0.1" }],
      });
      const ctx: GeneratorContext = {
        repoRoot: tmp,
        manifests: [manifestRec("PixelButton", "1.0.0")],
        outputs: new Map<string, string>(),
        logger: createLogger("test"),
      };

      const result = await generator.run(ctx);
      expect(result.writes).toHaveLength(1);
      const w = result.writes[0]!;
      expect(w.path.endsWith("packages/ui-kit/CHANGELOG.generated.md")).toBe(true);
      expect(w.content).toContain("Do not edit by hand");
      // hand-authored file untouched
      const after = await fs.readFile(path.join(pkgDir, "CHANGELOG.md"), "utf8");
      expect(after).toBe(handAuthored);
    } finally {
      await fs.remove(tmp);
    }
  });
});
