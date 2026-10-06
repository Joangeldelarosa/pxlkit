'use client';

import React, { forwardRef } from 'react';
import {
  stackAlignClasses,
  stackDirectionClasses,
  stackJustifyClasses,
  type StackAlign,
  type StackDirection,
  type StackJustify,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { stackGap, StackGapKey } from '../tokens';

export interface PixelStackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main axis. */
  direction?: StackDirection;
  /** Gap token (`stackGap`). */
  gap?: StackGapKey;
  /** Cross-axis alignment. */
  align?: StackAlign;
  /** Main-axis distribution. */
  justify?: StackJustify;
  /** Wrap onto multiple lines. */
  wrap?: boolean;
  /** `inline-flex` instead of `flex`. */
  inline?: boolean;
  /** Element to render. */
  as?: keyof React.JSX.IntrinsicElements;
  /** Surface override; defaults to the nearest provider. */
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
        stackDirectionClasses[direction],
        stackGap[gap],
        align && stackAlignClasses[align],
        justify && stackJustifyClasses[justify],
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
