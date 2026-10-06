import { DestroyRef, PLATFORM_ID, afterNextRender, effect, inject, signal, type Signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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

export interface DarkModeState {
  /** The chosen mode. */
  readonly mode: Signal<DarkMode>;
  /** `mode` with `"system"` resolved. */
  readonly resolved: Signal<ResolvedMode>;
  /** Choose and persist a mode. */
  setMode(mode: DarkMode): void;
}

/**
 * Light / dark / system colour mode, persisted in `localStorage` and applied
 * as `.dark` / `.light` on `<html>`. Starts as `"system"` / `"light"` on the
 * server and the first client render (no hydration mismatch), then reads the
 * stored mode and follows the system preference while the mode is
 * `"system"`. Call in an injection context.
 */
export function injectDarkMode(): DarkModeState {
  const mode = signal<DarkMode>('system');
  const resolved = signal<ResolvedMode>('light');

  if (isPlatformBrowser(inject(PLATFORM_ID))) {
    const ready = signal(false);
    afterNextRender(() => {
      mode.set(readStoredMode());
      ready.set(true);
    });
    let unsubscribe = () => {};
    effect(() => {
      if (!ready()) return;
      const current = mode();
      const next = resolveMode(current);
      resolved.set(next);
      applyResolvedMode(next);
      unsubscribe();
      unsubscribe =
        current === 'system'
          ? subscribeMediaQuery(DARK_SCHEME_QUERY, (matches) => {
              const value: ResolvedMode = matches ? 'dark' : 'light';
              resolved.set(value);
              applyResolvedMode(value);
            })
          : () => {};
    });
    inject(DestroyRef).onDestroy(() => unsubscribe());
  }

  return {
    mode: mode.asReadonly(),
    resolved: resolved.asReadonly(),
    setMode: (next) => {
      writeStoredMode(next);
      mode.set(next);
    },
  };
}
