// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

type ChangeListener = (e: { matches: boolean }) => void;

function createMatchMediaMock(initialMatches: boolean) {
  const listeners = new Set<ChangeListener>();
  const mql = {
    matches: initialMatches,
    media: '',
    addEventListener: vi.fn((_evt: string, cb: ChangeListener) => {
      listeners.add(cb);
    }),
    removeEventListener: vi.fn((_evt: string, cb: ChangeListener) => {
      listeners.delete(cb);
    }),
    addListener: vi.fn((cb: ChangeListener) => listeners.add(cb)),
    removeListener: vi.fn((cb: ChangeListener) => listeners.delete(cb)),
    dispatchEvent: vi.fn(),
    onchange: null,
  };
  const fire = (matches: boolean) => {
    mql.matches = matches;
    listeners.forEach((l) => l({ matches }));
  };
  return { mql, fire };
}

describe('useMediaQuery', () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    } else {
      delete (window as { matchMedia?: unknown }).matchMedia;
    }
    vi.restoreAllMocks();
  });

  it('returns false by default on server-rendered first paint (mock window undefined)', () => {
    // Simulate non-browser env: matchMedia missing → hook must fall back
    // to its defaultValue (false) without throwing.
    // @ts-expect-error force undefined to simulate SSR / non-browser
    window.matchMedia = undefined;
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('returns matches value from matchMedia after mount', () => {
    const { mql } = createMatchMediaMock(true);
    window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('updates when matchMedia change event fires', () => {
    const { mql, fire } = createMatchMediaMock(false);
    window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => {
      fire(true);
    });
    expect(result.current).toBe(true);

    act(() => {
      fire(false);
    });
    expect(result.current).toBe(false);
  });

  it('re-subscribes when query string changes', () => {
    const mockA = createMatchMediaMock(false);
    const mockB = createMatchMediaMock(true);
    const mm = vi.fn((q: string) => (q === 'A' ? mockA.mql : mockB.mql));
    window.matchMedia = mm as unknown as typeof window.matchMedia;

    const { result, rerender } = renderHook(({ q }: { q: string }) => useMediaQuery(q), {
      initialProps: { q: 'A' },
    });
    expect(result.current).toBe(false);
    expect(mockA.mql.addEventListener).toHaveBeenCalledTimes(1);

    rerender({ q: 'B' });
    expect(mockA.mql.removeEventListener).toHaveBeenCalledTimes(1);
    expect(mockB.mql.addEventListener).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(true);
  });
});
