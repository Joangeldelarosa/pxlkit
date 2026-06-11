/**
 * generate-readme-root
 *
 * Emits a root README at `README.generated.md` alongside the hand-authored
 * `README.md`. Content is derived from the npm workspaces declared in the root
 * `package.json` (no manual list to maintain):
 *
 *   1. Hero — title, tagline, project description
 *   2. Badge row — license, npm version (root), coverage (when summary available)
 *   3. Monorepo map — every `packages/*` and `apps/*` workspace with a one-liner
 *      from each workspace `package.json`'s `description` field
 *   4. Quick links — homepage, repository, license, contributing, changelog
 *
 * Marker contract: when the hand-authored root `README.md` contains the
 *   <!-- WORKSPACES:START --> ... <!-- WORKSPACES:END -->
 * pair, the generator owns ONLY the region between the markers and rewrites
 * it in place with the workspace map table (markers stay, everything else is
 * preserved byte-for-byte). This satisfies gate 16-monorepo-map.
 *
 * SAFE: when the markers are absent, `README.md` is never touched — the full
 * render goes to `README.generated.md`.
 *
 * CLI:
 *   tsx scripts/build-docs/generate-root-readme.ts
 *   tsx scripts/build-docs/generate-root-readme.ts --dry-run
 *   tsx scripts/build-docs/generate-root-readme.ts --json
 *   tsx scripts/build-docs/generate-root-readme.ts --root=./
 */

import fs from "fs-extra";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import fg from "fast-glob";

import {
  Generator,
  type GeneratorContext,
  type GeneratorResult,
  writeOutput,
} from "./_lib/generator-base.js";
import { createLogger, defaultLogger, type Logger } from "./_lib/logger.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RootPackageJsonLike {
  name?: string;
  version?: string;
  description?: string;
  license?: string;
  homepage?: string;
  repository?: string | { url?: string; type?: string };
  workspaces?: string[] | { packages?: string[] };
}

export interface WorkspacePackageJsonLike {
  name?: string;
  version?: string;
  description?: string;
  private?: boolean;
  license?: string;
}

export interface WorkspaceEntry {
  /** "@scope/name" from the workspace package.json. */
  name: string;
  /** Workspace version, when available. */
  version?: string;
  /** One-liner description from package.json. */
  description: string;
  /** Absolute POSIX directory of the workspace. */
  dir: string;
  /** Repo-relative POSIX path (e.g. "packages/ui-kit"). */
  relDir: string;
  /** "packages" | "apps" | other top-level workspace bucket. */
  bucket: string;
  /** True when `private: true` in package.json. */
  isPrivate: boolean;
}

export interface CoverageSummaryLike {
  total?: {
    lines?: { pct?: number };
    statements?: { pct?: number };
    functions?: { pct?: number };
    branches?: { pct?: number };
  };
}

export interface RenderRootReadmeInput {
  rootPkg: RootPackageJsonLike;
  workspaces: WorkspaceEntry[];
  /** Coverage from any vitest/jest summary; optional. */
  coverage?: CoverageSummaryLike;
  /** Override generation timestamp; defaults to now. */
  generatedAt?: Date;
}

export interface GenerateRootReadmeOptions {
  repoRoot: string;
  /** When true, return content only and do not touch fs. */
  dryRun?: boolean;
  /** Override coverage path (resolved relative to repoRoot when relative). */
  coverageSummaryPath?: string;
  logger?: Logger;
}

export interface GenerateRootReadmeResult {
  ok: boolean;
  /** Absolute POSIX path of the written/planned file. */
  path: string;
  content: string;
  workspaces: WorkspaceEntry[];
  errors: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function escapeBadge(s: string): string {
  return s.replace(/-/g, "--").replace(/_/g, "__").replace(/ /g, "_");
}

function repoUrl(pkg: RootPackageJsonLike): string | undefined {
  if (typeof pkg.repository === "string") return pkg.repository;
  if (pkg.repository && typeof pkg.repository === "object") {
    return pkg.repository.url;
  }
  return undefined;
}

function workspacePatterns(pkg: RootPackageJsonLike): string[] {
  if (!pkg.workspaces) return [];
  if (Array.isArray(pkg.workspaces)) return pkg.workspaces;
  if (Array.isArray(pkg.workspaces.packages)) return pkg.workspaces.packages;
  return [];
}

function bucketOf(relDir: string): string {
  const head = relDir.split("/")[0] ?? "";
  return head || "root";
}

function oneLine(s: string | undefined): string {
  if (!s) return "";
  return s.replace(/\s+/g, " ").trim();
}

function escapeCell(s: string): string {
  return s.replace(/\|/g, "\\|");
}

// ---------------------------------------------------------------------------
// Workspace discovery
// ---------------------------------------------------------------------------

export async function discoverWorkspaces(
  repoRoot: string,
  rootPkg: RootPackageJsonLike,
  logger: Logger = defaultLogger,
): Promise<WorkspaceEntry[]> {
  const patterns = workspacePatterns(rootPkg);
  if (patterns.length === 0) return [];

  // fast-glob accepts the patterns directly with onlyDirectories.
  const dirs = await fg(patterns, {
    cwd: repoRoot,
    onlyDirectories: true,
    absolute: true,
    suppressErrors: true,
    deep: 2,
  });

  const entries: WorkspaceEntry[] = [];
  for (const absDir of dirs) {
    const pkgJsonPath = path.join(absDir, "package.json");
    if (!(await fs.pathExists(pkgJsonPath))) continue;

    let pkg: WorkspacePackageJsonLike;
    try {
      pkg = (await fs.readJson(pkgJsonPath)) as WorkspacePackageJsonLike;
    } catch (err) {
      logger.warn(
        `discoverWorkspaces: failed to read ${toPosix(pkgJsonPath)}: ${(err as Error).message}`,
      );
      continue;
    }
    if (!pkg.name) continue;

    const posixDir = toPosix(absDir);
    const relDir = toPosix(path.relative(repoRoot, absDir));
    entries.push({
      name: pkg.name,
      version: pkg.version,
      description: oneLine(pkg.description) || "_(no description)_",
      dir: posixDir,
      relDir,
      bucket: bucketOf(relDir),
      isPrivate: Boolean(pkg.private),
    });
  }

  entries.sort((a, b) => {
    if (a.bucket !== b.bucket) return a.bucket.localeCompare(b.bucket);
    return a.name.localeCompare(b.name);
  });

  return entries;
}

// ---------------------------------------------------------------------------
// Coverage
// ---------------------------------------------------------------------------

async function loadCoverage(
  repoRoot: string,
  override: string | undefined,
  logger: Logger,
): Promise<CoverageSummaryLike | undefined> {
  const candidate = override
    ? path.isAbsolute(override)
      ? override
      : path.join(repoRoot, override)
    : path.join(repoRoot, "coverage", "coverage-summary.json");
  if (!(await fs.pathExists(candidate))) return undefined;
  try {
    return (await fs.readJson(candidate)) as CoverageSummaryLike;
  } catch (err) {
    logger.warn(
      `loadCoverage: failed to read ${toPosix(candidate)}: ${(err as Error).message}`,
    );
    return undefined;
  }
}

export function coverageBadge(coverage?: CoverageSummaryLike): string | null {
  const pct = coverage?.total?.lines?.pct;
  if (typeof pct !== "number" || Number.isNaN(pct)) return null;
  const rounded = Math.round(pct * 10) / 10;
  let color = "red";
  if (rounded >= 90) color = "brightgreen";
  else if (rounded >= 80) color = "green";
  else if (rounded >= 70) color = "yellowgreen";
  else if (rounded >= 60) color = "yellow";
  else if (rounded >= 50) color = "orange";
  return `![coverage](https://img.shields.io/badge/coverage-${encodeURIComponent(
    `${rounded}%`,
  )}-${color}.svg)`;
}

// ---------------------------------------------------------------------------
// Marker-block contract (in-place fill of the hand-authored root README.md)
// ---------------------------------------------------------------------------

export const WORKSPACES_START_MARKER = "<!-- WORKSPACES:START -->";
export const WORKSPACES_END_MARKER = "<!-- WORKSPACES:END -->";

/**
 * Render the auto-managed workspace map block body (without the markers).
 * One row per workspace: repo-relative dir (linked), package name (npm link
 * for public packages, `_(private)_` tag otherwise), version, description.
 */
export function renderWorkspacesBlock(workspaces: WorkspaceEntry[]): string {
  const sorted = [...workspaces].sort((a, b) => a.relDir.localeCompare(b.relDir));
  const lines: string[] = [
    "<!-- auto-generated from the npm workspaces by scripts/build-docs/generate-root-readme.ts — edit workspace package.json files, then run `npm run docs:build`. -->",
    "",
    "| Workspace | Package | Version | Description |",
    "| --- | --- | --- | --- |",
  ];
  for (const w of sorted) {
    const pkgCell = w.isPrivate
      ? `\`${w.name}\` _(private)_`
      : `[\`${w.name}\`](https://www.npmjs.com/package/${w.name})`;
    const ver = w.version ? `\`${w.version}\`` : "—";
    lines.push(
      `| [\`${w.relDir}\`](./${w.relDir}) | ${pkgCell} | ${ver} | ${escapeCell(w.description)} |`,
    );
  }
  return lines.join("\n");
}

/**
 * Replace the marker-delimited block inside the hand-authored root README
 * with the generated workspace map. Returns the new file content, or `null`
 * when the markers are absent or malformed. Preserves the file's dominant
 * line ending and every byte outside the block.
 */
export function fillWorkspacesBlock(
  readme: string,
  workspaces: WorkspaceEntry[],
): string | null {
  const startIdx = readme.indexOf(WORKSPACES_START_MARKER);
  const endIdx = readme.indexOf(WORKSPACES_END_MARKER);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return null;
  const eol = readme.includes("\r\n") ? "\r\n" : "\n";
  const block = renderWorkspacesBlock(workspaces).split("\n").join(eol);
  const before = readme.slice(0, startIdx + WORKSPACES_START_MARKER.length);
  const after = readme.slice(endIdx);
  return `${before}${eol}${block}${eol}${after}`;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function badgeRow(
  rootPkg: RootPackageJsonLike,
  coverage?: CoverageSummaryLike,
): string[] {
  const out: string[] = [];
  if (rootPkg.license) {
    const lic = escapeBadge(rootPkg.license);
    out.push(`![license](https://img.shields.io/badge/license-${lic}-blue.svg)`);
  }
  if (rootPkg.name && !rootPkg.name.startsWith("@") && rootPkg.version) {
    // Only emit npm version badge for public root packages.
    out.push(
      `![npm version](https://img.shields.io/badge/version-${escapeBadge(
        rootPkg.version,
      )}-informational.svg)`,
    );
  }
  const cov = coverageBadge(coverage);
  if (cov) out.push(cov);
  return out;
}

function workspaceTable(
  entries: WorkspaceEntry[],
  bucket: string,
): string {
  const filtered = entries.filter((e) => e.bucket === bucket);
  if (filtered.length === 0) return "_No workspaces under this bucket._";
  const header = "| Package | Version | Description |";
  const sep = "| --- | --- | --- |";
  const rows = filtered.map((e) => {
    const ver = e.version ? `\`${e.version}\`` : "—";
    const priv = e.isPrivate ? " _(private)_" : "";
    return `| [\`${e.name}\`](./${e.relDir})${priv} | ${ver} | ${escapeCell(
      e.description,
    )} |`;
  });
  return [header, sep, ...rows].join("\n");
}

function linksSection(rootPkg: RootPackageJsonLike, repoRoot: string): string {
  const lines: string[] = [];
  if (rootPkg.homepage) lines.push(`- [Homepage](${rootPkg.homepage})`);
  const repo = repoUrl(rootPkg);
  if (repo) lines.push(`- [Repository](${repo})`);
  if (fs.pathExistsSync(path.join(repoRoot, "LICENSE"))) {
    lines.push(`- [License](./LICENSE)`);
  }
  if (fs.pathExistsSync(path.join(repoRoot, "CONTRIBUTING.md"))) {
    lines.push(`- [Contributing](./CONTRIBUTING.md)`);
  }
  if (fs.pathExistsSync(path.join(repoRoot, "CHANGELOG.md"))) {
    lines.push(`- [Changelog](./CHANGELOG.md)`);
  }
  return lines.length > 0 ? lines.join("\n") : "_No external links yet._";
}

/**
 * Pure renderer. No filesystem side effects beyond the `fs.pathExistsSync`
 * calls inside `linksSection` which guard local file references; tests can
 * exercise `renderRootReadme` with a synthetic input without touching disk
 * for the meaningful assertions (headings, tables, badges).
 */
export function renderRootReadme(input: RenderRootReadmeInput): string {
  const { rootPkg, workspaces, coverage } = input;
  const title = `# ${rootPkg.name ?? "monorepo"}`;
  const tagline = oneLine(rootPkg.description);
  const badges = badgeRow(rootPkg, coverage);

  const sections: string[] = [
    title,
    "",
    "<!-- generated by scripts/build-docs/generate-root-readme.ts -->",
    "<!-- safe to delete and regenerate; never edit by hand -->",
    "",
  ];

  if (badges.length > 0) {
    sections.push(badges.join(" "), "");
  }

  if (tagline.length > 0) {
    sections.push(tagline, "");
  }

  const buckets = Array.from(new Set(workspaces.map((w) => w.bucket))).sort();

  sections.push("## Monorepo map", "");
  if (buckets.length === 0) {
    sections.push("_No workspaces discovered._", "");
  } else {
    for (const bucket of buckets) {
      const heading = bucket.charAt(0).toUpperCase() + bucket.slice(1);
      sections.push(`### ${heading}`, "", workspaceTable(workspaces, bucket), "");
    }
  }

  sections.push(
    "## Links",
    "",
    linksSection(rootPkg, process.cwd()),
    "",
  );

  return sections.join("\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateRootReadme(
  opts: GenerateRootReadmeOptions,
): Promise<GenerateRootReadmeResult> {
  const logger = opts.logger ?? createLogger("readme-root");
  const repoRoot = opts.repoRoot;
  const errors: string[] = [];

  const rootPkgPath = path.join(repoRoot, "package.json");
  if (!(await fs.pathExists(rootPkgPath))) {
    const msg = `root package.json not found at ${toPosix(rootPkgPath)}`;
    return {
      ok: false,
      path: toPosix(path.join(repoRoot, "README.generated.md")),
      content: "",
      workspaces: [],
      errors: [msg],
    };
  }

  let rootPkg: RootPackageJsonLike;
  try {
    rootPkg = (await fs.readJson(rootPkgPath)) as RootPackageJsonLike;
  } catch (err) {
    const msg = `failed to parse root package.json: ${(err as Error).message}`;
    return {
      ok: false,
      path: toPosix(path.join(repoRoot, "README.generated.md")),
      content: "",
      workspaces: [],
      errors: [msg],
    };
  }

  const workspaces = await discoverWorkspaces(repoRoot, rootPkg, logger);
  const coverage = await loadCoverage(repoRoot, opts.coverageSummaryPath, logger);

  // Marker contract: when the hand-authored README.md declares the
  // WORKSPACES block, fill it in place instead of emitting a sibling.
  const readmePath = path.join(repoRoot, "README.md");
  let content: string | null = null;
  let outPath = toPosix(path.join(repoRoot, "README.generated.md"));
  if (await fs.pathExists(readmePath)) {
    const existing = await fs.readFile(readmePath, "utf8");
    const filled = fillWorkspacesBlock(existing, workspaces);
    if (filled !== null) {
      content = filled;
      outPath = toPosix(readmePath);
    }
  }
  if (content === null) {
    content = renderRootReadme({ rootPkg, workspaces, coverage });
  }

  if (!opts.dryRun) {
    try {
      await writeOutput(outPath, content);
      logger.success(`wrote ${outPath}`);
    } catch (err) {
      const msg = `failed to write ${outPath}: ${(err as Error).message}`;
      errors.push(msg);
      logger.error(msg);
      return { ok: false, path: outPath, content, workspaces, errors };
    }
  }

  return { ok: true, path: outPath, content, workspaces, errors };
}

// ---------------------------------------------------------------------------
// Generator base wrapper (for orchestrator use)
// ---------------------------------------------------------------------------

export class GenerateRootReadmeGenerator extends Generator {
  name = "generate-readme-root";

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const res = await generateRootReadme({
      repoRoot: ctx.repoRoot,
      dryRun: true,
      logger: ctx.logger,
    });
    return {
      writes: res.ok ? [{ path: res.path, content: res.content }] : [],
    };
  }
}

export default GenerateRootReadmeGenerator;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function run(argv: string[] = process.argv.slice(2)): Promise<number> {
  const json = argv.includes("--json");
  const dryRun = argv.includes("--dry-run") || argv.includes("--dry");
  const rootArg = argv.find((a) => a.startsWith("--root="));
  const repoRoot = rootArg
    ? path.resolve(rootArg.slice("--root=".length))
    : process.cwd();
  const coverageArg = argv.find((a) => a.startsWith("--coverage="));
  const coverageSummaryPath = coverageArg
    ? coverageArg.slice("--coverage=".length)
    : undefined;

  const logger = json ? createLogger("readme-root") : defaultLogger;

  try {
    const result = await generateRootReadme({
      repoRoot,
      dryRun,
      coverageSummaryPath,
      logger,
    });
    if (json) {
      const payload = {
        ok: result.ok,
        path: result.path,
        workspaces: result.workspaces.map((w) => ({
          name: w.name,
          version: w.version,
          bucket: w.bucket,
          relDir: w.relDir,
        })),
        errors: result.errors,
      };
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(payload, null, 2));
    } else if (result.ok) {
      logger.success(
        `Generated ${result.path} (${result.workspaces.length} workspaces)`,
      );
    } else {
      logger.error(result.errors.join("\n") || "unknown failure");
    }
    return result.ok ? 0 : 1;
  } catch (err) {
    const msg = (err as Error).message;
    if (json) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ ok: false, error: msg }, null, 2));
    } else {
      logger.error(msg);
    }
    return 1;
  }
}

const isMain =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  void run().then((code) => process.exit(code));
}

export { run };
