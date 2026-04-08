'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Link from 'next/link';

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
 *  Seeded 2D Perlin Noise (optimized)
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

  // Pre-computed gradient x/y components for fast lookup
  const GRAD_X = new Float32Array([1, -1, 1, -1, 1, -1, 0, 0]);
  const GRAD_Y = new Float32Array([1, 1, -1, -1, 0, 0, 1, -1]);

  return function noise2D(x: number, y: number): number {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const X = xi & 255;
    const Y = yi & 255;
    const xf = x - xi;
    const yf = y - yi;
    // Inline fade
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);

    const aa = perm[perm[X] + Y] & 7;
    const ab = perm[perm[X] + Y + 1] & 7;
    const ba = perm[perm[X + 1] + Y] & 7;
    const bb = perm[perm[X + 1] + Y + 1] & 7;

    const d00 = GRAD_X[aa] * xf + GRAD_Y[aa] * yf;
    const d10 = GRAD_X[ba] * (xf - 1) + GRAD_Y[ba] * yf;
    const d01 = GRAD_X[ab] * xf + GRAD_Y[ab] * (yf - 1);
    const d11 = GRAD_X[bb] * (xf - 1) + GRAD_Y[bb] * (yf - 1);

    const x0 = d00 + u * (d10 - d00);
    const x1 = d01 + u * (d11 - d01);
    return x0 + v * (x1 - x0);
  };
}

/* ═══════════════════════════════════════════════════════════
 *  Fractal Brownian Motion (inlined for perf)
 * ═══════════════════════════════════════════════════════════ */

function fbm(noise: (x: number, y: number) => number, x: number, y: number, octaves: number, lacunarity = 2.0, gain = 0.5): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxVal = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, y * frequency) * amplitude;
    maxVal += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return value / maxVal;
}

/* ═══════════════════════════════════════════════════════════
 *  Biome Definitions — More variety and realistic heights
 * ═══════════════════════════════════════════════════════════ */

type BiomeType = 'plains' | 'desert' | 'tundra' | 'forest' | 'mountains' | 'ocean';

interface BiomeConfig {
  name: string;
  heightScale: number;
  heightBase: number;
  waterLevel: number;
  colors: {
    top: string[];
    mid: string[];
    bottom: string[];
    accent: string[];
    water: string;
  };
}

const BIOMES: Record<BiomeType, BiomeConfig> = {
  plains: {
    name: 'Plains',
    heightScale: 5,
    heightBase: 7,
    waterLevel: 5,
    colors: {
      top: ['#66ee88', '#77ff99', '#55dd77', '#88ffaa', '#5cd97a'],
      mid: ['#cc8844', '#dd9955', '#bb7733', '#c49040'],
      bottom: ['#99aabb', '#aabbcc', '#889999'],
      accent: ['#ff9999', '#ffdd66', '#ccaaff', '#ff99cc'],
      water: '#88ddff',
    },
  },
  desert: {
    name: 'Desert',
    heightScale: 4,
    heightBase: 6,
    waterLevel: 2,
    colors: {
      top: ['#ffeecc', '#fff5dd', '#ffe8bb', '#ffdda0', '#f5deb0'],
      mid: ['#ddbb88', '#ccaa77', '#bb9966'],
      bottom: ['#aa8866', '#997755', '#886644'],
      accent: ['#88cc55', '#559944'],
      water: '#66bbdd',
    },
  },
  tundra: {
    name: 'Tundra',
    heightScale: 6,
    heightBase: 7,
    waterLevel: 4,
    colors: {
      top: ['#eef4ff', '#f4f8ff', '#ffffff', '#e8eeff', '#dde8f4'],
      mid: ['#99aabb', '#aabbcc', '#8899aa'],
      bottom: ['#778899', '#667788', '#556677'],
      accent: ['#aaddff', '#88bbdd'],
      water: '#77ccee',
    },
  },
  forest: {
    name: 'Forest',
    heightScale: 7,
    heightBase: 8,
    waterLevel: 5,
    colors: {
      top: ['#339955', '#44aa66', '#22884d', '#55bb77', '#2d994f'],
      mid: ['#886644', '#775533', '#664422'],
      bottom: ['#556655', '#667766', '#445544'],
      accent: ['#ee5544', '#ff6655', '#dd4433'],
      water: '#55aacc',
    },
  },
  mountains: {
    name: 'Mountains',
    heightScale: 18,
    heightBase: 5,
    waterLevel: 3,
    colors: {
      top: ['#bbccdd', '#ccddee', '#aabbcc', '#99aabb', '#8899aa'],
      mid: ['#8899aa', '#99aabb', '#7788aa', '#6a7d90'],
      bottom: ['#667788', '#556677', '#778899'],
      accent: ['#eef4ff', '#ffffff', '#e0e8f0'],
      water: '#6699bb',
    },
  },
  ocean: {
    name: 'Ocean',
    heightScale: 3,
    heightBase: 2,
    waterLevel: 8,
    colors: {
      top: ['#ffeecc', '#fff5dd', '#ffe8bb'],
      mid: ['#ddcc99', '#ccbb88', '#bbaa77'],
      bottom: ['#99aabb', '#aabbcc', '#889999'],
      accent: ['#ff9999', '#ffcc66'],
      water: '#4499cc',
    },
  },
};

/* ═══════════════════════════════════════════════════════════
 *  Chunk Constants — Optimized defaults
 * ═══════════════════════════════════════════════════════════ */

const CHUNK_SIZE = 16;
const VOXEL_SIZE = 0.5;
const RENDER_DISTANCE = 5;
const MAX_HEIGHT = 32;
// Max chunks to generate per frame to avoid frame drops
const MAX_CHUNKS_PER_FRAME = 2;

/* ═══════════════════════════════════════════════════════════
 *  Chunk Key Helpers
 * ═══════════════════════════════════════════════════════════ */

function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

function worldToChunk(wx: number, wz: number): [number, number] {
  return [
    Math.floor(wx / (CHUNK_SIZE * VOXEL_SIZE)),
    Math.floor(wz / (CHUNK_SIZE * VOXEL_SIZE)),
  ];
}

/* ═══════════════════════════════════════════════════════════
 *  Determine biome from noise (reduced octaves for perf)
 * ═══════════════════════════════════════════════════════════ */

function getBiome(
  biomeNoise: (x: number, y: number) => number,
  tempNoise: (x: number, y: number) => number,
  wx: number,
  wz: number,
): BiomeType {
  const temp = fbm(tempNoise, wx * 0.005, wz * 0.005, 2);
  const moisture = fbm(biomeNoise, wx * 0.004 + 100, wz * 0.004 + 100, 2);

  if (temp < -0.25) return 'tundra';
  if (temp > 0.3 && moisture < -0.1) return 'desert';
  if (moisture > 0.3) return 'ocean';
  if (temp > 0.0 && moisture > 0.05) return 'forest';
  if (biomeNoise(wx * 0.008, wz * 0.008) > 0.2) return 'mountains';
  return 'plains';
}

/* ═══════════════════════════════════════════════════════════
 *  Generate Chunk Data — Optimized: surface-only + structures
 * ═══════════════════════════════════════════════════════════ */

interface ChunkVoxelData {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
  waterPositions: Float32Array;
  waterColors: Float32Array;
  waterCount: number;
}

// Pre-allocate reusable Color to avoid GC pressure
const _tmpColor = new THREE.Color();

function generateChunkData(
  cx: number,
  cz: number,
  heightNoise: (x: number, y: number) => number,
  detailNoise: (x: number, y: number) => number,
  biomeNoise: (x: number, y: number) => number,
  tempNoise: (x: number, y: number) => number,
  treeNoise: (x: number, y: number) => number,
  structNoise: (x: number, y: number) => number,
): ChunkVoxelData {
  // Use pre-sized typed arrays instead of dynamic JS arrays
  // Estimate: ~CHUNK_SIZE^2 surface voxels + decorations ≈ 600 max per chunk
  const maxVoxels = CHUNK_SIZE * CHUNK_SIZE * 8;
  const posArr = new Float32Array(maxVoxels * 3);
  const colArr = new Float32Array(maxVoxels * 3);
  let solidCount = 0;

  const maxWater = CHUNK_SIZE * CHUNK_SIZE * 4;
  const wPosArr = new Float32Array(maxWater * 3);
  const wColArr = new Float32Array(maxWater * 3);
  let waterCount = 0;

  const baseX = cx * CHUNK_SIZE;
  const baseZ = cz * CHUNK_SIZE;

  // Pre-compute height map + biome for chunk + 1-cell border
  const gridW = CHUNK_SIZE + 2;
  const heightMap = new Int32Array(gridW * gridW);
  const biomeMap = new Uint8Array(gridW * gridW);
  const biomeTypes: BiomeType[] = ['plains', 'desert', 'tundra', 'forest', 'mountains', 'ocean'];

  for (let lx = -1; lx <= CHUNK_SIZE; lx++) {
    for (let lz = -1; lz <= CHUNK_SIZE; lz++) {
      const wx = baseX + lx;
      const wz = baseZ + lz;
      const idx = (lx + 1) * gridW + (lz + 1);

      const biome = getBiome(biomeNoise, tempNoise, wx, wz);
      const cfg = BIOMES[biome];

      // Reduced octaves: 4 for height (was 5), 2 for detail (was 3) — big perf win
      const h = fbm(heightNoise, wx * 0.02, wz * 0.02, 4, 2.0, 0.5);
      const detail = detailNoise(wx * 0.08, wz * 0.08) * 0.25;

      // Mountain ridgeline variation for more dramatic peaks
      let extraHeight = 0;
      if (biome === 'mountains') {
        const ridge = Math.abs(fbm(detailNoise, wx * 0.015 + 200, wz * 0.015 + 200, 2));
        extraHeight = ridge * 6;
      }

      const height = Math.max(0, Math.min(MAX_HEIGHT,
        Math.floor(cfg.heightBase + (h + detail) * cfg.heightScale + extraHeight)));

      heightMap[idx] = height;
      biomeMap[idx] = biomeTypes.indexOf(biome);
    }
  }

  function pushVoxel(wx: number, wy: number, wz: number, hex: string) {
    if (solidCount >= maxVoxels) return;
    const i3 = solidCount * 3;
    posArr[i3] = wx;
    posArr[i3 + 1] = wy;
    posArr[i3 + 2] = wz;
    _tmpColor.set(hex);
    colArr[i3] = _tmpColor.r;
    colArr[i3 + 1] = _tmpColor.g;
    colArr[i3 + 2] = _tmpColor.b;
    solidCount++;
  }

  function pushWater(wx: number, wy: number, wz: number, hex: string) {
    if (waterCount >= maxWater) return;
    const i3 = waterCount * 3;
    wPosArr[i3] = wx;
    wPosArr[i3 + 1] = wy;
    wPosArr[i3 + 2] = wz;
    _tmpColor.set(hex);
    wColArr[i3] = _tmpColor.r;
    wColArr[i3 + 1] = _tmpColor.g;
    wColArr[i3 + 2] = _tmpColor.b;
    waterCount++;
  }

  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const idx = (lx + 1) * gridW + (lz + 1);
      const h = heightMap[idx];
      const biome = biomeTypes[biomeMap[idx]];
      const cfg = BIOMES[biome];

      const wx = baseX + lx;
      const wz = baseZ + lz;

      // Neighbor heights for occlusion
      const hN = heightMap[(lx + 1) * gridW + lz];
      const hS = heightMap[(lx + 1) * gridW + (lz + 2)];
      const hE = heightMap[(lx + 2) * gridW + (lz + 1)];
      const hW = heightMap[lx * gridW + (lz + 1)];

      // PERF: Only render top surface + exposed sides (skip buried voxels)
      for (let y = 0; y <= h; y++) {
        const isTop = y === h;
        const hasExposed = isTop || y === 0 ||
          y > hN || y > hS || y > hE || y > hW;
        if (!hasExposed) continue;

        let colorHex: string;
        if (isTop) {
          if (biome === 'mountains' && y > 16) {
            colorHex = cfg.colors.accent[Math.abs(wx + wz) % cfg.colors.accent.length];
          } else {
            colorHex = cfg.colors.top[Math.abs(wx + wz) % cfg.colors.top.length];
          }
        } else if (y >= h - 3) {
          colorHex = cfg.colors.mid[Math.abs(wx + y) % cfg.colors.mid.length];
        } else {
          colorHex = cfg.colors.bottom[Math.abs(wx + y + wz) % cfg.colors.bottom.length];
        }

        pushVoxel(
          (baseX + lx) * VOXEL_SIZE,
          y * VOXEL_SIZE,
          (baseZ + lz) * VOXEL_SIZE,
          colorHex,
        );
      }

      // Water: only top surface
      if (h < cfg.waterLevel) {
        pushWater(
          (baseX + lx) * VOXEL_SIZE,
          cfg.waterLevel * VOXEL_SIZE,
          (baseZ + lz) * VOXEL_SIZE,
          cfg.colors.water,
        );
      }

      // ── Trees (sparser, more random) ──
      if (
        (biome === 'plains' || biome === 'forest') &&
        h > cfg.waterLevel + 1 &&
        lx > 1 && lx < CHUNK_SIZE - 2 && lz > 1 && lz < CHUNK_SIZE - 2
      ) {
        const treeVal = treeNoise(wx * 0.6, wz * 0.6);
        // Much sparser: forest 0.32, plains 0.44
        const threshold = biome === 'forest' ? 0.32 : 0.44;
        if (treeVal > threshold) {
          const trunkH = biome === 'forest' ? 3 + (Math.abs(wx * 13 + wz * 7) % 3) : 2 + (Math.abs(wx * 7 + wz) % 2);
          const trunkColor = biome === 'forest' ? '#664422' : '#AA7744';
          const leafColors = biome === 'forest'
            ? ['#339955', '#44aa66', '#22884d']
            : ['#44dd66', '#55ee77', '#66ff88'];
          const leafColor = leafColors[Math.abs(wx * 3 + wz * 5) % leafColors.length];

          for (let ty = 1; ty <= trunkH; ty++) {
            pushVoxel((baseX + lx) * VOXEL_SIZE, (h + ty) * VOXEL_SIZE, (baseZ + lz) * VOXEL_SIZE, trunkColor);
          }

          // Leaf canopy — smaller, less dense (only shell of sphere)
          const crownR = biome === 'forest' ? 2 : 2;
          const crownY = h + trunkH + crownR;
          for (let dx = -crownR; dx <= crownR; dx++) {
            for (let dy = -crownR; dy <= crownR; dy++) {
              for (let dz = -crownR; dz <= crownR; dz++) {
                const dist2 = dx * dx + dy * dy + dz * dz;
                // Only render outer shell (dist > inner^2 && dist <= outer^2)
                if (dist2 > crownR * crownR + 0.5) continue;
                if (crownR > 1 && dist2 < (crownR - 1) * (crownR - 1)) continue;
                pushVoxel(
                  (baseX + lx + dx) * VOXEL_SIZE,
                  (crownY + dy) * VOXEL_SIZE,
                  (baseZ + lz + dz) * VOXEL_SIZE,
                  leafColor,
                );
              }
            }
          }
        }
      }

      // ── Cacti in desert (sparser) ──
      if (biome === 'desert' && h > cfg.waterLevel && lx > 0 && lx < CHUNK_SIZE - 1 && lz > 0 && lz < CHUNK_SIZE - 1) {
        const cactusVal = treeNoise(wx * 0.7 + 50, wz * 0.7 + 50);
        if (cactusVal > 0.46) {
          const cactusH = 3 + (Math.abs(wx * 11 + wz * 3) % 3);
          for (let cy = 1; cy <= cactusH; cy++) {
            pushVoxel((baseX + lx) * VOXEL_SIZE, (h + cy) * VOXEL_SIZE, (baseZ + lz) * VOXEL_SIZE, '#55aa44');
          }
          if (cactusH > 3) {
            pushVoxel((baseX + lx + 1) * VOXEL_SIZE, (h + 3) * VOXEL_SIZE, (baseZ + lz) * VOXEL_SIZE, '#66bb55');
            pushVoxel((baseX + lx + 1) * VOXEL_SIZE, (h + 4) * VOXEL_SIZE, (baseZ + lz) * VOXEL_SIZE, '#66bb55');
          }
        }
      }

      // ── Small houses/cabins in plains/forest ──
      if (
        (biome === 'plains' || biome === 'forest') &&
        h > cfg.waterLevel + 1 &&
        lx >= 2 && lx <= CHUNK_SIZE - 5 && lz >= 2 && lz <= CHUNK_SIZE - 5
      ) {
        const houseVal = structNoise(wx * 0.12, wz * 0.12);
        // Very rare: ~1 house per few chunks
        if (houseVal > 0.48 && Math.abs(wx % 11) < 1 && Math.abs(wz % 13) < 1) {
          const wallColor = biome === 'forest' ? '#8B7355' : '#D4C5A9';
          const roofColor = biome === 'forest' ? '#8B4513' : '#CC6633';
          const doorColor = '#664422';
          const windowColor = '#AADDFF';

          // 3x3x3 walls
          for (let hx = 0; hx < 3; hx++) {
            for (let hz = 0; hz < 3; hz++) {
              for (let hy = 1; hy <= 3; hy++) {
                // Skip interior
                if (hx === 1 && hz === 1) continue;
                // Door opening
                if (hx === 1 && hz === 0 && hy <= 2) continue;
                // Window
                let color = wallColor;
                if (hy === 2 && ((hx === 0 && hz === 1) || (hx === 2 && hz === 1))) {
                  color = windowColor;
                }
                pushVoxel(
                  (baseX + lx + hx) * VOXEL_SIZE,
                  (h + hy) * VOXEL_SIZE,
                  (baseZ + lz + hz) * VOXEL_SIZE,
                  color,
                );
              }
            }
          }
          // Door frame
          pushVoxel((baseX + lx + 1) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (baseZ + lz) * VOXEL_SIZE, doorColor);

          // Peaked roof (4x4 footprint)
          for (let rx = -1; rx <= 3; rx++) {
            for (let rz = -1; rz <= 3; rz++) {
              pushVoxel(
                (baseX + lx + rx) * VOXEL_SIZE,
                (h + 4) * VOXEL_SIZE,
                (baseZ + lz + rz) * VOXEL_SIZE,
                roofColor,
              );
            }
          }
          // Roof peak
          for (let rx = 0; rx <= 2; rx++) {
            for (let rz = 0; rz <= 2; rz++) {
              pushVoxel(
                (baseX + lx + rx) * VOXEL_SIZE,
                (h + 5) * VOXEL_SIZE,
                (baseZ + lz + rz) * VOXEL_SIZE,
                roofColor,
              );
            }
          }
        }
      }

      // ── Rock formations in tundra/mountains ──
      if (
        (biome === 'tundra' || biome === 'mountains') &&
        h > cfg.waterLevel &&
        lx > 1 && lx < CHUNK_SIZE - 2 && lz > 1 && lz < CHUNK_SIZE - 2
      ) {
        const rockVal = structNoise(wx * 0.4 + 300, wz * 0.4 + 300);
        if (rockVal > 0.44) {
          const rockH = 1 + (Math.abs(wx * 7 + wz * 3) % 3);
          const rockColor = biome === 'tundra' ? '#8899aa' : '#667788';
          for (let ry = 1; ry <= rockH; ry++) {
            pushVoxel((baseX + lx) * VOXEL_SIZE, (h + ry) * VOXEL_SIZE, (baseZ + lz) * VOXEL_SIZE, rockColor);
          }
          // Wider base
          if (rockH > 1) {
            pushVoxel((baseX + lx + 1) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (baseZ + lz) * VOXEL_SIZE, rockColor);
            pushVoxel((baseX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (baseZ + lz + 1) * VOXEL_SIZE, rockColor);
          }
        }
      }
    }
  }

  return {
    positions: posArr.subarray(0, solidCount * 3),
    colors: colArr.subarray(0, solidCount * 3),
    count: solidCount,
    waterPositions: wPosArr.subarray(0, waterCount * 3),
    waterColors: wColArr.subarray(0, waterCount * 3),
    waterCount,
  };
}

/* ═══════════════════════════════════════════════════════════
 *  Shared geometry & materials (created once, reused by all chunks)
 * ═══════════════════════════════════════════════════════════ */

const VOXEL_GAP = VOXEL_SIZE * 0.92;
const sharedSolidGeo = new THREE.BoxGeometry(VOXEL_GAP, VOXEL_GAP, VOXEL_GAP);
const sharedSolidMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
const sharedWaterGeo = sharedSolidGeo; // Same shape
const sharedWaterMat = new THREE.MeshStandardMaterial({
  roughness: 0.2,
  metalness: 0.05,
  transparent: true,
  opacity: 0.6,
  depthWrite: false,
});

/* ═══════════════════════════════════════════════════════════
 *  Chunk Mesh Component — Zero per-chunk geometry/material alloc
 * ═══════════════════════════════════════════════════════════ */

function ChunkMesh({ data }: { data: ChunkVoxelData }) {
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const waterRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = solidRef.current;
    if (!mesh || data.count === 0) return;
    const mat4 = new THREE.Matrix4();
    const col = new THREE.Color();
    for (let i = 0; i < data.count; i++) {
      const i3 = i * 3;
      mat4.identity();
      mat4.elements[12] = data.positions[i3];
      mat4.elements[13] = data.positions[i3 + 1];
      mat4.elements[14] = data.positions[i3 + 2];
      mesh.setMatrixAt(i, mat4);
      col.setRGB(data.colors[i3], data.colors[i3 + 1], data.colors[i3 + 2]);
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  useEffect(() => {
    const mesh = waterRef.current;
    if (!mesh || data.waterCount === 0) return;
    const mat4 = new THREE.Matrix4();
    const col = new THREE.Color();
    for (let i = 0; i < data.waterCount; i++) {
      const i3 = i * 3;
      mat4.identity();
      mat4.elements[12] = data.waterPositions[i3];
      mat4.elements[13] = data.waterPositions[i3 + 1];
      mat4.elements[14] = data.waterPositions[i3 + 2];
      mesh.setMatrixAt(i, mat4);
      col.setRGB(data.waterColors[i3], data.waterColors[i3 + 1], data.waterColors[i3 + 2]);
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  return (
    <group>
      {data.count > 0 && (
        <instancedMesh ref={solidRef} args={[sharedSolidGeo, sharedSolidMat, data.count]} frustumCulled={false} />
      )}
      {data.waterCount > 0 && (
        <instancedMesh ref={waterRef} args={[sharedWaterGeo, sharedWaterMat, data.waterCount]} frustumCulled={false} />
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Fly Camera Controller
 * ═══════════════════════════════════════════════════════════ */

function FlyCamera({
  keysRef,
  speedRef,
}: {
  keysRef: React.RefObject<Set<string>>;
  speedRef: React.RefObject<number>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 12, 20);
    camera.lookAt(0, 6, 0);
  }, [camera]);

  // Reusable vectors — avoid alloc per frame
  const _dir = useMemo(() => new THREE.Vector3(), []);
  const _right = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    if (!keys || keys.size === 0) return;

    const speed = (speedRef.current ?? 12) * delta;

    camera.getWorldDirection(_dir);
    _right.crossVectors(_dir, camera.up).normalize();

    if (keys.has('w') || keys.has('arrowup')) camera.position.addScaledVector(_dir, speed);
    if (keys.has('s') || keys.has('arrowdown')) camera.position.addScaledVector(_dir, -speed);
    if (keys.has('a') || keys.has('arrowleft')) camera.position.addScaledVector(_right, -speed);
    if (keys.has('d') || keys.has('arrowright')) camera.position.addScaledVector(_right, speed);
    if (keys.has(' ')) camera.position.addScaledVector(camera.up, speed);
    if (keys.has('shift')) camera.position.addScaledVector(camera.up, -speed);
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════
 *  Mouse Look Controller
 * ═══════════════════════════════════════════════════════════ */

function MouseLook({ isLocked }: { isLocked: boolean }) {
  const { camera, gl } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    if (!isLocked) return;

    euler.current.setFromQuaternion(camera.quaternion);

    const onMouseMove = (e: MouseEvent) => {
      const sensitivity = 0.002;
      euler.current.y -= e.movementX * sensitivity;
      euler.current.x -= e.movementY * sensitivity;
      euler.current.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    const canvas = gl.domElement;
    canvas.addEventListener('mousemove', onMouseMove);
    return () => canvas.removeEventListener('mousemove', onMouseMove);
  }, [isLocked, camera, gl]);

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
 *  Sky Gradient Background — Reduced poly count
 * ═══════════════════════════════════════════════════════════ */

function SkyGradient() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(camera.position);
    }
  });

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          vec3 skyTop = vec3(0.2, 0.35, 0.65);
          vec3 skyBottom = vec3(0.6, 0.75, 0.9);
          vec3 horizon = vec3(0.85, 0.75, 0.6);
          vec3 color;
          if (h > 0.0) {
            color = mix(horizon, skyTop, smoothstep(0.0, 0.5, h));
          } else {
            color = mix(horizon, skyBottom, smoothstep(0.0, -0.3, h));
          }
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <sphereGeometry args={[500, 16, 16]} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Fog Effect
 * ═══════════════════════════════════════════════════════════ */

function FogEffect() {
  return <fogExp2 attach="fog" args={['#b0c8e0', 0.015]} />;
}

/* ═══════════════════════════════════════════════════════════
 *  Stats Display (Chunk Count, etc.)
 * ═══════════════════════════════════════════════════════════ */

interface OverlayStatsProps {
  seed: number;
  chunkCount: number;
  position: [number, number, number];
  biome: string;
}

function OverlayStats({ seed, chunkCount, position, biome }: OverlayStatsProps) {
  return (
    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 font-mono text-[9px] sm:text-[10px] space-y-0.5 pointer-events-none select-none">
      <div className="text-retro-green/70">
        SEED: <span className="text-retro-green">{seed}</span>
      </div>
      <div className="text-retro-cyan/70">
        BIOME: <span className="text-retro-cyan">{biome}</span>
      </div>
      <div className="text-retro-gold/70">
        POS: <span className="text-retro-gold">{position[0].toFixed(0)}, {position[1].toFixed(0)}, {position[2].toFixed(0)}</span>
      </div>
      <div className="text-retro-purple/70">
        CHUNKS: <span className="text-retro-purple">{chunkCount}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Camera Info Tracker
 * ═══════════════════════════════════════════════════════════ */

function CameraTracker({
  onUpdate,
  biomeNoise,
  tempNoise,
}: {
  onUpdate: (pos: [number, number, number], biome: string) => void;
  biomeNoise: ((x: number, y: number) => number) | null;
  tempNoise: ((x: number, y: number) => number) | null;
}) {
  const { camera } = useThree();
  const lastUpdate = useRef(0);

  useFrame(({ clock }) => {
    if (clock.getElapsedTime() - lastUpdate.current < 0.3) return;
    lastUpdate.current = clock.getElapsedTime();

    const pos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z];

    let biome = 'Unknown';
    if (biomeNoise && tempNoise) {
      const wx = camera.position.x / VOXEL_SIZE;
      const wz = camera.position.z / VOXEL_SIZE;
      biome = BIOMES[getBiome(biomeNoise, tempNoise, wx, wz)].name;
    }

    onUpdate(pos, biome);
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════
 *  Main Procedural Terrain Component
 * ═══════════════════════════════════════════════════════════ */

export default function ProceduralTerrain() {
  const [seed, setSeed] = useState(42);
  const [renderDistance, setRenderDistance] = useState(RENDER_DISTANCE);
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [cameraPos, setCameraPos] = useState<[number, number, number]>([0, 12, 20]);
  const [currentBiome, setCurrentBiome] = useState('Plains');
  const [chunkCount, setChunkCount] = useState(0);
  const [seedInput, setSeedInput] = useState('42');
  const [flySpeed, setFlySpeed] = useState(12);
  const [isMobile, setIsMobile] = useState(false);

  const keysRef = useRef<Set<string>>(new Set());
  const speedRef = useRef(flySpeed);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Compute noise functions for biome display (derived from seed)
  const noises = useMemo(() => ({
    biome: createNoise2D(seed + 2),
    temp: createNoise2D(seed + 3),
  }), [seed]);

  useEffect(() => {
    speedRef.current = flySpeed;
  }, [flySpeed]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // Prevent default for game keys
      if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
      }
      keysRef.current.add(key);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Pointer lock
  const requestPointerLock = useCallback(() => {
    if (isMobile) {
      // On mobile, skip pointer lock — just hide controls
      setShowControls(false);
      setIsLocked(true);
      return;
    }
    const canvas = canvasRef.current?.querySelector('canvas');
    if (canvas) {
      canvas.requestPointerLock();
    }
  }, [isMobile]);

  useEffect(() => {
    const onLockChange = () => {
      const locked = !!document.pointerLockElement;
      setIsLocked(locked);
      if (locked) setShowControls(false);
    };
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, []);

  const handleCameraUpdate = useCallback((pos: [number, number, number], biome: string) => {
    setCameraPos(pos);
    setCurrentBiome(biome);
  }, []);

  const generateNewSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 999999);
    setSeed(newSeed);
    setSeedInput(String(newSeed));
  }, []);

  const applySeed = useCallback(() => {
    const parsed = parseInt(seedInput, 10);
    if (!isNaN(parsed)) {
      setSeed(Math.abs(parsed));
    }
  }, [seedInput]);

  // Track chunk count
  const handleChunkCount = useCallback((count: number) => {
    setChunkCount(count);
  }, []);

  // Mobile: exit immersive mode
  const exitImmersive = useCallback(() => {
    if (isMobile) {
      setIsLocked(false);
      setShowControls(true);
    } else {
      document.exitPointerLock();
    }
  }, [isMobile]);

  // Touch handler helpers for mobile joystick
  const handleTouchKey = useCallback((key: string, active: boolean) => {
    if (active) {
      keysRef.current.add(key);
    } else {
      keysRef.current.delete(key);
    }
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden bg-black">
      {/* ── Hero Overlay ── */}
      {showControls && !isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
          {/* Back link */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 pointer-events-auto">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-retro-bg/80 backdrop-blur-sm border border-retro-border/50 rounded font-pixel text-[8px] sm:text-[9px] text-retro-muted hover:text-retro-green hover:border-retro-green/40 transition-all"
            >
              ← Back
            </Link>
          </div>

          {/* Title */}
          <div className="text-center pointer-events-auto mb-4 sm:mb-6">
            <h1 className="font-pixel text-lg sm:text-2xl md:text-3xl lg:text-4xl text-retro-green text-glow mb-2 sm:mb-3 drop-shadow-lg">
              PROCEDURAL WORLDS
            </h1>
            <p className="font-pixel text-[8px] sm:text-[10px] md:text-xs text-retro-purple/80 mb-1 drop-shadow">
              @pxlkit/voxel — Coming Soon
            </p>
            <p className="text-retro-muted/70 text-[10px] sm:text-xs md:text-sm max-w-md mx-auto px-4 leading-relaxed">
              Infinite procedural voxel worlds with dynamic biomes, chunk loading, and frustum culling.
              <span className="text-retro-gold font-bold">{isMobile ? ' Tap to fly.' : ' Click to fly.'}</span>
            </p>
          </div>

          {/* Controls Panel */}
          <div className="pointer-events-auto bg-retro-bg/80 backdrop-blur-md border border-retro-border/50 rounded-xl p-3 sm:p-4 md:p-5 max-w-sm w-[calc(100%-2rem)] space-y-3 sm:space-y-4 shadow-xl">
            {/* Seed Input */}
            <div className="space-y-1.5">
              <label className="font-pixel text-[8px] sm:text-[9px] text-retro-green/80 uppercase tracking-wider">World Seed</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && applySeed()}
                  className="flex-1 bg-retro-surface/80 border border-retro-border/50 rounded px-2 sm:px-3 py-1.5 font-mono text-xs sm:text-sm text-retro-text focus:border-retro-green/60 focus:outline-none transition-colors"
                  placeholder="Enter seed..."
                />
                <button
                  onClick={applySeed}
                  className="px-2 sm:px-3 py-1.5 bg-retro-green/20 hover:bg-retro-green/30 border border-retro-green/50 rounded font-pixel text-[8px] sm:text-[9px] text-retro-green transition-all cursor-pointer"
                >
                  GO
                </button>
              </div>
            </div>

            {/* Random Seed */}
            <button
              onClick={generateNewSeed}
              className="w-full py-2 bg-retro-purple/20 hover:bg-retro-purple/30 border border-retro-purple/50 rounded font-pixel text-[8px] sm:text-[9px] text-retro-purple transition-all cursor-pointer"
            >
              🎲 RANDOM WORLD
            </button>

            {/* Render Distance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-pixel text-[8px] sm:text-[9px] text-retro-cyan/80 uppercase tracking-wider">Render Distance</label>
                <span className="font-mono text-[9px] sm:text-[10px] text-retro-cyan">{renderDistance} chunks</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={renderDistance}
                onChange={(e) => setRenderDistance(Number(e.target.value))}
                className="w-full accent-retro-cyan h-1 bg-retro-surface/80 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-pixel text-[8px] sm:text-[9px] text-retro-gold/80 uppercase tracking-wider">Fly Speed</label>
                <span className="font-mono text-[9px] sm:text-[10px] text-retro-gold">{flySpeed}</span>
              </div>
              <input
                type="range"
                min={4}
                max={40}
                value={flySpeed}
                onChange={(e) => setFlySpeed(Number(e.target.value))}
                className="w-full accent-retro-gold h-1 bg-retro-surface/80 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Start Button */}
            <button
              onClick={requestPointerLock}
              className="w-full py-2.5 sm:py-3 bg-retro-green/20 hover:bg-retro-green/30 border-2 border-retro-green/60 rounded-lg font-pixel text-[9px] sm:text-[10px] md:text-xs text-retro-green transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(74,222,128,0.2)]"
            >
              ▶ {isMobile ? 'TAP TO EXPLORE' : 'CLICK TO EXPLORE'}
            </button>

            {/* Controls hint */}
            <div className="text-center space-y-0.5">
              {isMobile ? (
                <p className="font-mono text-[8px] sm:text-[9px] text-retro-muted/50">
                  Use on-screen joystick to fly · Tap ✕ to exit
                </p>
              ) : (
                <>
                  <p className="font-mono text-[8px] sm:text-[9px] text-retro-muted/50">
                    WASD / Arrows = Move · Space = Up · Shift = Down
                  </p>
                  <p className="font-mono text-[8px] sm:text-[9px] text-retro-muted/50">
                    Mouse = Look · ESC = Release cursor
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Locked Overlay (minimal HUD) ── */}
      {isLocked && (
        <>
          {/* Crosshair (desktop only) */}
          {!isMobile && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="w-4 h-4 sm:w-5 sm:h-5 relative opacity-40">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
              </div>
            </div>
          )}

          {/* Mini stats */}
          <OverlayStats
            seed={seed}
            chunkCount={chunkCount}
            position={cameraPos}
            biome={currentBiome}
          />

          {/* ESC / Exit hint */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
            {isMobile ? (
              <button
                onClick={exitImmersive}
                className="p-2 bg-retro-bg/70 backdrop-blur-sm border border-retro-border/30 rounded font-pixel text-[9px] text-retro-muted/60 hover:text-retro-red transition-all cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <span className="font-pixel text-[7px] sm:text-[8px] text-retro-muted/40 bg-retro-bg/40 px-2 py-1 rounded border border-retro-border/20 pointer-events-none">
                ESC to release
              </span>
            )}
          </div>

          {/* Mobile Touch Controls */}
          {isMobile && <MobileTouchControls onKey={handleTouchKey} />}
        </>
      )}

      {/* ── Settings toggle when not locked and not showing controls ── */}
      {!isLocked && !showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 bg-retro-bg/80 border border-retro-border/50 rounded font-pixel text-[9px] text-retro-muted hover:text-retro-green transition-all cursor-pointer"
        >
          ⚙ Settings
        </button>
      )}

      {/* ── Three.js Canvas ── */}
      <div ref={canvasRef} className="w-full h-full">
        <Canvas
          camera={{ fov: 65, near: 0.1, far: 300 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
          style={{ background: 'transparent' }}
        >
          <SkyGradient />
          <FogEffect />
          <WorldLighting />
          <FlyCamera keysRef={keysRef} speedRef={speedRef} />
          <MouseLook isLocked={isLocked} />
          <ChunkManagerWithCounter seed={seed} renderDistance={renderDistance} onChunkCount={handleChunkCount} />
          <CameraTracker onUpdate={handleCameraUpdate} biomeNoise={noises.biome} tempNoise={noises.temp} />
        </Canvas>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Mobile Touch Controls — D-pad + Up/Down buttons
 * ═══════════════════════════════════════════════════════════ */

function MobileTouchControls({
  onKey,
}: {
  onKey: (key: string, active: boolean) => void;
}) {
  const createTouchHandlers = useCallback(
    (key: string) => ({
      onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); onKey(key, true); },
      onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); onKey(key, false); },
      onTouchCancel: () => onKey(key, false),
    }),
    [onKey],
  );

  const btnBase = 'w-11 h-11 flex items-center justify-center rounded-lg bg-retro-bg/50 border border-retro-border/30 text-retro-muted/60 font-pixel text-sm select-none active:bg-retro-green/20 active:text-retro-green active:border-retro-green/40 transition-colors touch-none';

  return (
    <div className="absolute bottom-4 z-20 w-full px-4 flex justify-between items-end pointer-events-none">
      {/* D-pad (left side) */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1">
        <div /> {/* empty */}
        <button className={btnBase} {...createTouchHandlers('w')}>▲</button>
        <div /> {/* empty */}
        <button className={btnBase} {...createTouchHandlers('a')}>◄</button>
        <div className="w-11 h-11" /> {/* center */}
        <button className={btnBase} {...createTouchHandlers('d')}>►</button>
        <div /> {/* empty */}
        <button className={btnBase} {...createTouchHandlers('s')}>▼</button>
        <div /> {/* empty */}
      </div>

      {/* Ascend / Descend (right side) */}
      <div className="pointer-events-auto flex flex-col gap-2">
        <button className={btnBase} {...createTouchHandlers(' ')}>↑</button>
        <button className={btnBase} {...createTouchHandlers('shift')}>↓</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Chunk Manager wrapper that reports count
 * ═══════════════════════════════════════════════════════════ */

function ChunkManagerWithCounter({
  seed,
  renderDistance,
  onChunkCount,
}: {
  seed: number;
  renderDistance: number;
  onChunkCount: (count: number) => void;
}) {
  const { camera } = useThree();
  const chunkCache = useRef<Map<string, ChunkVoxelData>>(new Map());
  const [visibleChunks, setVisibleChunks] = useState<Map<string, ChunkVoxelData>>(new Map());
  const lastCameraChunk = useRef<string>('');
  const frustum = useRef(new THREE.Frustum());
  const projScreenMatrix = useRef(new THREE.Matrix4());

  const prevSeedRef = useRef(seed);

  const noises = useMemo(() => ({
    height: createNoise2D(seed),
    detail: createNoise2D(seed + 1),
    biome: createNoise2D(seed + 2),
    temp: createNoise2D(seed + 3),
    tree: createNoise2D(seed + 4),
  }), [seed]);

  useFrame(() => {
    // Reset cache when seed changes
    if (prevSeedRef.current !== seed) {
      prevSeedRef.current = seed;
      chunkCache.current.clear();
      lastCameraChunk.current = '';
    }

    const [ccx, ccz] = worldToChunk(camera.position.x, camera.position.z);
    const currentKey = `${ccx},${ccz}`;

    if (currentKey === lastCameraChunk.current) return;
    lastCameraChunk.current = currentKey;

    projScreenMatrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(projScreenMatrix.current);

    const newVisible = new Map<string, ChunkVoxelData>();
    const chunkWorldSize = CHUNK_SIZE * VOXEL_SIZE;

    for (let dx = -renderDistance; dx <= renderDistance; dx++) {
      for (let dz = -renderDistance; dz <= renderDistance; dz++) {
        if (dx * dx + dz * dz > renderDistance * renderDistance) continue;

        const cx = ccx + dx;
        const cz = ccz + dz;
        const key = chunkKey(cx, cz);

        const minX = cx * chunkWorldSize;
        const minZ = cz * chunkWorldSize;
        const bbox = new THREE.Box3(
          new THREE.Vector3(minX, 0, minZ),
          new THREE.Vector3(minX + chunkWorldSize, MAX_HEIGHT * VOXEL_SIZE, minZ + chunkWorldSize),
        );

        if (!frustum.current.intersectsBox(bbox)) continue;

        let data = chunkCache.current.get(key);
        if (!data) {
          data = generateChunkData(cx, cz, noises.height, noises.detail, noises.biome, noises.temp, noises.tree);
          chunkCache.current.set(key, data);
        }

        newVisible.set(key, data);
      }
    }

    // Memory management — prune distant chunks.
    // maxCache estimates the area of a square bounding the render circle
    // (diameter = renderDistance*2, +2 for border padding). We allow 2× that
    // before pruning, keeping a warm cache ring around the visible area.
    const maxCache = (renderDistance * 2 + 2) ** 2;
    if (chunkCache.current.size > maxCache * 2) {
      const toDelete: string[] = [];
      for (const [key] of chunkCache.current) {
        const parts = key.split(',');
        const kx = Number(parts[0]);
        const kz = Number(parts[1]);
        if ((kx - ccx) ** 2 + (kz - ccz) ** 2 > (renderDistance * 2) ** 2) {
          toDelete.push(key);
        }
      }
      for (const k of toDelete) chunkCache.current.delete(k);
    }

    setVisibleChunks(newVisible);
    onChunkCount(newVisible.size);
  });

  const entries = useMemo(() => Array.from(visibleChunks.entries()), [visibleChunks]);

  return (
    <>
      {entries.map(([key, data]) => (
        <ChunkMesh key={key} data={data} />
      ))}
    </>
  );
}
