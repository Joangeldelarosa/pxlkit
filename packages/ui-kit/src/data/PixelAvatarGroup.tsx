'use client';

import React, { forwardRef, Children, isValidElement } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeDim: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[8px]',
  sm: 'h-8 w-8 text-[9px]',
  md: 'h-10 w-10 text-[10px]',
  lg: 'h-12 w-12 text-xs',
  xl: 'h-14 w-14 text-sm',
};

const overlap: Record<AvatarSize, string> = {
  xs: '-ml-2',
  sm: '-ml-2.5',
  md: '-ml-3',
  lg: '-ml-3.5',
  xl: '-ml-4',
};

const ringWidth: Record<Surface, string> = {
  pixel: 'ring-2',
  linear: 'ring-2',
};

const slotRadius: Record<Surface, string> = {
  pixel: 'rounded-[3px]',
  linear: 'rounded-full',
};

export interface PixelAvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarSize;
  tone?: ToneKey;
  surface?: Surface;
  /** Accessible name for the avatar landmark. Without one, role=group is dropped. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export const PixelAvatarGroup = forwardRef<HTMLDivElement, PixelAvatarGroupProps>(function PixelAvatarGroup(
  {
    max = 5,
    size = 'md',
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

  const items = Children.toArray(children).filter(isValidElement);
  const count = items.length;
  const overflowing = count > max;
  const visibleCount = overflowing ? Math.max(0, max - 1) : count;
  const visible = items.slice(0, visibleCount);
  const remainder = count - visibleCount;

  const dim = sizeDim[size];
  const margin = overlap[size];
  const radius = slotRadius[surface];

  const slotBase = cn(
    'inline-flex items-center justify-center overflow-hidden bg-retro-bg',
    s.border,
    'border-retro-border',
    radius,
    dim,
    ringWidth[surface],
    'ring-retro-bg',
  );

  const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
  const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
  const hasName = !!(ariaLabel || ariaLabelledBy);

  return (
    <div
      ref={ref}
      role={hasName ? 'group' : undefined}
      className={cn('inline-flex flex-row items-center', className)}
      {...rest}
    >
      {visible.map((child, idx) => (
        <div
          key={(child as React.ReactElement).key ?? idx}
          className={cn(slotBase, idx > 0 && margin)}
        >
          {child}
        </div>
      ))}
      {overflowing && (
        <div
          aria-label={`${remainder} more users`}
          className={cn(
            slotBase,
            visible.length > 0 && margin,
            t.border,
            t.bg,
            t.text,
            s.font,
            'font-pixel',
          )}
        >
          {`+${remainder}`}
        </div>
      )}
    </div>
  );
});

PixelAvatarGroup.displayName = 'PixelAvatarGroup';
