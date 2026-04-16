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
 *  │   └── WorldLighting.tsx — lights, sky dome, fog
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
import { QuestMap as QuestMapIcon } from '@pxlkit/gamification';
import { PxlKitIcon, type PxlKitData } from '@pxlkit/core';
/* ── PxlKit UI Kit ── */
import { PixelButton, PixelFadeIn, PixelSlideIn, PixelBadge } from '@pxlkit/ui-kit';

/* ── Internal modules ── */
import type { WorldConfig, ChunkVoxelData } from './types';
import { DEFAULT_CONFIG } from './types';
import {
  CHUNK_SIZE, VOXEL_SIZE, MAX_HEIGHT,
  BIOMES, DEFAULT_CHUNKS_PER_FRAME,
  DIR_PRECISION, VIEW_DIR_WEIGHT, DIST_PENALTY,
} from './constants';
import { createNoise2D } from './utils/noise';
import { getBiome, getContinent } from './utils/biomes';
import { CONTINENT_PROFILES } from './constants';
import { generateChunkData, setPickupIcons } from './generation/chunk';
import { ChunkMesh, FloatingPickup } from './rendering/ChunkMesh';
import { FogEffect } from './rendering/WorldLighting';
import { DayNightLighting, DayNightSky, TimeContext } from './rendering/DayNightCycle';
import type { TimeState } from './rendering/DayNightCycle';
import { NightWindowLights } from './rendering/NightWindowLights';
import { AmbientParticles } from './effects/AmbientParticles';
import { SkyBirds } from './effects/SkyBirds';
import { GroundCritters } from './effects/GroundCritters';
import { WaterBoats } from './effects/WaterBoats';
import { FlyCamera } from './camera/FlyCamera';
import { CameraLook } from './camera/CameraLook';
import { MobileTouchControls } from './ui/Controls';
import { SettingsPanel } from './ui/SettingsPanel';
import { GameHUD } from './ui/GameHUD';
import { FullscreenMap } from './ui/FullscreenMap';

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

function CameraTracker({ onUpdate, biomeNoise, tempNoise, cityFreq, continentNoise }: {
  onUpdate: (pos: [number, number, number], biome: string, hour: number, rot: [number, number, number]) => void;
  biomeNoise: ((x: number, y: number) => number) | null;
  tempNoise: ((x: number, y: number) => number) | null;
  cityFreq: number;
  continentNoise: ((x: number, y: number) => number) | null;
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
      const wx = camera.position.x / VOXEL_SIZE;
      const wz = camera.position.z / VOXEL_SIZE;
      const biomeType = getBiome(biomeNoise, tempNoise, wx, wz, cityFreq, continentNoise ?? undefined);
      const biomeName = BIOMES[biomeType].name;
      if (continentNoise) {
        const contType = getContinent(continentNoise, wx, wz);
        const contProfile = CONTINENT_PROFILES[contType];
        biome = `${contProfile.name} · ${biomeName}`;
      } else {
        biome = biomeName;
      }
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
    region: createNoise2D(seed + 6), continent: createNoise2D(seed + 7),
  }), [seed]);

  const genChunk = useCallback((ck: string) => {
    if (chunkCacheRef.current.has(ck)) return;
    const [pcx, pcz] = ck.split(',').map(Number);
    const data = generateChunkData(pcx, pcz, noises.height, noises.detail, noises.biome, noises.temp, noises.tree, noises.struct, noises.region, config, noises.continent);
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

    /* ── Cache eviction — keep chunks in RAM 3× longer than render
     * distance so revisiting nearby areas doesn't regenerate. ──
     * Only evict when cache exceeds 3× the visible area. Evicted
     * chunks are those beyond 3× the render distance. */
    const maxC = (rd * 2 + 2) ** 2;
    if (chunkCacheRef.current.size > maxC * 3) {
      const evictR2 = (rd * 3) ** 2;
      const del: string[] = [];
      for (const [k] of chunkCacheRef.current) {
        const [kx, kz] = k.split(',').map(Number);
        if ((kx - ccx) ** 2 + (kz - ccz) ** 2 > evictR2) del.push(k);
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
      {entries.map(([key, data]) => <ChunkMesh key={key} data={data} renderDistance={config.renderDistance} chunkFadeStart={config.chunkFadeStart} chunkFadeStrength={config.chunkFadeStrength} chunkFadeSpeed={config.chunkFadeSpeed} />)}
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
  const [showSettings, setShowSettings] = useState(false);
  const [showFullscreenMap, setShowFullscreenMap] = useState(false);
  const [screenshotFlash, setScreenshotFlash] = useState(false);
  const [cameraPos, setCameraPos] = useState<[number, number, number]>(initPos ?? [0, 12, 20]);
  const [cameraYaw, setCameraYaw] = useState(0);
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
    continent: createNoise2D(seed + 7),
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
    setShowFullscreenMap(false);
    if (isMobile) { setShowControls(false); setIsLocked(true); return; }
    canvasRef.current?.querySelector('canvas')?.requestPointerLock();
  }, [isMobile]);

  const toggleFullscreenMap = useCallback(() => {
    setShowFullscreenMap((prev) => {
      const next = !prev;
      if (next && !isMobile && isLocked) {
        document.exitPointerLock();
      }
      return next;
    });
  }, [isMobile, isLocked]);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (isMobile || isLocked || showControls || showSettings || showFullscreenMap) return;
    if (!(e.target instanceof HTMLCanvasElement)) return;
    requestPointerLock();
  }, [isMobile, isLocked, showControls, showSettings, showFullscreenMap, requestPointerLock]);

  useEffect(() => {
    const h = () => { const l = !!document.pointerLockElement; setIsLocked(l); if (l) setShowControls(false); };
    document.addEventListener('pointerlockchange', h);
    return () => document.removeEventListener('pointerlockchange', h);
  }, []);

  const handleCameraUpdate = useCallback((pos: [number, number, number], biome: string, hour: number, rot: [number, number, number]) => {
    setCameraPos(pos); setCurrentBiome(biome); setDisplayHour(hour); cameraRotRef.current = rot; setCameraYaw(rot[1]);
  }, []);
  const generateNewSeed = useCallback(() => { const s = Math.floor(Math.random() * 999999); setSeed(s); setSeedInput(String(s)); }, []);
  const applySeed = useCallback(() => { const p = parseInt(seedInput, 10); if (!isNaN(p)) setSeed(Math.abs(p)); }, [seedInput]);
  const handleChunkCount = useCallback((c: number) => setChunkCount(c), []);
  const exitImmersive = useCallback(() => {
    if (isMobile) {
      setShowFullscreenMap(false);
      setIsLocked(false);
      setShowControls(true);
    } else document.exitPointerLock();
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

  /* ── Screenshot — capture canvas as PNG and download ── */
  const handleScreenshot = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    // Flash effect
    setScreenshotFlash(true);
    setTimeout(() => setScreenshotFlash(false), 200);
    // Capture
    try {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `pxlkit-world-${seed}-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    } catch {
      // WebGL may require preserveDrawingBuffer
    }
  }, [seed]);

  const gfxDpr: [number, number] =
    config.graphicsQuality === 'potato' ? [0.5, 0.75] :
    config.graphicsQuality === 'low'    ? [0.75, 1] :
    config.graphicsQuality === 'ultra'  ? [1, 2] :
    config.graphicsQuality === 'high'   ? [1, 2] :
    /* medium / custom */                 [1, 1.5];
  const gfxAA = config.graphicsQuality === 'high' || config.graphicsQuality === 'ultra';

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden bg-black select-none" style={{ touchAction: 'none', WebkitUserSelect: 'none' }}>

      {/* ── Screenshot Flash ── */}
      {screenshotFlash && (
        <div className="absolute inset-0 z-50 bg-white/80 pointer-events-none animate-[fadeOut_200ms_ease-out_forwards]" />
      )}

      {/* ── Welcome Screen (game-start style) ── */}
      {showControls && !isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none">
          {/* Back button */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 pointer-events-auto">
            <PixelFadeIn duration={300}>
              <Link href="/" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-retro-bg/80 backdrop-blur-sm border border-retro-border/50 rounded font-pixel text-[8px] sm:text-[9px] text-retro-muted hover:text-retro-green hover:border-retro-green/40 transition-all select-none">← Back</Link>
            </PixelFadeIn>
          </div>

          {/* Top-right action buttons */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 pointer-events-auto flex items-center gap-2">
            <PixelFadeIn duration={300} delay={100}>
              <div className="flex items-center gap-2">
                <button onClick={handleScreenshot}
                  className="p-2 bg-retro-bg/80 backdrop-blur-sm border border-retro-border/50 rounded text-[11px] text-retro-muted hover:text-retro-cyan hover:border-retro-cyan/40 transition-all cursor-pointer select-none"
                  title="Screenshot">
                  📸
                </button>
                <button onClick={() => setShowSettings(true)}
                  className="p-2 bg-retro-bg/80 backdrop-blur-sm border border-retro-border/50 rounded text-[11px] text-retro-muted hover:text-retro-green hover:border-retro-green/40 transition-all cursor-pointer select-none"
                  title="Settings">
                  ⚙
                </button>
              </div>
            </PixelFadeIn>
          </div>

          {/* Center: Title + Seed + Explore */}
          <div className="text-center pointer-events-auto select-none max-w-md w-[calc(100%-2rem)] px-4">
            <PixelFadeIn duration={500}>
              <h1 className="font-pixel text-xl sm:text-3xl md:text-4xl lg:text-5xl text-retro-green text-glow mb-1 sm:mb-2 drop-shadow-lg select-none tracking-wide">
                PROCEDURAL WORLDS
              </h1>
            </PixelFadeIn>
            <PixelFadeIn duration={400} delay={200}>
              <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                <PixelBadge tone="purple">
                  <span className="text-[8px] sm:text-[9px]">@pxlkit/voxel</span>
                </PixelBadge>
                <PixelBadge tone="green">
                  <span className="text-[8px] sm:text-[9px]">MIT Licensed</span>
                </PixelBadge>
              </div>
            </PixelFadeIn>
            <PixelFadeIn duration={400} delay={300}>
              <p className="text-retro-muted/60 text-[10px] sm:text-xs max-w-sm mx-auto leading-relaxed select-none mb-5 sm:mb-6">
                Infinite procedural voxel worlds with 9 biomes, cities, highways, day/night cycles, and shareable scenes.
                <span className="text-retro-gold font-bold">{isMobile ? ' Tap to fly.' : ' Click to explore.'}</span>
              </p>
            </PixelFadeIn>

            {/* Seed input card */}
            <PixelSlideIn from="down" duration={400} delay={400}>
              <div className="bg-retro-bg/70 backdrop-blur-md border border-retro-border/40 rounded-xl p-4 sm:p-5 space-y-3 shadow-2xl">
                {/* Seed row */}
                <div className="space-y-1.5">
                  <label className="font-pixel text-[8px] sm:text-[9px] text-retro-green/80 uppercase tracking-wider select-none">World Seed</label>
                  <div className="flex gap-2 items-center">
                    <input type="text" inputMode="numeric" pattern="[0-9]*" value={seedInput}
                      onChange={e => setSeedInput(e.target.value.replace(/[^0-9]/g, ''))}
                      onKeyDown={e => e.key === 'Enter' && applySeed()}
                      className="flex-1 bg-retro-surface/80 border border-retro-border/50 rounded-lg px-3 py-2.5 font-mono text-sm sm:text-base text-retro-text focus:border-retro-green/60 focus:outline-none transition-colors select-text text-center tracking-widest" placeholder="Enter seed..." />
                    <PixelButton tone="green" size="sm" onClick={applySeed}>GO</PixelButton>
                  </div>
                </div>

                {/* Random world */}
                <PixelButton tone="purple" variant="ghost" onClick={generateNewSeed} className="w-full">
                  🎲 RANDOM WORLD
                </PixelButton>

                {/* Explore button */}
                <button onClick={requestPointerLock}
                  className="w-full py-3 sm:py-3.5 bg-retro-green/20 hover:bg-retro-green/30 border-2 border-retro-green/60 rounded-lg font-pixel text-[10px] sm:text-xs md:text-sm text-retro-green transition-all cursor-pointer hover:shadow-[0_0_24px_rgba(74,222,128,0.25)] select-none group">
                  <span className="group-hover:tracking-widest transition-all">▶ {isMobile ? 'TAP TO EXPLORE' : 'CLICK TO EXPLORE'}</span>
                </button>

                {/* Version info */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="font-mono text-[7px] text-retro-muted/30">v0.1.0-alpha</span>
                  <span className="text-retro-muted/15">·</span>
                  <span className="font-mono text-[7px] text-retro-muted/30">Seed-based · Shareable</span>
                </div>
              </div>
            </PixelSlideIn>

            {/* Controls hint */}
            <PixelFadeIn duration={300} delay={600}>
              <div className="mt-3 sm:mt-4 space-y-0.5 select-none">
                {isMobile ? (
                  <p className="font-mono text-[8px] sm:text-[9px] text-retro-muted/35">Drag to look · D-pad to move · Tap ✕ to exit</p>
                ) : (
                  <div className="flex items-center justify-center gap-3 font-mono text-[8px] text-retro-muted/30">
                    <span><span className="text-retro-muted/50 bg-retro-bg/30 px-1 py-0.5 rounded text-[7px] border border-retro-border/15">WASD</span> Move</span>
                    <span><span className="text-retro-muted/50 bg-retro-bg/30 px-1 py-0.5 rounded text-[7px] border border-retro-border/15">Space</span> Up</span>
                    <span><span className="text-retro-muted/50 bg-retro-bg/30 px-1 py-0.5 rounded text-[7px] border border-retro-border/15">Shift</span> Down</span>
                    <span><span className="text-retro-muted/50 bg-retro-bg/30 px-1 py-0.5 rounded text-[7px] border border-retro-border/15">ESC</span> Release</span>
                  </div>
                )}
              </div>
            </PixelFadeIn>
          </div>
        </div>
      )}

      {/* ── Settings Panel (slides from right) ── */}
      <SettingsPanel
        config={config}
        onUpdateConfig={updateConfig}
        onSetConfig={setConfig}
        seed={seedInput}
        onSeedChange={setSeedInput}
        onApplySeed={applySeed}
        onRandomSeed={generateNewSeed}
        isMobile={isMobile}
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onSaveWorld={handleSaveWorld}
        onShareScene={handleShareScene}
        shareStatus={shareStatus}
      />

      <FullscreenMap
        open={showFullscreenMap}
        onClose={() => setShowFullscreenMap(false)}
        cameraPos={cameraPos}
        cameraYaw={cameraYaw}
        chunkCacheRef={chunkCacheRef}
        worldMode={config.worldMode}
        worldSize={config.worldSize}
      />

      {/* ── Locked: Full Game HUD ── */}
      {isLocked && (
        <>
          {/* Crosshair */}
          {!isMobile && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none">
              <div className="w-5 h-5 relative opacity-30">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/50" />
              </div>
            </div>
          )}

          {/* Game HUD */}
          <GameHUD
            seed={seed}
            chunkCount={chunkCount}
            position={cameraPos}
            biome={currentBiome}
            worldMode={config.worldMode}
            worldSize={config.worldSize}
            hour={displayHour}
            cameraYaw={cameraYaw}
            chunkCacheRef={chunkCacheRef}
            isMobile={isMobile}
            onScreenshot={handleScreenshot}
            onShare={handleShareScene}
            onSave={handleSaveWorld}
            onExit={exitImmersive}
            isFullscreenMapOpen={showFullscreenMap}
            onToggleFullscreenMap={toggleFullscreenMap}
            shareStatus={shareStatus}
          />

          {isMobile && <MobileTouchControls onKey={handleTouchKey} />}
        </>
      )}

      {/* ── Paused state: Quick-access buttons ── */}
      {!isLocked && !showControls && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
          <PixelFadeIn duration={200}>
            <div className="flex items-center gap-2">
              <button onClick={handleScreenshot}
                className="p-2 bg-retro-bg/80 border border-retro-border/50 rounded text-[11px] text-retro-muted hover:text-retro-cyan transition-all cursor-pointer select-none"
                title="Screenshot">📸</button>
              <button onClick={handleShareScene}
                className="p-2 bg-retro-bg/80 border border-retro-border/50 rounded text-[11px] text-retro-muted hover:text-retro-purple transition-all cursor-pointer select-none"
                title="Share scene">{shareStatus === 'copied' ? '✓' : '🔗'}</button>
              <button onClick={toggleFullscreenMap}
                className={`p-2 bg-retro-bg/80 border rounded text-[11px] transition-all cursor-pointer select-none ${
                  showFullscreenMap
                    ? 'text-retro-gold border-retro-gold/60 bg-retro-gold/10'
                    : 'text-retro-muted border-retro-border/50 hover:text-retro-gold hover:border-retro-gold/40'
                }`}
                title={showFullscreenMap ? 'Close fullscreen map' : 'Open fullscreen map'}>
                <PxlKitIcon icon={QuestMapIcon} size={12} colorful={showFullscreenMap} />
              </button>
              <button onClick={() => setShowSettings(true)}
                className="p-2 bg-retro-bg/80 border border-retro-border/50 rounded text-[11px] text-retro-muted hover:text-retro-green transition-all cursor-pointer select-none"
                title="Settings">⚙</button>
              <button onClick={() => { setShowFullscreenMap(false); setShowControls(true); }}
                className="px-2.5 py-1.5 bg-retro-bg/80 border border-retro-border/50 rounded font-pixel text-[8px] text-retro-muted hover:text-retro-green transition-all cursor-pointer select-none"
                title="Back to menu">Menu</button>
            </div>
          </PixelFadeIn>
        </div>
      )}

      {/* ── Three.js Canvas ── */}
      <div
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
        onPointerDown={handleCanvasPointerDown}
      >
        <Canvas
          camera={{ fov: 65, near: 0.1, far: 600 }}
          dpr={gfxDpr}
          gl={{ antialias: gfxAA, toneMapping: THREE.NoToneMapping, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
          style={{ background: 'transparent', touchAction: 'none' }}
        >
          <TimeContext.Provider value={timeStateRef}>
          <DayNightSky backgroundDetail={config.backgroundDetail} starDensity={config.starDensity} />
          <FogEffect density={config.fogDensity} />
          <DayNightLighting timeMode={config.timeMode} fixedHour={config.fixedHour} dayDurationSeconds={config.dayDurationSeconds} />
          <FlyCamera keysRef={keysRef} speedRef={speedRef} chunkCacheRef={chunkCacheRef} worldConfig={config} initialPos={initialPos} initialRot={initialRot} />
          <CameraLook isLocked={isLocked} isMobile={isMobile} />
          <ChunkManagerWithCounter seed={seed} config={config} onChunkCount={handleChunkCount} chunkCacheRef={chunkCacheRef} />
          <CameraTracker onUpdate={handleCameraUpdate} biomeNoise={noises.biome} tempNoise={noises.temp} cityFreq={config.cityFrequency} continentNoise={noises.continent} />
          <AmbientParticles biome={currentBiome} intensity={config.particleIntensity} />
          <SkyBirds biome={currentBiome} intensity={config.particleIntensity} />
          <GroundCritters biome={currentBiome} npcDensity={config.npcDensity} npcDistance={config.npcDistance} npcScale={config.npcScale} npcMaxPerChunk={config.npcMaxPerChunk} chunkCacheRef={chunkCacheRef} />
          <NightWindowLights chunkCacheRef={chunkCacheRef} windowLitProbability={config.windowLitProbability} lightDistance={Math.min(config.lightDistance, config.renderDistance)} lightFadeStart={config.lightFadeStart} lampBrightness={config.lampBrightness} lampColorTemp={config.lampColorTemp} />
          <WaterBoats chunkCacheRef={chunkCacheRef} boatDensity={config.boatDensity} boatDistance={Math.min(config.boatDistance, config.renderDistance)} />
          </TimeContext.Provider>
        </Canvas>
      </div>
    </div>
  );
}
