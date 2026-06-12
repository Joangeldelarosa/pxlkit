import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { DriftItem, Gate, GateResult } from '../types';

import { adaptFunctionalGate } from '../_lib/functional-gate-adapter.js';
import {
  extractAddedComponents,
  parseReleaseSections,
  resolveAdvertisedRelease,
} from '../_lib/release-policy.js';

const GATE_ID = '34-whatsnew-vs-version';
const DESCRIPTION =
  'WhatsNewStrip items must advertise the components added in the advertised ui-kit release: the current version, or — for version-only patches with no "### Added" entries — the most recent release that has them. Prop-driven strips are checked against the items statically wired at their call sites.';

const STRIP_PATH = 'apps/web/src/components/whats-new-strip.tsx';
const PKG_PATH = 'packages/ui-kit/package.json';
const CHANGELOG_PATH = 'packages/ui-kit/CHANGELOG.md';
const WEB_SRC = 'apps/web/src';

/** Minimum fraction of strip items that must come from the advertised release's Added set. */
const MIN_OVERLAP = 0.5;

interface ReadOptions {
  strip?: string | null;
  changelog?: string | null;
  uiKitPackage?: { version?: string } | null;
  /** Items statically wired at the strip's call sites (prop-driven strips). */
  consumerItems?: string[];
}

export async function loadInputs(repoRoot: string): Promise<{
  strip: string | null;
  changelog: string | null;
  uiKitPackage: { version?: string } | null;
  consumerItems: string[];
}> {
  const strip = await tryRead(join(repoRoot, STRIP_PATH));
  const changelog = await tryRead(join(repoRoot, CHANGELOG_PATH));
  const pkgRaw = await tryRead(join(repoRoot, PKG_PATH));
  const uiKitPackage = pkgRaw ? (JSON.parse(pkgRaw) as { version?: string }) : null;
  const consumerItems = await loadConsumerItems(join(repoRoot, WEB_SRC));
  return { strip, changelog, uiKitPackage, consumerItems };
}

async function tryRead(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Collect the item names statically wired to the strip across the web app:
 * arrays typed `WhatsNewItem[]` (e.g. WHATS_NEW_ITEMS in
 * LandingPageClient.tsx, WHATS_NEW_V200_ITEMS in app/ui-kit/page.tsx).
 */
async function loadConsumerItems(webSrcDir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(webSrcDir, { recursive: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const entry of entries) {
    const rel = String(entry).replace(/\\/g, '/');
    if (!/\.(ts|tsx)$/.test(rel)) continue;
    if (/\.(test|spec)\.[jt]sx?$/.test(rel) || rel.includes('__tests__/')) continue;
    const content = await tryRead(join(webSrcDir, rel));
    if (!content || !content.includes('WhatsNewItem')) continue;
    out.push(...parseConsumerItems(content));
  }
  return dedupePreserveOrder(out);
}

/** Extract `name:` values from arrays typed `WhatsNewItem[]`. */
export function parseConsumerItems(source: string): string[] {
  const out: string[] = [];
  const arrayRe = /:\s*WhatsNewItem\[\]\s*=\s*\[([\s\S]*?)\];/g;
  let m: RegExpExecArray | null;
  while ((m = arrayRe.exec(source)) !== null) {
    const block = m[1] ?? '';
    const nameRe = /\bname\s*:\s*['"]([^'"]+)['"]/g;
    let n: RegExpExecArray | null;
    while ((n = nameRe.exec(block)) !== null) {
      if (n[1]) out.push(n[1]);
    }
  }
  return dedupePreserveOrder(out);
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
 * Components listed under every `### Added*` subsection of the section for a
 * given version. Supports both `## [1.6.0] - 2026-05-31` and
 * `## 2.0.1 — 2026-06-02` heading styles.
 */
export function parseChangelogAdded(changelog: string, version: string): string[] {
  const section = parseReleaseSections(changelog).find(
    (s) => !s.unreleased && s.version === version,
  );
  if (!section) return [];
  return extractAddedComponents(section.body);
}

/** True when the strip takes its items via props instead of hardcoding them. */
export function isItemsPropDriven(strip: string): boolean {
  return /\bitems\b\s*[:}?,]/.test(strip);
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

  // The advertised release: the current version when its section has Added
  // entries; otherwise (version-only patch / republish) the most recent
  // release that has them — the strip legitimately advertises that one.
  const advertised = resolveAdvertisedRelease(changelog, version);
  if (!advertised) {
    drift.push({
      artifact: CHANGELOG_PATH,
      expected: `A release section with an "### Added" subsection listing components (current v${version} or an earlier release)`,
      actual: `No "### Added" entries found in any release section — cannot compare against strip items`,
      severity: 'major',
    });
    return drift;
  }

  // Resolve items: hardcoded `component:` entries in the strip itself, or —
  // for a prop-driven strip — the items statically wired at its call sites.
  let stripItems = parseStripItems(strip);
  let itemsSource = STRIP_PATH;
  if (stripItems.length === 0 && isItemsPropDriven(strip)) {
    stripItems = opts.consumerItems ?? [];
    itemsSource = `${WEB_SRC} (WhatsNewItem[] arrays wired to the strip)`;
  }

  if (stripItems.length === 0) {
    drift.push({
      artifact: STRIP_PATH,
      expected: 'items[] entries hardcoded in the strip or statically wired at its call sites',
      actual: 'No `component:` entries parsed from strip and no wired items found — items array missing or malformed',
      severity: 'major',
    });
    return drift;
  }

  const addedSet = new Set(advertised.added);
  const matched = stripItems.filter((c) => addedSet.has(c));
  const unmatched = stripItems.filter((c) => !addedSet.has(c));

  if (matched.length === 0) {
    drift.push({
      artifact: itemsSource,
      expected: `Strip items advertise the v${advertised.version} release (Added: ${advertised.added.join(', ')})`,
      actual: `None of the strip items (${stripItems.join(', ')}) appear in v${advertised.version}'s Added entries — stale highlights`,
      severity: 'major',
    });
    return drift;
  }

  if (matched.length / stripItems.length < MIN_OVERLAP) {
    drift.push({
      artifact: itemsSource,
      expected: `Majority of strip items come from v${advertised.version}'s Added entries (curated subsets are fine)`,
      actual: `Only ${matched.length}/${stripItems.length} items match v${advertised.version}; stale or unknown entries: ${unmatched.join(', ')}`,
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

// Orchestrator-compatible wrapper; the named functional export above is
// the pure core the unit tests exercise directly.
export default adaptFunctionalGate({
  id: 34,
  name: 'whatsnew-vs-version',
  description: DESCRIPTION,
  fn: whatsnewVsVersionGate,
});
