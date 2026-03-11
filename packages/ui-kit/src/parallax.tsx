import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Tone, Size, Option, TabItem, AccordionItem, cn, useClickOutside,
  toneMap, sizeClass, focusRing, inputBase,
  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell
} from './common';



/**
 * PixelParallaxLayer — Scroll-based parallax.
 *
 * Wraps children in a layer that translates along Y (or X) proportionally to
 * scroll position.  `speed` controls the multiplier:
 *   - 0   = static (moves with page)
 *   - 0.5 = moves at half scroll speed (far background feel)
 *   - 1   = moves at scroll speed (baseline)
 *   - −0.3 = moves opposite direction (foreground float-up feel)
 *
 * The translation is computed with `transform: translate3d()` for GPU compositing.
 */
export function PixelParallaxLayer({
  children,
  speed = 0.5,
  axis = 'y',
  className,
  style,
}: {
  children: React.ReactNode;
  /** Parallax multiplier. 0 = no movement, 1 = full scroll speed, negative = reverse. */
  speed?: number;
  /** Axis to translate on. Default "y". */
  axis?: 'x' | 'y' | 'both';
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
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
    <div ref={ref} className={cn('will-change-transform', className)} style={style}>
      {children}
    </div>
  );
}

/**
 * PixelParallaxGroup — Container that establishes a perspective context.
 *
 * Wrap multiple PixelParallaxLayer or PixelMouseParallax elements inside this
 * to clip them within a shared viewport area.  Applies `overflow: hidden` and
 * `position: relative` automatically.
 */
export function PixelParallaxGroup({
  children,
  className,
  style,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** HTML tag to render. Default "div". */
  as?: 'div' | 'section' | 'header' | 'main';
}) {
  return (
    <Tag className={cn('relative overflow-hidden', className)} style={style}>
      {children}
    </Tag>
  );
}

/**
 * PixelMouseParallax — Cursor-tracking parallax.
 *
 * Translates children based on the mouse position relative to the nearest
 * PixelParallaxGroup (or the viewport).  Use `strength` to control the range
 * (in px) an element can travel.  Invert with `invert`.
 *
 * Great for floating elements that follow or repel from the cursor.
 */
export function PixelMouseParallax({
  children,
  strength = 20,
  invert = false,
  className,
  style,
}: {
  children: React.ReactNode;
  /** Max travel distance in px. */
  strength?: number;
  /** If true, moves away from cursor instead of towards. */
  invert?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
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
    <div ref={ref} className={cn('will-change-transform', className)} style={style}>
      {children}
    </div>
  );
}

