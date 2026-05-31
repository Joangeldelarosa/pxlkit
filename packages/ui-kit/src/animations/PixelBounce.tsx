'use client';

import React, { forwardRef } from 'react';
import { cn } from '../common';
import type { AnimationRepeat, AnimationTrigger } from './types';
import { mergeRefs, repeatToCss, useAnimationTrigger, usePixelAnimations } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelBounce — vertical bounce with damped follow-through.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelBounceProps {
  /** Content to bounce. */
  children: React.ReactNode;
  /** Animation duration in milliseconds. Default `800`. */
  duration?: number;
  /** Iteration count: a number or `'infinite'`. Default `'infinite'`. */
  repeat?: AnimationRepeat;
  /** Peak bounce height in pixels. Default `8`. */
  height?: number;
  /** CSS `animation-timing-function`. Default `'ease'`. */
  easing?: string;
  /** When the animation should play. Default `'mount'`. */
  trigger?: AnimationTrigger;
  /** Fires after the final iteration. */
  onComplete?: () => void;
  /** Extra class names applied to the wrapping `<div>`. */
  className?: string;
}

export const PixelBounce = forwardRef<HTMLDivElement, PixelBounceProps>(function PixelBounce(
  {
    children,
    duration = 800,
    repeat = 'infinite',
    height = 8,
    easing = 'ease',
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
              animation: `pxl-bounce ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              ['--pxl-bounce-height' as string]: `${height}px`,
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

PixelBounce.displayName = 'PixelBounce';
