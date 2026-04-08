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

/* ═══════════════════════════════════════════════════════════
 *  World Configuration — user-adjustable
 * ═══════════════════════════════════════════════════════════ */

interface WorldConfig {
  renderDistance: number;
  flySpeed: number;
  treeDensity: number;      // 0-1
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

/* ═══════════════════════════════════════════════════════════
 *  Seeded PRNG — mulberry32
 * ═══════════════════════════════════════════════════════════ */

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ═══════════════════════════════════════════════════════════
 *  Seeded 2D Perlin Noise (optimized — inlined fade/lerp/dot)
 * ═══════════════════════════════════════════════════════════ */

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
    const xi = Math.floor(x);
    const yi = Math.floor(y);
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

function fbm(noise: (x: number, y: number) => number, x: number, y: number, octaves: number, lac = 2.0, gain = 0.5): number {
  let val = 0, amp = 1, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    val += noise(x * freq, y * freq) * amp;
    max += amp; amp *= gain; freq *= lac;
  }
  return val / max;
}

/* ═══════════════════════════════════════════════════════════
 *  Biome System
 * ═══════════════════════════════════════════════════════════ */

type BiomeType = 'plains' | 'desert' | 'tundra' | 'forest' | 'mountains' | 'ocean' | 'city';

interface BiomeConfig {
  name: string;
  heightScale: number;
  heightBase: number;
  waterLevel: number;
  colors: { top: string[]; mid: string[]; bottom: string[]; accent: string[]; water: string };
}

const BIOMES: Record<BiomeType, BiomeConfig> = {
  plains: {
    name: 'Plains', heightScale: 5, heightBase: 7, waterLevel: 5,
    colors: { top: ['#66ee88', '#77ff99', '#55dd77', '#88ffaa', '#5cd97a'], mid: ['#cc8844', '#dd9955', '#bb7733'], bottom: ['#99aabb', '#aabbcc', '#889999'], accent: ['#ff9999', '#ffdd66', '#ccaaff'], water: '#88ddff' },
  },
  desert: {
    name: 'Desert', heightScale: 4, heightBase: 6, waterLevel: 2,
    colors: { top: ['#ffeecc', '#fff5dd', '#ffe8bb', '#ffdda0'], mid: ['#ddbb88', '#ccaa77', '#bb9966'], bottom: ['#aa8866', '#997755', '#886644'], accent: ['#88cc55', '#559944'], water: '#66bbdd' },
  },
  tundra: {
    name: 'Tundra', heightScale: 6, heightBase: 7, waterLevel: 4,
    colors: { top: ['#eef4ff', '#f4f8ff', '#ffffff', '#e8eeff'], mid: ['#99aabb', '#aabbcc', '#8899aa'], bottom: ['#778899', '#667788', '#556677'], accent: ['#aaddff', '#88bbdd'], water: '#77ccee' },
  },
  forest: {
    name: 'Forest', heightScale: 7, heightBase: 8, waterLevel: 5,
    colors: { top: ['#339955', '#44aa66', '#22884d', '#55bb77'], mid: ['#886644', '#775533', '#664422'], bottom: ['#556655', '#667766', '#445544'], accent: ['#ee5544', '#ff6655'], water: '#55aacc' },
  },
  mountains: {
    name: 'Mountains', heightScale: 18, heightBase: 5, waterLevel: 3,
    colors: { top: ['#bbccdd', '#ccddee', '#aabbcc', '#99aabb'], mid: ['#8899aa', '#99aabb', '#7788aa'], bottom: ['#667788', '#556677', '#778899'], accent: ['#eef4ff', '#ffffff', '#e0e8f0'], water: '#6699bb' },
  },
  ocean: {
    name: 'Ocean', heightScale: 3, heightBase: 2, waterLevel: 8,
    colors: { top: ['#ffeecc', '#fff5dd', '#ffe8bb'], mid: ['#ddcc99', '#ccbb88', '#bbaa77'], bottom: ['#99aabb', '#aabbcc', '#889999'], accent: ['#ff9999', '#ffcc66'], water: '#4499cc' },
  },
  city: {
    name: 'City', heightScale: 2, heightBase: 7, waterLevel: 5,
    colors: { top: ['#888888', '#999999', '#777777', '#aaaaaa'], mid: ['#666666', '#777777', '#555555'], bottom: ['#444444', '#555555', '#333333'], accent: ['#ffdd44', '#ff9944', '#44ddff'], water: '#88ddff' },
  },
};

/* ═══════════════════════════════════════════════════════════
 *  Constants
 * ═══════════════════════════════════════════════════════════ */

const CHUNK_SIZE = 16;
const VOXEL_SIZE = 0.5;
const MAX_HEIGHT = 32;
const MAX_CHUNKS_PER_FRAME = 2;

function chunkKey(cx: number, cz: number): string { return `${cx},${cz}`; }
function worldToChunk(wx: number, wz: number): [number, number] {
  return [Math.floor(wx / (CHUNK_SIZE * VOXEL_SIZE)), Math.floor(wz / (CHUNK_SIZE * VOXEL_SIZE))];
}

/* ═══════════════════════════════════════════════════════════
 *  Biome Determination
 * ═══════════════════════════════════════════════════════════ */

function getBiome(
  biomeNoise: (x: number, y: number) => number,
  tempNoise: (x: number, y: number) => number,
  wx: number, wz: number,
  cityFreq: number,
): BiomeType {
  const temp = fbm(tempNoise, wx * 0.005, wz * 0.005, 2);
  const moisture = fbm(biomeNoise, wx * 0.004 + 100, wz * 0.004 + 100, 2);
  // City zones — clusters driven by low-frequency noise
  const cityVal = biomeNoise(wx * 0.003 + 500, wz * 0.003 + 500);
  if (cityVal > 0.55 - cityFreq * 0.3 && temp > -0.15 && moisture < 0.25) return 'city';
  if (temp < -0.25) return 'tundra';
  if (temp > 0.3 && moisture < -0.1) return 'desert';
  if (moisture > 0.3) return 'ocean';
  if (temp > 0.0 && moisture > 0.05) return 'forest';
  if (biomeNoise(wx * 0.008, wz * 0.008) > 0.2) return 'mountains';
  return 'plains';
}

/* ═══════════════════════════════════════════════════════════
 *  Icon Pickup Data — convert PxlKit icons to flat voxel billboards
 * ═══════════════════════════════════════════════════════════ */

interface PickupVoxel { x: number; y: number; color: string }

function iconToPickupVoxels(icon: PxlKitData): PickupVoxel[] {
  const voxels: PickupVoxel[] = [];
  const { grid, palette, size } = icon;
  for (let row = 0; row < size; row++) {
    const rowStr = grid[row];
    if (!rowStr) continue;
    for (let col = 0; col < size; col++) {
      const ch = rowStr[col];
      if (!ch || ch === '.') continue;
      const color = palette[ch];
      if (!color) continue;
      voxels.push({ x: col, y: size - 1 - row, color });
    }
  }
  return voxels;
}

const PICKUP_ICONS: { icon: PxlKitData; voxels: PickupVoxel[] }[] = [
  Trophy, Star, Coin, Crown, Gem, Shield, Lightning, Key, Sword,
  Heart, Check, Package, SparkleSmall, Robot, Sun, Moon, Snowflake,
].map(icon => ({ icon, voxels: iconToPickupVoxels(icon) }));

/* ═══════════════════════════════════════════════════════════
 *  Chunk Data Generation — terrain + structures + pickups
 * ═══════════════════════════════════════════════════════════ */

interface ChunkVoxelData {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
  waterPositions: Float32Array;
  waterColors: Float32Array;
  waterCount: number;
  pickups: { wx: number; wy: number; wz: number; iconIdx: number }[];
  // Heightmap for collision: max solid height at each (lx,lz) including structures
  solidHeightMap: Int32Array; // CHUNK_SIZE * CHUNK_SIZE, indexed [lx * CHUNK_SIZE + lz]
  chunkX: number;
  chunkZ: number;
}

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
  const maxV = CHUNK_SIZE * CHUNK_SIZE * 14;
  const posA = new Float32Array(maxV * 3);
  const colA = new Float32Array(maxV * 3);
  let sc = 0;
  const maxW = CHUNK_SIZE * CHUNK_SIZE * 10;
  const wPosA = new Float32Array(maxW * 3);
  const wColA = new Float32Array(maxW * 3);
  let wc = 0;
  const pickups: ChunkVoxelData['pickups'] = [];
  // Track max solid height at each column for collision
  const solidHeightMap = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);

  const bX = cx * CHUNK_SIZE, bZ = cz * CHUNK_SIZE;
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
      let h = fbm(heightN, wx * 0.02, wz * 0.02, 4, 2.0, 0.5);
      const det = detailN(wx * 0.08, wz * 0.08) * 0.25;
      let extra = 0;
      if (biome === 'mountains') {
        extra = Math.abs(fbm(detailN, wx * 0.015 + 200, wz * 0.015 + 200, 2)) * 6;
      }
      if (biome === 'city') {
        h = 0; // flat terrain for cities
      }
      const height = Math.max(0, Math.min(MAX_HEIGHT, Math.floor(c.heightBase + (h + det) * c.heightScale + extra)));
      hMap[idx] = height;
      bMap[idx] = bTypes.indexOf(biome);
    }
  }

  function push(px: number, py: number, pz: number, hex: string) {
    if (sc >= maxV) return;
    const i3 = sc * 3;
    posA[i3] = px; posA[i3 + 1] = py; posA[i3 + 2] = pz;
    _tc.set(hex); colA[i3] = _tc.r; colA[i3 + 1] = _tc.g; colA[i3 + 2] = _tc.b;
    sc++;
  }
  // Track the tallest solid voxel placed at each column (for collision)
  function trackHeight(lx: number, lz: number, yTop: number) {
    if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
      const idx2 = lx * CHUNK_SIZE + lz;
      if (yTop > solidHeightMap[idx2]) solidHeightMap[idx2] = yTop;
    }
  }
  function pushW(px: number, py: number, pz: number, hex: string) {
    if (wc >= maxW) return;
    const i3 = wc * 3;
    wPosA[i3] = px; wPosA[i3 + 1] = py; wPosA[i3 + 2] = pz;
    _tc.set(hex); wColA[i3] = _tc.r; wColA[i3 + 1] = _tc.g; wColA[i3 + 2] = _tc.b;
    wc++;
  }

  // Seeded random for this chunk
  const chunkRand = mulberry32(cx * 73856093 + cz * 19349663);

  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const idx = (lx + 1) * gW + (lz + 1);
      const h = hMap[idx];
      const biome = bTypes[bMap[idx]];
      const c = BIOMES[biome];
      const wx = bX + lx, wz = bZ + lz;
      const hN = hMap[(lx + 1) * gW + lz];
      const hS = hMap[(lx + 1) * gW + (lz + 2)];
      const hE = hMap[(lx + 2) * gW + (lz + 1)];
      const hW = hMap[lx * gW + (lz + 1)];

      // ── Terrain voxels ──
      // Render surface + any voxel exposed to air, water, or chunk edge.
      // This ensures no hollow gaps are visible.
      const wl = c.waterLevel;
      const effectiveTop = Math.max(h, wl); // columns under water need walls visible through water
      for (let y = 0; y <= h; y++) {
        const isTop = y === h;
        // A voxel is exposed if it's the top, bottom, or any neighbor is shorter
        // For underwater columns, also expose sides that face water
        const exposedN = y > hN || (y > h && y <= wl);
        const exposedS = y > hS || (y > h && y <= wl);
        const exposedE = y > hE || (y > h && y <= wl);
        const exposedW2 = y > hW || (y > h && y <= wl);
        const hasExposed = isTop || y === 0 || exposedN || exposedS || exposedE || exposedW2;
        if (!hasExposed) continue;
        let col: string;
        if (isTop) {
          col = (biome === 'mountains' && y > 16) ? c.colors.accent[Math.abs(wx + wz) % c.colors.accent.length]
            : c.colors.top[Math.abs(wx + wz) % c.colors.top.length];
        } else if (y >= h - 3) {
          col = c.colors.mid[Math.abs(wx + y) % c.colors.mid.length];
        } else {
          col = c.colors.bottom[Math.abs(wx + y + wz) % c.colors.bottom.length];
        }
        push((bX + lx) * VOXEL_SIZE, y * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, col);
      }
      trackHeight(lx, lz, h);

      // ── Water — fill ALL voxels from terrain surface+1 to waterLevel ──
      // This creates solid water with no gaps. Edges cascade naturally because
      // neighboring columns with lower terrain will also have water voxels.
      if (h < wl) {
        for (let wy = h + 1; wy <= wl; wy++) {
          // Only render water voxels that have an exposed face
          const isWTop = wy === wl;
          const wExpN = wy > hN && hN < wl;  // neighbor is lower → side exposed
          const wExpS = wy > hS && hS < wl;
          const wExpE = wy > hE && hE < wl;
          const wExpW = wy > hW && hW < wl;
          const wExposed = isWTop || wy === h + 1 || wExpN || wExpS || wExpE || wExpW;
          if (!wExposed) continue;
          pushW((bX + lx) * VOXEL_SIZE, wy * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, c.colors.water);
        }
        // Water counts as collision surface too
        trackHeight(lx, lz, wl);
      }

      // ── CITY BIOME — roads, buildings, lampposts ──
      if (biome === 'city') {
        // Road grid: every 8 blocks in X or Z is a road (2 blocks wide)
        const roadX = (((wx % 8) + 8) % 8) < 2;
        const roadZ = (((wz % 8) + 8) % 8) < 2;
        const isRoad = roadX || roadZ;
        const isIntersection = roadX && roadZ;

        if (isRoad) {
          // Road surface — dark asphalt
          push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            isIntersection ? '#555555' : '#444444');
          trackHeight(lx, lz, h + 1);
          // Road markings — center line (dashed yellow) for Z-roads
          if (roadZ && !roadX && (((wz % 8) + 8) % 8) === 0 && (((wx % 4) + 4) % 4) < 2) {
            push((bX + lx) * VOXEL_SIZE, (h + 1.1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffdd44');
          }
          // Lampposts at intersections
          if (isIntersection && (((wx % 8) + 8) % 8) === 0 && (((wz % 8) + 8) % 8) === 0) {
            for (let ly = 2; ly <= 6; ly++) {
              push((bX + lx) * VOXEL_SIZE, (h + ly) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#666666');
            }
            push((bX + lx) * VOXEL_SIZE, (h + 7) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffee88');
            push((bX + lx + 1) * VOXEL_SIZE, (h + 6) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#666666');
            push((bX + lx + 1) * VOXEL_SIZE, (h + 7) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffee88');
            trackHeight(lx, lz, h + 7);
          }
        } else {
          // Building lot — use noise to determine building type
          const lotX = Math.floor(((wx % 8) + 8) % 8) - 2; // 0-5 within lot
          const lotZ = Math.floor(((wz % 8) + 8) % 8) - 2;
          const blockCx = Math.floor(wx / 8), blockCz = Math.floor(wz / 8);
          const buildVal = structN(blockCx * 0.5, blockCz * 0.5);
          const buildType = Math.abs(buildVal) < 0.15 ? 0 // park/empty
            : buildVal > 0.3 ? 2 // tall building
            : buildVal > 0 ? 1 // medium building
            : 3; // small house

          if (lotX >= 0 && lotX < 5 && lotZ >= 0 && lotZ < 5) {
            if (buildType === 0) {
              // Park — maybe a tree
              if (lotX === 2 && lotZ === 2 && cfg.treeDensity > 0.2) {
                for (let ty = 1; ty <= 3; ty++) push((bX + lx) * VOXEL_SIZE, (h + ty) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#664422');
                for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
                  push((bX + lx + dx) * VOXEL_SIZE, (h + 4) * VOXEL_SIZE, (bZ + lz + dz) * VOXEL_SIZE, '#44aa66');
                  if (dx === 0 || dz === 0) push((bX + lx + dx) * VOXEL_SIZE, (h + 5) * VOXEL_SIZE, (bZ + lz + dz) * VOXEL_SIZE, '#44aa66');
                }
              }
            } else {
              // Building
              const bh = buildType === 2 ? 8 + Math.abs(Math.floor(structN(blockCx * 3.7, blockCz * 3.7) * 14))
                : buildType === 1 ? 4 + Math.abs(Math.floor(structN(blockCx * 2.3, blockCz * 2.3) * 6))
                : 3;
              const isEdge = lotX === 0 || lotX === 4 || lotZ === 0 || lotZ === 4;
              const wallColors = buildType === 2 ? ['#8899aa', '#99aabb', '#7788aa', '#aabbcc']
                : buildType === 1 ? ['#bbaa88', '#ccbb99', '#aa9977']
                : ['#ddccaa', '#ccbb99', '#eeddbb'];
              const windowColor = '#aaddff';
              const roofColor = buildType === 2 ? '#556677' : '#cc6633';

              for (let by = 1; by <= bh; by++) {
                if (!isEdge && by < bh) continue; // Only walls + roof
                const isWindow = by > 1 && by < bh && (by % 2 === 0) && !isEdge;
                let color: string;
                if (by === bh) {
                  color = roofColor;
                } else if (isEdge && by > 1 && by < bh && (by % 2 === 0) && ((lotX === 0 || lotX === 4) ? (lotZ === 2) : (lotX === 2))) {
                  color = windowColor;
                } else {
                  color = wallColors[Math.abs(wx + by) % wallColors.length];
                }
                push((bX + lx) * VOXEL_SIZE, (h + by) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, isWindow ? windowColor : color);
              }
              trackHeight(lx, lz, h + bh);
            }
          }
        }
        continue; // Skip natural decorations for city
      }

      // ── Trees (sparser based on config) ──
      if ((biome === 'plains' || biome === 'forest') && h > c.waterLevel + 1 && lx > 1 && lx < CHUNK_SIZE - 2 && lz > 1 && lz < CHUNK_SIZE - 2) {
        const tv = treeN(wx * 0.6, wz * 0.6);
        const baseT = biome === 'forest' ? 0.22 : 0.40;
        const threshold = baseT + (1 - cfg.treeDensity) * 0.25;
        if (tv > threshold) {
          const trunkH = biome === 'forest' ? 3 + (Math.abs(wx * 13 + wz * 7) % 3) : 2 + (Math.abs(wx * 7 + wz) % 2);
          const tc2 = biome === 'forest' ? '#664422' : '#AA7744';
          const lcs = biome === 'forest' ? ['#339955', '#44aa66', '#22884d'] : ['#44dd66', '#55ee77', '#66ff88'];
          const lc = lcs[Math.abs(wx * 3 + wz * 5) % lcs.length];
          for (let ty = 1; ty <= trunkH; ty++) push((bX + lx) * VOXEL_SIZE, (h + ty) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, tc2);
          const cr = 2, cy2 = h + trunkH + cr;
          for (let dx = -cr; dx <= cr; dx++) for (let dy = -cr; dy <= cr; dy++) for (let dz = -cr; dz <= cr; dz++) {
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 > cr * cr + 0.5 || (cr > 1 && d2 < (cr - 1) * (cr - 1))) continue;
            push((bX + lx + dx) * VOXEL_SIZE, (cy2 + dy) * VOXEL_SIZE, (bZ + lz + dz) * VOXEL_SIZE, lc);
          }
          trackHeight(lx, lz, cy2 + cr);
        }
      }

      // ── Cacti in desert ──
      if (biome === 'desert' && h > c.waterLevel && lx > 0 && lx < CHUNK_SIZE - 1 && lz > 0 && lz < CHUNK_SIZE - 1) {
        if (treeN(wx * 0.7 + 50, wz * 0.7 + 50) > 0.46) {
          const ch2 = 3 + (Math.abs(wx * 11 + wz * 3) % 3);
          for (let cy = 1; cy <= ch2; cy++) push((bX + lx) * VOXEL_SIZE, (h + cy) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#55aa44');
          trackHeight(lx, lz, h + ch2);
          if (ch2 > 3) {
            push((bX + lx + 1) * VOXEL_SIZE, (h + 3) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#66bb55');
            push((bX + lx + 1) * VOXEL_SIZE, (h + 4) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#66bb55');
          }
        }
      }

      // ── Pyramids in desert ──
      if (biome === 'desert' && lx >= 1 && lx <= CHUNK_SIZE - 6 && lz >= 1 && lz <= CHUNK_SIZE - 6) {
        const pyrVal = structN(wx * 0.06 + 100, wz * 0.06 + 100);
        if (pyrVal > 0.52 - cfg.structureDensity * 0.1 && Math.abs(wx % 14) < 1 && Math.abs(wz % 14) < 1) {
          const pyrSize = 4;
          for (let layer = 0; layer < pyrSize; layer++) {
            const w = pyrSize - layer;
            for (let px = -w; px <= w; px++) for (let pz = -w; pz <= w; pz++) {
              push((bX + lx + px) * VOXEL_SIZE, (h + layer + 1) * VOXEL_SIZE, (bZ + lz + pz) * VOXEL_SIZE,
                layer === pyrSize - 1 ? '#FFD700' : '#ddbb77');
            }
          }
          trackHeight(lx, lz, h + pyrSize);
        }
      }

      // ── Small houses in plains/forest ──
      if ((biome === 'plains' || biome === 'forest') && h > c.waterLevel + 1 && lx >= 2 && lx <= CHUNK_SIZE - 5 && lz >= 2 && lz <= CHUNK_SIZE - 5) {
        const hv = structN(wx * 0.12, wz * 0.12);
        if (hv > 0.50 - cfg.structureDensity * 0.12 && Math.abs(wx % 11) < 1 && Math.abs(wz % 13) < 1) {
          const wc2 = biome === 'forest' ? '#8B7355' : '#D4C5A9';
          const rc = biome === 'forest' ? '#8B4513' : '#CC6633';
          for (let hx = 0; hx < 3; hx++) for (let hz = 0; hz < 3; hz++) for (let hy = 1; hy <= 3; hy++) {
            if (hx === 1 && hz === 1) continue;
            if (hx === 1 && hz === 0 && hy <= 2) continue;
            const color = hy === 2 && ((hx === 0 && hz === 1) || (hx === 2 && hz === 1)) ? '#AADDFF' : wc2;
            push((bX + lx + hx) * VOXEL_SIZE, (h + hy) * VOXEL_SIZE, (bZ + lz + hz) * VOXEL_SIZE, color);
          }
          for (let rx = -1; rx <= 3; rx++) for (let rz = -1; rz <= 3; rz++)
            push((bX + lx + rx) * VOXEL_SIZE, (h + 4) * VOXEL_SIZE, (bZ + lz + rz) * VOXEL_SIZE, rc);
          for (let rx = 0; rx <= 2; rx++) for (let rz = 0; rz <= 2; rz++)
            push((bX + lx + rx) * VOXEL_SIZE, (h + 5) * VOXEL_SIZE, (bZ + lz + rz) * VOXEL_SIZE, rc);
          trackHeight(lx, lz, h + 5);
        }
      }

      // ── Rock formations in tundra/mountains ──
      if ((biome === 'tundra' || biome === 'mountains') && h > c.waterLevel && lx > 1 && lx < CHUNK_SIZE - 2 && lz > 1 && lz < CHUNK_SIZE - 2) {
        if (structN(wx * 0.4 + 300, wz * 0.4 + 300) > 0.44) {
          const rh = 1 + (Math.abs(wx * 7 + wz * 3) % 3);
          const rc = biome === 'tundra' ? '#8899aa' : '#667788';
          for (let ry = 1; ry <= rh; ry++) push((bX + lx) * VOXEL_SIZE, (h + ry) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, rc);
          trackHeight(lx, lz, h + rh);
          if (rh > 1) {
            push((bX + lx + 1) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, rc);
            push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz + 1) * VOXEL_SIZE, rc);
          }
        }
      }

      // ── Floating icon pickups ──
      if (cfg.pickupDensity > 0 && lx === 8 && lz === 8) {
        const pv = chunkRand();
        if (pv < cfg.pickupDensity * 0.15) {
          const iconIdx = Math.floor(chunkRand() * PICKUP_ICONS.length);
          pickups.push({
            wx: (bX + lx) * VOXEL_SIZE,
            wy: (h + 6) * VOXEL_SIZE,
            wz: (bZ + lz) * VOXEL_SIZE,
            iconIdx,
          });
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

/* ═══════════════════════════════════════════════════════════
 *  Shared geometry & materials
 * ═══════════════════════════════════════════════════════════ */

const VOXEL_GAP = VOXEL_SIZE * 0.92;
const sharedGeo = new THREE.BoxGeometry(VOXEL_GAP, VOXEL_GAP, VOXEL_GAP);
const sharedSolidMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
const sharedWaterMat = new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.6, depthWrite: false });

/* ═══════════════════════════════════════════════════════════
 *  Chunk Mesh — zero per-chunk alloc for geo/mat
 * ═══════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════
 *  Floating Icon Pickup — rendered as flat voxel sprite
 * ═══════════════════════════════════════════════════════════ */

const pickupPixelSize = VOXEL_SIZE * 0.18;
const pickupGeo = new THREE.BoxGeometry(pickupPixelSize, pickupPixelSize, pickupPixelSize * 0.3);
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
    const halfSize = icon.size / 2;
    for (let i = 0; i < count; i++) {
      const v = voxels[i];
      m.identity();
      m.elements[12] = (v.x - halfSize) * pickupPixelSize;
      m.elements[13] = (v.y - halfSize) * pickupPixelSize;
      m.elements[14] = 0;
      mesh.setMatrixAt(i, m);
      c.set(v.color);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, voxels, icon.size]);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.rotation.y = t * 1.2;
    g.position.y = baseY.current + Math.sin(t * 2) * 0.3;
  });

  return (
    <group ref={groupRef} position={position}>
      {count > 0 && <instancedMesh ref={meshRef} args={[pickupGeo, pickupMat, count]} />}
      {/* Glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <ringGeometry args={[0.3, 0.5, 16]} />
        <meshBasicMaterial color="#ffdd44" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Collision helper — query solid height from chunk cache
 * ═══════════════════════════════════════════════════════════ */

// Height of player's collision capsule above terrain in voxel-space
const PLAYER_HEIGHT = 1.5;

function getSolidHeight(chunkCache: Map<string, ChunkVoxelData>, worldX: number, worldZ: number): number {
  // Convert world position to voxel grid coordinates
  const vx = worldX / VOXEL_SIZE;
  const vz = worldZ / VOXEL_SIZE;
  const cx = Math.floor(vx / CHUNK_SIZE);
  const cz = Math.floor(vz / CHUNK_SIZE);
  const key = chunkKey(cx, cz);
  const data = chunkCache.get(key);
  if (!data) return 0;
  const lx = Math.floor(vx - cx * CHUNK_SIZE);
  const lz = Math.floor(vz - cz * CHUNK_SIZE);
  if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return 0;
  return data.solidHeightMap[lx * CHUNK_SIZE + lz];
}

/* ═══════════════════════════════════════════════════════════
 *  Fly Camera — with collision detection
 * ═══════════════════════════════════════════════════════════ */

function FlyCamera({ keysRef, speedRef, chunkCacheRef }: {
  keysRef: React.RefObject<Set<string>>;
  speedRef: React.RefObject<number>;
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
}) {
  const { camera } = useThree();
  const _d = useMemo(() => new THREE.Vector3(), []);
  const _r = useMemo(() => new THREE.Vector3(), []);
  const _prevPos = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => { camera.position.set(0, 12, 20); camera.lookAt(0, 6, 0); }, [camera]);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    if (!keys || keys.size === 0) return;
    const spd = (speedRef.current ?? 12) * delta;

    // Save previous position for rollback
    _prevPos.copy(camera.position);

    camera.getWorldDirection(_d);
    _r.crossVectors(_d, camera.up).normalize();
    if (keys.has('w') || keys.has('arrowup')) camera.position.addScaledVector(_d, spd);
    if (keys.has('s') || keys.has('arrowdown')) camera.position.addScaledVector(_d, -spd);
    if (keys.has('a') || keys.has('arrowleft')) camera.position.addScaledVector(_r, -spd);
    if (keys.has('d') || keys.has('arrowright')) camera.position.addScaledVector(_r, spd);
    if (keys.has(' ')) camera.position.addScaledVector(camera.up, spd);
    if (keys.has('shift')) camera.position.addScaledVector(camera.up, -spd);

    // Collision: don't let camera go below solid terrain + player height
    const cache = chunkCacheRef.current;
    if (cache && cache.size > 0) {
      const terrainH = getSolidHeight(cache, camera.position.x, camera.position.z);
      const minY = (terrainH + PLAYER_HEIGHT) * VOXEL_SIZE;
      if (camera.position.y < minY) {
        camera.position.y = minY;
      }
      // Also check horizontal collision: if the new X/Z position is inside a tall column,
      // push back to previous position on that axis
      const newTerrainH = getSolidHeight(cache, camera.position.x, camera.position.z);
      const newMinY = (newTerrainH + PLAYER_HEIGHT) * VOXEL_SIZE;
      if (camera.position.y < newMinY) {
        // Try sliding along X only
        const hAtOldX = getSolidHeight(cache, _prevPos.x, camera.position.z);
        const hAtOldZ = getSolidHeight(cache, camera.position.x, _prevPos.z);
        if ((hAtOldX + PLAYER_HEIGHT) * VOXEL_SIZE <= camera.position.y) {
          camera.position.x = _prevPos.x; // slide along Z
        } else if ((hAtOldZ + PLAYER_HEIGHT) * VOXEL_SIZE <= camera.position.y) {
          camera.position.z = _prevPos.z; // slide along X
        } else {
          camera.position.y = newMinY; // push up
        }
      }
    }
  });
  return null;
}

/* ═══════════════════════════════════════════════════════════
 *  Mouse Look (desktop) + Touch Look (mobile)
 * ═══════════════════════════════════════════════════════════ */

function CameraLook({ isLocked, isMobile }: { isLocked: boolean; isMobile: boolean }) {
  const { camera, gl } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const touchIdRef = useRef<number | null>(null);
  const lastTouchRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isLocked) return;
    euler.current.setFromQuaternion(camera.quaternion);
    const canvas = gl.domElement;

    const applyRotation = (dx: number, dy: number, sensitivity: number) => {
      euler.current.y -= dx * sensitivity;
      euler.current.x -= dy * sensitivity;
      euler.current.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    // Desktop: mouse move
    const onMouseMove = (e: MouseEvent) => { applyRotation(e.movementX, e.movementY, 0.002); };

    // Mobile: touch drag on canvas for camera rotation
    const onTouchStart = (e: TouchEvent) => {
      // Only track touches that start on the canvas (not on UI buttons)
      if (touchIdRef.current !== null) return;
      const t = e.changedTouches[0];
      touchIdRef.current = t.identifier;
      lastTouchRef.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchIdRef.current) {
          const dx = t.clientX - lastTouchRef.current.x;
          const dy = t.clientY - lastTouchRef.current.y;
          lastTouchRef.current = { x: t.clientX, y: t.clientY };
          applyRotation(dx, dy, 0.004);
          break;
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          touchIdRef.current = null;
          break;
        }
      }
    };

    if (isMobile) {
      canvas.addEventListener('touchstart', onTouchStart, { passive: true });
      canvas.addEventListener('touchmove', onTouchMove, { passive: true });
      canvas.addEventListener('touchend', onTouchEnd, { passive: true });
      canvas.addEventListener('touchcancel', onTouchEnd, { passive: true });
    } else {
      canvas.addEventListener('mousemove', onMouseMove);
    }

    return () => {
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isLocked, isMobile, camera, gl]);

  return null;
}

/* ═══════════════════════════════════════════════════════════
 *  Lighting
 * ═══════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════
 *  Sky + Fog
 * ═══════════════════════════════════════════════════════════ */

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
  const d = 0.005 + density * 0.02;
  return <fogExp2 attach="fog" args={['#b0c8e0', d]} />;
}

/* ═══════════════════════════════════════════════════════════
 *  Stats Overlay
 * ═══════════════════════════════════════════════════════════ */

function OverlayStats({ seed, chunkCount, position, biome }: { seed: number; chunkCount: number; position: [number, number, number]; biome: string }) {
  return (
    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 font-mono text-[9px] sm:text-[10px] space-y-0.5 pointer-events-none select-none">
      <div className="text-retro-green/70">SEED: <span className="text-retro-green">{seed}</span></div>
      <div className="text-retro-cyan/70">BIOME: <span className="text-retro-cyan">{biome}</span></div>
      <div className="text-retro-gold/70">POS: <span className="text-retro-gold">{position[0].toFixed(0)}, {position[1].toFixed(0)}, {position[2].toFixed(0)}</span></div>
      <div className="text-retro-purple/70">CHUNKS: <span className="text-retro-purple">{chunkCount}</span></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Camera Tracker
 * ═══════════════════════════════════════════════════════════ */

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
      const wx = camera.position.x / VOXEL_SIZE, wz = camera.position.z / VOXEL_SIZE;
      biome = BIOMES[getBiome(biomeNoise, tempNoise, wx, wz, cityFreq)].name;
    }
    onUpdate(pos, biome);
  });
  return null;
}

/* ═══════════════════════════════════════════════════════════
 *  Mobile Touch Controls — non-selectable, touch-action:none
 * ═══════════════════════════════════════════════════════════ */

function MobileTouchControls({ onKey }: { onKey: (key: string, active: boolean) => void }) {
  const mkH = useCallback((key: string) => ({
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); e.stopPropagation(); onKey(key, true); },
    onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); e.stopPropagation(); onKey(key, false); },
    onTouchCancel: () => onKey(key, false),
  }), [onKey]);

  const btn = 'w-12 h-12 flex items-center justify-center rounded-lg bg-retro-bg/50 border border-retro-border/30 text-retro-muted/60 font-pixel text-sm select-none active:bg-retro-green/20 active:text-retro-green active:border-retro-green/40 transition-colors';

  return (
    <div className="absolute bottom-4 z-30 w-full px-4 flex justify-between items-end pointer-events-none select-none" style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}>
      <div className="pointer-events-auto grid grid-cols-3 gap-1" style={{ touchAction: 'none' }}>
        <div />
        <button className={btn} style={{ touchAction: 'none' }} {...mkH('w')}>▲</button>
        <div />
        <button className={btn} style={{ touchAction: 'none' }} {...mkH('a')}>◄</button>
        <div className="w-12 h-12" />
        <button className={btn} style={{ touchAction: 'none' }} {...mkH('d')}>►</button>
        <div />
        <button className={btn} style={{ touchAction: 'none' }} {...mkH('s')}>▼</button>
        <div />
      </div>
      <div className="pointer-events-auto flex flex-col gap-2" style={{ touchAction: 'none' }}>
        <button className={btn} style={{ touchAction: 'none' }} {...mkH(' ')}>↑</button>
        <button className={btn} style={{ touchAction: 'none' }} {...mkH('shift')}>↓</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Chunk Manager — throttled generation, progressive loading
 * ═══════════════════════════════════════════════════════════ */

function ChunkManagerWithCounter({ seed, config, onChunkCount }: {
  seed: number; config: WorldConfig; onChunkCount: (count: number) => void;
}) {
  const { camera } = useThree();
  const chunkCache = useRef<Map<string, ChunkVoxelData>>(new Map());
  const [visibleChunks, setVisibleChunks] = useState<Map<string, ChunkVoxelData>>(new Map());
  const lastCamChunk = useRef('');
  const frustum = useRef(new THREE.Frustum());
  const projMat = useRef(new THREE.Matrix4());
  const prevSeed = useRef(seed);
  const pendingKeys = useRef<string[]>([]);

  const noises = useMemo(() => ({
    height: createNoise2D(seed), detail: createNoise2D(seed + 1),
    biome: createNoise2D(seed + 2), temp: createNoise2D(seed + 3),
    tree: createNoise2D(seed + 4), struct: createNoise2D(seed + 5),
  }), [seed]);

  useFrame(() => {
    if (prevSeed.current !== seed) {
      prevSeed.current = seed;
      chunkCache.current.clear();
      lastCamChunk.current = '';
      pendingKeys.current = [];
    }

    const [ccx, ccz] = worldToChunk(camera.position.x, camera.position.z);
    const curKey = `${ccx},${ccz}`;
    const rd = config.renderDistance;

    // Generate pending chunks (throttled)
    let generated = 0;
    while (pendingKeys.current.length > 0 && generated < MAX_CHUNKS_PER_FRAME) {
      const pk = pendingKeys.current.shift()!;
      if (chunkCache.current.has(pk)) continue;
      const [pcx, pcz] = pk.split(',').map(Number);
      const data = generateChunkData(pcx, pcz, noises.height, noises.detail, noises.biome, noises.temp, noises.tree, noises.struct, config);
      chunkCache.current.set(pk, data);
      generated++;
    }

    if (curKey === lastCamChunk.current && generated === 0) return;
    lastCamChunk.current = curKey;

    projMat.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(projMat.current);

    const newVisible = new Map<string, ChunkVoxelData>();
    const cws = CHUNK_SIZE * VOXEL_SIZE;
    const newPending: string[] = [];

    // Sort chunks by distance (nearest first)
    const candidates: { cx: number; cz: number; dist: number }[] = [];
    for (let dx = -rd; dx <= rd; dx++) for (let dz = -rd; dz <= rd; dz++) {
      if (dx * dx + dz * dz > rd * rd) continue;
      candidates.push({ cx: ccx + dx, cz: ccz + dz, dist: dx * dx + dz * dz });
    }
    candidates.sort((a, b) => a.dist - b.dist);

    for (const { cx: chkCx, cz: chkCz } of candidates) {
      const key = chunkKey(chkCx, chkCz);
      const minX = chkCx * cws, minZ = chkCz * cws;
      const bbox = new THREE.Box3(
        new THREE.Vector3(minX, 0, minZ),
        new THREE.Vector3(minX + cws, MAX_HEIGHT * VOXEL_SIZE, minZ + cws),
      );
      if (!frustum.current.intersectsBox(bbox)) continue;

      const data = chunkCache.current.get(key);
      if (data) {
        newVisible.set(key, data);
      } else {
        newPending.push(key);
      }
    }

    // Add new pending to front of queue (nearest first)
    pendingKeys.current = [...newPending, ...pendingKeys.current.filter(k => !newPending.includes(k))];

    // Prune distant cache
    const maxC = (rd * 2 + 2) ** 2;
    if (chunkCache.current.size > maxC * 2) {
      const del: string[] = [];
      for (const [k] of chunkCache.current) {
        const [kx, kz] = k.split(',').map(Number);
        if ((kx - ccx) ** 2 + (kz - ccz) ** 2 > (rd * 2) ** 2) del.push(k);
      }
      for (const k of del) chunkCache.current.delete(k);
    }

    setVisibleChunks(newVisible);
    onChunkCount(newVisible.size);
  });

  const entries = useMemo(() => Array.from(visibleChunks.entries()), [visibleChunks]);
  const allPickups = useMemo(() => {
    const result: { wx: number; wy: number; wz: number; iconIdx: number; key: string }[] = [];
    for (const [key, data] of visibleChunks) {
      for (const p of data.pickups) {
        result.push({ ...p, key: `${key}-${p.iconIdx}` });
      }
    }
    return result;
  }, [visibleChunks]);

  return (
    <>
      {entries.map(([key, data]) => <ChunkMesh key={key} data={data} />)}
      {allPickups.map(p => (
        <FloatingPickup key={p.key} position={[p.wx, p.wy, p.wz]} iconIdx={p.iconIdx} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Config Slider component
 * ═══════════════════════════════════════════════════════════ */

function ConfigSlider({ label, value, onChange, min, max, step, color, displayValue }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; color: string; displayValue?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className={`font-pixel text-[8px] sm:text-[9px] ${color} uppercase tracking-wider select-none`}>{label}</label>
        <span className={`font-mono text-[9px] sm:text-[10px] ${color.replace('/80', '')} select-none`}>{displayValue ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
        className={`w-full h-1 bg-retro-surface/80 rounded-full appearance-none cursor-pointer accent-current ${color.replace('text-', 'accent-').replace('/80', '')}`}
        style={{ accentColor: color.includes('cyan') ? '#22d3ee' : color.includes('gold') ? '#fbbf24' : color.includes('green') ? '#4ade80' : color.includes('purple') ? '#c084fc' : color.includes('red') ? '#f87171' : '#94a3b8' }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Main Component
 * ═══════════════════════════════════════════════════════════ */

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
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
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

  const handleCameraUpdate = useCallback((pos: [number, number, number], biome: string) => {
    setCameraPos(pos); setCurrentBiome(biome);
  }, []);
  const generateNewSeed = useCallback(() => {
    const s = Math.floor(Math.random() * 999999); setSeed(s); setSeedInput(String(s));
  }, []);
  const applySeed = useCallback(() => {
    const p = parseInt(seedInput, 10); if (!isNaN(p)) setSeed(Math.abs(p));
  }, [seedInput]);
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
            <Link href="/" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-retro-bg/80 backdrop-blur-sm border border-retro-border/50 rounded font-pixel text-[8px] sm:text-[9px] text-retro-muted hover:text-retro-green hover:border-retro-green/40 transition-all select-none">
              ← Back
            </Link>
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
            {/* Seed */}
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

            {/* Core controls */}
            <ConfigSlider label="Render Distance" value={config.renderDistance} onChange={v => updateConfig('renderDistance', v)} min={2} max={10} step={1} color="text-retro-cyan/80" displayValue={`${config.renderDistance} chunks`} />
            <ConfigSlider label="Fly Speed" value={config.flySpeed} onChange={v => updateConfig('flySpeed', v)} min={4} max={40} step={1} color="text-retro-gold/80" displayValue={String(config.flySpeed)} />

            {/* Advanced toggle */}
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

            {/* Start */}
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
          <FlyCamera keysRef={keysRef} speedRef={speedRef} />
          <CameraLook isLocked={isLocked} isMobile={isMobile} />
          <ChunkManagerWithCounter seed={seed} config={config} onChunkCount={handleChunkCount} />
          <CameraTracker onUpdate={handleCameraUpdate} biomeNoise={noises.biome} tempNoise={noises.temp} cityFreq={config.cityFrequency} />
        </Canvas>
      </div>
    </div>
  );
}
