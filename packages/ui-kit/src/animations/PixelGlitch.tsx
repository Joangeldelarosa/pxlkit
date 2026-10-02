'use client';

import React, { forwardRef } from 'react';
import { glitchClasses, glitchStyles } from '@pxlkit/ui-kit-core';
import { cn } from '../common';
import type { AnimationTrigger } from './types';
import { mergeRefs, useAnimationTrigger } from './_internal/animation-hooks';

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
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  const styles = glitchStyles({ duration, intensity });
  return (
    <div
      ref={mergeRefs(ref, forwardedRef)}
      {...handlers}
      className={cn(glitchClasses.root, className)}
    >
      {/* Ghost layer R — shifts left, fires on different clip zones */}
      {active && (
        <div aria-hidden className={glitchClasses.ghost} style={styles.red}>
          {children}
        </div>
      )}
      {/* Ghost layer C — shifts right, fires on offset clip zones */}
      {active && (
        <div aria-hidden className={glitchClasses.ghost} style={styles.cyan}>
          {children}
        </div>
      )}
      {/* Main layer */}
      <div style={active ? styles.main : undefined} onAnimationEnd={handleAnimEnd}>
        {children}
      </div>
    </div>
  );
});

PixelGlitch.displayName = 'PixelGlitch';
