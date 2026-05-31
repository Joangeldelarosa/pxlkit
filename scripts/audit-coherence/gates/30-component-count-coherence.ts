import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DriftItem, Gate, GateResult } from '../types';

const GATE_ID = '30-component-count-coherence';
const DESCRIPTION =
  'ui-kit registry component count must match ui-kit/package.json description, ui-kit/README.md body, and root README.md body.';

const COUNT_REGEX_PACKAGE = /(\d+)\s*production-ready/i;

/**
 * Matches phrasings that claim a total ui-kit component count, NOT category
 * subtotals like "Data Display — 14 components" or "11 motion primitives".
 *
 * Anchored patterns:
 *   - "57 retro UI components"
 *   - "57 retro pixel art (styled) (React) (UI) components"
 *   - "providing 57 ... components"
 *   - "kit with 57 components"
 *   - "Every one of the 57 components"
 *   - "components-57" (shields.io badge slug)
 */
const COUNT_REGEX_README =
  /(?:(\d+)\s+retro\s+(?:pixel[-\s]?art\s+)?(?:styled\s+)?(?:React\s+)?(?:UI\s+)?components|providing\s+\*{0,2}(\d+)\s+(?:retro\s+)?(?:pixel[-\s]?art\s+)?(?:styled\s+)?components|with\s+\*{0,2}(\d+)\s+components|Every\s+one\s+of\s+the\s+(\d+)\s+components|components-(\d+))/gi;

/**
 * Counts entries in packages/ui-kit/src/registry.ts. The registry is the SSOT
 * for "how many components ship in the ui-kit". Format on HEAD is a single
 * `export const UI_KIT_COMPONENTS = [ '...', '...', ] as const;`.
 */
export async function countRegistryEntries(repoRoot: string): Promise<number> {
  const path = join(repoRoot, 'packages/ui-kit/src/registry.ts');
  const src = await readFile(path, 'utf8');
  const matches = src.match(/^\s*'[^']+',?\s*$/gm);
  return matches ? matches.length : 0;
}

/**
 * Reads the `description` field from packages/ui-kit/package.json and extracts
 * the first integer that precedes "production-ready". Returns `null` if no
 * number is found (treated as drift).
 */
export async function readPackageDescriptionCount(repoRoot: string): Promise<number | null> {
  const path = join(repoRoot, 'packages/ui-kit/package.json');
  const raw = await readFile(path, 'utf8');
  const pkg: { description?: string } = JSON.parse(raw);
  if (!pkg.description) return null;
  const m = pkg.description.match(COUNT_REGEX_PACKAGE);
  return m ? Number(m[1]) : null;
}

/**
 * Returns every distinct numeric count that appears as "<N> ... components" in
 * a README body. Used for both the ui-kit README and the root README. Reports
 * any number that does not equal the registry count as drift.
 */
export async function readReadmeCounts(filePath: string): Promise<number[]> {
  const src = await readFile(filePath, 'utf8');
  const counts: number[] = [];
  for (const m of src.matchAll(COUNT_REGEX_README)) {
    // The regex has 5 alternatives; exactly one capture group will be defined per match.
    const captured = m.slice(1).find((g) => g !== undefined);
    if (captured) counts.push(Number(captured));
  }
  return counts;
}

export const componentCountCoherenceGate: Gate = async ({ repoRoot }): Promise<GateResult> => {
  const drift: DriftItem[] = [];
  const expected = await countRegistryEntries(repoRoot);

  if (expected === 0) {
    drift.push({
      artifact: 'packages/ui-kit/src/registry.ts',
      expected: 'Non-empty UI_KIT_COMPONENTS array',
      actual: 'Empty or unparseable — could not count entries',
      severity: 'blocker',
    });
    return { gateId: GATE_ID, description: DESCRIPTION, drift };
  }

  // (a) package.json description
  const pkgCount = await readPackageDescriptionCount(repoRoot);
  if (pkgCount === null) {
    drift.push({
      artifact: 'packages/ui-kit/package.json',
      expected: `description should mention "${expected} production-ready" components`,
      actual: 'No "<N> production-ready" pattern in description',
      severity: 'major',
    });
  } else if (pkgCount !== expected) {
    drift.push({
      artifact: 'packages/ui-kit/package.json',
      expected: `description count = ${expected} (matches registry SSOT)`,
      actual: `description count = ${pkgCount}`,
      severity: 'major',
    });
  }

  // (b) ui-kit/README.md body
  const uiKitReadme = join(repoRoot, 'packages/ui-kit/README.md');
  const uiKitCounts = await readReadmeCounts(uiKitReadme);
  for (const c of uiKitCounts) {
    if (c !== expected) {
      drift.push({
        artifact: 'packages/ui-kit/README.md',
        expected: `All "<N> components" mentions = ${expected}`,
        actual: `Found stale count: ${c}`,
        severity: 'blocker',
      });
    }
  }

  // (c) root README.md body
  const rootReadme = join(repoRoot, 'README.md');
  const rootCounts = await readReadmeCounts(rootReadme);
  for (const c of rootCounts) {
    if (c !== expected) {
      drift.push({
        artifact: 'README.md',
        expected: `All "<N> components" mentions = ${expected}`,
        actual: `Found stale count: ${c}`,
        severity: 'blocker',
      });
    }
  }

  return { gateId: GATE_ID, description: DESCRIPTION, drift };
};

export default componentCountCoherenceGate;
