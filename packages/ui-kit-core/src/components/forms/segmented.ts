/** PixelSegmented — a caption over a row of mutually exclusive segments. */
import { cn, focusRing, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';

export interface SegmentedClasses {
  root: string;
  /** The caption above the segments. */
  label: string;
  /** The row holding the segments. */
  track: string;
}

/** Classes of the control around its segments. */
export function segmentedClasses(surface: Surface, disabled: boolean): SegmentedClasses {
  const s = surfaceClasses(surface);
  return {
    root: cn('space-y-1.5', disabled && 'opacity-50 cursor-not-allowed'),
    label: cn('text-xs text-retro-muted', s.font),
    track: cn(
      'inline-flex max-w-full overflow-x-auto bg-retro-surface/50 p-0.5',
      s.border,
      s.radius,
      'border-retro-border-strong/60',
    ),
  };
}

export interface SegmentClassOptions {
  tone: Tone;
  /** The segment holds the selected value. */
  active: boolean;
  disabled: boolean;
}

/** One segment button. */
export function segmentClasses(surface: Surface, { tone, active, disabled }: SegmentClassOptions): string {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return cn(
    'px-3 py-1.5 text-xs outline-none whitespace-nowrap',
    s.font,
    s.radius,
    s.transition,
    focusRing,
    t.ring,
    active
      ? cn(t.bg, t.text, 'border border-transparent shadow-sm')
      : 'border border-transparent text-retro-muted hover:text-retro-text',
    disabled && 'cursor-not-allowed',
  );
}

/**
 * Accessible name of the segments: the `aria-label` given, else the visible
 * label. Without one the row is no named group at all.
 */
export function segmentedGroupName(ariaLabel: string | undefined, label: string | undefined): string | undefined {
  return ariaLabel || label || undefined;
}
