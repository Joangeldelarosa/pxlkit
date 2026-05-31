'use client';

import React, { forwardRef } from 'react';
import type { AnimationRepeat, AnimationTrigger } from './types';
import { mergeRefs, repeatToCss, useAnimationTrigger, usePixelAnimations } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelZoomIn — scales children from `startScale` to `1` with fade-in.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelZoomInProps {
  /** Content to zoom in. */
  children: React.ReactNode;
  /** Animation duration in milliseconds. Default `320`. */
  duration?: number;
  /** Animation delay in milliseconds. Default `0`. */
  delay?: number;
  /** Starting `scale()` factor. Default `0.92`. */
  startScale?: number;
  /** Iteration count: a number or `'infinite'`. Default `1`. */
  repeat?: AnimationRepeat;
  /** CSS `animation-timing-function`. Default `'cubic-bezier(.2,.9,.2,1)'`. */
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

export const PixelZoomIn = forwardRef<HTMLDivElement, PixelZoomInProps>(function PixelZoomIn(
  {
    children,
    duration = 320,
    delay = 0,
    startScale = 0.92,
    repeat = 1,
    easing = 'cubic-bezier(.2,.9,.2,1)',
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
          ? {
              animation: `pxl-zoom-in ${duration}ms ${easing} ${delay}ms ${repeatToCss(repeat)} ${fillMode}`,
              ['--pxl-zoom-start' as string]: String(startScale),
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

PixelZoomIn.displayName = 'PixelZoomIn';
