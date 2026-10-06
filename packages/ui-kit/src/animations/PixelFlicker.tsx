'use client';

import React, { forwardRef } from 'react';
import { flickerStyle } from '@pxlkit/ui-kit-core';
import type { AnimationRepeat, AnimationTrigger } from './types';
import { mergeRefs, useAnimationTrigger } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelFlicker — broken-neon-sign opacity flicker loop.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelFlickerProps {
  /** Content to flicker. */
  children: React.ReactNode;
  /** Animation duration in milliseconds. Default `2200`. */
  duration?: number;
  /** Iteration count: a number or `'infinite'`. Default `'infinite'`. */
  repeat?: AnimationRepeat;
  /** When the animation should play. Default `'mount'`. */
  trigger?: AnimationTrigger;
  /** Fires after the final iteration. */
  onComplete?: () => void;
  /** Extra class names applied to the wrapping `<div>`. */
  className?: string;
}

export const PixelFlicker = forwardRef<HTMLDivElement, PixelFlickerProps>(function PixelFlicker(
  {
    children,
    duration = 2200,
    repeat = 'infinite',
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
      style={active ? flickerStyle({ duration, repeat }) : undefined}
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
});

PixelFlicker.displayName = 'PixelFlicker';
