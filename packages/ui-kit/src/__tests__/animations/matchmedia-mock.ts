import { vi } from 'vitest';

/* ─────────────────────────────────────────────────────────────────────────
   matchmedia-mock — shared test helper for the animations suite.

   Installs a controllable `window.matchMedia` mock (same shape as the one
   used by the useMediaQuery / useReducedMotion hook tests) so component
   tests can simulate `prefers-reduced-motion: reduce` and flip it at
   runtime. NOT a test file — no `.test.` suffix, vitest skips it.
   ───────────────────────────────────────────────────────────────────────── */

type Listener = (e: { matches: boolean }) => void;

export interface MatchMediaController {
  /** Flip the simulated media-query result and notify all subscribers. */
  setMatches(matches: boolean): void;
  /** Restore the original `window.matchMedia`. Always call in `finally`/`afterEach`. */
  restore(): void;
}

/**
 * Replace `window.matchMedia` with a mock whose result is `initialMatches`
 * for every query. Returns a controller to flip the value (dispatching
 * `change` events to subscribers) and to restore the original.
 */
export function mockMatchMedia(initialMatches: boolean): MatchMediaController {
  const original = window.matchMedia;
  const listeners = new Set<Listener>();
  let current = initialMatches;

  const mql = {
    get matches() {
      return current;
    },
    media: '',
    addEventListener: vi.fn((_evt: string, cb: Listener) => {
      listeners.add(cb);
    }),
    removeEventListener: vi.fn((_evt: string, cb: Listener) => {
      listeners.delete(cb);
    }),
    addListener: vi.fn((cb: Listener) => listeners.add(cb)),
    removeListener: vi.fn((cb: Listener) => listeners.delete(cb)),
    dispatchEvent: vi.fn(),
    onchange: null,
  };

  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;

  return {
    setMatches(matches: boolean) {
      current = matches;
      listeners.forEach((cb) => cb({ matches }));
    },
    restore() {
      window.matchMedia = original;
    },
  };
}
