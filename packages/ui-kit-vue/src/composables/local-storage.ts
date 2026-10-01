import { readStorage, removeStorage, writeStorage } from '@pxlkit/ui-kit-core';
import { onMounted, readonly, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import { useEventListener } from './event-listener.js';

export interface UseLocalStorageOptions<T> {
  /** Custom serializer (default: `JSON.stringify`). */
  serialize?: (value: T) => string;
  /** Custom deserializer (default: `JSON.parse`). */
  deserialize?: (raw: string) => T;
  /** Follow changes other tabs make to the same key. Default `true`. */
  syncTabs?: boolean;
}

/**
 * State persisted to `localStorage`. Starts from `initialValue` (also on the
 * server) and reads the stored value once mounted, and again when `key`
 * changes. Returns `[value, setValue, remove]`: `setValue` takes a value or
 * an updater function; `remove` deletes the key and resets to
 * `initialValue`.
 */
export function useLocalStorage<T>(
  key: MaybeRefOrGetter<string>,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {},
): readonly [Readonly<Ref<T>>, (next: T | ((prev: T) => T)) => void, () => void] {
  const deserialize = (raw: string) => (options.deserialize ?? JSON.parse)(raw) as T;
  const serialize = (value: T) => (options.serialize ?? JSON.stringify)(value);
  const value = ref(initialValue) as Ref<T>;

  const load = () => {
    value.value = readStorage(toValue(key), initialValue, deserialize);
  };
  onMounted(load);
  watch(() => toValue(key), load);

  const setValue = (next: T | ((prev: T) => T)) => {
    const resolved = typeof next === 'function' ? (next as (prev: T) => T)(value.value) : next;
    writeStorage(toValue(key), resolved, serialize);
    value.value = resolved;
  };

  const remove = () => {
    removeStorage(toValue(key));
    value.value = initialValue;
  };

  useEventListener(
    'storage',
    (event) => {
      if (event.key !== toValue(key)) return;
      if (event.newValue === null) {
        value.value = initialValue;
        return;
      }
      try {
        value.value = deserialize(event.newValue);
      } catch {
        // Malformed payload from another tab — keep the current value.
      }
    },
    () => ((options.syncTabs ?? true) && typeof window !== 'undefined' ? window : null),
  );

  return [readonly(value) as Readonly<Ref<T>>, setValue, remove] as const;
}
