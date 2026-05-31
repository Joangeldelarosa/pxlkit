'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';

type RibbonPosition =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'corner-tl'
  | 'corner-tr';

type RibbonOffset = 'sm' | 'md' | 'lg';

export interface PixelRibbonProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: RibbonPosition;
  tone?: ToneKey;
  offset?: RibbonOffset;
  tilt?: number;
  surface?: Surface;
  children: React.ReactNode;
}

const offsetMap: Record<RibbonOffset, { top: string; side: string; corner: string }> = {
  sm: { top: '-top-2', side: 'left-2 right-2', corner: '-top-1 -left-1 -right-1' },
  md: { top: '-top-3', side: 'left-4 right-4', corner: '-top-2 -left-2 -right-2' },
  lg: { top: '-top-4', side: 'left-6 right-6', corner: '-top-3 -left-3 -right-3' },
};

function positionClasses(position: RibbonPosition, offset: RibbonOffset): string {
  const o = offsetMap[offset];
  switch (position) {
    case 'top-center':
      return cn(o.top, 'left-1/2 -translate-x-1/2');
    case 'top-left':
      return cn(o.top, 'left-4');
    case 'top-right':
      return cn(o.top, 'right-4');
    case 'corner-tl':
      return cn('top-3 left-3');
    case 'corner-tr':
      return cn('top-3 right-3');
  }
}

function defaultTilt(position: RibbonPosition): number {
  if (position === 'corner-tl') return -12;
  if (position === 'corner-tr') return 12;
  return 0;
}

function tiltClass(deg: number): string | null {
  if (deg === 0) return null;
  // Tailwind has rotate-12 / -rotate-12 / rotate-6 / -rotate-6 as canonical steps.
  if (deg === 12) return 'rotate-12';
  if (deg === -12) return '-rotate-12';
  if (deg === 6) return 'rotate-6';
  if (deg === -6) return '-rotate-6';
  if (deg === 3) return 'rotate-3';
  if (deg === -3) return '-rotate-3';
  if (deg === 45) return 'rotate-45';
  if (deg === -45) return '-rotate-45';
  return null;
}

export const PixelRibbon = forwardRef<HTMLDivElement, PixelRibbonProps>(function PixelRibbon(
  {
    position = 'top-center',
    tone: toneProp = 'gold',
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
  const s = surfaceClasses(surface);
  const t = toneTokens[toneProp];

  const effectiveTilt = tilt ?? defaultTilt(position);
  const tiltCls = tiltClass(effectiveTilt);
  const inlineTilt =
    effectiveTilt !== 0 && !tiltCls ? { transform: `rotate(${effectiveTilt}deg)` } : null;

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-10 pointer-events-none select-none',
        'inline-flex items-center px-2 py-1 text-[10px] font-semibold uppercase tracking-wider',
        s.border,
        s.radius,
        s.fontDisplay,
        t.bg,
        t.border,
        t.text,
        positionClasses(position, offset),
        tiltCls,
        className,
      )}
      style={{ ...(inlineTilt ?? {}), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});

PixelRibbon.displayName = 'PixelRibbon';
