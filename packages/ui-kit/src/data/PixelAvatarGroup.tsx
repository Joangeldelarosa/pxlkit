'use client';

import React, { forwardRef, Children, isValidElement } from 'react';
import {
  avatarGroupClasses,
  avatarGroupOverflowClasses,
  avatarGroupOverflowLabel,
  avatarGroupSlotClasses,
  groupOverflow,
  type PixelAvatarSize,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';

export interface PixelAvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: PixelAvatarSize;
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

  const items = Children.toArray(children).filter(isValidElement);
  const { visible: visibleCount, hidden: remainder } = groupOverflow(items.length, max);
  const visible = items.slice(0, visibleCount);

  const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
  const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
  const hasName = !!(ariaLabel || ariaLabelledBy);

  return (
    <div
      ref={ref}
      role={hasName ? 'group' : undefined}
      className={cn(avatarGroupClasses, className)}
      {...rest}
    >
      {visible.map((child, idx) => (
        <div
          key={(child as React.ReactElement).key ?? idx}
          className={avatarGroupSlotClasses(surface, size, idx)}
        >
          {child}
        </div>
      ))}
      {remainder > 0 && (
        <div className={avatarGroupOverflowClasses(surface, size, tone, visible.length > 0)}>
          <span aria-hidden>{`+${remainder}`}</span>
          <span className="sr-only">{avatarGroupOverflowLabel(remainder)}</span>
        </div>
      )}
    </div>
  );
});

PixelAvatarGroup.displayName = 'PixelAvatarGroup';
