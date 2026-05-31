import { useEffect, useMemo, useRef } from 'react';

/**
 * Attach a typed event listener to `target` (default: `window`) for the
 * component lifetime. The listener is held in a ref so updating the
 * `listener` prop across re-renders does NOT detach/reattach — only `type`
 * or `target` (or a meaningfully-different `options` object) cause a
 * re-subscription. SSR-safe: a `null` target (or `window` when not in a
 * browser) is a no-op.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (e: WindowEventMap[K]) => void,
  target?: Window | null,
  options?: AddEventListenerOptions,
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (e: DocumentEventMap[K]) => void,
  target: Document | null,
  options?: AddEventListenerOptions,
): void;
export function useEventListener<K extends keyof HTMLElementEventMap>(
  type: K,
  listener: (e: HTMLElementEventMap[K]) => void,
  target: HTMLElement | null,
  options?: AddEventListenerOptions,
): void;
export function useEventListener(
  type: string,
  listener: (e: Event) => void,
  target?: Window | Document | HTMLElement | null,
  options?: AddEventListenerOptions,
): void {
  const savedListener = useRef(listener);

  useEffect(() => {
    savedListener.current = listener;
  }, [listener]);

  // `options` is almost always passed as an inline object literal — that
  // gets a fresh identity each render and would tear down + reattach the
  // subscription on every parent render. Stabilize via a string-keyed memo.
  const stableOptions = useMemo<AddEventListenerOptions | undefined>(
    () => options,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      options?.capture ?? false,
      options?.once ?? false,
      options?.passive ?? false,
      options?.signal,
    ],
  );

  useEffect(() => {
    const effectiveTarget: Window | Document | HTMLElement | null | undefined =
      target === undefined
        ? typeof window !== 'undefined'
          ? window
          : null
        : target;

    if (!effectiveTarget || typeof effectiveTarget.addEventListener !== 'function') {
      return;
    }

    const handler = (event: Event) => {
      savedListener.current(event);
    };

    effectiveTarget.addEventListener(type, handler, stableOptions);
    return () => {
      effectiveTarget.removeEventListener(type, handler, stableOptions);
    };
  }, [type, target, stableOptions]);
}
