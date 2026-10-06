import { REDUCED_MOTION_QUERY, matchesMediaQuery, subscribeMediaQuery } from '@pxlkit/ui-kit-core';
import {
  getCurrentInstance,
  onMounted,
  onScopeDispose,
  readonly,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue';

/**
 * Whether a CSS media query matches, kept up to date. Starts from
 * `defaultValue` (default `false`) on the server and in a component that
 * hydrates server-rendered markup, so hydration matches what the server
 * sent, and takes the current match state once mounted; any other render in
 * the browser starts from `matchMedia`. Re-subscribes when the query
 * changes.
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 */
export function useMediaQuery(query: MaybeRefOrGetter<string>, defaultValue = false): Readonly<Ref<boolean>> {
  // A component that hydrates holds its server-rendered element while it
  // sets up; one that mounts gets its element only once rendered.
  const hydrating = getCurrentInstance()?.vnode.el != null;
  const matches = ref(hydrating ? defaultValue : matchesMediaQuery(toValue(query), defaultValue));
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
 * `false` on the server and while hydrating its markup.
 */
export function useReducedMotion(): Readonly<Ref<boolean>> {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
