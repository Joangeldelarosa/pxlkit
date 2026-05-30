'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

type FrameSize = 48 | 56 | 64 | 80 | 112;
type FrameShape = 'square' | 'rounded' | 'circle';
type AccentPosition = 'top-right' | 'bottom-right';

const sizeMap: Record<FrameSize, string> = {
  48: 'w-12 h-12',
  56: 'w-14 h-14',
  64: 'w-16 h-16',
  80: 'w-20 h-20',
  112: 'w-28 h-28',
};

const accentPositionMap: Record<AccentPosition, string> = {
  'top-right': 'absolute top-0 right-0 -mt-1.5 -mr-1.5',
  'bottom-right': 'absolute bottom-0 right-0 -mb-1.5 -mr-1.5',
};

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
  const s = surfaceClasses(surface);
  const reduced = useReducedMotion();
  const t = toneTokens[tone];

  const shapeClass =
    shape === 'circle'
      ? 'rounded-full'
      : shape === 'rounded'
        ? 'rounded-md'
        : s.radius;

  const accentPosition: AccentPosition = accent?.position ?? 'top-right';

  return (
    <div
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center',
        sizeMap[size],
        s.border,
        t.border,
        t.soft,
        t.text,
        shapeClass,
        animated && !reduced && 'animate-pulse',
        className,
      )}
      {...rest}
    >
      <span className="inline-flex items-center justify-center" aria-hidden>{icon}</span>
      {accent && (
        <span
          className={cn(
            'inline-flex items-center justify-center w-4 h-4',
            accentPositionMap[accentPosition],
            s.border,
            t.border,
            t.bg,
            shape === 'circle' ? 'rounded-full' : s.radius,
          )}
          aria-hidden
        >
          {accent.icon}
        </span>
      )}
    </div>
  );
});

PixelIconFrame.displayName = 'PixelIconFrame';
