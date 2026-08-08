/**
 * skill-refs/components
 *
 * Renders the per-category component digest consumed by the pxlkit Claude Code
 * skills. The output is a *digest*, not documentation: every component gets
 * 3–6 dense lines so a whole category fits in an agent's context window.
 *
 * Consumed by `generate-skill-refs.ts` (Task A6), which feeds it the manifests
 * collected by the `scan` pipeline step.
 */

import type { Manifest } from '../manifest-schema.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * A single public prop signature.
 *
 * Structurally compatible with `PropEntry` from `generate-docs-page.ts`
 * (`{ name, type, required, defaultValue, description }`) so an extractor that
 * already produces those can be piped straight in.
 *
 * NOTE: manifests declare `props: 'auto'`, but no reusable extractor exists in
 * `scripts/build-docs` yet — `react-docgen-typescript` is only pulled in by
 * Storybook's vite plugin inside `packages/ui-kit`. Until such an extractor
 * lands, callers may inject signatures explicitly through the optional `props`
 * parameter of {@link renderComponentsDigest}; omitting it simply drops the
 * props line.
 */
export interface PropSignature {
  name: string;
  type: string;
  required?: boolean;
  /** Rendered default, already stringified (e.g. `"false"`, `"green"`). */
  defaultValue?: string;
  description?: string;
}

/** Map of component name -> its public prop signatures. */
export type PropSignatureMap = Record<string, PropSignature[]>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collapse whitespace so a multi-line manifest string stays on one digest line. */
function oneLine(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string' && v.length > 0)
    : [];
}

/**
 * `name: type = default`.
 *
 * A prop with a default is self-evidently optional, so it needs no marker; a
 * prop with neither default nor `required` gets a `?` so the three cases stay
 * distinguishable without spending a word on any of them.
 */
function formatProp(prop: PropSignature): string {
  const hasDefault =
    typeof prop.defaultValue === 'string' && prop.defaultValue.length > 0;
  if (hasDefault) return `${prop.name}: ${prop.type} = ${prop.defaultValue}`;
  const optional = prop.required === true ? '' : '?';
  return `${prop.name}${optional}: ${prop.type}`;
}

/**
 * Only the exceptions are worth bytes: an SSR-safe, tree-shakable component is
 * the norm, so it gets no flag line at all.
 */
function formatFlags(manifest: Manifest): string | undefined {
  const flags: string[] = [];
  if (manifest.ssrSafe === false) flags.push('client-only (not SSR-safe)');
  if (manifest.treeShakable === false) flags.push('not tree-shakable');
  return flags.length > 0 ? `- ⚠ ${flags.join(' · ')}` : undefined;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/** Hard budget per entry — the digest must stay dense enough to fit in context. */
const MAX_LINES = 6;

/**
 * Render one component entry — 3 lines minimum, {@link MAX_LINES} maximum.
 *
 * Three lines are mandatory (heading, status/since, description); the rest
 * compete for the remaining budget and are emitted in descending usefulness to
 * an agent about to write code:
 *
 *   1. flags    — an SSR-unsafe component used in a server component *breaks*.
 *   2. props    — the actual API surface.
 *   3. highlights
 *   4. related  — a discovery nicety; the first thing worth sacrificing.
 *
 * Overflow therefore drops `related` (then `highlights`) rather than whatever
 * happened to be appended last.
 */
function renderEntry(manifest: Manifest, props: PropSignature[] | undefined): string {
  const status = oneLine(manifest.status) || 'unknown';
  const since = oneLine(manifest.since) || '0.0.0';

  const required: string[] = [
    `### ${manifest.name}`,
    `- ${status} · since ${since}`,
    `- ${oneLine(manifest.description) || 'No description.'}`,
  ];

  const highlights = asStringArray(manifest.highlights).map(oneLine);
  const related = asStringArray(manifest.related);

  // Ordered by descending priority; `undefined` entries are simply absent.
  const optional: Array<string | undefined> = [
    formatFlags(manifest),
    props && props.length > 0
      ? `- props: ${props.map(formatProp).join('; ')}`
      : undefined,
    highlights.length > 0 ? `- ${highlights.join(' · ')}` : undefined,
    related.length > 0 ? `- related: ${related.join(', ')}` : undefined,
  ];

  const kept = optional
    .filter((line): line is string => typeof line === 'string')
    .slice(0, MAX_LINES - required.length);

  return [...required, ...kept].join('\n');
}

/**
 * Render the markdown digest for a single component category.
 *
 * @param manifests All manifests (any category); filtered internally.
 * @param category  The category to emit, e.g. `"actions"`.
 * @param version   The `@pxlkit/ui-kit` version stamped in the generated header.
 * @param props     Optional map of component name -> prop signatures. When
 *                  supplied, each component gains a `props:` line rendered as
 *                  `name: type = default`. See {@link PropSignature}.
 */
export function renderComponentsDigest(
  manifests: Manifest[],
  category: string,
  version: string,
  props?: PropSignatureMap,
): string {
  const header = `<!-- GENERATED from @pxlkit/ui-kit v${version} — do not edit; run npm run docs:build -->`;

  const inCategory = (Array.isArray(manifests) ? manifests : []).filter(
    (m) => m && m.category === category,
  );

  const body = inCategory
    .map((m) => renderEntry(m, props?.[m.name]))
    .join('\n\n');

  const count = inCategory.length;
  const summary = `${count} component${count === 1 ? '' : 's'}. Import from \`@pxlkit/ui-kit\`.`;

  return `${header}\n\n# ${category}\n\n${summary}\n\n${body}\n`;
}

export default renderComponentsDigest;
