/**
 * PixelBadgeGroup — the wrapping badge row, the "+N" button that opens the
 * overflow popover, and the row of hidden badges inside it.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

/** The row. */
export const badgeGroupClasses = 'inline-flex flex-row flex-wrap items-center gap-1.5';

/** The hidden badges, inside the overflow popover. */
export const badgeGroupOverflowClasses = 'flex flex-row flex-wrap items-center gap-1.5 max-w-xs';

/** The "+N" button that opens the overflow popover. */
export function badgeGroupTriggerClasses(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn(
    'inline-flex items-center px-2.5 py-1 text-[11px] leading-none',
    'bg-retro-surface/40 text-retro-text border-retro-border',
    'transition-colors hover:bg-retro-surface/70',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/60',
    s.border,
    s.radiusFull,
    s.font,
  );
}

/** Accessible name of the "+N" button. */
export function badgeGroupTriggerLabel(hidden: number): string {
  return `Show ${hidden} more`;
}
