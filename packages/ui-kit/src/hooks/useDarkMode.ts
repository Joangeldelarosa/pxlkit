'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DARK_SCHEME_QUERY,
  applyResolvedMode,
  readStoredMode,
  resolveMode,
  subscribeMediaQuery,
  writeStoredMode,
  type DarkMode,
  type ResolvedMode,
} from '@pxlkit/ui-kit-core';

// The mode logic (storage, resolution, the `<html>` classes) is shared with
// the Vue and Angular kits through @pxlkit/ui-kit-core.
export type { DarkMode, ResolvedMode } from '@pxlkit/ui-kit-core';

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
    applyResolvedMode(next);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') return;
    return subscribeMediaQuery(DARK_SCHEME_QUERY, (matches) => {
      const next: ResolvedMode = matches ? 'dark' : 'light';
      setResolved(next);
      applyResolvedMode(next);
    });
  }, [mode]);

  const setMode = useCallback((next: DarkMode) => {
    writeStoredMode(next);
    setModeState(next);
  }, []);

  return { mode, resolved, setMode };
}
