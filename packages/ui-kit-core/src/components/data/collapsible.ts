/** PixelCollapsible — the optional frame, the header's chevron and the body, and the ids that wire them. */
import { cn, surfaceClasses, type Surface } from '../../common';

export interface CollapsibleClasses {
  /** The wrapper, framed when `bordered`. */
  root: string;
  /** Added to the ghost header button, to make it compact. */
  trigger: string;
  /** The chevron in the header, turned while open. */
  chevron: string;
  /** The body. */
  content: string;
}

/** Classes of every part of the collapsible. */
export function collapsibleClasses(surface: Surface, { bordered, open }: { bordered: boolean; open: boolean }): CollapsibleClasses {
  const s = surfaceClasses(surface);
  return {
    root: cn(bordered && s.border, bordered && s.radius, bordered && 'border-retro-border'),
    trigger: 'h-auto px-1.5 py-0.5 text-xs',
    chevron: cn('transition-transform', open && 'rotate-180'),
    content: 'mt-2',
  };
}

/**
 * Ids of the header button and the body, from one generated base id: the
 * button controls the body (`aria-controls`). The body has no role, so it
 * takes no name (ARIA prohibits `aria-labelledby` on it).
 */
export function collapsibleIds(baseId: string): { trigger: string; content: string } {
  return { trigger: `${baseId}-trigger`, content: `${baseId}-content` };
}
