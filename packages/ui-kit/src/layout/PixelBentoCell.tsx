'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';

type BentoSpan = '2x2' | '2x1' | '1x2' | '1x1' | '3x1' | '1x3';
type BentoKind = 'feature' | 'stat' | 'compact' | 'media';

const spanMap: Record<BentoSpan, string> = {
  '1x1': 'col-span-1 row-span-1',
  '2x1': 'col-span-1 sm:col-span-2 row-span-1',
  '1x2': 'col-span-1 row-span-2',
  '2x2': 'col-span-1 sm:col-span-2 row-span-2',
  '3x1': 'col-span-1 sm:col-span-2 lg:col-span-3 row-span-1',
  '1x3': 'col-span-1 row-span-3',
};

const kindLayoutMap: Record<BentoKind, string> = {
  feature: 'flex flex-col items-start gap-3 p-5',
  stat: 'flex flex-col items-start justify-center gap-1 p-5',
  compact: 'flex items-center gap-2 p-3',
  media: 'relative overflow-hidden p-0',
};

export interface PixelBentoCellProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: BentoSpan;
  /** Canonical structural variant. */
  variant?: BentoKind;
  /**
   * @deprecated Use `variant` instead. Retained as alias for one minor.
   */
  kind?: BentoKind;
  tone?: ToneKey;
  surface?: Surface;
  /** Render with surface-aware border + radius chrome. Defaults to false (no chrome). */
  bordered?: boolean;
}

export const PixelBentoCell = forwardRef<HTMLDivElement, PixelBentoCellProps>(function PixelBentoCell(
  {
    span = '1x1',
    variant,
    kind,
    tone = 'neutral',
    surface: surfaceProp,
    className,
    children,
    bordered = false,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const t = toneTokens[tone];
  const Comp = 'div' as 'div';
  const resolvedVariant: BentoKind = variant ?? kind ?? 'feature';

  return (
    <Comp
      ref={ref}
      data-kind={resolvedVariant}
      data-span={span}
      className={cn(
        spanMap[span],
        kindLayoutMap[resolvedVariant],
        bordered && s.border,
        bordered && s.radiusLg,
        bordered && t.border,
        bordered && t.bg,
        bordered && t.text,
        s.transition,
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
});

PixelBentoCell.displayName = 'PixelBentoCell';
