import { REDUCED_MOTION_QUERY, matchesMediaQuery, subscribeMediaQuery } from '@pxlkit/ui-kit-core';
import { onMounted, onScopeDispose, readonly, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';

/**
 * Whether a CSS media query matches, kept up to date. Starts from
 * `matchMedia` in the browser and from `defaultValue` (default `false`) on the
 * server; re-subscribes when the query changes.
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 */
export function useMediaQuery(query: MaybeRefOrGetter<string>, defaultValue = false): Readonly<Ref<boolean>> {
  const matches = ref(matchesMediaQuery(toValue(query), defaultValue));
  let unsubscribe = () => {};
  const subscribe = () => {
    unsubscribe();
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const current = toValue(query);
    matches.value = window.matchMedia(current).matches;
    unsubscribe = subscribeMediaQuery(current, (next) => {
      matches.value = next;
    });
  };
  onMounted(subscribe);
  watch(() => toValue(query), subscribe);
  onScopeDispose(() => unsubscribe());
  return readonly(matches);
}

/**
 * Whether the user prefers reduced motion (`prefers-reduced-motion: reduce`).
 * `false` on the server.
 */
export function useReducedMotion(): Readonly<Ref<boolean>> {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
