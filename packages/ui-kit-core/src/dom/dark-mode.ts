/**
 * Light / dark / system colour mode: persistence, resolution and the classes
 * the theme stylesheet reads (`.dark` / `.light` on `<html>`).
 */
import { matchesMediaQuery } from './media-query';

export type DarkMode = 'light' | 'dark' | 'system';
export type ResolvedMode = 'light' | 'dark';

/** `localStorage` key of the chosen mode. */
export const DARK_MODE_STORAGE_KEY = 'pxlkit:dark-mode';

/** The query behind the system colour scheme. */
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const VALID_MODES: ReadonlyArray<DarkMode> = ['light', 'dark', 'system'];

function isDarkMode(value: unknown): value is DarkMode {
  return typeof value === 'string' && (VALID_MODES as ReadonlyArray<string>).includes(value);
}

/** The stored mode — `"system"` when none is stored or storage is unavailable. */
export function readStoredMode(): DarkMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const raw = window.localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (raw == null) return 'system';
    try {
      const parsed = JSON.parse(raw);
      if (isDarkMode(parsed)) return parsed;
    } catch {
      if (isDarkMode(raw)) return raw;
    }
  } catch {
    /* swallow — private mode / disabled storage */
  }
  return 'system';
}

/** Persist the chosen mode; failures are ignored. */
export function writeStoredMode(mode: DarkMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, JSON.stringify(mode));
  } catch {
    /* swallow */
  }
}

/** Whether the operating system prefers a dark colour scheme. */
export function systemPrefersDark(): boolean {
  return matchesMediaQuery(DARK_SCHEME_QUERY);
}

/** `"system"` resolved against the operating system preference. */
export function resolveMode(mode: DarkMode): ResolvedMode {
  if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return mode;
}

/** Put `.dark` or `.light` on `<html>`. */
export function applyResolvedMode(resolved: ResolvedMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
}
