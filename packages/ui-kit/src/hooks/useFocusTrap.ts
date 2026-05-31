'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details > summary:first-of-type',
  'details',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isVisible(el: HTMLElement): boolean {
  if (el.hidden) return false;
  if (typeof window !== 'undefined') {
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden') return false;
    if (style.display === 'none') return false;
  }
  return true;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  const out: HTMLElement[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    if (el.getAttribute('aria-hidden') === 'true') continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    if (!isVisible(el)) continue;
    out.push(el);
  }
  // Some jsdom versions don't return matches in strict document order when
  // the selector contains `:first-of-type`. Sort defensively.
  out.sort((a, b) => {
    if (a === b) return 0;
    const pos = a.compareDocumentPosition(b);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
  return out;
}

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
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
): void {
  const previousRef = useRef<HTMLElement | null>(null);

  // containerRef.current is read freshly inside the effect; depending on the
  // ref object identity tears down/re-runs the effect every time the parent
  // re-renders with a new ref, which snapshots focus from INSIDE the trap.
  // React-recommended pattern: depend on the controlling flag only.
  useEffect(() => {
    if (!active) return;

    previousRef.current =
      (document.activeElement as HTMLElement | null) ?? null;

    const container = containerRef.current;
    let addedTabindex = false;
    if (container) {
      const focusables = getFocusable(container);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        if (!container.hasAttribute('tabindex')) {
          container.setAttribute('tabindex', '-1');
          addedTabindex = true;
        }
        container.focus();
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const node = containerRef.current;
      if (!node) return;
      const focusables = getFocusable(node);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const inside = current != null && node.contains(current);
      const inList = current != null && focusables.indexOf(current) !== -1;

      // Inside the container but not on a tabbable element (e.g. container
      // got focus via the fallback tabindex=-1, or a non-tabbable span got
      // programmatic focus). Redirect into the focusable cycle instead of
      // letting Tab escape to the next DOM node after the container.
      if (inside && !inList) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }

      if (e.shiftKey) {
        if (current === first || !inside) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (current === last || !inside) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    const toRestore = previousRef.current;

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (addedTabindex && container && container.getAttribute('tabindex') === '-1') {
        container.removeAttribute('tabindex');
      }
      if (
        toRestore &&
        typeof toRestore.focus === 'function' &&
        document.body.contains(toRestore) &&
        !(toRestore as HTMLButtonElement).disabled &&
        isVisible(toRestore)
      ) {
        toRestore.focus();
      } else if (typeof document !== 'undefined') {
        // Fall back to body so focus is at least somewhere deterministic.
        (document.body as HTMLElement).focus?.();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
