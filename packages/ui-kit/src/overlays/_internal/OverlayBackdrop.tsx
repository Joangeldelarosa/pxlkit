/* ─────────────────────────────────────────────────────────────────────────
   OverlayBackdrop — internal shared scrim primitive.

   Single source of truth for the dim-the-page scrim used by modal-class
   overlays (PixelModal, PixelDrawer, PixelCommand, PixelAlertDialog,
   PixelSheet). Uses `bg-retro-bg/{opacity}` so the scrim resolves to the
   THEME page-background at alpha — true dark in dark mode, soft wash in
   light mode — instead of `--retro-text` which is the foreground color
   and visually BRIGHTENS the page behind the modal in dark mode.

   Not exported from the public ui-kit barrel; consumed only by overlays
   under packages/ui-kit/src/overlay{,s}/*.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

type OverlayBackdropPosition = 'fixed' | 'absolute';
type OverlayBackdropOpacity = 60 | 70 | 80 | 90;

/**
 * Tailwind JIT requires static class strings — we cannot interpolate
 * the opacity into `bg-retro-bg/${n}`. Keep this map exhaustive so all
 * four variants get emitted into the compiled CSS.
 */
const OPACITY_CLASS: Record<OverlayBackdropOpacity, string> = {
  60: 'bg-retro-bg/60',
  70: 'bg-retro-bg/70',
  80: 'bg-retro-bg/80',
  90: 'bg-retro-bg/90',
};

export interface OverlayBackdropProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  /** Positioning model. `fixed` for viewport scrim, `absolute` for portal-wrapped overlays. Default `'fixed'`. */
  position?: OverlayBackdropPosition;
  /** Click handler — typically requests overlay dismissal. */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Apply `backdrop-blur-sm`. Default `true`. */
  blur?: boolean;
  /** Scrim opacity over the page-background token. Default `80`. */
  opacity?: OverlayBackdropOpacity;
}

export const OverlayBackdrop = forwardRef<HTMLDivElement, OverlayBackdropProps>(
  function OverlayBackdrop(
    {
      position = 'fixed',
      onClick,
      blur = true,
      opacity = 80,
      className,
      'aria-hidden': ariaHidden = true,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        aria-hidden={ariaHidden}
        data-pxl-overlay-backdrop=""
        onClick={onClick}
        className={cn(
          position === 'fixed' ? 'fixed inset-0' : 'absolute inset-0',
          OPACITY_CLASS[opacity],
          blur && 'backdrop-blur-sm',
          className,
        )}
        {...rest}
      />
    );
  },
);
OverlayBackdrop.displayName = 'OverlayBackdrop';
