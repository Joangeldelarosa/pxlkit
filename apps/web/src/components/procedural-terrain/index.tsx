/* ═══════════════════════════════════════════════════════════════
 *  Procedural Terrain — Main Orchestrator
 *
 *  This is the single entry point for the /explore 3D world.
 *  It imports all subsystems from their own modules:
 *
 *  📁 procedural-terrain/
 *  ├── types.ts           — WorldConfig, BiomeConfig, ChunkVoxelData, etc.
 *  ├── constants.ts       — CHUNK_SIZE, BIOMES, building palettes
 *  ├── utils/
 *  │   ├── noise.ts       — createNoise2D, fbm, mulberry32
 *  │   ├── color.ts       — varyColor, hashCoord, shiftColor
 *  │   └── biomes.ts      — getBiome, getVariedBiome
 *  ├── city/
 *  │   ├── layout.ts      — classifyCityCell, getZone, multi-lot system
 *  │   └── buildings.ts   — generateBuildingColumn (all 20+ building types)
 *  ├── generation/
 *  │   └── chunk.ts       — generateChunkData
 *  ├── rendering/
 *  │   ├── ChunkMesh.tsx  — instanced mesh renderer + FloatingPickup
 *  │   ├── WorldLighting.tsx — lights, sky dome, fog
 *  │   └── SurfaceDetailLayer.tsx — voxel detail LOD
 *  ├── effects/
 *  │   ├── AmbientParticles.tsx
 *  │   ├── SkyBirds.tsx
 *  │   └── GroundCritters.tsx
 *  ├── camera/
 *  │   ├── FlyCamera.tsx  — movement + collision
 *  │   └── CameraLook.tsx — mouse/touch look
 *  ├── ui/
 *  │   └── Controls.tsx   — OverlayStats, ConfigSlider, MobileTouchControls
 *  └── index.tsx          — this file (main component)
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Link from 'next/link';

/* ── PxlKit icon imports (for pickup sprites) ── */
import { Trophy, Star, Coin, Crown, Gem, Shield, Lightning, Key, Sword } from '@pxlkit/gamification';
import { Heart } from '@pxlkit/social';
import { Check, Package, SparkleSmall, Robot } from '@pxlkit/ui';
import { Sun, Moon, Snowflake } from '@pxlkit/weather';
import type { PxlKitData } from '@pxlkit/core';

/* ── Internal modules ── */
import type { WorldConfig, WorldMode, ChunkVoxelData } from './types';
import { DEFAULT_CONFIG } from './types';
import {
  CHUNK_SIZE, VOXEL_SIZE, MAX_HEIGHT,
  BIOMES, DEFAULT_CHUNKS_PER_FRAME,
  DIR_PRECISION, VIEW_DIR_WEIGHT, DIST_PENALTY,
} from './constants';
import { createNoise2D } from './utils/noise';
import { getBiome } from './utils/biomes';
import { generateChunkData, setPickupIcons } from './generation/chunk';
import { ChunkMesh, FloatingPickup } from './rendering/ChunkMesh';
import { WorldLighting, SkyGradient, FogEffect } from './rendering/WorldLighting';
import { SurfaceDetailLayer } from './rendering/SurfaceDetailLayer';
import { AmbientParticles } from './effects/AmbientParticles';
import { SkyBirds } from './effects/SkyBirds';
import { GroundCritters } from './effects/GroundCritters';
import { FlyCamera } from './camera/FlyCamera';
import { CameraLook } from './camera/CameraLook';
import { OverlayStats, ConfigSlider, MobileTouchControls } from './ui/Controls';

/* ═══════════════════════════════════════════════════════════════
 *  Initialize Pickup Icons
 * ═══════════════════════════════════════════════════════════════ */

function iconToPickupVoxels(icon: PxlKitData): { x: number; y: number; color: string }[] {
  const voxels: { x: number; y: number; color: string }[] = [];
  icon.layers.forEach(layer => {
    layer.pixels.forEach(pixel => {
      voxels.push({ x: pixel.x, y: icon.height - 1 - pixel.y, color: pixel.color });
    });
  });
  return voxels;
}

const pickupIconData = [
  Trophy, Star, Coin, Crown, Gem, Shield, Lightning, Key, Sword,
  Heart, Check, Package, SparkleSmall, Robot, Sun, Moon, Snowflake,
].map((icon) => ({ icon: icon as PxlKitData, voxels: iconToPickupVoxels(icon as PxlKitData) }));

setPickupIcons(pickupIconData);

/* ═══════════════════════════════════════════════════════════════
 *  Helpers
 * ═══════════════════════════════════════════════════════════════ */

function chunkKey(cx: number, cz: number): string { return `${cx},${cz}`; }
function worldToChunk(wx: number, wz: number): [number, number] {
  return [Math.floor(wx / (CHUNK_SIZE * VOXEL_SIZE) ), Math.floor(wz / (CHUNK_SIZE * VOXEL_SIZE))];
}

/* ═══════════════════════════════════════════════════════════════
 *  Camera Tracker (converts camera pos → biome name for HUD)
 * ═══════════════════════════════════════════════════════════════ */

function CameraTracker({ onUpdate, biomeNoise, tempNoise, cityFreq }: {
  onUpdate: (pos: [number, number, number], biome: string) => void;
  biomeNoise: ((x: number, y: number) => number) | null;
  tempNoise: ((x: number, y: number) => number) | null;
  cityFreq: number;
}) {
  const { camera } = useThree();
  const last = useRef(0);
  useFrame(({ clock }) => {
    if (clock.getElapsedTime() - last.current < 0.3) return;
    last.current = clock.getElapsedTime();
    const pos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z];
    let biome = 'Unknown';
    if (biomeNoise && tempNoise) {
      biome = BIOMES[getBiome(biomeNoise, tempNoise, camera.position.x / VOXEL_SIZE, camera.position.z / VOXEL_SIZE, cityFreq)].name;
    }
    onUpdate(pos, biome);
  });
  return null;
}

/* ═══════════════════════════════════════════════════════════════
 *  Chunk Manager — throttled, progressive, frustum-culled
 * ═══════════════════════════════════════════════════════════════ */

function ChunkManagerWithCounter({ seed, config, onChunkCount, chunkCacheRef }: {
  seed: number;
  config: WorldConfig;
  onChunkCount: (count: number) => void;
  chunkCacheRef: React.MutableRefObject<Map<string, ChunkVoxelData>>;
}) {
  const { camera } = useThree();
  const [visibleChunks, setVisibleChunks] = useState<Map<string, ChunkVoxelData>>(new Map());
  const lastCamChunk = useRef('');
  const lastCamDir = useRef(new THREE.Vector3());
  const frustum = useRef(new THREE.Frustum());
  const projMat = useRef(new THREE.Matrix4());
  const prevSeed = useRef(seed);
  const prevMode = useRef(config.worldMode);
  const prevSize = useRef(config.worldSize);
  const pendingKeys = useRef<string[]>([]);
  const finiteGenDone = useRef(false);
  const _dir = useMemo(() => new THREE.Vector3(), []);

  const noises = useMemo(() => ({
    height: createNoise2D(seed), detail: createNoise2D(seed + 1),
    biome: createNoise2D(seed + 2), temp: createNoise2D(seed + 3),
    tree: createNoise2D(seed + 4), struct: createNoise2D(seed + 5),
    region: createNoise2D(seed + 6),
  }), [seed]);

  const genChunk = useCallback((ck: string) => {
    if (chunkCacheRef.current.has(ck)) return;
    const [pcx, pcz] = ck.split(',').map(Number);
    const data = generateChunkData(pcx, pcz, noises.height, noises.detail, noises.biome, noises.temp, noises.tree, noises.struct, noises.region, config);
    chunkCacheRef.current.set(ck, data);
  }, [noises, config, chunkCacheRef]);

  useFrame(() => {
    const seedChanged = prevSeed.current !== seed;
    const modeChanged = prevMode.current !== config.worldMode;
    const sizeChanged = prevSize.current !== config.worldSize;
    if (seedChanged || modeChanged || sizeChanged) {
      prevSeed.current = seed;
      prevMode.current = config.worldMode;
      prevSize.current = config.worldSize;
      chunkCacheRef.current.clear();
      lastCamChunk.current = '';
      lastCamDir.current.set(0, 0, 0);
      pendingKeys.current = [];
      finiteGenDone.current = false;
    }

    const isFiniteMode = config.worldMode === 'finite';
    const rd = config.renderDistance;

    /* ═══════ FINITE MODE ═══════ */
    if (isFiniteMode) {
      if (!finiteGenDone.current) {
        const chunksPerSide = Math.ceil(config.worldSize / CHUNK_SIZE);
        const allKeys: string[] = [];
        for (let cx2 = 0; cx2 < chunksPerSide; cx2++) {
          for (let cz2 = 0; cz2 < chunksPerSide; cz2++) {
            allKeys.push(chunkKey(cx2, cz2));
          }
        }
        const centre = chunksPerSide / 2;
        allKeys.sort((a, b) => {
          const [ax, az] = a.split(',').map(Number);
          const [bx2, bz2] = b.split(',').map(Number);
          return ((ax - centre) ** 2 + (az - centre) ** 2) - ((bx2 - centre) ** 2 + (bz2 - centre) ** 2);
        });
        pendingKeys.current = allKeys;
        finiteGenDone.current = true;
      }

      const maxGen = config.chunkGenSpeed || DEFAULT_CHUNKS_PER_FRAME;
      let generated = 0;
      while (pendingKeys.current.length > 0 && generated < maxGen) {
        genChunk(pendingKeys.current.shift()!);
        generated++;
      }

      const all = new Map<string, ChunkVoxelData>(chunkCacheRef.current);
      if (all.size !== visibleChunks.size || generated > 0) {
        setVisibleChunks(all);
        onChunkCount(all.size);
      }
      return;
    }

    /* ═══════ INFINITE MODE ═══════ */
    const [ccx, ccz] = worldToChunk(camera.position.x, camera.position.z);
    const curKey = `${ccx},${ccz}`;

    camera.getWorldDirection(_dir);
    const dx10 = Math.round(_dir.x * DIR_PRECISION);
    const dz10 = Math.round(_dir.z * DIR_PRECISION);
    const dirChanged = dx10 !== Math.round(lastCamDir.current.x * DIR_PRECISION)
                    || dz10 !== Math.round(lastCamDir.current.z * DIR_PRECISION);

    const maxGen2 = config.chunkGenSpeed || DEFAULT_CHUNKS_PER_FRAME;
    let generated2 = 0;
    while (pendingKeys.current.length > 0 && generated2 < maxGen2) {
      genChunk(pendingKeys.current.shift()!);
      generated2++;
    }

    if (curKey === lastCamChunk.current && !dirChanged && generated2 === 0) return;
    lastCamChunk.current = curKey;
    lastCamDir.current.copy(_dir);

    projMat.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(projMat.current);

    const newVisible = new Map<string, ChunkVoxelData>();
    const cws = CHUNK_SIZE * VOXEL_SIZE;
    const newPending: string[] = [];

    const camDirX = _dir.x, camDirZ = _dir.z;
    const cands: { cx: number; cz: number; priority: number }[] = [];
    for (let ddx = -rd; ddx <= rd; ddx++) for (let ddz = -rd; ddz <= rd; ddz++) {
      const d2 = ddx * ddx + ddz * ddz;
      if (d2 > rd * rd) continue;
      const dot = ddx * camDirX + ddz * camDirZ;
      const priority = dot * VIEW_DIR_WEIGHT - d2 * DIST_PENALTY;
      cands.push({ cx: ccx + ddx, cz: ccz + ddz, priority });
    }
    cands.sort((a, b) => b.priority - a.priority);

    for (const { cx: chkCx, cz: chkCz } of cands) {
      const key = chunkKey(chkCx, chkCz);
      const minX2 = chkCx * cws, minZ2 = chkCz * cws;
      const bbox = new THREE.Box3(
        new THREE.Vector3(minX2, 0, minZ2),
        new THREE.Vector3(minX2 + cws, MAX_HEIGHT * VOXEL_SIZE, minZ2 + cws),
      );
      if (!frustum.current.intersectsBox(bbox)) continue;
      const data = chunkCacheRef.current.get(key);
      if (data) { newVisible.set(key, data); }
      else { newPending.push(key); }
    }

    pendingKeys.current = [...newPending, ...pendingKeys.current.filter(k => !newPending.includes(k))];

    const maxC = (rd * 2 + 2) ** 2;
    if (chunkCacheRef.current.size > maxC * 2) {
      const del: string[] = [];
      for (const [k] of chunkCacheRef.current) {
        const [kx, kz] = k.split(',').map(Number);
        if ((kx - ccx) ** 2 + (kz - ccz) ** 2 > (rd * 2) ** 2) del.push(k);
      }
      for (const k of del) chunkCacheRef.current.delete(k);
    }

    setVisibleChunks(newVisible);
    onChunkCount(newVisible.size);
  });

  const entries = useMemo(() => Array.from(visibleChunks.entries()), [visibleChunks]);
  const allPickups = useMemo(() => {
    const r: { wx: number; wy: number; wz: number; iconIdx: number; key: string }[] = [];
    for (const [key, data] of visibleChunks) for (const p of data.pickups) r.push({ ...p, key: `${key}-${p.iconIdx}` });
    return r;
  }, [visibleChunks]);

  return (
    <>
      {entries.map(([key, data]) => <ChunkMesh key={key} data={data} />)}
      {allPickups.map(p => <FloatingPickup key={p.key} position={[p.wx, p.wy, p.wz]} iconIdx={p.iconIdx} />)}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════ */

export default function ProceduralTerrain() {
  const [seed, setSeed] = useState(42);
  const [config, setConfig] = useState<WorldConfig>(DEFAULT_CONFIG);
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cameraPos, setCameraPos] = useState<[number, number, number]>([0, 12, 20]);
  const [currentBiome, setCurrentBiome] = useState('Plains');
  const [chunkCount, setChunkCount] = useState(0);
  const [seedInput, setSeedInput] = useState('42');
  const [isMobile, setIsMobile] = useState(false);

  const keysRef = useRef<Set<string>>(new Set());
  const speedRef = useRef(config.flySpeed);
  const canvasRef = useRef<HTMLDivElement>(null);
  const chunkCacheRef = useRef<Map<string, ChunkVoxelData>>(new Map());

  const noises = useMemo(() => ({
    biome: createNoise2D(seed + 2), temp: createNoise2D(seed + 3),
  }), [seed]);

  useEffect(() => { speedRef.current = config.flySpeed; }, [config.flySpeed]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    check(); window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
      keysRef.current.add(k);
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const requestPointerLock = useCallback(() => {
    if (isMobile) { setShowControls(false); setIsLocked(true); return; }
    canvasRef.current?.querySelector('canvas')?.requestPointerLock();
  }, [isMobile]);

  useEffect(() => {
    const h = () => { const l = !!document.pointerLockElement; setIsLocked(l); if (l) setShowControls(false); };
    document.addEventListener('pointerlockchange', h);
    return () => document.removeEventListener('pointerlockchange', h);
  }, []);

  const handleCameraUpdate = useCallback((pos: [number, number, number], biome: string) => { setCameraPos(pos); setCurrentBiome(biome); }, []);
  const generateNewSeed = useCallback(() => { const s = Math.floor(Math.random() * 999999); setSeed(s); setSeedInput(String(s)); }, []);
  const applySeed = useCallback(() => { const p = parseInt(seedInput, 10); if (!isNaN(p)) setSeed(Math.abs(p)); }, [seedInput]);
  const handleChunkCount = useCallback((c: number) => setChunkCount(c), []);
  const exitImmersive = useCallback(() => {
    if (isMobile) { setIsLocked(false); setShowControls(true); } else document.exitPointerLock();
  }, [isMobile]);
  const handleTouchKey = useCallback((key: string, active: boolean) => {
    if (active) keysRef.current.add(key); else keysRef.current.delete(key);
  }, []);
  const updateConfig = useCallback((key: keyof WorldConfig, val: number) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  }, []);

  const gfxDpr: [number, number] = config.graphicsQuality === 'low' ? [0.75, 1] : config.graphicsQuality === 'high' ? [1, 2] : [1, 1.5];
  const gfxAA = config.graphicsQuality === 'high';

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden bg-black select-none" style={{ touchAction: 'none', WebkitUserSelect: 'none' }}>
      {/* ── Controls Overlay ── */}
      {showControls && !isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 pointer-events-auto">
            <Link href="/" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-retro-bg/80 backdrop-blur-sm border border-retro-border/50 rounded font-pixel text-[8px] sm:text-[9px] text-retro-muted hover:text-retro-green hover:border-retro-green/40 transition-all select-none">← Back</Link>
          </div>
          <div className="text-center pointer-events-auto mb-4 sm:mb-6 select-none">
            <h1 className="font-pixel text-lg sm:text-2xl md:text-3xl lg:text-4xl text-retro-green text-glow mb-2 sm:mb-3 drop-shadow-lg select-none">PROCEDURAL WORLDS</h1>
            <p className="font-pixel text-[8px] sm:text-[10px] md:text-xs text-retro-purple/80 mb-1 drop-shadow select-none">@pxlkit/voxel — Coming Soon</p>
            <p className="text-retro-muted/70 text-[10px] sm:text-xs md:text-sm max-w-md mx-auto px-4 leading-relaxed select-none">
              {config.worldMode === 'infinite'
                ? 'Infinite procedural voxel worlds with cities, biomes, and ambient particles.'
                : `Floating ${config.worldSize}×${config.worldSize} island with tapered edges and full biome variety.`}
              <span className="text-retro-gold font-bold">{isMobile ? ' Tap to fly.' : ' Click to fly.'}</span>
            </p>
          </div>
          <div className="pointer-events-auto bg-retro-bg/80 backdrop-blur-md border border-retro-border/50 rounded-xl p-3 sm:p-4 md:p-5 max-w-sm w-[calc(100%-2rem)] space-y-3 shadow-xl overflow-y-auto max-h-[70vh] select-none">
            <div className="space-y-1.5">
              <label className="font-pixel text-[8px] sm:text-[9px] text-retro-green/80 uppercase tracking-wider select-none">World Seed</label>
              <div className="flex gap-2">
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={seedInput}
                  onChange={e => setSeedInput(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && applySeed()}
                  className="flex-1 bg-retro-surface/80 border border-retro-border/50 rounded px-2 sm:px-3 py-1.5 font-mono text-xs sm:text-sm text-retro-text focus:border-retro-green/60 focus:outline-none transition-colors select-text" placeholder="Enter seed..." />
                <button onClick={applySeed} className="px-2 sm:px-3 py-1.5 bg-retro-green/20 hover:bg-retro-green/30 border border-retro-green/50 rounded font-pixel text-[8px] sm:text-[9px] text-retro-green transition-all cursor-pointer select-none">GO</button>
              </div>
            </div>
            <button onClick={generateNewSeed} className="w-full py-2 bg-retro-purple/20 hover:bg-retro-purple/30 border border-retro-purple/50 rounded font-pixel text-[8px] sm:text-[9px] text-retro-purple transition-all cursor-pointer select-none">🎲 RANDOM WORLD</button>
            {/* World Mode Toggle */}
            <div className="space-y-1">
              <label className="font-pixel text-[8px] sm:text-[9px] text-retro-purple/80 uppercase tracking-wider select-none">World Mode</label>
              <div className="flex gap-2">
                <button onClick={() => setConfig(prev => ({ ...prev, worldMode: 'infinite' as WorldMode }))}
                  className={`flex-1 py-1.5 rounded font-pixel text-[8px] sm:text-[9px] transition-all cursor-pointer select-none border ${config.worldMode === 'infinite' ? 'bg-retro-purple/30 border-retro-purple/60 text-retro-purple' : 'bg-retro-surface/40 border-retro-border/30 text-retro-muted/60 hover:bg-retro-surface/60'}`}>
                  ∞ INFINITE
                </button>
                <button onClick={() => setConfig(prev => ({ ...prev, worldMode: 'finite' as WorldMode }))}
                  className={`flex-1 py-1.5 rounded font-pixel text-[8px] sm:text-[9px] transition-all cursor-pointer select-none border ${config.worldMode === 'finite' ? 'bg-retro-cyan/30 border-retro-cyan/60 text-retro-cyan' : 'bg-retro-surface/40 border-retro-border/30 text-retro-muted/60 hover:bg-retro-surface/60'}`}>
                  ◻ FINITE
                </button>
              </div>
              <p className="font-mono text-[7px] text-retro-muted/40 select-none">
                {config.worldMode === 'infinite' ? 'Endless terrain, chunks loaded on demand' : `Island of ${config.worldSize}×${config.worldSize} voxels`}
              </p>
            </div>
            {config.worldMode === 'finite' && (
              <ConfigSlider label="World Size" value={config.worldSize} onChange={v => updateConfig('worldSize', v)} min={32} max={512} step={16} color="text-retro-cyan/80" displayValue={`${config.worldSize}×${config.worldSize}`} />
            )}
            {config.worldMode === 'infinite' && (
              <ConfigSlider label="Render Distance" value={config.renderDistance} onChange={v => updateConfig('renderDistance', v)} min={2} max={20} step={1} color="text-retro-cyan/80" displayValue={`${config.renderDistance} chunks`} />
            )}
            <ConfigSlider label="Fly Speed" value={config.flySpeed} onChange={v => updateConfig('flySpeed', v)} min={4} max={40} step={1} color="text-retro-gold/80" displayValue={String(config.flySpeed)} />
            <button onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-1.5 bg-retro-surface/40 hover:bg-retro-surface/60 border border-retro-border/30 rounded font-pixel text-[7px] sm:text-[8px] text-retro-muted/70 transition-all cursor-pointer select-none">
              {showAdvanced ? '▾ HIDE ADVANCED' : '▸ SHOW ADVANCED'}
            </button>
            {showAdvanced && (
              <div className="space-y-2.5 pt-1 border-t border-retro-border/20">
                <p className="font-pixel text-[7px] text-retro-muted/40 uppercase tracking-widest select-none pt-1">Graphics &amp; Performance</p>
                <div className="space-y-1">
                  <label className="font-pixel text-[8px] sm:text-[9px] text-retro-cyan/80 uppercase tracking-wider select-none">Graphics Quality</label>
                  <div className="flex gap-1.5">
                    {(['low', 'medium', 'high'] as const).map(q => (
                      <button key={q} onClick={() => setConfig(prev => ({ ...prev, graphicsQuality: q }))}
                        className={`flex-1 py-1 rounded font-pixel text-[7px] sm:text-[8px] transition-all cursor-pointer select-none border ${config.graphicsQuality === q ? 'bg-retro-cyan/30 border-retro-cyan/60 text-retro-cyan' : 'bg-retro-surface/40 border-retro-border/30 text-retro-muted/50 hover:bg-retro-surface/60'}`}>
                        {q.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <p className="font-mono text-[7px] text-retro-muted/30 select-none">
                    {config.graphicsQuality === 'low' ? 'Lower DPR, no AA — best for mobile' : config.graphicsQuality === 'high' ? 'Higher DPR + antialiasing — GPU intensive' : 'Balanced DPR, no AA — recommended'}
                  </p>
                </div>
                <ConfigSlider label="Chunk Gen Speed" value={config.chunkGenSpeed} onChange={v => updateConfig('chunkGenSpeed', v)} min={1} max={6} step={1} color="text-retro-cyan/80" displayValue={`${config.chunkGenSpeed}/frame`} />
                <p className="font-pixel text-[7px] text-retro-muted/40 uppercase tracking-widest select-none pt-1.5">Visual Detail</p>
                <ConfigSlider label="Voxel Detail LOD" value={config.voxelDetail} onChange={v => updateConfig('voxelDetail', v)} min={0} max={4} step={1} color="text-retro-gold/80" displayValue={config.voxelDetail === 0 ? 'Off' : `${config.voxelDetail}× subdivisions`} />
                <p className="font-mono text-[7px] text-retro-muted/30 select-none -mt-0.5">
                  {config.voxelDetail === 0 ? 'No surface detail — best performance' : config.voxelDetail <= 2 ? 'Mini-voxels on nearby surfaces for texture' : 'High detail — more GPU intensive'}
                </p>
                <p className="font-pixel text-[7px] text-retro-muted/40 uppercase tracking-widest select-none pt-1.5">Terrain &amp; Biomes</p>
                <ConfigSlider label="Tree Density" value={config.treeDensity} onChange={v => updateConfig('treeDensity', v)} min={0} max={1} step={0.1} color="text-retro-green/80" displayValue={`${Math.round(config.treeDensity * 100)}%`} />
                <ConfigSlider label="Structure Density" value={config.structureDensity} onChange={v => updateConfig('structureDensity', v)} min={0} max={1} step={0.1} color="text-retro-gold/80" displayValue={`${Math.round(config.structureDensity * 100)}%`} />
                <ConfigSlider label="City Frequency" value={config.cityFrequency} onChange={v => updateConfig('cityFrequency', v)} min={0} max={1} step={0.1} color="text-retro-purple/80" displayValue={`${Math.round(config.cityFrequency * 100)}%`} />
                <ConfigSlider label="Biome Variation" value={config.biomeVariation} onChange={v => updateConfig('biomeVariation', v)} min={0} max={1} step={0.1} color="text-retro-green/80" displayValue={`${Math.round(config.biomeVariation * 100)}%`} />
                <ConfigSlider label="Terrain Roughness" value={config.terrainRoughness} onChange={v => updateConfig('terrainRoughness', v)} min={0} max={1} step={0.1} color="text-retro-gold/80" displayValue={`${Math.round(config.terrainRoughness * 100)}%`} />
                <p className="font-pixel text-[7px] text-retro-muted/40 uppercase tracking-widest select-none pt-1.5">Items &amp; Effects</p>
                <ConfigSlider label="Pickup Density" value={config.pickupDensity} onChange={v => updateConfig('pickupDensity', v)} min={0} max={1} step={0.1} color="text-retro-cyan/80" displayValue={`${Math.round(config.pickupDensity * 100)}%`} />
                <ConfigSlider label="Particle Intensity" value={config.particleIntensity} onChange={v => updateConfig('particleIntensity', v)} min={0} max={1} step={0.1} color="text-retro-purple/80" displayValue={`${Math.round(config.particleIntensity * 100)}%`} />
                <p className="font-pixel text-[7px] text-retro-muted/40 uppercase tracking-widest select-none pt-1.5">Atmosphere</p>
                <ConfigSlider label="Fog Density" value={config.fogDensity} onChange={v => updateConfig('fogDensity', v)} min={0} max={1} step={0.1} color="text-retro-muted/80" displayValue={`${Math.round(config.fogDensity * 100)}%`} />
                <ConfigSlider label="Background Mountains" value={config.backgroundDetail} onChange={v => updateConfig('backgroundDetail', v)} min={0} max={1} step={0.1} color="text-retro-muted/80" displayValue={`${Math.round(config.backgroundDetail * 100)}%`} />
              </div>
            )}
            <button onClick={requestPointerLock}
              className="w-full py-2.5 sm:py-3 bg-retro-green/20 hover:bg-retro-green/30 border-2 border-retro-green/60 rounded-lg font-pixel text-[9px] sm:text-[10px] md:text-xs text-retro-green transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(74,222,128,0.2)] select-none">
              ▶ {isMobile ? 'TAP TO EXPLORE' : 'CLICK TO EXPLORE'}
            </button>
            <div className="text-center space-y-0.5 select-none">
              {isMobile ? (
                <p className="font-mono text-[8px] sm:text-[9px] text-retro-muted/50">Drag canvas to look · D-pad to move · Tap ✕ to exit</p>
              ) : (
                <>
                  <p className="font-mono text-[8px] sm:text-[9px] text-retro-muted/50">WASD / Arrows = Move · Space = Up · Shift = Down</p>
                  <p className="font-mono text-[8px] sm:text-[9px] text-retro-muted/50">Mouse = Look · ESC = Release cursor</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Locked HUD ── */}
      {isLocked && (
        <>
          {!isMobile && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none">
              <div className="w-4 h-4 sm:w-5 sm:h-5 relative opacity-40">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
              </div>
            </div>
          )}
          <OverlayStats seed={seed} chunkCount={chunkCount} position={cameraPos} biome={currentBiome} worldMode={config.worldMode} worldSize={config.worldSize} />
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 select-none" style={{ touchAction: 'none' }}>
            {isMobile ? (
              <button onClick={exitImmersive} className="p-2 bg-retro-bg/70 backdrop-blur-sm border border-retro-border/30 rounded font-pixel text-[9px] text-retro-muted/60 hover:text-retro-red transition-all cursor-pointer select-none" style={{ touchAction: 'none' }}>✕</button>
            ) : (
              <span className="font-pixel text-[7px] sm:text-[8px] text-retro-muted/40 bg-retro-bg/40 px-2 py-1 rounded border border-retro-border/20 pointer-events-none select-none">ESC to release</span>
            )}
          </div>
          {isMobile && <MobileTouchControls onKey={handleTouchKey} />}
        </>
      )}

      {!isLocked && !showControls && (
        <button onClick={() => setShowControls(true)} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 bg-retro-bg/80 border border-retro-border/50 rounded font-pixel text-[9px] text-retro-muted hover:text-retro-green transition-all cursor-pointer select-none">⚙ Settings</button>
      )}

      {/* ── Three.js Canvas ── */}
      <div ref={canvasRef} className="w-full h-full" style={{ touchAction: 'none' }}>
        <Canvas
          camera={{ fov: 65, near: 0.1, far: 600 }}
          dpr={gfxDpr}
          gl={{ antialias: gfxAA, toneMapping: THREE.NoToneMapping, powerPreference: 'high-performance' }}
          style={{ background: 'transparent', touchAction: 'none' }}
        >
          <SkyGradient backgroundDetail={config.backgroundDetail} />
          <FogEffect density={config.fogDensity} />
          <WorldLighting />
          <FlyCamera keysRef={keysRef} speedRef={speedRef} chunkCacheRef={chunkCacheRef} worldConfig={config} />
          <CameraLook isLocked={isLocked} isMobile={isMobile} />
          <ChunkManagerWithCounter seed={seed} config={config} onChunkCount={handleChunkCount} chunkCacheRef={chunkCacheRef} />
          <CameraTracker onUpdate={handleCameraUpdate} biomeNoise={noises.biome} tempNoise={noises.temp} cityFreq={config.cityFrequency} />
          <AmbientParticles biome={currentBiome} intensity={config.particleIntensity} />
          <SkyBirds biome={currentBiome} intensity={config.particleIntensity} />
          <GroundCritters biome={currentBiome} intensity={config.particleIntensity} />
          {config.voxelDetail > 0 && (
            <SurfaceDetailLayer chunkCacheRef={chunkCacheRef} detail={config.voxelDetail} />
          )}
        </Canvas>
      </div>
    </div>
  );
}
