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
  position?: RibbonPosition;
  tone?: ToneKey;
  offset?: RibbonOffset;
  tilt?: number;
  surface?: Surface;
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
