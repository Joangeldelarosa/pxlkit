import { useEffect } from 'react';
import { lockScroll } from '@pxlkit/ui-kit-core';

/**
 * Lock page scroll while `active` is true. Multiple consumers stack — body
 * scroll is restored only after every lock has released.
 *
 * iOS Safari note: simply setting `body { overflow: hidden }` does NOT stop
 * touch scroll. The lock ALSO pins the body via `position: fixed` (saving the
 * current scrollY in `body.top`) and restores `window.scrollTo(savedScrollY)`
 * on release. This works on iOS, desktop, and Android.
 *
 * The lock is the framework-neutral `lockScroll` from @pxlkit/ui-kit-core, so
 * React, Vue and Angular overlays on one page share the same lock count.
 *
 * a11y note: this hook only locks scroll. Background content remains
 * readable by assistive tech. Modal callers should additionally apply
 * `inert` (or `aria-hidden="true"`) to siblings of the modal root and use
 * `useFocusTrap` to keep keyboard focus inside the modal.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    return lockScroll();
  }, [active]);
}
