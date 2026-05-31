'use client';

import React, { forwardRef } from 'react';
import {
  Surface,
  cn,
  sizeHeight,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';

export interface PixelInputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  surface?: Surface;
  /**
   * Accessible name for the group. Strongly recommended since this primitive
   * visually joins multiple form controls (e.g. country code + phone) — without
   * an accessible name a screen reader user has no idea what the group represents.
   * In dev, a missing name on a group of >1 child logs a warning.
   */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export const PixelInputGroup = forwardRef<HTMLDivElement, PixelInputGroupProps>(
  function PixelInputGroup(
    { size = 'md', surface: surfaceProp, className, children, role, ...rest },
    ref,
  ) {
    const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
    const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
    const hasName = !!(ariaLabel || ariaLabelledBy);
    const childCount = React.Children.count(children);

    if (process.env.NODE_ENV !== 'production' && childCount > 1 && !hasName) {
      // eslint-disable-next-line no-console
      console.warn(
        '[PixelInputGroup] missing aria-label / aria-labelledby. A group of joined ' +
          'controls is unintelligible to SR users without an accessible name.',
      );
    }
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);

    const items = React.Children.toArray(children).filter(React.isValidElement);
    const last = items.length - 1;

    const joined = items.map((child, i) => {
      const el = child as React.ReactElement<{
        className?: string;
        style?: React.CSSProperties;
      }>;
      const isFirst = i === 0;
      const isLast = i === last;
      // Strip inner border + radius so children look like one shell, then
      // add a right divider between segments (except on the last child).
      const joinedClass = cn(
        'border-0 rounded-none focus:z-10 focus-visible:z-10 relative',
        !isLast && cn('border-r', s.border, 'border-retro-border/60'),
        // Keep the original child className last so consumer styles win where needed.
        el.props.className,
      );
      void isFirst;
      return React.cloneElement(el, {
        ...(el.props as object),
        className: joinedClass,
      });
    });

    // Only set role=group when the group has an accessible name; otherwise drop
    // it so SR users don't hear an unlabeled "group" landmark.
    const effectiveRole = role ?? (hasName ? 'group' : undefined);

    return (
      <div
        ref={ref}
        role={effectiveRole}
        className={cn(
          'inline-flex w-full items-stretch overflow-hidden',
          sizeHeight[size],
          s.border,
          s.radius,
          'border-retro-border/60 bg-retro-surface/40',
          s.font,
          className,
        )}
        {...rest}
      >
        {joined}
      </div>
    );
  },
);

PixelInputGroup.displayName = 'PixelInputGroup';
