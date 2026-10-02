'use client';

import React, { forwardRef } from 'react';
import {
  gridClasses,
  gridTemplateColumns,
  type GridAlign,
  type GridColumnCount,
  type GridJustify,
  type GridResponsiveColumns,
  type GridRowCount,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { StackGapKey } from '../tokens';

export interface PixelGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: GridColumnCount | GridResponsiveColumns;
  rows?: GridRowCount;
  gap?: StackGapKey;
  colGap?: StackGapKey;
  rowGap?: StackGapKey;
  autoFit?: boolean;
  autoFill?: boolean;
  minColWidth?: string;
  align?: GridAlign;
  justify?: GridJustify;
  as?: keyof React.JSX.IntrinsicElements;
  surface?: Surface;
}

export const PixelGrid = forwardRef<HTMLDivElement, PixelGridProps>(function PixelGrid(
  {
    cols,
    rows,
    gap = 4,
    colGap,
    rowGap,
    autoFit = false,
    autoFill = false,
    minColWidth = '16rem',
    align,
    justify,
    as,
    surface: surfaceProp,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const Comp = (as ?? 'div') as 'div';

  const inlineStyle: React.CSSProperties = { ...style };
  const templateColumns = gridTemplateColumns({ autoFit, autoFill, minColWidth });
  if (templateColumns) inlineStyle.gridTemplateColumns = templateColumns;

  return (
    <Comp
      ref={ref}
      className={cn(
        gridClasses(surface, { cols, rows, gap, colGap, rowGap, autoFit, autoFill, align, justify }),
        className,
      )}
      style={inlineStyle}
      {...rest}
    >
      {children}
    </Comp>
  );
});

PixelGrid.displayName = 'PixelGrid';
