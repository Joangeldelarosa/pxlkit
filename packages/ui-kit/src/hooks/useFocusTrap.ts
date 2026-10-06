'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';
import { trapFocus } from '@pxlkit/ui-kit-core';

/**
 * Trap Tab focus inside `containerRef.current` while `active` is true.
 *
 * - On activate: snapshot `document.activeElement`, then focus the first
 *   focusable element inside the container.
 * - On Tab / Shift+Tab: cycle focus within the container's focusable
 *   children (ignores elements hidden via `aria-hidden`, `hidden`,
 *   `display:none`, or `visibility:hidden`).
 * - On deactivate: restore focus to the element that had it before — only
 *   if it's still in the DOM and focusable; otherwise falls back to body.
 *
 * The trap itself is the framework-neutral `trapFocus` from
 * @pxlkit/ui-kit-core, shared with the Vue and Angular kits.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
): void {
  // containerRef.current is read freshly by the trap; depending on the ref
  // object identity would tear down/re-run the effect every time the parent
  // re-renders with a new ref, which snapshots focus from INSIDE the trap.
  // React-recommended pattern: depend on the controlling flag only.
  useEffect(() => {
    if (!active) return;
    return trapFocus(() => containerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
