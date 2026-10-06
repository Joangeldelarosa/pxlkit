'use client';

import React, { forwardRef } from 'react';
import {
  containerClasses,
  resolveContainerPadding,
  type ContainerElement,
  type ContainerPadding,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ContainerWidth } from '../tokens';
import { PixelCenter } from './PixelCenter';

export interface PixelContainerProps extends React.HTMLAttributes<HTMLElement> {
  /** Width cap of the inner column (`containerWidth`). */
  maxWidth?: ContainerWidth;
  /**
   * Vertical rhythm (`sectionRhythm`), or `{ x, y }`: the gutter of the inner column (`pageGutter`)
   * and the rhythm. Both default to `lg`.
   */
  padding?: ContainerPadding;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Element to render — a landmark wants an `aria-label` or `aria-labelledby`. */
  as?: ContainerElement;
}

export const PixelContainer = forwardRef<HTMLElement, PixelContainerProps>(function PixelContainer(
  {
    maxWidth = 'xl',
    padding,
    surface: surfaceProp,
    as = 'section',
    className,
    children,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const { x, y } = resolveContainerPadding(padding);
  const Comp = as as 'section';

  return (
    <Comp
      ref={ref}
      className={cn(containerClasses(surface, y), className)}
      {...rest}
    >
      <PixelCenter maxWidth={maxWidth} gutter={x} surface={surface}>
        {children}
      </PixelCenter>
    </Comp>
  );
});

PixelContainer.displayName = 'PixelContainer';
