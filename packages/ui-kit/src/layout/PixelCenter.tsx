'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { containerWidth, pageGutter, ContainerWidth, PageGutter } from '../tokens';

const textMap = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export interface PixelCenterProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: ContainerWidth;
  gutter?: PageGutter;
  text?: 'left' | 'center' | 'right';
  inline?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  surface?: Surface;
}

export const PixelCenter = forwardRef<HTMLDivElement, PixelCenterProps>(function PixelCenter(
  {
    maxWidth = '5xl',
    gutter = 'lg',
    text,
    inline = false,
    as,
    surface: surfaceProp,
    className,
    children,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const Comp = (as ?? 'div') as 'div';

  return (
    <Comp
      ref={ref}
      className={cn(
        inline ? 'inline-block' : 'block',
        'mx-auto',
        containerWidth[maxWidth],
        pageGutter[gutter],
        text && textMap[text],
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
