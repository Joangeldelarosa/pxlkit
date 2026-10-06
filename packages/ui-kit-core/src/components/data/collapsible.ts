/** PixelCollapsible — the optional frame, the header button and its chevron, the body, and the ids that wire them. */
import { cn, focusRing, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';

export interface CollapsibleClasses {
  /** The wrapper, framed when `bordered`. */
  root: string;
  /** The header button: a compact ghost button of the tone. */
  trigger: string;
  /** The chevron in the header, turned while open. */
  chevron: string;
  /** The body. */
  content: string;
}

/** Classes of every part of the collapsible. */
export function collapsibleClasses(
  surface: Surface,
  { bordered, open, tone }: { bordered: boolean; open: boolean; tone: Tone },
): CollapsibleClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return {
    root: cn(bordered && s.border, bordered && s.radius, bordered && 'border-retro-border'),
    trigger: cn(
      'inline-flex items-center justify-center gap-1.5 px-1.5 py-0.5 text-xs font-medium focus-visible:outline-hidden',
      s.font,
      s.radius,
      s.transition,
      focusRing,
      t.ring,
      t.text,
      'border border-transparent bg-transparent',
      t.hover,
      'active:scale-[0.97]',
    ),
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
