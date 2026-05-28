'use client';

import { useEffect, useState } from 'react';

/**
 * Counts up from 0 to `to` over `duration` ms (RAF, ease-out cubic) when
 * `start` flips to true. Returns the rounded integer at the current frame.
 */
export function useCountUp({
  to,
  duration,
  start,
}: {
  to: number;
  duration: number;
  start: boolean;
}): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) {
      setValue(0);
      return;
    }
    let raf = 0;
    const t0 =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
    const tick = () => {
      const now =
        typeof performance !== 'undefined' && typeof performance.now === 'function'
          ? performance.now()
          : Date.now();
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, start]);

  return value;
}
