import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DARK_MODE_STORAGE_KEY,
  applyResolvedMode,
  readStoredMode,
  resolveMode,
  systemPrefersDark,
  writeStoredMode,
} from '../index';
import { installMatchMedia } from './match-media';

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = '';
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('dark mode', () => {
  it('reads the stored mode, as JSON or as a bare string', () => {
    expect(readStoredMode()).toBe('system');
    writeStoredMode('dark');
    expect(window.localStorage.getItem(DARK_MODE_STORAGE_KEY)).toBe('"dark"');
    expect(readStoredMode()).toBe('dark');
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, 'light');
    expect(readStoredMode()).toBe('light');
  });

  it('ignores invalid stored values', () => {
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, '"sepia"');
    expect(readStoredMode()).toBe('system');
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, 'sepia');
    expect(readStoredMode()).toBe('system');
  });

  it('survives unavailable storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readStoredMode()).toBe('system');
    expect(() => writeStoredMode('dark')).not.toThrow();
  });

  it('resolves system against prefers-color-scheme', () => {
    installMatchMedia((query) => query.includes('dark'));
    expect(systemPrefersDark()).toBe(true);
    expect(resolveMode('system')).toBe('dark');
    expect(resolveMode('light')).toBe('light');
    installMatchMedia(() => false);
    expect(resolveMode('system')).toBe('light');
  });

  it('puts exactly one of .dark / .light on <html>', () => {
    const root = document.documentElement;
    applyResolvedMode('dark');
    expect([root.classList.contains('dark'), root.classList.contains('light')]).toEqual([true, false]);
    applyResolvedMode('light');
    expect([root.classList.contains('dark'), root.classList.contains('light')]).toEqual([false, true]);
  });

  it('does nothing on the server', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('document', undefined);
    expect(readStoredMode()).toBe('system');
    expect(() => writeStoredMode('dark')).not.toThrow();
    expect(() => applyResolvedMode('dark')).not.toThrow();
  });
});
