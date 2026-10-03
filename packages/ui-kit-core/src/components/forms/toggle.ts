/**
 * PixelToggle — the two-state toggle button, standalone or inside a
 * PixelToggleGroup, whose size and variant it takes on.
 */
import { cn, focusRing, surfaceClasses, toneMap, type Surface, type Variant } from '../../common';

export type ToggleGroupSize = 'sm' | 'md' | 'lg';
export type ToggleGroupVariant = Extract<Variant, 'solid' | 'soft' | 'outline' | 'ghost'>;

/** Height, padding, type size and gap of a toggle per group size. */
export const toggleSizeClasses: Record<ToggleGroupSize, string> = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-10 px-3 text-sm gap-2',
  lg: 'h-12 px-4 text-sm gap-2.5',
};

/** Colours of a toggle: cyan while pressed, otherwise the group's variant (`soft` standalone). */
export function toggleStateClasses(pressed: boolean, variant: ToggleGroupVariant): string {
  if (pressed) {
    const cyan = toneMap.cyan;
    return cn(cyan.bg, cyan.text, cyan.border);
  }
  switch (variant) {
    case 'solid':
      return 'bg-retro-surface/60 text-retro-text border-retro-border';
    case 'outline':
      return 'bg-transparent text-retro-muted border-retro-border hover:text-retro-text';
    case 'ghost':
      return 'bg-transparent text-retro-muted border-transparent hover:text-retro-text';
    case 'soft':
    default:
      return 'bg-retro-surface/40 text-retro-muted border-retro-border/60 hover:text-retro-text';
  }
}

export interface ToggleClassOptions {
  pressed: boolean;
  /** Size of the group the toggle is in (`md` standalone). */
  size: ToggleGroupSize;
  /** Variant of the group the toggle is in (`soft` standalone). */
  variant: ToggleGroupVariant;
}

/** The toggle `<button>`. */
export function toggleClasses(surface: Surface, { pressed, size, variant }: ToggleClassOptions): string {
  const s = surfaceClasses(surface);
  return cn(
    'inline-flex items-center justify-center font-medium focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed',
    s.font,
    s.radius,
    s.transition,
    s.border,
    toggleSizeClasses[size],
    focusRing,
    toneMap.cyan.ring,
    toggleStateClasses(pressed, variant),
  );
}
