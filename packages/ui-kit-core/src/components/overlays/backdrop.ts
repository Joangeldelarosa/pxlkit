/**
 * OverlayBackdrop — the scrim behind modal-class overlays (PixelModal,
 * PixelDrawer, PixelSheet, PixelAlertDialog, PixelCommand). It tints with the
 * page background (`bg-retro-bg/…`), so it darkens in dark mode and washes
 * out in light mode instead of brightening the page.
 */
import { cn } from '../../common';

export type OverlayBackdropPosition = 'fixed' | 'absolute';
export type OverlayBackdropOpacity = 60 | 70 | 80 | 90;

// Spelled out in full: Tailwind only generates classes it finds verbatim.
const BACKDROP_OPACITY_CLASSES: Record<OverlayBackdropOpacity, string> = {
  60: 'bg-retro-bg/60',
  70: 'bg-retro-bg/70',
  80: 'bg-retro-bg/80',
  90: 'bg-retro-bg/90',
};

/** The scrim: `fixed` covers the viewport, `absolute` the nearest positioned ancestor. */
export function overlayBackdropClasses(
  position: OverlayBackdropPosition = 'fixed',
  opacity: OverlayBackdropOpacity = 80,
  blur = true,
): string {
  return cn(
    position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0',
    BACKDROP_OPACITY_CLASSES[opacity],
    blur && 'backdrop-blur-sm',
  );
}
