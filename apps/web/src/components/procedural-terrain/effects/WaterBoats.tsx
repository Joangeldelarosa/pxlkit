/* ═══════════════════════════════════════════════════════════════
 *  Water Boats — voxel boats that navigate smoothly over deep water
 *
 *  Features:
 *  - 3 distinct boat models built from mini-voxels (1/3 voxel size)
 *  - Intelligent navigation: boats find and follow deep water areas
 *  - Smooth movement: acceleration, deceleration, curved turning
 *  - Spray particles that increase with speed
 *  - Shore avoidance with gradual deceleration
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { TimeContext } from '../rendering/DayNightCycle';

/* ── Constants ── */
const MINI_VS = VOXEL_SIZE / 3;          // mini-voxel size for boats
const MAX_BOATS = 12;                     // max simultaneous boats
const MAX_SPRAY = 600;                    // max spray particles
const SPAWN_CHECK_INTERVAL = 2;           // seconds between spawn checks
const MIN_WATER_DEPTH = 3;               // minimum water depth in voxels
const SHORE_DETECT_DIST = 3;             // distance in voxels to detect shore ahead
const MAX_SPEED = 2.5;                    // max boat speed (world units/sec)
const ACCEL = 0.8;                        // acceleration rate
const DECEL = 1.5;                        // deceleration rate (braking)
const TURN_SPEED = 1.2;                  // radians/sec turning rate
const BOB_AMPLITUDE = 0.08;              // vertical bobbing
const BOB_SPEED = 2.5;                   // bobbing frequency
const ROLL_AMOUNT = 0.15;               // roll during turns

/* ── Boat model definitions (mini-voxel grids) ── */
interface BoatVoxel { dx: number; dy: number; dz: number; color: string }

function defineBoat(voxels: BoatVoxel[]): BoatVoxel[] { return voxels; }

// Model 1: Fishing boat — small, simple
const FISHING_BOAT = defineBoat((() => {
  const v: BoatVoxel[] = [];
  const hull = '#8B6914';
  const deck = '#C4A55A';
  const trim = '#ffffff';
  // Hull (pointed bow)
  for (let z = -3; z <= 3; z++) {
    const halfW = z <= -2 ? 1 : z <= 0 ? 2 : z >= 2 ? 1 : 2;
    for (let x = -halfW; x <= halfW; x++) {
      v.push({ dx: x, dy: 0, dz: z, color: hull });
      if (Math.abs(x) === halfW || z === -3 || z === 3) {
        v.push({ dx: x, dy: 1, dz: z, color: trim }); // gunwale
      }
    }
  }
  // Cabin
  for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
    v.push({ dx: x, dy: 1, dz: z, color: deck });
    if (z === 1 || Math.abs(x) === 1) v.push({ dx: x, dy: 2, dz: z, color: '#eeddcc' });
  }
  v.push({ dx: 0, dy: 2, dz: 0, color: deck }); // roof
  v.push({ dx: 0, dy: 3, dz: 0, color: deck });
  // Mast
  for (let y = 2; y <= 5; y++) v.push({ dx: 0, dy: y, dz: -1, color: '#888888' });
  v.push({ dx: 0, dy: 5, dz: -1, color: '#ff4444' }); // flag
  return v;
})());

// Model 2: Sailboat — elegant, with sail
const SAILBOAT = defineBoat((() => {
  const v: BoatVoxel[] = [];
  const hull = '#334466';
  const deck = '#aa9966';
  const sail = '#eeeeee';
  // Elongated hull
  for (let z = -4; z <= 4; z++) {
    const halfW = Math.abs(z) >= 3 ? 1 : 2;
    for (let x = -halfW; x <= halfW; x++) {
      v.push({ dx: x, dy: 0, dz: z, color: hull });
      if (Math.abs(x) === halfW || z === -4 || z === 4)
        v.push({ dx: x, dy: 1, dz: z, color: hull });
    }
  }
  // Deck
  for (let z = -3; z <= 3; z++) for (let x = -1; x <= 1; x++)
    v.push({ dx: x, dy: 1, dz: z, color: deck });
  // Mast
  for (let y = 2; y <= 7; y++) v.push({ dx: 0, dy: y, dz: 0, color: '#886644' });
  // Sail (triangular)
  for (let y = 3; y <= 7; y++) {
    const w = 7 - y; // wider at bottom
    for (let z = -w; z <= 0; z++)
      v.push({ dx: 1, dy: y, dz: z, color: sail });
  }
  // Boom
  for (let z = -3; z <= 0; z++) v.push({ dx: 1, dy: 3, dz: z, color: '#886644' });
  return v;
})());

// Model 3: Cargo barge — wide, flat
const CARGO_BARGE = defineBoat((() => {
  const v: BoatVoxel[] = [];
  const hull = '#665544';
  const cargo = '#cc8833';
  const metal = '#888888';
  // Wide flat hull
  for (let z = -3; z <= 3; z++) {
    const halfW = Math.abs(z) >= 3 ? 2 : 3;
    for (let x = -halfW; x <= halfW; x++) {
      v.push({ dx: x, dy: 0, dz: z, color: hull });
      if (Math.abs(x) === halfW || Math.abs(z) === 3)
        v.push({ dx: x, dy: 1, dz: z, color: hull });
    }
  }
  // Deck
  for (let z = -2; z <= 2; z++) for (let x = -2; x <= 2; x++)
    v.push({ dx: x, dy: 1, dz: z, color: metal });
  // Cargo containers
  for (let z = -1; z <= 1; z++) for (let x = -1; x <= 1; x++) {
    v.push({ dx: x, dy: 2, dz: z, color: cargo });
    if (Math.abs(x) <= 1 && Math.abs(z) <= 1)
      v.push({ dx: x, dy: 3, dz: z, color: cargo });
  }
  // Pilot house at stern
  v.push({ dx: 0, dy: 2, dz: 2, color: '#eeddcc' });
  v.push({ dx: 0, dy: 3, dz: 2, color: '#eeddcc' });
  v.push({ dx: 0, dy: 4, dz: 2, color: '#aabbcc' });
  // Smokestack
  v.push({ dx: 1, dy: 2, dz: 2, color: '#555555' });
  v.push({ dx: 1, dy: 3, dz: 2, color: '#555555' });
  v.push({ dx: 1, dy: 4, dz: 2, color: '#444444' });
  return v;
})());

const BOAT_MODELS = [FISHING_BOAT, SAILBOAT, CARGO_BARGE];

/* ── Boat state ── */
interface BoatState {
  x: number; z: number; y: number;   // world position
  heading: number;                      // radians
  targetHeading: number;
  speed: number;
  targetSpeed: number;
  modelIdx: number;
  age: number;
  bobPhase: number;
  turnDir: number;                      // -1, 0, 1
  lastTurnTime: number;
}

/* ── Water depth sampling from chunk data ── */
function sampleWaterInfo(
  cache: Map<string, ChunkVoxelData>,
  worldX: number, worldZ: number,
): { depth: number; waterY: number } {
  const cx = Math.floor(worldX / (CHUNK_SIZE * VOXEL_SIZE));
  const cz = Math.floor(worldZ / (CHUNK_SIZE * VOXEL_SIZE));
  const key = `${cx},${cz}`;
  const data = cache.get(key);
  if (!data) return { depth: 0, waterY: 0 };

  const lx = Math.floor(worldX / VOXEL_SIZE) - cx * CHUNK_SIZE;
  const lz = Math.floor(worldZ / VOXEL_SIZE) - cz * CHUNK_SIZE;
  if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return { depth: 0, waterY: 0 };

  const idx = lx * CHUNK_SIZE + lz;
  const solidH = data.solidHeightMap[idx];
  const wl = data.waterLevelMap[idx];
  // Water exists when solid ground is below the water level
  if (solidH < wl) {
    return { depth: wl - solidH, waterY: wl * VOXEL_SIZE };
  }
  return { depth: 0, waterY: 0 };
}

/* ── Deterministic seeded random for spawn ── */
function pseudoRand(a: number, b: number): number {
  let h = (Math.round(a * 100) * 374761393 + Math.round(b * 100) * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */

export function WaterBoats({
  chunkCacheRef,
  boatDensity,
  boatDistance,
}: {
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
  boatDensity: number;
  boatDistance: number;
}) {
  const { camera } = useThree();
  const timeRef = useContext(TimeContext);
  const boatMeshRef = useRef<THREE.InstancedMesh>(null);
  const sprayRef = useRef<THREE.InstancedMesh>(null);
  const boatsRef = useRef<BoatState[]>([]);
  const lastSpawnCheck = useRef(0);
  /* ── Pre-compute boat voxel data ── */
  const maxBoatVoxels = useMemo(() => {
    let max = 0;
    for (const m of BOAT_MODELS) max = Math.max(max, m.length);
    return max;
  }, []);

  const totalBoatInstances = MAX_BOATS * maxBoatVoxels;

  const boatGeo = useMemo(() => new THREE.BoxGeometry(MINI_VS, MINI_VS, MINI_VS), []);
  const boatMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.6 }), []);
  const sprayGeo = useMemo(() => new THREE.BoxGeometry(MINI_VS * 0.5, MINI_VS * 0.5, MINI_VS * 0.5), []);
  const sprayMat = useMemo(() => new THREE.MeshBasicMaterial({
    transparent: true, opacity: 0.6, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);

  // Pre-compute boat voxel offsets in local space
  const boatVoxelData = useMemo(() => {
    const offsets = new Float32Array(BOAT_MODELS.length * maxBoatVoxels * 3);
    const colors = new Float32Array(BOAT_MODELS.length * maxBoatVoxels * 3);
    const counts: number[] = [];
    const tc = new THREE.Color();

    for (let mi = 0; mi < BOAT_MODELS.length; mi++) {
      const model = BOAT_MODELS[mi];
      counts.push(model.length);
      for (let vi = 0; vi < model.length; vi++) {
        const idx = (mi * maxBoatVoxels + vi) * 3;
        offsets[idx] = model[vi].dx * MINI_VS;
        offsets[idx + 1] = model[vi].dy * MINI_VS;
        offsets[idx + 2] = model[vi].dz * MINI_VS;
        tc.set(model[vi].color);
        colors[idx] = tc.r;
        colors[idx + 1] = tc.g;
        colors[idx + 2] = tc.b;
      }
    }
    return { offsets, colors, counts };
  }, [maxBoatVoxels]);

  /* ── Spray particle state ── */
  const sprayParticles = useRef<{
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
    life: number; maxLife: number;
  }[]>([]);

  useFrame(({ clock }, delta) => {
    const cache = chunkCacheRef.current;
    if (!cache || !boatMeshRef.current || !sprayRef.current) return;
    if (!boatVoxelData) return;

    const dt = Math.min(delta, 0.05); // clamp for stability
    const t = clock.getElapsedTime();
    const boats = boatsRef.current;
    const camX = camera.position.x;
    const camZ = camera.position.z;
    const { offsets, colors, counts } = boatVoxelData;

    /* ═══ 1. SPAWN new boats periodically ═══ */
    // Spawn radius derived from boatDistance (in chunks → world units)
    const spawnRadius = boatDistance * CHUNK_SIZE * VOXEL_SIZE * 0.7;
    const despawnRadius = boatDistance * CHUNK_SIZE * VOXEL_SIZE;
    const maxBoats = Math.round(MAX_BOATS * boatDensity);
    if (boatDensity > 0 && t - lastSpawnCheck.current > SPAWN_CHECK_INTERVAL && boats.length < maxBoats) {
      lastSpawnCheck.current = t;

      // Try random positions around camera to find deep water
      for (let attempt = 0; attempt < 12; attempt++) {
        const angle = pseudoRand(t * 100 + attempt, camX * 0.1) * Math.PI * 2;
        const dist = spawnRadius * 0.4 + pseudoRand(t * 50 + attempt, camZ * 0.1) * spawnRadius * 0.6;
        const sx = camX + Math.cos(angle) * dist * VOXEL_SIZE;
        const sz = camZ + Math.sin(angle) * dist * VOXEL_SIZE;

        const spawnInfo = sampleWaterInfo(cache, sx, sz);
        if (spawnInfo.depth >= MIN_WATER_DEPTH) {
          // Also check surrounding area for navigability
          const aheadInfo = sampleWaterInfo(cache, sx + Math.cos(angle) * 3 * VOXEL_SIZE, sz + Math.sin(angle) * 3 * VOXEL_SIZE);
          if (aheadInfo.depth >= MIN_WATER_DEPTH) {
            boats.push({
              x: sx, z: sz, y: spawnInfo.waterY,
              heading: angle + Math.PI,
              targetHeading: angle + Math.PI,
              speed: 0.5,
              targetSpeed: MAX_SPEED * (0.4 + pseudoRand(sx, sz) * 0.6),
              modelIdx: Math.floor(pseudoRand(sx * 7, sz * 3) * BOAT_MODELS.length),
              age: 0,
              bobPhase: pseudoRand(sx, sz) * Math.PI * 2,
              turnDir: 0,
              lastTurnTime: 0,
            });
            break;
          }
        }
      }
    }

    /* ═══ 2. UPDATE boat navigation ═══ */
    for (let bi = boats.length - 1; bi >= 0; bi--) {
      const b = boats[bi];
      b.age += dt;

      // Despawn if too far or density dropped
      const distToCam = Math.sqrt((b.x - camX) ** 2 + (b.z - camZ) ** 2);
      if (distToCam > despawnRadius || b.age > 120 || boatDensity <= 0) {
        boats.splice(bi, 1);
        continue;
      }

      // Check water depth ahead using real water level data
      const lookDist = SHORE_DETECT_DIST * VOXEL_SIZE;
      const aheadX = b.x + Math.cos(b.heading) * lookDist;
      const aheadZ = b.z + Math.sin(b.heading) * lookDist;
      const infoAhead = sampleWaterInfo(cache, aheadX, aheadZ);
      const infoHere = sampleWaterInfo(cache, b.x, b.z);

      // If boat drifted onto land, despawn it
      if (infoHere.depth <= 0) {
        boats.splice(bi, 1);
        continue;
      }

      // Shore avoidance: steer away from shallow water
      if (infoAhead.depth < MIN_WATER_DEPTH || infoHere.depth < MIN_WATER_DEPTH - 1) {
        // Brake
        b.targetSpeed = Math.max(0.3, b.speed * 0.5);

        // Turn away — check left and right
        if (b.age - b.lastTurnTime > 0.5) {
          const leftX = b.x + Math.cos(b.heading - 0.7) * lookDist;
          const leftZ = b.z + Math.sin(b.heading - 0.7) * lookDist;
          const rightX = b.x + Math.cos(b.heading + 0.7) * lookDist;
          const rightZ = b.z + Math.sin(b.heading + 0.7) * lookDist;
          const infoLeft = sampleWaterInfo(cache, leftX, leftZ);
          const infoRight = sampleWaterInfo(cache, rightX, rightZ);

          b.turnDir = infoLeft.depth > infoRight.depth ? -1 : 1;
          b.targetHeading = b.heading + b.turnDir * (0.5 + pseudoRand(b.age * 10, bi) * 1.0);
          b.lastTurnTime = b.age;
        }
      } else {
        // Open water — cruise speed with gentle course changes
        b.targetSpeed = MAX_SPEED * (0.4 + pseudoRand(b.x * 0.01, b.z * 0.01) * 0.6);

        // Periodic gentle turns for natural movement
        if (b.age - b.lastTurnTime > 3 + pseudoRand(bi * 7, b.age * 0.1) * 4) {
          const turnAmount = (pseudoRand(b.age * 5, bi * 13) - 0.5) * 0.8;
          const newHeading = b.heading + turnAmount;
          // Check if new heading leads to water
          const checkX = b.x + Math.cos(newHeading) * lookDist * 2;
          const checkZ = b.z + Math.sin(newHeading) * lookDist * 2;
          if (sampleWaterInfo(cache, checkX, checkZ).depth >= MIN_WATER_DEPTH) {
            b.targetHeading = newHeading;
          }
          b.lastTurnTime = b.age;
        }
      }

      // Smooth heading interpolation
      let headingDiff = b.targetHeading - b.heading;
      while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
      while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;
      b.heading += Math.sign(headingDiff) * Math.min(Math.abs(headingDiff), TURN_SPEED * dt);

      // Smooth speed interpolation
      if (b.speed < b.targetSpeed) {
        b.speed = Math.min(b.targetSpeed, b.speed + ACCEL * dt);
      } else {
        b.speed = Math.max(b.targetSpeed, b.speed - DECEL * dt);
      }
      b.speed = Math.max(0.1, b.speed); // never fully stop

      // Move
      b.x += Math.cos(b.heading) * b.speed * VOXEL_SIZE * dt;
      b.z += Math.sin(b.heading) * b.speed * VOXEL_SIZE * dt;

      // Water level Y — use real water surface from chunk data
      const bob = Math.sin(t * BOB_SPEED + b.bobPhase) * BOB_AMPLITUDE;
      b.y = infoHere.waterY + bob;

      /* ═══ 3. SPRAY PARTICLES ═══ */
      const speedRatio = b.speed / MAX_SPEED;
      const sprayRate = speedRatio * 15; // particles per second
      if (speedRatio > 0.2 && Math.random() < sprayRate * dt) {
        const sideAngle = b.heading + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
        const sideOffset = (0.5 + Math.random() * 0.5) * VOXEL_SIZE;
        const px = b.x + Math.cos(sideAngle) * sideOffset - Math.cos(b.heading) * VOXEL_SIZE;
        const pz = b.z + Math.sin(sideAngle) * sideOffset - Math.sin(b.heading) * VOXEL_SIZE;

        sprayParticles.current.push({
          x: px, y: b.y + MINI_VS, z: pz,
          vx: Math.cos(sideAngle) * speedRatio * 0.5 + (Math.random() - 0.5) * 0.2,
          vy: 0.5 + Math.random() * speedRatio * 0.8,
          vz: Math.sin(sideAngle) * speedRatio * 0.5 + (Math.random() - 0.5) * 0.2,
          life: 0,
          maxLife: 0.4 + Math.random() * 0.4,
        });
      }
      // Wake behind boat
      if (speedRatio > 0.3 && Math.random() < speedRatio * 8 * dt) {
        const wakeX = b.x - Math.cos(b.heading) * VOXEL_SIZE * 1.5;
        const wakeZ = b.z - Math.sin(b.heading) * VOXEL_SIZE * 1.5;
        sprayParticles.current.push({
          x: wakeX + (Math.random() - 0.5) * VOXEL_SIZE,
          y: b.y,
          z: wakeZ + (Math.random() - 0.5) * VOXEL_SIZE,
          vx: (Math.random() - 0.5) * 0.1,
          vy: 0.1,
          vz: (Math.random() - 0.5) * 0.1,
          life: 0,
          maxLife: 0.6 + Math.random() * 0.3,
        });
      }
    }

    /* ═══ 4. UPDATE spray particles ═══ */
    const spray = sprayParticles.current;
    for (let i = spray.length - 1; i >= 0; i--) {
      const p = spray[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        spray.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vy -= 2 * dt; // gravity
    }
    while (spray.length > MAX_SPRAY) spray.shift();

    /* ═══ 5. RENDER boats to instanced mesh ═══ */
    const boatMesh = boatMeshRef.current;
    const sprayMesh = sprayRef.current;
    const m = new THREE.Matrix4();
    const rot = new THREE.Matrix4();
    const c = new THREE.Color();
    let voxelCount = 0;

    for (const b of boats) {
      const mi = b.modelIdx;
      const numVoxels = counts[mi];
      const baseOff = mi * maxBoatVoxels * 3;

      // Turn-based roll
      let headingDiff2 = b.targetHeading - b.heading;
      while (headingDiff2 > Math.PI) headingDiff2 -= Math.PI * 2;
      while (headingDiff2 < -Math.PI) headingDiff2 += Math.PI * 2;
      const roll = -headingDiff2 * ROLL_AMOUNT;

      // Rotation matrix: Y-axis rotation (heading) + Z-axis roll
      const ch = Math.cos(-b.heading + Math.PI / 2);
      const sh = Math.sin(-b.heading + Math.PI / 2);
      const cr = Math.cos(roll);
      const sr = Math.sin(roll);

      for (let vi = 0; vi < numVoxels && voxelCount < totalBoatInstances; vi++) {
        const oi = baseOff + vi * 3;
        const lx = offsets[oi];
        const ly = offsets[oi + 1];
        const lz = offsets[oi + 2];

        // Rotate local position by heading and roll
        const rx = lx * ch * cr - lz * sh - ly * ch * sr;
        const ry = ly * cr + lx * sr;
        const rz = lx * sh * cr + lz * ch - ly * sh * sr;

        m.identity();
        // Apply heading rotation to the voxel itself
        rot.makeRotationY(-b.heading + Math.PI / 2);
        m.multiply(rot);
        m.elements[12] = b.x + rx;
        m.elements[13] = b.y + ry;
        m.elements[14] = b.z + rz;

        boatMesh.setMatrixAt(voxelCount, m);
        c.setRGB(colors[oi], colors[oi + 1], colors[oi + 2]);

        // Night-time darkening
        if (timeRef?.current.isNight) {
          c.multiplyScalar(0.4);
        }
        boatMesh.setColorAt(voxelCount, c);
        voxelCount++;
      }
    }

    boatMesh.count = voxelCount;
    if (boatMesh.instanceMatrix) boatMesh.instanceMatrix.needsUpdate = true;
    if (boatMesh.instanceColor) boatMesh.instanceColor.needsUpdate = true;

    /* ═══ 6. RENDER spray particles ═══ */
    let sprayCount = 0;
    const white = new THREE.Color(1, 1, 1);

    for (const p of spray) {
      if (sprayCount >= MAX_SPRAY) break;
      const lifeRatio = p.life / p.maxLife;
      const alpha = 1 - lifeRatio; // fade out
      const scale = 0.5 + lifeRatio * 0.5; // grow slightly

      m.identity();
      m.elements[0] = scale; m.elements[5] = scale; m.elements[10] = scale;
      m.elements[12] = p.x;
      m.elements[13] = p.y;
      m.elements[14] = p.z;
      sprayMesh.setMatrixAt(sprayCount, m);

      c.copy(white).multiplyScalar(alpha * 0.8);
      sprayMesh.setColorAt(sprayCount, c);
      sprayCount++;
    }

    sprayMesh.count = sprayCount;
    if (sprayMesh.instanceMatrix) sprayMesh.instanceMatrix.needsUpdate = true;
    if (sprayMesh.instanceColor) sprayMesh.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={boatMeshRef} args={[boatGeo, boatMat, totalBoatInstances]} frustumCulled={false} />
      <instancedMesh ref={sprayRef} args={[sprayGeo, sprayMat, MAX_SPRAY]} frustumCulled={false} />
    </>
  );
}
