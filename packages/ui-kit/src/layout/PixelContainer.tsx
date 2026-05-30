'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import {
  sectionRhythm,
  pageGutter,
  ContainerWidth,
  PageGutter,
  SectionRhythmKey,
} from '../tokens';
import { PixelCenter } from './PixelCenter';

export interface PixelContainerProps extends React.HTMLAttributes<HTMLElement> {
  maxWidth?: ContainerWidth;
  padding?: SectionRhythmKey | { x?: PageGutter; y?: SectionRhythmKey };
  surface?: Surface;
  as?: 'section' | 'main' | 'header' | 'footer' | 'article' | 'aside' | 'div';
}

function resolvePadding(
  padding: PixelContainerProps['padding'],
): { x: PageGutter; y: SectionRhythmKey } {
  if (padding == null) return { x: 'lg', y: 'lg' };
  if (typeof padding === 'string') return { x: 'lg', y: padding };
  return { x: padding.x ?? 'lg', y: padding.y ?? 'lg' };
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
  const s = surfaceClasses(surface);
  const { x, y } = resolvePadding(padding);
  const Comp = as as 'section';

  return (
    <Comp
      ref={ref}
      className={cn('w-full', sectionRhythm[y], s.transition, className)}
      {...rest}
    >
      <PixelCenter maxWidth={maxWidth} gutter={x} surface={surface}>
        {children}
      </PixelCenter>
    </Comp>
  );
});

PixelContainer.displayName = 'PixelContainer';
