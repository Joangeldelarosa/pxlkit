import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readStorage, removeStorage, writeStorage } from '../index';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('localStorage helpers', () => {
  it('round-trips JSON values', () => {
    writeStorage('key', { a: 1 });
    expect(window.localStorage.getItem('key')).toBe('{"a":1}');
    expect(readStorage('key', null)).toEqual({ a: 1 });
    removeStorage('key');
    expect(readStorage('key', 'fallback')).toBe('fallback');
  });

  it('uses custom serializers', () => {
    writeStorage('key', 42, (value) => `n:${value}`);
    expect(window.localStorage.getItem('key')).toBe('n:42');
    expect(readStorage('key', 0, (raw) => Number(raw.slice(2)))).toBe(42);
  });

  it('falls back on unreadable values', () => {
    window.localStorage.setItem('key', '{not json');
    expect(readStorage('key', 'fallback')).toBe('fallback');
  });

  it('swallows storage failures', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(() => writeStorage('key', 1)).not.toThrow();
    expect(() => removeStorage('key')).not.toThrow();
  });

  it('does nothing on the server', () => {
    vi.stubGlobal('window', undefined);
    expect(readStorage('key', 'fallback')).toBe('fallback');
    expect(() => writeStorage('key', 1)).not.toThrow();
    expect(() => removeStorage('key')).not.toThrow();
  });
});
