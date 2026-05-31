'use client';

import React, { forwardRef } from 'react';
import { cn } from '../common';
import type { AnimationRepeat, AnimationTrigger } from './types';
import { mergeRefs, repeatToCss, useAnimationTrigger, usePixelAnimations } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelRotate — full 360° rotation loop, configurable direction.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelRotateProps {
  /** Content to rotate. */
  children: React.ReactNode;
  /** Animation duration in milliseconds. Default `1800`. */
  duration?: number;
  /** Iteration count: a number or `'infinite'`. Default `'infinite'`. */
  repeat?: AnimationRepeat;
  /** CSS `animation-direction`. Default `'normal'`. */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  /** CSS `animation-timing-function`. Default `'linear'`. */
  easing?: string;
  /** When the animation should play. Default `'mount'`. */
  trigger?: AnimationTrigger;
  /** Fires after the final iteration. */
  onComplete?: () => void;
  /** Extra class names applied to the wrapping `<div>`. */
  className?: string;
}

export const PixelRotate = forwardRef<HTMLDivElement, PixelRotateProps>(function PixelRotate(
  {
    children,
    duration = 1800,
    repeat = 'infinite',
    direction = 'normal',
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
              animation: `pxl-rotate ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              animationDirection: direction,
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

PixelRotate.displayName = 'PixelRotate';
