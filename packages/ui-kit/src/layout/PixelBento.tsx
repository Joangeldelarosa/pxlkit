'use client';

import React, { forwardRef } from 'react';
import { cn } from '../common';
import { stackGap, StackGapKey } from '../tokens';

type BentoColumns = 3 | 4 | 6;

const columnsMap: Record<BentoColumns, string> = {
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

export interface PixelBentoProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: BentoColumns;
  gap?: StackGapKey;
}

export const PixelBento = forwardRef<HTMLDivElement, PixelBentoProps>(function PixelBento(
  { columns = 3, gap = 4, className, style, children, ...rest },
  ref,
) {
  const Comp = 'div' as 'div';
  const inlineStyle: React.CSSProperties = {
    gridAutoRows: 'minmax(160px, 1fr)',
    ...style,
  };
  return (
    <Comp
      ref={ref}
      data-columns={columns}
      className={cn('grid', columnsMap[columns], stackGap[gap], className)}
      style={inlineStyle}
      {...rest}
    >
      {children}
    </Comp>
  );
});

PixelBento.displayName = 'PixelBento';

// PixelBentoCell moved to its own file; re-exported so this module's API
// stays unchanged.
export { PixelBentoCell, type PixelBentoCellProps } from './PixelBentoCell';
