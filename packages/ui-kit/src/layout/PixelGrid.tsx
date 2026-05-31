'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { stackGap, StackGapKey } from '../tokens';

type ColCount = 1 | 2 | 3 | 4 | 5 | 6 | 12;
type RowCount = 1 | 2 | 3 | 4 | 5 | 6;

type ResponsiveCols = {
  base?: ColCount;
  sm?: ColCount;
  md?: ColCount;
  lg?: ColCount;
  xl?: ColCount;
};

const baseColsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const smColsMap: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
  12: 'sm:grid-cols-12',
};

const mdColsMap: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  12: 'md:grid-cols-12',
};

const lgColsMap: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  12: 'lg:grid-cols-12',
};

const xlColsMap: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
  12: 'xl:grid-cols-12',
};

const rowsMap: Record<number, string> = {
  1: 'grid-rows-1',
  2: 'grid-rows-2',
  3: 'grid-rows-3',
  4: 'grid-rows-4',
  5: 'grid-rows-5',
  6: 'grid-rows-6',
};

const colGapMap: Record<StackGapKey, string> = {
  0: 'gap-x-0',
  1: 'gap-x-1',
  2: 'gap-x-2',
  3: 'gap-x-3',
  4: 'gap-x-4',
  5: 'gap-x-5',
  6: 'gap-x-6',
  8: 'gap-x-8',
  10: 'gap-x-10',
  12: 'gap-x-12',
  16: 'gap-x-16',
};

const rowGapMap: Record<StackGapKey, string> = {
  0: 'gap-y-0',
  1: 'gap-y-1',
  2: 'gap-y-2',
  3: 'gap-y-3',
  4: 'gap-y-4',
  5: 'gap-y-5',
  6: 'gap-y-6',
  8: 'gap-y-8',
  10: 'gap-y-10',
  12: 'gap-y-12',
  16: 'gap-y-16',
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const;

const justifyMap = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end',
  stretch: 'justify-items-stretch',
} as const;

export interface PixelGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: ColCount | ResponsiveCols;
  rows?: RowCount;
  gap?: StackGapKey;
  colGap?: StackGapKey;
  rowGap?: StackGapKey;
  autoFit?: boolean;
  autoFill?: boolean;
  minColWidth?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'stretch';
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
  const s = surfaceClasses(surface);
  const Comp = (as ?? 'div') as 'div';

  const useAuto = autoFit || autoFill;
  const autoMode = autoFit ? 'auto-fit' : 'auto-fill';

  let colsClasses = '';
  if (!useAuto && cols !== undefined) {
    if (typeof cols === 'number') {
      colsClasses = baseColsMap[cols] ?? '';
    } else {
      const parts: string[] = [];
      if (cols.base !== undefined && baseColsMap[cols.base]) parts.push(baseColsMap[cols.base]);
      if (cols.sm !== undefined && smColsMap[cols.sm]) parts.push(smColsMap[cols.sm]);
      if (cols.md !== undefined && mdColsMap[cols.md]) parts.push(mdColsMap[cols.md]);
      if (cols.lg !== undefined && lgColsMap[cols.lg]) parts.push(lgColsMap[cols.lg]);
      if (cols.xl !== undefined && xlColsMap[cols.xl]) parts.push(xlColsMap[cols.xl]);
      colsClasses = parts.join(' ');
    }
  }

  const gapClass = colGap || rowGap ? '' : stackGap[gap];
  const colGapClass = colGap ? colGapMap[colGap] : '';
  const rowGapClass = rowGap ? rowGapMap[rowGap] : '';

  const inlineStyle: React.CSSProperties = { ...style };
  if (useAuto) {
    inlineStyle.gridTemplateColumns = `repeat(${autoMode}, minmax(${minColWidth}, 1fr))`;
  }

  return (
    <Comp
      ref={ref}
      className={cn(
        'grid',
        colsClasses,
        rows !== undefined && rowsMap[rows],
        gapClass,
        colGapClass,
        rowGapClass,
        align && alignMap[align],
        justify && justifyMap[justify],
        s.transition,
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
