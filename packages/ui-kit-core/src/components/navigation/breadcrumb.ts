/**
 * PixelBreadcrumb — the trail of crumbs in a `<nav>` landmark: an ordered
 * list whose crumbs are separated by a pixel chevron (pixel surface) or a
 * slash (linear surface), both hidden from assistive technology. The current
 * page is plain text marked `aria-current="page"`.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import type { PixelGlyphRect } from '../../glyphs';

/** What a crumb renders as. */
export type BreadcrumbCrumbKind = 'current' | 'button' | 'link' | 'text';

/**
 * What a crumb renders as: the `active` crumb is the current page; any other
 * crumb is a button when it has an `onClick` (which wins over `href`), a link
 * when it has an `href`, and plain text otherwise.
 */
export function breadcrumbCrumbKind(item: { active?: boolean; onClick?: unknown; href?: string }): BreadcrumbCrumbKind {
  if (item.active) return 'current';
  if (item.onClick) return 'button';
  if (item.href) return 'link';
  return 'text';
}

/** The `<nav>`. */
export function breadcrumbClasses(surface: Surface): string {
  return cn('flex items-center gap-1.5 text-xs', surfaceClasses(surface).font);
}

/** The `<ol>`. */
export const breadcrumbListClasses = 'flex flex-wrap items-center gap-1.5';

/** A crumb's `<li>`, which also holds the separator before it. */
export const breadcrumbItemClasses = 'flex items-center gap-1.5';

/** A link or button crumb; keyboard focus underlines it, 2px thick so it shows on a short crumb. */
export const breadcrumbLinkClasses =
  'text-retro-muted transition-colors hover:text-retro-green focus:outline-none focus-visible:underline focus-visible:decoration-2';

/** The current page. */
export const breadcrumbCurrentClasses = 'text-retro-text font-medium';

/** A plain-text crumb. */
export const breadcrumbTextClasses = 'text-retro-muted';

/** The slash between crumbs on the linear surface. */
export const breadcrumbSlashClasses = 'text-retro-border';

/** The pixel chevron between crumbs on the pixel surface, drawn on an 8×8 grid. */
export const breadcrumbChevron = {
  viewBox: '0 0 8 8',
  className: 'h-2 w-2 shrink-0 text-retro-border',
  style: { display: 'inline-block', verticalAlign: 'middle', overflow: 'visible' },
  rects: [
    [2, 1, 1, 1],
    [3, 2, 1, 1],
    [4, 3, 2, 1],
    [3, 5, 1, 1],
    [2, 6, 1, 1],
  ] as readonly PixelGlyphRect[],
} as const;
