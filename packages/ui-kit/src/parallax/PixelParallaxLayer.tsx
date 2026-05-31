'use client';

/* ─────────────────────────────────────────────────────────────────────────
   PixelParallaxLayer — scroll-driven translate layer (GPU-composited)
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '../common';

export interface PixelParallaxLayerProps {
  children: React.ReactNode;
  /** Parallax multiplier. 0 = no movement, 1 = full scroll speed, negative = reverse. */
  speed?: number;
  /** Axis to translate on. Default `"y"`. */
  axis?: 'x' | 'y' | 'both';
  className?: string;
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
 */
export const PixelParallaxLayer = forwardRef<HTMLDivElement, PixelParallaxLayerProps>(
  function PixelParallaxLayer({ children, speed = 0.5, axis = 'y', className, style }, forwardedRef) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const rafRef = useRef(0);

    const setRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;

      function update() {
        const scrollY = window.scrollY;
        const rect = el!.getBoundingClientRect();
        // offset relative to element's original position in viewport
        const centerY = rect.top + scrollY + rect.height / 2;
        const viewCenter = scrollY + window.innerHeight / 2;
        const delta = (viewCenter - centerY) * speed;

        if (axis === 'y') {
          el!.style.transform = `translate3d(0, ${delta}px, 0)`;
        } else if (axis === 'x') {
          el!.style.transform = `translate3d(${delta}px, 0, 0)`;
        } else {
          el!.style.transform = `translate3d(${delta}px, ${delta}px, 0)`;
        }

        rafRef.current = requestAnimationFrame(update);
      }

      rafRef.current = requestAnimationFrame(update);
      return () => cancelAnimationFrame(rafRef.current);
    }, [speed, axis]);

    return (
      <div ref={setRef} className={cn('will-change-transform', className)} style={style}>
        {children}
      </div>
    );
  }
);

PixelParallaxLayer.displayName = 'PixelParallaxLayer';
