import { onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue';

type ListenerTarget = Window | Document | HTMLElement | null | undefined;

/**
 * Listen to `type` on `target` (default: `window`) for the lifetime of the
 * calling component, re-subscribing when the target changes. SSR-safe: a
 * missing target (or `window` on the server) is a no-op.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  target?: MaybeRefOrGetter<Window | null | undefined>,
  options?: AddEventListenerOptions,
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (event: DocumentEventMap[K]) => void,
  target: MaybeRefOrGetter<Document | null | undefined>,
  options?: AddEventListenerOptions,
): void;
export function useEventListener<K extends keyof HTMLElementEventMap>(
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options?: AddEventListenerOptions,
): void;
export function useEventListener(
  type: string,
  listener: (event: Event) => void,
  target?: MaybeRefOrGetter<ListenerTarget>,
  options?: AddEventListenerOptions,
): void {
  const resolveTarget = (): ListenerTarget => {
    if (target === undefined) return typeof window !== 'undefined' ? window : null;
    return toValue(target);
  };
  const stop = watch(
    resolveTarget,
    (current, _previous, onCleanup) => {
      if (!current || typeof current.addEventListener !== 'function') return;
      current.addEventListener(type, listener, options);
      onCleanup(() => current.removeEventListener(type, listener, options));
    },
    { immediate: true, flush: 'post' },
  );
  onScopeDispose(stop);
}
