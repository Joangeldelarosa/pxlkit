import { DOCUMENT, afterNextRender, inject, signal, type Signal } from '@angular/core';
import { readStorage, removeStorage, writeStorage } from '@pxlkit/ui-kit-core';
import { injectEventListener } from './dom';

export interface InjectLocalStorageOptions<T> {
  /** Custom serializer (default: `JSON.stringify`). */
  serialize?: (value: T) => string;
  /** Custom deserializer (default: `JSON.parse`). */
  deserialize?: (raw: string) => T;
  /** Follow changes other tabs make to the same key. Default `true`. */
  syncTabs?: boolean;
}

export interface LocalStorageState<T> {
  /** The current value. */
  readonly value: Signal<T>;
  /** Store a value, or the result of an updater function. */
  set(next: T | ((prev: T) => T)): void;
  /** Delete the key and reset to the initial value. */
  remove(): void;
}

/**
 * State persisted to `localStorage`. Starts from `initialValue` (also on the
 * server) and reads the stored value after the first render in the browser.
 * Call in an injection context.
 */
export function injectLocalStorage<T>(
  key: string,
  initialValue: T,
  options: InjectLocalStorageOptions<T> = {},
): LocalStorageState<T> {
  const deserialize = (raw: string) => (options.deserialize ?? JSON.parse)(raw) as T;
  const serialize = (value: T) => (options.serialize ?? JSON.stringify)(value);
  const value = signal(initialValue);
  const document = inject(DOCUMENT);

  afterNextRender(() => value.set(readStorage(key, initialValue, deserialize)));
  injectEventListener(
    'storage',
    (event) => {
      if (event.key !== key) return;
      if (event.newValue === null) {
        value.set(initialValue);
        return;
      }
      try {
        value.set(deserialize(event.newValue));
      } catch {
        // Malformed payload from another tab — keep the current value.
      }
    },
    () => ((options.syncTabs ?? true) ? document.defaultView : null),
  );

  return {
    value: value.asReadonly(),
    set: (next) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(value()) : next;
      writeStorage(key, resolved, serialize);
      value.set(resolved);
    },
    remove: () => {
      removeStorage(key);
      value.set(initialValue);
    },
  };
}
