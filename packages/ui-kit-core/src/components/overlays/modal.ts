/**
 * PixelModal — the full-screen layer, the panel and its chrome. The pixel
 * surface draws an old-school window (title bar, body, footer bar); the
 * linear surface a flat card.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** The layer that centres the panel over the backdrop. */
export const modalLayerClasses = 'fixed inset-0 z-[80] flex items-center justify-center p-4';

/** Panel width per size; `full` also caps the height and scrolls. */
export const modalSizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh] overflow-y-auto',
};

export interface ModalClasses {
  panel: string;
  header: string;
  title: string;
  closeButton: string;
  /** Busy indicator that replaces the close glyph while an async close runs. */
  busy: string;
  body: string;
  description: string;
  footer: string;
}

export interface ModalState {
  /** An async close is in flight. */
  closing: boolean;
  /** The user prefers reduced motion: the busy indicator does not pulse. */
  reducedMotion: boolean;
}

/** Classes of every part of the modal for a surface, size and state. */
export function modalClasses(surface: Surface, size: ModalSize, { closing, reducedMotion }: ModalState): ModalClasses {
  const s = surfaceClasses(surface);
  const pixel = surface === 'pixel';
  const divider = pixel ? 'border-t-2 border-retro-border' : 'border-t border-retro-border';
  const pulse = reducedMotion ? '' : 'animate-pulse';
  return {
    panel: cn(
      'relative w-full bg-retro-bg shadow-2xl',
      s.border,
      s.radiusLg,
      'border-retro-border',
      pixel ? 'p-0' : 'p-5',
      modalSizeClasses[size] ?? modalSizeClasses.md,
    ),
    header: pixel
      ? 'flex items-center justify-between border-b-2 border-retro-border bg-retro-surface/60 px-3 py-2'
      : 'mb-4 flex items-center justify-between',
    title: pixel ? 'font-pixel text-[11px] text-retro-green' : cn('text-base font-semibold text-retro-text', s.fontDisplay),
    closeButton: cn(
      pixel
        ? 'flex h-6 w-6 items-center justify-center border-2 border-retro-border text-retro-muted transition-colors hover:bg-retro-red/10 hover:border-retro-red/40 hover:text-retro-red focus:outline-hidden focus-visible:ring-2 focus-visible:ring-retro-red/40'
        : 'flex h-7 w-7 items-center justify-center rounded-md border border-retro-border text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text focus:outline-hidden focus-visible:ring-2 focus-visible:ring-retro-cyan/40',
      closing && 'opacity-60 cursor-wait',
    ),
    busy: cn(pixel ? 'block h-2 w-2 bg-retro-muted' : 'block h-2 w-2 rounded-full bg-retro-muted', pulse),
    body: pixel ? 'p-5 text-sm text-retro-muted' : 'text-sm text-retro-muted',
    description: 'mb-3 text-xs text-retro-muted/80',
    footer: cn(
      divider,
      pixel ? 'flex items-center justify-end gap-2 bg-retro-surface/40 px-5 py-3' : 'mt-5 flex items-center justify-end gap-2 pt-4',
    ),
  };
}
