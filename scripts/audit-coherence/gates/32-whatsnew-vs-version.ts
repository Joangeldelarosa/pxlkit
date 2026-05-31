import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DriftItem, Gate, GateResult } from '../types';

const GATE_ID = '32-whatsnew-vs-version';
const DESCRIPTION =
  'WhatsNewStrip items[] must equal the components listed under "Added" for the current @pxlkit/ui-kit version in packages/ui-kit/CHANGELOG.md.';

const STRIP_PATH = 'apps/web/src/components/whats-new-strip.tsx';
const PKG_PATH = 'packages/ui-kit/package.json';
const CHANGELOG_PATH = 'packages/ui-kit/CHANGELOG.md';

interface ReadOptions {
  strip?: string | null;
  changelog?: string | null;
  uiKitPackage?: { version?: string } | null;
}

export async function loadInputs(repoRoot: string): Promise<{
  strip: string | null;
  changelog: string | null;
  uiKitPackage: { version?: string } | null;
}> {
  const strip = await tryRead(join(repoRoot, STRIP_PATH));
  const changelog = await tryRead(join(repoRoot, CHANGELOG_PATH));
  const pkgRaw = await tryRead(join(repoRoot, PKG_PATH));
  const uiKitPackage = pkgRaw ? (JSON.parse(pkgRaw) as { version?: string }) : null;
  return { strip, changelog, uiKitPackage };
}

async function tryRead(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Extract the `component:` string values from the DEFAULT_ITEMS / items array
 * inside the strip source. Matches `component: 'Name'` or `component: "Name"`.
 */
export function parseStripItems(strip: string): string[] {
  const re = /component\s*:\s*['"]([^'"]+)['"]/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(strip)) !== null) {
    if (m[1]) out.push(m[1]);
  }
  return dedupePreserveOrder(out);
}

/**
 * Slice the changelog to the section for a given version, then return component
 * names listed under the first `### Added` subsection. Component names are
 * detected as the first backticked identifier on each bullet line.
 */
export function parseChangelogAdded(changelog: string, version: string): string[] {
  const sectionRe = new RegExp(
    `^##\\s+\\[[^\\]]*${escapeRegex(version)}[^\\]]*\\][\\s\\S]*?(?=^##\\s+\\[|\\Z)`,
    'm',
  );
  const sectionMatch = sectionRe.exec(changelog);
  if (!sectionMatch) return [];
  const section = sectionMatch[0];

  const addedRe = /^###\s+Added\b[\s\S]*?(?=^###\s+|^##\s+\[|\Z)/m;
  const addedMatch = addedRe.exec(section);
  if (!addedMatch) return [];
  const addedBlock = addedMatch[0];

  const out: string[] = [];
  for (const line of addedBlock.split(/\r?\n/)) {
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (!bullet) continue;
    const rest = bullet[1] ?? '';
    const tick = /`([^`]+)`/.exec(rest);
    if (tick && tick[1]) {
      out.push(tick[1]);
      continue;
    }
    const bold = /\*\*([^*]+)\*\*/.exec(rest);
    if (bold && bold[1]) out.push(bold[1]);
  }
  return dedupePreserveOrder(out);
}

function dedupePreserveOrder(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of arr) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function evaluate(opts: ReadOptions): DriftItem[] {
  const drift: DriftItem[] = [];
  const { strip, changelog, uiKitPackage } = opts;

  if (!strip) {
    drift.push({
      artifact: STRIP_PATH,
      expected: 'File exists and exports a default WhatsNewStrip with an items array',
      actual: 'File does not exist',
      severity: 'blocker',
    });
    return drift;
  }

  const version = uiKitPackage?.version;
  if (!version) {
    drift.push({
      artifact: PKG_PATH,
      expected: 'package.json has a `version` field so the gate can pin a changelog section',
      actual: 'version field missing — cannot resolve changelog section',
      severity: 'major',
    });
    return drift;
  }

  if (!changelog) {
    drift.push({
      artifact: CHANGELOG_PATH,
      expected: `CHANGELOG.md exists with an entry for ${version}`,
      actual: 'CHANGELOG.md not found — cannot validate strip items against release',
      severity: 'major',
    });
    return drift;
  }

  const stripItems = parseStripItems(strip);
  const addedItems = parseChangelogAdded(changelog, version);

  if (addedItems.length === 0) {
    drift.push({
      artifact: CHANGELOG_PATH,
      expected: `Section for v${version} contains an "### Added" subsection listing components`,
      actual: `No "### Added" entries found for v${version} — cannot compare against strip items`,
      severity: 'major',
    });
    return drift;
  }

  if (stripItems.length === 0) {
    drift.push({
      artifact: STRIP_PATH,
      expected: 'items[] array contains entries with `component:` string fields',
      actual: 'No `component:` entries parsed from strip — items array missing or malformed',
      severity: 'major',
    });
    return drift;
  }

  const stripSet = new Set(stripItems);
  const addedSet = new Set(addedItems);

  const missingFromStrip = addedItems.filter((c) => !stripSet.has(c));
  const extraInStrip = stripItems.filter((c) => !addedSet.has(c));

  if (missingFromStrip.length > 0) {
    drift.push({
      artifact: STRIP_PATH,
      expected: `items[] surfaces every component added in v${version}: ${addedItems.join(', ')}`,
      actual: `Missing from strip: ${missingFromStrip.join(', ')}. Add them to items[] in ${STRIP_PATH}`,
      severity: 'major',
    });
  }

  if (extraInStrip.length > 0) {
    drift.push({
      artifact: STRIP_PATH,
      expected: `items[] only surfaces components from v${version}'s Added section`,
      actual: `Stale or unknown entries in strip: ${extraInStrip.join(', ')}. Remove or move them to a previous-release archive`,
      severity: 'major',
    });
  }

  return drift;
}

export const whatsnewVsVersionGate: Gate = async ({ repoRoot }): Promise<GateResult> => {
  const inputs = await loadInputs(repoRoot);
  const drift = evaluate(inputs);
  return { gateId: GATE_ID, description: DESCRIPTION, drift };
};

export default whatsnewVsVersionGate;
