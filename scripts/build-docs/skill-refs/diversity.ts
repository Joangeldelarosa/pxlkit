/**
 * skill-refs/diversity
 *
 * Renders the "diversity menu" consumed by the pxlkit Claude Code skills.
 *
 * The problem it solves: an agent composing a page reaches for the same six
 * primitives every time, so every generated page looks identical. This menu
 * scores each component by how many of the real `apps/web` page templates
 * import it, and labels the ones nobody has claimed yet — so the agent can
 * pick a genuinely fitting `[underused]` component instead of defaulting.
 *
 * Consumed by `generate-skill-refs.ts` (Task A6), which feeds it the manifests
 * from the `scan` step and the template sources read off disk.
 */

import type { Manifest } from '../manifest-schema.js';
import { COMPONENT_CATEGORIES } from '../manifest-schema.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Map of template file name (e.g. `landing-full-template.tsx`) -> its source. */
export type TemplateSources = Record<string, string>;

export type DiversityTier = 'core' | 'distinctive' | 'underused';

export interface DiversityEntry {
  name: string;
  category: string;
  /** Number of distinct templates whose `@pxlkit/ui-kit` imports name it. */
  uses: number;
  /** Template labels (file name minus `-template.tsx`), sorted. */
  templates: string[];
  tier: DiversityTier;
}

// ---------------------------------------------------------------------------
// Import extraction
// ---------------------------------------------------------------------------

/**
 * Named specifiers imported from `@pxlkit/ui-kit` in one source file.
 *
 * Handles multi-line import blocks, `import type { … }`, inline `type X`
 * specifiers and `X as Y` aliases (the *original* name is what counts — that is
 * the component, the alias is local naming). Namespace and default imports are
 * ignored: they carry no per-component signal.
 */
export function extractUiKitImports(source: string): string[] {
  const names = new Set<string>();
  if (typeof source !== 'string' || source.length === 0) return [];

  // `[^}]*` spans newlines, so multi-line import blocks are matched whole.
  const re = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]@pxlkit\/ui-kit['"]/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(source)) !== null) {
    for (const raw of match[1].split(',')) {
      const specifier = raw.trim();
      if (specifier.length === 0) continue;
      const original = specifier
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        .trim();
      if (/^[A-Za-z_$][\w$]*$/.test(original)) names.add(original);
    }
  }

  return [...names];
}

/** `landing-full-template.tsx` -> `landing-full`. */
function templateLabel(fileName: string): string {
  return fileName
    .replace(/\.[jt]sx?$/, '')
    .replace(/-template$/, '');
}

function tierFor(uses: number): DiversityTier {
  if (uses === 0) return 'underused';
  if (uses <= 2) return 'distinctive';
  return 'core';
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Score every manifest against the template corpus.
 *
 * A component counts **once per template**, not once per JSX occurrence: the
 * question the menu answers is "how many different page designs already lean on
 * this?", and a template that renders `PixelCard` forty times is still one
 * design leaning on it.
 */
export function scoreDiversity(
  manifests: Manifest[],
  templateSources: TemplateSources,
): DiversityEntry[] {
  const perTemplate = new Map<string, Set<string>>();

  for (const [file, source] of Object.entries(templateSources ?? {})) {
    perTemplate.set(templateLabel(file), new Set(extractUiKitImports(source)));
  }

  const list = Array.isArray(manifests) ? manifests : [];

  return list
    .filter((m) => m && typeof m.name === 'string')
    .map((m) => {
      const templates = [...perTemplate.entries()]
        .filter(([, imported]) => imported.has(m.name))
        .map(([label]) => label)
        .sort();

      return {
        name: m.name,
        category: typeof m.category === 'string' ? m.category : 'uncategorized',
        uses: templates.length,
        templates,
        tier: tierFor(templates.length),
      };
    });
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function categoryOrder(entries: DiversityEntry[]): string[] {
  const known = COMPONENT_CATEGORIES as readonly string[];
  const present = new Set(entries.map((e) => e.category));
  const ordered = known.filter((c) => present.has(c));
  const extra = [...present].filter((c) => !known.includes(c)).sort();
  return [...ordered, ...extra];
}

function renderEntry(entry: DiversityEntry): string {
  const badge = `\`[${entry.tier}]\``;
  if (entry.uses === 0) {
    return `- **${entry.name}** ${badge} — no template uses it yet`;
  }
  const plural = entry.uses === 1 ? 'template' : 'templates';
  return `- **${entry.name}** ${badge} — ${entry.uses} ${plural}: ${entry.templates.join(', ')}`;
}

/**
 * Render the diversity menu as markdown.
 *
 * Entries are grouped by category (canonical `COMPONENT_CATEGORIES` order) and,
 * inside a category, sorted least-used first so the unclaimed components are
 * the first thing the agent reads.
 *
 * @param manifests       All component manifests.
 * @param templateSources Template file name -> source text.
 * @param version         `@pxlkit/ui-kit` version stamped in the header.
 */
export function renderDiversityMenu(
  manifests: Manifest[],
  templateSources: TemplateSources,
  version: string,
): string {
  const header = `<!-- GENERATED from @pxlkit/ui-kit v${version} — do not edit; run npm run docs:build -->`;

  const entries = scoreDiversity(manifests, templateSources);
  const scanned = Object.keys(templateSources ?? {}).map(templateLabel).sort();

  const counts = {
    core: entries.filter((e) => e.tier === 'core').length,
    distinctive: entries.filter((e) => e.tier === 'distinctive').length,
    underused: entries.filter((e) => e.tier === 'underused').length,
  };

  const intro = [
    '# Diversity menu',
    '',
    'How many of the real page templates already import each component. Read it',
    'before composing a page: when two components fit equally well, take the one',
    'lower on this list. That is the difference between a page that looks designed',
    'and the seventh copy of the same layout.',
    '',
    'Tiers by template count: `[core]` = 3 or more · `[distinctive]` = 1–2 · `[underused]` = 0.',
    '',
    `Scanned ${scanned.length} template${scanned.length === 1 ? '' : 's'}${scanned.length > 0 ? `: ${scanned.join(', ')}` : ''}.`,
    `Totals: ${counts.core} core · ${counts.distinctive} distinctive · ${counts.underused} underused.`,
    '',
    'An `[underused]` tag is not a defect and not a dare — it means no template has',
    'needed it yet. Use it when it fits the content, never to decorate.',
  ].join('\n');

  const sections = categoryOrder(entries).map((category) => {
    const inCategory = entries
      .filter((e) => e.category === category)
      .sort((a, b) => a.uses - b.uses || a.name.localeCompare(b.name));

    const unused = inCategory.filter((e) => e.uses === 0).length;
    const summary = `${inCategory.length} component${inCategory.length === 1 ? '' : 's'} · ${unused} underused`;

    return `## ${category}\n\n${summary}\n\n${inCategory.map(renderEntry).join('\n')}`;
  });

  return `${header}\n\n${intro}\n\n${sections.join('\n\n')}\n`;
}

export default renderDiversityMenu;
