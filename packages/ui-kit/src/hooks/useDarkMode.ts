'use client';

import { useCallback, useEffect, useState } from 'react';

export type DarkMode = 'light' | 'dark' | 'system';
export type ResolvedMode = 'light' | 'dark';

const STORAGE_KEY = 'pxlkit:dark-mode';
const VALID_MODES: ReadonlyArray<DarkMode> = ['light', 'dark', 'system'];

function isDarkMode(value: unknown): value is DarkMode {
  return typeof value === 'string' && (VALID_MODES as ReadonlyArray<string>).includes(value);
}

function readStoredMode(): DarkMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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

function writeStoredMode(mode: DarkMode) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mode));
  } catch {
    /* swallow */
  }
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveMode(mode: DarkMode): ResolvedMode {
  if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return mode;
}

function applyResolvedToDocument(resolved: ResolvedMode) {
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

export function useDarkMode(): {
  mode: DarkMode;
  resolved: ResolvedMode;
  setMode: (m: DarkMode) => void;
} {
  // Deterministic initial state on BOTH server and first client render to
  // avoid hydration mismatch. The stored preference is read in a post-mount
  // effect; SSR consumers wanting a no-flash experience should inject an
  // inline `<script>` that writes `html.dark`/`html.light` before paint.
  const [mode, setModeState] = useState<DarkMode>('system');
  const [resolved, setResolved] = useState<ResolvedMode>('light');

  // Hydrate from storage on mount.
  useEffect(() => {
    const stored = readStoredMode();
    if (stored !== mode) setModeState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const next = resolveMode(mode);
    setResolved(next);
    applyResolvedToDocument(next);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') return;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (ev: MediaQueryListEvent) => {
      const next: ResolvedMode = ev.matches ? 'dark' : 'light';
      setResolved(next);
      applyResolvedToDocument(next);
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [mode]);

  const setMode = useCallback((next: DarkMode) => {
    writeStoredMode(next);
    setModeState(next);
  }, []);

  return { mode, resolved, setMode };
}
