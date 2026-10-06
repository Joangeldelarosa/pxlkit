import { DOCUMENT, DestroyRef, PLATFORM_ID, afterNextRender, afterRenderEffect, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { lockScroll, trapFocus } from '@pxlkit/ui-kit-core';

type ListenerTarget = Window | Document | HTMLElement;

/**
 * Listen to `type` on `target` (default: `window`) from the first render in
 * the browser until the calling component is destroyed. Nothing happens on
 * the server. Call in an injection context.
 */
export function injectEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  target?: () => Window | null | undefined,
): void;
export function injectEventListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (event: DocumentEventMap[K]) => void,
  target: () => Document | null | undefined,
): void;
export function injectEventListener<K extends keyof HTMLElementEventMap>(
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  target: () => HTMLElement | null | undefined,
): void;
export function injectEventListener(
  type: string,
  listener: (event: Event) => void,
  target?: () => ListenerTarget | null | undefined,
): void {
  const document = inject(DOCUMENT);
  let attached: ListenerTarget | null = null;
  afterNextRender(() => {
    attached = (target ? target() : document.defaultView) ?? null;
    attached?.addEventListener(type, listener);
  });
  inject(DestroyRef).onDestroy(() => attached?.removeEventListener(type, listener));
}

/**
 * Trap Tab focus inside `container` while `active()` is true; on release
 * focus returns to the element that had it (see `trapFocus`). Browser only.
 */
export function injectFocusTrap(active: () => boolean, container: () => HTMLElement | null | undefined): void {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
  afterRenderEffect((onCleanup) => {
    if (!active()) return;
    onCleanup(trapFocus(container));
  });
}

/** Lock page scrolling while `active()` is true (locks stack — see `lockScroll`). Browser only. */
export function injectScrollLock(active: () => boolean): void {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
  afterRenderEffect((onCleanup) => {
    if (!active()) return;
    onCleanup(lockScroll());
  });
}

/** Call `handler` when Escape is pressed anywhere, while `enabled()` (default: always). */
export function injectEscape(handler: (event: KeyboardEvent) => void, enabled: () => boolean = () => true): void {
  injectEventListener('keydown', (event) => {
    if (enabled() && event.key === 'Escape') handler(event);
  });
}

/**
 * Call `handler` when a `pointerdown` lands outside `target()`. `pointerdown`
 * (not `mousedown`) so iOS Safari tap-to-dismiss works on the first tap.
 */
export function injectClickOutside(target: () => HTMLElement | null | undefined, handler: () => void): void {
  const document = inject(DOCUMENT);
  injectEventListener(
    'pointerdown',
    (event) => {
      const element = target();
      if (element && !element.contains(event.target as Node)) handler();
    },
    () => document,
  );
}
