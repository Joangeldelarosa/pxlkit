'use client';

import React, { forwardRef } from 'react';
import { bentoCellClasses, type BentoKind, type BentoSpan } from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';

export interface PixelBentoCellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Columns × rows the cell spans. */
  span?: BentoSpan;
  /** Canonical structural variant. */
  variant?: BentoKind;
  /**
   * @deprecated Use `variant` instead. Retained as alias for one minor.
   */
  kind?: BentoKind;
  /** Tone of the chrome. */
  tone?: ToneKey;
  /** Surface override; defaults to the nearest provider. */
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
  const Comp = 'div' as 'div';
  const resolvedVariant: BentoKind = variant ?? kind ?? 'feature';

  return (
    <Comp
      ref={ref}
      data-kind={resolvedVariant}
      data-span={span}
      className={cn(bentoCellClasses(surface, { span, kind: resolvedVariant, tone, bordered }), className)}
      {...rest}
    >
      {children}
    </Comp>
  );
});

PixelBentoCell.displayName = 'PixelBentoCell';
