import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns initial value when localStorage empty', () => {
    const { result } = renderHook(() => useLocalStorage('key-1', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('persists set value and reads it back', () => {
    const { result } = renderHook(() => useLocalStorage<string>('key-2', 'initial'));

    act(() => {
      result.current[1]('next');
    });

    expect(result.current[0]).toBe('next');
    expect(window.localStorage.getItem('key-2')).toBe(JSON.stringify('next'));

    // Functional updater should also work
    act(() => {
      result.current[1]((prev) => prev + '-suffix');
    });
    expect(result.current[0]).toBe('next-suffix');

    // Re-mounted hook reads the persisted value
    const { result: result2 } = renderHook(() =>
      useLocalStorage<string>('key-2', 'initial'),
    );
    expect(result2.current[0]).toBe('next-suffix');
  });

  it('removes value via remover', () => {
    window.localStorage.setItem('key-3', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage<string>('key-3', 'fallback'));
    expect(result.current[0]).toBe('stored');

    act(() => {
      result.current[2]();
    });

    expect(window.localStorage.getItem('key-3')).toBeNull();
    expect(result.current[0]).toBe('fallback');
  });

  it('updates from storage event when syncTabs true', () => {
    const { result } = renderHook(() => useLocalStorage<string>('key-4', 'initial'));
    expect(result.current[0]).toBe('initial');

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'key-4',
          newValue: JSON.stringify('from-other-tab'),
        }),
      );
    });

    expect(result.current[0]).toBe('from-other-tab');

    // null newValue should reset to initialValue
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'key-4',
          newValue: null,
        }),
      );
    });
    expect(result.current[0]).toBe('initial');
  });

  it('does not subscribe to storage when syncTabs false', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');

    const { result } = renderHook(() =>
      useLocalStorage<string>('key-5', 'initial', { syncTabs: false }),
    );

    const storageAdds = addSpy.mock.calls.filter((c) => c[0] === 'storage');
    expect(storageAdds.length).toBe(0);

    // Firing storage event must not mutate value
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'key-5',
          newValue: JSON.stringify('ignored'),
        }),
      );
    });
    expect(result.current[0]).toBe('initial');

    addSpy.mockRestore();
  });
});
