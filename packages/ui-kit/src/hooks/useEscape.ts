'use client';

import { useEventListener } from './useEventListener';

/**
 * Fires `handler` when the user presses Escape anywhere in the window.
 *
 * @param handler - Invoked with the originating `KeyboardEvent` when Escape is pressed.
 * @param enabled - Toggle the listener without unmounting (default `true`). When
 *   `false`, no listener is attached and Escape presses are ignored.
 */
export function useEscape(handler: (e: KeyboardEvent) => void, enabled: boolean = true): void {
  useEventListener(
    'keydown',
    (e) => {
      if (!enabled) return;
      if (e.key === 'Escape') handler(e);
    },
    typeof window !== 'undefined' ? window : null,
  );
}
