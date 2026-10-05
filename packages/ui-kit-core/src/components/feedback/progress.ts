/**
 * PixelProgress — a progress bar: ten segmented HP-bar blocks on the pixel
 * surface, a smooth filled track on the linear one.
 */
import { cn, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';

/** Blocks of the pixel surface's segmented bar, 10 % each. */
export const PROGRESS_SEGMENTS = 10;

/** Accessible name of a progress bar without a label. */
export const PROGRESS_DEFAULT_LABEL = 'Progress';

/** The value shown and announced: clamped to 0–100. */
export function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export interface ProgressClasses {
  root: string;
  /** The row of label and percentage above the bar. */
  header: string;
  /** The percentage, in the tone colour. */
  value: string;
  /** The `progressbar` element: the segment row (pixel) or the track (linear). */
  track: string;
  /** The fill inside the linear track. */
  fill: string;
}

/** Classes of every part of the progress bar for a surface and tone. */
export function progressClasses(surface: Surface, tone: Tone, { indeterminate }: { indeterminate: boolean }): ProgressClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return {
    root: 'space-y-1.5',
    header: cn('flex items-center justify-between text-xs text-retro-muted', s.font),
    value: t.text,
    track:
      surface === 'pixel'
        ? cn('flex gap-0.5 p-0.5', s.border, s.radius, 'border-retro-border/60 bg-retro-surface/60')
        : 'h-2.5 overflow-hidden rounded-full border border-retro-border bg-retro-surface/80',
    // Indeterminate, it pulses — or, for a reader who prefers reduced motion,
    // holds still at 70 % as the pixel blocks do, so it does not read as full.
    fill: cn('h-full rounded-full transition-all duration-500', t.bg, indeterminate && 'motion-safe:animate-pulse motion-reduce:opacity-70'),
  };
}

/**
 * Classes of the pixel surface's ten blocks: a block is filled once the value
 * covers it, half-lit while the value is inside it, and every block pulses
 * while indeterminate (still, at 70 %, for a reader who prefers reduced motion).
 */
export function progressSegmentClasses(value: number, tone: Tone, { indeterminate }: { indeterminate: boolean }): string[] {
  const fill = toneMap[tone].fill;
  const safe = clampProgress(value);
  return Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => {
    const filled = (i + 1) * 10 <= safe;
    const partial = !filled && i * 10 < safe;
    return cn(
      'h-2 flex-1 rounded-[1px] transition-all duration-150',
      indeterminate
        ? cn(fill, 'opacity-70 motion-safe:animate-pulse')
        : filled
          ? fill
          : partial
            ? cn(fill, 'opacity-50')
            : 'bg-retro-bg/40',
    );
  });
}

/** Width of the linear fill: the whole track while indeterminate. */
export function progressFillWidth(value: number, { indeterminate }: { indeterminate: boolean }): string {
  return indeterminate ? '100%' : `${clampProgress(value)}%`;
}
