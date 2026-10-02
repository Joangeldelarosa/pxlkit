/**
 * PixelAvatarGroup — the overlapping row of avatar slots and the "+N" tile
 * counting the avatars left out.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { tone as toneTokens, type ToneKey } from '../../tokens';
import type { PixelAvatarSize } from './avatar';

/** The row. */
export const avatarGroupClasses = 'inline-flex flex-row items-center';

/** Slot dimensions and type size per size. */
export const avatarGroupSizeClasses: Record<PixelAvatarSize, string> = {
  xs: 'h-6 w-6 text-[8px]',
  sm: 'h-8 w-8 text-[9px]',
  md: 'h-10 w-10 text-[10px]',
  lg: 'h-12 w-12 text-xs',
  xl: 'h-14 w-14 text-sm',
};

/** How far a slot overlaps the one before it, per size. */
export const avatarGroupOverlapClasses: Record<PixelAvatarSize, string> = {
  xs: '-ml-2',
  sm: '-ml-2.5',
  md: '-ml-3',
  lg: '-ml-3.5',
  xl: '-ml-4',
};

const SLOT_RADIUS: Record<Surface, string> = {
  pixel: 'rounded-[3px]',
  linear: 'rounded-full',
};

function slotClasses(surface: Surface, size: PixelAvatarSize, overlap: boolean): string {
  const s = surfaceClasses(surface);
  // The page-coloured ring separates overlapping slots from each other.
  return cn(
    'inline-flex items-center justify-center overflow-hidden bg-retro-bg',
    s.border,
    'border-retro-border',
    SLOT_RADIUS[surface],
    avatarGroupSizeClasses[size],
    'ring-2 ring-retro-bg',
    overlap && avatarGroupOverlapClasses[size],
  );
}

/** The slot around one avatar; every slot but the first overlaps the one before. */
export function avatarGroupSlotClasses(surface: Surface, size: PixelAvatarSize, index: number): string {
  return slotClasses(surface, size, index > 0);
}

/** The "+N" tile, in the group's tone; it overlaps the last avatar when one shows. */
export function avatarGroupOverflowClasses(
  surface: Surface,
  size: PixelAvatarSize,
  tone: ToneKey,
  afterAvatars: boolean,
): string {
  const t = toneTokens[tone];
  return cn(slotClasses(surface, size, afterAvatars), t.border, t.text, surfaceClasses(surface).font, 'font-pixel');
}

/** What the "+N" tile says to assistive technology, which does not read its visible "+N". */
export function avatarGroupOverflowLabel(hidden: number): string {
  return `${hidden} more users`;
}
