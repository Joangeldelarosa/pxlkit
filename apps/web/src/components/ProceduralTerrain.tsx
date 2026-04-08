'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Link from 'next/link';
import { Trophy, Star, Coin, Crown, Gem, Shield, Lightning, Key, Sword } from '@pxlkit/gamification';
import { Heart } from '@pxlkit/social';
import { Check, Package, SparkleSmall, Robot } from '@pxlkit/ui';
import { Sun, Moon, Snowflake } from '@pxlkit/weather';
import type { PxlKitData } from '@pxlkit/core';

/* ═══════════════════════════════════════════════════════════════
 *  World Configuration — user-adjustable from the settings panel
 * ═══════════════════════════════════════════════════════════════ */

interface WorldConfig {
  renderDistance: number;
  flySpeed: number;
  treeDensity: number;       // 0-1
  structureDensity: number;  // 0-1
  cityFrequency: number;     // 0-1
  pickupDensity: number;     // 0-1
  fogDensity: number;        // 0-1
}

const DEFAULT_CONFIG: WorldConfig = {
  renderDistance: 5,
  flySpeed: 12,
  treeDensity: 0.5,
  structureDensity: 0.5,
  cityFrequency: 0.4,
  pickupDensity: 0.5,
  fogDensity: 0.5,
};

/* ═══════════════════════════════════════════════════════════════
 *  Seeded PRNG — mulberry32
 * ═══════════════════════════════════════════════════════════════ */

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ═══════════════════════════════════════════════════════════════
 *  Color Variation System
 *
 *  Instead of choosing from a fixed list of 4-5 colours,
 *  we take a BASE hex and apply seeded per-voxel variation
 *  in hue, saturation, and lightness.  The result is that
 *  touching voxels are clearly distinguishable yet feel like
 *  the same material — a natural, painterly gradient effect.
 *
 *  hashCoord produces a deterministic 0-1 float from (x,y,z)
 *  so the same voxel always gets the same colour (no flicker).
 * ═══════════════════════════════════════════════════════════════ */

const _vc = new THREE.Color();

/** Fast deterministic hash for 3 ints → [0,1) */
function hashCoord(x: number, y: number, z: number): number {
  let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  h = h ^ (h >>> 16);
  return ((h >>> 0) % 10000) / 10000;
}

/** Secondary hash for independent second axis of variation */
function hashCoord2(x: number, y: number, z: number): number {
  let h = (x * 1911520717 + y * 2048419325 + z * 327664571) | 0;
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = h ^ (h >>> 13);
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * Vary a hex colour using world-coordinate-seeded noise.
 * Returns the hex string of the varied colour.
 *
 * @param hex      Base colour in "#rrggbb"
 * @param wx,wy,wz World voxel coordinates (integers)
 * @param hueRange Max hue shift in degrees  (default 6)
 * @param satRange Max saturation shift 0-1  (default 0.08)
 * @param litRange Max lightness shift 0-1   (default 0.08)
 */
function varyColor(
  hex: string,
  wx: number, wy: number, wz: number,
  hueRange = 6, satRange = 0.08, litRange = 0.08,
): string {
  _vc.set(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  _vc.getHSL(hsl);

  const r1 = hashCoord(wx, wy, wz);     // 0..1
  const r2 = hashCoord2(wx, wy, wz);     // 0..1
  const r3 = hashCoord(wz, wx, wy);      // 0..1

  hsl.h += (r1 - 0.5) * 2 * (hueRange / 360);
  hsl.s = Math.max(0, Math.min(1, hsl.s + (r2 - 0.5) * 2 * satRange));
  hsl.l = Math.max(0, Math.min(1, hsl.l + (r3 - 0.5) * 2 * litRange));

  _vc.setHSL(hsl.h, hsl.s, hsl.l);
  return '#' + _vc.getHexString();
}

/* ═══════════════════════════════════════════════════════════════
 *  Optimised 2-D Perlin Noise (seeded)
 * ═══════════════════════════════════════════════════════════════ */

function createNoise2D(seed: number) {
  const rand = mulberry32(seed);
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const GX = new Float32Array([1, -1, 1, -1, 1, -1, 0, 0]);
  const GY = new Float32Array([1, 1, -1, -1, 0, 0, 1, -1]);

  return function noise2D(x: number, y: number): number {
    const xi = Math.floor(x), yi = Math.floor(y);
    const X = xi & 255, Y = yi & 255;
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    const aa = perm[perm[X] + Y] & 7, ab = perm[perm[X] + Y + 1] & 7;
    const ba = perm[perm[X + 1] + Y] & 7, bb = perm[perm[X + 1] + Y + 1] & 7;
    const x0 = (GX[aa] * xf + GY[aa] * yf) + u * ((GX[ba] * (xf - 1) + GY[ba] * yf) - (GX[aa] * xf + GY[aa] * yf));
    const x1 = (GX[ab] * xf + GY[ab] * (yf - 1)) + u * ((GX[bb] * (xf - 1) + GY[bb] * (yf - 1)) - (GX[ab] * xf + GY[ab] * (yf - 1)));
    return x0 + v * (x1 - x0);
  };
}

function fbm(
  noise: (x: number, y: number) => number,
  x: number, y: number,
  octaves: number, lac = 2.0, gain = 0.5,
): number {
  let val = 0, amp = 1, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    val += noise(x * freq, y * freq) * amp;
    max += amp; amp *= gain; freq *= lac;
  }
  return val / max;
}

/* ═══════════════════════════════════════════════════════════════
 *  Biome System
 * ═══════════════════════════════════════════════════════════════ */

type BiomeType = 'plains' | 'desert' | 'tundra' | 'forest' | 'mountains' | 'ocean' | 'city';

interface BiomeConfig {
  name: string;
  heightScale: number;
  heightBase: number;
  waterLevel: number;
  /** Single base colours for each layer — varyColor adds per-voxel variation */
  colors: { top: string; mid: string; bottom: string; accent: string; water: string };
}

const BIOMES: Record<BiomeType, BiomeConfig> = {
  plains: {
    name: 'Plains', heightScale: 5, heightBase: 7, waterLevel: 5,
    colors: { top: '#66ee88', mid: '#cc8844', bottom: '#99aabb', accent: '#ccaaff', water: '#88ddff' },
  },
  desert: {
    name: 'Desert', heightScale: 4, heightBase: 6, waterLevel: 2,
    colors: { top: '#ffeecc', mid: '#ddbb88', bottom: '#aa8866', accent: '#88cc55', water: '#66bbdd' },
  },
  tundra: {
    name: 'Tundra', heightScale: 6, heightBase: 7, waterLevel: 4,
    colors: { top: '#eef4ff', mid: '#99aabb', bottom: '#778899', accent: '#aaddff', water: '#77ccee' },
  },
  forest: {
    name: 'Forest', heightScale: 7, heightBase: 8, waterLevel: 5,
    colors: { top: '#339955', mid: '#886644', bottom: '#556655', accent: '#ee5544', water: '#55aacc' },
  },
  mountains: {
    name: 'Mountains', heightScale: 18, heightBase: 5, waterLevel: 3,
    colors: { top: '#bbccdd', mid: '#8899aa', bottom: '#667788', accent: '#eef4ff', water: '#6699bb' },
  },
  ocean: {
    name: 'Ocean', heightScale: 3, heightBase: 2, waterLevel: 8,
    colors: { top: '#ffeecc', mid: '#ddcc99', bottom: '#99aabb', accent: '#ff9999', water: '#4499cc' },
  },
  city: {
    name: 'City', heightScale: 1, heightBase: 7, waterLevel: 5,
    colors: { top: '#888888', mid: '#666666', bottom: '#444444', accent: '#ffdd44', water: '#88ddff' },
  },
};

/* ═══════════════════════════════════════════════════════════════
 *  Constants
 * ═══════════════════════════════════════════════════════════════ */

const CHUNK_SIZE = 16;
const VOXEL_SIZE = 0.5;
const MAX_HEIGHT = 32;
const MAX_CHUNKS_PER_FRAME = 2;
const PLAYER_HEIGHT = 1.5; // collision offset in voxel units
/** Sentinel for water face culling — any value larger than MAX_HEIGHT */
const NO_FACE = MAX_HEIGHT + 1;
/** Precision for camera direction change detection (rounded to 1/SCALE) */
const DIR_PRECISION = 10;
/** Weight factors for chunk loading priority: in-view vs distance */
const VIEW_DIR_WEIGHT = 2;
const DIST_PENALTY = 0.5;

function chunkKey(cx: number, cz: number): string { return `${cx},${cz}`; }
function worldToChunk(wx: number, wz: number): [number, number] {
  return [Math.floor(wx / (CHUNK_SIZE * VOXEL_SIZE)), Math.floor(wz / (CHUNK_SIZE * VOXEL_SIZE))];
}

/* ═══════════════════════════════════════════════════════════════
 *  Biome Determination
 * ═══════════════════════════════════════════════════════════════ */

function getBiome(
  biomeN: (x: number, y: number) => number,
  tempN: (x: number, y: number) => number,
  wx: number, wz: number,
  cityFreq: number,
): BiomeType {
  const temp = fbm(tempN, wx * 0.005, wz * 0.005, 2);
  const moisture = fbm(biomeN, wx * 0.004 + 100, wz * 0.004 + 100, 2);
  // City zones — low-frequency clusters
  const cityVal = biomeN(wx * 0.003 + 500, wz * 0.003 + 500);
  if (cityVal > 0.55 - cityFreq * 0.3 && temp > -0.15 && moisture < 0.25) return 'city';
  if (temp < -0.25) return 'tundra';
  if (temp > 0.3 && moisture < -0.1) return 'desert';
  if (moisture > 0.3) return 'ocean';
  if (temp > 0.0 && moisture > 0.05) return 'forest';
  if (biomeN(wx * 0.008, wz * 0.008) > 0.2) return 'mountains';
  return 'plains';
}

/* ═══════════════════════════════════════════════════════════════
 *  City Layout — GLOBAL grid so roads always connect
 *
 *  BLOCK_SIZE = 10   (total city block repeat)
 *  ROAD_W     = 2    (road width)
 *  LOT_INSET  = 1    (sidewalk / setback)
 *
 *  For any world coordinate (wx, wz):
 *    modX = ((wx % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE
 *    if modX < ROAD_W → on a Z-running road
 *    similarly for Z
 *    Remaining 8×8 area is the lot.
 *    Sidewalk = first & last column/row of lot.
 *    Building footprint = inner 6×6.
 * ═══════════════════════════════════════════════════════════════ */

const BLOCK_SIZE = 10;
const ROAD_W = 2;
const LOT_INSET = 1; // sidewalk width

interface CityCell {
  isRoad: boolean;
  isIntersection: boolean;
  isSidewalk: boolean;
  isBuilding: boolean;
  lotLocalX: number; // 0-based within building footprint, -1 if not building
  lotLocalZ: number;
  lotWorldX: number; // world-space lot ID for deterministic seeding
  lotWorldZ: number;
}

function classifyCityCell(wx: number, wz: number): CityCell {
  const modX = ((wx % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
  const modZ = ((wz % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
  const onRoadX = modX < ROAD_W;
  const onRoadZ = modZ < ROAD_W;
  const isRoad = onRoadX || onRoadZ;
  const isIntersection = onRoadX && onRoadZ;

  // Lot-local coordinates (within the 8×8 lot)
  const lotRawX = modX - ROAD_W;
  const lotRawZ = modZ - ROAD_W;
  const lotSize = BLOCK_SIZE - ROAD_W; // 8

  // Lot world ID
  const lotWorldX = Math.floor(wx / BLOCK_SIZE);
  const lotWorldZ = Math.floor(wz / BLOCK_SIZE);

  if (isRoad) {
    return { isRoad: true, isIntersection, isSidewalk: false, isBuilding: false,
             lotLocalX: -1, lotLocalZ: -1, lotWorldX, lotWorldZ };
  }

  const isSidewalk = lotRawX < LOT_INSET || lotRawX >= lotSize - LOT_INSET
                   || lotRawZ < LOT_INSET || lotRawZ >= lotSize - LOT_INSET;

  return {
    isRoad: false, isIntersection: false, isSidewalk,
    isBuilding: !isSidewalk,
    lotLocalX: lotRawX - LOT_INSET,
    lotLocalZ: lotRawZ - LOT_INSET,
    lotWorldX, lotWorldZ,
  };
}

/* Building type determined per lot from noise */
type BuildingType = 'skyscraper' | 'office' | 'house' | 'park' | 'parking';

function getBuildingType(
  structN: (x: number, y: number) => number,
  lotWX: number, lotWZ: number, density: number,
): BuildingType {
  const v = structN(lotWX * 0.7 + 42, lotWZ * 0.7 + 42);
  if (v > 0.35 + (1 - density) * 0.15) return 'skyscraper';
  if (v > 0.1) return 'office';
  if (v > -0.1) return 'house';
  if (v > -0.3) return 'park';
  return 'parking';
}

function getBuildingHeight(
  structN: (x: number, y: number) => number,
  lotWX: number, lotWZ: number, type: BuildingType,
): number {
  const v = Math.abs(structN(lotWX * 3.7 + 100, lotWZ * 3.7 + 100));
  switch (type) {
    case 'skyscraper': return 10 + Math.floor(v * 14); // 10-24
    case 'office': return 5 + Math.floor(v * 6);       // 5-11
    case 'house': return 3 + Math.floor(v * 2);        // 3-5
    default: return 0;
  }
}

const BUILDING_WALL_PALETTES: Record<string, string[]> = {
  skyscraper: ['#8899aa', '#99aabb', '#7788aa', '#aabbcc', '#6688aa'],
  office: ['#bbaa88', '#ccbb99', '#aa9977', '#c4a882'],
  house: ['#ddccaa', '#ccbb99', '#eeddbb', '#d4c098'],
};
const BUILDING_ROOF_COLORS: Record<string, string> = {
  skyscraper: '#556677', office: '#886644', house: '#cc6633',
};

/* ═══════════════════════════════════════════════════════════════
 *  Icon Pickup Data — PxlKit icons → flat voxel sprites
 * ═══════════════════════════════════════════════════════════════ */

interface PickupVoxel { x: number; y: number; color: string }

function iconToPickupVoxels(icon: PxlKitData): PickupVoxel[] {
  const voxels: PickupVoxel[] = [];
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

const PICKUP_ICONS: { icon: PxlKitData; voxels: PickupVoxel[] }[] = [
  Trophy, Star, Coin, Crown, Gem, Shield, Lightning, Key, Sword,
  Heart, Check, Package, SparkleSmall, Robot, Sun, Moon, Snowflake,
].map(icon => ({ icon, voxels: iconToPickupVoxels(icon) }));

/* ═══════════════════════════════════════════════════════════════
 *  Chunk Data
 * ═══════════════════════════════════════════════════════════════ */

interface ChunkVoxelData {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
  waterPositions: Float32Array;
  waterColors: Float32Array;
  waterCount: number;
  pickups: { wx: number; wy: number; wz: number; iconIdx: number }[];
  /** Max solid height at each column for collision [lx * CHUNK_SIZE + lz] */
  solidHeightMap: Int32Array;
  chunkX: number;
  chunkZ: number;
}

/* ═══════════════════════════════════════════════════════════════
 *  Chunk Generation — terrain, water, structures, cities, pickups
 *
 *  Design principles:
 *  ‣ Terrain is SOLID — every exposed face is rendered, no gaps.
 *  ‣ Water fills from terrain+1 to waterLevel, exposed faces only.
 *  ‣ City terrain is forced flat so roads connect seamlessly.
 *  ‣ Buildings respect road grid — never clip into roads.
 *  ‣ Collision heightmap tracks tallest solid voxel per column.
 * ═══════════════════════════════════════════════════════════════ */

const _tc = new THREE.Color();

function generateChunkData(
  cx: number, cz: number,
  heightN: (x: number, y: number) => number,
  detailN: (x: number, y: number) => number,
  biomeN: (x: number, y: number) => number,
  tempN: (x: number, y: number) => number,
  treeN: (x: number, y: number) => number,
  structN: (x: number, y: number) => number,
  cfg: WorldConfig,
): ChunkVoxelData {
  const maxV = CHUNK_SIZE * CHUNK_SIZE * 16;
  const posA = new Float32Array(maxV * 3);
  const colA = new Float32Array(maxV * 3);
  let sc = 0;
  const maxW = CHUNK_SIZE * CHUNK_SIZE * 10;
  const wPosA = new Float32Array(maxW * 3);
  const wColA = new Float32Array(maxW * 3);
  let wc = 0;
  const pickups: ChunkVoxelData['pickups'] = [];
  const solidHeightMap = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);

  const bX = cx * CHUNK_SIZE, bZ = cz * CHUNK_SIZE;

  /* ── Pre-compute height map + biome for chunk + 1-cell border ── */
  const gW = CHUNK_SIZE + 2;
  const hMap = new Int32Array(gW * gW);
  const bMap = new Uint8Array(gW * gW);
  const bTypes: BiomeType[] = ['plains', 'desert', 'tundra', 'forest', 'mountains', 'ocean', 'city'];

  for (let lx = -1; lx <= CHUNK_SIZE; lx++) {
    for (let lz = -1; lz <= CHUNK_SIZE; lz++) {
      const wx = bX + lx, wz = bZ + lz;
      const idx = (lx + 1) * gW + (lz + 1);
      const biome = getBiome(biomeN, tempN, wx, wz, cfg.cityFrequency);
      const c = BIOMES[biome];

      let h: number;
      if (biome === 'city') {
        // City terrain is FLAT so roads are always level
        h = c.heightBase;
      } else {
        const base = fbm(heightN, wx * 0.02, wz * 0.02, 4, 2.0, 0.5);
        const det = detailN(wx * 0.08, wz * 0.08) * 0.25;
        let extra = 0;
        if (biome === 'mountains') {
          extra = Math.abs(fbm(detailN, wx * 0.015 + 200, wz * 0.015 + 200, 2)) * 6;
        }
        h = Math.max(0, Math.min(MAX_HEIGHT, Math.floor(c.heightBase + (base + det) * c.heightScale + extra)));
      }
      hMap[idx] = h;
      bMap[idx] = bTypes.indexOf(biome);
    }
  }

  /* ── Helper: push solid voxel ── */
  function push(px: number, py: number, pz: number, hex: string) {
    if (sc >= maxV) return;
    const i3 = sc * 3;
    posA[i3] = px; posA[i3 + 1] = py; posA[i3 + 2] = pz;
    _tc.set(hex); colA[i3] = _tc.r; colA[i3 + 1] = _tc.g; colA[i3 + 2] = _tc.b;
    sc++;
  }
  /* ── Helper: push water voxel ── */
  function pushW(px: number, py: number, pz: number, hex: string) {
    if (wc >= maxW) return;
    const i3 = wc * 3;
    wPosA[i3] = px; wPosA[i3 + 1] = py; wPosA[i3 + 2] = pz;
    _tc.set(hex); wColA[i3] = _tc.r; wColA[i3 + 1] = _tc.g; wColA[i3 + 2] = _tc.b;
    wc++;
  }
  /* ── Helper: track collision height ── */
  function trackH(lx: number, lz: number, yTop: number) {
    if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
      const i = lx * CHUNK_SIZE + lz;
      if (yTop > solidHeightMap[i]) solidHeightMap[i] = yTop;
    }
  }

  // Seeded RNG for this chunk (pickup placement)
  const chunkRand = mulberry32(cx * 73856093 + cz * 19349663);

  /* ════════════════════════ MAIN LOOP ════════════════════════ */
  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const idx = (lx + 1) * gW + (lz + 1);
      const h = hMap[idx];
      const biome = bTypes[bMap[idx]] as BiomeType;
      const c = BIOMES[biome];
      const wx = bX + lx, wz = bZ + lz;

      // Neighbor heights
      const hN = hMap[(lx + 1) * gW + lz];
      const hS = hMap[(lx + 1) * gW + (lz + 2)];
      const hE = hMap[(lx + 2) * gW + (lz + 1)];
      const hWest = hMap[lx * gW + (lz + 1)];
      const wl = c.waterLevel;

      /* ── 1. TERRAIN — render every voxel with an exposed face ── */
      for (let y = 0; y <= h; y++) {
        const isTop = y === h;
        const exposed = isTop || y === 0
          || y > hN || y > hS || y > hE || y > hWest;
        if (!exposed) continue;

        let baseCol: string;
        if (isTop && biome === 'mountains' && y > 16) {
          baseCol = c.colors.accent;
        } else if (isTop) {
          baseCol = c.colors.top;
        } else if (y >= h - 3) {
          baseCol = c.colors.mid;
        } else {
          baseCol = c.colors.bottom;
        }
        push((bX + lx) * VOXEL_SIZE, y * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
          varyColor(baseCol, wx, y, wz));
      }
      trackH(lx, lz, h);

      /* ── 2. WATER — solid fill from terrain+1 to waterLevel ── */
      if (h < wl) {
        for (let wy = h + 1; wy <= wl; wy++) {
          const isWTop = wy === wl;
          // An underwater voxel is exposed if a horizontal neighbor's terrain
          // is lower than this water voxel's Y, creating a visible face.
          const wExpN = wy > Math.max(hN, hN >= wl ? NO_FACE : 0);
          const wExpS = wy > Math.max(hS, hS >= wl ? NO_FACE : 0);
          const wExpE = wy > Math.max(hE, hE >= wl ? NO_FACE : 0);
          const wExpW = wy > Math.max(hWest, hWest >= wl ? NO_FACE : 0);
          const wExposed = isWTop || wy === h + 1 || wExpN || wExpS || wExpE || wExpW;
          if (!wExposed) continue;
          pushW((bX + lx) * VOXEL_SIZE, wy * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor(c.colors.water, wx, wy, wz, 4, 0.06, 0.06));
        }
        trackH(lx, lz, wl);
      }

      /* ══════════════════ 3. CITY BIOME ══════════════════ */
      if (biome === 'city') {
        const cell = classifyCityCell(wx, wz);

        if (cell.isRoad) {
          /* ── Road surface ── */
          const modX = ((wx % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
          const modZ = ((wz % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
          push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor(cell.isIntersection ? '#555555' : '#3a3a3a', wx, h + 1, wz, 2, 0.03, 0.04));
          trackH(lx, lz, h + 1);

          /* Road markings */
          const onRoadX = modX < ROAD_W;
          const onRoadZ = modZ < ROAD_W;
          // Center dashed yellow line on Z-running roads
          if (onRoadZ && !onRoadX && modZ === 0 && (((wx % 4) + 4) % 4) < 2) {
            push((bX + lx) * VOXEL_SIZE, (h + 1.05) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffdd44');
          }
          // Center dashed yellow line on X-running roads
          if (onRoadX && !onRoadZ && modX === 0 && (((wz % 4) + 4) % 4) < 2) {
            push((bX + lx) * VOXEL_SIZE, (h + 1.05) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffdd44');
          }
          // White edge lines
          if ((onRoadX && !onRoadZ && (modX === 0 || modX === ROAD_W - 1)) ||
              (onRoadZ && !onRoadX && (modZ === 0 || modZ === ROAD_W - 1))) {
            push((bX + lx) * VOXEL_SIZE, (h + 1.05) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#bbbbbb');
          }
          // Crosswalk at intersections
          if (cell.isIntersection && ((modX + modZ) % 2 === 0)) {
            push((bX + lx) * VOXEL_SIZE, (h + 1.05) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#dddddd');
          }

          /* ── Lampposts — only at specific intersection corners ── */
          if (modX === 0 && modZ === 0) {
            for (let ly = 2; ly <= 5; ly++) {
              push((bX + lx) * VOXEL_SIZE, (h + ly) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#666666');
            }
            push((bX + lx) * VOXEL_SIZE, (h + 6) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffee88');
            push((bX + lx + 1) * VOXEL_SIZE, (h + 5) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#555555');
            push((bX + lx + 1) * VOXEL_SIZE, (h + 6) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffee88');
            trackH(lx, lz, h + 6);
          }

        } else if (cell.isSidewalk) {
          /* ── Sidewalk — slightly raised, lighter colour ── */
          push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor('#aaaaaa', wx, h + 1, wz, 2, 0.03, 0.05));
          trackH(lx, lz, h + 1);

        } else if (cell.isBuilding) {
          /* ── Building ── */
          const bType = getBuildingType(structN, cell.lotWorldX, cell.lotWorldZ, cfg.structureDensity);
          const bh = getBuildingHeight(structN, cell.lotWorldX, cell.lotWorldZ, bType);

          if (bType === 'park') {
            /* Park — grass with occasional tree */
            push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor('#66cc77', wx, h + 1, wz));
            trackH(lx, lz, h + 1);
            if (cell.lotLocalX === 3 && cell.lotLocalZ === 3 && cfg.treeDensity > 0.2) {
              for (let ty = 2; ty <= 4; ty++) push((bX + lx) * VOXEL_SIZE, (h + ty) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, varyColor('#664422', wx, h + ty, wz, 4, 0.05, 0.06));
              for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
                push((bX + lx + dx) * VOXEL_SIZE, (h + 5) * VOXEL_SIZE, (bZ + lz + dz) * VOXEL_SIZE, varyColor('#44aa66', wx + dx, h + 5, wz + dz));
                if (dx === 0 || dz === 0) push((bX + lx + dx) * VOXEL_SIZE, (h + 6) * VOXEL_SIZE, (bZ + lz + dz) * VOXEL_SIZE, varyColor('#44aa66', wx + dx, h + 6, wz + dz));
              }
              trackH(lx, lz, h + 6);
            }
          } else if (bType === 'parking') {
            /* Parking lot */
            const stripe = cell.lotLocalZ % 3 === 0 && cell.lotLocalX > 0 && cell.lotLocalX < 5;
            push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor(stripe ? '#eeeeee' : '#666666', wx, h + 1, wz, 2, 0.03, 0.04));
            trackH(lx, lz, h + 1);
          } else {
            /* Actual building (skyscraper / office / house) */
            const footprint = BLOCK_SIZE - ROAD_W - LOT_INSET * 2; // 6
            const blX = cell.lotLocalX, blZ = cell.lotLocalZ;
            const isEdgeX = blX === 0 || blX === footprint - 1;
            const isEdgeZ = blZ === 0 || blZ === footprint - 1;
            const isEdge = isEdgeX || isEdgeZ;
            const wallBase = BUILDING_WALL_PALETTES[bType]?.[0] || '#ddccaa';
            const roofCol = BUILDING_ROOF_COLORS[bType] || '#cc6633';
            const windowCol = '#aaddff';
            const doorCol = '#886644';

            for (let by = 1; by <= bh; by++) {
              if (!isEdge && by < bh) continue; // interior: skip (hollow)
              let color: string;
              if (by === bh) {
                color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
              } else if (by === 1 && blZ === 0 && blX >= 2 && blX <= 3) {
                color = varyColor(doorCol, wx, h + by, wz, 3, 0.04, 0.05);
              } else if (isEdge && by > 1 && by < bh && by % 2 === 0) {
                const isWindowCol = isEdgeZ
                  ? (blX >= 1 && blX <= footprint - 2 && blX % 2 === 1)
                  : (blZ >= 1 && blZ <= footprint - 2 && blZ % 2 === 1);
                color = isWindowCol ? varyColor(windowCol, wx, h + by, wz, 3, 0.05, 0.06) : varyColor(wallBase, wx, h + by, wz, 5, 0.06, 0.07);
              } else {
                color = varyColor(wallBase, wx, h + by, wz, 5, 0.06, 0.07);
              }
              push((bX + lx) * VOXEL_SIZE, (h + by) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, color);
            }

            // Peaked roof for houses
            if (bType === 'house' && isEdge) {
              const midX = Math.floor(footprint / 2);
              const dist = Math.abs(blX - midX);
              const roofExtra = Math.max(0, 2 - dist);
              for (let ry = 1; ry <= roofExtra; ry++) {
                push((bX + lx) * VOXEL_SIZE, (h + bh + ry) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor(roofCol, wx, h + bh + ry, wz, 4, 0.04, 0.06));
              }
              trackH(lx, lz, h + bh + roofExtra);
            } else {
              trackH(lx, lz, h + bh);
            }
          }
        }
        continue; // city biome handled — skip natural decorations
      }

      /* ══════════════════ 4. NATURAL STRUCTURES ══════════════════ */

      /* ── Trees ── */
      if ((biome === 'plains' || biome === 'forest')
        && h > c.waterLevel + 1
        && lx > 1 && lx < CHUNK_SIZE - 2 && lz > 1 && lz < CHUNK_SIZE - 2
      ) {
        const tv = treeN(wx * 0.6, wz * 0.6);
        const threshold = (biome === 'forest' ? 0.22 : 0.40) + (1 - cfg.treeDensity) * 0.25;
        if (tv > threshold) {
          const trunkH = biome === 'forest' ? 3 + (Math.abs(wx * 13 + wz * 7) % 3) : 2 + (Math.abs(wx * 7 + wz) % 2);
          const trunkBase = biome === 'forest' ? '#664422' : '#AA7744';
          const leafBase = biome === 'forest' ? '#339955' : '#55ee77';
          for (let ty = 1; ty <= trunkH; ty++) push((bX + lx) * VOXEL_SIZE, (h + ty) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, varyColor(trunkBase, wx, h + ty, wz, 4, 0.05, 0.06));
          const cr = 2, cy2 = h + trunkH + cr;
          for (let dx = -cr; dx <= cr; dx++) for (let dy = -cr; dy <= cr; dy++) for (let dz = -cr; dz <= cr; dz++) {
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 > cr * cr + 0.5 || (cr > 1 && d2 < (cr - 1) * (cr - 1))) continue;
            push((bX + lx + dx) * VOXEL_SIZE, (cy2 + dy) * VOXEL_SIZE, (bZ + lz + dz) * VOXEL_SIZE,
              varyColor(leafBase, wx + dx, cy2 + dy, wz + dz, 8, 0.08, 0.08));
          }
          trackH(lx, lz, cy2 + cr);
        }
      }

      /* ── Cacti ── */
      if (biome === 'desert' && h > c.waterLevel && lx > 0 && lx < CHUNK_SIZE - 1 && lz > 0 && lz < CHUNK_SIZE - 1) {
        if (treeN(wx * 0.7 + 50, wz * 0.7 + 50) > 0.46) {
          const cH = 3 + (Math.abs(wx * 11 + wz * 3) % 3);
          for (let cy = 1; cy <= cH; cy++) push((bX + lx) * VOXEL_SIZE, (h + cy) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, varyColor('#55aa44', wx, h + cy, wz));
          if (cH > 3) {
            push((bX + lx + 1) * VOXEL_SIZE, (h + 3) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, varyColor('#66bb55', wx + 1, h + 3, wz));
            push((bX + lx + 1) * VOXEL_SIZE, (h + 4) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, varyColor('#66bb55', wx + 1, h + 4, wz));
          }
          trackH(lx, lz, h + cH);
        }
      }

      /* ── Pyramids ── */
      if (biome === 'desert' && lx >= 1 && lx <= CHUNK_SIZE - 6 && lz >= 1 && lz <= CHUNK_SIZE - 6) {
        const pv = structN(wx * 0.06 + 100, wz * 0.06 + 100);
        if (pv > 0.52 - cfg.structureDensity * 0.1 && Math.abs(wx % 14) < 1 && Math.abs(wz % 14) < 1) {
          const ps = 4;
          for (let layer = 0; layer < ps; layer++) {
            const w = ps - layer;
            for (let px = -w; px <= w; px++) for (let pz = -w; pz <= w; pz++) {
              push((bX + lx + px) * VOXEL_SIZE, (h + layer + 1) * VOXEL_SIZE, (bZ + lz + pz) * VOXEL_SIZE,
                varyColor(layer === ps - 1 ? '#FFD700' : '#ddbb77', wx + px, h + layer + 1, wz + pz, 5, 0.05, 0.06));
            }
          }
          trackH(lx, lz, h + ps);
        }
      }

      /* ── Houses in plains/forest ── */
      if ((biome === 'plains' || biome === 'forest')
        && h > c.waterLevel + 1
        && lx >= 2 && lx <= CHUNK_SIZE - 5 && lz >= 2 && lz <= CHUNK_SIZE - 5
      ) {
        const hv = structN(wx * 0.12, wz * 0.12);
        if (hv > 0.50 - cfg.structureDensity * 0.12 && Math.abs(wx % 11) < 1 && Math.abs(wz % 13) < 1) {
          const wallC = biome === 'forest' ? '#8B7355' : '#D4C5A9';
          const roofC = biome === 'forest' ? '#8B4513' : '#CC6633';
          for (let hx = 0; hx < 3; hx++) for (let hz = 0; hz < 3; hz++) for (let hy = 1; hy <= 3; hy++) {
            if (hx === 1 && hz === 1) continue; // hollow interior
            if (hx === 1 && hz === 0 && hy <= 2) continue; // door
            const isWin = hy === 2 && ((hx === 0 && hz === 1) || (hx === 2 && hz === 1));
            push((bX + lx + hx) * VOXEL_SIZE, (h + hy) * VOXEL_SIZE, (bZ + lz + hz) * VOXEL_SIZE,
              varyColor(isWin ? '#AADDFF' : wallC, wx + hx, h + hy, wz + hz));
          }
          for (let rx = -1; rx <= 3; rx++) for (let rz = -1; rz <= 3; rz++)
            push((bX + lx + rx) * VOXEL_SIZE, (h + 4) * VOXEL_SIZE, (bZ + lz + rz) * VOXEL_SIZE,
              varyColor(roofC, wx + rx, h + 4, wz + rz, 4, 0.04, 0.06));
          for (let rx = 0; rx <= 2; rx++) for (let rz = 0; rz <= 2; rz++)
            push((bX + lx + rx) * VOXEL_SIZE, (h + 5) * VOXEL_SIZE, (bZ + lz + rz) * VOXEL_SIZE,
              varyColor(roofC, wx + rx, h + 5, wz + rz, 4, 0.04, 0.06));
          trackH(lx, lz, h + 5);
        }
      }

      /* ── Rock formations ── */
      if ((biome === 'tundra' || biome === 'mountains')
        && h > c.waterLevel && lx > 1 && lx < CHUNK_SIZE - 2 && lz > 1 && lz < CHUNK_SIZE - 2
      ) {
        if (structN(wx * 0.4 + 300, wz * 0.4 + 300) > 0.44) {
          const rh = 1 + (Math.abs(wx * 7 + wz * 3) % 3);
          const rc = biome === 'tundra' ? '#8899aa' : '#667788';
          for (let ry = 1; ry <= rh; ry++) push((bX + lx) * VOXEL_SIZE, (h + ry) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, varyColor(rc, wx, h + ry, wz));
          if (rh > 1) {
            push((bX + lx + 1) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, varyColor(rc, wx + 1, h + 1, wz));
            push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz + 1) * VOXEL_SIZE, varyColor(rc, wx, h + 1, wz + 1));
          }
          trackH(lx, lz, h + rh);
        }
      }

      /* ── Floating icon pickups (one per chunk centre) ── */
      if (cfg.pickupDensity > 0 && lx === 8 && lz === 8) {
        const pv = chunkRand();
        if (pv < cfg.pickupDensity * 0.15) {
          const iconIdx = Math.floor(chunkRand() * PICKUP_ICONS.length);
          pickups.push({ wx: (bX + lx) * VOXEL_SIZE, wy: (h + 6) * VOXEL_SIZE, wz: (bZ + lz) * VOXEL_SIZE, iconIdx });
        }
      }
    }
  }

  return {
    positions: posA.subarray(0, sc * 3), colors: colA.subarray(0, sc * 3), count: sc,
    waterPositions: wPosA.subarray(0, wc * 3), waterColors: wColA.subarray(0, wc * 3), waterCount: wc,
    pickups, solidHeightMap, chunkX: cx, chunkZ: cz,
  };
}

/* ═══════════════════════════════════════════════════════════════
 *  Shared geometry & materials (allocated ONCE)
 * ═══════════════════════════════════════════════════════════════ */

const sharedGeo = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
const sharedSolidMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
const sharedWaterMat = new THREE.MeshStandardMaterial({
  roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.6, depthWrite: false,
});

/* ═══════════════════════════════════════════════════════════════
 *  Chunk Mesh
 * ═══════════════════════════════════════════════════════════════ */

function ChunkMesh({ data }: { data: ChunkVoxelData }) {
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const waterRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = solidRef.current;
    if (!mesh || data.count === 0) return;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < data.count; i++) {
      const i3 = i * 3;
      m.identity(); m.elements[12] = data.positions[i3]; m.elements[13] = data.positions[i3 + 1]; m.elements[14] = data.positions[i3 + 2];
      mesh.setMatrixAt(i, m);
      c.setRGB(data.colors[i3], data.colors[i3 + 1], data.colors[i3 + 2]);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  useEffect(() => {
    const mesh = waterRef.current;
    if (!mesh || data.waterCount === 0) return;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < data.waterCount; i++) {
      const i3 = i * 3;
      m.identity(); m.elements[12] = data.waterPositions[i3]; m.elements[13] = data.waterPositions[i3 + 1]; m.elements[14] = data.waterPositions[i3 + 2];
      mesh.setMatrixAt(i, m);
      c.setRGB(data.waterColors[i3], data.waterColors[i3 + 1], data.waterColors[i3 + 2]);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  return (
    <group>
      {data.count > 0 && <instancedMesh ref={solidRef} args={[sharedGeo, sharedSolidMat, data.count]} frustumCulled={false} />}
      {data.waterCount > 0 && <instancedMesh ref={waterRef} args={[sharedGeo, sharedWaterMat, data.waterCount]} frustumCulled={false} />}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  Floating Icon Pickup
 * ═══════════════════════════════════════════════════════════════ */

const pickupPxSize = VOXEL_SIZE * 0.18;
const pickupGeo = new THREE.BoxGeometry(pickupPxSize, pickupPxSize, pickupPxSize * 0.3);
const pickupMat = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.1 });

function FloatingPickup({ position, iconIdx }: { position: [number, number, number]; iconIdx: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { voxels, icon } = PICKUP_ICONS[iconIdx % PICKUP_ICONS.length];
  const count = voxels.length;
  const baseY = useRef(position[1]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    const hs = icon.size / 2;
    for (let i = 0; i < count; i++) {
      const v = voxels[i];
      m.identity(); m.elements[12] = (v.x - hs) * pickupPxSize; m.elements[13] = (v.y - hs) * pickupPxSize; m.elements[14] = 0;
      mesh.setMatrixAt(i, m);
      c.set(v.color); mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, voxels, icon.size]);

  useFrame(({ clock }) => {
    const g = groupRef.current; if (!g) return;
    const t = clock.getElapsedTime();
    g.rotation.y = t * 1.2;
    g.position.y = baseY.current + Math.sin(t * 2) * 0.3;
  });

  return (
    <group ref={groupRef} position={position}>
      {count > 0 && <instancedMesh ref={meshRef} args={[pickupGeo, pickupMat, count]} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <ringGeometry args={[0.3, 0.5, 16]} />
        <meshBasicMaterial color="#ffdd44" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  Collision Query — reads solidHeightMap from chunk cache
 * ═══════════════════════════════════════════════════════════════ */

function getSolidHeight(cache: Map<string, ChunkVoxelData>, worldX: number, worldZ: number): number {
  const vx = worldX / VOXEL_SIZE, vz = worldZ / VOXEL_SIZE;
  const cx2 = Math.floor(vx / CHUNK_SIZE), cz2 = Math.floor(vz / CHUNK_SIZE);
  const data = cache.get(chunkKey(cx2, cz2));
  if (!data) return 0;
  const lx = Math.floor(vx - cx2 * CHUNK_SIZE), lz = Math.floor(vz - cz2 * CHUNK_SIZE);
  if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return 0;
  return data.solidHeightMap[lx * CHUNK_SIZE + lz];
}

/* ═══════════════════════════════════════════════════════════════
 *  Fly Camera — with per-frame collision against solid terrain
 * ═══════════════════════════════════════════════════════════════ */

function FlyCamera({ keysRef, speedRef, chunkCacheRef }: {
  keysRef: React.RefObject<Set<string>>;
  speedRef: React.RefObject<number>;
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
}) {
  const { camera } = useThree();
  const _d = useMemo(() => new THREE.Vector3(), []);
  const _r = useMemo(() => new THREE.Vector3(), []);
  const _prev = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => { camera.position.set(0, 12, 20); camera.lookAt(0, 6, 0); }, [camera]);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    if (!keys || keys.size === 0) return;

    _prev.copy(camera.position);
    const spd = (speedRef.current ?? 12) * delta;
    camera.getWorldDirection(_d);
    _r.crossVectors(_d, camera.up).normalize();

    if (keys.has('w') || keys.has('arrowup'))    camera.position.addScaledVector(_d, spd);
    if (keys.has('s') || keys.has('arrowdown'))  camera.position.addScaledVector(_d, -spd);
    if (keys.has('a') || keys.has('arrowleft'))  camera.position.addScaledVector(_r, -spd);
    if (keys.has('d') || keys.has('arrowright')) camera.position.addScaledVector(_r, spd);
    if (keys.has(' '))     camera.position.addScaledVector(camera.up, spd);
    if (keys.has('shift')) camera.position.addScaledVector(camera.up, -spd);

    /* Collision resolution */
    const cache = chunkCacheRef.current;
    if (!cache || cache.size === 0) return;

    const th = getSolidHeight(cache, camera.position.x, camera.position.z);
    const minY = (th + PLAYER_HEIGHT) * VOXEL_SIZE;
    if (camera.position.y < minY) {
      // Try sliding: revert X, check; revert Z, check
      const hOldX = getSolidHeight(cache, _prev.x, camera.position.z);
      const hOldZ = getSolidHeight(cache, camera.position.x, _prev.z);
      if ((hOldX + PLAYER_HEIGHT) * VOXEL_SIZE <= camera.position.y) {
        camera.position.set(_prev.x, camera.position.y, camera.position.z);
      } else if ((hOldZ + PLAYER_HEIGHT) * VOXEL_SIZE <= camera.position.y) {
        camera.position.set(camera.position.x, camera.position.y, _prev.z);
      } else {
        camera.position.set(camera.position.x, minY, camera.position.z);
      }
    }
  });
  return null;
}

/* ═══════════════════════════════════════════════════════════════
 *  Camera Look — desktop mouse + mobile touch drag
 * ═══════════════════════════════════════════════════════════════ */

function CameraLook({ isLocked, isMobile }: { isLocked: boolean; isMobile: boolean }) {
  const { camera, gl } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const touchIdRef = useRef<number | null>(null);
  const lastTouchRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isLocked) return;
    euler.current.setFromQuaternion(camera.quaternion);
    const canvas = gl.domElement;

    const rotate = (dx: number, dy: number, sens: number) => {
      euler.current.y -= dx * sens;
      euler.current.x -= dy * sens;
      euler.current.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    const onMouse = (e: MouseEvent) => rotate(e.movementX, e.movementY, 0.002);

    const onTouchStart = (e: TouchEvent) => {
      if (touchIdRef.current !== null) return;
      const t = e.changedTouches[0];
      touchIdRef.current = t.identifier;
      lastTouchRef.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchIdRef.current) {
          rotate(t.clientX - lastTouchRef.current.x, t.clientY - lastTouchRef.current.y, 0.004);
          lastTouchRef.current = { x: t.clientX, y: t.clientY };
          break;
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) { touchIdRef.current = null; break; }
      }
    };

    if (isMobile) {
      canvas.addEventListener('touchstart', onTouchStart, { passive: true });
      canvas.addEventListener('touchmove', onTouchMove, { passive: true });
      canvas.addEventListener('touchend', onTouchEnd, { passive: true });
      canvas.addEventListener('touchcancel', onTouchEnd, { passive: true });
    } else {
      canvas.addEventListener('mousemove', onMouse);
    }
    return () => {
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isLocked, isMobile, camera, gl]);

  return null;
}

/* ═══════════════════════════════════════════════════════════════
 *  Lighting / Sky / Fog
 * ═══════════════════════════════════════════════════════════════ */

function WorldLighting() {
  return (
    <>
      <ambientLight intensity={0.8} color="#ffffff" />
      <hemisphereLight color="#aaccff" groundColor="#886644" intensity={0.5} />
      <directionalLight position={[50, 80, 50]} intensity={1.4} color="#ffffff" castShadow={false} />
      <directionalLight position={[-30, 40, -30]} intensity={0.6} color="#ffffff" />
    </>
  );
}

function SkyGradient() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  useFrame(() => { if (meshRef.current) meshRef.current.position.copy(camera.position); });
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `varying vec3 vWP;void main(){vec4 w=modelMatrix*vec4(position,1.0);vWP=w.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec3 vWP;void main(){float h=normalize(vWP).y;vec3 top=vec3(0.2,0.35,0.65);vec3 bot=vec3(0.6,0.75,0.9);vec3 hor=vec3(0.85,0.75,0.6);vec3 c=h>0.0?mix(hor,top,smoothstep(0.0,0.5,h)):mix(hor,bot,smoothstep(0.0,-0.3,h));gl_FragColor=vec4(c,1.0);}`,
    side: THREE.BackSide, depthWrite: false,
  }), []);
  return <mesh ref={meshRef} material={mat}><sphereGeometry args={[500, 16, 16]} /></mesh>;
}

function FogEffect({ density }: { density: number }) {
  return <fogExp2 attach="fog" args={['#b0c8e0', 0.005 + density * 0.02]} />;
}

/* ═══════════════════════════════════════════════════════════════
 *  HUD Components
 * ═══════════════════════════════════════════════════════════════ */

function OverlayStats({ seed, chunkCount, position, biome }: {
  seed: number; chunkCount: number; position: [number, number, number]; biome: string;
}) {
  return (
    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 font-mono text-[9px] sm:text-[10px] space-y-0.5 pointer-events-none select-none">
      <div className="text-retro-green/70">SEED: <span className="text-retro-green">{seed}</span></div>
      <div className="text-retro-cyan/70">BIOME: <span className="text-retro-cyan">{biome}</span></div>
      <div className="text-retro-gold/70">POS: <span className="text-retro-gold">{position[0].toFixed(0)}, {position[1].toFixed(0)}, {position[2].toFixed(0)}</span></div>
      <div className="text-retro-purple/70">CHUNKS: <span className="text-retro-purple">{chunkCount}</span></div>
    </div>
  );
}

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
 *  Mobile Touch Controls — fully non-selectable
 * ═══════════════════════════════════════════════════════════════ */

function MobileTouchControls({ onKey }: { onKey: (key: string, active: boolean) => void }) {
  const mkH = useCallback((key: string) => ({
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); e.stopPropagation(); onKey(key, true); },
    onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); e.stopPropagation(); onKey(key, false); },
    onTouchCancel: () => onKey(key, false),
  }), [onKey]);

  const btn = 'w-12 h-12 flex items-center justify-center rounded-lg bg-retro-bg/50 border border-retro-border/30 text-retro-muted/60 font-pixel text-sm select-none active:bg-retro-green/20 active:text-retro-green active:border-retro-green/40 transition-colors';
  const st = { touchAction: 'none' as const };

  return (
    <div className="absolute bottom-4 z-30 w-full px-4 flex justify-between items-end pointer-events-none select-none" style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}>
      <div className="pointer-events-auto grid grid-cols-3 gap-1" style={st}>
        <div />
        <button className={btn} style={st} {...mkH('w')}>▲</button>
        <div />
        <button className={btn} style={st} {...mkH('a')}>◄</button>
        <div className="w-12 h-12" />
        <button className={btn} style={st} {...mkH('d')}>►</button>
        <div />
        <button className={btn} style={st} {...mkH('s')}>▼</button>
        <div />
      </div>
      <div className="pointer-events-auto flex flex-col gap-2" style={st}>
        <button className={btn} style={st} {...mkH(' ')}>↑</button>
        <button className={btn} style={st} {...mkH('shift')}>↓</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  Chunk Manager — throttled, progressive, exposes chunkCache ref
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
  const pendingKeys = useRef<string[]>([]);
  const _dir = useMemo(() => new THREE.Vector3(), []);

  const noises = useMemo(() => ({
    height: createNoise2D(seed), detail: createNoise2D(seed + 1),
    biome: createNoise2D(seed + 2), temp: createNoise2D(seed + 3),
    tree: createNoise2D(seed + 4), struct: createNoise2D(seed + 5),
  }), [seed]);

  useFrame(() => {
    if (prevSeed.current !== seed) {
      prevSeed.current = seed;
      chunkCacheRef.current.clear();
      lastCamChunk.current = '';
      lastCamDir.current.set(0, 0, 0);
      pendingKeys.current = [];
    }

    const [ccx, ccz] = worldToChunk(camera.position.x, camera.position.z);
    const curKey = `${ccx},${ccz}`;
    const rd = config.renderDistance;

    // Detect camera rotation changes — round direction to avoid micro-jitter
    camera.getWorldDirection(_dir);
    const dx10 = Math.round(_dir.x * DIR_PRECISION);
    const dz10 = Math.round(_dir.z * DIR_PRECISION);
    const dirChanged = dx10 !== Math.round(lastCamDir.current.x * DIR_PRECISION)
                    || dz10 !== Math.round(lastCamDir.current.z * DIR_PRECISION);

    // Throttled generation
    let generated = 0;
    while (pendingKeys.current.length > 0 && generated < MAX_CHUNKS_PER_FRAME) {
      const pk = pendingKeys.current.shift()!;
      if (chunkCacheRef.current.has(pk)) continue;
      const [pcx, pcz] = pk.split(',').map(Number);
      const data = generateChunkData(pcx, pcz, noises.height, noises.detail, noises.biome, noises.temp, noises.tree, noises.struct, config);
      chunkCacheRef.current.set(pk, data);
      generated++;
    }

    // Recalculate visible chunks when position OR direction changes OR new chunks were generated
    if (curKey === lastCamChunk.current && !dirChanged && generated === 0) return;
    lastCamChunk.current = curKey;
    lastCamDir.current.copy(_dir);

    projMat.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(projMat.current);

    const newVisible = new Map<string, ChunkVoxelData>();
    const cws = CHUNK_SIZE * VOXEL_SIZE;
    const newPending: string[] = [];

    // Sort by PRIORITY: chunks in camera direction first, then by distance
    // This ensures the user never sees holes in their field of view
    const camDirX = _dir.x, camDirZ = _dir.z;
    const cands: { cx: number; cz: number; priority: number }[] = [];
    for (let ddx = -rd; ddx <= rd; ddx++) for (let ddz = -rd; ddz <= rd; ddz++) {
      const d2 = ddx * ddx + ddz * ddz;
      if (d2 > rd * rd) continue;
      // Priority: dot product with camera direction (higher = more in-view) + distance penalty
      const dot = ddx * camDirX + ddz * camDirZ;
      const priority = dot * VIEW_DIR_WEIGHT - d2 * DIST_PENALTY; // favour chunks in view direction
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

    // Pending queue: new in-view chunks first, then existing pending
    pendingKeys.current = [...newPending, ...pendingKeys.current.filter(k => !newPending.includes(k))];

    // Prune distant cache
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
 *  Config Slider
 * ═══════════════════════════════════════════════════════════════ */

function ConfigSlider({ label, value, onChange, min, max, step, color, displayValue }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; color: string; displayValue?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className={`font-pixel text-[8px] sm:text-[9px] ${color} uppercase tracking-wider select-none`}>{label}</label>
        <span className={`font-mono text-[9px] sm:text-[10px] ${color.replace('/80', '')} select-none`}>{displayValue ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full h-1 bg-retro-surface/80 rounded-full appearance-none cursor-pointer`}
        style={{ accentColor: color.includes('cyan') ? '#22d3ee' : color.includes('gold') ? '#fbbf24' : color.includes('green') ? '#4ade80' : color.includes('purple') ? '#c084fc' : '#94a3b8' }}
      />
    </div>
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
  // Shared chunk cache — used by ChunkManager for rendering AND by FlyCamera for collision
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
              Infinite procedural voxel worlds with cities, biomes, and floating icon pickups.
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
            <ConfigSlider label="Render Distance" value={config.renderDistance} onChange={v => updateConfig('renderDistance', v)} min={2} max={10} step={1} color="text-retro-cyan/80" displayValue={`${config.renderDistance} chunks`} />
            <ConfigSlider label="Fly Speed" value={config.flySpeed} onChange={v => updateConfig('flySpeed', v)} min={4} max={40} step={1} color="text-retro-gold/80" displayValue={String(config.flySpeed)} />
            <button onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-1.5 bg-retro-surface/40 hover:bg-retro-surface/60 border border-retro-border/30 rounded font-pixel text-[7px] sm:text-[8px] text-retro-muted/70 transition-all cursor-pointer select-none">
              {showAdvanced ? '▾ HIDE ADVANCED' : '▸ SHOW ADVANCED'}
            </button>
            {showAdvanced && (
              <div className="space-y-2.5 pt-1 border-t border-retro-border/20">
                <ConfigSlider label="Tree Density" value={config.treeDensity} onChange={v => updateConfig('treeDensity', v)} min={0} max={1} step={0.1} color="text-retro-green/80" displayValue={`${Math.round(config.treeDensity * 100)}%`} />
                <ConfigSlider label="Structure Density" value={config.structureDensity} onChange={v => updateConfig('structureDensity', v)} min={0} max={1} step={0.1} color="text-retro-gold/80" displayValue={`${Math.round(config.structureDensity * 100)}%`} />
                <ConfigSlider label="City Frequency" value={config.cityFrequency} onChange={v => updateConfig('cityFrequency', v)} min={0} max={1} step={0.1} color="text-retro-purple/80" displayValue={`${Math.round(config.cityFrequency * 100)}%`} />
                <ConfigSlider label="Pickup Density" value={config.pickupDensity} onChange={v => updateConfig('pickupDensity', v)} min={0} max={1} step={0.1} color="text-retro-cyan/80" displayValue={`${Math.round(config.pickupDensity * 100)}%`} />
                <ConfigSlider label="Fog Density" value={config.fogDensity} onChange={v => updateConfig('fogDensity', v)} min={0} max={1} step={0.1} color="text-retro-muted/80" displayValue={`${Math.round(config.fogDensity * 100)}%`} />
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
          <OverlayStats seed={seed} chunkCount={chunkCount} position={cameraPos} biome={currentBiome} />
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
          camera={{ fov: 65, near: 0.1, far: 300 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, toneMapping: THREE.NoToneMapping, powerPreference: 'high-performance' }}
          style={{ background: 'transparent', touchAction: 'none' }}
        >
          <SkyGradient />
          <FogEffect density={config.fogDensity} />
          <WorldLighting />
          <FlyCamera keysRef={keysRef} speedRef={speedRef} chunkCacheRef={chunkCacheRef} />
          <CameraLook isLocked={isLocked} isMobile={isMobile} />
          <ChunkManagerWithCounter seed={seed} config={config} onChunkCount={handleChunkCount} chunkCacheRef={chunkCacheRef} />
          <CameraTracker onUpdate={handleCameraUpdate} biomeNoise={noises.biome} tempNoise={noises.temp} cityFreq={config.cityFrequency} />
        </Canvas>
      </div>
    </div>
  );
}
