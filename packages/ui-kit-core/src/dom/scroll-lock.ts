/**
 * Page scroll lock for modal surfaces.
 *
 * Locks stack: the page scrolls again only after every lock has been
 * released. The count lives in this module, so components of every
 * framework on the same page share it.
 *
 * iOS Safari note: `body { overflow: hidden }` alone does NOT stop touch
 * scrolling, so the body is also pinned with `position: fixed` (keeping the
 * current scroll offset in `top`), and `window.scrollTo` restores the offset
 * on release.
 *
 * a11y note: this only locks scrolling. Background content stays readable by
 * assistive technology; modal surfaces also trap focus (`trapFocus`).
 */

interface SavedBodyStyle {
  overflow: string;
  scrollbarGutter: string;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  scrollY: number;
}

let lockCount = 0;
let saved: SavedBodyStyle | null = null;

function acquire(): void {
  if (lockCount === 0) {
    const body = document.body.style;
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    saved = {
      overflow: body.overflow,
      scrollbarGutter: document.documentElement.style.scrollbarGutter,
      position: body.position,
      top: body.top,
      left: body.left,
      right: body.right,
      width: body.width,
      scrollY,
    };

    body.overflow = 'hidden';
    document.documentElement.style.scrollbarGutter = 'stable';
    body.position = 'fixed';
    body.top = `-${scrollY}px`;
    body.left = '0';
    body.right = '0';
    body.width = '100%';
  }
  lockCount += 1;
}

function release(): void {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0 && saved) {
    const body = document.body.style;
    body.overflow = saved.overflow;
    document.documentElement.style.scrollbarGutter = saved.scrollbarGutter;
    body.position = saved.position;
    body.top = saved.top;
    body.left = saved.left;
    body.right = saved.right;
    body.width = saved.width;

    if (typeof window !== 'undefined') {
      window.scrollTo(0, saved.scrollY);
    }
    saved = null;
  }
}

/**
 * Lock page scrolling until the returned function is called. Calling the
 * release function more than once has no further effect. Without a
 * `document` (server rendering) nothing is locked.
 */
export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {};
  acquire();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    release();
  };
}
