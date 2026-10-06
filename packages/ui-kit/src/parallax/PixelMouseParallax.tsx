'use client';

/* ─────────────────────────────────────────────────────────────────────────
   PixelMouseParallax — cursor-tracking translate layer
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useEffect, useRef } from 'react';
import { createMouseParallaxMotion, mouseParallaxClasses, type MouseParallaxMotion } from '@pxlkit/ui-kit-core';
import { cn } from '../common';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface PixelMouseParallaxProps {
  /** The content that moves with the pointer. */
  children: React.ReactNode;
  /** Max travel distance in px. */
  strength?: number;
  /** If true, moves away from cursor instead of towards. */
  invert?: boolean;
  /** Extra classes on the wrapper. */
  className?: string;
  /** Inline styles of the wrapper. */
  style?: React.CSSProperties;
}

/**
 * PixelMouseParallax — Cursor-tracking parallax.
 *
 * Translates children based on the mouse position relative to the nearest
 * `PixelParallaxGroup` (or the viewport). Use `strength` to control the range
 * (in px) an element can travel. Invert with `invert`.
 *
 * Great for floating elements that follow or repel from the cursor. When the
 * user prefers reduced motion the layer holds still.
 */
export const PixelMouseParallax = forwardRef<HTMLDivElement, PixelMouseParallaxProps>(
  function PixelMouseParallax({ children, strength = 20, invert = false, className, style }, forwardedRef) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    // Where the layer is and where it heads outlive a change of props.
    const motionRef = useRef<MouseParallaxMotion | null>(null);
    const reducedMotion = useReducedMotion();

    const setRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    useEffect(() => {
      const el = innerRef.current;
      if (!el || reducedMotion) return;
      motionRef.current ??= createMouseParallaxMotion(el);
      return motionRef.current.follow({ strength, invert });
    }, [strength, invert, reducedMotion]);

    return (
      <div ref={setRef} className={cn(mouseParallaxClasses, className)} style={style}>
        {children}
      </div>
    );
  }
);

PixelMouseParallax.displayName = 'PixelMouseParallax';
