'use client';

import React, { forwardRef } from 'react';
import { centerClasses, type CenterAlign } from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ContainerWidth, PageGutter } from '../tokens';

export interface PixelCenterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'align'> {
  maxWidth?: ContainerWidth;
  gutter?: PageGutter;
  /** Text alignment of the centered content (canonical). */
  align?: CenterAlign;
  /**
   * @deprecated Use `align` instead. Retained as alias for one minor.
   */
  text?: CenterAlign;
  inline?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  surface?: Surface;
  bordered?: boolean;
}

export const PixelCenter = forwardRef<HTMLDivElement, PixelCenterProps>(function PixelCenter(
  {
    maxWidth = '5xl',
    gutter = 'lg',
    align,
    text,
    inline = false,
    as,
    surface: surfaceProp,
    bordered = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const Comp = (as ?? 'div') as 'div';

  return (
    <Comp
      ref={ref}
      className={cn(
        centerClasses(surface, { maxWidth, gutter, align: align ?? text, inline, bordered }),
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
});

PixelCenter.displayName = 'PixelCenter';
