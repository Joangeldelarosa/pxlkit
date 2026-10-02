'use client';

import React, { forwardRef } from 'react';
import {
  twoColumnClasses,
  twoColumnSideClasses,
  type GridAlign,
  type TwoColumnBreakpoint,
  type TwoColumnRatio,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { StackGapKey } from '../tokens';

export interface PixelTwoColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: TwoColumnRatio;
  gap?: StackGapKey;
  reverse?: boolean;
  stackBelow?: TwoColumnBreakpoint;
  align?: GridAlign;
  left: React.ReactNode;
  right: React.ReactNode;
  surface?: Surface;
  as?: keyof React.JSX.IntrinsicElements;
  bordered?: boolean;
}

export const PixelTwoColumn = forwardRef<HTMLDivElement, PixelTwoColumnProps>(function PixelTwoColumn(
  {
    ratio = '50/50',
    gap = 6,
    reverse = false,
    stackBelow = 'md',
    align,
    left,
    right,
    surface: surfaceProp,
    bordered = false,
    className,
    as,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const sides = twoColumnSideClasses(reverse);

  const Comp = (as ?? 'div') as 'div';

  return (
    <Comp
      ref={ref}
      className={cn(twoColumnClasses(surface, { ratio, gap, stackBelow, align, bordered }), className)}
      {...rest}
    >
      <div className={sides.left}>{left}</div>
      <div className={sides.right}>{right}</div>
    </Comp>
  );
});

PixelTwoColumn.displayName = 'PixelTwoColumn';
