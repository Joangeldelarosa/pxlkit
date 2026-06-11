/**
 * generate-changelog.ts — per-package CHANGELOG.generated.md builder.
 *
 * Composes a changelog from:
 *   1. Manifest `since` timeline — every component announces itself as Added
 *      under its `since` version (deprecations land in Deprecated).
 *   2. Git log scoped to the package's directory — conventional-commit subjects
 *      classified into Added / Changed / Fixed / Deprecated / Removed.
 *
 * SAFE: when a hand-authored `CHANGELOG.md` exists, writes only to
 * `<package>/CHANGELOG.generated.md` and never touches the hand file.
 * When a package has NO `CHANGELOG.md` at all, the derived changelog is
 * written once AS `CHANGELOG.md` (an initial seed, anchored to the package's
 * current version and flagged as hand-maintained from then on). Idempotent;
 * deterministic output (no timestamps in body beyond commit `YYYY-MM-DD`).
 *
 * CLI:
 *   tsx scripts/build-docs/generate-changelog.ts [--package <name>] [--json] [--write]
 *     --package   limit to one workspace package (default: all detected)
 *     --json      machine-readable summary to stdout
 *     --write     persist files to disk (default: dry run — print writes count)
 *
 * Programmatic:
 *   import generate from "./generate-changelog.js";
 *   const result = await generate.run(ctx);  // GeneratorResult
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fg from "fast-glob";
import fs from "fs-extra";
import pc from "picocolors";
import {
  Generator,
  type GeneratorContext,
  type GeneratorResult,
  type GeneratorWrite,
  type ManifestRecord,
  writeOutput,
} from "./_lib/generator-base.js";
import { createLogger, defaultLogger, type Logger } from "./_lib/logger.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ChangelogCategory =
  | "Added"
  | "Changed"
  | "Fixed"
  | "Deprecated"
  | "Removed";

export interface ChangelogEntry {
  category: ChangelogCategory;
  text: string;
  /** Short commit sha, or "manifest" when sourced from the manifest timeline. */
  source: string;
  /** ISO date (YYYY-MM-DD) — commit date or empty for manifest-derived entries. */
  date?: string;
  /** Component name when traceable to a manifest. */
  component?: string;
}

export interface ChangelogVersionBlock {
  version: string;
  /** Most recent commit date inside the version, ISO. Empty if version had no commits. */
  date?: string;
  entries: ChangelogEntry[];
}

export interface ChangelogPackage {
  package: string;
  packageDir: string;
  versions: ChangelogVersionBlock[];
}

export interface GitCommit {
  sha: string;
  shortSha: string;
  date: string; // YYYY-MM-DD
  subject: string;
  body: string;
}

// ---------------------------------------------------------------------------
// Conventional-commit classifier
// ---------------------------------------------------------------------------

const TYPE_TO_CATEGORY: Record<string, ChangelogCategory> = {
  feat: "Added",
  feature: "Added",
  add: "Added",
  fix: "Fixed",
  bugfix: "Fixed",
  perf: "Changed",
  refactor: "Changed",
  style: "Changed",
  chore: "Changed",
  docs: "Changed",
  test: "Changed",
  build: "Changed",
  ci: "Changed",
  revert: "Removed",
  remove: "Removed",
  deprecate: "Deprecated",
};

const CONVENTIONAL_RE =
  /^(?<type>[a-zA-Z]+)(?:\((?<scope>[^)]+)\))?(?<bang>!)?:\s*(?<desc>.+)$/;

export interface ClassificationResult {
  category: ChangelogCategory;
  description: string;
  scope?: string;
  breaking: boolean;
}

/**
 * Map a commit subject to a changelog category.
 * Non-conventional subjects default to "Changed".
 * The `!` flag promotes a fix/feat into Changed-with-breaking by convention,
 * but we keep the original category and surface the bang via {breaking}.
 */
export function classifyCommit(subject: string): ClassificationResult {
  const trimmed = subject.trim();
  const match = CONVENTIONAL_RE.exec(trimmed);
  if (!match || !match.groups) {
    return {
      category: "Changed",
      description: trimmed,
      breaking: /BREAKING CHANGE/.test(trimmed),
    };
  }
  const type = match.groups.type.toLowerCase();
  const desc = match.groups.desc.trim();
  const scope = match.groups.scope?.trim();
  const breaking = match.groups.bang === "!";
  const category =
    TYPE_TO_CATEGORY[type] ?? (breaking ? "Changed" : "Changed");
  return { category, description: desc, scope, breaking };
}

// ---------------------------------------------------------------------------
// Git access (sync — small reads, predictable in CI)
// ---------------------------------------------------------------------------

interface GitOptions {
  repoRoot: string;
  packageDir: string;
  /** Override `git` invocation for tests. */
  runner?: (args: string[]) => string;
}

const COMMIT_DELIM = "COMMIT";
const FIELD_DELIM = "FIELD";

export function readPackageCommits({ repoRoot, packageDir, runner }: GitOptions): GitCommit[] {
  const relDir = path.relative(repoRoot, packageDir).split(path.sep).join("/");
  const format = ["%H", "%h", "%ad", "%s", "%b"].join(FIELD_DELIM) + COMMIT_DELIM;
  const args = [
    "-C",
    repoRoot,
    "log",
    "--date=short",
    `--pretty=format:${format}`,
    "--",
    relDir.length === 0 ? "." : relDir,
  ];

  let raw: string;
  try {
    if (runner) {
      raw = runner(args);
    } else {
      raw = execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    }
  } catch {
    return [];
  }

  return raw
    .split(COMMIT_DELIM)
    .map((chunk) => chunk.trim())
    .filter((c) => c.length > 0)
    .map((chunk) => {
      const [sha = "", shortSha = "", date = "", subject = "", body = ""] = chunk.split(FIELD_DELIM);
      return { sha, shortSha, date, subject, body };
    });
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

interface ComposeOptions {
  repoRoot: string;
  packageName: string;
  packageDir: string;
  manifests: ManifestRecord[];
  commits: GitCommit[];
}

/**
 * Build the version-blocks for a single package by merging manifest timeline
 * with conventional-commit-classified git history.
 *
 * Version inference for commits:
 *   - Subjects matching /v?(\d+\.\d+\.\d+(?:-[^\s]+)?)/ pin to that version.
 *   - Untagged commits land in an "Unreleased" block at the top.
 *   - Manifest entries land in the version named by their `since` field.
 */
export function composeChangelog(opts: ComposeOptions): ChangelogPackage {
  const { repoRoot, packageName, packageDir, manifests, commits } = opts;

  const versionMap = new Map<string, ChangelogVersionBlock>();
  const ensure = (version: string): ChangelogVersionBlock => {
    let block = versionMap.get(version);
    if (!block) {
      block = { version, entries: [] };
      versionMap.set(version, block);
    }
    return block;
  };

  // 1) Manifest-derived "Added" / "Deprecated" entries — anchored to `since`.
  for (const rec of manifests) {
    const m = rec.manifest;
    const since = typeof m.since === "string" ? m.since : null;
    if (!since) continue;
    const block = ensure(since);
    block.entries.push({
      category: "Added",
      text: m.description
        ? `${m.name} — ${String(m.description)}`
        : `${m.name}`,
      source: "manifest",
      component: m.name,
    });
    const isDeprecated =
      m.status === "deprecated" ||
      (typeof m.deprecated === "object" && m.deprecated !== null);
    if (isDeprecated) {
      const note =
        (typeof m.deprecated === "object" && m.deprecated && "note" in m.deprecated
          ? String((m.deprecated as { note?: unknown }).note ?? "")
          : "") || (m.deprecatedNote as string | undefined) || "deprecated";
      block.entries.push({
        category: "Deprecated",
        text: `${m.name} — ${note}`,
        source: "manifest",
        component: m.name,
      });
    }
  }

  // 2) Git-derived entries.
  const versionRe = /v?(\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?)/;
  for (const c of commits) {
    if (!c.subject) continue;
    if (isMergeOrNoise(c.subject)) continue;
    const { category, description, breaking } = classifyCommit(c.subject);
    const versionMatch = versionRe.exec(c.subject);
    const targetVersion = versionMatch ? versionMatch[1] : "Unreleased";
    const block = ensure(targetVersion);
    const display = breaking ? `${description} (BREAKING)` : description;
    block.entries.push({
      category,
      text: display,
      source: c.shortSha || c.sha.slice(0, 7),
      date: c.date,
    });
    if (block.date == null || (c.date && c.date > block.date)) {
      block.date = c.date;
    }
  }

  // Sort: Unreleased first, then semver desc.
  const versions = Array.from(versionMap.values()).sort(compareVersionBlocks);

  // Dedup + stable order inside each version.
  for (const block of versions) {
    block.entries = dedupEntries(block.entries);
    block.entries.sort((a, b) => {
      const co = categoryOrder(a.category) - categoryOrder(b.category);
      if (co !== 0) return co;
      return a.text.localeCompare(b.text);
    });
  }

  return {
    package: packageName,
    packageDir: toPosix(path.relative(repoRoot, packageDir) || "."),
    versions,
  };
}

function isMergeOrNoise(subject: string): boolean {
  if (/^Merge (pull request|branch|remote-tracking)/i.test(subject)) return true;
  if (/^Initial commit$/i.test(subject.trim())) return true;
  return false;
}

function dedupEntries(entries: ChangelogEntry[]): ChangelogEntry[] {
  const seen = new Set<string>();
  const out: ChangelogEntry[] = [];
  for (const e of entries) {
    const key = `${e.category}::${e.text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

function categoryOrder(c: ChangelogCategory): number {
  switch (c) {
    case "Added":
      return 0;
    case "Changed":
      return 1;
    case "Deprecated":
      return 2;
    case "Removed":
      return 3;
    case "Fixed":
      return 4;
    default:
      return 5;
  }
}

function compareVersionBlocks(
  a: ChangelogVersionBlock,
  b: ChangelogVersionBlock,
): number {
  if (a.version === "Unreleased" && b.version !== "Unreleased") return -1;
  if (b.version === "Unreleased" && a.version !== "Unreleased") return 1;
  return -compareSemver(a.version, b.version);
}

function compareSemver(a: string, b: string): number {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  for (let i = 0; i < 3; i++) {
    const da = pa.core[i] ?? 0;
    const db = pb.core[i] ?? 0;
    if (da !== db) return da - db;
  }
  if (pa.pre && !pb.pre) return -1;
  if (!pa.pre && pb.pre) return 1;
  if (pa.pre && pb.pre) return pa.pre.localeCompare(pb.pre);
  return 0;
}

function parseSemver(v: string): { core: number[]; pre?: string } {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(v);
  if (!m) return { core: [0, 0, 0] };
  return {
    core: [Number(m[1]), Number(m[2]), Number(m[3])],
    pre: m[4],
  };
}

// ---------------------------------------------------------------------------
// Seeding — anchor a derived history to the package's current version
// ---------------------------------------------------------------------------

const SEMVER_LIKE_RE = /^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/;

/**
 * Prepare a composed changelog for use as the initial hand-maintained
 * `CHANGELOG.md` seed. The "Unreleased" bucket and any version blocks ABOVE
 * the package's current version (stray semver tokens picked up from
 * monorepo-wide commit subjects about other packages) are folded into a
 * single block labelled with the current `package.json` version, so the
 * top-most `## X.Y.Z` heading always matches the released version
 * (consistency-version gate contract). Blocks at or below the current
 * version are kept intact. Returns the input unchanged when no valid
 * current version is supplied or there is nothing to anchor.
 */
export function seedChangelogVersions(
  pkg: ChangelogPackage,
  currentVersion: string | undefined,
): ChangelogPackage {
  if (!currentVersion || !SEMVER_LIKE_RE.test(currentVersion)) return pkg;

  const toMerge: ChangelogVersionBlock[] = [];
  const keep: ChangelogVersionBlock[] = [];
  for (const block of pkg.versions) {
    if (
      block.version === "Unreleased" ||
      block.version === currentVersion ||
      compareSemver(block.version, currentVersion) > 0
    ) {
      toMerge.push(block);
    } else {
      keep.push(block);
    }
  }
  if (toMerge.length === 0) return pkg;

  const entries = dedupEntries(toMerge.flatMap((b) => b.entries));
  entries.sort((a, b) => {
    const co = categoryOrder(a.category) - categoryOrder(b.category);
    if (co !== 0) return co;
    return a.text.localeCompare(b.text);
  });
  let date: string | undefined;
  for (const b of toMerge) {
    if (b.date && (!date || b.date > date)) date = b.date;
  }

  const anchored: ChangelogVersionBlock = { version: currentVersion, date, entries };
  const versions = [anchored, ...keep].sort(compareVersionBlocks);
  return { ...pkg, versions };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export interface RenderChangelogOptions {
  /**
   * When true, render the initial CHANGELOG.md seed header (derived from git
   * history once, hand-maintained afterwards) instead of the do-not-edit
   * header used for the .generated.md sibling.
   */
  seeded?: boolean;
}

export function renderChangelog(
  pkg: ChangelogPackage,
  opts: RenderChangelogOptions = {},
): string {
  const lines: string[] = [];
  lines.push(`# Changelog — ${pkg.package}`);
  lines.push("");
  if (opts.seeded) {
    lines.push(
      "<!-- Seeded from git history by scripts/build-docs/generate-changelog.ts (initial generation). -->",
    );
    lines.push(
      "<!-- This file is hand-maintained from this point on — add an entry at the top for each release. -->",
    );
  } else {
    lines.push("> Auto-generated by `scripts/build-docs/generate-changelog.ts`.");
    lines.push("> Do not edit by hand — author commits with conventional prefixes instead.");
  }
  lines.push("");

  if (pkg.versions.length === 0) {
    lines.push("_No history yet._");
    lines.push("");
    return lines.join("\n");
  }

  for (const block of pkg.versions) {
    const header = block.date ? `## ${block.version} — ${block.date}` : `## ${block.version}`;
    lines.push(header);
    lines.push("");

    if (block.entries.length === 0) {
      lines.push("_No changes recorded._");
      lines.push("");
      continue;
    }

    const grouped = groupBy(block.entries, (e) => e.category);
    const order: ChangelogCategory[] = [
      "Added",
      "Changed",
      "Deprecated",
      "Removed",
      "Fixed",
    ];
    for (const cat of order) {
      const items = grouped.get(cat);
      if (!items || items.length === 0) continue;
      lines.push(`### ${cat}`);
      lines.push("");
      for (const e of items) {
        const tag = e.source === "manifest" ? "manifest" : e.source;
        lines.push(`- ${e.text} _(${tag})_`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Workspace discovery (per-package buckets)
// ---------------------------------------------------------------------------

export interface WorkspacePackage {
  name: string;
  dir: string;
  /** Current package.json version — anchors the seeded CHANGELOG.md. */
  version?: string;
}

async function discoverWorkspaces(repoRoot: string): Promise<WorkspacePackage[]> {
  const pkgFiles = await fg(["packages/*/package.json", "apps/*/package.json"], {
    cwd: repoRoot,
    absolute: true,
    ignore: ["**/node_modules/**"],
  });
  const out: WorkspacePackage[] = [];
  for (const file of pkgFiles) {
    try {
      const pkg = (await fs.readJson(file)) as { name?: string; version?: string };
      if (pkg && typeof pkg.name === "string") {
        out.push({
          name: pkg.name,
          dir: toPosix(path.dirname(file)),
          version: typeof pkg.version === "string" ? pkg.version : undefined,
        });
      }
    } catch {
      // ignore malformed package.json
    }
  }
  return out;
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function bucketManifestsByPackage(
  manifests: ManifestRecord[],
): Map<string, ManifestRecord[]> {
  const buckets = new Map<string, ManifestRecord[]>();
  for (const rec of manifests) {
    const list = buckets.get(rec.package) ?? [];
    list.push(rec);
    buckets.set(rec.package, list);
  }
  return buckets;
}

// ---------------------------------------------------------------------------
// Generator class
// ---------------------------------------------------------------------------

export interface ChangelogGeneratorOptions {
  /** Limit to a single workspace package name. */
  packageFilter?: string;
  /** Inject a custom git runner — tests use this to avoid touching the real repo. */
  gitRunner?: (args: string[]) => string;
  /** Override workspace discovery — tests use this. */
  workspaces?: WorkspacePackage[];
}

export class ChangelogGenerator extends Generator {
  override name = "generate-changelog";

  constructor(private readonly opts: ChangelogGeneratorOptions = {}) {
    super();
  }

  override async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const log = ctx.logger;
    const workspaces =
      this.opts.workspaces ?? (await discoverWorkspaces(ctx.repoRoot));
    const buckets = bucketManifestsByPackage(ctx.manifests);

    const writes: GeneratorWrite[] = [];
    for (const ws of workspaces) {
      if (this.opts.packageFilter && ws.name !== this.opts.packageFilter) continue;

      const manifests = buckets.get(ws.name) ?? [];
      const commits = readPackageCommits({
        repoRoot: ctx.repoRoot,
        packageDir: ws.dir,
        runner: this.opts.gitRunner,
      });

      if (manifests.length === 0 && commits.length === 0) {
        log.warn(`[${this.name}] skipping ${ws.name} (no manifests, no commits)`);
        continue;
      }

      const composed = composeChangelog({
        repoRoot: ctx.repoRoot,
        packageName: ws.name,
        packageDir: ws.dir,
        manifests,
        commits,
      });

      // Seed contract: when the package has no hand-authored CHANGELOG.md at
      // all, write the derived changelog AS CHANGELOG.md (one-time seed,
      // anchored to the package's current version). Otherwise keep the
      // .generated.md sibling and never touch the hand-authored file.
      const handAuthoredPath = path.join(ws.dir, "CHANGELOG.md");
      const hasHandAuthored = await fs.pathExists(handAuthoredPath);

      let content: string;
      let outPath: string;
      if (hasHandAuthored) {
        content = renderChangelog(composed);
        outPath = toPosix(path.join(ws.dir, "CHANGELOG.generated.md"));
      } else {
        const seeded = seedChangelogVersions(composed, ws.version);
        content = renderChangelog(seeded, { seeded: true });
        outPath = toPosix(handAuthoredPath);
      }
      writes.push({ path: outPath, content });
      ctx.outputs.set(outPath, content);
      log.info(
        `[${this.name}] ${ws.name}: ${composed.versions.length} versions, ${composed.versions.reduce((n, v) => n + v.entries.length, 0)} entries`,
      );
    }

    return { writes };
  }
}

// Default export — programmatic API as a singleton with reasonable defaults.
const generator = new ChangelogGenerator();
export default generator;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface CliArgs {
  packageFilter?: string;
  json: boolean;
  write: boolean;
  repoRoot: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    json: false,
    write: false,
    repoRoot: process.cwd(),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a === "--write") args.write = true;
    else if (a === "--package") args.packageFilter = argv[++i];
    else if (a === "--repo-root") args.repoRoot = argv[++i];
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return args;
}

function printHelp(): void {
  const text = [
    "Usage: tsx scripts/build-docs/generate-changelog.ts [options]",
    "",
    "Options:",
    "  --package <name>   Limit to a single workspace package",
    "  --write            Persist CHANGELOG.generated.md to disk (default: dry run)",
    "  --json             Emit a JSON summary to stdout",
    "  --repo-root <dir>  Repo root (default: cwd)",
    "  -h, --help         Show this message",
  ].join("\n");
  // eslint-disable-next-line no-console
  console.log(text);
}

async function loadAllManifests(repoRoot: string, logger: Logger): Promise<ManifestRecord[]> {
  const manifestFiles = await fg("packages/**/src/**/*.manifest.ts", {
    cwd: repoRoot,
    absolute: true,
    ignore: ["**/node_modules/**", "**/dist/**"],
  });
  const { readManifest } = await import("./_lib/generator-base.js");
  const out: ManifestRecord[] = [];
  for (const file of manifestFiles) {
    try {
      const rec = await readManifest(file);
      if (rec) out.push(rec);
    } catch (err) {
      logger.warn(`failed to read manifest ${file}: ${(err as Error).message}`);
    }
  }
  return out;
}

async function run(argv: string[] = process.argv.slice(2)): Promise<number> {
  const args = parseArgs(argv);
  const logger = createLogger("changelog");
  const repoRoot = path.resolve(args.repoRoot);

  let manifests: ManifestRecord[] = [];
  try {
    manifests = await loadAllManifests(repoRoot, logger);
  } catch (err) {
    logger.error(`manifest scan failed: ${(err as Error).message}`);
    return 1;
  }

  const generator = new ChangelogGenerator({ packageFilter: args.packageFilter });
  const ctx: GeneratorContext = {
    repoRoot,
    manifests,
    outputs: new Map<string, string>(),
    logger,
  };

  let result: GeneratorResult;
  try {
    result = await generator.run(ctx);
  } catch (err) {
    logger.error(`generator failed: ${(err as Error).message}`);
    if (args.json) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ ok: false, error: (err as Error).message }, null, 2));
    }
    return 1;
  }

  if (args.write) {
    for (const w of result.writes) {
      await writeOutput(w.path, w.content);
    }
    logger.success(`wrote ${result.writes.length} CHANGELOG.generated.md file(s)`);
  } else {
    logger.info(
      `dry run — ${result.writes.length} file(s) would be written (pass --write to persist)`,
    );
  }

  if (args.json) {
    const summary = {
      ok: true,
      repoRoot,
      writes: result.writes.map((w) => ({ path: w.path, bytes: Buffer.byteLength(w.content, "utf8") })),
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(summary, null, 2));
  } else if (!args.write) {
    for (const w of result.writes) {
      defaultLogger.info(pc.dim(`would write: ${w.path}`));
    }
  }

  return 0;
}

// CLI guard — only execute when invoked directly via tsx / node.
const invokedFile = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedFile) {
  run().then(
    (code) => process.exit(code),
    (err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    },
  );
}

// Re-export for callers that prefer the named API.
export { run as runCli };

// Trivial usage of fileURLToPath so the import stays referenced under
// "noUnusedLocals" strictness in projects that opt in.
void fileURLToPath;
