'use client';

import React, { forwardRef } from 'react';
import {
  glitchClasses,
  glitchCopiesStyle,
  glitchMainClasses,
  glitchStyles,
  type GlitchElement,
} from '@pxlkit/ui-kit-core';
import { cn } from '../common';
import type { AnimationTrigger } from './types';
import { mergeRefs, useAnimationTrigger } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelGlitch — three-layer glitch effect (R/C ghost layers + main) with
   clip-path slices and color separation.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelGlitchProps {
  /** Content to glitch: each colour copy repeats it. */
  children?: React.ReactNode;
  /**
   * Text to glitch, in place of `children`: it is in the document once — the
   * stylesheet draws its colour copies — so a heading's text reads once to
   * crawlers, copying and text extraction.
   */
  label?: string;
  /** Length of one full glitch loop in milliseconds. Default `3000`. */
  duration?: number;
  /** Maximum horizontal displacement (pixels) of the ghost layers. Default `4`. */
  intensity?: number;
  /** When the animation should play. Default `'mount'`. */
  trigger?: AnimationTrigger;
  /** Fires after the final iteration. */
  onComplete?: () => void;
  /**
   * Element of the wrapper and its layers. `'span'` puts the glitch inside
   * phrasing content, such as a heading: wrap the heading around it, as the
   * layers repeat whatever they hold. Default `'div'`.
   */
  as?: GlitchElement;
  /** Extra class names applied to the wrapper. */
  className?: string;
}

export const PixelGlitch = forwardRef<HTMLElement, PixelGlitchProps>(function PixelGlitch(
  {
    children,
    label,
    duration = 3000,
    intensity = 4,
    trigger = 'mount',
    onComplete,
    as = 'div',
    className,
  },
  forwardedRef,
) {
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  const styles = glitchStyles({ duration, intensity });
  const Layer = as as 'div';
  if (label !== undefined) {
    // The text once, in the content's layer; the stylesheet draws the copies
    // from data-text while the glitch plays.
    return (
      <Layer
        ref={mergeRefs<HTMLElement>(ref, forwardedRef)}
        {...handlers}
        data-text={label}
        className={cn(glitchClasses.root, active && glitchClasses.copies, className)}
        style={active ? glitchCopiesStyle({ duration, intensity }) : undefined}
      >
        <Layer className={glitchMainClasses(as)} style={active ? styles.main : undefined} onAnimationEnd={handleAnimEnd}>
          {label}
        </Layer>
      </Layer>
    );
  }
  return (
    <Layer
      ref={mergeRefs<HTMLElement>(ref, forwardedRef)}
      {...handlers}
      className={cn(glitchClasses.root, className)}
    >
      {/* Ghost layer R — shifts left, fires on different clip zones */}
      {active && (
        <Layer aria-hidden className={glitchClasses.ghost} style={styles.red}>
          {children}
        </Layer>
      )}
      {/* Ghost layer C — shifts right, fires on offset clip zones */}
      {active && (
        <Layer aria-hidden className={glitchClasses.ghost} style={styles.cyan}>
          {children}
        </Layer>
      )}
      {/* Main layer */}
      <Layer className={glitchMainClasses(as)} style={active ? styles.main : undefined} onAnimationEnd={handleAnimEnd}>
        {children}
      </Layer>
    </Layer>
  );
});

PixelGlitch.displayName = 'PixelGlitch';
