'use client';

import React, { forwardRef } from 'react';
import type { AnimationRepeat, AnimationTrigger } from './types';
import { mergeRefs, repeatToCss, useAnimationTrigger, usePixelAnimations } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelPulse — gently scales + dims children to draw attention.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelPulseProps {
  /** Content to pulse. */
  children: React.ReactNode;
  /** Animation duration in milliseconds. Default `2000`. */
  duration?: number;
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

export const PixelPulse = forwardRef<HTMLDivElement, PixelPulseProps>(function PixelPulse(
  {
    children,
    duration = 2000,
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
      className={className}
      style={
        active
          ? { animation: `pxl-pulse ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both` }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
});

PixelPulse.displayName = 'PixelPulse';
