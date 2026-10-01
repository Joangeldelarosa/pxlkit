import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` in the browser (runs before paint, so engine state never
 * flashes a stale frame) and `useEffect` during SSR, where layout effects do
 * not run and React 18 warns about them.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
