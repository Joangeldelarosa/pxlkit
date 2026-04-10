/* ═══════════════════════════════════════════════════════════════
 *  Ground Critters — Chunk-based NPC population system
 *
 *  NPCs are spawned/despawned per-chunk like terrain itself:
 *  - Each loaded chunk gets deterministic NPC positions (seeded RNG)
 *  - NPCs load/unload as chunks enter/leave the npcDistance radius
 *  - Far-away NPCs (behind camera) are instantly recycled → frees slots
 *  - Border NPCs get smooth opacity fade-in/out
 *  - Walking animation, terrain tracking, biome-aware colors
 *  - npcMaxPerChunk controls per-chunk cap; npcDensity scales it 0-1
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { TimeContext } from '../rendering/DayNightCycle';

/* ── Constants ── */
const MAX_NPCS = 500;                // hard cap for instanced mesh
const FADE_DURATION = 1.0;           // seconds to fade in/out
const WALK_SPEED_MIN = 0.25;
const WALK_SPEED_MAX = 0.75;
const TURN_SPEED = 2.5;              // radians/sec for smooth rotation
const PAUSE_MIN = 1.5;
const PAUSE_MAX = 5.0;
const MOVE_MIN = 2.0;
const MOVE_MAX = 7.0;
const ARM_SWING_SPEED = 8;
const ARM_SWING_AMOUNT = 0.6;
const SPAWN_CHECK_INTERVAL = 0.25;   // seconds between chunk scans

/* ── Biome NPC config ── */
interface BiomeCritterCfg {
  densityMul: number;    // 0-1 multiplier on npcMaxPerChunk for this biome
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  speedMult: number;
}

const BIOME_NPC_CONFIG: Record<string, BiomeCritterCfg> = {
  Forest:    { densityMul: 0.7,  skinColor: '#ddb896', shirtColor: '#336633', pantsColor: '#553322', speedMult: 0.8 },
  Plains:    { densityMul: 0.8,  skinColor: '#ddb896', shirtColor: '#5577cc', pantsColor: '#444466', speedMult: 1.0 },
  Desert:    { densityMul: 0.4,  skinColor: '#c8a070', shirtColor: '#ccaa66', pantsColor: '#887744', speedMult: 0.7 },
  Tundra:    { densityMul: 0.3,  skinColor: '#eeddcc', shirtColor: '#7799aa', pantsColor: '#556677', speedMult: 0.6 },
  Ocean:     { densityMul: 0.0,  skinColor: '#c8a070', shirtColor: '#cc6644', pantsColor: '#553333', speedMult: 0.5 },
  City:      { densityMul: 1.0,  skinColor: '#ddb896', shirtColor: '#666666', pantsColor: '#333344', speedMult: 1.2 },
  Mountains: { densityMul: 0.2,  skinColor: '#ddb896', shirtColor: '#998877', pantsColor: '#556655', speedMult: 0.5 },
  Swamp:     { densityMul: 0.3,  skinColor: '#bba888', shirtColor: '#557744', pantsColor: '#444433', speedMult: 0.6 },
  Village:   { densityMul: 0.9,  skinColor: '#ddb896', shirtColor: '#cc8844', pantsColor: '#665533', speedMult: 0.9 },
};

/* ── NPC body part definitions ── */
type ColorType = 0 | 1 | 2 | 3;

interface BodyPart {
  ox: number; oy: number; oz: number;
  sx: number; sy: number; sz: number;
  colorType: ColorType;
  animGroup?: 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';
  pivotY?: number;
}

const BODY_PARTS: BodyPart[] = [
  { ox: 0, oy: 4, oz: 0, sx: 2, sy: 2, sz: 2, colorType: 0 },        // Head
  { ox: 0, oy: 6, oz: 0, sx: 2, sy: 0.6, sz: 2, colorType: 3 },      // Hair
  { ox: 0, oy: 2, oz: 0, sx: 2, sy: 2, sz: 1, colorType: 1 },        // Torso
  { ox: -1.4, oy: 2, oz: 0, sx: 0.8, sy: 2, sz: 0.8, colorType: 1, animGroup: 'leftArm', pivotY: 2 },
  { ox: 1.4, oy: 2, oz: 0, sx: 0.8, sy: 2, sz: 0.8, colorType: 1, animGroup: 'rightArm', pivotY: 2 },
  { ox: -0.5, oy: 0, oz: 0, sx: 0.8, sy: 2, sz: 0.8, colorType: 2, animGroup: 'leftLeg', pivotY: 2 },
  { ox: 0.5, oy: 0, oz: 0, sx: 0.8, sy: 2, sz: 0.8, colorType: 2, animGroup: 'rightLeg', pivotY: 2 },
];

const VOXELS_PER_NPC = BODY_PARTS.length;
const TOTAL_INSTANCES = MAX_NPCS * VOXELS_PER_NPC;

const HAIR_COLORS = ['#332211', '#443322', '#554433', '#221100', '#665544', '#887766', '#aa6633', '#cc9944'];

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
  hairColor: string;
  colorShift: number;
  chunkKey: string;              // which chunk this NPC belongs to
}

/* ── Deterministic seeded RNG (same positions each visit) ── */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => { s = Math.imul(s ^ (s >>> 15), s | 1); s ^= s + Math.imul(s ^ (s >>> 7), s | 61); return ((s ^ (s >>> 14)) >>> 0) / 4294967296; };
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

  const cfg = BIOME_NPC_CONFIG[biome] || BIOME_NPC_CONFIG.Plains;

  const colors = useMemo(() => ({
    skin: new THREE.Color(cfg.skinColor),
    shirt: new THREE.Color(cfg.shirtColor),
    pants: new THREE.Color(cfg.pantsColor),
  }), [cfg.skinColor, cfg.shirtColor, cfg.pantsColor]);

  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ transparent: true, depthWrite: true }), []);

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

    /* ═══ 1. CHUNK-BASED SPAWN/DESPAWN SCAN ═══ */
    spawnTimerRef.current += dt;
    if (spawnTimerRef.current > SPAWN_CHECK_INTERVAL) {
      spawnTimerRef.current = 0;

      const dist = npcDistance;
      const distSq = (dist + 0.5) * (dist + 0.5);
      // Instant-kill distance: far enough that player can't see
      const killDistSq = (dist + 1.5) * (dist + 1.5);

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

      // ── Phase A: Instantly kill far-away NPCs to free slots ──
      // NPCs whose chunk is well beyond range get killed immediately
      // (player can't see them anyway, no need to fade)
      const active = activeChunksRef.current;
      for (const key of active) {
        if (wantedChunks.has(key)) continue;
        // Parse chunk coords to check distance
        const [cxs, czs] = key.split(',');
        const kcx = parseInt(cxs, 10);
        const kcz = parseInt(czs, 10);
        const ddx = kcx - camCx;
        const ddz = kcz - camCz;
        const cdSq = ddx * ddx + ddz * ddz;

        if (cdSq > killDistSq) {
          // Far away → instant kill (no fade needed, invisible to player)
          for (let i = 0; i < npcs.length; i++) {
            if (npcs[i].alive && npcs[i].chunkKey === key) {
              npcs[i].alive = false;
            }
          }
        } else {
          // Near border → fade out smoothly
          for (let i = 0; i < npcs.length; i++) {
            if (npcs[i].alive && !npcs[i].fadeOut && npcs[i].chunkKey === key) {
              npcs[i].fadeOut = true;
              npcs[i].fadeTimer = 0;
            }
          }
        }
        active.delete(key);
      }

      // ── Phase B: Also instantly kill any individual NPC that wandered far ──
      for (let i = 0; i < npcs.length; i++) {
        const n = npcs[i];
        if (!n.alive) continue;
        const ndx = (n.x / chunkWorldSize) - camCx;
        const ndz = (n.z / chunkWorldSize) - camCz;
        const nDistSq = ndx * ndx + ndz * ndz;
        if (nDistSq > killDistSq) {
          n.alive = false; // instant kill
        } else if (!n.fadeOut && nDistSq > distSq) {
          n.fadeOut = true;
          n.fadeTimer = 0;
        }
      }

      // ── Phase C: Spawn NPCs for new chunks ──
      // Per-chunk count: npcMaxPerChunk × biome densityMul × npcDensity
      const perChunk = Math.max(0, Math.round(npcMaxPerChunk * cfg.densityMul * npcDensity));

      // Count only non-fading NPCs for capacity
      let liveCount = 0;
      for (let i = 0; i < npcs.length; i++) {
        if (npcs[i].alive && !npcs[i].fadeOut) liveCount++;
      }
      let remaining = MAX_NPCS - liveCount;

      for (const key of wantedChunks) {
        if (active.has(key) || remaining <= 0) continue;

        const [cxs, czs] = key.split(',');
        const ccx = parseInt(cxs, 10);
        const ccz = parseInt(czs, 10);

        // Deterministic RNG seeded by chunk coords
        const seed = ccx * 73856093 + ccz * 19349663;
        const rng = mulberry32(seed);

        const count = Math.min(perChunk, remaining);
        let spawned = 0;

        for (let i = 0; i < count; i++) {
          const pos = trySpawnInChunk(ccx, ccz, rng, cache);
          if (!pos) continue;

          const heading = rng() * Math.PI * 2;
          const speed = (WALK_SPEED_MIN + rng() * (WALK_SPEED_MAX - WALK_SPEED_MIN)) * cfg.speedMult;
          const npc: NpcState = {
            x: pos.x, z: pos.z, y: pos.y,
            heading, targetHeading: heading,
            speed: 0, targetSpeed: speed,
            moveTimer: MOVE_MIN + rng() * (MOVE_MAX - MOVE_MIN),
            moving: true, age: 0, fadeOut: false, fadeTimer: 0,
            walkPhase: rng() * Math.PI * 2, alive: true,
            hairColor: HAIR_COLORS[Math.floor(rng() * HAIR_COLORS.length)],
            colorShift: (rng() - 0.5) * 0.1,
            chunkKey: key,
          };
          // Find a free slot (dead NPC or append)
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
        // Smooth heading interpolation
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
    const m = new THREE.Matrix4();
    const rotM = new THREE.Matrix4();
    const scaleM = new THREE.Matrix4();
    const swingM = new THREE.Matrix4();
    const c = new THREE.Color();
    let idx = 0;
    const isNight = timeRef?.current.isNight ?? false;
    const nightMul = isNight ? 0.4 : 1.0;

    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];
      if (!n.alive) continue;

      let opacity = 1.0;
      if (n.age < FADE_DURATION) opacity = n.age / FADE_DURATION;
      if (n.fadeOut) opacity = Math.max(0, 1 - n.fadeTimer / FADE_DURATION);

      const ch = Math.cos(n.heading);
      const sh = Math.sin(n.heading);
      const speedRatio = Math.min(1, n.speed / WALK_SPEED_MAX);
      const swingAmt = n.moving
        ? Math.sin(n.walkPhase) * ARM_SWING_AMOUNT * speedRatio
        : Math.sin(n.walkPhase) * ARM_SWING_AMOUNT * 0.05;

      for (let p = 0; p < BODY_PARTS.length; p++) {
        if (idx >= TOTAL_INSTANCES) break;
        const part = BODY_PARTS[p];

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

        rotM.makeRotationY(n.heading);
        if (animSwing !== 0) {
          swingM.makeRotationX(animSwing);
          rotM.multiply(swingM);
        }
        scaleM.makeScale(sx, sy, sz);
        m.copy(rotM);
        m.multiply(scaleM);
        m.elements[12] = n.x + rx;
        m.elements[13] = n.y + ly;
        m.elements[14] = n.z + rz;

        mesh.setMatrixAt(idx, m);

        const shift = n.colorShift;
        switch (part.colorType) {
          case 0: c.copy(colors.skin); break;
          case 1: c.copy(colors.shirt); c.offsetHSL(shift, 0, shift * 0.5); break;
          case 2: c.copy(colors.pants); c.offsetHSL(shift * 0.5, 0, shift * 0.3); break;
          case 3: c.set(n.hairColor); break;
        }
        c.multiplyScalar(nightMul * opacity);
        mesh.setColorAt(idx, c);
        idx++;
      }
    }

    // Hide unused instances
    const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let z = idx; z < TOTAL_INSTANCES; z++) mesh.setMatrixAt(z, zeroMatrix);

    mesh.count = TOTAL_INSTANCES;
    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, mat, TOTAL_INSTANCES]} frustumCulled={false} />
  );
}
