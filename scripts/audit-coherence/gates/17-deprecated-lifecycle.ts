/**
 * Gate 17 — deprecated-lifecycle.
 *
 * For every manifest record carrying `status === "deprecated"`, this gate
 * enforces a sane removal timeline:
 *
 *   1. `deprecatedRemovedIn` MUST be defined.
 *   2. `deprecatedRemovedIn` MUST parse as a valid semver string.
 *   3. The major of `deprecatedRemovedIn` MUST be ≤ `current_major + 1`,
 *      where `current_major` is the major of the owning package.json
 *      version.
 *
 * Each violation is reported as a `major` finding. The rule prevents two
 * failure modes we have seen IRL on previous Olas:
 *
 *   - A component flagged "deprecated" with no removal target — it lingers
 *     in the surface forever, ships in releases, and confuses consumers.
 *   - A component flagged "deprecated" with a removal target three majors
 *     out — equivalent to "we will never remove this" but with extra
 *     bookkeeping the maintainer has to remember.
 *
 * Programmatic API:
 *
 *     const gate = new DeprecatedLifecycleGate();
 *     const result = await gate.run(ctx);
 *
 * CLI:
 *
 *     tsx scripts/audit-coherence/gates/17-deprecated-lifecycle.ts \
 *       [--repo <dir>] [--json] [--verbose]
 *
 * Exit codes:
 *   0 — all deprecations have valid, near-term removal targets
 *   1 — at least one violation surfaced (or context load failed)
 */

import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

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
// Semver — local, self-contained to keep the gate dep-free.
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

// ---------------------------------------------------------------------------
// Manifest shape — typed loosely because manifests are Zod-passthrough.
// ---------------------------------------------------------------------------

interface ManifestLike {
  component?: string;
  source?: string;
  status?: unknown;
  deprecatedRemovedIn?: unknown;
  [key: string]: unknown;
}

/**
 * Return true if a manifest's `source` path lives inside `packageDir`.
 * Mirrors the same helper in gate 6 so the two gates resolve ownership the
 * same way.
 */
export function manifestBelongsToPackage(
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

/**
 * Resolve which package (by its package.json absolute path) owns this
 * manifest. Returns null if none of the discovered packages contain the
 * manifest source. The orchestrator can still surface that case as a
 * finding so a stranded deprecation does not silently bypass enforcement.
 */
export function resolveOwningPackage(
  manifest: ManifestLike,
  packageJsons: Array<{ package: string; path: string }>,
): { package: string; path: string; dir: string } | null {
  for (const pkg of packageJsons) {
    const dir = path.dirname(pkg.path);
    if (manifestBelongsToPackage(manifest, dir)) {
      return { package: pkg.package, path: pkg.path, dir };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Core rule — pure function so tests can assert it without filesystem.
// ---------------------------------------------------------------------------

export type LifecycleViolation =
  | { kind: 'missing-removed-in' }
  | { kind: 'invalid-removed-in'; value: string }
  | {
      kind: 'too-far-out';
      removedInMajor: number;
      maxAllowedMajor: number;
      currentMajor: number;
      removedInRaw: string;
    };

/**
 * Apply the lifecycle rule to a single deprecated manifest.
 *
 *   - currentMajor is the major of the owning package.json version.
 *   - The allowed window is `removedIn.major <= currentMajor + 1`.
 *
 * Returns null when the manifest is in compliance, or a typed violation
 * descriptor when it is not. Callers convert the descriptor into a
 * GateFinding with the appropriate message + suggestion.
 */
export function evaluateLifecycle(
  removedIn: unknown,
  currentMajor: number,
): LifecycleViolation | null {
  if (removedIn === undefined || removedIn === null || removedIn === '') {
    return { kind: 'missing-removed-in' };
  }
  if (typeof removedIn !== 'string') {
    return { kind: 'invalid-removed-in', value: String(removedIn) };
  }
  const parsed = parseSemver(removedIn);
  if (!parsed) {
    return { kind: 'invalid-removed-in', value: removedIn };
  }
  const maxAllowedMajor = currentMajor + 1;
  if (parsed.major > maxAllowedMajor) {
    return {
      kind: 'too-far-out',
      removedInMajor: parsed.major,
      maxAllowedMajor,
      currentMajor,
      removedInRaw: parsed.raw,
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

interface PackageJsonShape {
  name?: string;
  version?: string;
}

export interface DeprecatedLifecycleGateOptions {
  /**
   * Override package.json reading. Default uses fs-extra. Tests inject a
   * stub so the gate can run against an in-memory AuditContext without
   * touching disk.
   */
  readPackageJson?: (absPath: string) => Promise<PackageJsonShape | null>;
}

export class DeprecatedLifecycleGate extends Gate {
  readonly id = 17;
  readonly name = 'deprecated-lifecycle';
  readonly description =
    'For each manifest with status==="deprecated": deprecatedRemovedIn must be defined AND must be ≤ current_major + 1. Major on violation.';

  private readonly readPackageJsonImpl: (
    absPath: string,
  ) => Promise<PackageJsonShape | null>;

  constructor(options: DeprecatedLifecycleGateOptions = {}) {
    super();
    this.readPackageJsonImpl = options.readPackageJson ?? defaultReadPackageJson;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    const manifests = ctx.manifests as ManifestLike[];
    const deprecated = manifests.filter((m) => m.status === 'deprecated');

    if (deprecated.length === 0) {
      ctx.logger.debug(
        'deprecated-lifecycle: no deprecated manifests — gate passes vacuously',
      );
      return gateOk(this.name, Date.now() - started);
    }

    // Cache package.json majors so each package is parsed at most once per run.
    const majorCache = new Map<string, number | null>();

    for (const manifest of deprecated) {
      const component =
        typeof manifest.component === 'string' && manifest.component.length > 0
          ? manifest.component
          : '<unknown>';
      const source =
        typeof manifest.source === 'string' ? manifest.source : undefined;

      const owner = resolveOwningPackage(manifest, ctx.packageJsons);
      if (!owner) {
        findings.push({
          severity: 'major',
          file: source,
          component,
          message: `Deprecated manifest "${component}" could not be matched to any package — cannot enforce removal-window rule.`,
          suggestion:
            'Ensure the manifest "source" path lives under one of the discovered packages/<name>/ directories, or fix the manifest loader so package ownership is resolvable.',
        });
        continue;
      }

      let currentMajor: number | null;
      if (majorCache.has(owner.path)) {
        currentMajor = majorCache.get(owner.path) ?? null;
      } else {
        currentMajor = await this.loadCurrentMajor(owner.path, findings, {
          component,
          source,
          packageName: owner.package,
        });
        majorCache.set(owner.path, currentMajor);
      }
      if (currentMajor === null) {
        // The loader already recorded a finding explaining why; skip enforcement
        // for this manifest rather than emitting a noisy duplicate.
        continue;
      }

      const violation = evaluateLifecycle(
        manifest.deprecatedRemovedIn,
        currentMajor,
      );
      if (!violation) continue;

      findings.push(toFinding(violation, { component, source, owner, currentMajor }));
    }

    if (findings.length === 0) {
      return gateOk(this.name, Date.now() - started);
    }
    return gateFail(this.name, findings, Date.now() - started);
  }

  private async loadCurrentMajor(
    packageJsonPath: string,
    findings: GateFinding[],
    where: { component: string; source?: string; packageName: string },
  ): Promise<number | null> {
    let pj: PackageJsonShape | null;
    try {
      pj = await this.readPackageJsonImpl(packageJsonPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      findings.push({
        severity: 'major',
        file: packageJsonPath,
        component: where.component,
        message: `failed to read package.json for "${where.packageName}": ${message}`,
        suggestion: 'ensure package.json is valid JSON and readable',
      });
      return null;
    }
    if (!pj || typeof pj.version !== 'string' || pj.version.length === 0) {
      findings.push({
        severity: 'major',
        file: packageJsonPath,
        component: where.component,
        message: `package "${where.packageName}" has no readable version field — cannot derive current_major for deprecation window check.`,
        suggestion:
          'add a valid semver "version" entry to the package.json so the lifecycle gate can compute current_major + 1.',
      });
      return null;
    }
    const parsed = parseSemver(pj.version);
    if (!parsed) {
      findings.push({
        severity: 'major',
        file: packageJsonPath,
        component: where.component,
        message: `package "${where.packageName}" version "${pj.version}" is not valid semver — cannot derive current_major.`,
        suggestion: 'use a valid semver string (e.g. "1.2.3") in package.json.',
      });
      return null;
    }
    return parsed.major;
  }
}

function toFinding(
  v: LifecycleViolation,
  ctx: {
    component: string;
    source?: string;
    owner: { package: string };
    currentMajor: number;
  },
): GateFinding {
  switch (v.kind) {
    case 'missing-removed-in':
      return {
        severity: 'major',
        file: ctx.source,
        component: ctx.component,
        message: `Deprecated component "${ctx.component}" is missing required "deprecatedRemovedIn" — every deprecation must declare the release in which it disappears.`,
        suggestion: `Add deprecatedRemovedIn to the manifest, e.g. "${ctx.currentMajor + 1}.0.0", so the removal window is enforceable.`,
      };
    case 'invalid-removed-in':
      return {
        severity: 'major',
        file: ctx.source,
        component: ctx.component,
        message: `Deprecated component "${ctx.component}" has invalid deprecatedRemovedIn "${v.value}" — expected a semver string.`,
        suggestion: `Use a valid semver string for deprecatedRemovedIn (e.g. "${ctx.currentMajor + 1}.0.0").`,
      };
    case 'too-far-out':
      return {
        severity: 'major',
        file: ctx.source,
        component: ctx.component,
        message: `Deprecated component "${ctx.component}" targets removal in "${v.removedInRaw}" (major ${v.removedInMajor}), beyond the allowed window of current_major + 1 (${v.maxAllowedMajor}.x.x) for package "${ctx.owner.package}" (current_major=${v.currentMajor}).`,
        suggestion: `Pull the removal forward to "${v.maxAllowedMajor}.0.0" or earlier, or unmark the component as deprecated until a tighter window can be committed.`,
      };
    default: {
      // Exhaustiveness guard — narrowing to never proves all kinds handled.
      const _exhaustive: never = v;
      return _exhaustive;
    }
  }
}

async function defaultReadPackageJson(
  absPath: string,
): Promise<PackageJsonShape | null> {
  if (!(await fs.pathExists(absPath))) return null;
  return (await fs.readJson(absPath)) as PackageJsonShape;
}

const gate = new DeprecatedLifecycleGate();
export default gate;

// ---------------------------------------------------------------------------
// CLI wrapper
// ---------------------------------------------------------------------------

function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return pathToFileURL(entry).href === import.meta.url;
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

  const { loadAuditContext, createLogger } = await import(
    '../_lib/load-context.js'
  );
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
