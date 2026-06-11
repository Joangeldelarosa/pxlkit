/**
 * Gate 6 — consistency-version.
 *
 * For each workspace package the auditor knows about, verifies that three
 * independent declarations of "current version" agree:
 *
 *   1. `package.json.version`
 *   2. The top-most `## X.Y.Z` heading in `CHANGELOG.md`
 *   3. The largest manifest `since` across that package's components
 *
 * Any divergence is a blocker — these three are the contract surface between
 * authoring (manifests), release notes (changelog) and consumer install
 * (npm metadata). They MUST stay aligned.
 */

import * as path from 'node:path';
import * as fs from 'fs-extra';

import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';

// ---------------------------------------------------------------------------
// Semver — local helpers (kept self-contained so this gate has no extra deps).
// ---------------------------------------------------------------------------

const SEMVER_REGEX =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export interface ParsedSemver {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
  raw: string;
}

export function parseSemver(input: string): ParsedSemver | null {
  const match = SEMVER_REGEX.exec(input.trim());
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
    raw: input.trim(),
  };
}

/** Compare two parsed semvers. Returns -1, 0 or 1. Prerelease < release. */
export function compareSemver(a: ParsedSemver, b: ParsedSemver): number {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  if (a.prerelease === b.prerelease) return 0;
  if (a.prerelease === null) return 1;
  if (b.prerelease === null) return -1;
  return a.prerelease < b.prerelease ? -1 : 1;
}

export function pickLargest(versions: ParsedSemver[]): ParsedSemver | null {
  if (versions.length === 0) return null;
  let best = versions[0]!;
  for (let i = 1; i < versions.length; i += 1) {
    const cand = versions[i]!;
    if (compareSemver(cand, best) > 0) best = cand;
  }
  return best;
}

// ---------------------------------------------------------------------------
// CHANGELOG.md — extract top-most `## X.Y.Z` heading.
// ---------------------------------------------------------------------------

const CHANGELOG_HEADING_REGEX = /^##\s+v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\b/m;

export function extractTopChangelogVersion(content: string): string | null {
  const match = CHANGELOG_HEADING_REGEX.exec(content);
  if (!match) return null;
  return match[1] ?? null;
}

// ---------------------------------------------------------------------------
// Manifest helpers.
// ---------------------------------------------------------------------------

interface ManifestLike {
  component?: string;
  source?: string;
  // `since` comes through Zod passthrough so it's typed as unknown here.
  since?: unknown;
  [key: string]: unknown;
}

function manifestBelongsToPackage(
  manifest: ManifestLike,
  packageDir: string,
): boolean {
  const src = typeof manifest.source === 'string' ? manifest.source : '';
  if (!src) return false;
  const normSrc = path.resolve(src);
  const normDir = path.resolve(packageDir);
  const rel = path.relative(normDir, normSrc);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

export function collectManifestSinceVersions(
  manifests: ManifestLike[],
  packageDir: string,
): { parsed: ParsedSemver[]; invalid: Array<{ component: string; since: string; source?: string }> } {
  const parsed: ParsedSemver[] = [];
  const invalid: Array<{ component: string; since: string; source?: string }> = [];
  for (const m of manifests) {
    if (!manifestBelongsToPackage(m, packageDir)) continue;
    const since = typeof m.since === 'string' ? m.since : null;
    if (since === null) continue;
    const sv = parseSemver(since);
    if (sv) {
      parsed.push(sv);
    } else {
      invalid.push({
        component: typeof m.component === 'string' ? m.component : '(unknown)',
        since,
        source: typeof m.source === 'string' ? m.source : undefined,
      });
    }
  }
  return { parsed, invalid };
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

interface PackageJsonShape {
  name?: string;
  version?: string;
}

export class ConsistencyVersionGate extends Gate {
  id = 6;
  name = 'consistency-version';
  description =
    "For each package: package.json.version === topmost entry of CHANGELOG.md === largest manifest.since across that package's components. Blocker on mismatch.";

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    if (ctx.packageJsons.length === 0) {
      // No packages discovered isn't a version mismatch — emit info but pass.
      return {
        name: this.name,
        passed: true,
        duration_ms: Date.now() - started,
        findings: [
          {
            severity: 'info',
            message:
              'no packages discovered in audit context — version-consistency gate has nothing to verify',
          },
        ],
      };
    }

    for (const pkg of ctx.packageJsons) {
      const pkgFindings = await this.checkPackage(ctx, pkg);
      findings.push(...pkgFindings);
    }

    if (findings.length === 0) {
      return gateOk(this.name, Date.now() - started);
    }
    return gateFail(this.name, findings, Date.now() - started);
  }

  private async checkPackage(
    ctx: AuditContext,
    pkg: { package: string; path: string },
  ): Promise<GateFinding[]> {
    const findings: GateFinding[] = [];
    const pkgDir = path.dirname(pkg.path);

    // ----- package.json.version -----
    let pkgVersionRaw: string | null = null;
    try {
      const pj = (await fs.readJson(pkg.path)) as PackageJsonShape;
      pkgVersionRaw = typeof pj.version === 'string' ? pj.version : null;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      findings.push({
        severity: 'major',
        file: pkg.path,
        component: pkg.package,
        message: `failed to read package.json: ${message}`,
        suggestion: 'ensure package.json is valid JSON and readable',
      });
      return findings;
    }

    if (!pkgVersionRaw) {
      findings.push({
        severity: 'blocker',
        file: pkg.path,
        component: pkg.package,
        message: 'package.json has no "version" field',
        suggestion: 'add a semver "version" entry to package.json',
      });
      return findings;
    }

    const pkgVersion = parseSemver(pkgVersionRaw);
    if (!pkgVersion) {
      findings.push({
        severity: 'blocker',
        file: pkg.path,
        component: pkg.package,
        message: `package.json version "${pkgVersionRaw}" is not valid semver`,
        suggestion: 'use a valid semver string (e.g. "1.2.3")',
      });
      return findings;
    }

    // ----- CHANGELOG.md top entry -----
    const changelogRef = ctx.changelogFiles.find((c) => c.package === pkg.package);
    let changelogVersion: ParsedSemver | null = null;
    if (!changelogRef) {
      findings.push({
        severity: 'blocker',
        file: path.join(pkgDir, 'CHANGELOG.md'),
        component: pkg.package,
        message: 'CHANGELOG.md missing for this package',
        suggestion: `create ${path.join(pkgDir, 'CHANGELOG.md')} with a top entry "## ${pkgVersionRaw} — <date>"`,
      });
    } else {
      let content = '';
      try {
        content = await fs.readFile(changelogRef.path, 'utf8');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        findings.push({
          severity: 'major',
          file: changelogRef.path,
          component: pkg.package,
          message: `failed to read CHANGELOG.md: ${message}`,
        });
        return findings;
      }
      const topRaw = extractTopChangelogVersion(content);
      if (!topRaw) {
        findings.push({
          severity: 'blocker',
          file: changelogRef.path,
          component: pkg.package,
          message: 'CHANGELOG.md has no recognizable "## X.Y.Z" top entry',
          suggestion: `add a heading "## ${pkgVersionRaw} — <date>" at the top`,
        });
      } else {
        changelogVersion = parseSemver(topRaw);
        if (!changelogVersion) {
          findings.push({
            severity: 'blocker',
            file: changelogRef.path,
            component: pkg.package,
            message: `CHANGELOG.md top entry "${topRaw}" is not valid semver`,
            suggestion: 'use a valid semver heading (e.g. "## 1.2.3 — 2026-05-30")',
          });
        }
      }
    }

    // ----- largest manifest.since -----
    const { parsed: sinceVersions, invalid: invalidSince } = collectManifestSinceVersions(
      ctx.manifests as ManifestLike[],
      pkgDir,
    );
    for (const bad of invalidSince) {
      findings.push({
        severity: 'major',
        file: bad.source,
        component: bad.component,
        message: `manifest.since "${bad.since}" is not valid semver`,
        suggestion: 'use a valid semver string (e.g. "1.2.3")',
      });
    }
    const largestSince = pickLargest(sinceVersions);

    // ----- cross-check -----
    if (changelogVersion && compareSemver(pkgVersion, changelogVersion) !== 0) {
      findings.push({
        severity: 'blocker',
        file: changelogRef?.path ?? pkg.path,
        component: pkg.package,
        message: `version mismatch: package.json="${pkgVersion.raw}" vs CHANGELOG top="${changelogVersion.raw}"`,
        suggestion:
          'bump CHANGELOG.md top entry to match package.json (or vice versa) before release',
      });
    }

    // A manifest may legitimately trail the package version (patch releases
    // ship no new components), but it must never claim a FUTURE version —
    // that advertises an unreleased "since" to consumers.
    if (largestSince && compareSemver(largestSince, pkgVersion) > 0) {
      findings.push({
        severity: 'blocker',
        file: pkg.path,
        component: pkg.package,
        message: `version mismatch: largest manifest.since="${largestSince.raw}" is ahead of package.json="${pkgVersion.raw}"`,
        suggestion:
          'correct the manifest "since" to a released version, or release the version it claims',
      });
    }

    if (
      changelogVersion &&
      largestSince &&
      compareSemver(largestSince, changelogVersion) > 0
    ) {
      findings.push({
        severity: 'blocker',
        file: changelogRef?.path ?? pkg.path,
        component: pkg.package,
        message: `version mismatch: largest manifest.since="${largestSince.raw}" is ahead of CHANGELOG top="${changelogVersion.raw}"`,
        suggestion:
          'add a CHANGELOG entry for the latest manifest "since", or correct the manifest "since" to match the released version',
      });
    }

    return findings;
  }
}

const gate = new ConsistencyVersionGate();
export default gate;

// ---------------------------------------------------------------------------
// CLI wrapper — invoked via `tsx scripts/audit-coherence/gates/06-consistency-version.ts`
// Supports `--json` for CI consumption. Exit 0 on pass, 1 on fail.
// ---------------------------------------------------------------------------

function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    const url = new URL(`file://${entry.replace(/\\/g, '/')}`).href;
    return import.meta.url === url || import.meta.url.endsWith(path.basename(entry));
  } catch {
    return false;
  }
}

async function cli(): Promise<void> {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const verbose = args.includes('--verbose');
  const repoArgIdx = args.findIndex((a) => a === '--repo');
  const repoRoot =
    repoArgIdx >= 0 && args[repoArgIdx + 1]
      ? path.resolve(args[repoArgIdx + 1]!)
      : path.resolve(process.cwd());

  const { loadAuditContext, createLogger } = await import('../_lib/load-context.js');
  const logger = createLogger(verbose);
  const ctx = await loadAuditContext(repoRoot, { logger });
  const result = await gate.run(ctx);

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const status = result.passed ? 'PASS' : 'FAIL';
    process.stdout.write(
      `[gate ${gate.id} ${gate.name}] ${status} (${result.duration_ms}ms) — ${result.findings.length} finding(s)\n`,
    );
    for (const f of result.findings) {
      const where = f.file ? ` ${f.file}` : '';
      const who = f.component ? ` [${f.component}]` : '';
      process.stdout.write(`  - ${f.severity}${who}${where}: ${f.message}\n`);
      if (f.suggestion) {
        process.stdout.write(`      ↳ ${f.suggestion}\n`);
      }
    }
  }

  process.exit(result.passed ? 0 : 1);
}

if (isMainModule()) {
  cli().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`fatal: ${message}\n`);
    process.exit(1);
  });
}
