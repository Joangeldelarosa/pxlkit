/* ═══════════════════════════════════════════════════════════════
 *  window.__pxlTerrain — debug-mode programmatic API
 *
 *  Exposed only when ?debug=1 OR in non-production builds. Used by:
 *    - Playwright visual scenarios (await window.__pxlTerrain.isReady())
 *    - Browser DevTools console (interactive inspection)
 *    - The DebugPanel UI (under the hood)
 *
 *  All methods are stateless w.r.t. each other — they query the
 *  current scene state through the DebugRefs the host component
 *  installs at mount.
 * ═══════════════════════════════════════════════════════════════ */

import type { BiomeType } from '../types';
import { sampleTerrain } from '../utils/terrain-sampler';
import {
  isTunnelAt as isTunnelAtImpl,
  computeRoadLevelAt,
  isOverWaterHighway,
} from '../utils/highway-geom';
import { getInterHighwayInfo } from '../city/layout';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { findTeleportTarget } from './teleport';
import type { TeleportResult } from './teleport';
import type { TeleportTarget } from './url-params';
import type {
  BiomeSample, CameraSnapshot, DebugRefs, HighwaySample, OverlayKind,
} from './types';

export interface PxlTerrainDebugApi {
  readonly version: '1';

  /* ── Snapshots ── */
  getSeed(): number;
  getCamera(): CameraSnapshot;
  getChunkCount(): number;
  getCacheSize(): number;
  getFps(): number;

  /* ── Samplers (pure noise — chunk cache not needed) ── */
  sampleBiome(wx: number, wz: number): BiomeSample;
  sampleHighway(wx: number, wz: number): HighwaySample;
  isTunnelAt(wx: number, wz: number): boolean;

  /* ── Teleport ── */
  teleportTo(wx: number, worldY: number, wz: number): void;
  teleportToTarget(target: TeleportTarget): TeleportResult | null;

  /* ── Mutation (dev-only, NOT persisted) ── */
  setSeed(seed: number): void;
  setRenderDistance(n: number): void;
  setBoatDensity(n: number): void;

  /* ── Overlays ── */
  setOverlay(kind: OverlayKind | 'all', on: boolean): void;
  getOverlays(): Record<OverlayKind, boolean>;

  /* ── Ready signal (Playwright waits on this) ── */
  isReady(): boolean;
  waitUntilReady(timeoutMs?: number): Promise<void>;

  /* ── Programmatic welcome dismissal (Playwright cannot trigger pointer-lock) ── */
  dismissWelcome(): void;
}

const GLOBAL_KEY = '__pxlTerrain' as const;

declare global {
  interface Window {
    [GLOBAL_KEY]?: PxlTerrainDebugApi;
  }
}

const ALL_OVERLAYS: readonly OverlayKind[] = [
  'grid', 'biome', 'highway', 'tunnel', 'bridge', 'water', 'boats',
];

/**
 * Install the debug API onto `window.__pxlTerrain`. Returns a cleanup
 * function. Call from a `useEffect` in the host component.
 */
export function installDebugGlobal(refs: DebugRefs): () => void {
  if (typeof window === 'undefined') return () => {};

  const READY_THRESHOLD_FRAMES = 30;   // ~0.5 s at 60 fps
  const READY_MIN_CHUNKS = 1;
  const READY_POLL_MS = 50;

  const api: PxlTerrainDebugApi = {
    version: '1',

    getSeed: () => refs.getSeed(),
    getCamera: () => refs.getCamera(),
    getChunkCount: () => refs.getCache().size,
    getCacheSize: () => refs.getCache().size,
    getFps: () => {
      const ms = refs.getAvgFrameMs();
      return ms > 0 ? Math.round(1000 / ms) : 0;
    },

    sampleBiome(wx, wz): BiomeSample {
      const s = refs.getSampler();
      if (!s) throw new Error('terrain sampler not yet available');
      return sampleTerrain(s, wx, wz);
    },

    sampleHighway(wx, wz): HighwaySample {
      const s = refs.getSampler();
      if (!s) throw new Error('terrain sampler not yet available');
      const hi = getInterHighwayInfo(wx, wz);
      return {
        hi,
        isTunnel: hi ? isTunnelAtImpl(s, wx, wz, hi) : false,
        isBridge: hi ? isOverWaterHighway(s, wx, wz, hi) : false,
        roadLevel: hi ? computeRoadLevelAt(s, wx, wz, hi) : -1,
      };
    },

    isTunnelAt(wx, wz): boolean {
      const s = refs.getSampler();
      if (!s) return false;
      return isTunnelAtImpl(s, wx, wz);
    },

    teleportTo(wx, worldY, wz) {
      refs.teleport(wx, worldY, wz);
    },

    teleportToTarget(target) {
      const s = refs.getSampler();
      if (!s) return null;
      const cam = refs.getCamera();
      // Search relative to current camera position (in voxel units)
      const camWx = cam.position[0] / VOXEL_SIZE;
      const camWz = cam.position[2] / VOXEL_SIZE;
      const result = findTeleportTarget(s, camWx, camWz, target);
      if (result) refs.teleport(result.wx * VOXEL_SIZE, result.worldY, result.wz * VOXEL_SIZE);
      return result;
    },

    setSeed(seed) { refs.setSeed(seed); },
    setRenderDistance(n) { refs.setRenderDistance(n); },
    setBoatDensity(n) { refs.setBoatDensity(n); },

    setOverlay(kind, on) {
      if (kind === 'all') {
        for (const k of ALL_OVERLAYS) refs.setOverlay(k, on);
      } else {
        refs.setOverlay(kind, on);
      }
    },
    getOverlays: () => refs.getOverlays(),

    isReady: () => {
      return refs.getFrameCount() >= READY_THRESHOLD_FRAMES
          && refs.getCache().size >= READY_MIN_CHUNKS;
    },

    async waitUntilReady(timeoutMs = 30000) {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        if (api.isReady()) return;
        await new Promise(r => setTimeout(r, READY_POLL_MS));
      }
      throw new Error(`world not ready after ${timeoutMs}ms`);
    },

    dismissWelcome() {
      // Programmatic equivalent of clicking "▶ CLICK TO EXPLORE". Sets
      // the locked + hidden-controls state directly so the canvas isn't
      // obscured by the welcome overlay. Used by Playwright; not exposed
      // in production builds.
      refs.dismissWelcome();
    },
  };

  window[GLOBAL_KEY] = api;
  return () => {
    if (window[GLOBAL_KEY] === api) delete window[GLOBAL_KEY];
  };
}
