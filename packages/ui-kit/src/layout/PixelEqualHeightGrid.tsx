'use client';

import React, { forwardRef } from 'react';
import {
  equalHeightGridAlign,
  equalHeightGridClasses,
  equalHeightGridItemClasses,
  type EqualHeightGridRowAlign,
} from '@pxlkit/ui-kit-core';
import { cn, useEffectiveSurface } from '../common';
import { PixelGrid, PixelGridProps } from './PixelGrid';

export interface PixelEqualHeightGridProps extends Omit<PixelGridProps, 'align'> {
  /** `stretch` gives every item of a row the row's height; `top` keeps their own. */
  rowAlign?: EqualHeightGridRowAlign;
}

type ChildLike = React.ReactElement<{ className?: string }>;

export const PixelEqualHeightGrid = forwardRef<HTMLDivElement, PixelEqualHeightGridProps>(
  function PixelEqualHeightGrid(
    { rowAlign = 'stretch', surface: surfaceProp, className, style, children, ...rest },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);

    const wrapped = React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      const el = child as ChildLike;
      const childClass = el.props.className;
      return React.cloneElement(el, {
        className: cn(equalHeightGridItemClasses, childClass),
      });
    });

    return (
      <PixelGrid
        ref={ref}
        align={equalHeightGridAlign(rowAlign)}
        surface={surface}
        className={cn(equalHeightGridClasses(surface), className)}
        style={style}
        {...rest}
      >
        {wrapped}
      </PixelGrid>
    );
  },
);

PixelEqualHeightGrid.displayName = 'PixelEqualHeightGrid';
