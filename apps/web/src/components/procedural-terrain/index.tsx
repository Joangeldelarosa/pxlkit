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

import { useRef, useMemo, useEffect, useState, useCallback, useContext } from 'react';
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
import type { WorldConfig, ChunkVoxelData } from './types';
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
import { FogEffect } from './rendering/WorldLighting';
import { DayNightLighting, DayNightSky, TimeContext } from './rendering/DayNightCycle';
import type { TimeState } from './rendering/DayNightCycle';
import { NightWindowLights } from './rendering/NightWindowLights';
import { SurfaceDetailLayer } from './rendering/SurfaceDetailLayer';
import { AmbientParticles } from './effects/AmbientParticles';
import { SkyBirds } from './effects/SkyBirds';
import { GroundCritters } from './effects/GroundCritters';
import { WaterBoats } from './effects/WaterBoats';
import { FlyCamera } from './camera/FlyCamera';
import { CameraLook } from './camera/CameraLook';
import { OverlayStats, MobileTouchControls } from './ui/Controls';
import { SettingsPanel } from './ui/SettingsPanel';

/* ═══════════════════════════════════════════════════════════════
 *  Initialize Pickup Icons
 * ═══════════════════════════════════════════════════════════════ */

function iconToPickupVoxels(icon: PxlKitData): { x: number; y: number; color: string }[] {
  const voxels: { x: number; y: number; color: string }[] = [];
  const { grid, palette, size } = icon;
  for (let row = 0; row < size; row++) {
    const r = grid[row]; if (!r) continue;
    for (let col = 0; col < size; col++) {
      const ch = r[col]; if (!ch || ch === '.') continue;
      const color = palette[ch]; if (!color) continue;
      voxels.push({ x: col, y: size - 1 - row, color });
    }
  }
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

/* ── LocalStorage keys ── */
const LS_CONFIG_KEY = 'pxlkit-explore-config';
const LS_SAVE_KEY = 'pxlkit-explore-save';

/** Load WorldConfig from localStorage (returns null if not found or invalid) */
function loadConfigFromStorage(): WorldConfig | null {
  try {
    const raw = localStorage.getItem(LS_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Validate that it has expected shape by checking a few required keys
    if (typeof parsed === 'object' && 'renderDistance' in parsed && 'flySpeed' in parsed) {
      // Merge with defaults to ensure new fields are present
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch { /* ignore corrupt data */ }
  return null;
}

/** Save WorldConfig to localStorage */
function saveConfigToStorage(config: WorldConfig) {
  try { localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(config)); } catch { /* quota */ }
}

/** Saved world state */
interface WorldSave {
  seed: number;
  pos: [number, number, number];
  rot: [number, number, number];  // Euler angles (YXZ)
}

/** Save world state to localStorage */
function saveWorldToStorage(save: WorldSave) {
  try { localStorage.setItem(LS_SAVE_KEY, JSON.stringify(save)); } catch { /* quota */ }
}

/** Load world save from localStorage */
function loadWorldFromStorage(): WorldSave | null {
  try {
    const raw = localStorage.getItem(LS_SAVE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && typeof p.seed === 'number' && Array.isArray(p.pos)) return p as WorldSave;
  } catch { /* ignore */ }
  return null;
}

/** Encode a scene link into URL query params: ?seed=42&px=1&py=12&pz=20&rx=0&ry=0&rz=0 */
function encodeSceneToURL(seed: number, pos: [number, number, number], rot: [number, number, number]): string {
  const params = new URLSearchParams();
  params.set('seed', String(seed));
  params.set('px', pos[0].toFixed(1));
  params.set('py', pos[1].toFixed(1));
  params.set('pz', pos[2].toFixed(1));
  params.set('rx', rot[0].toFixed(4));
  params.set('ry', rot[1].toFixed(4));
  params.set('rz', rot[2].toFixed(4));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

/** Decode scene from URL search params */
function decodeSceneFromURL(): { seed: number; pos: [number, number, number]; rot: [number, number, number] } | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const seedStr = params.get('seed');
    const px = params.get('px'), py = params.get('py'), pz = params.get('pz');
    const rx = params.get('rx'), ry = params.get('ry'), rz = params.get('rz');
    if (!seedStr || !px || !py || !pz) return null;
    return {
      seed: parseInt(seedStr, 10),
      pos: [parseFloat(px), parseFloat(py), parseFloat(pz)],
      rot: rx && ry && rz ? [parseFloat(rx), parseFloat(ry), parseFloat(rz)] : [0, 0, 0],
    };
  } catch { return null; }
}

/* ═══════════════════════════════════════════════════════════════
 *  Camera Tracker (converts camera pos → biome name for HUD)
 * ═══════════════════════════════════════════════════════════════ */

function CameraTracker({ onUpdate, biomeNoise, tempNoise, cityFreq }: {
  onUpdate: (pos: [number, number, number], biome: string, hour: number, rot: [number, number, number]) => void;
  biomeNoise: ((x: number, y: number) => number) | null;
  tempNoise: ((x: number, y: number) => number) | null;
  cityFreq: number;
}) {
  const { camera } = useThree();
  const timeRef = useContext(TimeContext);
  const last = useRef(0);
  const _euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  useFrame(({ clock }) => {
    if (clock.getElapsedTime() - last.current < 0.3) return;
    last.current = clock.getElapsedTime();
    const pos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z];
    let biome = 'Unknown';
    if (biomeNoise && tempNoise) {
      biome = BIOMES[getBiome(biomeNoise, tempNoise, camera.position.x / VOXEL_SIZE, camera.position.z / VOXEL_SIZE, cityFreq)].name;
    }
    const hour = timeRef ? timeRef.current.hour : 12;
    _euler.setFromQuaternion(camera.quaternion);
    const rot: [number, number, number] = [_euler.x, _euler.y, _euler.z];
    onUpdate(pos, biome, hour, rot);
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
          const [bChunkX, bChunkZ] = b.split(',').map(Number);
          return ((ax - centre) ** 2 + (az - centre) ** 2) - ((bChunkX - centre) ** 2 + (bChunkZ - centre) ** 2);
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
  /* ── Restore from URL query params first, then localStorage, then defaults ── */
  const urlScene = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return decodeSceneFromURL();
  }, []);
  const savedWorld = useMemo(() => {
    if (urlScene) return null; // URL takes precedence
    if (typeof window === 'undefined') return null;
    return loadWorldFromStorage();
  }, [urlScene]);
  const savedConfig = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return loadConfigFromStorage();
  }, []);

  const initSeed = urlScene?.seed ?? savedWorld?.seed ?? 42;
  const initPos = urlScene?.pos ?? savedWorld?.pos ?? undefined;
  const initRot = urlScene?.rot ?? savedWorld?.rot ?? undefined;

  const [seed, setSeed] = useState(initSeed);
  const [config, setConfig] = useState<WorldConfig>(savedConfig ?? DEFAULT_CONFIG);
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [cameraPos, setCameraPos] = useState<[number, number, number]>(initPos ?? [0, 12, 20]);
  const [currentBiome, setCurrentBiome] = useState('Plains');
  const [chunkCount, setChunkCount] = useState(0);
  const [seedInput, setSeedInput] = useState(String(initSeed));
  const [isMobile, setIsMobile] = useState(false);
  const [displayHour, setDisplayHour] = useState(config.timeMode === 'fixed' ? config.fixedHour : 12);

  /* ── Camera rotation ref (updated from CameraTracker, used for save/share) ── */
  const cameraRotRef = useRef<[number, number, number]>(initRot ?? [0, 0, 0]);
  /* ── Initial position/rotation for FlyCamera (only used on mount) ── */
  const [initialPos] = useState(initPos);
  const [initialRot] = useState(initRot);

  /* ── Persist config to localStorage on every change ── */
  useEffect(() => { saveConfigToStorage(config); }, [config]);

  const keysRef = useRef<Set<string>>(new Set());
  const speedRef = useRef(config.flySpeed);
  const canvasRef = useRef<HTMLDivElement>(null);
  const chunkCacheRef = useRef<Map<string, ChunkVoxelData>>(new Map());
  const timeStateRef = useRef<TimeState>({
    hour: config.timeMode === 'fixed' ? config.fixedHour : 12,
    sunIntensity: 1.4,
    moonIntensity: 0,
    isNight: false,
    sunColor: new THREE.Color('#ffffff'),
    ambientColor: new THREE.Color('#ffffff'),
    skyTopColor: new THREE.Color(0.20, 0.35, 0.65),
    skyHorizonColor: new THREE.Color(0.75, 0.68, 0.58),
    fogColor: new THREE.Color('#b0c8e0'),
  });

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

  const handleCameraUpdate = useCallback((pos: [number, number, number], biome: string, hour: number, rot: [number, number, number]) => {
    setCameraPos(pos); setCurrentBiome(biome); setDisplayHour(hour); cameraRotRef.current = rot;
  }, []);
  const generateNewSeed = useCallback(() => { const s = Math.floor(Math.random() * 999999); setSeed(s); setSeedInput(String(s)); }, []);
  const applySeed = useCallback(() => { const p = parseInt(seedInput, 10); if (!isNaN(p)) setSeed(Math.abs(p)); }, [seedInput]);
  const handleChunkCount = useCallback((c: number) => setChunkCount(c), []);
  const exitImmersive = useCallback(() => {
    if (isMobile) { setIsLocked(false); setShowControls(true); } else document.exitPointerLock();
  }, [isMobile]);
  const handleTouchKey = useCallback((key: string, active: boolean) => {
    if (active) keysRef.current.add(key); else keysRef.current.delete(key);
  }, []);
  const updateConfig = useCallback((key: keyof WorldConfig, val: number | string) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  }, []);

  /* ── Save world (seed + camera) to localStorage ── */
  const handleSaveWorld = useCallback(() => {
    saveWorldToStorage({ seed, pos: cameraPos, rot: cameraRotRef.current });
  }, [seed, cameraPos]);

  /* ── Share scene — copy URL with seed + camera encoded as query params ── */
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const handleShareScene = useCallback(() => {
    const url = encodeSceneToURL(seed, cameraPos, cameraRotRef.current);
    navigator.clipboard.writeText(url).then(() => {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }).catch(() => {
      // Fallback: prompt user
      window.prompt('Copy this link:', url);
    });
  }, [seed, cameraPos]);

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
                ? 'Infinite procedural voxel worlds with cities, villages, swamps, and dynamic day/night.'
                : `Floating ${config.worldSize}×${config.worldSize} island with tapered edges and full biome variety.`}
              <span className="text-retro-gold font-bold">{isMobile ? ' Tap to fly.' : ' Click to fly.'}</span>
            </p>
          </div>
          <SettingsPanel
            config={config}
            onUpdateConfig={updateConfig}
            onSetConfig={setConfig}
            seed={seedInput}
            onSeedChange={setSeedInput}
            onApplySeed={applySeed}
            onRandomSeed={generateNewSeed}
            onStartExplore={requestPointerLock}
            isMobile={isMobile}
            onSaveWorld={handleSaveWorld}
            onShareScene={handleShareScene}
            shareStatus={shareStatus}
          />
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
          <OverlayStats seed={seed} chunkCount={chunkCount} position={cameraPos} biome={currentBiome} worldMode={config.worldMode} worldSize={config.worldSize} hour={displayHour} />
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
          <TimeContext.Provider value={timeStateRef}>
          <DayNightSky backgroundDetail={config.backgroundDetail} starDensity={config.starDensity} />
          <FogEffect density={config.fogDensity} />
          <DayNightLighting timeMode={config.timeMode} fixedHour={config.fixedHour} dayDurationSeconds={config.dayDurationSeconds} />
          <FlyCamera keysRef={keysRef} speedRef={speedRef} chunkCacheRef={chunkCacheRef} worldConfig={config} initialPos={initialPos} initialRot={initialRot} />
          <CameraLook isLocked={isLocked} isMobile={isMobile} />
          <ChunkManagerWithCounter seed={seed} config={config} onChunkCount={handleChunkCount} chunkCacheRef={chunkCacheRef} />
          <CameraTracker onUpdate={handleCameraUpdate} biomeNoise={noises.biome} tempNoise={noises.temp} cityFreq={config.cityFrequency} />
          <AmbientParticles biome={currentBiome} intensity={config.particleIntensity} />
          <SkyBirds biome={currentBiome} intensity={config.particleIntensity} />
          <GroundCritters biome={currentBiome} intensity={config.particleIntensity} chunkCacheRef={chunkCacheRef} />
          <NightWindowLights chunkCacheRef={chunkCacheRef} windowLitProbability={config.windowLitProbability} />
          <WaterBoats chunkCacheRef={chunkCacheRef} boatDensity={config.boatDensity} />
          {config.voxelDetail > 0 && (
            <SurfaceDetailLayer
              chunkCacheRef={chunkCacheRef}
              detail={config.voxelDetail}
              detailDistance={config.detailDistance}
              detailSharpness={config.detailSharpness}
              detailMaxInstances={config.detailMaxInstances}
            />
          )}
          </TimeContext.Provider>
        </Canvas>
      </div>
    </div>
  );
}
