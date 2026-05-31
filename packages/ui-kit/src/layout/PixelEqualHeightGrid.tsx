'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { PixelGrid, PixelGridProps } from './PixelGrid';

export interface PixelEqualHeightGridProps extends Omit<PixelGridProps, 'align'> {
  rowAlign?: 'top' | 'stretch';
}

type ChildLike = React.ReactElement<{ className?: string }>;

export const PixelEqualHeightGrid = forwardRef<HTMLDivElement, PixelEqualHeightGridProps>(
  function PixelEqualHeightGrid(
    { rowAlign = 'stretch', surface: surfaceProp, className, style, children, ...rest },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);

    const wrapped = React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      const el = child as ChildLike;
      const childClass = el.props.className;
      return React.cloneElement(el, {
        className: cn('grid grid-rows-[auto_1fr_auto]', childClass),
      });
    });

    return (
      <PixelGrid
        ref={ref}
        align="stretch"
        surface={surface}
        className={cn(rowAlign === 'top' && 'items-start', s.transition, className)}
        style={style}
        {...rest}
      >
        {wrapped}
      </PixelGrid>
    );
  },
);

PixelEqualHeightGrid.displayName = 'PixelEqualHeightGrid';
