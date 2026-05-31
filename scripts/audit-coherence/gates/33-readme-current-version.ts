import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { DriftItem, Gate, GateResult } from '../types';

const GATE_ID = '33-readme-current-version';
const DESCRIPTION =
  'Root README.md and each packages/*/README.md should mention the current package.json version (badge row or install snippet). Root README "<N> components" mentions must match the ui-kit registry length.';

interface PkgManifest {
  name?: string;
  version?: string;
}

interface PackageInfo {
  dir: string;
  pkgPath: string;
  readmePath: string;
  manifest: PkgManifest | null;
  readme: string | null;
}

async function tryRead(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

export async function listPackages(repoRoot: string): Promise<string[]> {
  const packagesDir = join(repoRoot, 'packages');
  if (!(await isDirectory(packagesDir))) return [];
  const entries = await readdir(packagesDir);
  const dirs: string[] = [];
  for (const name of entries) {
    if (name.startsWith('.')) continue;
    if (await isDirectory(join(packagesDir, name))) dirs.push(name);
  }
  return dirs.sort();
}

export async function loadPackageInfo(repoRoot: string, dirName: string): Promise<PackageInfo> {
  const dir = join(repoRoot, 'packages', dirName);
  const pkgPath = join(dir, 'package.json');
  const readmePath = join(dir, 'README.md');
  const pkgRaw = await tryRead(pkgPath);
  const manifest = pkgRaw ? (JSON.parse(pkgRaw) as PkgManifest) : null;
  const readme = await tryRead(readmePath);
  return { dir, pkgPath, readmePath, manifest, readme };
}

/**
 * Returns true if `readme` contains an explicit mention of `version`. The check
 * is intentionally permissive: bare "1.5.0", "v1.5.0", or any substring match
 * counts. Generated-by-CI READMEs typically embed the version in a shields.io
 * badge or in an install snippet (`npm i pkg@1.5.0`).
 */
export function readmeMentionsVersion(readme: string, version: string): boolean {
  if (!readme || !version) return false;
  return readme.includes(version);
}

/**
 * Counts entries in packages/ui-kit/src/registry.ts. Same approach as gate 30
 * but kept local so this gate has no cross-gate import coupling.
 */
export async function countRegistryEntries(repoRoot: string): Promise<number | null> {
  const path = join(repoRoot, 'packages/ui-kit/src/registry.ts');
  const src = await tryRead(path);
  if (!src) return null;
  const matches = src.match(/^\s*'[^']+',?\s*$/gm);
  return matches ? matches.length : 0;
}

/**
 * Extracts every "<N> ... components" count and shields.io "components-<N>"
 * slug from a README. Used to flag stale total-component counts.
 *
 * NOTE: kept narrow on purpose so category subtotals ("Data Display — 14
 * components") do not match. Same patterns as gate 30's COUNT_REGEX_README.
 */
const COUNT_REGEX_README =
  /(?:(\d+)\s+retro\s+(?:pixel[-\s]?art\s+)?(?:styled\s+)?(?:React\s+)?(?:UI\s+)?components|providing\s+\*{0,2}(\d+)\s+(?:retro\s+)?(?:pixel[-\s]?art\s+)?(?:styled\s+)?components|with\s+\*{0,2}(\d+)\s+components|Every\s+one\s+of\s+the\s+(\d+)\s+components|components-(\d+))/gi;

export function extractComponentCounts(readme: string): number[] {
  const counts: number[] = [];
  for (const m of readme.matchAll(COUNT_REGEX_README)) {
    const captured = m.slice(1).find((g) => g !== undefined);
    if (captured) counts.push(Number(captured));
  }
  return counts;
}

export const readmeCurrentVersionGate: Gate = async ({ repoRoot }): Promise<GateResult> => {
  const drift: DriftItem[] = [];

  // (a) Root README.md — version coverage is best-effort (no canonical root
  // version), but component-count drift is checked against ui-kit registry.
  const rootReadme = await tryRead(join(repoRoot, 'README.md'));
  const registryCount = await countRegistryEntries(repoRoot);

  if (rootReadme && registryCount !== null && registryCount > 0) {
    const counts = extractComponentCounts(rootReadme);
    for (const c of counts) {
      if (c !== registryCount) {
        drift.push({
          artifact: 'README.md',
          expected: `"<N> components" mentions should equal registry length (${registryCount})`,
          actual: `Found stale count: ${c}`,
          severity: 'minor',
        });
      }
    }
  }

  // (b) Each package — README should mention package.json version. Missing
  // README or missing version field downgrades to a soft observation; mismatch
  // is the actionable signal.
  const packages = await listPackages(repoRoot);

  for (const dirName of packages) {
    const info = await loadPackageInfo(repoRoot, dirName);
    const artifact = `packages/${dirName}/README.md`;

    if (!info.manifest) {
      // No package.json — not this gate's concern; skip.
      continue;
    }
    const version = info.manifest.version;
    if (!version) {
      // Package has no version pinned — out of scope for this gate.
      continue;
    }

    if (!info.readme) {
      drift.push({
        artifact,
        expected: `README.md exists and mentions current version ${version}`,
        actual: 'README.md missing',
        severity: 'minor',
      });
      continue;
    }

    if (!readmeMentionsVersion(info.readme, version)) {
      drift.push({
        artifact,
        expected: `README mentions current version ${version} (in badge row, install snippet, or release notes)`,
        actual: `Version ${version} not found in README — consider regenerating or pinning the badge/install line`,
        severity: 'minor',
      });
    }
  }

  // (c) ui-kit/README.md gets the same component-count cross-check as the root.
  // Drift here is minor because gate 30 already covers it as a blocker; this
  // gate's role is the version-coverage angle.
  if (registryCount !== null && registryCount > 0) {
    const uiKitReadme = await tryRead(join(repoRoot, 'packages/ui-kit/README.md'));
    if (uiKitReadme) {
      const counts = extractComponentCounts(uiKitReadme);
      for (const c of counts) {
        if (c !== registryCount) {
          drift.push({
            artifact: 'packages/ui-kit/README.md',
            expected: `"<N> components" mentions should equal registry length (${registryCount})`,
            actual: `Found stale count: ${c}`,
            severity: 'minor',
          });
        }
      }
    }
  }

  return { gateId: GATE_ID, description: DESCRIPTION, drift };
};

export default readmeCurrentVersionGate;
