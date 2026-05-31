'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventListener } from './useEventListener';

export interface UseLocalStorageOptions<T> {
  /** Custom serializer (default: `JSON.stringify`). */
  serialize?: (value: T) => string;
  /** Custom deserializer (default: `JSON.parse`). */
  deserialize?: (raw: string) => T;
  /** Subscribe to cross-tab `storage` events. Default `true`. */
  syncTabs?: boolean;
}

/**
 * Persistent state synced to `window.localStorage`.
 *
 * SSR-safe: returns `initialValue` on first paint when `window` is undefined,
 * then hydrates from localStorage in an effect. Returns a tuple of
 * `[value, setValue, remove]`. `setValue` accepts a value or an updater
 * function (same signature as `useState`). `remove` deletes the key and resets
 * state back to `initialValue`.
 *
 * When `syncTabs` is `true` (default) the hook listens for `storage` events on
 * `window` and updates state when another tab mutates the same key.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  opts?: UseLocalStorageOptions<T>,
): readonly [T, (next: T | ((prev: T) => T)) => void, () => void] {
  const syncTabs = opts?.syncTabs ?? true;

  // Hold serializer / deserializer in refs so callers can pass inline lambdas
  // without re-triggering every effect on every render.
  const serializeRef = useRef(opts?.serialize ?? ((v: T) => JSON.stringify(v)));
  const deserializeRef = useRef(opts?.deserialize ?? ((s: string) => JSON.parse(s) as T));
  useEffect(() => {
    serializeRef.current = opts?.serialize ?? ((v: T) => JSON.stringify(v));
    deserializeRef.current = opts?.deserialize ?? ((s: string) => JSON.parse(s) as T);
  }, [opts?.serialize, opts?.deserialize]);

  const initialRef = useRef(initialValue);
  initialRef.current = initialValue;

  const readFromStorage = useCallback((): T => {
    if (typeof window === 'undefined') return initialRef.current;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialRef.current;
      return deserializeRef.current(raw);
    } catch {
      return initialRef.current;
    }
  }, [key]);

  const [value, setValueState] = useState<T>(initialValue);

  // Hydrate from storage when `key` changes (and once after mount).
  useEffect(() => {
    setValueState(readFromStorage());
  }, [readFromStorage]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, serializeRef.current(resolved));
          } catch {
            // Quota / privacy mode — ignore, keep in-memory state.
          }
        }
        return resolved;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
    setValueState(initialRef.current);
  }, [key]);

  const onStorage = useCallback(
    (event: StorageEvent) => {
      if (event.key !== key) return;
      if (event.newValue === null) {
        setValueState(initialRef.current);
        return;
      }
      try {
        setValueState(deserializeRef.current(event.newValue));
      } catch {
        // Malformed payload from another tab — keep current state.
      }
    },
    [key],
  );

  useEventListener(
    'storage',
    onStorage,
    syncTabs && typeof window !== 'undefined' ? window : null,
  );

  return [value, setValue, remove] as const;
}
