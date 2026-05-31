'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { stackGap, StackGapKey } from '../tokens';

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const;

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const;

export interface PixelClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: StackGapKey;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  as?: keyof React.JSX.IntrinsicElements;
  surface?: Surface;
}

export const PixelCluster = forwardRef<HTMLDivElement, PixelClusterProps>(function PixelCluster(
  {
    gap = 4,
    align = 'center',
    justify,
    as,
    surface: surfaceProp,
    className,
    children,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const Comp = (as ?? 'div') as 'div';

  return (
    <Comp
      ref={ref}
      className={cn(
        'flex flex-row flex-wrap',
        stackGap[gap],
        alignMap[align],
        justify && justifyMap[justify],
        s.transition,
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
});

PixelCluster.displayName = 'PixelCluster';
