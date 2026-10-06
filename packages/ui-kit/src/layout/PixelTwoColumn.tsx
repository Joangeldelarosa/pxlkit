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
  /** Width of the left column against the right one. */
  ratio?: TwoColumnRatio;
  /** Gap token (`stackGap`). */
  gap?: StackGapKey;
  /** Show the right column first (CSS `order`; the DOM order stays). */
  reverse?: boolean;
  /** Breakpoint below which the columns stack. */
  stackBelow?: TwoColumnBreakpoint;
  /** Block-axis alignment of the columns. */
  align?: GridAlign;
  /** Content of the left column. */
  left: React.ReactNode;
  /** Content of the right column. */
  right: React.ReactNode;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Element to render. */
  as?: keyof React.JSX.IntrinsicElements;
  /** Surface border and radius. */
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
