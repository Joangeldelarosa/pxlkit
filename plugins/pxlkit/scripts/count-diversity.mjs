#!/usr/bin/env node
/**
 * Component diversity measurement.
 *
 * A generated page that uses eight components eight times reads as a template. One
 * that reaches across the catalogue reads as designed. This counts which of the
 * kit's components a page actually imports, grouped by category and by how often
 * the repo's own templates use them.
 *
 * The thresholds are floors with a justifiable exception, not quotas. Adding a
 * PixelDatePicker to a landing page to clear a number makes the page worse, and a
 * skill that does it is gaming its own metric. When a page cannot honestly reach
 * the floor, the right move is to say so, not to pad.
 *
 * Usage:
 *   node count-diversity.mjs [--type landing|dashboard|page] [--json] <file-or-dir>...
 *
 * Exit 0 when the floor is met, 1 when it is not.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Calibrated against the repo's own templates, measured 2026-08-08:
 *
 *   landing-full  27 distinct ·  8 categories
 *   dashboard     29 distinct ·  8 categories
 *   ecommerce     18 distinct ·  7 categories
 *   portfolio     15 distinct ·  6 categories
 *   docs          12 distinct ·  6 categories
 *   changelog     12 distinct ·  3 categories
 *
 * The floors sit at or just under what the best real template of each shape
 * achieves, so they demand parity with hand-written work rather than an invented
 * ideal. `changelog` is the one template below the generic `page` floor on
 * categories — a changelog legitimately draws on few component families, which is
 * why it is a deliberate exception rather than a reason to lower the bar.
 *
 * The `underused` floor is different in kind, and worth understanding before you
 * trust it: the tier is *derived from* template usage, so an existing template
 * scores 0 by construction. It is a meaningful target only for newly generated
 * pages, which can reach for components no template has needed yet. Pass
 * `--skip-underused` when measuring an existing template, or the check is vacuous.
 */
export const THRESHOLDS = {
  landing: { distinct: 25, categories: 8, underused: 3 },
  dashboard: { distinct: 20, categories: 6, underused: 2 },
  page: { distinct: 12, categories: 5, underused: 1 },
};

/** Locates the generated diversity menu, which carries the category and tier map. */
function findDiversityMenu() {
  const candidates = [];
  if (process.env.CLAUDE_PLUGIN_ROOT) {
    candidates.push(path.join(process.env.CLAUDE_PLUGIN_ROOT, 'references', 'diversity-menu.generated.md'));
  }
  const here = path.dirname(fileURLToPath(import.meta.url));
  candidates.push(path.join(here, '..', 'references', 'diversity-menu.generated.md'));
  return candidates.find((f) => fs.existsSync(f)) ?? null;
}

/**
 * Parses the generated menu into `name -> { category, tier }`.
 *
 * Format, one component per bullet under a `## <category>` heading:
 *   - **PixelButton** `[core]` — 5 templates: ...
 */
export function parseDiversityMenu(markdown) {
  const map = new Map();
  let category = null;
  for (const line of markdown.split('\n')) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      category = heading[1].trim();
      continue;
    }
    const bullet = /^-\s+\*\*([A-Za-z][A-Za-z0-9]*)\*\*\s+`\[(core|distinctive|underused)\]`/.exec(line);
    if (bullet && category) {
      map.set(bullet[1], { category, tier: bullet[2] });
    }
  }
  return map;
}

/**
 * Extracts the named imports a source file pulls from `@pxlkit/ui-kit`.
 *
 * Handles multi-line import blocks, aliases (`X as Y` counts as X, the real
 * component) and `type` specifiers, which are dropped — importing a props type is
 * not using the component.
 */
export function extractUiKitImports(source) {
  const names = new Set();
  // `[^{}]` rather than `[\s\S]` on purpose: a lazy any-character class walks past
  // the closing brace of earlier imports until it finds one followed by
  // `from '@pxlkit/ui-kit'`, swallowing every intervening import statement. The
  // visible symptom is subtle — the *first* component of the real block ends up
  // glued to the preceding junk and is silently dropped, while the rest survive.
  const re = /import\s+(?:type\s+)?\{([^{}]*?)\}\s*from\s*['"]@pxlkit\/ui-kit['"]/g;
  for (const match of source.matchAll(re)) {
    for (const raw of match[1].split(',')) {
      const spec = raw.trim();
      if (!spec) continue;
      if (/^type\s/.test(spec)) continue;
      const name = spec.split(/\s+as\s+/)[0].trim();
      if (/^[A-Z][A-Za-z0-9]*$/.test(name)) names.add(name);
    }
  }
  return names;
}

const SCANNED_EXT = new Set(['.tsx', '.jsx', '.ts', '.js', '.mjs']);

function collectFiles(target, acc = []) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (SCANNED_EXT.has(path.extname(target))) acc.push(target);
    return acc;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    collectFiles(path.join(target, entry.name), acc);
  }
  return acc;
}

/**
 * Does `name` actually appear in the file body, not just its import statement?
 *
 * Counting imports alone makes the metric gameable by the cheapest possible edit —
 * add a line to the import block and the score goes up without a pixel changing.
 * Observed on this repo's own /skills page, which claimed a component it had
 * stopped rendering. A component earns its count by being used.
 */
function isRendered(source, name) {
  const withoutImports = source.replace(
    /import\s+(?:type\s+)?\{[^{}]*?\}\s*from\s*['"][^'"]+['"];?/g,
    '',
  );
  return new RegExp(`\\b${name}\\b`).test(withoutImports);
}

/** Counts distinct components, categories touched, and underused picks. */
export function countDiversity(files, menu) {
  const used = new Set();
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const name of extractUiKitImports(source)) {
      if (isRendered(source, name)) used.add(name);
    }
  }

  const categories = new Set();
  const underused = [];
  const unknown = [];
  for (const name of used) {
    const entry = menu?.get(name);
    if (!entry) {
      unknown.push(name);
      continue;
    }
    categories.add(entry.category);
    if (entry.tier === 'underused') underused.push(name);
  }

  return {
    distinct: [...used].sort(),
    categories: [...categories].sort(),
    underused: underused.sort(),
    unknown: unknown.sort(),
  };
}

function main() {
  const argv = process.argv.slice(2);
  const asJson = argv.includes('--json');
  const typeIndex = argv.indexOf('--type');
  const type = typeIndex >= 0 ? argv[typeIndex + 1] : 'page';
  const targets = argv.filter((a, i) => !a.startsWith('--') && i !== typeIndex + 1);

  if (targets.length === 0) {
    console.error('usage: node count-diversity.mjs [--type landing|dashboard|page] <file-or-dir>...');
    process.exit(2);
  }

  const threshold = THRESHOLDS[type];
  if (!threshold) {
    console.error(`count-diversity: unknown --type "${type}". Expected one of: ${Object.keys(THRESHOLDS).join(', ')}`);
    process.exit(2);
  }

  const menuFile = findDiversityMenu();
  const menu = menuFile ? parseDiversityMenu(fs.readFileSync(menuFile, 'utf8')) : null;

  const files = targets.flatMap((t) => {
    if (!fs.existsSync(t)) {
      console.error(`count-diversity: no such path: ${t}`);
      process.exit(2);
    }
    return collectFiles(t);
  });

  const skipUnderused = argv.includes('--skip-underused');
  const result = countDiversity(files, menu);
  const pass =
    result.distinct.length >= threshold.distinct &&
    result.categories.length >= threshold.categories &&
    (skipUnderused || result.underused.length >= threshold.underused);

  if (asJson) {
    console.log(
      JSON.stringify({ type, threshold, ...result, pass, skipUnderused, menuFound: Boolean(menu) }, null, 2),
    );
    process.exit(pass ? 0 : 1);
  }

  console.log(`count-diversity — ${type} (${files.length} file(s))`);
  console.log(`  distinct components: ${result.distinct.length} / ${threshold.distinct}`);
  console.log(`  categories touched:  ${result.categories.length} / ${threshold.categories}  [${result.categories.join(', ')}]`);
  console.log(
    `  underused picks:     ${result.underused.length} / ${skipUnderused ? 'skipped' : threshold.underused}  [${result.underused.join(', ') || '—'}]`,
  );
  if (!menu) {
    console.log('  ⚠ diversity-menu.generated.md not found — categories and tiers unavailable.');
  }
  if (result.unknown.length) {
    console.log(`  ⚠ not in the registry: ${result.unknown.join(', ')}`);
  }
  console.log(pass ? '\n✓ Meets the floor.' : '\n✗ Below the floor.');
  process.exit(pass ? 0 : 1);
}

const invokedDirectly =
  process.argv[1] && import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href;
if (invokedDirectly) main();
