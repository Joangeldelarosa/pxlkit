import { DestroyRef, PLATFORM_ID, effect, inject, signal, untracked, type Signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { REDUCED_MOTION_QUERY, matchesMediaQuery, subscribeMediaQuery } from '@pxlkit/ui-kit-core';

/**
 * Whether a CSS media query matches, kept up to date. Starts from
 * `matchMedia` in the browser and from `defaultValue` (default `false`) on the
 * server; re-subscribes when a signal query changes. Call in an injection
 * context.
 *
 * @example
 * readonly isDesktop = injectMediaQuery('(min-width: 768px)');
 */
export function injectMediaQuery(query: string | (() => string), defaultValue = false): Signal<boolean> {
  const read = typeof query === 'string' ? () => query : query;
  const browser = isPlatformBrowser(inject(PLATFORM_ID));
  const matches = signal(browser ? matchesMediaQuery(untracked(read), defaultValue) : defaultValue);
  if (!browser) return matches.asReadonly();

  let unsubscribe = () => {};
  effect(() => {
    const current = read();
    unsubscribe();
    matches.set(matchesMediaQuery(current, defaultValue));
    unsubscribe = subscribeMediaQuery(current, (next) => matches.set(next));
  });
  inject(DestroyRef).onDestroy(() => unsubscribe());
  return matches.asReadonly();
}

/** Whether the user prefers reduced motion. `false` on the server. */
export function injectReducedMotion(): Signal<boolean> {
  return injectMediaQuery(REDUCED_MOTION_QUERY);
}
