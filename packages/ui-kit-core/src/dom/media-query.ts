/**
 * CSS media query helpers, safe to call on the server.
 */

function supportsMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

/** Whether `query` matches now — `fallback` without `matchMedia` (server rendering). */
export function matchesMediaQuery(query: string, fallback = false): boolean {
  return supportsMatchMedia() ? window.matchMedia(query).matches : fallback;
}

/**
 * Call `onChange` with the new match state whenever `query` starts or stops
 * matching. Returns the unsubscribe function (a no-op without `matchMedia`).
 */
export function subscribeMediaQuery(query: string, onChange: (matches: boolean) => void): () => void {
  if (!supportsMatchMedia()) return () => {};
  const mql = window.matchMedia(query);
  const handler = (event: MediaQueryListEvent) => onChange(event.matches);
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }
  // Legacy Safari fallback
  mql.addListener(handler);
  return () => mql.removeListener(handler);
}

/** The query behind `prefers-reduced-motion: reduce`. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
