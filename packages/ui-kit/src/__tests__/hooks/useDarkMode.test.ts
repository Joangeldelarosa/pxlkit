import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useDarkMode } from '../../hooks/useDarkMode';

type MediaListener = (ev: MediaQueryListEvent) => void;

interface FakeMediaQueryList {
  matches: boolean;
  media: string;
  onchange: MediaListener | null;
  addEventListener: (type: 'change', cb: MediaListener) => void;
  removeEventListener: (type: 'change', cb: MediaListener) => void;
  addListener: (cb: MediaListener) => void;
  removeListener: (cb: MediaListener) => void;
  dispatchEvent: (ev: Event) => boolean;
  _fire: (matches: boolean) => void;
}

const mqlRegistry: FakeMediaQueryList[] = [];

function createMatchMedia(initialDark: boolean) {
  return (query: string): FakeMediaQueryList => {
    const listeners = new Set<MediaListener>();
    const mql: FakeMediaQueryList = {
      matches: query.includes('dark') ? initialDark : false,
      media: query,
      onchange: null,
      addEventListener: (_type, cb) => {
        listeners.add(cb);
      },
      removeEventListener: (_type, cb) => {
        listeners.delete(cb);
      },
      addListener: (cb) => {
        listeners.add(cb);
      },
      removeListener: (cb) => {
        listeners.delete(cb);
      },
      dispatchEvent: () => true,
      _fire: (matches: boolean) => {
        mql.matches = matches;
        const ev = { matches, media: mql.media } as MediaQueryListEvent;
        listeners.forEach((cb) => cb(ev));
      },
    };
    mqlRegistry.push(mql);
    return mql;
  };
}

function setSystemDark(initialDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation(createMatchMedia(initialDark)),
  });
}

beforeEach(() => {
  mqlRegistry.length = 0;
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.remove('light');
  setSystemDark(false);
});

afterEach(() => {
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.remove('light');
});

describe('useDarkMode', () => {
  it('defaults to system mode with resolved derived from prefers-color-scheme', () => {
    setSystemDark(true);
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.mode).toBe('system');
    expect(result.current.resolved).toBe('dark');
  });

  it('setMode("dark") persists and sets resolved="dark"', () => {
    const { result } = renderHook(() => useDarkMode());
    act(() => {
      result.current.setMode('dark');
    });
    expect(result.current.mode).toBe('dark');
    expect(result.current.resolved).toBe('dark');
    expect(window.localStorage.getItem('pxlkit:dark-mode')).toContain('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('setMode("light") removes dark class from html and adds light class', () => {
    setSystemDark(true);
    const { result } = renderHook(() => useDarkMode());
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    act(() => {
      result.current.setMode('light');
    });
    expect(result.current.mode).toBe('light');
    expect(result.current.resolved).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('system mode follows matchMedia change', () => {
    setSystemDark(false);
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.resolved).toBe('light');

    act(() => {
      mqlRegistry.forEach((mql) => mql._fire(true));
    });

    expect(result.current.mode).toBe('system');
    expect(result.current.resolved).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
