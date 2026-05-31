/**
 * generate-readme-package
 *
 * For each workspace package present in the manifest set, emit a README at
 *   packages/<name>/README.generated.md
 *
 * Sections (in order):
 *   1. Title + badge row (npm version, license, bundle size when available)
 *   2. Description (from package.json)
 *   3. Install snippet (npm / pnpm / yarn)
 *   4. Quick start (synthesised from the package's first stable component)
 *   5. Components table (auto from manifests in this package)
 *   6. API stability commitments
 *   7. Links (homepage, repo, license, changelog)
 *
 * Safety: NEVER overwrites a hand-authored README.md. Always writes
 *   README.generated.md alongside.
 */

import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  Generator,
  type GeneratorContext,
  type GeneratorResult,
  type ManifestRecord,
  readManifest,
  writeOutput,
} from "./_lib/generator-base.js";
import { createLogger, defaultLogger, type Logger } from "./_lib/logger.js";
import { findComponentDirs } from "./_lib/scan-fs.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PackageJsonLike {
  name?: string;
  version?: string;
  description?: string;
  license?: string;
  homepage?: string;
  repository?: string | { url?: string; type?: string };
  bugs?: string | { url?: string };
}

export interface PackageReadmeInput {
  packageName: string;
  packageDir: string;
  packageJson: PackageJsonLike;
  manifests: ManifestRecord[];
}

export interface PackageReadmeOutput {
  /** Absolute POSIX path to README.generated.md */
  path: string;
  /** Rendered markdown content. */
  content: string;
}

export interface GenerateReadmePackageOptions {
  repoRoot: string;
  /**
   * When omitted, the generator will scan the repo for manifests itself.
   */
  manifests?: ManifestRecord[];
  /**
   * When true, do not write files; just return outputs. CLI uses false.
   */
  dryRun?: boolean;
  logger?: Logger;
}

export interface GenerateReadmePackageResult {
  outputs: PackageReadmeOutput[];
  /** Packages skipped because no manifests live under them. */
  skippedPackages: string[];
  /** Packages skipped because no package.json could be parsed. */
  failedPackages: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function repoUrl(pkg: PackageJsonLike): string | undefined {
  if (typeof pkg.repository === "string") return pkg.repository;
  if (pkg.repository && typeof pkg.repository === "object") {
    return pkg.repository.url;
  }
  return undefined;
}

function escapeBadgeSegment(s: string): string {
  // shields.io escaping: dash -> --, underscore -> __, space -> _
  return s.replace(/-/g, "--").replace(/_/g, "__").replace(/ /g, "_");
}

function badgeRow(pkg: PackageJsonLike): string[] {
  const lines: string[] = [];
  if (pkg.name) {
    const n = encodeURIComponent(pkg.name);
    lines.push(
      `[![npm version](https://img.shields.io/npm/v/${n}.svg)](https://www.npmjs.com/package/${n})`,
    );
    lines.push(
      `[![bundle size](https://img.shields.io/bundlephobia/minzip/${n}.svg)](https://bundlephobia.com/package/${n})`,
    );
  }
  if (pkg.license) {
    const lic = escapeBadgeSegment(pkg.license);
    lines.push(
      `[![license](https://img.shields.io/badge/license-${lic}-blue.svg)](./LICENSE)`,
    );
  }
  return lines;
}

function installSnippet(pkgName: string): string {
  return [
    "```bash",
    `npm install ${pkgName}`,
    `# or`,
    `pnpm add ${pkgName}`,
    `# or`,
    `yarn add ${pkgName}`,
    "```",
  ].join("\n");
}

function quickStart(pkgName: string, manifests: ManifestRecord[]): string {
  const firstStable =
    manifests.find((m) => m.manifest.status === "stable") ?? manifests[0];
  if (!firstStable) {
    return [
      "```tsx",
      `import * as ${camelize(safePkgIdent(pkgName))} from "${pkgName}";`,
      "```",
    ].join("\n");
  }
  const c = firstStable.manifest.name;
  return [
    "```tsx",
    `import { ${c} } from "${pkgName}";`,
    "",
    `export function Example() {`,
    `  return <${c} />;`,
    `}`,
    "```",
  ].join("\n");
}

function safePkgIdent(pkgName: string): string {
  return pkgName.replace(/^@/, "").replace(/[^a-zA-Z0-9]+/g, "-");
}

function camelize(s: string): string {
  return s
    .split("-")
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "");
}

function componentsTable(manifests: ManifestRecord[]): string {
  if (manifests.length === 0) {
    return "_No components registered yet._";
  }
  const rows = [...manifests].sort((a, b) =>
    a.manifest.name.localeCompare(b.manifest.name),
  );
  const header = "| Component | Status | Since | Category | Description |";
  const sep = "| --- | --- | --- | --- | --- |";
  const body = rows.map((r) => {
    const m = r.manifest;
    const status = String(m.status ?? "—");
    const since = String(m.since ?? "—");
    const category = String(m.category ?? "—");
    const desc = (m.description ?? "").replace(/\|/g, "\\|").replace(/\n+/g, " ");
    return `| \`${m.name}\` | ${status} | ${since} | ${category} | ${desc} |`;
  });
  return [header, sep, ...body].join("\n");
}

function apiStabilitySection(manifests: ManifestRecord[]): string {
  const counts: Record<string, number> = {};
  for (const r of manifests) {
    const k = String(
      (r.manifest as { apiStability?: string }).apiStability ?? "evolving",
    );
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const bullets: string[] = [];
  if (counts.stable) {
    bullets.push(
      `- **stable** (${counts.stable}): semver-major required for breaking changes.`,
    );
  }
  if (counts.evolving) {
    bullets.push(
      `- **evolving** (${counts.evolving}): minor-version breakage possible with a deprecation cycle.`,
    );
  }
  if (counts.unstable) {
    bullets.push(
      `- **unstable** (${counts.unstable}): may break at any release. Pin exact versions.`,
    );
  }
  if (bullets.length === 0) {
    bullets.push("- No components published yet.");
  }
  return [
    "API stability is declared per component in its manifest. The package follows semver:",
    "",
    ...bullets,
  ].join("\n");
}

function linksSection(
  packageDir: string,
  pkg: PackageJsonLike,
): string {
  const lines: string[] = [];
  if (pkg.homepage) lines.push(`- [Homepage](${pkg.homepage})`);
  const repo = repoUrl(pkg);
  if (repo) lines.push(`- [Repository](${repo})`);
  // Local file links
  if (fs.pathExistsSync(path.join(packageDir, "LICENSE"))) {
    lines.push(`- [License](./LICENSE)`);
  }
  if (fs.pathExistsSync(path.join(packageDir, "CHANGELOG.md"))) {
    lines.push(`- [Changelog](./CHANGELOG.md)`);
  }
  return lines.length > 0 ? lines.join("\n") : "_No external links yet._";
}

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

/**
 * Render a complete README for a single package.
 * Exported for unit-testing without any filesystem access.
 */
export function renderPackageReadme(input: PackageReadmeInput): string {
  const { packageName, packageDir, packageJson, manifests } = input;
  const title = `# ${packageName}`;
  const badges = badgeRow(packageJson).join("\n");
  const description = packageJson.description ?? "";

  const sections: string[] = [
    title,
    "",
    "<!-- generated by scripts/build-docs/generate-readme-package.ts -->",
    "<!-- safe to delete and regenerate; never edit by hand -->",
    "",
  ];

  if (badges.length > 0) {
    sections.push(badges, "");
  }

  if (description.length > 0) {
    sections.push(description, "");
  }

  sections.push(
    "## Install",
    "",
    installSnippet(packageName),
    "",
    "## Quick start",
    "",
    quickStart(packageName, manifests),
    "",
    "## Components",
    "",
    componentsTable(manifests),
    "",
    "## API stability",
    "",
    apiStabilitySection(manifests),
    "",
    "## Links",
    "",
    linksSection(packageDir, packageJson),
    "",
  );

  return sections.join("\n");
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

async function loadPackageJson(
  packageDir: string,
): Promise<PackageJsonLike | null> {
  const p = path.join(packageDir, "package.json");
  if (!(await fs.pathExists(p))) return null;
  try {
    return (await fs.readJson(p)) as PackageJsonLike;
  } catch {
    return null;
  }
}

async function discoverPackages(repoRoot: string): Promise<string[]> {
  const packagesDir = path.join(repoRoot, "packages");
  if (!(await fs.pathExists(packagesDir))) return [];
  const entries = await fs.readdir(packagesDir);
  const dirs: string[] = [];
  for (const entry of entries) {
    const full = path.join(packagesDir, entry);
    const stat = await fs.stat(full);
    if (stat.isDirectory()) dirs.push(toPosix(full));
  }
  return dirs.sort();
}

function groupManifestsByPackage(
  manifests: ManifestRecord[],
): Map<string, ManifestRecord[]> {
  const map = new Map<string, ManifestRecord[]>();
  for (const m of manifests) {
    const key = m.package;
    const list = map.get(key) ?? [];
    list.push(m);
    map.set(key, list);
  }
  return map;
}

async function scanManifestsForRoot(
  repoRoot: string,
  logger: Logger,
): Promise<ManifestRecord[]> {
  const dirs = await findComponentDirs(repoRoot);
  const out: ManifestRecord[] = [];
  for (const dir of dirs) {
    const tsxFiles = (await fs.readdir(dir)).filter(
      (f) => f.endsWith(".tsx") && !f.includes(".stories.") && !f.includes(".test."),
    );
    for (const tsx of tsxFiles) {
      const rec = await readManifest(path.join(dir, tsx));
      if (rec) out.push(rec);
      else
        logger.warn(
          `no manifest loaded for ${toPosix(path.join(dir, tsx))} (skipped)`,
        );
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Programmatic entry point. Returns one PackageReadmeOutput per package that
 * has at least one manifest (or, if includeEmpty, also packages with none).
 */
export async function generateReadmePackage(
  opts: GenerateReadmePackageOptions,
): Promise<GenerateReadmePackageResult> {
  const logger = opts.logger ?? createLogger("readme");
  const repoRoot = opts.repoRoot;

  const manifests =
    opts.manifests ?? (await scanManifestsForRoot(repoRoot, logger));

  const packageDirs = await discoverPackages(repoRoot);
  const grouped = groupManifestsByPackage(manifests);

  const outputs: PackageReadmeOutput[] = [];
  const skippedPackages: string[] = [];
  const failedPackages: string[] = [];

  for (const packageDir of packageDirs) {
    const pkgJson = await loadPackageJson(packageDir);
    if (!pkgJson || typeof pkgJson.name !== "string") {
      failedPackages.push(toPosix(packageDir));
      continue;
    }
    const pkgManifests = grouped.get(pkgJson.name) ?? [];
    if (pkgManifests.length === 0) {
      skippedPackages.push(pkgJson.name);
      continue;
    }
    const content = renderPackageReadme({
      packageName: pkgJson.name,
      packageDir: toPosix(packageDir),
      packageJson: pkgJson,
      manifests: pkgManifests,
    });
    const outPath = toPosix(path.join(packageDir, "README.generated.md"));
    outputs.push({ path: outPath, content });
  }

  if (!opts.dryRun) {
    for (const o of outputs) {
      await writeOutput(o.path, o.content);
      logger.success(`wrote ${o.path}`);
    }
  }

  return { outputs, skippedPackages, failedPackages };
}

// ---------------------------------------------------------------------------
// Generator base wrapper (for orchestrator use)
// ---------------------------------------------------------------------------

export class GenerateReadmePackageGenerator extends Generator {
  name = "generate-readme-package";

  async run(ctx: GeneratorContext): Promise<GeneratorResult> {
    const res = await generateReadmePackage({
      repoRoot: ctx.repoRoot,
      manifests: ctx.manifests,
      dryRun: true,
      logger: ctx.logger,
    });
    return {
      writes: res.outputs.map((o) => ({ path: o.path, content: o.content })),
    };
  }
}

export default GenerateReadmePackageGenerator;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function run(argv: string[]): Promise<number> {
  const json = argv.includes("--json");
  const dryRun = argv.includes("--dry-run");
  const repoRootArg = argv.find((a) => a.startsWith("--root="));
  const repoRoot = repoRootArg
    ? path.resolve(repoRootArg.slice("--root=".length))
    : process.cwd();

  const logger = json ? createLogger("readme") : defaultLogger;
  try {
    const result = await generateReadmePackage({
      repoRoot,
      dryRun,
      logger,
    });
    if (json) {
      const payload = {
        ok: true,
        wrote: result.outputs.map((o) => o.path),
        skipped: result.skippedPackages,
        failed: result.failedPackages,
      };
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(payload, null, 2));
    } else {
      logger.success(
        `Generated ${result.outputs.length} README.generated.md ` +
          `(${result.skippedPackages.length} packages skipped, ` +
          `${result.failedPackages.length} failed)`,
      );
    }
    return 0;
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
  void run(process.argv.slice(2)).then((code) => process.exit(code));
}

// re-export for convenience in tests
export { fileURLToPath };
