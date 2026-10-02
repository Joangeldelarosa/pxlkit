'use client';

import React, { forwardRef } from 'react';
import { BENTO_AUTO_ROWS, bentoClasses, type BentoColumns } from '@pxlkit/ui-kit-core';
import { cn } from '../common';
import { StackGapKey } from '../tokens';

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
    gridAutoRows: BENTO_AUTO_ROWS,
    ...style,
  };
  return (
    <Comp
      ref={ref}
      data-columns={columns}
      className={cn(bentoClasses(columns, gap), className)}
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
