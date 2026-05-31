'use client';

/* ─────────────────────────────────────────────────────────────────────────
   PixelMouseParallax — cursor-tracking translate layer
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '../common';

export interface PixelMouseParallaxProps {
  children: React.ReactNode;
  /** Max travel distance in px. */
  strength?: number;
  /** If true, moves away from cursor instead of towards. */
  invert?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PixelMouseParallax — Cursor-tracking parallax.
 *
 * Translates children based on the mouse position relative to the nearest
 * `PixelParallaxGroup` (or the viewport). Use `strength` to control the range
 * (in px) an element can travel. Invert with `invert`.
 *
 * Great for floating elements that follow or repel from the cursor.
 */
export const PixelMouseParallax = forwardRef<HTMLDivElement, PixelMouseParallaxProps>(
  function PixelMouseParallax({ children, strength = 20, invert = false, className, style }, forwardedRef) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const posRef = useRef({ x: 0, y: 0 });
    const targetRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef(0);

    const setRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;

      function handleMouse(e: MouseEvent) {
        // Find parent parallax group or use viewport
        const parent = el!.closest('[class*="relative"]') || document.body;
        const rect = parent.getBoundingClientRect();
        // Normalize to -1..1
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        const sign = invert ? -1 : 1;
        targetRef.current = { x: nx * strength * sign, y: ny * strength * sign };
      }

      function animate() {
        // Smooth lerp
        posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.08;
        posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.08;
        if (el) {
          el.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
        }
        rafRef.current = requestAnimationFrame(animate);
      }

      window.addEventListener('mousemove', handleMouse);
      rafRef.current = requestAnimationFrame(animate);

      return () => {
        window.removeEventListener('mousemove', handleMouse);
        cancelAnimationFrame(rafRef.current);
      };
    }, [strength, invert]);

    return (
      <div ref={setRef} className={cn('will-change-transform', className)} style={style}>
        {children}
      </div>
    );
  }
);

PixelMouseParallax.displayName = 'PixelMouseParallax';
