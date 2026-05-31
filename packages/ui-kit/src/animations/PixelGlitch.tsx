'use client';

import React, { forwardRef } from 'react';
import { cn } from '../common';
import type { AnimationTrigger } from './types';
import { mergeRefs, useAnimationTrigger, usePixelAnimations } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelGlitch — three-layer glitch effect (R/C ghost layers + main) with
   clip-path slices and color separation.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelGlitchProps {
  /** Content to glitch. */
  children: React.ReactNode;
  /** Length of one full glitch loop in milliseconds. Default `3000`. */
  duration?: number;
  /** Maximum horizontal displacement (pixels) of the ghost layers. Default `4`. */
  intensity?: number;
  /** When the animation should play. Default `'mount'`. */
  trigger?: AnimationTrigger;
  /** Fires after the final iteration. */
  onComplete?: () => void;
  /** Extra class names applied to the wrapping `<div>`. */
  className?: string;
}

export const PixelGlitch = forwardRef<HTMLDivElement, PixelGlitchProps>(function PixelGlitch(
  {
    children,
    duration = 3000,
    intensity = 4,
    trigger = 'mount',
    onComplete,
    className,
  },
  forwardedRef,
) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  const cssVars = { ['--pxl-glitch-x' as string]: `${intensity}px` };
  return (
    <div
      ref={mergeRefs(ref, forwardedRef)}
      {...handlers}
      className={cn('relative inline-block overflow-visible', className)}
    >
      {/* Ghost layer R — shifts left, fires on different clip zones */}
      {active && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            animation: `pxl-glitch-r ${duration}ms steps(1) infinite`,
            ...cssVars,
            filter: 'saturate(0) sepia(1) hue-rotate(-20deg) brightness(1.3)',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      )}
      {/* Ghost layer C — shifts right, fires on offset clip zones */}
      {active && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            animation: `pxl-glitch-c ${duration}ms steps(1) infinite`,
            ...cssVars,
            filter: 'saturate(0) sepia(1) hue-rotate(150deg) brightness(1.1)',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      )}
      {/* Main layer */}
      <div
        style={active ? { animation: `pxl-glitch ${duration}ms steps(1) infinite`, ...cssVars } : undefined}
        onAnimationEnd={handleAnimEnd}
      >
        {children}
      </div>
    </div>
  );
});

PixelGlitch.displayName = 'PixelGlitch';
