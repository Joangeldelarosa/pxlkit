import { lockScroll, trapFocus } from '@pxlkit/ui-kit-core';
import { onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useEventListener } from './event-listener.js';

/**
 * Trap Tab focus inside `container` while `active` is true; on release focus
 * returns to the element that had it (see `trapFocus`).
 *
 * The trap starts once the container is rendered — for a component that
 * mounts already active, after its first render rather than during setup —
 * and restarts on a new container element.
 */
export function useFocusTrap(
  active: MaybeRefOrGetter<boolean>,
  container: MaybeRefOrGetter<HTMLElement | null | undefined>,
): void {
  const stop = watch(
    [() => toValue(active), () => toValue(container)],
    ([isActive, element], _previous, onCleanup) => {
      if (!isActive || !element) return;
      onCleanup(trapFocus(() => toValue(container)));
    },
    { immediate: true, flush: 'post' },
  );
  onScopeDispose(stop);
}

/** Lock page scrolling while `active` is true (locks stack — see `lockScroll`). */
export function useScrollLock(active: MaybeRefOrGetter<boolean>): void {
  const stop = watch(
    () => toValue(active),
    (isActive, _previous, onCleanup) => {
      if (!isActive || typeof document === 'undefined') return;
      onCleanup(lockScroll());
    },
    { immediate: true, flush: 'post' },
  );
  onScopeDispose(stop);
}

/** Call `handler` when Escape is pressed anywhere, while `enabled` (default `true`). */
export function useEscape(handler: (event: KeyboardEvent) => void, enabled: MaybeRefOrGetter<boolean> = true): void {
  useEventListener('keydown', (event) => {
    if (!toValue(enabled)) return;
    if (event.key === 'Escape') handler(event);
  });
}

/**
 * Call `handler` when a `pointerdown` lands outside `target`. `pointerdown`
 * (not `mousedown`) so iOS Safari tap-to-dismiss works on the first tap.
 */
export function useClickOutside(target: MaybeRefOrGetter<HTMLElement | null | undefined>, handler: () => void): void {
  useEventListener(
    'pointerdown',
    (event) => {
      const element = toValue(target);
      if (element && !element.contains(event.target as Node)) handler();
    },
    () => (typeof document !== 'undefined' ? document : null),
  );
}
