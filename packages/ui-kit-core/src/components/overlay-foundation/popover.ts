/** PixelPopover — the floating panel and its decorative arrow. */
import { cn, surfaceClasses, type Surface } from '../../common';
import type { FloatingSide } from '../../dom/floating';

/** Stacking order of popover content, above page content and below modals. */
export const POPOVER_Z_INDEX = 70;

/** The popover panel. */
export function popoverContentClasses(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn('bg-retro-bg shadow-xl p-3 outline-none', s.border, s.radiusLg, 'border-retro-border');
}

/** Where the arrow sits for each side the panel opens on. */
export const popoverArrowSideClasses: Record<FloatingSide, string> = {
  top: 'bottom-[-5px] left-1/2 -translate-x-1/2',
  bottom: 'top-[-5px] left-1/2 -translate-x-1/2',
  left: 'right-[-5px] top-1/2 -translate-y-1/2',
  right: 'left-[-5px] top-1/2 -translate-y-1/2',
};

/** The arrow pointing from the panel back to the trigger. */
export function popoverArrowClasses(surface: Surface, side: FloatingSide): string {
  const s = surfaceClasses(surface);
  return cn('absolute h-2 w-2 rotate-45 bg-retro-bg', s.border, 'border-retro-border', popoverArrowSideClasses[side]);
}
