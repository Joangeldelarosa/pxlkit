'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';

type Layout = 'row' | 'grid';

const colsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

export interface PixelStatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: Layout;
  columns?: number;
  tone?: ToneKey;
  surface?: Surface;
  /** Accessible name for the group landmark. Without it, role=group is dropped. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export const PixelStatGroup = forwardRef<HTMLDivElement, PixelStatGroupProps>(function PixelStatGroup(
  {
    layout = 'row',
    columns = 3,
    tone = 'neutral',
    surface: surfaceProp,
    className,
    children,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const t = toneTokens[tone];

  const layoutClass =
    layout === 'row'
      ? cn('flex flex-row divide-x', t.border)
      : cn('grid', colsMap[columns] ?? colsMap[3]);

  const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
  const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
  const hasName = !!(ariaLabel || ariaLabelledBy);

  return (
    <div
      ref={ref}
      role={hasName ? 'group' : undefined}
      className={cn(
        layoutClass,
        s.border,
        s.radiusLg,
        t.border,
        'bg-retro-surface/40',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

PixelStatGroup.displayName = 'PixelStatGroup';
