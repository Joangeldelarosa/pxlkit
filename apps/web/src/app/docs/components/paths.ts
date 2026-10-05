/**
 * Where each component's own page lives: /docs/components/<slug>, beside its
 * entry in /docs's component reference (/docs#<slug>). The docs build writes
 * the same path into the sections' related links
 * (scripts/build-docs/_lib/component-pages.ts).
 */
export function componentPagePath(slug: string): string {
  return `/docs/components/${slug}`;
}

/** The component's entry in /docs's component reference, which opens on arrival. */
export function componentReferencePath(slug: string): string {
  return `/docs#${slug}`;
}
