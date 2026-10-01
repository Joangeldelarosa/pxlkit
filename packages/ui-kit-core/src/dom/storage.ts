/**
 * `localStorage` access that never throws: unavailable storage (server
 * rendering, privacy modes, quota) degrades to in-memory behaviour.
 */

/** Value stored under `key`, deserialized — `fallback` when absent or unreadable. */
export function readStorage<T>(key: string, fallback: T, deserialize: (raw: string) => T = JSON.parse): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return deserialize(raw);
  } catch {
    return fallback;
  }
}

/** Store `value` under `key`; failures (quota, privacy mode) are ignored. */
export function writeStorage<T>(key: string, value: T, serialize: (value: T) => string = JSON.stringify): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, serialize(value));
  } catch {
    // Quota / privacy mode — keep the in-memory state only.
  }
}

/** Remove `key`; failures are ignored. */
export function removeStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
