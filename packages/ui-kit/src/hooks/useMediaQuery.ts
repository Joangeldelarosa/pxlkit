'use client';

import { useEffect, useState } from 'react';
import { matchesMediaQuery, subscribeMediaQuery } from '@pxlkit/ui-kit-core';

/**
 * Subscribe to a CSS media query.
 *
 * SSR-safe: returns `defaultValue` (default `false`) when `window` is
 * undefined or `matchMedia` is unavailable. On mount, syncs to the current
 * match state and subscribes to `change` events. Re-subscribes when the
 * `query` string changes and cleans up its listener on unmount.
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 */
export function useMediaQuery(query: string, defaultValue: boolean = false): boolean {
  const [matches, setMatches] = useState<boolean>(() => matchesMediaQuery(query, defaultValue));

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    setMatches(window.matchMedia(query).matches);
    return subscribeMediaQuery(query, setMatches);
  }, [query]);

  return matches;
}
