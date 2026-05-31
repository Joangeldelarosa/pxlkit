'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { stackGap, StackGapKey } from '../tokens';

type Ratio = '50/50' | '60/40' | '40/60' | '70/30' | '30/70';
type StackBp = 'sm' | 'md' | 'lg';
type Align = 'start' | 'center' | 'end' | 'stretch';

/**
 * Full Tailwind class for the non-stacked (always-split) ratio. Pre-enumerated
 * so the JIT picks them up — interpolated template-literal classes are not
 * statically discoverable.
 */
const ratioClassMap: Record<Ratio, string> = {
  '50/50': 'grid-cols-[1fr_1fr]',
  '60/40': 'grid-cols-[3fr_2fr]',
  '40/60': 'grid-cols-[2fr_3fr]',
  '70/30': 'grid-cols-[7fr_3fr]',
  '30/70': 'grid-cols-[3fr_7fr]',
};

const stackedColsAt: Record<StackBp, Record<Ratio, string>> = {
  sm: {
    '50/50': 'sm:grid-cols-[1fr_1fr]',
    '60/40': 'sm:grid-cols-[3fr_2fr]',
    '40/60': 'sm:grid-cols-[2fr_3fr]',
    '70/30': 'sm:grid-cols-[7fr_3fr]',
    '30/70': 'sm:grid-cols-[3fr_7fr]',
  },
  md: {
    '50/50': 'md:grid-cols-[1fr_1fr]',
    '60/40': 'md:grid-cols-[3fr_2fr]',
    '40/60': 'md:grid-cols-[2fr_3fr]',
    '70/30': 'md:grid-cols-[7fr_3fr]',
    '30/70': 'md:grid-cols-[3fr_7fr]',
  },
  lg: {
    '50/50': 'lg:grid-cols-[1fr_1fr]',
    '60/40': 'lg:grid-cols-[3fr_2fr]',
    '40/60': 'lg:grid-cols-[2fr_3fr]',
    '70/30': 'lg:grid-cols-[7fr_3fr]',
    '30/70': 'lg:grid-cols-[3fr_7fr]',
  },
};

const alignMap: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export interface PixelTwoColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: Ratio;
  gap?: StackGapKey;
  reverse?: boolean;
  stackBelow?: StackBp;
  align?: Align;
  left: React.ReactNode;
  right: React.ReactNode;
  surface?: Surface;
  as?: keyof React.JSX.IntrinsicElements;
}

export const PixelTwoColumn = forwardRef<HTMLDivElement, PixelTwoColumnProps>(function PixelTwoColumn(
  {
    ratio = '50/50',
    gap = 6,
    reverse = false,
    stackBelow = 'md',
    align,
    left,
    right,
    surface: surfaceProp,
    className,
    as,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);

  const stackedTemplate = stackBelow
    ? stackedColsAt[stackBelow][ratio]
    : ratioClassMap[ratio];

  const Comp = (as ?? 'div') as 'div';

  return (
    <Comp
      ref={ref}
      className={cn(
        'grid',
        stackBelow ? 'grid-cols-1' : '',
        stackedTemplate,
        stackGap[gap],
        align && alignMap[align],
        s.border, s.radius,
        s.transition,
        className,
      )}
      {...rest}
    >
      <div className={cn(reverse && 'order-2')}>{left}</div>
      <div className={cn(reverse && 'order-1')}>{right}</div>
    </Comp>
  );
});

PixelTwoColumn.displayName = 'PixelTwoColumn';
