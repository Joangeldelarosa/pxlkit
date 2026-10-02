/**
 * PixelSheet — a mobile-first modal panel docked to the bottom or the top
 * edge of the viewport, with an optional (decorative) drag handle. The linear
 * surface rounds the corners facing the page.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

export type SheetSide = 'bottom' | 'top';
export type SheetSize = 'sm' | 'md' | 'lg' | 'full';

/** The full-screen layer holding the backdrop and the panel. */
export const sheetLayerClasses = 'fixed inset-0 z-[90]';

/** Panel height per side and size. */
export const sheetSizeClasses: Record<SheetSide, Record<SheetSize, string>> = {
  bottom: {
    sm: 'h-1/4',
    md: 'h-1/2',
    lg: 'h-3/4',
    full: 'h-[100dvh]',
  },
  top: {
    sm: 'h-1/4',
    md: 'h-1/2',
    lg: 'h-3/4',
    full: 'h-[100dvh]',
  },
};

export interface SheetClasses {
  panel: string;
  /** Row of the drag handle — drawn last on a top sheet, next to its free edge. */
  handle: string;
  /** The bar inside the drag handle row. */
  handleBar: string;
  /** The block of title and description. */
  header: string;
  title: string;
  description: string;
  body: string;
}

/** Classes of every part of the sheet for a surface, side and size. */
export function sheetClasses(surface: Surface, side: SheetSide, size: SheetSize): SheetClasses {
  const s = surfaceClasses(surface);
  const pixel = surface === 'pixel';
  const bottom = side === 'bottom';
  return {
    panel: cn(
      'absolute flex flex-col bg-retro-bg shadow-2xl',
      bottom ? 'bottom-0 left-0 right-0' : 'top-0 left-0 right-0',
      sheetSizeClasses[side][size],
      s.border,
      'border-retro-border',
      bottom ? (pixel ? 'border-t-2' : 'rounded-t-2xl border-t') : pixel ? 'border-b-2' : 'rounded-b-2xl border-b',
    ),
    handle: cn(!bottom && 'order-last', 'flex h-5 shrink-0 items-center justify-center'),
    handleBar: cn('h-1 w-10 bg-retro-border', pixel ? 'rounded-none' : 'rounded-full'),
    header: 'border-b border-retro-border/60 px-5 py-3',
    title: cn('text-sm font-semibold text-retro-text', s.fontDisplay),
    description: 'mt-1 text-xs text-retro-muted',
    body: 'flex-1 overflow-auto p-5 text-sm text-retro-muted',
  };
}
