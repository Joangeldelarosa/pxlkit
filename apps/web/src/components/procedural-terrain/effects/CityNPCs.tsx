/* ═══════════════════════════════════════════════════════════════
 *  City NPCs — voxel pedestrians that walk on city sidewalks
 *
 *  Scale system: NPCs use a smaller voxel scale (NPC_SCALE × VOXEL_SIZE)
 *  to allow detailed humanoid figures built from a 5×3×8 voxel grid
 *  placed realistically on regular-sized streets and sidewalks.
 *
 *  Features:
 *  - Multiple NPC archetypes with distinct color palettes
 *  - Sidewalk-aware navigation using classifyCityCell
 *  - Behavioral states: walking, pausing, turning, chatting
 *  - Spawn/despawn lifecycle tied to camera proximity
 *  - InstancedMesh rendering for GPU efficiency
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { classifyCityCell } from '../city/layout';
import { getBiome } from '../utils/biomes';
import { TimeContext } from '../rendering/DayNightCycle';

/* ── Scale & Constants ── */
const NPC_SCALE = 0.2;                    // NPC voxels are 0.2× the world voxel size
const NPC_VS = VOXEL_SIZE * NPC_SCALE;    // actual NPC mini-voxel size in world units
const MAX_NPCS = 40;                       // max simultaneous NPCs
const SPAWN_CHECK_INTERVAL = 1.5;          // seconds between spawn checks
const NPC_SPAWN_RADIUS = 30;               // voxel units from camera to spawn
const NPC_DESPAWN_RADIUS = 45;             // remove when beyond this
const WALK_SPEED_MIN = 0.6;               // world units/sec
const WALK_SPEED_MAX = 1.4;
const PAUSE_MIN = 1.0;                     // seconds to pause
const PAUSE_MAX = 4.0;
const WALK_MIN = 3.0;                      // seconds to walk before pausing
const WALK_MAX = 10.0;
const CHAT_DISTANCE = 1.5;                 // world units — how close to start chatting
const CHAT_DURATION_MIN = 3.0;
const CHAT_DURATION_MAX = 8.0;
const TURN_SPEED = 3.0;                    // radians/sec

/* ── NPC Archetype Definitions ── */
/* Each NPC is a 3-wide × 8-tall voxel figure built from mini-voxels.
 * Body parts: legs(0-1), torso(2-4), arms(2-4 sides), head(5-7)
 * Colors are defined per archetype for variety. */

interface NPCVoxel { dx: number; dy: number; dz: number; color: string }

interface NPCArchetype {
  name: string;
  voxels: NPCVoxel[];
}

function buildHumanoid(
  skinColor: string,
  hairColor: string,
  shirtColor: string,
  pantsColor: string,
  shoeColor: string,
): NPCVoxel[] {
  const v: NPCVoxel[] = [];

  // Shoes/feet (y=0)
  v.push({ dx: -1, dy: 0, dz: 0, color: shoeColor });
  v.push({ dx: 1, dy: 0, dz: 0, color: shoeColor });

  // Legs (y=1-2)
  for (let y = 1; y <= 2; y++) {
    v.push({ dx: -1, dy: y, dz: 0, color: pantsColor });
    v.push({ dx: 1, dy: y, dz: 0, color: pantsColor });
  }

  // Torso (y=3-5)
  for (let y = 3; y <= 5; y++) {
    for (let x = -1; x <= 1; x++) {
      v.push({ dx: x, dy: y, dz: 0, color: shirtColor });
    }
  }

  // Arms (y=3-5, at x=-2 and x=2)
  for (let y = 3; y <= 5; y++) {
    v.push({ dx: -2, dy: y, dz: 0, color: y >= 5 ? skinColor : shirtColor });
    v.push({ dx: 2, dy: y, dz: 0, color: y >= 5 ? skinColor : shirtColor });
  }

  // Neck (y=6)
  v.push({ dx: 0, dy: 6, dz: 0, color: skinColor });

  // Head (y=7-8) — 3×2×3 block
  for (let y = 7; y <= 8; y++) {
    for (let x = -1; x <= 1; x++) {
      v.push({ dx: x, dy: y, dz: 0, color: skinColor });
      // depth — front and back of head
      if (y === 8) {
        v.push({ dx: x, dy: y, dz: -1, color: skinColor });
      }
    }
  }

  // Hair (top of head y=9)
  for (let x = -1; x <= 1; x++) {
    v.push({ dx: x, dy: 9, dz: 0, color: hairColor });
    v.push({ dx: x, dy: 9, dz: -1, color: hairColor });
  }

  return v;
}

/* Pre-built archetypes */
const ARCHETYPES: NPCArchetype[] = [
  { name: 'business', voxels: buildHumanoid('#e8c49a', '#332211', '#334466', '#222233', '#111111') },
  { name: 'casual',   voxels: buildHumanoid('#d4a574', '#553322', '#cc4444', '#446688', '#664433') },
  { name: 'worker',   voxels: buildHumanoid('#c89670', '#221100', '#dd8833', '#556644', '#443322') },
  { name: 'formal',   voxels: buildHumanoid('#f0d0b0', '#111111', '#222222', '#222222', '#111111') },
  { name: 'sporty',   voxels: buildHumanoid('#d4a574', '#884422', '#ffffff', '#333344', '#cc3333') },
  { name: 'youth',    voxels: buildHumanoid('#e8c49a', '#664433', '#44aa88', '#555577', '#eeeeee') },
  { name: 'elder',    voxels: buildHumanoid('#d4a574', '#cccccc', '#886655', '#554433', '#332211') },
  { name: 'tourist',  voxels: buildHumanoid('#f0d0b0', '#aa6633', '#ff6655', '#99aa88', '#ccaa77') },
];

/* ── NPC State ── */
type NPCBehavior = 'walking' | 'pausing' | 'chatting' | 'turning';

interface NPCState {
  x: number; z: number; y: number;  // world position
  heading: number;                    // radians (direction facing)
  targetHeading: number;
  speed: number;                      // world units/sec
  archetypeIdx: number;
  age: number;
  behavior: NPCBehavior;
  behaviorTimer: number;              // time remaining in current behavior
  chatPartner: number;                // index of NPC they're chatting with, -1 if none
}

/* ── Helpers ── */

/** Sample ground height at a world position from chunk cache */
function sampleGroundHeight(
  cache: Map<string, ChunkVoxelData>,
  worldX: number, worldZ: number,
): number {
  const cx = Math.floor(worldX / (CHUNK_SIZE * VOXEL_SIZE));
  const cz = Math.floor(worldZ / (CHUNK_SIZE * VOXEL_SIZE));
  const data = cache.get(`${cx},${cz}`);
  if (!data) return -1;

  const lx = Math.floor(worldX / VOXEL_SIZE) - cx * CHUNK_SIZE;
  const lz = Math.floor(worldZ / VOXEL_SIZE) - cz * CHUNK_SIZE;
  if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return -1;

  return data.solidHeightMap[lx * CHUNK_SIZE + lz];
}

/** Check if world voxel coordinates are a walkable city surface (sidewalk or road) */
function isWalkable(wx: number, wz: number): boolean {
  const cell = classifyCityCell(wx, wz);
  return cell.isSidewalk || cell.isRoad;
}

/** Deterministic hash for spawn decisions */
function npcHash(a: number, b: number): number {
  let h = (Math.round(a * 100) * 374761393 + Math.round(b * 100) * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */

export function CityNPCs({
  chunkCacheRef,
  npcDensity,
  npcRenderDistance,
  biomeNoise,
  tempNoise,
  cityFreq,
}: {
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
  npcDensity: number;
  npcRenderDistance: number;
  biomeNoise: (x: number, y: number) => number;
  tempNoise: (x: number, y: number) => number;
  cityFreq: number;
}) {
  const { camera } = useThree();
  const timeRef = useContext(TimeContext);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const npcsRef = useRef<NPCState[]>([]);
  const lastSpawnCheck = useRef(0);

  /* ── Pre-compute archetype voxel data ── */
  const maxVoxelsPerNPC = useMemo(() => {
    let max = 0;
    for (const a of ARCHETYPES) max = Math.max(max, a.voxels.length);
    return max;
  }, []);

  const totalInstances = MAX_NPCS * maxVoxelsPerNPC;

  const npcGeo = useMemo(() => new THREE.BoxGeometry(NPC_VS, NPC_VS, NPC_VS), []);
  const npcMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.0 }), []);

  const archetypeData = useMemo(() => {
    const offsets = new Float32Array(ARCHETYPES.length * maxVoxelsPerNPC * 3);
    const colors = new Float32Array(ARCHETYPES.length * maxVoxelsPerNPC * 3);
    const counts: number[] = [];
    const tc = new THREE.Color();

    for (let ai = 0; ai < ARCHETYPES.length; ai++) {
      const arch = ARCHETYPES[ai];
      counts.push(arch.voxels.length);
      for (let vi = 0; vi < arch.voxels.length; vi++) {
        const idx = (ai * maxVoxelsPerNPC + vi) * 3;
        offsets[idx]     = arch.voxels[vi].dx * NPC_VS;
        offsets[idx + 1] = arch.voxels[vi].dy * NPC_VS;
        offsets[idx + 2] = arch.voxels[vi].dz * NPC_VS;
        tc.set(arch.voxels[vi].color);
        colors[idx]     = tc.r;
        colors[idx + 1] = tc.g;
        colors[idx + 2] = tc.b;
      }
    }
    return { offsets, colors, counts };
  }, [maxVoxelsPerNPC]);

  useFrame(({ clock }, delta) => {
    const cache = chunkCacheRef.current;
    if (!cache || !meshRef.current) return;
    if (npcDensity <= 0) {
      meshRef.current.count = 0;
      if (meshRef.current.instanceMatrix) meshRef.current.instanceMatrix.needsUpdate = true;
      return;
    }

    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();
    const npcs = npcsRef.current;
    const camX = camera.position.x;
    const camZ = camera.position.z;
    const { offsets, colors, counts } = archetypeData;

    const maxNpcs = Math.round(MAX_NPCS * npcDensity);
    const despawnDist = npcRenderDistance * CHUNK_SIZE * VOXEL_SIZE;

    /* ═══ 1. SPAWN new NPCs ═══ */
    if (t - lastSpawnCheck.current > SPAWN_CHECK_INTERVAL && npcs.length < maxNpcs) {
      lastSpawnCheck.current = t;

      for (let attempt = 0; attempt < 16; attempt++) {
        const angle = npcHash(t * 100 + attempt, camX * 0.1) * Math.PI * 2;
        const dist = NPC_SPAWN_RADIUS * 0.3 + npcHash(t * 50 + attempt, camZ * 0.1) * NPC_SPAWN_RADIUS * 0.7;
        const sx = camX + Math.cos(angle) * dist * VOXEL_SIZE;
        const sz = camZ + Math.sin(angle) * dist * VOXEL_SIZE;

        // Check if this position is in a city biome
        const voxX = Math.floor(sx / VOXEL_SIZE);
        const voxZ = Math.floor(sz / VOXEL_SIZE);
        const biome = getBiome(biomeNoise, tempNoise, voxX, voxZ, cityFreq);
        if (biome !== 'city' && biome !== 'village') continue;

        // Check if it's walkable (sidewalk or road)
        if (!isWalkable(voxX, voxZ)) continue;

        // Get ground height
        const groundH = sampleGroundHeight(cache, sx, sz);
        if (groundH < 0) continue;

        const archetypeIdx = Math.floor(npcHash(sx * 7, sz * 3) * ARCHETYPES.length);
        const walkSpeed = WALK_SPEED_MIN + npcHash(sx * 11, sz * 13) * (WALK_SPEED_MAX - WALK_SPEED_MIN);

        npcs.push({
          x: sx,
          z: sz,
          y: (groundH + 1) * VOXEL_SIZE,  // stand on top of ground surface
          heading: npcHash(sx, sz) * Math.PI * 2,
          targetHeading: npcHash(sx, sz) * Math.PI * 2,
          speed: walkSpeed,
          archetypeIdx,
          age: 0,
          behavior: 'walking',
          behaviorTimer: WALK_MIN + npcHash(sx * 3, sz * 5) * (WALK_MAX - WALK_MIN),
          chatPartner: -1,
        });
        break;
      }
    }

    /* ═══ 2. UPDATE NPC behavior ═══ */
    for (let ni = npcs.length - 1; ni >= 0; ni--) {
      const npc = npcs[ni];
      npc.age += dt;

      // Despawn if too far or density dropped
      const distToCam = Math.sqrt((npc.x - camX) ** 2 + (npc.z - camZ) ** 2);
      if (distToCam > despawnDist || npc.age > 180 || npcDensity <= 0) {
        // If chatting, free partner
        if (npc.chatPartner >= 0 && npc.chatPartner < npcs.length) {
          const partner = npcs[npc.chatPartner];
          if (partner && partner.chatPartner === ni) {
            partner.chatPartner = -1;
            partner.behavior = 'pausing';
            partner.behaviorTimer = 0.5;
          }
        }
        npcs.splice(ni, 1);
        // Fix chat partner indices after splice
        for (const other of npcs) {
          if (other.chatPartner > ni) other.chatPartner--;
          else if (other.chatPartner === ni) { other.chatPartner = -1; other.behavior = 'pausing'; other.behaviorTimer = 0.5; }
        }
        continue;
      }

      npc.behaviorTimer -= dt;

      switch (npc.behavior) {
        case 'walking': {
          // Check ahead for walkable path
          const lookDist = 2 * VOXEL_SIZE;
          const aheadX = npc.x + Math.cos(npc.heading) * lookDist;
          const aheadZ = npc.z + Math.sin(npc.heading) * lookDist;
          const aheadVX = Math.floor(aheadX / VOXEL_SIZE);
          const aheadVZ = Math.floor(aheadZ / VOXEL_SIZE);

          if (!isWalkable(aheadVX, aheadVZ)) {
            // Hit a non-walkable area — turn around
            npc.behavior = 'turning';
            npc.targetHeading = npc.heading + Math.PI * (0.5 + npcHash(npc.age * 10, ni) * 1.0);
            npc.behaviorTimer = 1.0;
            break;
          }

          // Move forward
          npc.x += Math.cos(npc.heading) * npc.speed * VOXEL_SIZE * dt;
          npc.z += Math.sin(npc.heading) * npc.speed * VOXEL_SIZE * dt;

          // Update Y to ground level
          const newGroundH = sampleGroundHeight(cache, npc.x, npc.z);
          if (newGroundH >= 0) {
            npc.y = (newGroundH + 1) * VOXEL_SIZE;
          }

          // Check for chat opportunities with nearby NPCs
          if (npc.chatPartner < 0) {
            for (let oi = 0; oi < npcs.length; oi++) {
              if (oi === ni) continue;
              const other = npcs[oi];
              if (other.chatPartner >= 0 || other.behavior === 'chatting') continue;
              const ddx = npc.x - other.x, ddz = npc.z - other.z;
              const distSq = ddx * ddx + ddz * ddz;
              if (distSq < CHAT_DISTANCE * CHAT_DISTANCE && npcHash(npc.age + ni, oi) > 0.85) {
                // Start chatting!
                const chatTime = CHAT_DURATION_MIN + npcHash(ni * 7, oi * 11) * (CHAT_DURATION_MAX - CHAT_DURATION_MIN);
                npc.behavior = 'chatting';
                npc.behaviorTimer = chatTime;
                npc.chatPartner = oi;
                // Face each other
                npc.targetHeading = Math.atan2(other.z - npc.z, other.x - npc.x);
                other.behavior = 'chatting';
                other.behaviorTimer = chatTime;
                other.chatPartner = ni;
                other.targetHeading = Math.atan2(npc.z - other.z, npc.x - other.x);
                break;
              }
            }
          }

          // Time to pause?
          if (npc.behaviorTimer <= 0) {
            npc.behavior = 'pausing';
            npc.behaviorTimer = PAUSE_MIN + npcHash(npc.age, ni) * (PAUSE_MAX - PAUSE_MIN);
          }
          break;
        }

        case 'pausing': {
          // Stand still
          if (npc.behaviorTimer <= 0) {
            // Resume walking, possibly in a new direction
            npc.behavior = 'walking';
            npc.behaviorTimer = WALK_MIN + npcHash(npc.age * 2, ni * 3) * (WALK_MAX - WALK_MIN);

            // Slight direction change
            const turnAmount = (npcHash(npc.age * 5, ni * 7) - 0.5) * 1.2;
            npc.targetHeading = npc.heading + turnAmount;

            // Check if new direction is walkable, if not try opposite
            const testX = Math.floor((npc.x + Math.cos(npc.targetHeading) * 2 * VOXEL_SIZE) / VOXEL_SIZE);
            const testZ = Math.floor((npc.z + Math.sin(npc.targetHeading) * 2 * VOXEL_SIZE) / VOXEL_SIZE);
            if (!isWalkable(testX, testZ)) {
              npc.targetHeading = npc.heading + Math.PI; // turn around
            }
          }
          break;
        }

        case 'chatting': {
          // Face partner (already set targetHeading)
          if (npc.behaviorTimer <= 0) {
            // End chat
            npc.behavior = 'pausing';
            npc.behaviorTimer = 0.5 + npcHash(npc.age, ni) * 1.0;
            if (npc.chatPartner >= 0 && npc.chatPartner < npcs.length) {
              const partner = npcs[npc.chatPartner];
              if (partner && partner.chatPartner === ni) {
                partner.chatPartner = -1;
                partner.behavior = 'pausing';
                partner.behaviorTimer = 0.5 + npcHash(partner.age, npc.chatPartner) * 1.0;
              }
            }
            npc.chatPartner = -1;
          }
          break;
        }

        case 'turning': {
          // Interpolate heading
          if (npc.behaviorTimer <= 0) {
            npc.heading = npc.targetHeading;
            npc.behavior = 'walking';
            npc.behaviorTimer = WALK_MIN + npcHash(npc.age * 4, ni) * (WALK_MAX - WALK_MIN);
          }
          break;
        }
      }

      // Smooth heading interpolation
      let headingDiff = npc.targetHeading - npc.heading;
      while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
      while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;
      npc.heading += Math.sign(headingDiff) * Math.min(Math.abs(headingDiff), TURN_SPEED * dt);
    }

    /* ═══ 3. RENDER NPCs to instanced mesh ═══ */
    const mesh = meshRef.current;
    const m = new THREE.Matrix4();
    const rot = new THREE.Matrix4();
    const c = new THREE.Color();
    let voxelCount = 0;

    const isNight = timeRef?.current.isNight ?? false;

    for (const npc of npcs) {
      const ai = npc.archetypeIdx;
      const numVoxels = counts[ai];
      const baseOff = ai * maxVoxelsPerNPC * 3;

      // Walking animation — arm/leg swing
      const isMoving = npc.behavior === 'walking';
      const walkPhase = isMoving ? Math.sin(npc.age * 8) * 0.3 : 0;

      const ch = Math.cos(-npc.heading + Math.PI / 2);
      const sh = Math.sin(-npc.heading + Math.PI / 2);

      for (let vi = 0; vi < numVoxels && voxelCount < totalInstances; vi++) {
        const oi = baseOff + vi * 3;
        let lx = offsets[oi];
        let ly = offsets[oi + 1];
        const lz = offsets[oi + 2];

        // Simple walk animation: swing legs and arms
        if (isMoving) {
          const origDy = ARCHETYPES[ai].voxels[vi].dy;
          const origDx = ARCHETYPES[ai].voxels[vi].dx;
          // Legs (y=0-2): swing forward/back
          if (origDy <= 2) {
            const legSide = origDx < 0 ? 1 : -1;
            lx += Math.sin(npc.age * 8) * legSide * NPC_VS * 0.5 * (origDy < 2 ? 1 : 0.5);
          }
          // Arms (x=-2 or x=2, y=3-5): swing opposite to legs
          if (Math.abs(origDx) >= 2 && origDy >= 3 && origDy <= 5) {
            const armSide = origDx < 0 ? -1 : 1;
            ly += walkPhase * armSide * NPC_VS * 0.3;
          }
        }

        // Rotate by heading (Y-axis)
        const rx = lx * ch - lz * sh;
        const rz = lx * sh + lz * ch;

        m.identity();
        rot.makeRotationY(-npc.heading + Math.PI / 2);
        m.multiply(rot);
        m.elements[12] = npc.x + rx;
        m.elements[13] = npc.y + ly;
        m.elements[14] = npc.z + rz;

        mesh.setMatrixAt(voxelCount, m);
        c.setRGB(colors[oi], colors[oi + 1], colors[oi + 2]);

        // Night-time darkening
        if (isNight) {
          c.multiplyScalar(0.35);
        }
        mesh.setColorAt(voxelCount, c);
        voxelCount++;
      }
    }

    mesh.count = voxelCount;
    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[npcGeo, npcMat, totalInstances]} frustumCulled={false} />
  );
}
