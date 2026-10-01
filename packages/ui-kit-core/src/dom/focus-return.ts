/**
 * Focus return for floating content (popovers, menus, pickers).
 *
 * When content that holds focus is removed from the page, the browser drops
 * focus to `<body>` and keyboard users lose their place. Call
 * `returnFocusOnRemoval` right before the content is removed: once it is
 * gone, focus moves to the element that opened it.
 */

/**
 * Hand focus back to `trigger` if `content` holds it and is about to be
 * removed. The check runs after the current task's DOM work (a microtask), so
 * it only acts when the content really left the document and focus fell back
 * to `<body>` — content that stays mounted (a development-mode remount) or
 * focus that already moved elsewhere is left alone.
 */
export function returnFocusOnRemoval(
  content: Element | null | undefined,
  trigger: () => HTMLElement | null | undefined,
): void {
  if (!content || typeof document === 'undefined') return;
  const active = document.activeElement;
  if (!active || !content.contains(active)) return;
  queueMicrotask(() => {
    if (content.isConnected) return;
    const current = document.activeElement;
    if (current && current !== document.body) return;
    const target = trigger();
    if (target?.isConnected) target.focus();
  });
}

/**
 * Remember the focused element before moving nodes around the document (a
 * portal moving its content into `<body>`): moving a focused element drops
 * its focus. Call the returned function after the move — it puts focus back
 * on that element if the move left focus on `<body>`.
 */
export function preserveFocus(): () => void {
  if (typeof document === 'undefined') return () => {};
  const active = document.activeElement as HTMLElement | null;
  return () => {
    if (!active || active === document.body || !active.isConnected) return;
    const current = document.activeElement;
    if (current && current !== document.body) return;
    active.focus();
  };
}
