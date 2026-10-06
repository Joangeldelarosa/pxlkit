import React, { forwardRef, useState } from 'react';
import {
  avatarAccessibleName,
  avatarClasses,
  avatarInitials,
  avatarTone,
  type PixelAvatarShape,
  type PixelAvatarSize,
  type PixelAvatarStatus,
} from '@pxlkit/ui-kit-core';
import { Tone, Surface, useEffectiveSurface } from '../common';
import { usePxlKitLocale } from '../locale';

/* ─────────────────────────────────────────────────────────────────────────
   PixelAvatar — initials/image with bordered square (pixel) or circle (linear).

   Upgraded (Ola 4) additively: `status` dot (online/away/busy/offline) in
   corner, sizes `xs` and `xl` added to the existing sm/md/lg axis, `shape`
   (square/circle/rounded, default circle), `colorSeed` deterministic tinted
   fallback background via hash modulo tones, and lazy/async image loading.
   Existing call sites continue to work — tone still wins when provided.
   ───────────────────────────────────────────────────────────────────────── */

export type { PixelAvatarShape, PixelAvatarSize, PixelAvatarStatus } from '@pxlkit/ui-kit-core';

export interface PixelAvatarProps {
  /** Display name. Used to derive initials and the accessible label. */
  name: string;
  /** Optional image source. Falls back to initials on load failure. */
  src?: string;
  /** Size token. Defaults to `'md'`. */
  size?: PixelAvatarSize;
  /** Tone tint for the initials fallback. Overrides `colorSeed`. */
  tone?: Tone;
  /** Visual surface override. */
  surface?: Surface;
  /** Status dot rendered in the bottom-right corner. */
  status?: PixelAvatarStatus;
  /** Shape of the avatar frame. Defaults to `'circle'`. */
  shape?: PixelAvatarShape;
  /**
   * Deterministic tone fallback derived from the seed via hash modulo a fixed
   * tone palette. Overridden by an explicit `tone` prop.
   */
  colorSeed?: string;
}

export const PixelAvatar = forwardRef<HTMLDivElement, PixelAvatarProps>(function PixelAvatar(
  {
    name,
    src,
    size = 'md',
    tone: toneProp,
    surface: surfaceProp,
    status,
    shape,
    colorSeed,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const { upper } = usePxlKitLocale();
  // The source that failed to load; the initials stand in until `src` changes.
  const [failedSrc, setFailedSrc] = useState<string>();
  const effectiveShape: PixelAvatarShape = shape ?? 'circle';
  const classes = avatarClasses(surface, {
    size,
    shape: effectiveShape,
    tone: avatarTone(toneProp, colorSeed),
    status,
  });
  const accessibleName = avatarAccessibleName(name, status);

  return (
    <div ref={ref} className={classes.root}>
      <div
        className={classes.frame}
        title={accessibleName}
        // aria-label is not allowed on a generic element: named, the frame is an image.
        role={status ? 'img' : undefined}
        aria-label={status ? accessibleName : undefined}
        data-color-seed={colorSeed || undefined}
        data-shape={effectiveShape}
      >
        {src && src !== failedSrc
          ? (
            <img
              src={src}
              alt={accessibleName}
              loading="lazy"
              decoding="async"
              className={classes.image}
              onError={() => setFailedSrc(src)}
            />
          )
          : avatarInitials(name, upper)}
      </div>
      {status && <span aria-hidden data-status={status} className={classes.status} />}
    </div>
  );
});

PixelAvatar.displayName = 'PixelAvatar';
