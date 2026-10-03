'use client';

import React, { forwardRef } from 'react';
import { statGroupClasses, statGroupRole, type StatGroupLayout as Layout } from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey, StackGapKey } from '../tokens';

export interface PixelStatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: Layout;
  columns?: number;
  /** Gap between grid cells (stackGap scale). Only applies to layout="grid"; omit for flush cells. */
  gap?: StackGapKey;
  tone?: ToneKey;
  surface?: Surface;
  /** Render with surface-aware border + radius chrome. Defaults to true — group needs visible chrome. */
  bordered?: boolean;
  /** Accessible name for the group landmark. Without it, role=group is dropped. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export const PixelStatGroup = forwardRef<HTMLDivElement, PixelStatGroupProps>(function PixelStatGroup(
  {
    layout = 'row',
    columns = 3,
    gap,
    tone = 'neutral',
    surface: surfaceProp,
    bordered = true,
    className,
    children,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
  const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
  const hasName = !!(ariaLabel || ariaLabelledBy);

  return (
    <div
      ref={ref}
      role={statGroupRole(hasName)}
      className={cn(statGroupClasses(surface, { layout, columns, gap, tone, bordered }), className)}
      {...rest}
    >
      {children}
    </div>
  );
});

PixelStatGroup.displayName = 'PixelStatGroup';
