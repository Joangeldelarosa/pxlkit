'use client';

import { useMediaQuery } from './useMediaQuery';

/**
 * Subscribe to the user's `prefers-reduced-motion: reduce` setting.
 *
 * Returns `true` when the OS-level reduced-motion preference is active.
 * Thin wrapper over `useMediaQuery` — SSR-safe (defaults to `false` on the
 * server) and automatically reacts to OS-level toggles at runtime.
 *
 * @example
 * const reduced = useReducedMotion();
 * <div className={reduced ? '' : 'animate-pulse'}>...</div>
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
