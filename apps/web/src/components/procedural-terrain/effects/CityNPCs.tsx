/* ═══════════════════════════════════════════════════════════════
 *  City NPCs — Ultra-dense, hyper-natural voxel pedestrians
 *
 *  Scale: NPC_SCALE 0.06× → extremely small but highly detailed.
 *  Up to 200 NPCs with collision avoidance, lane discipline,
 *  road-crossing logic, sidewalk preference, waiting at crosswalks,
 *  standing idle groups, and smooth fade-in/out.
 *
 *  Features:
 *  - 12 unique archetypes with accessories (hats, bags, ties, etc.)
 *  - Bone-tagged voxels for per-limb pendulum animation
 *  - Natural walking: hip sway, arm swing, head bob, breathing idle
 *  - NPC-NPC collision avoidance (separation steering)
 *  - Lane discipline: walk on the right side of sidewalks
 *  - Road-crossing behavior: NPCs briefly cross roads, prefer sidewalks
 *  - Building avoidance: NEVER enters building footprints
 *  - Water/terrain-aware: NEVER spawns on water
 *  - Fade-in/fade-out opacity for smooth spawn/despawn (no popping)
 *  - World-change detection: clears all NPCs on seed change
 *  - Rich behaviors: stroll, walk, hurry, phone, window-shop, chat,
 *    waiting at crosswalk, standing idle
 *  - Night-time: fewer NPCs, dusk/dawn lighting
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo, useContext, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { classifyCityCell } from '../city/layout';
import { getBiome } from '../utils/biomes';
import { TimeContext } from '../rendering/DayNightCycle';

/* ── Scale & Constants ── */
const NPC_SCALE = 0.06;                   // 6% of world voxel — tiny but highly detailed
const NPC_VS = VOXEL_SIZE * NPC_SCALE;    // ~0.03 world units per NPC voxel
const MAX_NPCS = 200;                     // massive crowd density
const SPAWN_CHECK_INTERVAL = 0.3;         // spawn check every 0.3s for rapid population
const SPAWN_BATCH = 4;                    // spawn up to 4 NPCs per check
const NPC_SPAWN_RADIUS_MIN = 6;           // min voxel dist from camera (nearby)
const NPC_SPAWN_RADIUS_MAX = 50;          // max voxel dist (far for populated feel)
const FADE_IN_TIME = 1.2;                 // seconds to fade in
const FADE_OUT_DIST_START = 0.75;         // start fading at 75% of despawn dist
const WALK_SPEED_STROLL = 0.25;
const WALK_SPEED_NORMAL = 0.55;
const WALK_SPEED_HURRY = 0.95;
const PAUSE_MIN = 2.0;
const PAUSE_MAX = 6.0;
const WALK_MIN = 5.0;
const WALK_MAX = 16.0;
const CHAT_DISTANCE_SQ = 0.8 * 0.8;      // closer chat distance for small NPCs
const CHAT_DURATION_MIN = 3.0;
const CHAT_DURATION_MAX = 10.0;
const TURN_SPEED = 5.0;                   // radians/sec (snappy turning)
const COLLISION_RADIUS = 0.25;            // NPC-NPC collision avoidance radius (world units)
const COLLISION_RADIUS_SQ = COLLISION_RADIUS * COLLISION_RADIUS;
const SEPARATION_FORCE = 3.0;             // how strongly NPCs push apart
const CROSSWALK_WAIT_MIN = 1.5;
const CROSSWALK_WAIT_MAX = 4.0;

/* ═══════════════════════════════════════════════════════════════
 *  Bone-tagged Voxel Humanoid Builder
 * ═══════════════════════════════════════════════════════════════ */
type BoneName = 'lfoot' | 'rfoot' | 'lleg' | 'rleg' | 'hip' | 'torso' | 'larm' | 'rarm' | 'neck' | 'head' | 'hair' | 'acc';

interface NPCVoxel {
  dx: number; dy: number; dz: number;
  color: string;
  bone: BoneName;
}

interface NPCArchetype {
  name: string;
  voxels: NPCVoxel[];
}

function buildDetailedHumanoid(
  skin: string, hair: string, shirt: string, pants: string, shoes: string,
  opts: {
    hat?: string; hatStyle?: 'cap' | 'beanie' | 'fedora';
    bag?: string; bagSide?: 'left' | 'right' | 'back';
    tie?: string; skirt?: boolean; sleeves?: 'short' | 'long';
    hairStyle?: 'short' | 'long' | 'ponytail' | 'bald';
    belt?: string;
  } = {},
): NPCVoxel[] {
  const v: NPCVoxel[] = [];
  const { hat, hatStyle, bag, bagSide = 'right', tie, skirt, sleeves = 'long', hairStyle = 'short', belt } = opts;
  const p = (dx: number, dy: number, dz: number, color: string, bone: BoneName) => v.push({ dx, dy, dz, color, bone });

  // ── SHOES (y=0-1) ──
  p(1, 0, 0, shoes, 'rfoot'); p(1, 0, 1, shoes, 'rfoot'); p(2, 0, 0, shoes, 'rfoot');
  p(1, 1, 0, shoes, 'rfoot'); p(1, 1, 1, shoes, 'rfoot');
  p(-1, 0, 0, shoes, 'lfoot'); p(-1, 0, 1, shoes, 'lfoot'); p(-2, 0, 0, shoes, 'lfoot');
  p(-1, 1, 0, shoes, 'lfoot'); p(-1, 1, 1, shoes, 'lfoot');

  // ── LEGS (y=2-5) ──
  const legC = skirt ? shirt : pants;
  for (let y = 2; y <= 5; y++) {
    p(1, y, 0, legC, 'rleg'); if (y <= 3) p(1, y, -1, legC, 'rleg');
    p(-1, y, 0, legC, 'lleg'); if (y <= 3) p(-1, y, -1, legC, 'lleg');
  }

  // Skirt
  if (skirt) { for (let y = 4; y <= 6; y++) for (let x = -2; x <= 2; x++) { p(x, y, 0, shirt, 'hip'); if (y <= 5) p(x, y, -1, shirt, 'hip'); } }

  // Belt
  if (belt) for (let x = -1; x <= 1; x++) p(x, 6, 0, belt, 'hip');

  // ── HIP (y=6) ──
  for (let x = -1; x <= 1; x++) { p(x, 6, 0, pants, 'hip'); p(x, 6, -1, pants, 'hip'); }

  // ── TORSO (y=7-10) ──
  for (let y = 7; y <= 10; y++) {
    for (let x = -1; x <= 1; x++) { p(x, y, 0, shirt, 'torso'); p(x, y, -1, shirt, 'torso'); }
    if (y >= 9) { p(-2, y, 0, shirt, 'torso'); p(2, y, 0, shirt, 'torso'); } // shoulders
  }

  // Tie
  if (tie) { p(0, 9, 1, tie, 'torso'); p(0, 8, 1, tie, 'torso'); p(0, 7, 1, tie, 'torso'); }

  // ── ARMS (y=5-10) ──
  for (let y = 5; y <= 10; y++) {
    const armC = sleeves === 'long' || y >= 9 ? shirt : (y >= 7 ? shirt : skin);
    p(3, y, 0, y <= 6 ? skin : armC, 'rarm');
    p(-3, y, 0, y <= 6 ? skin : armC, 'larm');
  }

  // ── NECK (y=11) ──
  p(0, 11, 0, skin, 'neck');

  // ── HEAD (y=12-14) ──
  for (let y = 12; y <= 14; y++) for (let x = -1; x <= 1; x++) {
    p(x, y, 0, skin, 'head'); p(x, y, -1, skin, 'head');
    if (y === 13) p(x, y, 1, skin, 'head');
  }
  p(-1, 13, 1, '#222244', 'head'); p(1, 13, 1, '#222244', 'head'); // eyes

  // ── HAIR ──
  if (hairStyle !== 'bald') {
    for (let x = -1; x <= 1; x++) { p(x, 15, 0, hair, 'hair'); p(x, 15, -1, hair, 'hair'); }
    p(-2, 14, 0, hair, 'hair'); p(2, 14, 0, hair, 'hair');
    p(-2, 13, 0, hair, 'hair'); p(2, 13, 0, hair, 'hair');
    for (let x = -1; x <= 1; x++) { p(x, 14, -2, hair, 'hair'); p(x, 13, -2, hair, 'hair'); }
  }
  if (hairStyle === 'long') for (let x = -1; x <= 1; x++) { p(x, 12, -2, hair, 'hair'); p(x, 11, -2, hair, 'hair'); p(x, 10, -2, hair, 'hair'); }
  if (hairStyle === 'ponytail') { p(0, 14, -2, hair, 'hair'); p(0, 13, -2, hair, 'hair'); p(0, 12, -3, hair, 'hair'); p(0, 11, -3, hair, 'hair'); }

  // ── HAT ──
  if (hat && hatStyle === 'cap') { for (let x = -2; x <= 2; x++) { p(x, 15, 0, hat, 'acc'); p(x, 15, 1, hat, 'acc'); } p(0, 16, 0, hat, 'acc'); }
  if (hat && hatStyle === 'beanie') for (let x = -1; x <= 1; x++) { p(x, 15, 0, hat, 'acc'); p(x, 16, 0, hat, 'acc'); }
  if (hat && hatStyle === 'fedora') { for (let x = -2; x <= 2; x++) for (let z = -2; z <= 1; z++) p(x, 15, z, hat, 'acc'); for (let x = -1; x <= 1; x++) p(x, 16, 0, hat, 'acc'); }

  // ── BAG ──
  if (bag) {
    const bx = bagSide === 'left' ? -3 : bagSide === 'right' ? 3 : 0;
    const bz = bagSide === 'back' ? -2 : 0;
    p(bx, 7, bz, bag, 'acc'); p(bx, 8, bz, bag, 'acc'); p(bx, 9, bz, bag, 'acc');
    if (bagSide === 'back') { p(bx + 1, 8, bz, bag, 'acc'); p(bx - 1, 8, bz, bag, 'acc'); }
  }

  return v;
}

/* ── 12 Unique Archetypes ── */
const ARCHETYPES: NPCArchetype[] = [
  { name: 'businessman', voxels: buildDetailedHumanoid('#e8c49a', '#332211', '#2a2a3a', '#2a2a3a', '#111111', { tie: '#cc2233', bag: '#3a2a1a', bagSide: 'right', hairStyle: 'short' }) },
  { name: 'businesswoman', voxels: buildDetailedHumanoid('#f0d0b0', '#221111', '#44557a', '#2a2a3a', '#222222', { skirt: true, bag: '#8a4a2a', bagSide: 'left', hairStyle: 'long' }) },
  { name: 'casual_m', voxels: buildDetailedHumanoid('#d4a574', '#553322', '#cc4444', '#446688', '#eeeeee', { hat: '#cc4444', hatStyle: 'cap', sleeves: 'short', hairStyle: 'short' }) },
  { name: 'casual_f', voxels: buildDetailedHumanoid('#e8c49a', '#664433', '#44aa88', '#555577', '#ddccaa', { bag: '#cc8866', bagSide: 'left', sleeves: 'short', hairStyle: 'ponytail' }) },
  { name: 'worker', voxels: buildDetailedHumanoid('#c89670', '#221100', '#ee8822', '#556644', '#664422', { hat: '#ffcc00', hatStyle: 'cap', belt: '#554433', sleeves: 'short' }) },
  { name: 'elder_m', voxels: buildDetailedHumanoid('#d4a574', '#cccccc', '#554433', '#443322', '#222222', { hat: '#443322', hatStyle: 'fedora', hairStyle: 'bald' }) },
  { name: 'elder_f', voxels: buildDetailedHumanoid('#d4a574', '#dddddd', '#886677', '#554455', '#443344', { bag: '#998877', bagSide: 'left', hairStyle: 'long' }) },
  { name: 'sporty', voxels: buildDetailedHumanoid('#d4a574', '#884422', '#ffffff', '#333344', '#cc3333', { hat: '#333344', hatStyle: 'cap', sleeves: 'short' }) },
  { name: 'tourist', voxels: buildDetailedHumanoid('#f0d0b0', '#aa6633', '#ff6655', '#99aa88', '#ccaa77', { hat: '#eedd99', hatStyle: 'fedora', bag: '#222222', bagSide: 'right', sleeves: 'short' }) },
  { name: 'student', voxels: buildDetailedHumanoid('#e8c49a', '#553322', '#6666aa', '#444466', '#ffffff', { bag: '#444466', bagSide: 'back' }) },
  { name: 'hipster', voxels: buildDetailedHumanoid('#e8c49a', '#442211', '#886655', '#333344', '#664433', { hat: '#553322', hatStyle: 'beanie', bag: '#776655', bagSide: 'right' }) },
  { name: 'child', voxels: (() => {
    const v: NPCVoxel[] = [];
    const p = (dx: number, dy: number, dz: number, color: string, bone: BoneName) => v.push({ dx, dy, dz, color, bone });
    const skin = '#f0d0b0', hair = '#aa6633', shirt = '#ff8844', pants = '#4488aa', shoes = '#445566';
    p(1, 0, 0, shoes, 'rfoot'); p(-1, 0, 0, shoes, 'lfoot');
    for (let y = 1; y <= 3; y++) { p(1, y, 0, pants, 'rleg'); p(-1, y, 0, pants, 'lleg'); }
    for (let y = 4; y <= 7; y++) for (let x = -1; x <= 1; x++) p(x, y, 0, shirt, 'torso');
    for (let y = 4; y <= 7; y++) { p(2, y, 0, y >= 6 ? skin : shirt, 'rarm'); p(-2, y, 0, y >= 6 ? skin : shirt, 'larm'); }
    p(2, 3, 0, skin, 'rarm'); p(-2, 3, 0, skin, 'larm');
    p(0, 8, 0, skin, 'neck');
    for (let y = 9; y <= 10; y++) for (let x = -1; x <= 1; x++) { p(x, y, 0, skin, 'head'); p(x, y, -1, skin, 'head'); }
    p(-1, 10, 1, '#222244', 'head'); p(1, 10, 1, '#222244', 'head');
    for (let x = -1; x <= 1; x++) p(x, 11, 0, hair, 'hair');
    return v;
  })() },
];

/* ── Behavior types ── */
type NPCBehavior = 'walking' | 'strolling' | 'hurrying' | 'pausing' | 'chatting' | 'turning'
  | 'phoneLooking' | 'windowShop' | 'waitingCrosswalk' | 'standingIdle';

interface NPCState {
  x: number; z: number; y: number;
  heading: number;
  targetHeading: number;
  speed: number;
  targetSpeed: number;
  archetypeIdx: number;
  age: number;
  behavior: NPCBehavior;
  behaviorTimer: number;
  chatPartner: number;
  walkCycle: number;
  breathPhase: number;
  gesturePhase: number;
  headTilt: number;
  targetHeadTilt: number;
  fadeIn: number;
  prefersSidewalk: boolean;
  /** Lane offset: positive = right side of sidewalk. Used for lane discipline. */
  laneOffset: number;
  /** Whether this NPC is currently crossing a road */
  isCrossingRoad: boolean;
}

/* ── Helpers ── */
function sampleGroundHeight(cache: Map<string, ChunkVoxelData>, worldX: number, worldZ: number): number {
  const cx = Math.floor(worldX / (CHUNK_SIZE * VOXEL_SIZE));
  const cz = Math.floor(worldZ / (CHUNK_SIZE * VOXEL_SIZE));
  const data = cache.get(`${cx},${cz}`);
  if (!data) return -1;
  const lx = Math.floor(worldX / VOXEL_SIZE) - cx * CHUNK_SIZE;
  const lz = Math.floor(worldZ / VOXEL_SIZE) - cz * CHUNK_SIZE;
  if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return -1;
  return data.solidHeightMap[lx * CHUNK_SIZE + lz];
}

function isWaterAt(cache: Map<string, ChunkVoxelData>, worldX: number, worldZ: number): boolean {
  const cx = Math.floor(worldX / (CHUNK_SIZE * VOXEL_SIZE));
  const cz = Math.floor(worldZ / (CHUNK_SIZE * VOXEL_SIZE));
  const data = cache.get(`${cx},${cz}`);
  if (!data) return true;
  const lx = Math.floor(worldX / VOXEL_SIZE) - cx * CHUNK_SIZE;
  const lz = Math.floor(worldZ / VOXEL_SIZE) - cz * CHUNK_SIZE;
  if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return true;
  const idx = lx * CHUNK_SIZE + lz;
  return data.solidHeightMap[idx] < data.waterLevelMap[idx];
}

function getCityCell(wx: number, wz: number) {
  return classifyCityCell(wx, wz);
}

function isWalkable(wx: number, wz: number): boolean {
  const cell = getCityCell(wx, wz);
  return cell.isSidewalk || cell.isRoad;
}

function isSidewalkAt(wx: number, wz: number): boolean {
  return getCityCell(wx, wz).isSidewalk;
}

function isRoadAt(wx: number, wz: number): boolean {
  return getCityCell(wx, wz).isRoad;
}

function isBuildingAt(wx: number, wz: number): boolean {
  return getCityCell(wx, wz).isBuilding;
}

function isIntersectionAt(wx: number, wz: number): boolean {
  return getCityCell(wx, wz).isIntersection;
}

function npcHash(a: number, b: number): number {
  let h = (Math.round(a * 100) * 374761393 + Math.round(b * 100) * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function freeChatPartner(npc: NPCState, npcs: NPCState[], npcIdx: number): void {
  if (npc.chatPartner >= 0 && npc.chatPartner < npcs.length) {
    const partner = npcs[npc.chatPartner];
    if (partner && partner.chatPartner === npcIdx) {
      partner.chatPartner = -1;
      partner.behavior = 'pausing';
      partner.behaviorTimer = 0.5;
    }
  }
}

function fixPartnerIndices(npcs: NPCState[], removedIdx: number): void {
  for (const other of npcs) {
    if (other.chatPartner > removedIdx) other.chatPartner--;
    else if (other.chatPartner === removedIdx) { other.chatPartner = -1; other.behavior = 'pausing'; other.behaviorTimer = 0.5; }
  }
}

/** Find best walkable direction, biased toward sidewalks and away from buildings/water.
 *  Uses 12 directions for finer-grained pathfinding. */
function findWalkableHeading(npc: NPCState, cache: Map<string, ChunkVoxelData>, t: number, idx: number): number {
  let bestAngle = npc.heading;
  let bestScore = -999;
  const DIRS = 12;
  for (let i = 0; i < DIRS; i++) {
    const angle = npc.heading + ((i - DIRS / 2) / DIRS) * Math.PI * 2;
    const testDist = 3 * VOXEL_SIZE;
    const testWX = npc.x + Math.cos(angle) * testDist;
    const testWZ = npc.z + Math.sin(angle) * testDist;
    const vx = Math.floor(testWX / VOXEL_SIZE);
    const vz = Math.floor(testWZ / VOXEL_SIZE);

    // Hard reject: building or water or unwalkable
    if (isBuildingAt(vx, vz)) continue;
    if (!isWalkable(vx, vz)) continue;
    if (isWaterAt(cache, testWX, testWZ)) continue;

    let score = 1;
    // Strong sidewalk preference
    if (isSidewalkAt(vx, vz)) score += 6;
    // Road is ok but less preferred
    else if (isRoadAt(vx, vz)) score += 1;

    // Prefer forward-ish directions (avoid 180° turns)
    let da = angle - npc.heading;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    score += (1 - Math.abs(da) / Math.PI) * 3;

    // Check farther ahead too (2× distance)
    const farWX = npc.x + Math.cos(angle) * testDist * 2;
    const farWZ = npc.z + Math.sin(angle) * testDist * 2;
    const fvx = Math.floor(farWX / VOXEL_SIZE);
    const fvz = Math.floor(farWZ / VOXEL_SIZE);
    if (isSidewalkAt(fvx, fvz)) score += 2;
    if (isBuildingAt(fvx, fvz)) score -= 3;
    if (isWaterAt(cache, farWX, farWZ)) score -= 5;

    // Randomness for variety
    score += npcHash(t * 10 + i, idx + npc.age) * 1.0;

    if (score > bestScore) { bestScore = score; bestAngle = angle; }
  }
  return bestScore >= 0 ? bestAngle : npc.heading + Math.PI;
}

/** Determine the dominant road direction at a position (0=E/W, PI/2=N/S) */
function getRoadAxis(wx: number, wz: number): number {
  const cell = getCityCell(wx, wz);
  if (!cell.isRoad) return 0;
  // Check if this is an E/W road or N/S road by checking neighbors
  const cellN = getCityCell(wx, wz + 1);
  const cellE = getCityCell(wx + 1, wz);
  // If road continues East/West → heading is 0 or PI (along X axis → sin(heading)≈0)
  if (cellE.isRoad && !cellN.isRoad) return 0; // E/W road
  if (!cellE.isRoad && cellN.isRoad) return Math.PI / 2; // N/S road
  return 0; // intersection or ambiguous
}

/* ═══════════════════════════════════════════════════════════════
 *  Per-bone animation transforms
 * ═══════════════════════════════════════════════════════════════ */

interface BoneOffset { dx: number; dy: number; dz: number }

function computeBoneOffset(npc: NPCState, bone: BoneName): BoneOffset {
  const moving = npc.behavior === 'walking' || npc.behavior === 'strolling' || npc.behavior === 'hurrying';
  const idle = npc.behavior === 'pausing' || npc.behavior === 'phoneLooking'
    || npc.behavior === 'windowShop' || npc.behavior === 'waitingCrosswalk'
    || npc.behavior === 'standingIdle';
  const chatting = npc.behavior === 'chatting';
  const wc = npc.walkCycle;
  const sp = npc.speed / WALK_SPEED_NORMAL;

  // Walking gait — dz = forward/back stride (model +Z is front), dx = side sway
  const legAmp = moving ? 0.7 * sp : 0;
  const armAmp = moving ? 0.55 * sp : 0;
  const hipSway = moving ? Math.sin(wc) * NPC_VS * 0.2 * sp : 0;
  const vertBob = moving ? Math.abs(Math.sin(wc * 2)) * NPC_VS * 0.4 * sp : 0;
  const breathe = (idle || chatting) ? Math.sin(npc.breathPhase) * NPC_VS * 0.08 : 0;
  const weightShift = idle ? Math.sin(npc.age * 0.4) * NPC_VS * 0.15 : 0;
  const gestureArm = chatting ? Math.sin(npc.gesturePhase * 2.5) * NPC_VS * 0.8 : 0;

  switch (bone) {
    case 'rfoot': return {
      dx: 0,
      dy: Math.max(0, Math.sin(wc)) * legAmp * NPC_VS * 1.0,
      dz: Math.sin(wc) * legAmp * NPC_VS * 2.5,
    };
    case 'lfoot': return {
      dx: 0,
      dy: Math.max(0, Math.sin(wc + Math.PI)) * legAmp * NPC_VS * 1.0,
      dz: Math.sin(wc + Math.PI) * legAmp * NPC_VS * 2.5,
    };
    case 'rleg': return {
      dx: 0, dy: 0,
      dz: Math.sin(wc) * legAmp * NPC_VS * 1.8,
    };
    case 'lleg': return {
      dx: 0, dy: 0,
      dz: Math.sin(wc + Math.PI) * legAmp * NPC_VS * 1.8,
    };
    case 'hip': return {
      dx: hipSway + weightShift,
      dy: vertBob, dz: 0,
    };
    case 'torso': return {
      dx: hipSway * 0.5 + weightShift * 0.7,
      dy: vertBob + breathe,
      dz: 0,
    };
    case 'rarm': return {
      dx: gestureArm,
      dy: chatting ? Math.abs(gestureArm) * 0.5 : 0,
      dz: Math.sin(wc + Math.PI) * armAmp * NPC_VS * 2.2,
    };
    case 'larm': return {
      dx: -gestureArm * 0.2,
      dy: npc.behavior === 'phoneLooking' ? NPC_VS * 3 : 0,
      dz: Math.sin(wc) * armAmp * NPC_VS * 2.2 + (npc.behavior === 'phoneLooking' ? NPC_VS * 2 : 0),
    };
    case 'neck': return {
      dx: hipSway * 0.3 + weightShift * 0.3,
      dy: vertBob + breathe, dz: 0,
    };
    case 'head': {
      const headBob = moving ? Math.sin(wc * 2 + 0.5) * NPC_VS * 0.2 * sp : 0;
      const phoneTilt = npc.behavior === 'phoneLooking' ? -NPC_VS * 0.8 : 0;
      // Waiting at crosswalk: look left/right
      const crosswalkLook = npc.behavior === 'waitingCrosswalk' ? Math.sin(npc.age * 1.5) * NPC_VS * 0.5 : 0;
      return {
        dx: hipSway * 0.2 + weightShift * 0.2 + npc.headTilt * NPC_VS * 0.3 + crosswalkLook,
        dy: vertBob + headBob + breathe + phoneTilt,
        dz: phoneTilt * 0.3,
      };
    }
    case 'hair': {
      const headBob2 = moving ? Math.sin(wc * 2 + 0.5) * NPC_VS * 0.2 * sp : 0;
      const hairBounce = moving ? Math.sin(wc * 2 + 1) * NPC_VS * 0.15 * sp : 0;
      return {
        dx: hipSway * 0.2,
        dy: vertBob + headBob2 + breathe + hairBounce,
        dz: 0,
      };
    }
    case 'acc': return {
      dx: hipSway * 0.4, dy: vertBob + breathe, dz: 0,
    };
  }
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */

export function CityNPCs({
  chunkCacheRef,
  npcDensity,
  npcRenderDistance,
  biomeNoise,
  tempNoise,
  cityFreq,
  seed,
}: {
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
  npcDensity: number;
  npcRenderDistance: number;
  biomeNoise: (x: number, y: number) => number;
  tempNoise: (x: number, y: number) => number;
  cityFreq: number;
  seed: number;
}) {
  const { camera } = useThree();
  const timeRef = useContext(TimeContext);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const npcsRef = useRef<NPCState[]>([]);
  const lastSpawnCheck = useRef(0);
  const prevSeed = useRef(seed);

  // Clear all NPCs when seed changes (world regeneration)
  useEffect(() => {
    if (prevSeed.current !== seed) {
      npcsRef.current = [];
      prevSeed.current = seed;
    }
  }, [seed]);

  const maxVoxelsPerNPC = useMemo(() => {
    let max = 0;
    for (const a of ARCHETYPES) max = Math.max(max, a.voxels.length);
    return max;
  }, []);

  const totalInstances = MAX_NPCS * maxVoxelsPerNPC;
  const npcGeo = useMemo(() => new THREE.BoxGeometry(NPC_VS, NPC_VS, NPC_VS), []);
  const npcMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0.0 }), []);

  const archetypeData = useMemo(() => {
    const offsets = new Float32Array(ARCHETYPES.length * maxVoxelsPerNPC * 3);
    const colors = new Float32Array(ARCHETYPES.length * maxVoxelsPerNPC * 3);
    const counts: number[] = [];
    const boneNames: BoneName[][] = [];
    const tc = new THREE.Color();

    for (let ai = 0; ai < ARCHETYPES.length; ai++) {
      const arch = ARCHETYPES[ai];
      counts.push(arch.voxels.length);
      const archBones: BoneName[] = [];
      for (let vi = 0; vi < arch.voxels.length; vi++) {
        const idx = (ai * maxVoxelsPerNPC + vi) * 3;
        offsets[idx]     = arch.voxels[vi].dx * NPC_VS;
        offsets[idx + 1] = arch.voxels[vi].dy * NPC_VS;
        offsets[idx + 2] = arch.voxels[vi].dz * NPC_VS;
        tc.set(arch.voxels[vi].color);
        colors[idx]     = tc.r;
        colors[idx + 1] = tc.g;
        colors[idx + 2] = tc.b;
        archBones.push(arch.voxels[vi].bone);
      }
      boneNames.push(archBones);
    }
    return { offsets, colors, counts, boneNames };
  }, [maxVoxelsPerNPC]);

  // Reusable matrix objects
  const _m = useMemo(() => new THREE.Matrix4(), []);
  const _rot = useMemo(() => new THREE.Matrix4(), []);
  const _c = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }, delta) => {
    const cache = chunkCacheRef.current;
    if (!cache || !meshRef.current) return;

    // World change: clear NPCs
    if (prevSeed.current !== seed) {
      npcsRef.current = [];
      prevSeed.current = seed;
    }

    if (npcDensity <= 0) {
      // eslint-disable-next-line react-hooks/immutability
      meshRef.current.count = 0;
      if (meshRef.current.instanceMatrix) meshRef.current.instanceMatrix.needsUpdate = true;
      return;
    }

    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();
    const npcs = npcsRef.current;
    const camX = camera.position.x;
    const camZ = camera.position.z;
    const { offsets, colors, counts, boneNames } = archetypeData;

    const hour = timeRef?.current.hour ?? 12;
    const isNight = timeRef?.current.isNight ?? false;
    // Night: dramatically reduce NPC count
    const nightMul = (hour >= 23 || hour < 5) ? 0.12 : (hour >= 21 || hour < 6) ? 0.35 : (hour >= 20 || hour < 7) ? 0.6 : 1.0;
    const maxNpcs = Math.round(MAX_NPCS * npcDensity * nightMul);
    const despawnDist = npcRenderDistance * CHUNK_SIZE * VOXEL_SIZE;
    const despawnDistSq = despawnDist * despawnDist;
    const fadeStartSq = (despawnDist * FADE_OUT_DIST_START) ** 2;

    /* ═══ 1. SPAWN — batch spawn for rapid population ═══ */
    if (t - lastSpawnCheck.current > SPAWN_CHECK_INTERVAL && npcs.length < maxNpcs) {
      lastSpawnCheck.current = t;

      let spawned = 0;
      for (let attempt = 0; attempt < 40 && spawned < SPAWN_BATCH; attempt++) {
        const angle = npcHash(t * 100 + attempt + spawned * 7, camX * 0.1 + spawned) * Math.PI * 2;
        const dist = NPC_SPAWN_RADIUS_MIN + npcHash(t * 50 + attempt, camZ * 0.1 + spawned) * (NPC_SPAWN_RADIUS_MAX - NPC_SPAWN_RADIUS_MIN);
        const sx = camX + Math.cos(angle) * dist * VOXEL_SIZE;
        const sz = camZ + Math.sin(angle) * dist * VOXEL_SIZE;

        const voxX = Math.floor(sx / VOXEL_SIZE);
        const voxZ = Math.floor(sz / VOXEL_SIZE);

        // MUST be city/village biome
        const biome = getBiome(biomeNoise, tempNoise, voxX, voxZ, cityFreq);
        if (biome !== 'city' && biome !== 'village') continue;

        // MUST be walkable (sidewalk or road) — NOT building
        if (isBuildingAt(voxX, voxZ)) continue;
        if (!isWalkable(voxX, voxZ)) continue;

        // MUST NOT be on water
        if (isWaterAt(cache, sx, sz)) continue;

        // Get ground height
        const groundH = sampleGroundHeight(cache, sx, sz);
        if (groundH < 0) continue;

        // Don't spawn too close to existing NPCs
        let tooClose = false;
        for (let ei = 0; ei < npcs.length && !tooClose; ei++) {
          const dd = (npcs[ei].x - sx) ** 2 + (npcs[ei].z - sz) ** 2;
          if (dd < COLLISION_RADIUS_SQ * 0.5) tooClose = true;
        }
        if (tooClose) continue;

        const archetypeIdx = Math.floor(npcHash(sx * 7, sz * 3) * ARCHETYPES.length);
        const speedRoll = npcHash(sx * 11, sz * 13);
        const baseSpeed = speedRoll < 0.2 ? WALK_SPEED_STROLL : speedRoll > 0.85 ? WALK_SPEED_HURRY : WALK_SPEED_NORMAL;

        // Determine initial behavior: some NPCs start standing idle
        const behaviorRoll = npcHash(sx * 19, sz * 23);
        let baseBehavior: NPCBehavior;
        let baseBehaviorTimer: number;
        if (behaviorRoll < 0.1) {
          // Start standing idle
          baseBehavior = 'standingIdle';
          baseBehaviorTimer = PAUSE_MIN + npcHash(sx * 29, sz * 31) * PAUSE_MAX;
        } else if (behaviorRoll < 0.18) {
          // Start pausing
          baseBehavior = 'pausing';
          baseBehaviorTimer = PAUSE_MIN + npcHash(sx * 41, sz * 43) * (PAUSE_MAX - PAUSE_MIN);
        } else {
          baseBehavior = speedRoll < 0.2 ? 'strolling' : speedRoll > 0.85 ? 'hurrying' : 'walking';
          baseBehaviorTimer = WALK_MIN + npcHash(sx * 3, sz * 5) * (WALK_MAX - WALK_MIN);
        }

        // Initial heading: align to road/sidewalk direction
        let initHeading: number;
        const onRoad = isRoadAt(voxX, voxZ);
        if (onRoad) {
          // Align to road axis
          const axis = getRoadAxis(voxX, voxZ);
          initHeading = axis + (npcHash(sx * 47, sz * 53) > 0.5 ? 0 : Math.PI);
        } else {
          initHeading = npcHash(sx, sz) * Math.PI * 2;
        }

        // Validate initial heading leads to walkable area
        const testWX = sx + Math.cos(initHeading) * 2 * VOXEL_SIZE;
        const testWZ = sz + Math.sin(initHeading) * 2 * VOXEL_SIZE;
        const testVX = Math.floor(testWX / VOXEL_SIZE);
        const testVZ = Math.floor(testWZ / VOXEL_SIZE);
        if (isBuildingAt(testVX, testVZ) || isWaterAt(cache, testWX, testWZ)) {
          initHeading += Math.PI; // try opposite
        }

        const isSidewalk = isSidewalkAt(voxX, voxZ);
        npcs.push({
          x: sx, z: sz,
          y: (groundH + 1) * VOXEL_SIZE,
          heading: initHeading,
          targetHeading: initHeading,
          speed: baseBehavior === 'standingIdle' || baseBehavior === 'pausing' ? 0 : baseSpeed,
          targetSpeed: baseBehavior === 'standingIdle' || baseBehavior === 'pausing' ? 0 : baseSpeed,
          archetypeIdx,
          age: 0,
          behavior: baseBehavior,
          behaviorTimer: baseBehaviorTimer,
          chatPartner: -1,
          walkCycle: npcHash(sx * 17, sz * 19) * Math.PI * 2,
          breathPhase: npcHash(sx * 23, sz * 29) * Math.PI * 2,
          gesturePhase: 0,
          headTilt: 0,
          targetHeadTilt: 0,
          fadeIn: 0,
          prefersSidewalk: npcHash(sx * 31, sz * 37) > 0.1, // 90% prefer sidewalks
          laneOffset: npcHash(sx * 59, sz * 61) * 0.15, // slight lane offset for variety
          isCrossingRoad: false,
        });
        spawned++;
        if (npcs.length >= maxNpcs) break;
      }
    }

    /* ═══ 2. UPDATE ═══ */
    for (let ni = npcs.length - 1; ni >= 0; ni--) {
      const npc = npcs[ni];
      npc.age += dt;

      // Fade in
      if (npc.fadeIn < 1) npc.fadeIn = Math.min(1, npc.fadeIn + dt / FADE_IN_TIME);

      // Despawn check
      const dx2 = (npc.x - camX) ** 2 + (npc.z - camZ) ** 2;
      if (dx2 > despawnDistSq || npc.age > 200) {
        freeChatPartner(npc, npcs, ni);
        npcs.splice(ni, 1);
        fixPartnerIndices(npcs, ni);
        continue;
      }

      // WATER CHECK: immediately despawn any NPC standing on water
      // (can happen when chunks load after NPC spawned, or NPC drifted due to collision)
      if (isWaterAt(cache, npc.x, npc.z)) {
        freeChatPartner(npc, npcs, ni);
        npcs.splice(ni, 1);
        fixPartnerIndices(npcs, ni);
        continue;
      }

      // Trim excess NPCs (remove furthest)
      if (npcs.length > maxNpcs + 5 && ni === npcs.length - 1) {
        freeChatPartner(npc, npcs, ni);
        npcs.splice(ni, 1);
        fixPartnerIndices(npcs, ni);
        continue;
      }

      npc.behaviorTimer -= dt;

      // Animation updates
      const isMoving = npc.behavior === 'walking' || npc.behavior === 'strolling' || npc.behavior === 'hurrying';
      if (isMoving) npc.walkCycle += dt * (3.5 + npc.speed * 5);
      npc.breathPhase += dt * 1.5;
      if (npc.behavior === 'chatting') npc.gesturePhase += dt;

      // Smooth speed interpolation
      const sDiff = npc.targetSpeed - npc.speed;
      if (Math.abs(sDiff) > 0.01) npc.speed += Math.sign(sDiff) * Math.min(Math.abs(sDiff), 2.5 * dt);

      // Smooth head tilt
      const tDiff = npc.targetHeadTilt - npc.headTilt;
      if (Math.abs(tDiff) > 0.01) npc.headTilt += Math.sign(tDiff) * Math.min(Math.abs(tDiff), 2.0 * dt);

      /* ── NPC-NPC COLLISION AVOIDANCE ── */
      if (isMoving) {
        let sepX = 0, sepZ = 0;
        // Only check nearby NPCs (spatial hash could optimize but for 200 NPCs this is fine)
        for (let oi = Math.max(0, ni - 30); oi < Math.min(npcs.length, ni + 30); oi++) {
          if (oi === ni) continue;
          const other = npcs[oi];
          const ddx = npc.x - other.x;
          const ddz = npc.z - other.z;
          const dd = ddx * ddx + ddz * ddz;
          if (dd < COLLISION_RADIUS_SQ && dd > 0.0001) {
            const dist = Math.sqrt(dd);
            const force = (COLLISION_RADIUS - dist) / COLLISION_RADIUS;
            sepX += (ddx / dist) * force * SEPARATION_FORCE;
            sepZ += (ddz / dist) * force * SEPARATION_FORCE;
          }
        }
        // Apply separation as a small position offset
        if (sepX !== 0 || sepZ !== 0) {
          const newX = npc.x + sepX * dt;
          const newZ = npc.z + sepZ * dt;
          const svx = Math.floor(newX / VOXEL_SIZE);
          const svz = Math.floor(newZ / VOXEL_SIZE);
          // Only apply if we don't push into building/water
          if (!isBuildingAt(svx, svz) && !isWaterAt(cache, newX, newZ) && isWalkable(svx, svz)) {
            npc.x = newX;
            npc.z = newZ;
          }
        }
      }

      switch (npc.behavior) {
        case 'walking':
        case 'strolling':
        case 'hurrying': {
          const lookDist = 2 * VOXEL_SIZE;
          const aheadX = npc.x + Math.cos(npc.heading) * lookDist;
          const aheadZ = npc.z + Math.sin(npc.heading) * lookDist;
          const aheadVX = Math.floor(aheadX / VOXEL_SIZE);
          const aheadVZ = Math.floor(aheadZ / VOXEL_SIZE);

          // Hard boundary: building or water or unwalkable
          if (isBuildingAt(aheadVX, aheadVZ) || !isWalkable(aheadVX, aheadVZ) || isWaterAt(cache, aheadX, aheadZ)) {
            npc.behavior = 'turning';
            npc.targetHeading = findWalkableHeading(npc, cache, t, ni);
            npc.behaviorTimer = 0.5;
            npc.targetSpeed = npc.speed * 0.2;
            break;
          }

          // Track if on road vs sidewalk
          const currVX = Math.floor(npc.x / VOXEL_SIZE);
          const currVZ = Math.floor(npc.z / VOXEL_SIZE);
          const onSidewalk = isSidewalkAt(currVX, currVZ);
          const onRoad = isRoadAt(currVX, currVZ);
          npc.isCrossingRoad = onRoad && !npc.isCrossingRoad ? true : npc.isCrossingRoad;

          // Sidewalk steering — actively steer back to sidewalk if on road
          if (npc.prefersSidewalk && onRoad && !isIntersectionAt(currVX, currVZ)) {
            // Look for sidewalk in nearby directions
            for (let di = -2; di <= 2; di++) {
              const testAngle = npc.heading + di * 0.4;
              const slx = Math.floor((npc.x + Math.cos(testAngle) * lookDist) / VOXEL_SIZE);
              const slz = Math.floor((npc.z + Math.sin(testAngle) * lookDist) / VOXEL_SIZE);
              if (isSidewalkAt(slx, slz)) {
                npc.targetHeading = testAngle;
                break;
              }
            }
          }

          // Lane discipline: nudge to right side of walkway
          if (onSidewalk) {
            // Right-side bias: perpendicular to heading, rightward
            const rightX = Math.cos(npc.heading + Math.PI / 2) * npc.laneOffset * VOXEL_SIZE * dt;
            const rightZ = Math.sin(npc.heading + Math.PI / 2) * npc.laneOffset * VOXEL_SIZE * dt;
            const laneNX = npc.x + rightX;
            const laneNZ = npc.z + rightZ;
            const laneVX = Math.floor(laneNX / VOXEL_SIZE);
            const laneVZ = Math.floor(laneNZ / VOXEL_SIZE);
            if (isSidewalkAt(laneVX, laneVZ) && !isWaterAt(cache, laneNX, laneNZ)) {
              npc.x = laneNX;
              npc.z = laneNZ;
            }
          }

          // Move forward
          const moveX = Math.cos(npc.heading) * npc.speed * VOXEL_SIZE * dt;
          const moveZ = Math.sin(npc.heading) * npc.speed * VOXEL_SIZE * dt;
          const newX = npc.x + moveX;
          const newZ = npc.z + moveZ;

          // SAFETY: verify destination
          const postVX = Math.floor(newX / VOXEL_SIZE);
          const postVZ = Math.floor(newZ / VOXEL_SIZE);
          if (isBuildingAt(postVX, postVZ) || isWaterAt(cache, newX, newZ) || !isWalkable(postVX, postVZ)) {
            // Undo: don't move, turn instead
            npc.behavior = 'turning';
            npc.targetHeading = findWalkableHeading(npc, cache, t, ni);
            npc.behaviorTimer = 0.5;
            npc.targetSpeed = 0;
            break;
          }

          npc.x = newX;
          npc.z = newZ;

          // If we just stepped onto sidewalk from road, mark road crossing complete
          if (npc.isCrossingRoad && isSidewalkAt(postVX, postVZ)) {
            npc.isCrossingRoad = false;
          }

          // Smooth Y tracking
          const newGH = sampleGroundHeight(cache, npc.x, npc.z);
          if (newGH >= 0) {
            const targetY = (newGH + 1) * VOXEL_SIZE;
            npc.y += (targetY - npc.y) * Math.min(1, 10 * dt);
          }

          // Chat opportunity
          if (npc.chatPartner < 0 && npc.behavior !== 'hurrying') {
            for (let oi = 0; oi < npcs.length; oi++) {
              if (oi === ni) continue;
              const other = npcs[oi];
              if (other.chatPartner >= 0 || other.behavior === 'chatting' || other.behavior === 'hurrying') continue;
              const dd = (npc.x - other.x) ** 2 + (npc.z - other.z) ** 2;
              if (dd < CHAT_DISTANCE_SQ && npcHash(npc.age + ni, oi) > 0.92) {
                const ct = CHAT_DURATION_MIN + npcHash(ni * 7, oi * 11) * (CHAT_DURATION_MAX - CHAT_DURATION_MIN);
                npc.behavior = 'chatting'; npc.behaviorTimer = ct; npc.chatPartner = oi;
                npc.targetSpeed = 0; npc.gesturePhase = 0;
                npc.targetHeading = Math.atan2(other.z - npc.z, other.x - npc.x);
                other.behavior = 'chatting'; other.behaviorTimer = ct; other.chatPartner = ni;
                other.targetSpeed = 0; other.gesturePhase = Math.PI;
                other.targetHeading = Math.atan2(npc.z - other.z, npc.x - other.x);
                break;
              }
            }
          }

          // Timer expired: behavior transition
          if (npc.behaviorTimer <= 0) {
            const roll = npcHash(npc.age * 3, ni * 5);
            const onSW = isSidewalkAt(Math.floor(npc.x / VOXEL_SIZE), Math.floor(npc.z / VOXEL_SIZE));

            if (roll < 0.08) {
              npc.behavior = 'phoneLooking';
              npc.behaviorTimer = 2 + npcHash(npc.age, ni) * 4;
              npc.targetSpeed = 0; npc.targetHeadTilt = -0.5;
            } else if (roll < 0.15 && onSW) {
              // Wait at crosswalk (only on sidewalk near a road)
              const nearRoadVX = Math.floor(npc.x / VOXEL_SIZE);
              const nearRoadVZ = Math.floor(npc.z / VOXEL_SIZE);
              let nearRoad = false;
              for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
                if (isRoadAt(nearRoadVX + dx, nearRoadVZ + dz)) { nearRoad = true; break; }
                if (nearRoad) break;
              }
              if (nearRoad) {
                npc.behavior = 'waitingCrosswalk';
                npc.behaviorTimer = CROSSWALK_WAIT_MIN + npcHash(npc.age * 13, ni) * (CROSSWALK_WAIT_MAX - CROSSWALK_WAIT_MIN);
                npc.targetSpeed = 0;
              } else {
                npc.behavior = 'standingIdle';
                npc.behaviorTimer = PAUSE_MIN + npcHash(npc.age * 17, ni) * PAUSE_MAX;
                npc.targetSpeed = 0;
              }
            } else if (roll < 0.22 && onSW) {
              npc.behavior = 'windowShop';
              npc.behaviorTimer = 3 + npcHash(npc.age * 2, ni) * 5;
              npc.targetSpeed = 0;
              npc.targetHeading = npc.heading + (npcHash(ni, npc.age) > 0.5 ? Math.PI / 2 : -Math.PI / 2);
            } else if (roll < 0.30) {
              npc.behavior = 'standingIdle';
              npc.behaviorTimer = PAUSE_MIN + npcHash(npc.age * 37, ni) * PAUSE_MAX;
              npc.targetSpeed = 0;
            } else if (roll < 0.42) {
              npc.behavior = 'pausing';
              npc.behaviorTimer = PAUSE_MIN + npcHash(npc.age, ni) * (PAUSE_MAX - PAUSE_MIN);
              npc.targetSpeed = 0;
            } else {
              const sr = npcHash(npc.age * 7, ni * 3);
              npc.targetSpeed = sr < 0.2 ? WALK_SPEED_STROLL : sr > 0.85 ? WALK_SPEED_HURRY : WALK_SPEED_NORMAL;
              npc.behavior = sr < 0.2 ? 'strolling' : sr > 0.85 ? 'hurrying' : 'walking';
              npc.behaviorTimer = WALK_MIN + npcHash(npc.age * 4, ni * 2) * (WALK_MAX - WALK_MIN);
              npc.targetHeading = findWalkableHeading(npc, cache, t, ni);
            }
          }
          break;
        }

        case 'pausing': {
          npc.targetSpeed = 0;
          if (Math.floor(npc.age * 2) !== Math.floor((npc.age - dt) * 2)) {
            npc.targetHeadTilt = (npcHash(npc.age * 10, ni) - 0.5) * 0.5;
          }
          if (npc.behaviorTimer <= 0) {
            npc.behavior = 'walking'; npc.targetSpeed = WALK_SPEED_NORMAL;
            npc.behaviorTimer = WALK_MIN + npcHash(npc.age * 2, ni * 3) * (WALK_MAX - WALK_MIN);
            npc.targetHeading = findWalkableHeading(npc, cache, t, ni);
            npc.targetHeadTilt = 0;
          }
          break;
        }

        case 'standingIdle': {
          // Standing completely still — weight shift and breathing only
          npc.targetSpeed = 0;
          if (Math.floor(npc.age * 1.5) !== Math.floor((npc.age - dt) * 1.5)) {
            npc.targetHeadTilt = (npcHash(npc.age * 8, ni) - 0.5) * 0.3;
          }
          if (npc.behaviorTimer <= 0) {
            npc.behavior = 'walking'; npc.targetSpeed = WALK_SPEED_NORMAL;
            npc.behaviorTimer = WALK_MIN + npcHash(npc.age * 6, ni * 7) * (WALK_MAX - WALK_MIN);
            npc.targetHeading = findWalkableHeading(npc, cache, t, ni);
            npc.targetHeadTilt = 0;
          }
          break;
        }

        case 'waitingCrosswalk': {
          npc.targetSpeed = 0;
          // Head looks left and right (animation handled in computeBoneOffset)
          if (npc.behaviorTimer <= 0) {
            // Cross the road! Turn toward road and walk
            npc.behavior = 'walking';
            npc.targetSpeed = WALK_SPEED_NORMAL;
            // Find road direction
            const currVX = Math.floor(npc.x / VOXEL_SIZE);
            const currVZ = Math.floor(npc.z / VOXEL_SIZE);
            let roadAngle = npc.heading;
            for (let di = 0; di < 8; di++) {
              const testAngle = (di / 8) * Math.PI * 2;
              const tvx = Math.floor((npc.x + Math.cos(testAngle) * 2 * VOXEL_SIZE) / VOXEL_SIZE);
              const tvz = Math.floor((npc.z + Math.sin(testAngle) * 2 * VOXEL_SIZE) / VOXEL_SIZE);
              if (isRoadAt(tvx, tvz)) { roadAngle = testAngle; break; }
            }
            npc.targetHeading = roadAngle;
            npc.behaviorTimer = 3 + npcHash(npc.age * 19, ni) * 5;
            npc.isCrossingRoad = true;
          }
          break;
        }

        case 'phoneLooking': {
          npc.targetSpeed = 0; npc.targetHeadTilt = -0.4;
          if (npc.behaviorTimer <= 0) {
            npc.behavior = 'walking'; npc.targetSpeed = WALK_SPEED_NORMAL;
            npc.behaviorTimer = WALK_MIN + npcHash(npc.age * 6, ni) * (WALK_MAX - WALK_MIN);
            npc.targetHeadTilt = 0;
          }
          break;
        }

        case 'windowShop': {
          npc.targetSpeed = 0;
          npc.targetHeadTilt = Math.sin(npc.age * 0.8) * 0.15;
          if (npc.behaviorTimer <= 0) {
            npc.behavior = 'walking'; npc.targetSpeed = WALK_SPEED_STROLL;
            npc.behaviorTimer = WALK_MIN + npcHash(npc.age * 8, ni) * (WALK_MAX - WALK_MIN);
            npc.targetHeading = findWalkableHeading(npc, cache, t, ni);
            npc.targetHeadTilt = 0;
          }
          break;
        }

        case 'chatting': {
          npc.targetSpeed = 0;
          npc.targetHeadTilt = Math.sin(npc.gesturePhase * 2) * 0.12;
          if (npc.behaviorTimer <= 0) {
            npc.behavior = 'pausing'; npc.behaviorTimer = 0.5 + npcHash(npc.age, ni);
            freeChatPartner(npc, npcs, ni); npc.chatPartner = -1; npc.targetHeadTilt = 0;
          }
          break;
        }

        case 'turning': {
          npc.targetSpeed = npc.speed * 0.15;
          if (npc.behaviorTimer <= 0) {
            npc.heading = npc.targetHeading;
            npc.behavior = 'walking'; npc.targetSpeed = WALK_SPEED_NORMAL;
            npc.behaviorTimer = WALK_MIN + npcHash(npc.age * 4, ni) * (WALK_MAX - WALK_MIN);
          }
          break;
        }
      }

      // Smooth heading interpolation
      let hd = npc.targetHeading - npc.heading;
      while (hd > Math.PI) hd -= Math.PI * 2;
      while (hd < -Math.PI) hd += Math.PI * 2;
      npc.heading += Math.sign(hd) * Math.min(Math.abs(hd), TURN_SPEED * dt);
    }

    /* ═══ 3. RENDER ═══ */
    const mesh = meshRef.current;
    const m = _m;
    const rot = _rot;
    const c = _c;
    let voxelCount = 0;

    for (const npc of npcs) {
      const ai = npc.archetypeIdx;
      const numVoxels = counts[ai];
      const baseOff = ai * maxVoxelsPerNPC * 3;
      const archBones = boneNames[ai];

      // Fade calculation
      const dx2 = (npc.x - camX) ** 2 + (npc.z - camZ) ** 2;
      let fade = npc.fadeIn;
      if (dx2 > fadeStartSq) fade *= 1 - (dx2 - fadeStartSq) / (despawnDistSq - fadeStartSq);
      fade = Math.max(0, Math.min(1, fade));
      if (fade < 0.01) continue;

      // Heading rotation: model's +Z (front/face) maps to movement direction
      const headingAngle = -npc.heading - Math.PI / 2;
      const ch = Math.cos(headingAngle);
      const sh = Math.sin(headingAngle);

      for (let vi = 0; vi < numVoxels && voxelCount < totalInstances; vi++) {
        const oi = baseOff + vi * 3;
        const bone = archBones[vi];

        const boneOff = computeBoneOffset(npc, bone);
        const lx = offsets[oi] + boneOff.dx;
        const ly = offsets[oi + 1] + boneOff.dy;
        const lz = offsets[oi + 2] + boneOff.dz;

        // Rotate local position by heading
        const rx = lx * ch - lz * sh;
        const rz = lx * sh + lz * ch;

        m.identity();
        rot.makeRotationY(headingAngle);
        m.multiply(rot);

        // Scale by fade (shrink in/out)
        const s = 0.5 + fade * 0.5;
        m.elements[0] *= s; m.elements[5] *= s; m.elements[10] *= s;

        m.elements[12] = npc.x + rx;
        m.elements[13] = npc.y + ly;
        m.elements[14] = npc.z + rz;

        mesh.setMatrixAt(voxelCount, m);

        c.setRGB(colors[oi], colors[oi + 1], colors[oi + 2]);
        c.multiplyScalar(fade);
        // Time-of-day lighting
        const lightMul = isNight ? 0.35
          : (hour >= 18) ? Math.max(0.35, 1 - (hour - 18) / 4)
          : (hour < 7) ? Math.max(0.35, 0.35 + (hour / 7) * 0.65)
          : 1.0;
        c.multiplyScalar(lightMul);
        mesh.setColorAt(voxelCount, c);
        voxelCount++;
      }
    }

    // eslint-disable-next-line react-hooks/immutability
    mesh.count = voxelCount;
    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[npcGeo, npcMat, totalInstances]} frustumCulled={false} />
  );
}
