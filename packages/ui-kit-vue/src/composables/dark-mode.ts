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
import { onMounted, onScopeDispose, readonly, ref, watch, type Ref } from 'vue';

/**
 * Light / dark / system colour mode, persisted in `localStorage` and applied
 * as `.dark` / `.light` on `<html>`. Starts as `"system"` / `"light"` on the
 * server and the first client render (no hydration mismatch), then reads the
 * stored mode once mounted and follows the system preference while the mode
 * is `"system"`.
 */
export function useDarkMode(): {
  mode: Readonly<Ref<DarkMode>>;
  resolved: Readonly<Ref<ResolvedMode>>;
  setMode: (mode: DarkMode) => void;
} {
  const mode = ref<DarkMode>('system');
  const resolved = ref<ResolvedMode>('light');
  let unsubscribe = () => {};

  const apply = () => {
    const next = resolveMode(mode.value);
    resolved.value = next;
    applyResolvedMode(next);
    unsubscribe();
    unsubscribe =
      mode.value === 'system'
        ? subscribeMediaQuery(DARK_SCHEME_QUERY, (matches) => {
            resolved.value = matches ? 'dark' : 'light';
            applyResolvedMode(resolved.value);
          })
        : () => {};
  };

  onMounted(() => {
    mode.value = readStoredMode();
    apply();
    watch(mode, apply);
  });
  onScopeDispose(() => unsubscribe());

  const setMode = (next: DarkMode) => {
    writeStoredMode(next);
    mode.value = next;
  };

  return { mode: readonly(mode), resolved: readonly(resolved), setMode };
}
