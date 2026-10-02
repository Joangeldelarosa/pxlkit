'use client';

import React, { forwardRef } from 'react';
import { slideInStyle } from '@pxlkit/ui-kit-core';
import type { AnimationRepeat, AnimationTrigger } from './types';
import { mergeRefs, useAnimationTrigger } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelSlideIn — translates children in from one of four edges.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelSlideInProps {
  /** Content to slide in. */
  children: React.ReactNode;
  /** Edge to slide from. Default `'down'`. */
  from?: 'up' | 'down' | 'left' | 'right';
  /** Animation duration in milliseconds. Default `350`. */
  duration?: number;
  /** Animation delay in milliseconds. Default `0`. */
  delay?: number;
  /** Translate distance in pixels. Default `10`. */
  distance?: number;
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

export const PixelSlideIn = forwardRef<HTMLDivElement, PixelSlideInProps>(function PixelSlideIn(
  {
    children,
    from = 'down',
    duration = 350,
    delay = 0,
    distance = 10,
    repeat = 1,
    easing = 'ease',
    fillMode = 'both',
    trigger = 'mount',
    onComplete,
    className,
  },
  forwardedRef,
) {
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={mergeRefs(ref, forwardedRef)}
      className={className}
      style={active ? slideInStyle({ from, duration, delay, distance, repeat, easing, fillMode }) : undefined}
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
});

PixelSlideIn.displayName = 'PixelSlideIn';
