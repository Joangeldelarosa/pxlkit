'use client';

import React, { forwardRef } from 'react';
import {
  iconFrameClasses,
  type IconFrameAccentPosition as AccentPosition,
  type IconFrameShape as FrameShape,
  type IconFrameSize as FrameSize,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface PixelIconFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  size?: FrameSize;
  tone?: ToneKey;
  shape?: FrameShape;
  accent?: { icon: React.ReactNode; position?: AccentPosition };
  animated?: boolean;
  surface?: Surface;
}

export const PixelIconFrame = forwardRef<HTMLDivElement, PixelIconFrameProps>(function PixelIconFrame(
  {
    icon,
    size = 56,
    tone = 'neutral',
    shape = 'square',
    accent,
    animated = false,
    surface: surfaceProp,
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const reducedMotion = useReducedMotion();
  const classes = iconFrameClasses(surface, {
    size,
    tone,
    shape,
    accentPosition: accent?.position,
    animated,
    reducedMotion,
  });

  return (
    <div ref={ref} className={cn(classes.root, className)} {...rest}>
      <span className={classes.icon} aria-hidden>{icon}</span>
      {accent && (
        <span className={classes.accent} aria-hidden>
          {accent.icon}
        </span>
      )}
    </div>
  );
});

PixelIconFrame.displayName = 'PixelIconFrame';
