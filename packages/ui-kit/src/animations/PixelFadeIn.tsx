'use client';

import React, { forwardRef } from 'react';
import type { AnimationRepeat, AnimationTrigger } from './types';
import { mergeRefs, repeatToCss, useAnimationTrigger, usePixelAnimations } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelFadeIn — fades children from `opacity:0` to `opacity:1`.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelFadeInProps {
  /** Content to fade in. */
  children: React.ReactNode;
  /** Animation duration in milliseconds. Default `400`. */
  duration?: number;
  /** Animation delay in milliseconds. Default `0`. */
  delay?: number;
  /** Iteration count: a number or `'infinite'`. Default `1`. */
  repeat?: AnimationRepeat;
  /** CSS `animation-timing-function`. Default `'ease'`. */
  easing?: string;
  /** CSS `animation-fill-mode`. Default `'both'`. */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  /** When the animation should play. Default `'mount'`. */
  trigger?: AnimationTrigger;
  /** Fires after the final iteration. */
  onComplete?: () => void;
  /** Extra class names applied to the wrapping `<div>`. */
  className?: string;
}

export const PixelFadeIn = forwardRef<HTMLDivElement, PixelFadeInProps>(function PixelFadeIn(
  {
    children,
    duration = 400,
    delay = 0,
    repeat = 1,
    easing = 'ease',
    fillMode = 'both',
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
          ? { animation: `pxl-fade-in ${duration}ms ${easing} ${delay}ms ${repeatToCss(repeat)} ${fillMode}` }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
});

PixelFadeIn.displayName = 'PixelFadeIn';
