/**
 * PixelChip — the label tag (the badge variant axis), its size scale, its
 * delete button, and the frame a clickable chip with a delete button is split
 * into.
 */
import { cn, surfaceClasses, toneMap, type Size, type Surface, type Tone } from '../../common';
import { badgeVariantClasses, type PixelBadgeVariant } from './badge';

/** Padding, type size and gap per size. */
export const chipSizeClasses: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[11px] gap-1 tracking-wide',
  md: 'px-2.5 py-1 text-xs gap-1.5 tracking-wide',
  lg: 'px-3 py-1.5 text-sm gap-2 tracking-wide',
};

// A button cannot contain a button, so a clickable chip with a delete button
// is a frame around two sibling buttons: the label (the chip's action) and
// the ×. The frame keeps the size's right padding and the action the left and
// vertical padding, so the action covers the whole chip but the × and the
// chip measures what the single button did.
const FRAME_SIZE: Record<Size, string> = {
  sm: 'pr-2 text-[11px] gap-1 tracking-wide',
  md: 'pr-2.5 text-xs gap-1.5 tracking-wide',
  lg: 'pr-3 text-sm gap-2 tracking-wide',
};

const ACTION_SIZE: Record<Size, string> = {
  sm: 'pl-2 py-0.5 gap-1',
  md: 'pl-2.5 py-1 gap-1.5',
  lg: 'pl-3 py-1.5 gap-2',
};

// The frame draws the focus ring while its action has keyboard focus. The
// tone's ring, spelled out: Tailwind only generates classes it finds verbatim.
const ACTION_FOCUS_RING: Record<Tone, string> = {
  green: 'has-[[data-chip-action]:focus-visible]:ring-retro-green/40',
  cyan: 'has-[[data-chip-action]:focus-visible]:ring-retro-cyan/40',
  gold: 'has-[[data-chip-action]:focus-visible]:ring-retro-gold/40',
  red: 'has-[[data-chip-action]:focus-visible]:ring-retro-red/40',
  purple: 'has-[[data-chip-action]:focus-visible]:ring-retro-purple/40',
  pink: 'has-[[data-chip-action]:focus-visible]:ring-retro-pink/40',
  neutral: 'has-[[data-chip-action]:focus-visible]:ring-retro-border/60',
};

export interface ChipClassOptions {
  tone: Tone;
  variant: PixelBadgeVariant;
  size: Size;
  /** The chip is a button (clickable): it gets a hover state and a focus ring. */
  interactive: boolean;
}

export interface ChipClasses {
  root: string;
  /** The chip drawn around its two buttons when it is both clickable and deletable. */
  frame: string;
  /** The label button of that chip (marked `data-chip-action`), reset to let the frame draw the chip. */
  action: string;
  /** Wrapper of the leading icon. */
  icon: string;
  /** The delete (×) button. */
  deleteButton: string;
  /** The × glyph inside the delete button. */
  deleteIcon: string;
}

/** Classes of every part of the chip. */
export function chipClasses(surface: Surface, { tone, variant, size, interactive }: ChipClassOptions): ChipClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return {
    root: cn(
      'inline-flex items-center',
      s.border,
      s.radius,
      s.font,
      chipSizeClasses[size],
      badgeVariantClasses(variant, tone),
      interactive &&
        cn(
          'cursor-pointer transition-colors',
          t.hover,
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
          t.ring,
        ),
    ),
    frame: cn(
      'inline-flex items-center',
      s.border,
      s.radius,
      s.font,
      FRAME_SIZE[size],
      badgeVariantClasses(variant, tone),
      'cursor-pointer transition-colors',
      t.hover,
      'has-[[data-chip-action]:focus-visible]:ring-2 has-[[data-chip-action]:focus-visible]:ring-offset-2 has-[[data-chip-action]:focus-visible]:ring-offset-retro-bg',
      ACTION_FOCUS_RING[tone],
    ),
    action: cn(
      'inline-flex items-center',
      ACTION_SIZE[size],
      'bg-transparent border-0 m-0 [font:inherit] text-inherit cursor-pointer focus-visible:outline-none',
    ),
    icon: 'inline-flex items-center shrink-0',
    deleteButton: cn(
      'p-0.5 transition-colors hover:bg-retro-bg/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-retro-bg',
      t.ring,
      s.radius,
    ),
    deleteIcon: 'h-2 w-2',
  };
}

/** Accessible name of the delete button. */
export function chipDeleteLabel(label: string): string {
  return `Remove ${label}`;
}
