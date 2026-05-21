/* ═══════════════════════════════════════════════════════════════
 *  Debug types — shared between debug/ files and the global API
 * ═══════════════════════════════════════════════════════════════ */

import type { BiomeType, ContinentType, ChunkVoxelData } from '../types';
import type { InterHighwayInfo } from '../city/layout';
import type { TerrainSamplerInputs } from '../utils/terrain-sampler';
import type { OverlayKind, TeleportTarget } from './url-params';

export interface CameraSnapshot {
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface BiomeSample {
  biome: BiomeType;
  continent: ContinentType | null;
  height: number;
  waterLevel: number;
}

export interface HighwaySample {
  hi: InterHighwayInfo | null;
  isTunnel: boolean;
  isBridge: boolean;
  roadLevel: number;
}

export type ChunkCache = Map<string, ChunkVoxelData>;

export interface DebugRefs {
  /** Current seed (read-only — use setSeed to change) */
  getSeed: () => number;
  setSeed: (n: number) => void;
  /** Camera position/rotation snapshot */
  getCamera: () => CameraSnapshot;
  /** Programmatic teleport */
  teleport: (wx: number, worldY: number, wz: number, ry?: number) => void;
  /** Chunk cache */
  getCache: () => ChunkCache;
  /** Terrain sampler (deterministic noise queries) */
  getSampler: () => TerrainSamplerInputs | null;
  /** Set render distance live (clamped to [2, 100]) */
  setRenderDistance: (n: number) => void;
  /** Set boat density live (0..1) */
  setBoatDensity: (n: number) => void;
  /** Toggle a debug overlay */
  setOverlay: (kind: OverlayKind, on: boolean) => void;
  /** Snapshot of currently-enabled overlays */
  getOverlays: () => Record<OverlayKind, boolean>;
  /** Frame counter — incremented every render frame; used by isReady */
  getFrameCount: () => number;
  /** Average frame time (ms) over last ~60 frames */
  getAvgFrameMs: () => number;
  /** Programmatically dismiss the welcome screen / lock the cursor
   *  (Playwright can't trigger pointer-lock natively). */
  dismissWelcome: () => void;
}

export type { OverlayKind, TeleportTarget };
