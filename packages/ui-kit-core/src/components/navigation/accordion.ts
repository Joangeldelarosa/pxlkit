/**
 * PixelAccordion — a stack of disclosure items: each header is a button that
 * shows and hides its panel, one item open at a time unless several are
 * allowed, and the first item open on first render unless every item starts
 * collapsed. A header reports `aria-expanded` and controls its panel, which
 * refers back to it; a closed panel is not rendered.
 */
import { cn, focusRing, surfaceClasses, type Surface } from '../../common';

/** The items open on first render: the first one, unless `collapsedByDefault`. */
export function accordionInitialOpen(items: readonly { id: string }[], collapsedByDefault: boolean): string[] {
  return !collapsedByDefault && items[0] ? [items[0].id] : [];
}

/**
 * The open items after the header of item `id` is pressed: an open item
 * closes; a closed one opens, alone unless `allowMultiple`.
 */
export function toggleAccordionItem(open: readonly string[], id: string, allowMultiple: boolean): string[] {
  if (open.includes(id)) return open.filter((openId) => openId !== id);
  return allowMultiple ? [...open, id] : [id];
}

/**
 * Ids of an item's header and panel, from the accordion's generated base id:
 * the header controls the panel (`aria-controls`). The panel has no role, so
 * it takes no name (ARIA prohibits `aria-labelledby` on it).
 */
export function accordionIds(baseId: string, itemId: string): { header: string; panel: string } {
  return { header: `${baseId}-h-${itemId}`, panel: `${baseId}-p-${itemId}` };
}

/** The stack of items. */
export const accordionClasses = 'space-y-1.5';

export interface AccordionItemClasses {
  /** The framed item, holding the header and the panel. */
  item: string;
  /** The header button. */
  trigger: string;
  /** The chevron in the header, turned while open. */
  chevron: string;
  /** The panel. */
  panel: string;
}

/** Classes of every part of an item. */
export function accordionItemClasses(surface: Surface, open: boolean): AccordionItemClasses {
  const s = surfaceClasses(surface);
  return {
    item: cn('bg-retro-surface/40', s.border, s.radius, 'border-retro-border/40'),
    // The item's cut corners on the pixel surface would clip the header's
    // focus ring, so there the header's edge lights up inside the item.
    trigger: cn(
      'flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-retro-text focus-visible:outline-hidden transition-colors hover:bg-retro-surface/60',
      s.font,
      surface === 'pixel' ? 'focus-visible:pxl-focus-inset' : cn(focusRing, 'focus-visible:ring-retro-cyan/30'),
    ),
    chevron: cn('text-retro-muted transition-transform duration-200', open && 'rotate-180'),
    panel: 'border-t border-retro-border/30 px-3 py-2.5 text-sm text-retro-muted',
  };
}
