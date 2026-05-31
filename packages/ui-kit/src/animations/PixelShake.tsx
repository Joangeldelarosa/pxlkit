'use client';

import React, { forwardRef } from 'react';
import { cn } from '../common';
import type { AnimationRepeat, AnimationTrigger } from './types';
import { mergeRefs, repeatToCss, useAnimationTrigger, usePixelAnimations } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelShake — quick horizontal shake. Pairs well with validation errors.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelShakeProps {
  /** Content to shake. */
  children: React.ReactNode;
  /** Animation duration in milliseconds. Default `450`. */
  duration?: number;
  /** Horizontal travel distance in pixels. Default `2`. */
  distance?: number;
  /** Iteration count: a number or `'infinite'`. Default `1`. */
  repeat?: AnimationRepeat;
  /** CSS `animation-timing-function`. Default `'linear'`. */
  easing?: string;
  /** When the animation should play. Default `'mount'`. */
  trigger?: AnimationTrigger;
  /** Fires after the final iteration. */
  onComplete?: () => void;
  /** Extra class names applied to the wrapping `<div>`. */
  className?: string;
}

export const PixelShake = forwardRef<HTMLDivElement, PixelShakeProps>(function PixelShake(
  {
    children,
    duration = 450,
    distance = 2,
    repeat = 1,
    easing = 'linear',
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
              animation: `pxl-shake ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              ['--pxl-shake-distance' as string]: `${distance}px`,
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

PixelShake.displayName = 'PixelShake';
