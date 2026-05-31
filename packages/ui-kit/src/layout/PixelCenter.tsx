'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { containerWidth, pageGutter, ContainerWidth, PageGutter } from '../tokens';

const textMap = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export interface PixelCenterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'align'> {
  maxWidth?: ContainerWidth;
  gutter?: PageGutter;
  /** Text alignment of the centered content (canonical). */
  align?: 'left' | 'center' | 'right';
  /**
   * @deprecated Use `align` instead. Retained as alias for one minor.
   */
  text?: 'left' | 'center' | 'right';
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
  const s = surfaceClasses(surface);
  const Comp = (as ?? 'div') as 'div';
  const resolvedAlign = align ?? text;

  return (
    <Comp
      ref={ref}
      className={cn(
        inline ? 'inline-block' : 'block',
        'mx-auto',
        containerWidth[maxWidth],
        pageGutter[gutter],
        resolvedAlign && textMap[resolvedAlign],
        bordered && s.border, bordered && s.radius,
        s.transition,
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
});

PixelCenter.displayName = 'PixelCenter';
