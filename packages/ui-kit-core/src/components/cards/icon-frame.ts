/**
 * PixelIconFrame — a decorative, toned frame around an icon: its sizes and
 * shapes, the corner accent badge and the pulse.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { tone as toneTokens, type ToneKey } from '../../tokens';

/** Width and height of the frame, in px. */
export type IconFrameSize = 48 | 56 | 64 | 80 | 112;
/** `square` keeps the surface's corners. */
export type IconFrameShape = 'square' | 'rounded' | 'circle';
/** The corner the accent badge sits on. */
export type IconFrameAccentPosition = 'top-right' | 'bottom-right';

export const iconFrameSizeClasses: Record<IconFrameSize, string> = {
  48: 'w-12 h-12',
  56: 'w-14 h-14',
  64: 'w-16 h-16',
  80: 'w-20 h-20',
  112: 'w-28 h-28',
};

/** The accent overhangs its corner by a few pixels. */
export const iconFrameAccentPositionClasses: Record<IconFrameAccentPosition, string> = {
  'top-right': 'absolute top-0 right-0 -mt-1.5 -mr-1.5',
  'bottom-right': 'absolute bottom-0 right-0 -mb-1.5 -mr-1.5',
};

export interface IconFrameOptions {
  size: IconFrameSize;
  tone: ToneKey;
  shape: IconFrameShape;
  /** Corner of the accent badge; top-right when left out. */
  accentPosition?: IconFrameAccentPosition;
  /** Pulse the frame. */
  animated: boolean;
  /** The user prefers reduced motion: the frame never pulses. */
  reducedMotion: boolean;
}

export interface IconFrameClasses {
  root: string;
  /** Wrapper of the icon. */
  icon: string;
  /** The accent badge in a corner. */
  accent: string;
}

/** Classes of every part of the icon frame. */
export function iconFrameClasses(
  surface: Surface,
  { size, tone, shape, accentPosition = 'top-right', animated, reducedMotion }: IconFrameOptions,
): IconFrameClasses {
  const s = surfaceClasses(surface);
  const t = toneTokens[tone];
  return {
    root: cn(
      'relative inline-flex items-center justify-center',
      iconFrameSizeClasses[size],
      s.border,
      t.border,
      t.soft,
      t.text,
      shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-md' : s.radius,
      // Still before hydration too, for a reader who prefers reduced motion.
      animated && !reducedMotion && 'motion-safe:animate-pulse',
    ),
    icon: 'inline-flex items-center justify-center',
    accent: cn(
      'inline-flex items-center justify-center w-4 h-4',
      iconFrameAccentPositionClasses[accentPosition],
      s.border,
      t.border,
      t.bg,
      shape === 'circle' ? 'rounded-full' : s.radius,
    ),
  };
}
