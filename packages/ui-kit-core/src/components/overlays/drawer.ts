/**
 * PixelDrawer — a modal panel anchored to an edge of the viewport that slides
 * in from it, with optional header, body and footer parts.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

export type DrawerSide = 'right' | 'left' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** The full-screen layer holding the backdrop and the panel. */
export const drawerLayerClasses = 'fixed inset-0 z-[80]';

/** Panel width per size, on the left and right sides. */
export const drawerWidthClasses: Record<DrawerSize, string> = {
  sm: 'w-[280px]',
  md: 'w-[360px]',
  lg: 'w-[480px]',
  xl: 'w-[640px]',
  full: 'w-screen',
};

/** Panel height per size, on the top and bottom sides. */
export const drawerHeightClasses: Record<DrawerSize, string> = {
  sm: 'h-[200px]',
  md: 'h-[320px]',
  lg: 'h-[440px]',
  xl: 'h-[560px]',
  full: 'h-screen',
};

/** Where the panel sits, how large it is and how it slides in, for a side. */
export function drawerPositionClasses(side: DrawerSide, size: DrawerSize): string {
  switch (side) {
    case 'right':
      return cn(
        'right-0 top-0 h-full max-w-full',
        drawerWidthClasses[size],
        'translate-x-0 motion-safe:animate-[pxl-drawer-in-right_180ms_ease-out]',
      );
    case 'left':
      return cn(
        'left-0 top-0 h-full max-w-full',
        drawerWidthClasses[size],
        'translate-x-0 motion-safe:animate-[pxl-drawer-in-left_180ms_ease-out]',
      );
    case 'top':
      return cn(
        'top-0 left-0 w-full max-h-full',
        drawerHeightClasses[size],
        'translate-y-0 motion-safe:animate-[pxl-drawer-in-top_180ms_ease-out]',
      );
    case 'bottom':
      return cn(
        'bottom-0 left-0 w-full max-h-full',
        drawerHeightClasses[size],
        'translate-y-0 motion-safe:animate-[pxl-drawer-in-bottom_180ms_ease-out]',
      );
  }
}

/** The drawer panel. */
export function drawerPanelClasses(surface: Surface, side: DrawerSide, size: DrawerSize): string {
  return cn(
    'fixed bg-retro-bg shadow-2xl flex flex-col outline-none',
    surfaceClasses(surface).border,
    'border-retro-border',
    drawerPositionClasses(side, size),
  );
}

/** PixelDrawer's header bar, set off from the body by a surface-aware divider. */
export function drawerHeaderClasses(surface: Surface): string {
  return cn(
    'flex items-center justify-between px-4 py-3 bg-retro-surface/40',
    surface === 'pixel' ? 'border-b-2 border-retro-border' : 'border-b border-retro-border',
  );
}

/** PixelDrawer's scrolling body. */
export const drawerBodyClasses = 'flex-1 overflow-y-auto px-4 py-4';

/** PixelDrawer's footer bar of actions, set off by a surface-aware divider. */
export function drawerFooterClasses(surface: Surface): string {
  return cn(
    'flex items-center justify-end gap-2 px-4 py-3 bg-retro-surface/40',
    surface === 'pixel' ? 'border-t-2 border-retro-border' : 'border-t border-retro-border',
  );
}
