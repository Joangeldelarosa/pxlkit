/**
 * PixelScrollArea — a focusable scroll region (`role="region"`) with a
 * styled scrollbar. The scrollbar palette lives in the stylesheet
 * (`.pxl-scroll-*`); the recipe wires the visibility mode and dimensions.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import type { AccessibleNameAttributes } from './box';

/** When the scrollbar shows. */
export type ScrollAreaVariant = 'auto' | 'always' | 'scroll' | 'hover';

/** Scrollbar class and overflow per visibility mode. */
export const scrollAreaVariantClasses: Record<ScrollAreaVariant, string> = {
  auto: 'pxl-scroll-auto overflow-auto',
  always: 'pxl-scroll-always overflow-scroll',
  scroll: 'pxl-scroll-scroll overflow-scroll',
  hover: 'pxl-scroll-hover overflow-auto',
};

export interface ScrollAreaOptions {
  variant: ScrollAreaVariant;
  /** Surface border and radius. */
  bordered?: boolean;
}

/** The region. */
export function scrollAreaClasses(surface: Surface, { variant, bordered = false }: ScrollAreaOptions): string {
  const s = surfaceClasses(surface);
  return cn(
    'relative focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-retro-cyan/40',
    scrollAreaVariantClasses[variant],
    bordered && s.border,
    bordered && s.radius,
    bordered && 'border-retro-border',
    s.font,
    surface === 'pixel' ? 'pxl-scroll-pixel' : 'pxl-scroll-linear',
  );
}

export interface ScrollAreaStyleOptions {
  /** Height cap: pixels, or any CSS length. */
  maxHeight?: string | number;
  /** Scrollbar thickness in pixels. */
  scrollbarSize?: number;
  /** Keep the scrollbar's room reserved, so content never shifts. */
  offsetScrollbars?: boolean;
}

/**
 * Inline style of the region, keyed like the DOM's `style` (a type, not an
 * interface, so it fits the style types of every framework).
 */
export type ScrollAreaStyle = {
  maxHeight?: string;
  '--pxl-scrollbar-size'?: string;
  scrollbarGutter?: 'stable';
};

/** The inline style of the region: only the declarations its options ask for. */
export function scrollAreaStyle({
  maxHeight,
  scrollbarSize,
  offsetScrollbars = false,
}: ScrollAreaStyleOptions): ScrollAreaStyle {
  return {
    ...(maxHeight !== undefined ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } : null),
    ...(scrollbarSize !== undefined ? { '--pxl-scrollbar-size': `${scrollbarSize}px` } : null),
    ...(offsetScrollbars ? { scrollbarGutter: 'stable' as const } : null),
  };
}

export interface ScrollAreaNameAttributes extends Pick<AccessibleNameAttributes, 'label' | 'labelledBy'> {
  /** A `tabindex` of the consumer's own, in place of the default `0`. */
  tabIndex?: unknown;
}

/**
 * The development warning for a scroll region left focusable without an
 * accessible name, or `null`.
 */
export function scrollAreaNameWarning({ label, labelledBy, tabIndex }: ScrollAreaNameAttributes): string | null {
  if (label || labelledBy || tabIndex !== undefined) return null;
  return (
    '[PixelScrollArea] missing aria-label / aria-labelledby on a focusable scroll region. ' +
    "Provide one so keyboard + screen-reader users know what they're scrolling."
  );
}
