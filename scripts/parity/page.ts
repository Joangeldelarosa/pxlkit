/**
 * The page a scenario renders on: the reader's preferences, set before each
 * framework mounts, and the page's visibility, which steps change. Every
 * recording starts from the same page — reset after each one — so React and
 * the port see the same.
 */

/** The reader's preferences a scenario renders under. */
export interface PagePreferences {
  /**
   * The reader prefers reduced motion: `matchMedia('(prefers-reduced-motion:
   * reduce)')` matches. Without a preference jsdom has no `matchMedia` at
   * all, as old browsers do, which the kits treat as no preference.
   */
  reducedMotion?: boolean;
}

const matchMediaBefore = typeof window === 'undefined' ? undefined : Object.getOwnPropertyDescriptor(window, 'matchMedia');

/** A media query list that keeps its answer: preferences hold for a whole recording. */
function staticMediaQueryList(query: string, matches: boolean): MediaQueryList {
  return {
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  };
}

/** Set the reader's preferences before mounting; `resetPage()` takes them back. */
export function usePreferences({ reducedMotion }: PagePreferences): void {
  if (reducedMotion === undefined) return;
  const matchMedia = (query: string) =>
    staticMediaQueryList(query, reducedMotion && /\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/.test(query));
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: matchMedia });
}

/**
 * Hide or show the page, as switching tabs or minimising the window does:
 * `document.visibilityState` and `document.hidden` change, then
 * `visibilitychange` fires on the document.
 */
export function setPageVisibility(state: DocumentVisibilityState): void {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => state === 'hidden' });
  document.dispatchEvent(new Event('visibilitychange'));
}

/** The page as every recording starts: no preference, visible. */
export function resetPage(): void {
  if (matchMediaBefore) Object.defineProperty(window, 'matchMedia', matchMediaBefore);
  else Reflect.deleteProperty(window, 'matchMedia');
  // The prototype's getters answer again: a visible page.
  Reflect.deleteProperty(document, 'visibilityState');
  Reflect.deleteProperty(document, 'hidden');
}
