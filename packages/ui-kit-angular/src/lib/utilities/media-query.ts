import {
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  signal,
  untracked,
  type Signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { REDUCED_MOTION_QUERY, matchesMediaQuery, subscribeMediaQuery } from '@pxlkit/ui-kit-core';

/**
 * Whether the component being created hydrates server-rendered markup.
 * Angular hydrates a component whose host carries the `ngh` annotation the
 * server rendered, and reads it — removing it — only once the component
 * exists, so its injection context still sees it.
 */
function hydratingHost(): boolean {
  // An element, or the comment a directive on an <ng-template> sits on.
  const host = inject<ElementRef<Partial<Element>>>(ElementRef, { optional: true })?.nativeElement;
  return host?.hasAttribute?.('ngh') === true;
}

/**
 * Whether a CSS media query matches, kept up to date. Starts from
 * `defaultValue` (default `false`) on the server and in a component that
 * hydrates server-rendered markup, so hydration adopts that markup as it is,
 * and takes the current match state once rendered; any other render in the
 * browser starts from `matchMedia`. Re-subscribes when a signal query
 * changes. Call in an injection context.
 *
 * @example
 * readonly isDesktop = injectMediaQuery('(min-width: 768px)');
 */
export function injectMediaQuery(query: string | (() => string), defaultValue = false): Signal<boolean> {
  const read = typeof query === 'string' ? () => query : query;
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return signal(defaultValue).asReadonly();

  const hydrating = hydratingHost();
  const matches = signal(hydrating ? defaultValue : matchesMediaQuery(untracked(read), defaultValue));
  const rendered = signal(!hydrating);
  if (hydrating) afterNextRender(() => rendered.set(true));

  let unsubscribe = () => {};
  effect(() => {
    if (!rendered()) return;
    const current = read();
    unsubscribe();
    matches.set(matchesMediaQuery(current, defaultValue));
    unsubscribe = subscribeMediaQuery(current, (next) => matches.set(next));
  });
  inject(DestroyRef).onDestroy(() => unsubscribe());
  return matches.asReadonly();
}

/** Whether the user prefers reduced motion. `false` on the server and while hydrating its markup. */
export function injectReducedMotion(): Signal<boolean> {
  return injectMediaQuery(REDUCED_MOTION_QUERY);
}
