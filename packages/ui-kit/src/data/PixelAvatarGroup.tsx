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
  /** Most places the row shows; beyond it, the last place becomes a "+N" tile. */
  max?: number;
  /** Slot size — match it to the avatars inside. */
  size?: PixelAvatarSize;
  /** Tone of the "+N" tile. */
  tone?: ToneKey;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Accessible name for the avatar landmark. Without one, role=group is dropped. */
  'aria-label'?: string;
  /** Id of the element that names the group, in place of `aria-label`. */
  'aria-labelledby'?: string;
  /** The avatars. */
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
