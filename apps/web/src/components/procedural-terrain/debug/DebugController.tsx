/* ═══════════════════════════════════════════════════════════════
 *  <DebugController> — top-level debug orchestrator
 *
 *  Sits in the host (ProceduralTerrain root) and owns:
 *   - overlay state
 *   - panel visibility
 *   - DebugRefs object passed to installDebugGlobal
 *   - keybinds via useDebugKeybinds
 *   - the DebugPanel DOM (when visible)
 *
 *  The actual canvas overlays (<DebugScene>) are mounted by the
 *  parent inside <Canvas>; this component only renders the DOM
 *  and exposes the state via props/callbacks.
 * ═══════════════════════════════════════════════════════════════ */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { WorldConfig, ChunkVoxelData } from '../types';
import type { TerrainSamplerInputs } from '../utils/terrain-sampler';
import { sampleTerrain } from '../utils/terrain-sampler';
import {
  isTunnelAt,
  computeRoadLevelAt,
  isOverWaterHighway,
} from '../utils/highway-geom';
import { getInterHighwayInfo } from '../city/layout';
import { VOXEL_SIZE } from '../constants';
import { DebugPanel } from './DebugPanel';
import { useDebugKeybinds } from './useDebugKeybinds';
import { installDebugGlobal } from './global';
import { useFrameStatsRef } from './useFrameStats';
import { findTeleportTarget } from './teleport';
import type { OverlayKind, TeleportTarget } from './url-params';
import type {
  BiomeSample, CameraSnapshot, ChunkCache, DebugRefs, HighwaySample,
} from './types';

const OVERLAY_KEYS: readonly OverlayKind[] = [
  'grid', 'biome', 'highway', 'tunnel', 'bridge', 'water', 'boats',
];

const EMPTY_OVERLAYS: Record<OverlayKind, boolean> = {
  grid: false, biome: false, highway: false, tunnel: false,
  bridge: false, water: false, boats: false,
};

export interface DebugControllerProps {
  /** Master switch — when false, this component renders nothing. */
  enabled: boolean;
  /** Initial overlays from URL params */
  initialOverlays: OverlayKind[];
  /** Live snapshot of chunk cache */
  chunkCacheRef: React.RefObject<ChunkCache>;
  /** Current seed */
  seed: number;
  setSeed: (n: number) => void;
  /** Camera state (live) */
  getCamera: () => CameraSnapshot;
  /** Teleport implementation — mutates camera pos */
  teleport: (wx: number, worldY: number, wz: number) => void;
  /** Live config + setter for render distance / boat density */
  config: WorldConfig;
  setConfig: React.Dispatch<React.SetStateAction<WorldConfig>>;
  /** Sampler (built from current seed); null while not yet ready */
  sampler: TerrainSamplerInputs | null;
  /** Whether the pointer is currently locked (panel only shown when locked
   *  OR when explicitly toggled via `~`). */
  isLocked: boolean;
  /** Notify the host scene about overlay state so it can mount <DebugScene>. */
  onOverlaysChange: (overlays: Record<OverlayKind, boolean>) => void;
  /** Programmatic welcome dismissal — Playwright cannot trigger pointer-lock. */
  dismissWelcome: () => void;
}

export function DebugController(props: DebugControllerProps) {
  const {
    enabled, initialOverlays, chunkCacheRef, seed, setSeed,
    getCamera, teleport, config, setConfig, sampler, isLocked,
    onOverlaysChange, dismissWelcome,
  } = props;

  /* ── State ── */
  const [panelOpen, setPanelOpen] = useState(true);
  const [overlays, setOverlays] = useState<Record<OverlayKind, boolean>>(() => {
    const s = { ...EMPTY_OVERLAYS };
    for (const k of initialOverlays) s[k] = true;
    return s;
  });

  // Sync overlays out to host (so it can decide whether to mount DebugScene)
  useEffect(() => { onOverlaysChange(overlays); }, [overlays, onOverlaysChange]);

  /* ── Setters ── */
  const setOverlay = useCallback((k: OverlayKind, on: boolean) => {
    setOverlays(prev => ({ ...prev, [k]: on }));
  }, []);
  const togglePanel = useCallback(() => setPanelOpen(p => !p), []);
  const toggleScene = useCallback(() => {
    setOverlays(prev => {
      const anyOn = Object.values(prev).some(Boolean);
      const next = { ...EMPTY_OVERLAYS };
      if (!anyOn) {
        // Turn everything on
        for (const k of OVERLAY_KEYS) next[k] = true;
      }
      // else: leave all off
      return next;
    });
  }, []);

  const setRenderDistance = useCallback((n: number) => {
    const clamped = Math.max(2, Math.min(100, Math.round(n)));
    setConfig(prev => ({ ...prev, renderDistance: clamped }));
  }, [setConfig]);
  const setBoatDensity = useCallback((n: number) => {
    const clamped = Math.max(0, Math.min(1, n));
    setConfig(prev => ({ ...prev, boatDensity: clamped }));
  }, [setConfig]);

  const onTeleport = useCallback((target: TeleportTarget) => {
    if (!sampler) return;
    const cam = getCamera();
    const camWx = cam.position[0] / VOXEL_SIZE;
    const camWz = cam.position[2] / VOXEL_SIZE;
    const result = findTeleportTarget(sampler, camWx, camWz, target);
    if (result) teleport(result.wx * VOXEL_SIZE, result.worldY, result.wz * VOXEL_SIZE);
  }, [sampler, getCamera, teleport]);

  /* ── Frame stats ── */
  const statsRef = useFrameStatsRef(enabled);

  /* ── Sampling refs (for the live "sample at camera" row) ── */
  const [sampleAtCamera, setSampleAtCamera] = useState<{
    biome: BiomeSample | null;
    highway: HighwaySample | null;
  }>({ biome: null, highway: null });

  useEffect(() => {
    if (!enabled || !panelOpen || !sampler) return;
    const interval = setInterval(() => {
      const cam = getCamera();
      const wx = Math.round(cam.position[0] / VOXEL_SIZE);
      const wz = Math.round(cam.position[2] / VOXEL_SIZE);
      const biome = sampleTerrain(sampler, wx, wz);
      const hi = getInterHighwayInfo(wx, wz);
      const highway: HighwaySample = {
        hi,
        isTunnel: hi ? isTunnelAt(sampler, wx, wz, hi) : false,
        isBridge: hi ? isOverWaterHighway(sampler, wx, wz, hi) : false,
        roadLevel: hi ? computeRoadLevelAt(sampler, wx, wz, hi) : -1,
      };
      setSampleAtCamera({ biome, highway });
    }, 250);
    return () => clearInterval(interval);
  }, [enabled, panelOpen, sampler, getCamera]);

  /* ── Install window.__pxlTerrain ── */
  const debugRefs = useMemo<DebugRefs>(() => ({
    getSeed: () => seed,
    setSeed,
    getCamera,
    teleport,
    getCache: () => chunkCacheRef.current ?? new Map(),
    getSampler: () => sampler,
    setRenderDistance,
    setBoatDensity,
    setOverlay,
    getOverlays: () => overlays,
    getFrameCount: () => statsRef.current.frameCount,
    getAvgFrameMs: () => statsRef.current.avgMs,
    dismissWelcome,
  }), [
    seed, setSeed, getCamera, teleport, chunkCacheRef,
    sampler, setRenderDistance, setBoatDensity, setOverlay,
    overlays, statsRef, dismissWelcome,
  ]);

  useEffect(() => {
    if (!enabled) return;
    return installDebugGlobal(debugRefs);
  }, [enabled, debugRefs]);

  /* ── Keybinds ── */
  const isOverlayOn = useCallback((k: OverlayKind) => overlays[k], [overlays]);
  useDebugKeybinds(enabled, {
    togglePanel, toggleScene, setOverlay, isOverlayOn,
  });

  /* ── Render ── */
  if (!enabled) return null;
  if (!panelOpen) return null;
  // Only show the DOM panel when pointer is locked (player active) OR not locked
  // (so it stays visible at startup before user clicks-to-lock).
  // We always show it when enabled — locked state doesn't gate the panel itself.
  void isLocked;

  const cam = getCamera();
  return (
    <DebugPanel
      fps={statsRef.current.fps}
      avgMs={statsRef.current.avgMs}
      worstMs={statsRef.current.worstMs}
      chunkCount={chunkCacheRef.current?.size ?? 0}
      seed={seed}
      cameraPos={cam.position}
      biomeSample={sampleAtCamera.biome}
      highwaySample={sampleAtCamera.highway}
      overlays={overlays}
      onOverlayToggle={setOverlay}
      onTeleport={onTeleport}
      onClose={() => setPanelOpen(false)}
    />
  );
}
