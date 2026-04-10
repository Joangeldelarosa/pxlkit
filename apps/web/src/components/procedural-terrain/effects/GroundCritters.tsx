/* ═══════════════════════════════════════════════════════════════
 *  Ground Critters — small voxel humanoid NPCs that walk on terrain
 *
 *  Features:
 *  - Blocky voxel bodies (head, torso, arms, legs) using InstancedMesh
 *  - Walking animation with arm & leg swinging
 *  - Smooth rotation toward movement direction (rotate on own axis)
 *  - Terrain-aware Y positioning via solidHeightMap (no floating)
 *  - Smart spawn/despawn with opacity fade-in/fade-out
 *  - Biome-aware colors and density
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { TimeContext } from '../rendering/DayNightCycle';

/* ── NPC mini-voxel size (1/5 of normal voxel for small blocky characters) ── */
/* Height: head top at (4+2)*NPC_VS + hair = ~0.66 world units */
const NPC_VS = VOXEL_SIZE / 5;

/* ── Constants ── */
const MAX_NPCS = 16;
const SPAWN_RANGE = 12;              // voxel-units radius around camera
const DESPAWN_RANGE = 16;            // remove when beyond this
const FADE_DURATION = 1.5;           // seconds to fade in/out
const WALK_SPEED_MIN = 0.3;
const WALK_SPEED_MAX = 0.9;
const TURN_SPEED = 2.5;              // radians/sec for smooth rotation
const PAUSE_MIN = 1.0;
const PAUSE_MAX = 4.0;
const MOVE_MIN = 2.0;
const MOVE_MAX = 6.0;
const ARM_SWING_SPEED = 8;           // arm/leg swing frequency multiplier
const ARM_SWING_AMOUNT = 0.6;        // radians of arm/leg swing

/* ── Biome NPC config ── */
interface BiomeCritterCfg {
  count: number;
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  speedMult: number;
}

const BIOME_NPC_CONFIG: Record<string, BiomeCritterCfg> = {
  Forest:    { count: 6, skinColor: '#ddb896', shirtColor: '#336633', pantsColor: '#553322', speedMult: 0.8 },
  Plains:    { count: 5, skinColor: '#ddb896', shirtColor: '#5577cc', pantsColor: '#444466', speedMult: 1.0 },
  Desert:    { count: 3, skinColor: '#c8a070', shirtColor: '#ccaa66', pantsColor: '#887744', speedMult: 0.7 },
  Tundra:    { count: 2, skinColor: '#eeddcc', shirtColor: '#7799aa', pantsColor: '#556677', speedMult: 0.6 },
  Ocean:     { count: 2, skinColor: '#c8a070', shirtColor: '#cc6644', pantsColor: '#553333', speedMult: 0.5 },
  City:      { count: 8, skinColor: '#ddb896', shirtColor: '#666666', pantsColor: '#333344', speedMult: 1.2 },
  Mountains: { count: 2, skinColor: '#ddb896', shirtColor: '#998877', pantsColor: '#556655', speedMult: 0.5 },
  Swamp:     { count: 3, skinColor: '#bba888', shirtColor: '#557744', pantsColor: '#444433', speedMult: 0.6 },
  Village:   { count: 5, skinColor: '#ddb896', shirtColor: '#cc8844', pantsColor: '#665533', speedMult: 0.9 },
};

/* ── NPC body part definitions ── */
// colorType: 0=skin, 1=shirt, 2=pants, 3=hair
type ColorType = 0 | 1 | 2 | 3;

interface BodyPart {
  ox: number; oy: number; oz: number;
  sx: number; sy: number; sz: number;
  colorType: ColorType;
  animGroup?: 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';
  pivotY?: number;
}

// Compact blocky humanoid — top of hair at oy(6)+sy(0.6)=6.6 NPC_VS ≈ 0.66 world units
const BODY_PARTS: BodyPart[] = [
  // Head (2×2×2) on top of torso
  { ox: 0, oy: 4, oz: 0, sx: 2, sy: 2, sz: 2, colorType: 0 },
  // Hair
  { ox: 0, oy: 6, oz: 0, sx: 2, sy: 0.6, sz: 2, colorType: 3 },
  // Torso (2×2×1)
  { ox: 0, oy: 2, oz: 0, sx: 2, sy: 2, sz: 1, colorType: 1 },
  // Left arm (0.8×2×0.8) — swings forward/back
  { ox: -1.4, oy: 2, oz: 0, sx: 0.8, sy: 2, sz: 0.8, colorType: 1, animGroup: 'leftArm', pivotY: 2 },
  // Right arm
  { ox: 1.4, oy: 2, oz: 0, sx: 0.8, sy: 2, sz: 0.8, colorType: 1, animGroup: 'rightArm', pivotY: 2 },
  // Left leg (0.8×2×0.8)
  { ox: -0.5, oy: 0, oz: 0, sx: 0.8, sy: 2, sz: 0.8, colorType: 2, animGroup: 'leftLeg', pivotY: 2 },
  // Right leg
  { ox: 0.5, oy: 0, oz: 0, sx: 0.8, sy: 2, sz: 0.8, colorType: 2, animGroup: 'rightLeg', pivotY: 2 },
];

const VOXELS_PER_NPC = BODY_PARTS.length;
const TOTAL_INSTANCES = MAX_NPCS * VOXELS_PER_NPC;

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
}

/* ── Terrain height sampling ── */
function getSolidHeight(cache: Map<string, ChunkVoxelData>, worldX: number, worldZ: number): number {
  const vx = worldX / VOXEL_SIZE;
  const vz = worldZ / VOXEL_SIZE;
  const cx = Math.floor(vx / CHUNK_SIZE);
  const cz = Math.floor(vz / CHUNK_SIZE);
  const data = cache.get(`${cx},${cz}`);
  if (!data) return -1;
  const lx = Math.floor(vx - cx * CHUNK_SIZE);
  const lz = Math.floor(vz - cz * CHUNK_SIZE);
  if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return -1;
  return data.solidHeightMap[lx * CHUNK_SIZE + lz];
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

const HAIR_COLORS = ['#332211', '#443322', '#554433', '#221100', '#665544', '#887766', '#aa6633', '#cc9944'];

/* ═══════════════ MAIN COMPONENT ═══════════════ */

export function GroundCritters({
  biome,
  intensity,
  chunkCacheRef,
}: {
  biome: string;
  intensity: number;
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
}) {
  const { camera } = useThree();
  const timeRef = useContext(TimeContext);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const npcsRef = useRef<NpcState[]>([]);
  const spawnTimerRef = useRef(0);

  const cfg = BIOME_NPC_CONFIG[biome] || BIOME_NPC_CONFIG.Plains;
  const activeMax = Math.max(0, Math.round(cfg.count * intensity));

  const colorsRef = useRef({
    skin: new THREE.Color(cfg.skinColor),
    shirt: new THREE.Color(cfg.shirtColor),
    pants: new THREE.Color(cfg.pantsColor),
  });
  colorsRef.current.skin.set(cfg.skinColor);
  colorsRef.current.shirt.set(cfg.shirtColor);
  colorsRef.current.pants.set(cfg.pantsColor);

  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ transparent: true, depthWrite: true }), []);

  /* ── Try to find a valid spawn position on solid ground ── */
  function trySpawnPosition(camX: number, camZ: number, cache: Map<string, ChunkVoxelData>): { x: number; z: number; y: number } | null {
    for (let attempt = 0; attempt < 8; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = SPAWN_RANGE * 0.4 + Math.random() * SPAWN_RANGE * 0.5;
      const sx = camX + Math.cos(angle) * dist;
      const sz = camZ + Math.sin(angle) * dist;

      const solidH = getSolidHeight(cache, sx, sz);
      if (solidH < 0) continue;

      const waterL = getWaterLevel(cache, sx, sz);
      if (solidH < waterL) continue;

      // Avoid steep terrain
      const hL = getSolidHeight(cache, sx - VOXEL_SIZE, sz);
      const hR = getSolidHeight(cache, sx + VOXEL_SIZE, sz);
      const hF = getSolidHeight(cache, sx, sz - VOXEL_SIZE);
      const hB = getSolidHeight(cache, sx, sz + VOXEL_SIZE);
      if (hL < 0 || hR < 0 || hF < 0 || hB < 0) continue;
      if (Math.max(Math.abs(solidH - hL), Math.abs(solidH - hR), Math.abs(solidH - hF), Math.abs(solidH - hB)) > 2) continue;

      return { x: sx, z: sz, y: solidH * VOXEL_SIZE };
    }
    return null;
  }

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const cache = chunkCacheRef.current;
    if (!mesh || !cache) return;

    const dt = Math.min(delta, 0.05);
    const npcs = npcsRef.current;
    const camX = camera.position.x;
    const camZ = camera.position.z;

    /* ═══ 1. SPAWN ═══ */
    spawnTimerRef.current += dt;
    if (spawnTimerRef.current > 0.5) {
      spawnTimerRef.current = 0;
      const aliveCount = npcs.filter(n => n.alive).length;
      if (aliveCount < activeMax && aliveCount < MAX_NPCS) {
        const pos = trySpawnPosition(camX, camZ, cache);
        if (pos) {
          const heading = Math.random() * Math.PI * 2;
          const speed = (WALK_SPEED_MIN + Math.random() * (WALK_SPEED_MAX - WALK_SPEED_MIN)) * cfg.speedMult;
          const npc: NpcState = {
            x: pos.x, z: pos.z, y: pos.y,
            heading, targetHeading: heading,
            speed: 0, targetSpeed: speed,
            moveTimer: MOVE_MIN + Math.random() * (MOVE_MAX - MOVE_MIN),
            moving: true, age: 0, fadeOut: false, fadeTimer: 0,
            walkPhase: Math.random() * Math.PI * 2, alive: true,
            hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
            colorShift: (Math.random() - 0.5) * 0.1,
          };
          const slot = npcs.findIndex(n => !n.alive);
          if (slot >= 0) npcs[slot] = npc;
          else if (npcs.length < MAX_NPCS) npcs.push(npc);
        }
      }
    }

    /* ═══ 2. UPDATE ═══ */
    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];
      if (!n.alive) continue;
      n.age += dt;

      // Despawn check
      const dx = n.x - camX;
      const dz = n.z - camZ;
      if (dx * dx + dz * dz > DESPAWN_RANGE * DESPAWN_RANGE && !n.fadeOut) {
        n.fadeOut = true;
        n.fadeTimer = 0;
      }
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

        // Accelerate
        if (n.speed < n.targetSpeed) n.speed = Math.min(n.speed + 2.0 * dt, n.targetSpeed);

        // Move in facing direction (sin/cos maps heading to X/Z world axes)
        const newX = n.x + Math.sin(n.heading) * n.speed * dt;
        const newZ = n.z + Math.cos(n.heading) * n.speed * dt;

        const newH = getSolidHeight(cache, newX, newZ);
        const newW = getWaterLevel(cache, newX, newZ);

        if (newH >= 0 && newH >= newW && Math.abs(newH * VOXEL_SIZE - n.y) <= VOXEL_SIZE * 1.5) {
          n.x = newX;
          n.z = newZ;
          n.y += (newH * VOXEL_SIZE - n.y) * Math.min(1, dt * 8);
        } else {
          // Blocked — turn around
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

        // Track terrain while standing
        const standH = getSolidHeight(cache, n.x, n.z);
        if (standH >= 0) n.y += (standH * VOXEL_SIZE - n.y) * Math.min(1, dt * 8);

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

      // Y-axis rotation: heading=0 → facing +Z, matches movement dir (sin(h), cos(h))
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

        // Part center in local NPC space
        let lx = part.ox * NPC_VS;
        let ly = (part.oy + part.sy * 0.5) * NPC_VS;
        let lz = part.oz * NPC_VS;

        // Swing animation around pivot (top of limb, in forward/back axis)
        if (animSwing !== 0 && part.pivotY !== undefined) {
          const pivotWorldY = (part.oy + part.pivotY) * NPC_VS;
          const relY = ly - pivotWorldY;
          const cosS = Math.cos(animSwing);
          const sinS = Math.sin(animSwing);
          ly = pivotWorldY + relY * cosS - lz * sinS;
          lz = lz * cosS + relY * sinS;
        }

        // Rotate by NPC heading (Y-axis)
        const rx = lx * ch + lz * sh;
        const rz = -lx * sh + lz * ch;

        // Build instance matrix: rotation + scale + position
        const sx = part.sx * NPC_VS;
        const sy = part.sy * NPC_VS;
        const sz = part.sz * NPC_VS;

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

        // Color selection with per-NPC variation
        const shift = n.colorShift;
        switch (part.colorType) {
          case 0: c.copy(colorsRef.current.skin); break;
          case 1: c.copy(colorsRef.current.shirt); c.offsetHSL(shift, 0, shift * 0.5); break;
          case 2: c.copy(colorsRef.current.pants); c.offsetHSL(shift * 0.5, 0, shift * 0.3); break;
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
