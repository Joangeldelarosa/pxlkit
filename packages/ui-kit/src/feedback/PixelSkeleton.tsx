import React, { forwardRef } from 'react';
import {
  Surface, cn,
  surfaceClasses, useEffectiveSurface,
} from '../common';

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
  { width, height = '1rem', rounded = false, className, surface: surfaceProp, ariaLabel = 'Loading', style, ...rest },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const roundClass = rounded ? (surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full') : s.radius;
  return (
    <div
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      className={cn('animate-pulse bg-retro-surface/80', roundClass, className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
});

PixelSkeleton.displayName = 'PixelSkeleton';
