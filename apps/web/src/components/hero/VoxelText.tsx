'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useMouse } from './mouseContext';
import { useReducedMotion } from './useReducedMotion';

export const MAX_TILT = 6;

/**
 * Pure tilt math: given normalized mouse coords -1..+1, return CSS rotation
 * degrees clamped to ±MAX_TILT. Y is inverted so mouse-up tilts the headline
 * upward (toward the viewer).
 */
export function computeTilt(mx: number, my: number): { tiltX: number; tiltY: number } {
  const cx = Math.max(-1, Math.min(1, mx));
  const cy = Math.max(-1, Math.min(1, my));
  // `|| 0` collapses -0 to +0 so toEqual({0,0}) matches at center.
  return { tiltY: cx * MAX_TILT || 0, tiltX: -cy * MAX_TILT || 0 };
}

/**
 * 3D voxel-style headline. Uses stacked text-shadows for fake-depth + a
 * subtle rotateX/Y tilt driven by mouse position. Respects prefers-reduced-motion.
 */
export function VoxelText({ children }: { children: ReactNode }) {
  const { mouseRef, active } = useMouse();
  const reduced = useReducedMotion();
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = () => {
      const el = innerRef.current;
      if (el) {
        if (active) {
          const { tiltX, tiltY } = computeTilt(mouseRef.current.x, mouseRef.current.y);
          el.style.setProperty('--tilt-x', `${tiltX}deg`);
          el.style.setProperty('--tilt-y', `${tiltY}deg`);
        } else {
          el.style.setProperty('--tilt-x', '0deg');
          el.style.setProperty('--tilt-y', '0deg');
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, mouseRef, reduced]);

  return (
    <h1
      data-testid="hero-headline"
      className="font-pixel text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-retro-green leading-none tracking-wider select-none whitespace-nowrap"
      style={{ perspective: '1000px' }}
    >
      <span
        ref={innerRef}
        className="inline-block"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateY(var(--tilt-y, 0deg)) rotateX(var(--tilt-x, 0deg))',
          transition: 'transform 100ms ease-out',
          textShadow: [
            '1px 1px 0 var(--color-retro-green-dark, #2a8f5f)',
            '2px 2px 0 var(--color-retro-green-dark, #2a8f5f)',
            '3px 3px 0 var(--color-retro-green-dark, #2a8f5f)',
            '4px 4px 0 var(--color-retro-green-dark, #2a8f5f)',
            '5px 5px 0 #0a0a0f',
            '6px 6px 0 #0a0a0f',
            '7px 7px 16px rgba(0, 200, 120, 0.55)',
          ].join(', '),
        }}
      >
        {children}
      </span>
    </h1>
  );
}
