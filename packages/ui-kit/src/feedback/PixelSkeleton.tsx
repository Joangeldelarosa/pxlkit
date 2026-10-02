import React, { forwardRef } from 'react';
import { SKELETON_DEFAULT_HEIGHT, SKELETON_DEFAULT_LABEL, skeletonClasses } from '@pxlkit/ui-kit-core';
import { Surface, cn, useEffectiveSurface } from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelSkeleton — loading placeholder. Pixel surface uses sharp corners.
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelSkeleton}. */
export interface PixelSkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'aria-label'> {
  /** CSS width (e.g. `"100%"`, `"12rem"`). */
  width?: string;
  /** CSS height (default `"1rem"`). */
  height?: string;
  /** When `true`, applies a pill/circle radius instead of the surface default. */
  rounded?: boolean;
  /** Surface override; falls back to nearest provider. */
  surface?: Surface;
  /** Accessible label override; falls back to `"Loading"`. */
  ariaLabel?: string;
}

export const PixelSkeleton = forwardRef<HTMLDivElement, PixelSkeletonProps>(function PixelSkeleton(
  {
    width,
    height = SKELETON_DEFAULT_HEIGHT,
    rounded = false,
    className,
    surface: surfaceProp,
    ariaLabel = SKELETON_DEFAULT_LABEL,
    style,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  return (
    <div
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      className={cn(skeletonClasses(surface, { rounded }), className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
});

PixelSkeleton.displayName = 'PixelSkeleton';
