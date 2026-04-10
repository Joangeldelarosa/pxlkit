/* ═══════════════════════════════════════════════════════════════
 *  Ground Critters — Camera-direction-aware NPC population system
 *
 *  NPCs are spawned/despawned per-chunk with camera awareness:
 *  - Each loaded chunk gets deterministic NPC positions (seeded RNG)
 *  - NPCs behind the camera despawn at a tighter radius than those in front
 *  - Chunks in the camera's forward direction get spawn priority
 *  - Movement detection triggers immediate spawn/despawn scans
 *  - Walking animation, terrain tracking, biome-aware colors
 *  - npcMaxPerChunk controls per-chunk cap; npcDensity scales it 0-1
 *  - Gender differentiation with distinct body proportions and clothing
 *  - Per-NPC unique shirt, pants, shoes, hair colors
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { TimeContext } from '../rendering/DayNightCycle';

/* ── Constants ── */
const MAX_NPCS = 800;                // hard cap for instanced mesh
const FADE_DURATION = 0.8;           // seconds to fade in/out
const WALK_SPEED_MIN = 0.25;
const WALK_SPEED_MAX = 0.75;
const TURN_SPEED = 2.5;              // radians/sec for smooth rotation
const PAUSE_MIN = 1.5;
const PAUSE_MAX = 5.0;
const MOVE_MIN = 2.0;
const MOVE_MAX = 7.0;
const ARM_SWING_SPEED = 8;
const ARM_SWING_AMOUNT = 0.6;
const SPAWN_CHECK_INTERVAL = 0.2;    // seconds between chunk scans
const MOVE_TRIGGER_DIST = 2.0;       // world units of camera move to trigger immediate scan
const BEHIND_DIST_FACTOR = 0.5;      // behind-camera despawn at this fraction of npcDistance
const SIDE_DIST_FACTOR = 0.75;       // side/peripheral despawn factor

/* ── Biome NPC config ── */
interface BiomeCritterCfg {
  densityMul: number;    // 0-1 multiplier on npcMaxPerChunk for this biome
  skinColors: string[];  // range of skin tones
  shirtColors: string[]; // range of shirt colors
  pantsColors: string[]; // range of pants colors
  shoeColors: string[];  // range of shoe colors
  speedMult: number;
}

const BIOME_NPC_CONFIG: Record<string, BiomeCritterCfg> = {
  Forest:    { densityMul: 0.7,  skinColors: ['#ddb896', '#c8a070', '#e8c8a0'], shirtColors: ['#336633', '#445544', '#558855', '#2d5a2d', '#6b8f3c'], pantsColors: ['#553322', '#664433', '#443311', '#5a4632'], shoeColors: ['#443322', '#332211', '#554433'], speedMult: 0.8 },
  Plains:    { densityMul: 0.8,  skinColors: ['#ddb896', '#c8a070', '#f0d0a0', '#a07050'], shirtColors: ['#5577cc', '#cc5555', '#55aa77', '#ddaa44', '#8866aa', '#dd7744'], pantsColors: ['#444466', '#336655', '#554444', '#3a4a5a', '#5a5a3a'], shoeColors: ['#443322', '#222222', '#554433', '#663322'], speedMult: 1.0 },
  Desert:    { densityMul: 0.4,  skinColors: ['#c8a070', '#b09060', '#d4b080'], shirtColors: ['#ccaa66', '#ddbb77', '#eecc88', '#c4a458'], pantsColors: ['#887744', '#776633', '#998855'], shoeColors: ['#776644', '#665533', '#887755'], speedMult: 0.7 },
  Tundra:    { densityMul: 0.3,  skinColors: ['#eeddcc', '#deccbb', '#f0e0d0'], shirtColors: ['#7799aa', '#889988', '#667788', '#9a8a7a'], pantsColors: ['#556677', '#445566', '#667788'], shoeColors: ['#443322', '#332211', '#554433'], speedMult: 0.6 },
  Ocean:     { densityMul: 0.0,  skinColors: ['#c8a070'], shirtColors: ['#cc6644'], pantsColors: ['#553333'], shoeColors: ['#332211'], speedMult: 0.5 },
  City:      { densityMul: 1.0,  skinColors: ['#ddb896', '#c8a070', '#f0d0a0', '#a07050', '#8b6945', '#e8c8a0'], shirtColors: ['#666666', '#444444', '#3355aa', '#aa3333', '#228844', '#bb8833', '#884488', '#555577', '#994422', '#dddddd', '#222222'], pantsColors: ['#333344', '#222233', '#444455', '#282838', '#3a3a4a', '#555566', '#1a1a2a'], shoeColors: ['#222222', '#443322', '#111111', '#332211', '#554433', '#663333'], speedMult: 1.2 },
  Mountains: { densityMul: 0.2,  skinColors: ['#ddb896', '#c8a070'], shirtColors: ['#998877', '#887766', '#776655'], pantsColors: ['#556655', '#445544', '#667766'], shoeColors: ['#554433', '#443322', '#665544'], speedMult: 0.5 },
  Swamp:     { densityMul: 0.3,  skinColors: ['#bba888', '#a89878'], shirtColors: ['#557744', '#667755', '#446633'], pantsColors: ['#444433', '#333322', '#555544'], shoeColors: ['#443322', '#332211', '#554433'], speedMult: 0.6 },
  Village:   { densityMul: 0.9,  skinColors: ['#ddb896', '#c8a070', '#e0c090'], shirtColors: ['#cc8844', '#bb7733', '#dd9955', '#aa6622', '#997744'], pantsColors: ['#665533', '#554422', '#776644', '#443311'], shoeColors: ['#554433', '#443322', '#332211'], speedMult: 0.9 },
};

/* ── NPC body part definitions — enhanced with gender support ── */
type ColorType = 0 | 1 | 2 | 3 | 4 | 5; // 0=skin, 1=shirt, 2=pants, 3=hair, 4=shoes, 5=accessory

interface BodyPart {
  ox: number; oy: number; oz: number;
  sx: number; sy: number; sz: number;
  colorType: ColorType;
  animGroup?: 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';
  pivotY?: number;
  genderOnly?: 'M' | 'F';  // only render for this gender (omit = both)
}

/* Male NPC body parts — 13 parts: broader shoulders, thicker build */
const MALE_BODY_PARTS: BodyPart[] = [
  // Head
  { ox: 0, oy: 4.2, oz: 0, sx: 1.8, sy: 1.8, sz: 1.8, colorType: 0 },
  // Hair (short, flat on top) — offset +0.06 to prevent z-fight with head top
  { ox: 0, oy: 5.5, oz: 0, sx: 1.9, sy: 0.7, sz: 1.9, colorType: 3 },
  // Hair sides / sideburns — offset +0.06 Z to prevent z-fight with head back
  { ox: 0, oy: 4.8, oz: 0.76, sx: 1.4, sy: 0.5, sz: 0.4, colorType: 3 },
  // Eyes (two tiny dots) — offset -0.06 Z to prevent z-fight with head front
  { ox: -0.4, oy: 4.5, oz: -0.96, sx: 0.3, sy: 0.2, sz: 0.1, colorType: 5 },
  { ox: 0.4, oy: 4.5, oz: -0.96, sx: 0.3, sy: 0.2, sz: 0.1, colorType: 5 },
  // Torso (broader)
  { ox: 0, oy: 2.2, oz: 0, sx: 2.2, sy: 2.0, sz: 1.2, colorType: 1 },
  // Left arm
  { ox: -1.6, oy: 2.2, oz: 0, sx: 0.7, sy: 2.0, sz: 0.7, colorType: 1, animGroup: 'leftArm', pivotY: 2.0 },
  // Right arm
  { ox: 1.6, oy: 2.2, oz: 0, sx: 0.7, sy: 2.0, sz: 0.7, colorType: 1, animGroup: 'rightArm', pivotY: 2.0 },
  // Left hand (skin)
  { ox: -1.6, oy: 0.4, oz: 0, sx: 0.5, sy: 0.5, sz: 0.5, colorType: 0, animGroup: 'leftArm', pivotY: 3.8 },
  // Right hand (skin)
  { ox: 1.6, oy: 0.4, oz: 0, sx: 0.5, sy: 0.5, sz: 0.5, colorType: 0, animGroup: 'rightArm', pivotY: 3.8 },
  // Left leg (pants)
  { ox: -0.55, oy: 0.4, oz: 0, sx: 0.8, sy: 1.8, sz: 0.8, colorType: 2, animGroup: 'leftLeg', pivotY: 1.8 },
  // Right leg (pants)
  { ox: 0.55, oy: 0.4, oz: 0, sx: 0.8, sy: 1.8, sz: 0.8, colorType: 2, animGroup: 'rightLeg', pivotY: 1.8 },
  // Left shoe
  { ox: -0.55, oy: -0.5, oz: -0.1, sx: 0.8, sy: 0.5, sz: 1.0, colorType: 4, animGroup: 'leftLeg', pivotY: 2.7 },
  // Right shoe
  { ox: 0.55, oy: -0.5, oz: -0.1, sx: 0.8, sy: 0.5, sz: 1.0, colorType: 4, animGroup: 'rightLeg', pivotY: 2.7 },
];

/* Female NPC body parts — 15 parts: narrower shoulders, hair longer, slightly smaller build */
const FEMALE_BODY_PARTS: BodyPart[] = [
  // Head
  { ox: 0, oy: 4.0, oz: 0, sx: 1.7, sy: 1.7, sz: 1.7, colorType: 0 },
  // Hair (longer, extends down back) — offset +0.06 Y to prevent z-fight with head top
  { ox: 0, oy: 5.2, oz: 0, sx: 1.85, sy: 0.8, sz: 1.85, colorType: 3 },
  // Hair extension (ponytail / long hair draping down back) — offset +0.06 Z
  { ox: 0, oy: 3.8, oz: 0.66, sx: 1.2, sy: 1.6, sz: 0.5, colorType: 3 },
  // Hair side fringe (bangs hanging on sides of face) — offset -0.06 Z
  { ox: 0, oy: 4.6, oz: -0.66, sx: 1.6, sy: 0.6, sz: 0.3, colorType: 3 },
  // Eyes — offset -0.06 Z to prevent z-fight with head front
  { ox: -0.35, oy: 4.3, oz: -0.91, sx: 0.3, sy: 0.2, sz: 0.1, colorType: 5 },
  { ox: 0.35, oy: 4.3, oz: -0.91, sx: 0.3, sy: 0.2, sz: 0.1, colorType: 5 },
  // Torso (narrower)
  { ox: 0, oy: 2.2, oz: 0, sx: 1.8, sy: 1.8, sz: 1.0, colorType: 1 },
  // Left arm
  { ox: -1.3, oy: 2.2, oz: 0, sx: 0.6, sy: 1.8, sz: 0.6, colorType: 1, animGroup: 'leftArm', pivotY: 1.8 },
  // Right arm
  { ox: 1.3, oy: 2.2, oz: 0, sx: 0.6, sy: 1.8, sz: 0.6, colorType: 1, animGroup: 'rightArm', pivotY: 1.8 },
  // Left hand
  { ox: -1.3, oy: 0.5, oz: 0, sx: 0.4, sy: 0.4, sz: 0.4, colorType: 0, animGroup: 'leftArm', pivotY: 3.5 },
  // Right hand
  { ox: 1.3, oy: 0.5, oz: 0, sx: 0.4, sy: 0.4, sz: 0.4, colorType: 0, animGroup: 'rightArm', pivotY: 3.5 },
  // Left leg
  { ox: -0.45, oy: 0.4, oz: 0, sx: 0.7, sy: 1.7, sz: 0.7, colorType: 2, animGroup: 'leftLeg', pivotY: 1.7 },
  // Right leg
  { ox: 0.45, oy: 0.4, oz: 0, sx: 0.7, sy: 1.7, sz: 0.7, colorType: 2, animGroup: 'rightLeg', pivotY: 1.7 },
  // Left shoe
  { ox: -0.45, oy: -0.4, oz: -0.1, sx: 0.7, sy: 0.5, sz: 0.9, colorType: 4, animGroup: 'leftLeg', pivotY: 2.5 },
  // Right shoe
  { ox: 0.45, oy: -0.4, oz: -0.1, sx: 0.7, sy: 0.5, sz: 0.9, colorType: 4, animGroup: 'rightLeg', pivotY: 2.5 },
];

const MAX_PARTS = Math.max(MALE_BODY_PARTS.length, FEMALE_BODY_PARTS.length);
const TOTAL_INSTANCES = MAX_NPCS * MAX_PARTS;

const HAIR_COLORS = [
  '#221100', '#332211', '#443322', '#554433', '#110000', // dark brown/black
  '#665544', '#887766', '#776655', // light brown
  '#aa6633', '#cc9944', '#ddbb66', // blonde shades
  '#993322', '#bb4433', // auburn/red
  '#222222', '#333333', '#111111', // black shades
];

/* ── NPC state ── */
interface NpcState {
  x: number; z: number; y: number;
  heading: number;
  targetHeading: number;
  speed: number;
  targetSpeed: number;
  moveTimer: number;
  moving: boolean;
  age: number;
  fadeOut: boolean;
  fadeTimer: number;
  walkPhase: number;
  alive: boolean;
  chunkKey: string;              // which chunk this NPC belongs to
  // Per-NPC appearance
  gender: 'M' | 'F';
  skinColor: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  shoeColor: string;
  eyeColor: string;
}

/* ── Deterministic seeded RNG (same positions each visit) ── */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => { s = Math.imul(s ^ (s >>> 15), s | 1); s ^= s + Math.imul(s ^ (s >>> 7), s | 61); return ((s ^ (s >>> 14)) >>> 0) / 4294967296; };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/* ── Terrain height sampling ── */
function getGroundSample(cache: Map<string, ChunkVoxelData>, worldX: number, worldZ: number): { height: number; walkable: boolean } {
  const vx = worldX / VOXEL_SIZE;
  const vz = worldZ / VOXEL_SIZE;
  const cx = Math.floor(vx / CHUNK_SIZE);
  const cz = Math.floor(vz / CHUNK_SIZE);
  const data = cache.get(`${cx},${cz}`);
  if (!data) return { height: -1, walkable: false };
  const lx = Math.floor(vx - cx * CHUNK_SIZE);
  const lz = Math.floor(vz - cz * CHUNK_SIZE);
  if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return { height: -1, walkable: false };
  const i = lx * CHUNK_SIZE + lz;
  const height = data.groundHeightMap ? data.groundHeightMap[i] : data.solidHeightMap[i];
  const walkable = data.npcWalkableMap ? data.npcWalkableMap[i] === 1 : true;
  return { height, walkable };
}

function getWaterLevel(cache: Map<string, ChunkVoxelData>, worldX: number, worldZ: number): number {
  const vx = worldX / VOXEL_SIZE;
  const vz = worldZ / VOXEL_SIZE;
  const cx = Math.floor(vx / CHUNK_SIZE);
  const cz = Math.floor(vz / CHUNK_SIZE);
  const data = cache.get(`${cx},${cz}`);
  if (!data) return 0;
  const lx = Math.floor(vx - cx * CHUNK_SIZE);
  const lz = Math.floor(vz - cz * CHUNK_SIZE);
  if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return 0;
  return data.waterLevelMap[lx * CHUNK_SIZE + lz];
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */

export function GroundCritters({
  biome,
  npcDensity,
  npcDistance,
  npcScale,
  npcMaxPerChunk,
  chunkCacheRef,
}: {
  biome: string;
  npcDensity: number;
  npcDistance: number;
  npcScale: number;
  npcMaxPerChunk: number;
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
}) {
  const { camera } = useThree();
  const timeRef = useContext(TimeContext);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const npcsRef = useRef<NpcState[]>([]);
  const spawnTimerRef = useRef(0);
  const activeChunksRef = useRef<Set<string>>(new Set());
  const lastCamPosRef = useRef({ x: 0, z: 0 });
  const camDirRef = useRef({ x: 0, z: -1 });  // camera forward on XZ plane

  const cfg = BIOME_NPC_CONFIG[biome] || BIOME_NPC_CONFIG.Plains;

  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ transparent: true, depthWrite: true }), []);

  /* ── Reusable objects for render loop (avoid per-frame allocations) ── */
  const renderObjs = useMemo(() => ({
    m: new THREE.Matrix4(),
    rotM: new THREE.Matrix4(),
    scaleM: new THREE.Matrix4(),
    swingM: new THREE.Matrix4(),
    c: new THREE.Color(),
    zeroMatrix: new THREE.Matrix4().makeScale(0, 0, 0),
    dir: new THREE.Vector3(),
  }), []);

  /* ── NPC voxel size based on npcScale ── */
  const npcVs = VOXEL_SIZE / 5 * npcScale;
  const surfaceOffset = VOXEL_SIZE * 0.52;

  /* ── Try to find a valid spawn position within a chunk ── */
  function trySpawnInChunk(cx: number, cz: number, rng: () => number, cache: Map<string, ChunkVoxelData>): { x: number; z: number; y: number } | null {
    for (let attempt = 0; attempt < 12; attempt++) {
      const lx = 1 + Math.floor(rng() * (CHUNK_SIZE - 2));
      const lz = 1 + Math.floor(rng() * (CHUNK_SIZE - 2));
      const worldX = (cx * CHUNK_SIZE + lx) * VOXEL_SIZE;
      const worldZ = (cz * CHUNK_SIZE + lz) * VOXEL_SIZE;

      const sample = getGroundSample(cache, worldX, worldZ);
      if (sample.height < 0 || !sample.walkable) continue;

      const waterL = getWaterLevel(cache, worldX, worldZ);
      if (sample.height < waterL) continue;

      // Avoid steep terrain
      const hL = getGroundSample(cache, worldX - VOXEL_SIZE, worldZ).height;
      const hR = getGroundSample(cache, worldX + VOXEL_SIZE, worldZ).height;
      const hF = getGroundSample(cache, worldX, worldZ - VOXEL_SIZE).height;
      const hB = getGroundSample(cache, worldX, worldZ + VOXEL_SIZE).height;
      if (hL < 0 || hR < 0 || hF < 0 || hB < 0) continue;
      if (Math.max(Math.abs(sample.height - hL), Math.abs(sample.height - hR), Math.abs(sample.height - hF), Math.abs(sample.height - hB)) > 2) continue;

      return { x: worldX, z: worldZ, y: sample.height * VOXEL_SIZE + surfaceOffset };
    }
    return null;
  }

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const cache = chunkCacheRef.current;
    if (!mesh || !cache || npcDensity <= 0) return;

    const dt = Math.min(delta, 0.05);
    const npcs = npcsRef.current;
    const camX = camera.position.x;
    const camZ = camera.position.z;
    const chunkWorldSize = CHUNK_SIZE * VOXEL_SIZE;

    // Camera chunk position
    const camCx = Math.floor(camX / chunkWorldSize);
    const camCz = Math.floor(camZ / chunkWorldSize);

    // ── Get camera forward direction on XZ plane ──
    camera.getWorldDirection(renderObjs.dir);
    const fwdLen = Math.sqrt(renderObjs.dir.x * renderObjs.dir.x + renderObjs.dir.z * renderObjs.dir.z);
    const fwdX = fwdLen > 0.001 ? renderObjs.dir.x / fwdLen : 0;
    const fwdZ = fwdLen > 0.001 ? renderObjs.dir.z / fwdLen : -1;
    camDirRef.current.x = fwdX;
    camDirRef.current.z = fwdZ;

    // ── Detect significant camera movement for immediate scan ──
    const moveDx = camX - lastCamPosRef.current.x;
    const moveDz = camZ - lastCamPosRef.current.z;
    const moveDist = Math.sqrt(moveDx * moveDx + moveDz * moveDz);
    const cameraMovedSignificantly = moveDist > MOVE_TRIGGER_DIST;

    /* ═══ 1. CAMERA-DIRECTION-AWARE SPAWN/DESPAWN SCAN ═══ */
    spawnTimerRef.current += dt;
    const shouldScan = spawnTimerRef.current > SPAWN_CHECK_INTERVAL || cameraMovedSignificantly;

    if (shouldScan) {
      spawnTimerRef.current = 0;
      lastCamPosRef.current.x = camX;
      lastCamPosRef.current.z = camZ;

      const dist = npcDistance;
      const distSq = (dist + 0.5) * (dist + 0.5);

      // ── Directional despawn distances ──
      const behindDistSq = (dist * BEHIND_DIST_FACTOR) * (dist * BEHIND_DIST_FACTOR);
      const sideDistSq = (dist * SIDE_DIST_FACTOR) * (dist * SIDE_DIST_FACTOR);
      const killDistSq = (dist + 1.0) * (dist + 1.0);

      function getEffectiveDespawnDistSq(chunkCenterX: number, chunkCenterZ: number): number {
        const toCx = chunkCenterX - camX;
        const toCz = chunkCenterZ - camZ;
        const toLen = Math.sqrt(toCx * toCx + toCz * toCz);
        if (toLen < 0.001) return distSq;
        const dot = (toCx / toLen) * fwdX + (toCz / toLen) * fwdZ;
        if (dot < -0.3) return behindDistSq;
        if (dot < 0.2)  return sideDistSq;
        return distSq;
      }

      // Build set of chunks that should have NPCs
      const wantedChunks = new Set<string>();
      for (let dx = -dist; dx <= dist; dx++) {
        for (let dz = -dist; dz <= dist; dz++) {
          if (dx * dx + dz * dz > distSq) continue;
          const ccx = camCx + dx;
          const ccz = camCz + dz;
          const key = `${ccx},${ccz}`;
          if (cache.has(key)) {
            wantedChunks.add(key);
          }
        }
      }

      // ── Phase A: Direction-aware chunk despawn ──
      const active = activeChunksRef.current;
      for (const key of active) {
        if (wantedChunks.has(key)) {
          const [cxs, czs] = key.split(',');
          const kcx = parseInt(cxs, 10);
          const kcz = parseInt(czs, 10);
          const ddx = kcx - camCx;
          const ddz = kcz - camCz;
          const cdSq = ddx * ddx + ddz * ddz;
          const chunkCenterX = (kcx + 0.5) * chunkWorldSize;
          const chunkCenterZ = (kcz + 0.5) * chunkWorldSize;
          const effectiveDistSq = getEffectiveDespawnDistSq(chunkCenterX, chunkCenterZ);

          if (cdSq > effectiveDistSq) {
            for (let i = 0; i < npcs.length; i++) {
              if (npcs[i].alive && !npcs[i].fadeOut && npcs[i].chunkKey === key) {
                npcs[i].fadeOut = true;
                npcs[i].fadeTimer = 0;
              }
            }
            active.delete(key);
            wantedChunks.delete(key);
          }
          continue;
        }

        const [cxs, czs] = key.split(',');
        const kcx = parseInt(cxs, 10);
        const kcz = parseInt(czs, 10);
        const ddx = kcx - camCx;
        const ddz = kcz - camCz;
        const cdSq = ddx * ddx + ddz * ddz;

        if (cdSq > killDistSq) {
          for (let i = 0; i < npcs.length; i++) {
            if (npcs[i].alive && npcs[i].chunkKey === key) {
              npcs[i].alive = false;
            }
          }
        } else {
          for (let i = 0; i < npcs.length; i++) {
            if (npcs[i].alive && !npcs[i].fadeOut && npcs[i].chunkKey === key) {
              npcs[i].fadeOut = true;
              npcs[i].fadeTimer = 0;
            }
          }
        }
        active.delete(key);
      }

      // ── Phase B: Individual NPC direction-aware despawn ──
      for (let i = 0; i < npcs.length; i++) {
        const n = npcs[i];
        if (!n.alive) continue;
        const ndx = (n.x / chunkWorldSize) - camCx;
        const ndz = (n.z / chunkWorldSize) - camCz;
        const nDistSq = ndx * ndx + ndz * ndz;

        if (nDistSq > killDistSq) {
          n.alive = false;
        } else if (!n.fadeOut) {
          const effectiveDistSq = getEffectiveDespawnDistSq(n.x, n.z);
          if (nDistSq > effectiveDistSq) {
            n.fadeOut = true;
            n.fadeTimer = 0;
          }
        }
      }

      // ── Phase C: Spawn NPCs, prioritizing chunks ahead of camera ──
      const perChunk = Math.max(0, Math.round(npcMaxPerChunk * cfg.densityMul * npcDensity));

      let liveCount = 0;
      for (let i = 0; i < npcs.length; i++) {
        if (npcs[i].alive && !npcs[i].fadeOut) liveCount++;
      }
      let remaining = MAX_NPCS - liveCount;

      const chunksToSpawn: { key: string; cx: number; cz: number; priority: number }[] = [];
      for (const key of wantedChunks) {
        if (active.has(key)) continue;
        const [cxs, czs] = key.split(',');
        const ccx = parseInt(cxs, 10);
        const ccz = parseInt(czs, 10);
        const chunkCenterX = (ccx + 0.5) * chunkWorldSize;
        const chunkCenterZ = (ccz + 0.5) * chunkWorldSize;
        const toCx = chunkCenterX - camX;
        const toCz = chunkCenterZ - camZ;
        const toLen = Math.sqrt(toCx * toCx + toCz * toCz);
        const dot = toLen > 0.001 ? (toCx / toLen) * fwdX + (toCz / toLen) * fwdZ : 0;
        const ddx = ccx - camCx;
        const ddz = ccz - camCz;
        const distFromCam = Math.sqrt(ddx * ddx + ddz * ddz);
        const priority = (dot + 1.0) * 2.0 - distFromCam * 0.5;
        chunksToSpawn.push({ key, cx: ccx, cz: ccz, priority });
      }
      chunksToSpawn.sort((a, b) => b.priority - a.priority);

      for (const entry of chunksToSpawn) {
        if (remaining <= 0) break;

        const { key, cx: ccx, cz: ccz } = entry;

        const seed = ccx * 73856093 + ccz * 19349663;
        const rng = mulberry32(seed);

        const count = Math.min(perChunk, remaining);
        let spawned = 0;

        for (let i = 0; i < count; i++) {
          const pos = trySpawnInChunk(ccx, ccz, rng, cache);
          if (!pos) continue;

          const heading = rng() * Math.PI * 2;
          const speed = (WALK_SPEED_MIN + rng() * (WALK_SPEED_MAX - WALK_SPEED_MIN)) * cfg.speedMult;
          const gender: 'M' | 'F' = rng() > 0.5 ? 'M' : 'F';

          const npc: NpcState = {
            x: pos.x, z: pos.z, y: pos.y,
            heading, targetHeading: heading,
            speed: 0, targetSpeed: speed,
            moveTimer: MOVE_MIN + rng() * (MOVE_MAX - MOVE_MIN),
            moving: true, age: 0, fadeOut: false, fadeTimer: 0,
            walkPhase: rng() * Math.PI * 2, alive: true,
            chunkKey: key,
            // Per-NPC unique appearance
            gender,
            skinColor: pickRandom(cfg.skinColors, rng),
            hairColor: pickRandom(HAIR_COLORS, rng),
            shirtColor: pickRandom(cfg.shirtColors, rng),
            pantsColor: pickRandom(cfg.pantsColors, rng),
            shoeColor: pickRandom(cfg.shoeColors, rng),
            eyeColor: rng() > 0.7 ? '#334455' : '#221100', // blue or dark
          };
          let placed = false;
          for (let s = 0; s < npcs.length; s++) {
            if (!npcs[s].alive) { npcs[s] = npc; placed = true; break; }
          }
          if (!placed && npcs.length < MAX_NPCS) npcs.push(npc);
          else if (!placed) break;
          spawned++;
          remaining--;
        }

        if (spawned > 0) active.add(key);
      }
    }

    /* ═══ 2. UPDATE ═══ */
    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];
      if (!n.alive) continue;
      n.age += dt;

      if (n.fadeOut) {
        n.fadeTimer += dt;
        if (n.fadeTimer >= FADE_DURATION) { n.alive = false; continue; }
      }

      if (n.moving) {
        let hd = n.targetHeading - n.heading;
        while (hd > Math.PI) hd -= Math.PI * 2;
        while (hd < -Math.PI) hd += Math.PI * 2;
        if (Math.abs(hd) > 0.05) {
          n.heading += Math.sign(hd) * Math.min(TURN_SPEED * dt, Math.abs(hd));
        } else {
          n.heading = n.targetHeading;
        }

        if (n.speed < n.targetSpeed) n.speed = Math.min(n.speed + 2.0 * dt, n.targetSpeed);

        const newX = n.x + Math.sin(n.heading) * n.speed * dt;
        const newZ = n.z + Math.cos(n.heading) * n.speed * dt;

        const newSample = getGroundSample(cache, newX, newZ);
        const newH = newSample.height;
        const newW = getWaterLevel(cache, newX, newZ);
        const newY = newH * VOXEL_SIZE + surfaceOffset;

        if (newH >= 0 && newSample.walkable && newH >= newW && Math.abs(newY - n.y) <= VOXEL_SIZE * 1.5) {
          n.x = newX;
          n.z = newZ;
          n.y += (newY - n.y) * Math.min(1, dt * 10);
        } else {
          n.targetHeading = n.heading + Math.PI * (0.5 + Math.random());
          n.speed *= 0.3;
        }

        n.walkPhase += dt * ARM_SWING_SPEED * (n.speed / WALK_SPEED_MAX);
        n.moveTimer -= dt;
        if (n.moveTimer <= 0) {
          n.moving = false;
          n.moveTimer = PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN);
          n.targetSpeed = 0;
          n.speed *= 0.5;
        }
      } else {
        n.speed = Math.max(0, n.speed - 3.0 * dt);
        n.walkPhase += dt * ARM_SWING_SPEED * (n.speed / WALK_SPEED_MAX) * 0.3;

        const standSample = getGroundSample(cache, n.x, n.z);
        if (standSample.height >= 0 && standSample.walkable) {
          const standY = standSample.height * VOXEL_SIZE + surfaceOffset;
          n.y += (standY - n.y) * Math.min(1, dt * 10);
        } else {
          n.fadeOut = true;
          n.fadeTimer = 0;
        }

        n.moveTimer -= dt;
        if (n.moveTimer <= 0) {
          n.moving = true;
          n.targetHeading = n.heading + (Math.random() - 0.5) * Math.PI * 1.5;
          n.targetSpeed = (WALK_SPEED_MIN + Math.random() * (WALK_SPEED_MAX - WALK_SPEED_MIN)) * cfg.speedMult;
          n.moveTimer = MOVE_MIN + Math.random() * (MOVE_MAX - MOVE_MIN);
        }
      }
    }

    /* ═══ 3. RENDER ═══ */
    const { m, rotM, scaleM, swingM, c, zeroMatrix } = renderObjs;
    let idx = 0;
    const isNight = timeRef?.current.isNight ?? false;
    const nightMul = isNight ? 0.4 : 1.0;

    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];
      if (!n.alive) continue;

      let opacity = 1.0;
      if (n.age < FADE_DURATION) opacity = n.age / FADE_DURATION;
      if (n.fadeOut) opacity = Math.max(0, 1 - n.fadeTimer / FADE_DURATION);

      // Facing angle: model faces -Z in local space, so add PI to align with movement (+Z at heading=0)
      const facingAngle = n.heading + Math.PI;
      const ch = Math.cos(facingAngle);
      const sh = Math.sin(facingAngle);
      const speedRatio = Math.min(1, n.speed / WALK_SPEED_MAX);
      const swingAmt = n.moving
        ? Math.sin(n.walkPhase) * ARM_SWING_AMOUNT * speedRatio
        : Math.sin(n.walkPhase) * ARM_SWING_AMOUNT * 0.05;

      const parts = n.gender === 'F' ? FEMALE_BODY_PARTS : MALE_BODY_PARTS;

      for (let p = 0; p < parts.length; p++) {
        if (idx >= TOTAL_INSTANCES) break;
        const part = parts[p];

        let animSwing = 0;
        if (part.animGroup === 'leftArm') animSwing = swingAmt;
        else if (part.animGroup === 'rightArm') animSwing = -swingAmt;
        else if (part.animGroup === 'leftLeg') animSwing = -swingAmt;
        else if (part.animGroup === 'rightLeg') animSwing = swingAmt;

        const lx = part.ox * npcVs;
        let ly = (part.oy + part.sy * 0.5) * npcVs;
        let lz = part.oz * npcVs;

        if (animSwing !== 0 && part.pivotY !== undefined) {
          const pivotWorldY = (part.oy + part.pivotY) * npcVs;
          const relY = ly - pivotWorldY;
          const cosS = Math.cos(animSwing);
          const sinS = Math.sin(animSwing);
          ly = pivotWorldY + relY * cosS - lz * sinS;
          lz = lz * cosS + relY * sinS;
        }

        const rx = lx * ch + lz * sh;
        const rz = -lx * sh + lz * ch;

        const sx = part.sx * npcVs;
        const sy = part.sy * npcVs;
        const sz = part.sz * npcVs;

        rotM.makeRotationY(facingAngle);
        if (animSwing !== 0) {
          swingM.makeRotationX(animSwing);
          rotM.multiply(swingM);
        }
        scaleM.makeScale(sx, sy, sz);
        m.copy(rotM);
        m.multiply(scaleM);
        // eslint-disable-next-line react-hooks/immutability
        m.elements[12] = n.x + rx;
        m.elements[13] = n.y + ly;
        m.elements[14] = n.z + rz;

        mesh.setMatrixAt(idx, m);

        // Per-NPC color assignment
        switch (part.colorType) {
          case 0: c.set(n.skinColor); break;            // skin
          case 1: c.set(n.shirtColor); break;           // shirt
          case 2: c.set(n.pantsColor); break;           // pants
          case 3: c.set(n.hairColor); break;             // hair
          case 4: c.set(n.shoeColor); break;             // shoes
          case 5: c.set(n.eyeColor); break;              // eyes/accessory
        }
        c.multiplyScalar(nightMul * opacity);
        mesh.setColorAt(idx, c);
        idx++;
      }

      // Pad remaining instance slots for this NPC (if fewer parts than MAX_PARTS)
      const partCount = parts.length;
      for (let pad = partCount; pad < MAX_PARTS; pad++) {
        if (idx >= TOTAL_INSTANCES) break;
        mesh.setMatrixAt(idx, zeroMatrix);
        c.setRGB(0, 0, 0);
        mesh.setColorAt(idx, c);
        idx++;
      }
    }

    // Hide unused instances
    for (let z = idx; z < TOTAL_INSTANCES; z++) mesh.setMatrixAt(z, zeroMatrix);

    mesh.count = TOTAL_INSTANCES;
    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, mat, TOTAL_INSTANCES]} frustumCulled={false} />
  );
}
