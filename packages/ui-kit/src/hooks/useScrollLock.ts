import { useEffect } from 'react';

let lockCount = 0;
let savedOverflow: string | null = null;
let savedScrollbarGutter: string | null = null;
let savedBodyPosition: string | null = null;
let savedBodyTop: string | null = null;
let savedBodyLeft: string | null = null;
let savedBodyRight: string | null = null;
let savedBodyWidth: string | null = null;
let savedScrollY = 0;

function acquire(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    savedScrollbarGutter = document.documentElement.style.scrollbarGutter;
    savedBodyPosition = document.body.style.position;
    savedBodyTop = document.body.style.top;
    savedBodyLeft = document.body.style.left;
    savedBodyRight = document.body.style.right;
    savedBodyWidth = document.body.style.width;
    savedScrollY = typeof window !== 'undefined' ? window.scrollY : 0;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.scrollbarGutter = 'stable';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  lockCount += 1;
}

function release(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow ?? '';
    document.documentElement.style.scrollbarGutter = savedScrollbarGutter ?? '';
    document.body.style.position = savedBodyPosition ?? '';
    document.body.style.top = savedBodyTop ?? '';
    document.body.style.left = savedBodyLeft ?? '';
    document.body.style.right = savedBodyRight ?? '';
    document.body.style.width = savedBodyWidth ?? '';

    if (typeof window !== 'undefined') {
      window.scrollTo(0, savedScrollY);
    }

    savedOverflow = null;
    savedScrollbarGutter = null;
    savedBodyPosition = null;
    savedBodyTop = null;
    savedBodyLeft = null;
    savedBodyRight = null;
    savedBodyWidth = null;
    savedScrollY = 0;
  }
}

/**
 * Lock page scroll while `active` is true. Multiple consumers stack — body
 * scroll is restored only after every lock has released.
 *
 * iOS Safari note: simply setting `body { overflow: hidden }` does NOT stop
 * touch scroll. This hook ALSO pins the body via `position: fixed` (saving the
 * current scrollY in `body.top`) and restores `window.scrollTo(savedScrollY)`
 * on release. This works on iOS, desktop, and Android.
 *
 * a11y note: this hook only locks scroll. Background content remains
 * readable by assistive tech. Modal callers should additionally apply
 * `inert` (or `aria-hidden="true"`) to siblings of the modal root and use
 * `useFocusTrap` to keep keyboard focus inside the modal.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    acquire();
    return () => {
      release();
    };
  }, [active]);
}
