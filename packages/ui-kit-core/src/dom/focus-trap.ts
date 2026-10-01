/**
 * Focus trap for modal surfaces (dialogs, drawers, sheets, command palettes).
 *
 * Framework-neutral: React, Vue and Angular components activate it when
 * their surface opens and call the returned release function when it closes.
 */

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

/**
 * Keyboard-focusable descendants of `container`, in document order. Skips
 * elements hidden through `hidden`, `aria-hidden="true"` (on the element or
 * an ancestor), `display: none` or `visibility: hidden`.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  const out: HTMLElement[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i]!;
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
 * Trap Tab focus inside the container returned by `getContainer` until the
 * returned function is called.
 *
 * - On activation: snapshot `document.activeElement`, then focus the first
 *   focusable element inside the container (or the container itself, made
 *   focusable with a temporary `tabindex="-1"`, when it has none).
 * - On Tab / Shift+Tab: cycle focus within the container's focusable
 *   descendants. The container is read on every key press, so it may be
 *   re-rendered while the trap is active.
 * - On release: restore focus to the element that had it before — only if it
 *   is still in the document, enabled and visible; otherwise focus `body`.
 */
export function trapFocus(getContainer: () => HTMLElement | null | undefined): () => void {
  const toRestore = (document.activeElement as HTMLElement | null) ?? null;

  const container = getContainer() ?? null;
  let addedTabindex = false;
  if (container) {
    const focusables = getFocusableElements(container);
    if (focusables.length > 0) {
      focusables[0]!.focus();
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
    const node = getContainer();
    if (!node) return;
    const focusables = getFocusableElements(node);
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
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
    } else if (current === last || !inside) {
      e.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', onKeyDown, true);

  let released = false;
  return () => {
    if (released) return;
    released = true;
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
    } else {
      // Fall back to body so focus is at least somewhere deterministic.
      document.body.focus?.();
    }
  };
}
