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
  /**
   * Column count, or a count per breakpoint (`{ base: 1, md: 3 }`); ignored with `autoFit` /
   * `autoFill`.
   */
  cols?: GridColumnCount | GridResponsiveColumns;
  /** Row count. */
  rows?: GridRowCount;
  /** Gap token (`stackGap`) between rows and columns. */
  gap?: StackGapKey;
  /** Gap between columns; with `rowGap`, it replaces `gap`. */
  colGap?: StackGapKey;
  /** Gap between rows; with `colGap`, it replaces `gap`. */
  rowGap?: StackGapKey;
  /** As many columns as fit, empty tracks collapsed. */
  autoFit?: boolean;
  /** As many columns as fit, empty tracks kept. */
  autoFill?: boolean;
  /** Narrowest column with `autoFit` / `autoFill` (any CSS length). */
  minColWidth?: string;
  /** Block-axis alignment of the items. */
  align?: GridAlign;
  /** Inline-axis alignment of the items. */
  justify?: GridJustify;
  /** Element to render. */
  as?: keyof React.JSX.IntrinsicElements;
  /** Surface override; defaults to the nearest provider. */
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
