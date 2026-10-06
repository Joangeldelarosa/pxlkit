'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { matchesMediaQuery, subscribeMediaQuery } from '@pxlkit/ui-kit-core';

/**
 * Subscribe to a CSS media query.
 *
 * SSR-safe: returns `defaultValue` (default `false`) on the server, and in
 * the render that hydrates server-rendered markup, so hydration matches
 * what the server sent; the current match state follows right after. A
 * render without server markup (a client-side mount, a component mounted
 * later) starts from the current match state. Without `matchMedia` it
 * keeps `defaultValue`. Follows `change` events, re-subscribes when the
 * `query` string changes and cleans up its listener on unmount.
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 */
export function useMediaQuery(query: string, defaultValue: boolean = false): boolean {
  const subscribe = useCallback((onChange: () => void) => subscribeMediaQuery(query, onChange), [query]);
  return useSyncExternalStore(
    subscribe,
    () => matchesMediaQuery(query, defaultValue),
    () => defaultValue,
  );
}
