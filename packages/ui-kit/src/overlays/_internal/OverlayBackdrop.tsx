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
import {
  overlayBackdropClasses,
  type OverlayBackdropOpacity,
  type OverlayBackdropPosition,
} from '@pxlkit/ui-kit-core';
import { cn } from '../../utils/cn';

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
        className={cn(overlayBackdropClasses(position, opacity, blur), className)}
        {...rest}
      />
    );
  },
);
OverlayBackdrop.displayName = 'OverlayBackdrop';
