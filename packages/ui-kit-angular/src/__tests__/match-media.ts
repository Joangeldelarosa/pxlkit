import { vi } from 'vitest';

export interface FakeMediaQueryList {
  matches: boolean;
  media: string;
  /** Flip the match state and notify every listener. */
  fire(matches: boolean): void;
  listenerCount(): number;
}

/**
 * Install a controllable `window.matchMedia`. `matchesFor(query)` gives the
 * initial match state of each query; `legacy` exposes only the old
 * `addListener` / `removeListener` API, as old Safari does.
 */
export function installMatchMedia(matchesFor: (query: string) => boolean, { legacy = false } = {}): FakeMediaQueryList[] {
  const lists: FakeMediaQueryList[] = [];
  const matchMedia = vi.fn((query: string) => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const add = (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener);
    const remove = (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener);
    const list = {
      matches: matchesFor(query),
      media: query,
      addListener: add,
      removeListener: remove,
      ...(legacy
        ? {}
        : {
            addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => add(listener),
            removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => remove(listener),
          }),
      fire(matches: boolean) {
        list.matches = matches;
        for (const listener of [...listeners]) listener({ matches, media: query } as MediaQueryListEvent);
      },
      listenerCount: () => listeners.size,
    };
    lists.push(list);
    return list;
  });
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: matchMedia });
  return lists;
}
