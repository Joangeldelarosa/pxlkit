/**
 * Shared viewport-visibility tracking for animated components.
 *
 * A single IntersectionObserver serves every subscriber — pages that render
 * dozens of animated icons (showcases, marquees) would otherwise pay for one
 * observer each. Subscribers receive `true`/`false` as their element enters
 * or leaves the viewport (with a small margin so animations resume just
 * before they scroll back in).
 *
 * Continuous animations (`loop` / `ping-pong`) use this to pause their frame
 * timers while off-screen: each timer tick is a React state update, and a
 * page full of looping icons re-rendering forever off-screen is a constant,
 * invisible frame-budget drain.
 *
 * SSR / no-IntersectionObserver environments degrade to "always visible".
 */

type VisibilityCallback = (visible: boolean) => void;

let observer: IntersectionObserver | null = null;
const subscribers = new Map<Element, VisibilityCallback>();

function ensureObserver(): IntersectionObserver | null {
  if (observer) return observer;
  if (typeof IntersectionObserver === 'undefined') return null;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        subscribers.get(entry.target)?.(entry.isIntersecting);
      }
    },
    { rootMargin: '100px 0px' },
  );
  return observer;
}

/**
 * Subscribe an element to shared visibility updates. Returns an unsubscribe
 * function. When IntersectionObserver is unavailable (SSR, older jsdom),
 * the callback is invoked once with `true` and never again.
 */
export function observeVisibility(
  el: Element,
  callback: VisibilityCallback,
): () => void {
  const obs = ensureObserver();
  if (!obs) {
    callback(true);
    return () => {};
  }
  subscribers.set(el, callback);
  obs.observe(el);
  return () => {
    subscribers.delete(el);
    obs.unobserve(el);
    if (subscribers.size === 0 && observer) {
      observer.disconnect();
      observer = null;
    }
  };
}
