'use client';

/* ─────────────────────────────────────────────────────────────────────────
   PixelParallaxLayer — scroll-driven translate layer (GPU-composited)
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useEffect, useRef } from 'react';
import { followScroll, parallaxLayerClasses, type ParallaxAxis } from '@pxlkit/ui-kit-core';
import { cn } from '../common';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface PixelParallaxLayerProps {
  /** Content of the layer. */
  children: React.ReactNode;
  /** Parallax multiplier. 0 = no movement, 1 = full scroll speed, negative = reverse. */
  speed?: number;
  /** Axis to translate on. Default `"y"`. */
  axis?: ParallaxAxis;
  /** Extra classes on the wrapper. */
  className?: string;
  /** Inline styles of the wrapper. */
  style?: React.CSSProperties;
}

/**
 * PixelParallaxLayer — Scroll-based parallax.
 *
 * Wraps children in a layer that translates along Y (or X) proportionally to
 * scroll position. `speed` controls the multiplier:
 *   - 0   = static (moves with page)
 *   - 0.5 = moves at half scroll speed (far background feel)
 *   - 1   = moves at scroll speed (baseline)
 *   - −0.3 = moves opposite direction (foreground float-up feel)
 *
 * The translation is computed with `transform: translate3d()` for GPU compositing.
 * When the user prefers reduced motion the layer holds still.
 */
export const PixelParallaxLayer = forwardRef<HTMLDivElement, PixelParallaxLayerProps>(
  function PixelParallaxLayer({ children, speed = 0.5, axis = 'y', className, style }, forwardedRef) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const reducedMotion = useReducedMotion();

    const setRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    useEffect(() => {
      const el = innerRef.current;
      if (!el || reducedMotion) return;
      return followScroll(el, { speed, axis });
    }, [speed, axis, reducedMotion]);

    return (
      <div ref={setRef} className={cn(parallaxLayerClasses, className)} style={style}>
        {children}
      </div>
    );
  }
);

PixelParallaxLayer.displayName = 'PixelParallaxLayer';
