'use client';

import React, { forwardRef } from 'react';
import {
  ribbonClasses,
  ribbonTilt,
  ribbonTransform,
  type RibbonOffset,
  type RibbonPosition,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';

export interface PixelRibbonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Where the ribbon sits on its container. */
  position?: RibbonPosition;
  /** Tone of the opaque fill. */
  tone?: ToneKey;
  /** How far a top ribbon rises above the container's edge. */
  offset?: RibbonOffset;
  /** Tilt in degrees; the corners lean outwards by 12° when unset. */
  tilt?: number;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** The ribbon's text. */
  children: React.ReactNode;
}

export const PixelRibbon = forwardRef<HTMLDivElement, PixelRibbonProps>(function PixelRibbon(
  {
    position = 'top-center',
    tone = 'gold',
    offset = 'md',
    tilt,
    surface: surfaceProp,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const transform = ribbonTransform(ribbonTilt(position, tilt));

  return (
    <div
      ref={ref}
      className={cn(ribbonClasses(surface, { position, tone, offset, tilt }), className)}
      style={{ ...(transform ? { transform } : null), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});

PixelRibbon.displayName = 'PixelRibbon';
