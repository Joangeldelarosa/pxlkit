'use client';

import React, { forwardRef } from 'react';
import {
  INPUT_GROUP_UNNAMED_WARNING,
  inputGroupClasses,
  inputGroupItemClasses,
  inputGroupRole,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  cn,
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
      console.warn(INPUT_GROUP_UNNAMED_WARNING);
    }
    const surface = useEffectiveSurface(surfaceProp);

    const items = React.Children.toArray(children).filter(React.isValidElement);
    const last = items.length - 1;

    const joined = items.map((child, i) => {
      const el = child as React.ReactElement<{
        className?: string;
        style?: React.CSSProperties;
      }>;
      return React.cloneElement(el, {
        ...(el.props as object),
        // Keep the original child className last so consumer styles win where needed.
        className: cn(inputGroupItemClasses(i === last), el.props.className),
      });
    });

    return (
      <div
        ref={ref}
        role={inputGroupRole(role, hasName)}
        className={cn(inputGroupClasses(surface, size), className)}
        {...rest}
      >
        {joined}
      </div>
    );
  },
);

PixelInputGroup.displayName = 'PixelInputGroup';
