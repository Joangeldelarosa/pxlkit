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

const directionMap = {
  col: 'flex-col',
  row: 'flex-row',
} as const;

export interface PixelStackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'col' | 'row';
  gap?: StackGapKey;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  inline?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  surface?: Surface;
}

export const PixelStack = forwardRef<HTMLDivElement, PixelStackProps>(function PixelStack(
  {
    direction = 'col',
    gap = 4,
    align,
    justify,
    wrap = false,
    inline = false,
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
        inline ? 'inline-flex' : 'flex',
        directionMap[direction],
        stackGap[gap],
        align && alignMap[align],
        justify && justifyMap[justify],
        wrap && 'flex-wrap',
        s.transition,
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
});

PixelStack.displayName = 'PixelStack';
