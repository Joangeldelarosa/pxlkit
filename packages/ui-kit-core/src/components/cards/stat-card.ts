/**
 * PixelStatCard — a compact metric: label, value, trend line and icon, in
 * three sizes, with the icon above, beside or in a corner.
 */
import { cn, surfaceClasses, toneMap, type Size, type Surface, type Tone } from '../../common';

export type PixelStatCardSize = Size;
export type PixelStatCardIconPosition = 'left' | 'right' | 'top' | 'bottom-left';

const PADDING: Record<PixelStatCardSize, string> = { sm: 'p-3', md: 'p-4', lg: 'p-6' };
const CAPTION: Record<PixelStatCardSize, string> = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };
const ICON: Record<PixelStatCardSize, string> = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg' };
const GAP: Record<PixelStatCardSize, string> = { sm: 'mt-1.5', md: 'mt-2', lg: 'mt-3' };
/** How the root lays out the icon and the text, per icon position. */
const LAYOUT: Record<PixelStatCardIconPosition, string | null> = {
  top: null,
  right: 'grid grid-cols-[1fr_auto] items-center gap-3',
  left: 'flex items-center gap-3',
  'bottom-left': 'relative overflow-hidden',
};
/** The value is pixel type on the pixel surface. */
const VALUE: Record<Surface, Record<PixelStatCardSize, string>> = {
  pixel: { sm: 'text-xs font-pixel', md: 'text-sm font-pixel', lg: 'text-lg font-pixel' },
  linear: { sm: 'text-sm font-semibold', md: 'text-base font-semibold', lg: 'text-2xl font-semibold' },
};

export interface StatCardOptions {
  /** Tone of the chrome, the icon and, with `valueTone`, the value. */
  tone: Tone;
  size: PixelStatCardSize;
  iconPosition: PixelStatCardIconPosition;
  /** Colours the value with the tone. */
  valueTone: boolean;
  align: 'start' | 'center';
  /** Surface border, radius and tone tint. */
  bordered: boolean;
}

export interface StatCardClasses {
  root: string;
  /** The row of label and icon (`top`), or of the label alone (`bottom-left`). */
  header: string;
  /** The column of label, value and trend beside the icon (`left`, `right`). */
  content: string;
  label: string;
  /** Wrapper of the value under the label, beside the icon. */
  valueRow: string;
  value: string;
  trend: string;
  icon: string;
  /** The icon pinned to the bottom-left corner. */
  cornerIcon: string;
}

/** Classes of every part of the stat card. */
export function statCardClasses(
  surface: Surface,
  { tone, size, iconPosition, valueTone, align, bordered }: StatCardOptions,
): StatCardClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  const centered = align === 'center';
  const base = cn(
    PADDING[size],
    centered && 'text-center',
    bordered && s.border,
    bordered && s.radiusLg,
    bordered && t.border,
    bordered && t.soft,
  );
  return {
    root: cn(base, LAYOUT[iconPosition]),
    header:
      iconPosition === 'bottom-left'
        ? 'mb-3 flex items-center justify-between'
        : cn('mb-3 flex items-center', centered ? 'justify-center gap-2' : 'justify-between'),
    content: iconPosition === 'left' ? 'min-w-0 flex-1' : 'min-w-0',
    label: cn(CAPTION[size], 'text-retro-muted', s.font),
    valueRow: GAP[size],
    value: cn(valueTone ? t.text : 'text-retro-text', VALUE[surface][size]),
    trend: cn(GAP[size], CAPTION[size], 'text-retro-muted', s.font),
    icon: cn('inline-flex items-center justify-center shrink-0', ICON[size], t.text),
    cornerIcon: cn('absolute bottom-0 left-0 inline-flex max-w-full items-center justify-center', PADDING[size], ICON[size], t.text),
  };
}
