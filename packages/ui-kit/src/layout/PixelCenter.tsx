'use client';

import React, { forwardRef } from 'react';
import { centerClasses, type CenterAlign } from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ContainerWidth, PageGutter } from '../tokens';

export interface PixelCenterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'align'> {
  /** Width cap (`containerWidth`). */
  maxWidth?: ContainerWidth;
  /** Horizontal padding (`pageGutter`). */
  gutter?: PageGutter;
  /** Text alignment of the centered content (canonical). */
  align?: CenterAlign;
  /**
   * @deprecated Use `align` instead. Retained as alias for one minor.
   */
  text?: CenterAlign;
  /** `inline-block` instead of `block`. */
  inline?: boolean;
  /** Element to render. */
  as?: keyof React.JSX.IntrinsicElements;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Surface border and radius. */
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
