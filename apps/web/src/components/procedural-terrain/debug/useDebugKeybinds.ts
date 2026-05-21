/* ═══════════════════════════════════════════════════════════════
 *  useDebugKeybinds — hotkeys for the debug overlay system
 *
 *  Keys (all only when `enabled`):
 *    `         — toggle DebugPanel DOM overlay
 *    F3        — toggle DebugScene (all overlays at once)
 *    G         — chunk grid
 *    B         — biome tint
 *    Shift+H   — highway visualization
 *    T         — tunnel zones
 *    Shift+B   — bridge zones
 *    J         — boat candidates
 *    K         — water depth heatmap
 *
 *  Avoids: M (minimap), H (stats), F2 (screenshot),
 *  WASD/arrows/Space/Shift (movement), Esc (pointer unlock).
 * ═══════════════════════════════════════════════════════════════ */

import { useEffect } from 'react';
import type { OverlayKind } from './url-params';

export interface DebugKeybindHandlers {
  /** Toggle the DOM debug panel */
  togglePanel: () => void;
  /** Toggle the canvas overlay scene (all overlays at once) */
  toggleScene: () => void;
  /** Toggle individual overlay */
  setOverlay: (kind: OverlayKind, on: boolean) => void;
  /** Read current overlay state for a single kind */
  isOverlayOn: (kind: OverlayKind) => boolean;
}

export function useDebugKeybinds(
  enabled: boolean,
  handlers: DebugKeybindHandlers,
) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const k = e.key.toLowerCase();
      const shift = e.shiftKey;

      // Single-key toggles (no shift)
      if (!shift) {
        switch (k) {
          case '`':
          case '~':
            e.preventDefault();
            handlers.togglePanel();
            return;
          case 'g':
            e.preventDefault();
            handlers.setOverlay('grid', !handlers.isOverlayOn('grid'));
            return;
          case 'b':
            e.preventDefault();
            handlers.setOverlay('biome', !handlers.isOverlayOn('biome'));
            return;
          case 't':
            e.preventDefault();
            handlers.setOverlay('tunnel', !handlers.isOverlayOn('tunnel'));
            return;
          case 'j':
            e.preventDefault();
            handlers.setOverlay('boats', !handlers.isOverlayOn('boats'));
            return;
          case 'k':
            e.preventDefault();
            handlers.setOverlay('water', !handlers.isOverlayOn('water'));
            return;
        }
      } else {
        // Shift + key
        switch (k) {
          case 'h':
            e.preventDefault();
            handlers.setOverlay('highway', !handlers.isOverlayOn('highway'));
            return;
          case 'b':
            e.preventDefault();
            handlers.setOverlay('bridge', !handlers.isOverlayOn('bridge'));
            return;
        }
      }

      // F3
      if (e.key === 'F3') {
        e.preventDefault();
        handlers.toggleScene();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, handlers]);
}
