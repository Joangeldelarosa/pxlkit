/**
 * PixelRibbon — the label pinned over a card's edge: its position presets
 * and offsets, the tilt of the corner presets, and the text colour on its
 * opaque tone fill.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { tone as toneTokens, type ToneKey } from '../../tokens';

/** Where the ribbon sits on its relatively positioned container. */
export type RibbonPosition = 'top-center' | 'top-left' | 'top-right' | 'corner-tl' | 'corner-tr';
/** How far a top ribbon rises above its container's edge. */
export type RibbonOffset = 'sm' | 'md' | 'lg';

/** Rise of the top positions above the container's edge, per offset. */
export const ribbonOffsetClasses: Record<RibbonOffset, string> = {
  sm: '-top-2',
  md: '-top-3',
  lg: '-top-4',
};

/** Placement; the corner positions sit inside their corner, whatever the offset. */
export function ribbonPositionClasses(position: RibbonPosition, offset: RibbonOffset): string {
  const top = ribbonOffsetClasses[offset];
  switch (position) {
    case 'top-center':
      return cn(top, 'left-1/2 -translate-x-1/2');
    case 'top-left':
      return cn(top, 'left-4');
    case 'top-right':
      return cn(top, 'right-4');
    case 'corner-tl':
      return 'top-3 left-3';
    case 'corner-tr':
      return 'top-3 right-3';
  }
}

/** The ribbon's tilt in degrees: `tilt`, else 12° outwards in a corner and none on top. */
export function ribbonTilt(position: RibbonPosition, tilt: number | undefined): number {
  if (tilt !== undefined) return tilt;
  if (position === 'corner-tl') return -12;
  if (position === 'corner-tr') return 12;
  return 0;
}

/** Tailwind's rotate steps; other tilts are set inline (`ribbonTransform`). */
const TILT_CLASSES: ReadonlyMap<number, string> = new Map([
  [12, 'rotate-12'],
  [-12, '-rotate-12'],
  [6, 'rotate-6'],
  [-6, '-rotate-6'],
  [3, 'rotate-3'],
  [-3, '-rotate-3'],
  [45, 'rotate-45'],
  [-45, '-rotate-45'],
]);

/** The rotate class of a tilt, or `null` without a tilt or without a Tailwind step for it. */
export function ribbonTiltClass(tilt: number): string | null {
  return TILT_CLASSES.get(tilt) ?? null;
}

/** The inline `transform` of a tilt without a Tailwind step (`rotate(7deg)`), or `null`. */
export function ribbonTransform(tilt: number): string | null {
  return tilt !== 0 && !ribbonTiltClass(tilt) ? `rotate(${tilt}deg)` : null;
}

/** Text on the opaque tone fill: the light page text on purple and red, the page background on the rest. */
export function ribbonTextClass(tone: ToneKey): string {
  return tone === 'purple' || tone === 'red' ? 'text-retro-text' : 'text-retro-bg';
}

export interface RibbonOptions {
  position: RibbonPosition;
  tone: ToneKey;
  offset: RibbonOffset;
  /** Tilt in degrees; the position's own when left out (see `ribbonTilt`). */
  tilt?: number;
}

/** The ribbon: an opaque tone label that never takes the pointer from the card under it. */
export function ribbonClasses(surface: Surface, { position, tone, offset, tilt }: RibbonOptions): string {
  const s = surfaceClasses(surface);
  const t = toneTokens[tone];
  return cn(
    'absolute z-10 pointer-events-none select-none',
    'inline-flex items-center px-2 py-1 text-[10px] font-semibold uppercase tracking-wider',
    s.border,
    s.radius,
    // The pixel face; on linear the display face is the weight above, and its
    // tight letter-spacing would compete with the ribbon's wide one.
    surface === 'pixel' && s.fontDisplay,
    t.fill,
    t.border,
    ribbonTextClass(tone),
    ribbonPositionClasses(position, offset),
    ribbonTiltClass(ribbonTilt(position, tilt)),
  );
}
