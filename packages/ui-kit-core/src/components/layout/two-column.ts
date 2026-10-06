/**
 * PixelTwoColumn — two columns side by side at a fixed ratio, stacked below
 * a breakpoint.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { stackGap, type StackGapKey } from '../../tokens';
import type { GridAlign } from './grid';
import { stackAlignClasses } from './stack';

/** Width of the left column against the right one. */
export type TwoColumnRatio = '50/50' | '60/40' | '40/60' | '70/30' | '30/70';
/** Breakpoint below which the columns stack. */
export type TwoColumnBreakpoint = 'sm' | 'md' | 'lg';

// Spelled out in full: Tailwind only generates classes it finds verbatim.
/** Column template of the ratio at every width. */
export const twoColumnRatioClasses: Record<TwoColumnRatio, string> = {
  '50/50': 'grid-cols-[1fr_1fr]',
  '60/40': 'grid-cols-[3fr_2fr]',
  '40/60': 'grid-cols-[2fr_3fr]',
  '70/30': 'grid-cols-[7fr_3fr]',
  '30/70': 'grid-cols-[3fr_7fr]',
};

/** Column template of the ratio from a breakpoint up. */
export const twoColumnStackedRatioClasses: Record<TwoColumnBreakpoint, Record<TwoColumnRatio, string>> = {
  sm: {
    '50/50': 'sm:grid-cols-[1fr_1fr]',
    '60/40': 'sm:grid-cols-[3fr_2fr]',
    '40/60': 'sm:grid-cols-[2fr_3fr]',
    '70/30': 'sm:grid-cols-[7fr_3fr]',
    '30/70': 'sm:grid-cols-[3fr_7fr]',
  },
  md: {
    '50/50': 'md:grid-cols-[1fr_1fr]',
    '60/40': 'md:grid-cols-[3fr_2fr]',
    '40/60': 'md:grid-cols-[2fr_3fr]',
    '70/30': 'md:grid-cols-[7fr_3fr]',
    '30/70': 'md:grid-cols-[3fr_7fr]',
  },
  lg: {
    '50/50': 'lg:grid-cols-[1fr_1fr]',
    '60/40': 'lg:grid-cols-[3fr_2fr]',
    '40/60': 'lg:grid-cols-[2fr_3fr]',
    '70/30': 'lg:grid-cols-[7fr_3fr]',
    '30/70': 'lg:grid-cols-[3fr_7fr]',
  },
};

export interface TwoColumnOptions {
  ratio: TwoColumnRatio;
  /** Gap token (`stackGap`). */
  gap: StackGapKey;
  /** Breakpoint below which the columns stack; side by side at every width when left out. */
  stackBelow?: TwoColumnBreakpoint;
  /** Block-axis alignment of the columns. */
  align?: GridAlign;
  /** Surface border and radius. */
  bordered?: boolean;
}

/** The two-column grid. */
export function twoColumnClasses(
  surface: Surface,
  { ratio, gap, stackBelow, align, bordered = false }: TwoColumnOptions,
): string {
  const s = surfaceClasses(surface);
  return cn(
    'grid',
    stackBelow ? 'grid-cols-1' : '',
    stackBelow ? twoColumnStackedRatioClasses[stackBelow][ratio] : twoColumnRatioClasses[ratio],
    stackGap[gap],
    align && stackAlignClasses[align],
    bordered && s.border,
    bordered && s.radius,
    bordered && 'border-retro-border',
    s.transition,
  );
}

/** The two columns; reversed, the right one comes first on screen (CSS `order`). */
export function twoColumnSideClasses(reverse: boolean): { left: string; right: string } {
  return { left: cn(reverse && 'order-2'), right: cn(reverse && 'order-1') };
}
