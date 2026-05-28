'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true when the user has requested reduced motion via the OS / browser.
 * SSR-safe: defaults to false on the server and on first client render, then
 * reflects the real value after mount.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return reduced;
}
