'use client';

import React, { forwardRef } from 'react';
import { cn } from '../common';
import type { AnimationRepeat, AnimationTrigger } from './types';
import { mergeRefs, repeatToCss, useAnimationTrigger, usePixelAnimations } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelFloat — gentle vertical sine loop, perfect for hero badges.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelFloatProps {
  /** Content to float. */
  children: React.ReactNode;
  /** Animation duration in milliseconds. Default `2200`. */
  duration?: number;
  /** Vertical travel distance in pixels. Default `6`. */
  distance?: number;
  /** Iteration count: a number or `'infinite'`. Default `'infinite'`. */
  repeat?: AnimationRepeat;
  /** CSS `animation-timing-function`. Default `'ease-in-out'`. */
  easing?: string;
  /** When the animation should play. Default `'mount'`. */
  trigger?: AnimationTrigger;
  /** Fires after the final iteration. */
  onComplete?: () => void;
  /** Extra class names applied to the wrapping `<div>`. */
  className?: string;
}

export const PixelFloat = forwardRef<HTMLDivElement, PixelFloatProps>(function PixelFloat(
  {
    children,
    duration = 2200,
    distance = 6,
    repeat = 'infinite',
    easing = 'ease-in-out',
    trigger = 'mount',
    onComplete,
    className,
  },
  forwardedRef,
) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={mergeRefs(ref, forwardedRef)}
      className={cn('inline-block', className)}
      style={
        active
          ? {
              animation: `pxl-float ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              ['--pxl-float-distance' as string]: `${distance}px`,
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
});

PixelFloat.displayName = 'PixelFloat';
