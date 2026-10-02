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
  maxWidth?: ContainerWidth;
  padding?: ContainerPadding;
  surface?: Surface;
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
