'use client';

import React, { forwardRef } from 'react';
import { clusterClasses, type StackAlign, type StackJustify } from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { StackGapKey } from '../tokens';

export interface PixelClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap token (`stackGap`). */
  gap?: StackGapKey;
  /** Cross-axis alignment. */
  align?: StackAlign;
  /** Main-axis distribution. */
  justify?: StackJustify;
  /** Element to render. */
  as?: keyof React.JSX.IntrinsicElements;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

export const PixelCluster = forwardRef<HTMLDivElement, PixelClusterProps>(function PixelCluster(
  {
    gap = 4,
    align = 'center',
    justify,
    as,
    surface: surfaceProp,
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
      className={cn(clusterClasses(surface, { gap, align, justify }), className)}
      {...rest}
    >
      {children}
    </Comp>
  );
});

PixelCluster.displayName = 'PixelCluster';
