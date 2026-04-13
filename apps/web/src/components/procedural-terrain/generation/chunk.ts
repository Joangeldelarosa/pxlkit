/* ═══════════════════════════════════════════════════════════════
 *  Chunk Generation — produces ChunkVoxelData for a 16×16 chunk
 *
 *  Terrain, water, city structures, natural structures, and pickups
 *  are all generated here. City uses the modular layout system from
 *  city/layout.ts and city/buildings.ts for advanced multi-lot buildings.
 * ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import type { BiomeType, BiomeConfig, ChunkVoxelData, WorldConfig } from '../types';
import {
  CHUNK_SIZE, VOXEL_SIZE, MAX_HEIGHT,
  BIOMES, BIOME_TYPES, BLOCK_SIZE, ROAD_W, LOT_INSET, AVENUE_W, CITY_HW_W,
  CONTINENT_PROFILES,
} from '../constants';
import { mulberry32, fbm } from '../utils/noise';
import { varyColor, hashCoord } from '../utils/color';
import { getBiome, getVariedBiome, getContinent, getContinentElevation } from '../utils/biomes';
import { classifyCityCell, getBuildingType, getBuildingHeight, getSectorLampColors, getInterHighwayInfo, getHighwayFurniture, TUNNEL_HEIGHT } from '../city/layout';
import { generateBuildingColumn } from '../city/buildings';
import type { PxlKitData } from '@pxlkit/core';

/* ── Icon pickup data ── */

interface PickupVoxel { x: number; y: number; color: string }

// These are loaded lazily — the icon imports are done in the main index
let PICKUP_ICONS: { icon: PxlKitData; voxels: PickupVoxel[] }[] = [];

export function setPickupIcons(icons: { icon: PxlKitData; voxels: PickupVoxel[] }[]) {
  PICKUP_ICONS = icons;
}

export function getPickupIcons() { return PICKUP_ICONS; }

/* ═══════════════════════════════════════════════════════════════ */

const _tc = new THREE.Color();

/* ── Village crop palettes (module-level to avoid per-iteration allocation) ── */
const CROP_COLORS: string[] = [
  '#ddaa22', // wheat/golden
  '#ee4422', // tomatoes/red
  '#8855cc', // lavender/purple
  '#ff8833', // oranges
  '#44bb44', // lettuce/green
  '#ffdd55', // sunflowers/yellow
  '#cc44aa', // berries/magenta
];
const CROP_STALK_COLORS: string[] = [
  '#aa8833', // wheat stalk
  '#55aa33', // tomato vine
  '#66aa55', // lavender stem
  '#668833', // orange tree bark
  '#447733', // lettuce base
  '#778833', // sunflower stalk
  '#886655', // berry bush
];

export function generateChunkData(
  cx: number, cz: number,
  heightN: (x: number, y: number) => number,
  detailN: (x: number, y: number) => number,
  biomeN: (x: number, y: number) => number,
  tempN: (x: number, y: number) => number,
  treeN: (x: number, y: number) => number,
  structN: (x: number, y: number) => number,
  regionN: (x: number, y: number) => number,
  cfg: WorldConfig,
  continentN?: (x: number, y: number) => number,
): ChunkVoxelData {
   // Buffer size: CHUNK_SIZE² cells × MAX_VOXELS_PER_COLUMN (terrain + buildings + structures + tunnels)
  // 80 accounts for MAX_HEIGHT=64 exposed faces, building columns (up to ~50 with spike boost),
  // tunnel walls/ceiling, natural structures, and open zone decorations.
  const MAX_VOXELS_PER_COLUMN = 80;
  const maxV = CHUNK_SIZE * CHUNK_SIZE * MAX_VOXELS_PER_COLUMN;
  const posA = new Float32Array(maxV * 3);
  const colA = new Float32Array(maxV * 3);
  let sc = 0;
  const maxW = CHUNK_SIZE * CHUNK_SIZE * 10;
  const wPosA = new Float32Array(maxW * 3);
  const wColA = new Float32Array(maxW * 3);
  let wc = 0;
  const pickups: ChunkVoxelData['pickups'] = [];
  const maxWin = CHUNK_SIZE * CHUNK_SIZE * 4;
  const winPosA = new Float32Array(maxWin * 3);
  let winC = 0;
  const groundHeightMap = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
  const npcWalkableMap = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
  const solidHeightMap = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
  const waterLevelMap = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
  /* Mini-voxel buffer for street furniture (lampposts, road lines, hydrants, etc.)
     Each mini-voxel is VOXEL_SIZE*0.15 = 0.075 world units — much thinner than regular voxels */
  const maxMini = CHUNK_SIZE * CHUNK_SIZE * 12;
  const miniPosA = new Float32Array(maxMini * 3);
  const miniColA = new Float32Array(maxMini * 3);
  let miniC = 0;
  /* Street light positions for night illumination (lamp top positions) */
  const maxSL = 32; // max street lights per chunk (typically 4 corners × few intersections)
  const slPosA = new Float32Array(maxSL * 3);
  let slC = 0;
  /* Road paint buffer — flat decal quads for lane markings, crosswalks.
     Each paint instance is a thin PlaneGeometry positioned flush on road surface. */
  const maxPaint = CHUNK_SIZE * CHUNK_SIZE * 6;
  const paintPosA = new Float32Array(maxPaint * 3);
  const paintColA = new Float32Array(maxPaint * 3);
  const paintScaleA = new Float32Array(maxPaint * 2); // [scaleX, scaleZ] per instance
  let paintC = 0;

  const bX = cx * CHUNK_SIZE, bZ = cz * CHUNK_SIZE;

  /* ── Finite world edge taper ── */
  const isFinite = cfg.worldMode === 'finite';
  const halfW = isFinite ? cfg.worldSize / 2 : 0;
  const taperStart = isFinite ? halfW * 0.75 : 0;

  function edgeFade(wx2: number, wz2: number): number {
    if (!isFinite) return 1;
    const dx2 = Math.abs(wx2 - halfW);
    const dz2 = Math.abs(wz2 - halfW);
    const dist = Math.sqrt(dx2 * dx2 + dz2 * dz2) * 0.85;
    if (dist >= halfW) return 0;
    if (dist <= taperStart) return 1;
    const angle = Math.atan2(wz2 - halfW, wx2 - halfW);
    const edgeNoise = Math.sin(angle * 5.7 + wx2 * 0.13) * 0.3
                    + Math.sin(angle * 11.3 + wz2 * 0.17) * 0.15
                    + Math.sin(angle * 2.1 + (wx2 + wz2) * 0.07) * 0.2;
    const adjustedDist = dist + edgeNoise * (halfW * 0.12);
    if (adjustedDist >= halfW) return 0;
    if (adjustedDist <= taperStart) return 1;
    const t = (adjustedDist - taperStart) / (halfW - taperStart);
    return 1 - t * t * (3 - 2 * t);
  }

  /* ── Pre-compute height map + biome ── */
  const gW = CHUNK_SIZE + 2;
  const hMap = new Int32Array(gW * gW);
  const bMap = new Uint8Array(gW * gW);
  const variedConfigs: BiomeConfig[] = new Array(CHUNK_SIZE * CHUNK_SIZE);

  for (let lx = -1; lx <= CHUNK_SIZE; lx++) {
    for (let lz = -1; lz <= CHUNK_SIZE; lz++) {
      const wx = bX + lx, wz = bZ + lz;
      const idx = (lx + 1) * gW + (lz + 1);
      const biome = getBiome(biomeN, tempN, wx, wz, cfg.cityFrequency, continentN);
      const base = BIOMES[biome];

      /* ── Continent-aware height variation ── */
      if (continentN) {
        const contType = getContinent(continentN, wx, wz);
        const contProfile = CONTINENT_PROFILES[contType];

        // City biome: continent elevation affects city ground level
        if (biome === 'city') {
          const continentElev = getContinentElevation(continentN, wx, wz);
          const cityBase = Math.max(3, Math.min(MAX_HEIGHT - 20,
            Math.floor(base.heightBase + continentElev * 0.3)));
          const c: BiomeConfig = {
            ...base,
            heightBase: cityBase,
            waterLevel: Math.max(0, base.waterLevel + contProfile.waterOffset),
          };
          if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
            variedConfigs[lx * CHUNK_SIZE + lz] = c;
          }
          let h = cityBase;
          const fade = edgeFade(wx, wz);
          if (fade <= 0) { hMap[idx] = -1; bMap[idx] = BIOME_TYPES.indexOf(biome); continue; }
          if (fade < 1) h = Math.max(0, Math.floor(h * fade));
          hMap[idx] = h;
          bMap[idx] = BIOME_TYPES.indexOf(biome);
          continue;
        }
      }

      const c = getVariedBiome(base, wx, wz, regionN, cfg.biomeVariation, cfg.terrainRoughness, continentN);

      if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
        variedConfigs[lx * CHUNK_SIZE + lz] = c;
      }

      let h: number;
      const base2 = fbm(heightN, wx * 0.02, wz * 0.02, 4, 2.0, 0.5);
      const det = detailN(wx * 0.08, wz * 0.08) * (0.2 + cfg.terrainRoughness * 0.3);
      let extra = 0;
      if (biome === 'mountains') {
        extra = Math.abs(fbm(detailN, wx * 0.015 + 200, wz * 0.015 + 200, 2)) * (6 + cfg.terrainRoughness * 6);
      }
      h = Math.max(0, Math.min(MAX_HEIGHT, Math.floor(c.heightBase + (base2 + det) * c.heightScale + extra)));

      const fade = edgeFade(wx, wz);
      if (fade <= 0) { hMap[idx] = -1; bMap[idx] = BIOME_TYPES.indexOf(biome); continue; }
      if (fade < 1) h = Math.max(0, Math.floor(h * fade));
      hMap[idx] = h;
      bMap[idx] = BIOME_TYPES.indexOf(biome);
    }
  }

  /* ── Biome boundary height smoothing pass ──
   *  Where two different biomes meet the height can jump dramatically
   *  (e.g. city at 7 vs mountain at 30). This creates ugly cliffs.
   *  We detect boundary cells (where any cardinal/diagonal neighbor has a different biome)
   *  and blend their height with a Gaussian-weighted average of neighbors.
   *  4 passes with diagonal+cardinal sampling ≈ smooth 4-voxel-wide ramp,
   *  producing natural-looking terrain transitions. */
  {
    const BLEND_PASSES = 4;
    const tmpH = new Int32Array(hMap.length);
    /* 8-neighbor offsets: dx, dz pairs (cardinal + diagonal) with Gaussian weights.
       Cardinal neighbors (dist 1) get weight 1.0, diagonals (dist √2) get ~0.7. */
    const NEIGHBOR_OFFSETS: [number, number, number][] = [
      [-1, 0, 1.0],  [1, 0, 1.0],  [0, -1, 1.0],  [0, 1, 1.0],   // cardinal
      [-1, -1, 0.7], [1, -1, 0.7], [-1, 1, 0.7],   [1, 1, 0.7],   // diagonal
    ];
    for (let pass = 0; pass < BLEND_PASSES; pass++) {
      tmpH.set(hMap);
      for (let lx = 0; lx <= CHUNK_SIZE; lx++) {
        for (let lz = 0; lz <= CHUNK_SIZE; lz++) {
          const idx = (lx + 1) * gW + (lz + 1);
          if (hMap[idx] < 0) continue;
          const myBiome = bMap[idx];

          // Check all 8 neighbors for biome boundary
          let isBoundary = false;
          for (let n = 0; n < NEIGHBOR_OFFSETS.length; n++) {
            const [dx, dz] = NEIGHBOR_OFFSETS[n];
            const nx = lx + 1 + dx, nz = lz + 1 + dz;
            if (nx < 0 || nx >= gW || nz < 0 || nz >= gW) continue;
            const nIdx = nx * gW + nz;
            if (hMap[nIdx] >= 0 && bMap[nIdx] !== myBiome) {
              isBoundary = true;
              break;
            }
          }
          if (!isBoundary) continue;

          // Gaussian-weighted average with all 8 neighbors
          // Center weight increases each pass (2.0 → 3.5) to prevent
          // over-smoothing: early passes do heavy blending, later passes
          // preserve the terrain character that's already been smoothed.
          const centerW = 2.0 + pass * 0.5;
          let sum = hMap[idx] * centerW;
          let w = centerW;
          for (let n = 0; n < NEIGHBOR_OFFSETS.length; n++) {
            const [dx, dz, nw] = NEIGHBOR_OFFSETS[n];
            const nx = lx + 1 + dx, nz = lz + 1 + dz;
            if (nx < 0 || nx >= gW || nz < 0 || nz >= gW) continue;
            const nIdx = nx * gW + nz;
            if (hMap[nIdx] >= 0) {
              sum += hMap[nIdx] * nw;
              w += nw;
            }
          }
          tmpH[idx] = Math.max(0, Math.min(MAX_HEIGHT, Math.floor(sum / w)));
        }
      }
      hMap.set(tmpH);
    }
  }

  /* ── Pre-compute inter-biome highway map ──
   *  For each cell in the chunk, determine if it's on an inter-biome highway.
   *  Store: highway level (road surface Y), whether it's a tunnel, and the
   *  InterHighwayInfo for lane/barrier rendering later. */
  const hwInfoMap: (ReturnType<typeof getInterHighwayInfo>)[] = new Array(CHUNK_SIZE * CHUNK_SIZE).fill(null);
  /** Highway road surface level per cell (-1 = not on highway) */
  const hwLevelMap = new Int32Array(CHUNK_SIZE * CHUNK_SIZE).fill(-1);
  /** true if this highway cell is inside a tunnel (mountain above) */
  const hwTunnelMap = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
  /** Original (pre-carve) terrain height at each cell — needed so we know
   *  what the mountain looks like above the tunnel for rendering walls/ceiling. */
  const origHMap = new Int32Array(gW * gW);
  origHMap.set(hMap);

  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const wx = bX + lx, wz = bZ + lz;
      const idx = (lx + 1) * gW + (lz + 1);
      const h = hMap[idx];
      if (h < 0) continue;
      const biome = BIOME_TYPES[bMap[idx]] as BiomeType;

      // Skip city biome — intra-city highways handle that
      // Ocean biome is NOT skipped — highways bridge over water
      if (biome === 'city') continue;

      const hwInfo = getInterHighwayInfo(wx, wz);
      if (!hwInfo) continue;

      const localIdx = lx * CHUNK_SIZE + lz;
      // Only actual road surface (not just shoulder) — use per-class half-width
      const onRoad = (Math.abs(hwInfo.distFromCenterX) <= hwInfo.hwHalfWX && hwInfo.onX)
                  || (Math.abs(hwInfo.distFromCenterZ) <= hwInfo.hwHalfWZ && hwInfo.onZ);
      if (!onRoad && !hwInfo.isShoulder) continue;

      hwInfoMap[localIdx] = hwInfo;

      // Compute the highway surface level.
      // The key challenge is cross-chunk continuity: each chunk only has
      // terrain heights for its own cells (+1 border). To get a smooth,
      // globally-consistent road grade we use a TWO-STEP approach:
      //
      // 1) LOCAL MINIMUM: sample nearby terrain heights within the chunk
      //    to approximate the local valley/floor level.
      // 2) GLOBAL NOISE FLOOR: also sample the raw terrain noise at extended
      //    positions OUTSIDE the chunk (using the same deterministic noise
      //    functions). This gives us a chunk-boundary-independent estimate.
      //
      // The final road level is the max of (waterLevel+2, blended estimate).
      const c = variedConfigs[localIdx] || BIOMES[biome];
      const waterLevel = c.waterLevel;

      let roadLevel = h;
      let maxWL = waterLevel;

      if (biome !== 'mountains') {
        // ── Step 1: Local terrain sampling (within chunk border) ──
        const sampleRange = Math.min(6, CHUNK_SIZE - 1);
        let localMinH = h;
        for (let s = -sampleRange; s <= sampleRange; s++) {
          // Cross-section (perpendicular to highway)
          const sx1 = Math.max(0, Math.min(gW - 1, lx + 1 + (hwInfo.onX ? 0 : s)));
          const sz1 = Math.max(0, Math.min(gW - 1, lz + 1 + (hwInfo.onZ ? 0 : s)));
          const sIdx1 = sx1 * gW + sz1;
          if (hMap[sIdx1] >= 0 && hMap[sIdx1] < localMinH) localMinH = hMap[sIdx1];
          // Water level from neighbor configs
          const sLx = sx1 - 1, sLz = sz1 - 1;
          if (sLx >= 0 && sLx < CHUNK_SIZE && sLz >= 0 && sLz < CHUNK_SIZE) {
            const sConf = variedConfigs[sLx * CHUNK_SIZE + sLz];
            if (sConf && sConf.waterLevel > maxWL) maxWL = sConf.waterLevel;
          }
          // Along the highway direction
          const sx2 = Math.max(0, Math.min(gW - 1, lx + 1 + (hwInfo.onX ? s : 0)));
          const sz2 = Math.max(0, Math.min(gW - 1, lz + 1 + (hwInfo.onZ ? s : 0)));
          const sIdx2 = sx2 * gW + sz2;
          if (hMap[sIdx2] >= 0 && hMap[sIdx2] < localMinH) localMinH = hMap[sIdx2];
        }

        // ── Step 2: Extended noise sampling (outside chunk) ──
        // Sample terrain height at positions along the highway OUTSIDE the chunk.
        // This uses the same noise functions to get a deterministic height estimate,
        // ensuring adjacent chunks compute similar road levels at shared borders.
        const EXT_RANGE = 16; // sample ±16 voxels along highway axis
        let noiseMinH = h;
        for (let s = -EXT_RANGE; s <= EXT_RANGE; s += 2) {
          const swx = wx + (hwInfo.onX ? s : 0);
          const swz = wz + (hwInfo.onZ ? s : 0);
          const sBiome = getBiome(biomeN, tempN, swx, swz, cfg.cityFrequency, continentN);
          const sBase = BIOMES[sBiome];
          const sc2 = getVariedBiome(sBase, swx, swz, regionN, cfg.biomeVariation, cfg.terrainRoughness, continentN);
          const sBase2 = fbm(heightN, swx * 0.02, swz * 0.02, 4, 2.0, 0.5);
          const sDet = detailN(swx * 0.08, swz * 0.08) * (0.2 + cfg.terrainRoughness * 0.3);
          let sExtra = 0;
          if (sBiome === 'mountains') {
            sExtra = Math.abs(fbm(detailN, swx * 0.015 + 200, swz * 0.015 + 200, 2)) * (6 + cfg.terrainRoughness * 6);
          }
          const sH = Math.max(0, Math.min(MAX_HEIGHT, Math.floor(sc2.heightBase + (sBase2 + sDet) * sc2.heightScale + sExtra)));
          if (sH >= 0 && sH < noiseMinH) noiseMinH = sH;
          if (sc2.waterLevel > maxWL) maxWL = sc2.waterLevel;
        }

        // Blend local and extended estimates — use the minimum of both
        // This gives us a smooth, chunk-boundary-independent road level
        roadLevel = Math.min(localMinH, noiseMinH);
      }
      roadLevel = Math.max(maxWL + 2, roadLevel);

      // Tunnel detection: if terrain is significantly higher than road level
      const isTunnel = biome === 'mountains' && h > roadLevel + TUNNEL_HEIGHT + 2;

      if (isTunnel) {
        // For tunnels, set road level to a reasonable grade
        // (lower than the mountain but above water)
        roadLevel = Math.max(maxWL + 2, Math.min(roadLevel, h - TUNNEL_HEIGHT - 3));
      }

      hwLevelMap[localIdx] = roadLevel;
      hwTunnelMap[localIdx] = isTunnel ? 1 : 0;
    }
  }

  /* ── Terrain clearing zone: lower terrain near highways ──
   *  For cells immediately adjacent to the highway corridor, cap their
   *  terrain height to the highway road level. This prevents neighboring
   *  terrain (crops, dirt, mountains) from visually protruding above the
   *  highway surface. We extend 2 cells outward from any highway cell. */
  const HW_CLEAR_RADIUS = 2;
  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const lIdx = lx * CHUNK_SIZE + lz;
      if (hwLevelMap[lIdx] < 0) continue; // not a highway cell
      if (hwTunnelMap[lIdx] === 1) continue; // tunnels keep terrain above

      const roadLvl = hwLevelMap[lIdx];
      const hmIdx = (lx + 1) * gW + (lz + 1);
      const terrH = hMap[hmIdx];
      // Only clear if terrain is above road level
      if (terrH <= roadLvl) continue;

      // Lower neighboring cells that are NOT on the highway
      for (let dx = -HW_CLEAR_RADIUS; dx <= HW_CLEAR_RADIUS; dx++) {
        for (let dz = -HW_CLEAR_RADIUS; dz <= HW_CLEAR_RADIUS; dz++) {
          if (dx === 0 && dz === 0) continue;
          const nx = lx + dx, nz = lz + dz;
          if (nx < -1 || nx > CHUNK_SIZE || nz < -1 || nz > CHUNK_SIZE) continue;
          const nHmIdx = (nx + 1) * gW + (nz + 1);
          // Only lower if this neighbor is NOT itself a highway cell
          const nLIdx = nx >= 0 && nx < CHUNK_SIZE && nz >= 0 && nz < CHUNK_SIZE
            ? nx * CHUNK_SIZE + nz : -1;
          if (nLIdx >= 0 && hwLevelMap[nLIdx] >= 0) continue; // neighbor is highway, skip
          // Cap neighbor terrain to road level (smooth slope)
          const dist = Math.max(Math.abs(dx), Math.abs(dz));
          const maxH = roadLvl + dist; // allow slight slope outward
          if (hMap[nHmIdx] > maxH) {
            hMap[nHmIdx] = maxH;
          }
        }
      }
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
  function pushW(px: number, py: number, pz: number, hex: string) {
    if (wc >= maxW) return;
    const i3 = wc * 3;
    wPosA[i3] = px; wPosA[i3 + 1] = py; wPosA[i3 + 2] = pz;
    _tc.set(hex); wColA[i3] = _tc.r; wColA[i3 + 1] = _tc.g; wColA[i3 + 2] = _tc.b;
    wc++;
  }
  function trackH(lx2: number, lz2: number, yTop: number) {
    if (lx2 >= 0 && lx2 < CHUNK_SIZE && lz2 >= 0 && lz2 < CHUNK_SIZE) {
      const i = lx2 * CHUNK_SIZE + lz2;
      if (yTop > solidHeightMap[i]) solidHeightMap[i] = yTop;
    }
  }
  function pushWin(px: number, py: number, pz: number) {
    if (winC >= maxWin) return;
    const i3 = winC * 3;
    winPosA[i3] = px; winPosA[i3 + 1] = py; winPosA[i3 + 2] = pz;
    winC++;
  }
  /** Push a mini-voxel (VOXEL_SIZE*0.15 cube) for street furniture / road markings */
  function pushMini(px: number, py: number, pz: number, hex: string) {
    if (miniC >= maxMini) return;
    const i3 = miniC * 3;
    miniPosA[i3] = px; miniPosA[i3 + 1] = py; miniPosA[i3 + 2] = pz;
    _tc.set(hex); miniColA[i3] = _tc.r; miniColA[i3 + 1] = _tc.g; miniColA[i3 + 2] = _tc.b;
    miniC++;
  }
  /** Register a street lamp light position for night illumination */
  function pushSL(px: number, py: number, pz: number) {
    if (slC >= maxSL) return;
    const i3 = slC * 3;
    slPosA[i3] = px; slPosA[i3 + 1] = py; slPosA[i3 + 2] = pz;
    slC++;
  }
  /** Push a flat road paint decal. scaleX/scaleZ control the width of the thin strip
   *  in world units. Sits 0.005 above road surface for z-fighting prevention. */
  function pushPaint(px: number, py: number, pz: number, hex: string, scaleX: number, scaleZ: number) {
    if (paintC >= maxPaint) return;
    const i3 = paintC * 3;
    const i2 = paintC * 2;
    paintPosA[i3] = px; paintPosA[i3 + 1] = py; paintPosA[i3 + 2] = pz;
    _tc.set(hex); paintColA[i3] = _tc.r; paintColA[i3 + 1] = _tc.g; paintColA[i3 + 2] = _tc.b;
    paintScaleA[i2] = scaleX; paintScaleA[i2 + 1] = scaleZ;
    paintC++;
  }
  /** Mini-voxel step size = VOXEL_SIZE * 0.15 */
  const MVS = VOXEL_SIZE * 0.15;

  const chunkRand = mulberry32(cx * 73856093 + cz * 19349663);

  /** Height threshold for snow-capped mountain peaks (55% of MAX_HEIGHT, min ~47%) */
  const SNOW_LINE = Math.max(Math.floor(MAX_HEIGHT * 0.47), Math.floor(MAX_HEIGHT * 0.55));
  /** Height threshold for exposed rock transition zone (38% of MAX_HEIGHT, min ~31%) */
  const ROCK_LINE = Math.max(Math.floor(MAX_HEIGHT * 0.31), Math.floor(MAX_HEIGHT * 0.38));

  /* ════════════════════════ MAIN LOOP ════════════════════════ */
  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const idx = (lx + 1) * gW + (lz + 1);
      const h = hMap[idx];
      if (h < 0) continue;
      const biome = BIOME_TYPES[bMap[idx]] as BiomeType;
      const c = variedConfigs[lx * CHUNK_SIZE + lz] || BIOMES[biome];
      const wx = bX + lx, wz = bZ + lz;

      const hN = hMap[(lx + 1) * gW + lz];
      const hS = hMap[(lx + 1) * gW + (lz + 2)];
      const hE = hMap[(lx + 2) * gW + (lz + 1)];
      const hWest = hMap[lx * gW + (lz + 1)];
      const wl = c.waterLevel;
      const lIdx = lx * CHUNK_SIZE + lz;
      waterLevelMap[lIdx] = wl;
      groundHeightMap[lIdx] = h;
      npcWalkableMap[lIdx] = biome === 'city' ? 0 : 1;

      /* ── Inter-biome highway/tunnel detection for this cell ── */
      const hwInfo = hwInfoMap[lIdx];
      const hwLevel = hwLevelMap[lIdx];
      const isTunnel = hwTunnelMap[lIdx] === 1;
      const isOnInterHW = hwInfo !== null && hwLevel >= 0;

      /* ── 1. TERRAIN ── */
      /* For highway cells we must carve the terrain:
       *  - Non-tunnel highways: don't render any terrain above roadLevel
       *    (the highway surface itself is rendered later in section 3b)
       *  - Tunnel highways: don't render terrain in the cavity (roadLevel..roadLevel+TUNNEL_HEIGHT)
       *    but DO render terrain above the tunnel ceiling (mountain continues above)
       * This ensures highways are flat, clear of dirt/trees/snow. */
      const terrainCap = isOnInterHW
        ? (isTunnel ? h : hwLevel)   // tunnels keep terrain above ceiling; non-tunnel stops at road
        : h;
      for (let y = 0; y <= terrainCap; y++) {
        const isTop = (y === terrainCap);

        // Tunnel carving: skip terrain voxels inside the tunnel cavity
        if (isOnInterHW && isTunnel) {
          const tunnelFloor = hwLevel;
          const tunnelCeil = hwLevel + TUNNEL_HEIGHT;
          // Don't render terrain inside the tunnel cavity
          if (y > tunnelFloor && y <= tunnelCeil) continue;
        }

        const exposed = isTop || y === 0 || y > hN || y > hS || y > hE || y > hWest;
        if (!exposed) continue;

        let baseCol: string;

        if (isTop && biome === 'mountains' && y > SNOW_LINE) {
          // Snow-capped peaks
          baseCol = '#f0f4ff';
        } else if (isTop && biome === 'mountains' && y > ROCK_LINE) {
          // Exposed rock / accent color
          baseCol = c.colors.accent;
        } else if (isTop && y > SNOW_LINE + 4) {
          // Any biome at extreme heights gets snow
          baseCol = '#eef2ff';
        } else if (isTop) {
          baseCol = c.colors.top;
        } else if (y >= h - 3) {
          baseCol = c.colors.mid;
        } else if (y >= h - 8) {
          // Deeper subsurface layer — more rock/earth variation
          baseCol = c.colors.bottom;
        } else {
          // Deep underground — darker
          baseCol = c.colors.bottom;
        }
        push((bX + lx) * VOXEL_SIZE, y * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
          varyColor(baseCol, wx, y, wz));
      }
      trackH(lx, lz, terrainCap);

      /* ── 2. WATER — flat surface plane for seamless cross-chunk rendering ── */
      /* Skip water rendering under highway cells — the highway surface replaces it.
       * When highway is over water we render bridge supports instead (section 3b). */
      if (h < wl && !isOnInterHW) {
        pushW((bX + lx) * VOXEL_SIZE, wl * VOXEL_SIZE + VOXEL_SIZE * 0.5, (bZ + lz) * VOXEL_SIZE,
          varyColor(c.colors.water, wx, wl, wz, 4, 0.06, 0.06));
        trackH(lx, lz, wl);
      }

      /* ══════════════════ 3. CITY BIOME ══════════════════ */
      if (biome === 'city') {
        const cell = classifyCityCell(wx, wz, structN);
        npcWalkableMap[lIdx] = (cell.isRoad || cell.isSidewalk || cell.isOpenZone) ? 1 : 0;
        if (cell.isRoad || cell.isSidewalk) groundHeightMap[lIdx] = h + 1;
        if (cell.isOpenZone) groundHeightMap[lIdx] = h;

        if (cell.isRoad) {
          /* ── Road surface ── */
          const modX = ((wx % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
          const modZ = ((wz % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
          const rw = cell.roadWidth;

          /* ── City Highway (12-wide boulevard): barrier, 4 lanes, median, 4 lanes, barrier ──
           *  Cross-section (for road running along X, modZ is the transverse position):
           *  0: concrete barrier  | 1-4: lanes (4 lanes) | 5: yellow center
           *  6: green median      | 7: yellow center     | 8-11: lanes (4 lanes) | (12-1=11): barrier
           *  For road running along Z, modX is the transverse position.
           */
          const isCHW = cell.isCityHighway;

          // Road surface color
          let roadBase: string;
          if (isCHW) {
            // City highway: detect sub-elements by position within the 12-wide road
            const rwX2 = cell.roadWidthX;
            const rwZ2 = cell.roadWidthZ;
            const onHwZ = modZ < rwZ2 && rwZ2 >= CITY_HW_W;
            const hwMod = onHwZ ? modZ : modX;
            const hwW = onHwZ ? rwZ2 : rwX2;
            const mid = Math.floor(hwW / 2); // 6 for width 12
            const isHwBarrier = hwMod === 0 || hwMod === hwW - 1;
            const isHwMedian = hwMod === mid || hwMod === mid - 1;

            if (isHwBarrier) {
              roadBase = '#555555'; // dark edge strip under barrier
              // Mini-voxel curb: 5 MVS high (~0.375 world units) — proportional thin barrier
              const curbPx = (bX + lx) * VOXEL_SIZE;
              const curbPz = (bZ + lz) * VOXEL_SIZE;
              const curbBaseY = (h + 1) * VOXEL_SIZE + VOXEL_SIZE * 0.5;
              const cityCurbH = 5; // mini-voxel units
              for (let cy = 0; cy < cityCurbH; cy++) {
                pushMini(curbPx, curbBaseY + cy * MVS, curbPz, '#999999');
              }
              trackH(lx, lz, h + 1);
            } else if (isHwMedian) {
              roadBase = '#338833'; // green median divider
            } else {
              roadBase = '#2a2a2a'; // dark asphalt
            }
          } else if (cell.isHighway) {
            roadBase = '#2a2a2a';
          } else if (cell.isIntersection) {
            roadBase = '#505050';
          } else if (cell.isAvenue) {
            roadBase = '#424242';
          } else {
            roadBase = '#383838';
          }
          push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor(roadBase, wx, h + 1, wz, 2, 0.02, 0.03));
          trackH(lx, lz, h + 1);

          const onRoadX = modX < cell.roadWidthX;
          const onRoadZ = modZ < cell.roadWidthZ;
          // Paint Y: flush on top of road surface with tiny 0.005 offset to avoid z-fighting
          const paintY = (h + 1) * VOXEL_SIZE + VOXEL_SIZE * 0.5 + 0.005;
          // Center of this voxel cell
          const cellCx = (bX + lx) * VOXEL_SIZE;
          const cellCz = (bZ + lz) * VOXEL_SIZE;
          // Paint strip width = ~2 mini-voxels = MVS*2, length = full voxel
          const stripW = MVS * 1.5;    // narrow paint line width
          const cellLen = VOXEL_SIZE;   // full voxel length for continuous line

          /* ── Lane markings as flat paint (non-intersection) ── */
          if (!cell.isIntersection) {
            if (isCHW) {
              /* City Highway markings (12 wide):
                 0: barrier | 1: white edge | 2-3: lane dividers | 4: white edge
                 5: yellow center | 6: green median | 7: yellow center
                 8: white edge | 9-10: lane dividers | 11: barrier */
              const rwForAxis = onRoadZ && !onRoadX ? cell.roadWidthZ : cell.roadWidthX;
              if (rwForAxis >= CITY_HW_W) {
                const hwMod2 = onRoadZ && !onRoadX ? modZ : modX;
                const mid2 = Math.floor(rwForAxis / 2);
                // Lane lines based on position
                if (onRoadZ && !onRoadX) {
                  // Highway runs along X
                  if (hwMod2 === 1 || hwMod2 === rwForAxis - 2) {
                    pushPaint(cellCx, paintY, cellCz, '#cccccc', cellLen, stripW);
                  } else if (hwMod2 === mid2 - 2 || hwMod2 === mid2 + 1) {
                    // Yellow center lines
                    pushPaint(cellCx, paintY, cellCz, '#ffdd44', cellLen, stripW);
                  } else if (hwMod2 > 1 && hwMod2 < mid2 - 2 && ((hwMod2 - 2) % 2 === 0)) {
                    // Dashed white lane divider (every 2 voxels within lane area)
                    if (((wx % 6) + 6) % 6 < 3) {
                      pushPaint(cellCx, paintY, cellCz, '#aaaaaa', cellLen * 0.5, stripW);
                    }
                  } else if (hwMod2 > mid2 + 1 && hwMod2 < rwForAxis - 2 && ((hwMod2 - mid2 - 2) % 2 === 0)) {
                    if (((wx % 6) + 6) % 6 < 3) {
                      pushPaint(cellCx, paintY, cellCz, '#aaaaaa', cellLen * 0.5, stripW);
                    }
                  }
                }
                if (onRoadX && !onRoadZ) {
                  // Highway runs along Z
                  if (hwMod2 === 1 || hwMod2 === rwForAxis - 2) {
                    pushPaint(cellCx, paintY, cellCz, '#cccccc', stripW, cellLen);
                  } else if (hwMod2 === mid2 - 2 || hwMod2 === mid2 + 1) {
                    pushPaint(cellCx, paintY, cellCz, '#ffdd44', stripW, cellLen);
                  } else if (hwMod2 > 1 && hwMod2 < mid2 - 2 && ((hwMod2 - 2) % 2 === 0)) {
                    if (((wz % 6) + 6) % 6 < 3) {
                      pushPaint(cellCx, paintY, cellCz, '#aaaaaa', stripW, cellLen * 0.5);
                    }
                  } else if (hwMod2 > mid2 + 1 && hwMod2 < rwForAxis - 2 && ((hwMod2 - mid2 - 2) % 2 === 0)) {
                    if (((wz % 6) + 6) % 6 < 3) {
                      pushPaint(cellCx, paintY, cellCz, '#aaaaaa', stripW, cellLen * 0.5);
                    }
                  }
                }
              }
            } else if (rw >= AVENUE_W) {
              /* Avenue markings (9 wide):
                 0: white edge | 1-2: lanes | 3: dashed divider
                 4: green median | 5: dashed divider | 6-7: lanes | 8: white edge */
              const mid = Math.floor(rw / 2); // 4 for width 9
              if (onRoadZ && !onRoadX) {
                // Road runs along X axis, modZ = cross-section position
                if (modZ === 0 || modZ === cell.roadWidthZ - 1) {
                  // Solid white edge — one flat strip along X
                  pushPaint(cellCx, paintY, cellCz, '#cccccc', cellLen, stripW);
                } else if (modZ === mid - 1 || modZ === mid + 1) {
                  // Dashed white lane dividers along X
                  if (((wx % 6) + 6) % 6 < 3) {
                    pushPaint(cellCx, paintY, cellCz, '#aaaaaa', cellLen * 0.5, stripW);
                  }
                } else if (modZ === mid) {
                  // Green median strip — wider paint stripe, slightly raised
                  pushPaint(cellCx, paintY + 0.01, cellCz, varyColor('#448844', wx, h + 1, wz, 3, 0.04, 0.06), cellLen, MVS * 3);
                }
              }
              if (onRoadX && !onRoadZ) {
                // Road runs along Z axis, modX = cross-section position
                if (modX === 0 || modX === cell.roadWidthX - 1) {
                  pushPaint(cellCx, paintY, cellCz, '#cccccc', stripW, cellLen);
                } else if (modX === mid - 1 || modX === mid + 1) {
                  if (((wz % 6) + 6) % 6 < 3) {
                    pushPaint(cellCx, paintY, cellCz, '#aaaaaa', stripW, cellLen * 0.5);
                  }
                } else if (modX === mid) {
                  pushPaint(cellCx, paintY + 0.01, cellCz, varyColor('#448844', wx, h + 1, wz, 3, 0.04, 0.06), MVS * 3, cellLen);
                }
              }
            } else {
              /* Standard road markings (6 wide):
                 0: white edge | 1: lane | 2-3: dashed yellow center | 4: lane | 5: white edge */
              const cL = Math.floor(rw / 2) - 1; // 2
              const cR = Math.floor(rw / 2);     // 3
              if (onRoadZ && !onRoadX) {
                // Road runs along X, markings along X direction
                if (modZ === 0 || modZ === cell.roadWidthZ - 1) {
                  pushPaint(cellCx, paintY, cellCz, '#bbbbbb', cellLen, stripW);
                } else if (modZ === cL && ((wx % 4) + 4) % 4 < 2) {
                  // Left yellow center line — offset by MVS in Z
                  pushPaint(cellCx, paintY, cellCz + MVS, '#ffdd44', cellLen * 0.4, stripW);
                } else if (modZ === cR && ((wx % 4) + 4) % 4 < 2) {
                  // Right yellow center line
                  pushPaint(cellCx, paintY, cellCz - MVS, '#ffdd44', cellLen * 0.4, stripW);
                }
              }
              if (onRoadX && !onRoadZ) {
                // Road runs along Z, markings along Z direction
                if (modX === 0 || modX === cell.roadWidthX - 1) {
                  pushPaint(cellCx, paintY, cellCz, '#bbbbbb', stripW, cellLen);
                } else if (modX === cL && ((wz % 4) + 4) % 4 < 2) {
                  pushPaint(cellCx + MVS, paintY, cellCz, '#ffdd44', stripW, cellLen * 0.4);
                } else if (modX === cR && ((wz % 4) + 4) % 4 < 2) {
                  pushPaint(cellCx - MVS, paintY, cellCz, '#ffdd44', stripW, cellLen * 0.4);
                }
              }
            }
          }

          /* ── Crosswalk zebra stripes at intersections (flat paint) ── */
          if (cell.isIntersection) {
            const rwX = cell.roadWidthX;
            const rwZ = cell.roadWidthZ;
            const nearEdgeX = modX <= 1 || modX >= rwX - 2;
            const nearEdgeZ = modZ <= 1 || modZ >= rwZ - 2;
            if ((nearEdgeX || nearEdgeZ) && (((modX + modZ) % 2) === 0)) {
              const crossW = VOXEL_SIZE * 0.8; // crosswalk stripe width
              if (nearEdgeZ && !nearEdgeX) {
                // Stripe runs along X (across Z-road at edge)
                pushPaint(cellCx, paintY, cellCz, '#dddddd', crossW, stripW * 1.5);
              } else if (nearEdgeX && !nearEdgeZ) {
                // Stripe runs along Z (across X-road at edge)
                pushPaint(cellCx, paintY, cellCz, '#dddddd', stripW * 1.5, crossW);
              } else {
                // Corner of intersection — small cross paint
                pushPaint(cellCx, paintY, cellCz, '#dddddd', stripW * 2, stripW * 2);
              }
            }
          }

          /* ── Lampposts as mini-voxels — thin poles at NPC scale ── */
          if (cell.isIntersection) {
            const rwX = cell.roadWidthX;
            const rwZ = cell.roadWidthZ;
            const atCorner = (modX === 0 || modX === rwX - 1) && (modZ === 0 || modZ === rwZ - 1);
            if (atCorner) {
              // Sector-based lamppost colors
              const sectorColors = getSectorLampColors(wx, wz);
              // Pole base sits on the road surface: (h+1)*VOXEL_SIZE + VOXEL_SIZE*0.5
              const poleBaseY = (h + 1) * VOXEL_SIZE + VOXEL_SIZE * 0.5;
              const px = cellCx;
              const pz = cellCz;
              // Thick base (2×2 mini-voxels, 3 tall)
              for (let by = 0; by < 3; by++) {
                for (let bx = -1; bx <= 0; bx++) {
                  for (let bz = -1; bz <= 0; bz++) {
                    pushMini(px + bx * MVS, poleBaseY + by * MVS, pz + bz * MVS, sectorColors.pole);
                  }
                }
              }
              // Main shaft: single column of mini-voxels, ~22 units tall
              // Total real height: 22 * 0.075 = 1.65 world units (= ~3.3 regular voxels)
              const shaftH = 22;
              for (let sy = 3; sy < shaftH; sy++) {
                pushMini(px, poleBaseY + sy * MVS, pz, '#555555');
              }
              // Top cap
              pushMini(px, poleBaseY + shaftH * MVS, pz, '#666666');
              // Lamp arm extends toward road center from corner
              const armDx = (modX === 0) ? 1 : -1;
              const armDz = (modZ === 0) ? 1 : -1;
              // X-direction arm (3 mini-voxels long) + light fixture
              for (let a = 1; a <= 3; a++) {
                pushMini(px + a * armDx * MVS, poleBaseY + (shaftH - 1) * MVS, pz, '#666666');
              }
              // Light at end of X arm — sector colored
              pushMini(px + 2 * armDx * MVS, poleBaseY + shaftH * MVS, pz, sectorColors.lampA);
              pushMini(px + 3 * armDx * MVS, poleBaseY + shaftH * MVS, pz, sectorColors.lampB);
              // Register X-arm light for night illumination
              pushSL(px + 2.5 * armDx * MVS, poleBaseY + shaftH * MVS, pz);
              // Z-direction arm + light
              for (let a = 1; a <= 3; a++) {
                pushMini(px, poleBaseY + (shaftH - 1) * MVS, pz + a * armDz * MVS, '#666666');
              }
              pushMini(px, poleBaseY + shaftH * MVS, pz + 2 * armDz * MVS, sectorColors.lampA);
              pushMini(px, poleBaseY + shaftH * MVS, pz + 3 * armDz * MVS, sectorColors.lampB);
              // Register Z-arm light for night illumination
              pushSL(px, poleBaseY + shaftH * MVS, pz + 2.5 * armDz * MVS);
              // trackH still uses regular voxel grid height
              trackH(lx, lz, h + 1 + Math.ceil((shaftH * MVS) / VOXEL_SIZE));
            }
          }

          /* ── City highway barrier-mounted lamps (mini-voxel thin poles) ──
           *  Along city highways (not at intersections), place highway lamps
           *  on the barrier voxels (modX=0 or modX=width-1 for Z-running) */
          if (isCHW && !cell.isIntersection) {
            const rwForLamp = onRoadZ && !onRoadX ? cell.roadWidthZ : cell.roadWidthX;
            const hwModLamp = onRoadZ && !onRoadX ? modZ : modX;
            const isLampBarrier = hwModLamp === 0 || hwModLamp === rwForLamp - 1;
            const axisPos = onRoadZ && !onRoadX ? wx : wz;
            // Lamp spacing: every 8 voxels along the axis
            if (isLampBarrier && ((axisPos % 8 + 8) % 8 === 0)) {
              // Mini-voxel pole sitting on top of mini-voxel curb
              // Curb top: road surface (h+1) + VOXEL_SIZE/2 + 5*MVS
              const cityCurbTop = (h + 1) * VOXEL_SIZE + VOXEL_SIZE * 0.5 + 5 * MVS;
              const lampBaseY = cityCurbTop;
              const lampPx = (bX + lx) * VOXEL_SIZE;
              const lampPz = (bZ + lz) * VOXEL_SIZE;
              const cityLampH = 22; // mini-voxel units — taller for visibility
              // Pole shaft
              for (let sy = 0; sy < cityLampH; sy++) {
                pushMini(lampPx, lampBaseY + sy * MVS, lampPz, '#555555');
              }
              // Lamp arm extends 3 MVS toward road center
              const armDir = hwModLamp === 0 ? 1 : -1;
              const armAxis = onRoadZ && !onRoadX ? 'x' : 'z';
              for (let a = 1; a <= 3; a++) {
                if (armAxis === 'x') {
                  pushMini(lampPx + a * armDir * MVS, lampBaseY + (cityLampH - 1) * MVS, lampPz, '#666666');
                } else {
                  pushMini(lampPx, lampBaseY + (cityLampH - 1) * MVS, lampPz + a * armDir * MVS, '#666666');
                }
              }
              // Lamp head glow — 2 MVS for visibility
              const lampTopY = lampBaseY + cityLampH * MVS;
              if (armAxis === 'x') {
                pushMini(lampPx + 3 * armDir * MVS, lampTopY, lampPz, '#eeeeff');
                pushMini(lampPx + 3 * armDir * MVS, lampTopY - MVS, lampPz, '#ddddef');
              } else {
                pushMini(lampPx, lampTopY, lampPz + 3 * armDir * MVS, '#eeeeff');
                pushMini(lampPx, lampTopY - MVS, lampPz + 3 * armDir * MVS, '#ddddef');
              }
              pushSL(lampPx, lampTopY, lampPz);
              trackH(lx, lz, h + 1 + Math.ceil((5 * MVS + cityLampH * MVS) / VOXEL_SIZE));
            }
          }

        } else if (cell.isSidewalk) {
          /* ── Sidewalk with curb / walkway distinction ── */
          const modX = ((wx % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
          const modZ = ((wz % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
          const lotRawX = modX - cell.roadWidthX;
          const lotRawZ = modZ - cell.roadWidthZ;
          const lotSzX = BLOCK_SIZE - cell.roadWidthX;
          const lotSzZ = BLOCK_SIZE - cell.roadWidthZ;

          // Curb = innermost sidewalk voxel adjacent to road (first or last in lot)
          const isCurb = lotRawX === 0 || lotRawX === lotSzX - 1
                      || lotRawZ === 0 || lotRawZ === lotSzZ - 1;

          const swColor = isCurb ? '#999999' : '#b0b0b0';
          push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor(swColor, wx, h + 1, wz, 2, 0.03, 0.05));
          trackH(lx, lz, h + 1);

          /* ── Sidewalk details as mini-voxels ── */
          const swSurfY = (h + 1) * VOXEL_SIZE + VOXEL_SIZE * 0.5;
          const cellPx = (bX + lx) * VOXEL_SIZE;
          const cellPz = (bZ + lz) * VOXEL_SIZE;

          // Fire hydrant: every ~8 blocks along road edge (lotRawX=0 row, sparse along Z)
          if (lotRawX === 0 && lotRawZ >= 2 && lotRawZ < lotSzZ - 2
              && ((wz % 8) + 8) % 8 === 0 && ((wx % 20) + 20) % 20 < 3) {
            // Red hydrant body: 5 tall mini-voxels
            for (let hy = 0; hy < 5; hy++) {
              pushMini(cellPx, swSurfY + hy * MVS, cellPz, hy < 2 ? '#cc2222' : '#dd3333');
            }
            // Cap
            pushMini(cellPx - MVS, swSurfY + 3 * MVS, cellPz, '#cc2222');
            pushMini(cellPx + MVS, swSurfY + 3 * MVS, cellPz, '#cc2222');
            pushMini(cellPx, swSurfY + 5 * MVS, cellPz, '#aa1111');
          }

          // Sidewalk tree: every ~6 blocks along road edge, offset from hydrants
          if (lotRawX === 1 && lotRawZ >= 2 && lotRawZ < lotSzZ - 2
              && ((wz % 6) + 6) % 6 === 0 && ((wx % 20) + 20) % 20 >= 8
              && ((wx % 20) + 20) % 20 < 14) {
            // Small tree trunk: 8 tall mini-voxels
            for (let ty = 0; ty < 8; ty++) {
              pushMini(cellPx, swSurfY + ty * MVS, cellPz, '#664422');
            }
            // Small leaf canopy: cross pattern at top
            const leafY = swSurfY + 8 * MVS;
            for (let dx = -2; dx <= 2; dx++) {
              for (let dz = -2; dz <= 2; dz++) {
                if (Math.abs(dx) + Math.abs(dz) > 3) continue;
                pushMini(cellPx + dx * MVS, leafY, cellPz + dz * MVS,
                  varyColor('#44aa55', wx + dx, h + 2, wz + dz, 5, 0.06, 0.08));
                if (Math.abs(dx) <= 1 && Math.abs(dz) <= 1) {
                  pushMini(cellPx + dx * MVS, leafY + MVS, cellPz + dz * MVS,
                    varyColor('#55bb66', wx + dx, h + 3, wz + dz, 5, 0.06, 0.08));
                }
              }
            }
          }

        } else if (cell.isOpenZone) {
          /* ═══════════════ Open Zone Rendering ═══════════════
           *  These areas break up the city grid with natural/empty spaces.
           *  Each type has distinct visual treatment. */
          const ozType = cell.openZoneType;

          if (ozType === 'farmland') {
            /* ── Farmland: large crop fields with paths ── */
            const fieldGridX = Math.floor(wx / 8);
            const fieldGridZ = Math.floor(wz / 8);
            const cropNoise = hashCoord(fieldGridX * 5 + 900, 0, fieldGridZ * 5 + 900);
            const cropType = Math.floor(cropNoise * 7);
            const rowPhase = ((wx % 3) + 3) % 3;

            if (rowPhase <= 1) {
              // Tilled soil
              push((bX + lx) * VOXEL_SIZE, h * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#6B4423', wx, h, wz, 3, 0.03, 0.05));
              // Crop on soil
              if (rowPhase === 0 && ((wz % 2 + 2) % 2 === 0)) {
                const cropH = 1 + (Math.abs(wx * 5 + wz * 3) % 2);
                const cc = CROP_COLORS[cropType % CROP_COLORS.length];
                const sc2 = CROP_STALK_COLORS[cropType % CROP_STALK_COLORS.length];
                for (let cy = 1; cy <= cropH; cy++) {
                  push((bX + lx) * VOXEL_SIZE, (h + cy) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                    varyColor(cy === cropH ? cc : sc2, wx, h + cy, wz, 8, 0.08, 0.08));
                }
                trackH(lx, lz, h + cropH);
              }
            } else {
              // Path between crop rows
              push((bX + lx) * VOXEL_SIZE, h * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#9B8B6B', wx, h, wz, 2, 0.02, 0.04));
            }
            // Occasional fence posts at field borders
            if ((wx % 8 === 0 || wz % 8 === 0) && (wx + wz) % 4 === 0) {
              push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#886644', wx, h + 1, wz, 3, 0.04, 0.06));
              push((bX + lx) * VOXEL_SIZE, (h + 2) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#886644', wx, h + 2, wz, 3, 0.04, 0.06));
            }

          } else if (ozType === 'highway_corridor') {
            /* ── Highway corridor: open land alongside highways ── */
            // Flat gravel/dirt shoulder
            const nearRoad = ((wx % BLOCK_SIZE + BLOCK_SIZE) % BLOCK_SIZE) < 3
                          || ((wz % BLOCK_SIZE + BLOCK_SIZE) % BLOCK_SIZE) < 3;
            if (nearRoad) {
              // Gravel shoulder close to road
              push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#999988', wx, h + 1, wz, 2, 0.03, 0.04));
              trackH(lx, lz, h + 1);
            } else {
              // Wild grass / weeds
              push((bX + lx) * VOXEL_SIZE, h * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#77aa55', wx, h, wz, 5, 0.06, 0.08));
              // Scattered wild bushes
              if (hashCoord(wx, 0, wz) > 0.85) {
                push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor('#559944', wx, h + 1, wz, 6, 0.06, 0.08));
                trackH(lx, lz, h + 1);
              }
            }
            // Highway barrier walls at regular intervals
            if ((wx % 10 === 0 || wz % 10 === 0) && nearRoad) {
              push((bX + lx) * VOXEL_SIZE, (h + 2) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#888888', wx, h + 2, wz, 2, 0.02, 0.04));
              trackH(lx, lz, h + 2);
            }

          } else if (ozType === 'green_buffer') {
            /* ── Green buffer: mini-parks, tree lines, grass areas ── */
            push((bX + lx) * VOXEL_SIZE, h * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor('#55bb66', wx, h, wz, 5, 0.06, 0.08));
            // Trees: dense canopy areas
            const treeV = hashCoord(wx * 3, 0, wz * 3);
            if (treeV > 0.7 && lx > 1 && lx < CHUNK_SIZE - 2 && lz > 1 && lz < CHUNK_SIZE - 2) {
              const trunkH = 2 + Math.floor(treeV * 3);
              for (let ty = 1; ty <= trunkH; ty++) {
                push((bX + lx) * VOXEL_SIZE, (h + ty) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor('#664422', wx, h + ty, wz, 4, 0.05, 0.06));
              }
              const cr = 2;
              const cy2 = h + trunkH + cr;
              for (let dx = -cr; dx <= cr; dx++) for (let dy = -cr; dy <= cr; dy++) for (let dz = -cr; dz <= cr; dz++) {
                const d2 = dx * dx + dy * dy + dz * dz;
                if (d2 > cr * cr + 0.5 || (cr > 1 && d2 < (cr - 1) * (cr - 1))) continue;
                push((bX + lx + dx) * VOXEL_SIZE, (cy2 + dy) * VOXEL_SIZE, (bZ + lz + dz) * VOXEL_SIZE,
                  varyColor('#44aa55', wx + dx, cy2 + dy, wz + dz, 8, 0.08, 0.08));
              }
              trackH(lx, lz, cy2 + cr);
            } else if (treeV > 0.5) {
              // Bush
              push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#449955', wx, h + 1, wz, 6, 0.06, 0.08));
              trackH(lx, lz, h + 1);
            }
            // Walking path through green buffer
            if (((wx % 6) + 6) % 6 === 3 || ((wz % 6) + 6) % 6 === 3) {
              push((bX + lx) * VOXEL_SIZE, h * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#bbaa88', wx, h, wz, 2, 0.03, 0.04));
            }

          } else if (ozType === 'empty_lot') {
            /* ── Empty lot: dirt, rubble, occasional junk ── */
            const lotNoise = hashCoord(wx * 7, 0, wz * 7);
            if (lotNoise > 0.9) {
              // Rubble pile
              push((bX + lx) * VOXEL_SIZE, h * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#888877', wx, h, wz, 3, 0.04, 0.06));
              push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#777766', wx, h + 1, wz, 3, 0.04, 0.06));
              trackH(lx, lz, h + 1);
            } else if (lotNoise > 0.6) {
              // Weedy ground
              push((bX + lx) * VOXEL_SIZE, h * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#889966', wx, h, wz, 4, 0.05, 0.07));
            } else {
              // Bare dirt
              push((bX + lx) * VOXEL_SIZE, h * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#998877', wx, h, wz, 3, 0.03, 0.05));
            }
            // Chain-link fence at lot perimeter
            if ((wx % BLOCK_SIZE === cell.roadWidthX + LOT_INSET) ||
                (wz % BLOCK_SIZE === cell.roadWidthZ + LOT_INSET)) {
              push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#aaaaaa', wx, h + 1, wz, 2, 0.02, 0.04));
              if (wx % 4 === 0 || wz % 4 === 0) {
                push((bX + lx) * VOXEL_SIZE, (h + 2) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor('#aaaaaa', wx, h + 2, wz, 2, 0.02, 0.04));
              }
            }

          } else if (ozType === 'suburban_yard') {
            /* ── Suburban yard: lawn with occasional structures ── */
            push((bX + lx) * VOXEL_SIZE, h * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor('#66bb55', wx, h, wz, 5, 0.06, 0.08));
            const yardNoise = hashCoord(wx * 11, 0, wz * 11);
            // Scattered garden features
            if (yardNoise > 0.92) {
              // Garden shed (1 voxel)
              push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#885533', wx, h + 1, wz, 4, 0.05, 0.06));
              push((bX + lx) * VOXEL_SIZE, (h + 2) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#885533', wx, h + 2, wz, 4, 0.05, 0.06));
              push((bX + lx) * VOXEL_SIZE, (h + 3) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#cc6633', wx, h + 3, wz, 4, 0.04, 0.06));
              trackH(lx, lz, h + 3);
            } else if (yardNoise > 0.82) {
              // Flower bed
              const flowerColors = ['#ff6688', '#ffaa44', '#ff44aa', '#aaddff', '#ffff44'];
              push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor(flowerColors[Math.floor(yardNoise * 50) % flowerColors.length], wx, h + 1, wz, 6, 0.06, 0.08));
              trackH(lx, lz, h + 1);
            } else if (yardNoise > 0.7) {
              // Small tree
              push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#664422', wx, h + 1, wz, 4, 0.05, 0.06));
              push((bX + lx) * VOXEL_SIZE, (h + 2) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#664422', wx, h + 2, wz, 4, 0.05, 0.06));
              push((bX + lx) * VOXEL_SIZE, (h + 3) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#44aa55', wx, h + 3, wz, 6, 0.06, 0.08));
              trackH(lx, lz, h + 3);
            }
            // Picket fence at yard boundary
            if ((wx % BLOCK_SIZE === cell.roadWidthX + LOT_INSET) ||
                (wz % BLOCK_SIZE === cell.roadWidthZ + LOT_INSET)) {
              push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#ddddcc', wx, h + 1, wz, 2, 0.03, 0.04));
            }
          }

        } else if (cell.isBuilding) {
          /* ── Building — use modular building system ── */
          const bType = getBuildingType(
            structN, cell.lotWorldX, cell.lotWorldZ,
            cfg.structureDensity, cell.zone, cell.buildingW, cell.buildingD,
          );
          let bh = getBuildingHeight(structN, cell.lotWorldX, cell.lotWorldZ, bType);
          // Apply continent-based building height multiplier
          if (continentN) {
            const contType = getContinent(continentN, wx, wz);
            const contProfile = CONTINENT_PROFILES[contType];
            bh = Math.max(0, Math.floor(bh * contProfile.buildingHeightMult));
          }
          // Clamp building height so it doesn't exceed MAX_HEIGHT
          if (h + bh + 2 > MAX_HEIGHT) bh = Math.max(0, MAX_HEIGHT - h - 2);
          const baseFootprint = BLOCK_SIZE - ROAD_W - LOT_INSET * 2;
          // Single-lot: use actual per-dimension footprint for correct wall placement
          // Multi-lot: use ROAD_W-based baseFootprint for consistent cross-lot alignment
          const footprintX = BLOCK_SIZE - cell.roadWidthX - LOT_INSET * 2;
          const footprintZ = BLOCK_SIZE - cell.roadWidthZ - LOT_INSET * 2;
          const totalW = cell.buildingW > 1 ? cell.buildingW * baseFootprint : footprintX;
          const totalD = cell.buildingD > 1 ? cell.buildingD * baseFootprint : footprintZ;

          /* ── Biome boundary detection: force walls where neighbor isn't a city building ──
             Grid layout: bMap index = (lx+1)*gW + (lz+1), where lx grows along world X, lz grows along world Z.
             We check the 4 cardinal neighbors in the pre-computed biome grid; if a neighbor IS city,
             we additionally check whether it's a building cell (roads/sidewalks don't count as wall support).
             Short-circuit: if the neighbor biome isn't city, we immediately know it's exposed (no IIFE needed). */
          const cityIdx = BIOME_TYPES.indexOf('city');
          const bIdxXneg = lx * gW + (lz + 1);           // −X neighbor
          const bIdxXpos = (lx + 2) * gW + (lz + 1);     // +X neighbor
          const bIdxZneg = (lx + 1) * gW + lz;           // −Z neighbor
          const bIdxZpos = (lx + 1) * gW + (lz + 2);     // +Z neighbor
          const nXneg = bMap[bIdxXneg] !== cityIdx || !classifyCityCell(wx - 1, wz, structN).isBuilding;
          const nXpos = bMap[bIdxXpos] !== cityIdx || !classifyCityCell(wx + 1, wz, structN).isBuilding;
          const nZneg = bMap[bIdxZneg] !== cityIdx || !classifyCityCell(wx, wz - 1, structN).isBuilding;
          const nZpos = bMap[bIdxZpos] !== cityIdx || !classifyCityCell(wx, wz + 1, structN).isBuilding;

          generateBuildingColumn({
            push, trackH, pushWin,
            bX, bZ, lx, lz, h, wx, wz,
            blX: cell.lotLocalX, blZ: cell.lotLocalZ,
            footW: totalW, footD: totalD,
            bType, bh,
            forceEdge: { xNeg: nXneg, xPos: nXpos, zNeg: nZneg, zPos: nZpos },
          });
        }
        continue; // city biome handled
      }

      /* ══════════════════ 3b. INTER-BIOME HIGHWAY ══════════════════
       *  Highways with variable class, gentle curves, furniture, tunnels,
       *  bridges, and tunnel portals. Each highway class (rural/standard/
       *  autopista) renders differently:
       *  - Rural: narrow 2-lane, no median barrier, shorter lamps
       *  - Standard: 4-lane with barriers, sodium lamps, occasional signs
       *  - Autopista: 6-lane, double barriers, LED lamps, wide median
       *
       *  When in mountains: tunnels with portal entrances, interior lighting,
       *  ventilation shafts, emergency phones, reflective markings.
       *  When over water: elevated bridge with support pillars. */
      if (isOnInterHW) {
        const onActualRoad = !hwInfo!.isShoulder;
        const roadY = hwLevel;
        const isOverWater = h < wl;
        const hi = hwInfo!;
        const effectiveHW = Math.max(hi.hwHalfWX, hi.hwHalfWZ);
        const hwClass = hi.hwClassX !== 'none' ? hi.hwClassX : hi.hwClassZ;
        npcWalkableMap[lIdx] = 1;

        if (onActualRoad) {
          // ── Highway asphalt surface ──
          const isMedian2 = hi.isMedian;
          // At intersections, barriers from one highway should NOT block the other;
          // disable barrier rendering at intersection cells to keep cross traffic clear
          const isBarrier2 = hi.isBarrier && !hi.isIntersection;

          // Road color varies by class
          let roadColor: string;
          if (isMedian2) {
            roadColor = hwClass === 'rural' ? '#667744' // grass median for rural
              : hwClass === 'autopista' ? '#338833'      // lush green median
              : '#448844';                               // standard green median
          } else if (isBarrier2) {
            roadColor = '#555555'; // dark edge strip — barrier curb sits on top
          } else if (hi.isIntersection) {
            roadColor = '#404040';
          } else {
            roadColor = hwClass === 'rural' ? '#444444'      // lighter rural asphalt
              : hwClass === 'autopista' ? '#2a2a2a'           // darker autopista
              : '#333333';                                    // standard dark asphalt
          }

          push((bX + lx) * VOXEL_SIZE, roadY * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor(roadColor, wx, roadY, wz, 2, 0.02, 0.03));
          groundHeightMap[lIdx] = roadY;
          trackH(lx, lz, roadY);

          // ── Fill terrain gap (embankment) with retaining wall detail ──
          if (!isTunnel && !isOverWater && h < roadY) {
            for (let fy = h + 1; fy < roadY; fy++) {
              // Barrier position gets concrete retaining wall look, interior gets earth fill
              const isRetainingWall = isBarrier2;
              push((bX + lx) * VOXEL_SIZE, fy * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor(isRetainingWall ? '#888888' : '#776655', wx, fy, wz, 3, 0.03, 0.05));
            }
          }

          // ── Shallow mountain road cut retaining walls ──
          // When terrain is only slightly above road (1-4 voxels), create visible
          // retaining walls so the road cut doesn't look invisible
          if (!isTunnel && !isOverWater && isBarrier2 && h > roadY && h <= roadY + TUNNEL_HEIGHT) {
            const cutH = h - roadY;
            for (let ry = 1; ry <= cutH; ry++) {
              push((bX + lx) * VOXEL_SIZE, (roadY + ry) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#888888', wx, roadY + ry, wz, 2, 0.02, 0.04));
            }
            trackH(lx, lz, roadY + cutH);
          }

          // ── Bridge over water — thick deck, prominent pillars, side railings ──
          if (isOverWater) {
            // Bridge deck: 2 voxels thick below the road surface (structural depth)
            for (let dy = 1; dy <= 2; dy++) {
              if (roadY - dy >= 0) {
                push((bX + lx) * VOXEL_SIZE, (roadY - dy) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor(dy === 1 ? '#888888' : '#777777', wx, roadY - dy, wz, 2, 0.02, 0.04));
              }
            }

            // Bridge support pillars — wider and more frequent than before
            const pillarSpacing = hwClass === 'autopista' ? 8 : hwClass === 'standard' ? 10 : 14;
            const onPillarX = hi.onX && ((wx % pillarSpacing + pillarSpacing) % pillarSpacing === 0);
            const onPillarZ = hi.onZ && ((wz % pillarSpacing + pillarSpacing) % pillarSpacing === 0);
            // Pillars on barrier AND median positions for structural realism
            const isPillarPos = isBarrier2 || (isMedian2 && (onPillarX || onPillarZ));
            if (isPillarPos && (onPillarX || onPillarZ)) {
              const pillarBottom = Math.max(0, h);
              for (let py = pillarBottom; py < roadY - 2; py++) {
                push((bX + lx) * VOXEL_SIZE, py * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor('#999999', wx, py, wz, 2, 0.02, 0.04));
              }
            }

            // Bridge side railings on barriers (mini-voxel guardrails)
            if (isBarrier2) {
              const railMVS = hwClass === 'rural' ? 5 : 8;
              const railPx = (bX + lx) * VOXEL_SIZE;
              const railPz = (bZ + lz) * VOXEL_SIZE;
              const railBaseY = roadY * VOXEL_SIZE + VOXEL_SIZE * 0.5;
              for (let ry = 0; ry < railMVS; ry++) {
                pushMini(railPx, railBaseY + ry * MVS, railPz, '#aaaaaa');
              }
              trackH(lx, lz, roadY);
            }

            pushW((bX + lx) * VOXEL_SIZE, wl * VOXEL_SIZE + VOXEL_SIZE * 0.5, (bZ + lz) * VOXEL_SIZE,
              varyColor(c.colors.water, wx, wl, wz, 4, 0.06, 0.06));
          }

          // ── Barriers — thin mini-voxel curbs on road edges ──
          // Skip barrier rendering over water — bridge section handles railings
          // Skip at intersections — cross traffic must not be blocked
          if (isBarrier2 && !isOverWater) {
            // Mini-voxel curb heights: proportional thin barriers
            const barrierMVS = hwClass === 'rural' ? 3 : hwClass === 'autopista' ? 7 : 5;
            const barrierCol = hwClass === 'autopista' ? '#aaaaaa' : '#999999';
            const cellPxB = (bX + lx) * VOXEL_SIZE;
            const cellPzB = (bZ + lz) * VOXEL_SIZE;
            const barrierBaseY = roadY * VOXEL_SIZE + VOXEL_SIZE * 0.5;
            for (let by = 0; by < barrierMVS; by++) {
              pushMini(cellPxB, barrierBaseY + by * MVS, cellPzB, barrierCol);
            }
            const barrierTopY = barrierBaseY + barrierMVS * MVS;
            trackH(lx, lz, roadY);

            // ── Highway furniture on barrier positions (mini-voxels for thin poles) ──
            const furniture = getHighwayFurniture(wx, wz, hwClass, true, isTunnel, hi.onX);
            const furPx = cellPxB;
            const furPz = cellPzB;
            const furBaseY = barrierTopY;

            if (furniture.type === 'lamp_sodium' || furniture.type === 'lamp_led' || furniture.type === 'lamp_rural') {
              // Highway lamp post — thin mini-voxel pole, taller for visibility
              const hwLampH = furniture.type === 'lamp_rural' ? 16 : furniture.type === 'lamp_led' ? 24 : 20;
              for (let sy = 0; sy < hwLampH; sy++) {
                pushMini(furPx, furBaseY + sy * MVS, furPz, '#555555');
              }
              // Lamp arm: 3 MVS toward road center for visibility
              const lampArmDir = hi.distFromCenterX > 0 ? -1 : 1;
              for (let a = 1; a <= 3; a++) {
                if (hi.onX) {
                  pushMini(furPx, furBaseY + (hwLampH - 1) * MVS, furPz + a * lampArmDir * MVS, '#666666');
                } else {
                  pushMini(furPx + a * lampArmDir * MVS, furBaseY + (hwLampH - 1) * MVS, furPz, '#666666');
                }
              }
              // Lamp head glow — 2 MVS for visibility
              const lampGlow = furniture.type === 'lamp_sodium' ? '#ffcc44'
                : furniture.type === 'lamp_led' ? '#eeeeff' : '#ffdd88';
              const lampTopY = furBaseY + hwLampH * MVS;
              if (hi.onX) {
                pushMini(furPx, lampTopY, furPz + 3 * lampArmDir * MVS, lampGlow);
                pushMini(furPx, lampTopY - MVS, furPz + 3 * lampArmDir * MVS, lampGlow);
              } else {
                pushMini(furPx + 3 * lampArmDir * MVS, lampTopY, furPz, lampGlow);
                pushMini(furPx + 3 * lampArmDir * MVS, lampTopY - MVS, furPz, lampGlow);
              }
              pushSL(furPx, lampTopY, furPz);
              trackH(lx, lz, roadY + Math.ceil((barrierMVS * MVS + hwLampH * MVS) / VOXEL_SIZE));
            } else if (furniture.type === 'sign_direction') {
              // Green highway direction sign — thin mini-voxel post
              const signPostH = 18;
              for (let sy = 0; sy < signPostH; sy++) {
                pushMini(furPx, furBaseY + sy * MVS, furPz, '#555555');
              }
              // Green sign board: 3×2 mini-voxels at top
              const signTopY = furBaseY + signPostH * MVS;
              for (let dx = -1; dx <= 1; dx++) {
                pushMini(furPx + dx * MVS, signTopY, furPz, '#116633');
                pushMini(furPx + dx * MVS, signTopY + MVS, furPz, '#117744');
              }
              trackH(lx, lz, roadY + Math.ceil(((barrierMVS + signPostH + 2) * MVS) / VOXEL_SIZE));
            } else if (furniture.type === 'sign_speed') {
              // White speed sign — thin mini-voxel post
              const speedPostH = 14;
              for (let sy = 0; sy < speedPostH; sy++) {
                pushMini(furPx, furBaseY + sy * MVS, furPz, '#555555');
              }
              // White sign face: 2×2 mini-voxels
              const speedTopY = furBaseY + speedPostH * MVS;
              for (let dx = 0; dx <= 1; dx++) {
                pushMini(furPx + dx * MVS, speedTopY, furPz, '#eeeeee');
                pushMini(furPx + dx * MVS, speedTopY + MVS, furPz, '#dddddd');
              }
              trackH(lx, lz, roadY + Math.ceil(((barrierMVS + speedPostH + 2) * MVS) / VOXEL_SIZE));
            } else if (furniture.type === 'billboard') {
              // Billboard — thin mini-voxel pole with colored board
              const bbPostH = 20;
              for (let sy = 0; sy < bbPostH; sy++) {
                pushMini(furPx, furBaseY + sy * MVS, furPz, '#666666');
              }
              // Billboard face: 4×3 mini-voxels at top
              const bbHash = hashCoord(wx * 17, 0, wz * 31);
              const bbColors = ['#cc3333', '#3366cc', '#cc9933', '#33aa66', '#9933cc', '#cc6633'];
              const bbCol = bbColors[Math.floor(bbHash * bbColors.length)];
              const bbTopY = furBaseY + bbPostH * MVS;
              for (let dx = -1; dx <= 2; dx++) {
                for (let dy = 0; dy < 3; dy++) {
                  pushMini(furPx + dx * MVS, bbTopY + dy * MVS, furPz, bbCol);
                }
              }
              trackH(lx, lz, roadY + Math.ceil(((barrierMVS + bbPostH + 3) * MVS) / VOXEL_SIZE));
            }
          }

          // ── Lane markings (flat paint) ──
          if (!isMedian2 && !isBarrier2 && !hi.isIntersection) {
            const paintY2 = roadY * VOXEL_SIZE + VOXEL_SIZE * 0.5 + 0.005;
            const cellCx2 = (bX + lx) * VOXEL_SIZE;
            const cellCz2 = (bZ + lz) * VOXEL_SIZE;
            const stripW2 = MVS * 1.5;
            const cellLen2 = VOXEL_SIZE;

            const absDistX = Math.abs(hi.distFromCenterX);
            const absDistZ = Math.abs(hi.distFromCenterZ);
            const localHWX = hi.hwHalfWX;
            const localHWZ = hi.hwHalfWZ;

            if (hi.onX && absDistX <= localHWX) {
              // White edge lines
              if (absDistX === localHWX - 1) {
                pushPaint(cellCx2, paintY2, cellCz2, '#cccccc', cellLen2, stripW2);
              }
              // Dashed white lane dividers
              const medW = hwClass === 'autopista' ? 2 : 1;
              const laneW = localHWX - medW - 1;
              if (absDistX > medW && absDistX < localHWX - 1 && laneW > 1) {
                const lanePos = absDistX - medW - 1;
                const dividerInterval = Math.max(1, Math.floor(laneW / 2));
                if (lanePos > 0 && lanePos % dividerInterval === 0 && ((wx % 6 + 6) % 6 < 3)) {
                  pushPaint(cellCx2, paintY2, cellCz2, '#aaaaaa', cellLen2 * 0.5, stripW2);
                }
              }
            }
            if (hi.onZ && absDistZ <= localHWZ) {
              if (absDistZ === localHWZ - 1) {
                pushPaint(cellCx2, paintY2, cellCz2, '#cccccc', stripW2, cellLen2);
              }
              const medW2 = hwClass === 'autopista' ? 2 : 1;
              const laneW2 = localHWZ - medW2 - 1;
              if (absDistZ > medW2 && absDistZ < localHWZ - 1 && laneW2 > 1) {
                const lanePos = absDistZ - medW2 - 1;
                const dividerInterval = Math.max(1, Math.floor(laneW2 / 2));
                if (lanePos > 0 && lanePos % dividerInterval === 0 && ((wz % 6 + 6) % 6 < 3)) {
                  pushPaint(cellCx2, paintY2, cellCz2, '#aaaaaa', stripW2, cellLen2 * 0.5);
                }
              }
            }

            // ── Cat-eye reflectors on median line ──
            const furniture2 = getHighwayFurniture(wx, wz, hwClass, false, isTunnel, hi.onX);
            if (furniture2.type === 'reflector') {
              const medWC = hwClass === 'autopista' ? 2 : 1;
              if ((hi.onX && absDistX <= medWC) || (hi.onZ && absDistZ <= medWC)) {
                pushMini(cellCx2, paintY2, cellCz2, '#ffee44');
              }
            }
          }

          // ── Tunnel rendering with portal ──
          if (isTunnel) {
            const tunnelCeil = roadY + TUNNEL_HEIGHT;

            // Detect tunnel portal zone: check if nearby cells along highway
            // are NOT tunnels — that means we're at the entrance.
            // Also compute portal depth (distance from tunnel mouth)
            let isPortalZone = false;
            let portalDepth = 0; // 0 = deep inside tunnel, small = near mouth
            const portalCheckRange = 6;
            for (let ps = 1; ps <= portalCheckRange; ps++) {
              // Check positions along the highway direction
              const checkWx = wx + (hi.onX ? ps : 0);
              const checkWz = wz + (hi.onZ ? ps : 0);
              const checkLx = checkWx - bX;
              const checkLz = checkWz - bZ;
              if (checkLx >= 0 && checkLx < CHUNK_SIZE && checkLz >= 0 && checkLz < CHUNK_SIZE) {
                if (hwTunnelMap[checkLx * CHUNK_SIZE + checkLz] === 0) {
                  isPortalZone = true;
                  portalDepth = ps;
                  break;
                }
              }
              // Also check negative direction
              const checkWx2 = wx - (hi.onX ? ps : 0);
              const checkWz2 = wz - (hi.onZ ? ps : 0);
              const checkLx2 = checkWx2 - bX;
              const checkLz2 = checkWz2 - bZ;
              if (checkLx2 >= 0 && checkLx2 < CHUNK_SIZE && checkLz2 >= 0 && checkLz2 < CHUNK_SIZE) {
                if (hwTunnelMap[checkLx2 * CHUNK_SIZE + checkLz2] === 0) {
                  isPortalZone = true;
                  portalDepth = ps;
                  break;
                }
              }
            }

            // Tunnel walls — full height from road surface to ceiling
            // (barriers are now mini-voxels, so wall starts at road+1 instead of road+3)
            if (isBarrier2) {
              const wallCol = isPortalZone ? '#997766' : '#777777';
              // Inner tunnel walls: from just above road surface to ceiling height
              for (let ty = 1; ty <= TUNNEL_HEIGHT; ty++) {
                push((bX + lx) * VOXEL_SIZE, (roadY + ty) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor(wallCol, wx, roadY + ty, wz, 2, 0.02, 0.04));
              }
              trackH(lx, lz, tunnelCeil);

              // Portal arch: concrete frame at tunnel entrance
              // Deeper voxels near portal get progressively taller — forms the
              // characteristic trumpet-shaped tunnel mouth with retaining walls
              if (isPortalZone) {
                // Arch height tapers: closest to entrance (depth=1) gets tallest arch,
                // further from entrance (depth=portalCheckRange) is flush with ceiling
                const archExtra = Math.max(0, 3 - Math.floor(portalDepth * 0.5));
                for (let ay = 1; ay <= archExtra; ay++) {
                  push((bX + lx) * VOXEL_SIZE, (tunnelCeil + ay) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                    varyColor('#887766', wx, tunnelCeil + ay, wz, 2, 0.02, 0.04));
                }
                // Portal face keystone detail at depth 1-2
                if (portalDepth <= 2) {
                  push((bX + lx) * VOXEL_SIZE, (tunnelCeil + archExtra + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                    varyColor('#776655', wx, tunnelCeil + archExtra + 1, wz, 2, 0.02, 0.04));
                }
                trackH(lx, lz, tunnelCeil + archExtra + (portalDepth <= 2 ? 1 : 0));
              }
            }

            // Tunnel ceiling slab
            const ceilCol = isPortalZone ? '#887766' : '#666666';
            push((bX + lx) * VOXEL_SIZE, (tunnelCeil + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor(ceilCol, wx, tunnelCeil + 1, wz, 2, 0.02, 0.04));
            trackH(lx, lz, tunnelCeil + 1);

            // Portal ceiling arch: non-barrier cells near entrance also get concrete arch
            // This creates the curved arch shape over the opening
            if (isPortalZone && !isBarrier2 && !isMedian2) {
              const distFromEdge = Math.min(
                hi.onX ? Math.abs(hi.distFromCenterX) : effectiveHW,
                hi.onZ ? Math.abs(hi.distFromCenterZ) : effectiveHW,
              );
              // Arch curve: higher at edges, lower at center
              const archCurve = Math.max(0, Math.floor((distFromEdge / effectiveHW) * 2) - (portalDepth > 3 ? 1 : 0));
              if (archCurve > 0 && portalDepth <= 3) {
                for (let ay = 2; ay <= archCurve + 1; ay++) {
                  push((bX + lx) * VOXEL_SIZE, (tunnelCeil + ay) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                    varyColor('#887766', wx, tunnelCeil + ay, wz, 2, 0.02, 0.04));
                }
                trackH(lx, lz, tunnelCeil + archCurve + 1);
              }
            }

            // Tunnel interior lighting and furniture
            if (!isBarrier2 && !isMedian2) {
              const tFurniture = getHighwayFurniture(wx, wz, hwClass, true, true, hi.onX);

              if (tFurniture.type === 'lamp_led') {
                // Flush LED strip on ceiling
                push((bX + lx) * VOXEL_SIZE, tunnelCeil * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor('#eeeeff', wx, tunnelCeil, wz, 3, 0.04, 0.06));
                pushSL((bX + lx) * VOXEL_SIZE, tunnelCeil * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE);
              } else if (tFurniture.type === 'emergency_phone') {
                // Emergency phone bay: small orange box on wall level
                push((bX + lx) * VOXEL_SIZE, (roadY + 2) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor('#ff8800', wx, roadY + 2, wz, 3, 0.04, 0.06));
              }
            }

            // Reflective lane edge strips inside tunnel (more visible than outdoor)
            if (!isBarrier2 && !isMedian2) {
              const absDistX2 = Math.abs(hi.distFromCenterX);
              const absDistZ2 = Math.abs(hi.distFromCenterZ);
              const localHW2 = effectiveHW;
              if ((hi.onX && absDistX2 === localHW2 - 2) || (hi.onZ && absDistZ2 === localHW2 - 2)) {
                // Reflective strip along inner edge of lanes
                pushMini((bX + lx) * VOXEL_SIZE, roadY * VOXEL_SIZE + VOXEL_SIZE * 0.5 + 0.01,
                  (bZ + lz) * VOXEL_SIZE, '#ffcc22');
              }
            }
          }

        } else if (hi.isShoulder) {
          // ── Gravel shoulder ──
          const shoulderCol = hwClass === 'rural' ? '#aa9977' : '#999988';
          push((bX + lx) * VOXEL_SIZE, (h > roadY ? roadY : h) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor(shoulderCol, wx, roadY, wz, 2, 0.03, 0.04));
          groundHeightMap[lIdx] = Math.min(h, roadY);
        }

        // Don't render natural structures on highway cells
        continue;
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
            if (hx === 1 && hz === 1) continue;
            if (hx === 1 && hz === 0 && hy <= 2) continue;
            const isWin = hy === 2 && ((hx === 0 && hz === 1) || (hx === 2 && hz === 1));
            push((bX + lx + hx) * VOXEL_SIZE, (h + hy) * VOXEL_SIZE, (bZ + lz + hz) * VOXEL_SIZE,
              varyColor(isWin ? '#AADDFF' : wallC, wx + hx, h + hy, wz + hz));
            if (isWin) pushWin((bX + lx + hx) * VOXEL_SIZE, (h + hy) * VOXEL_SIZE, (bZ + lz + hz) * VOXEL_SIZE);
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

      /* ── Village structures: houses + crop fields ── */
      if (biome === 'village' && h > c.waterLevel) {
        // Determine village tile type using noise
        const villageTile = structN(wx * 0.08 + 800, wz * 0.08 + 800);
        const gridX = Math.floor(wx / 12);
        const gridZ = Math.floor(wz / 12);
        const cropNoise = structN(gridX * 0.5 + 900, gridZ * 0.5 + 900);
        const cropType = Math.abs(Math.floor((cropNoise + 1) * 4)) % 7;
        
        if (villageTile > 0.25 && lx >= 2 && lx <= CHUNK_SIZE - 5 && lz >= 2 && lz <= CHUNK_SIZE - 5) {
          // Village house with garden
          if (Math.abs(wx % 16) < 1 && Math.abs(wz % 16) < 1) {
            // Main house — varied styles
            const houseStyle = Math.abs(wx * 3 + wz * 7) % 4;
            const wallColors = ['#D4B896', '#C4A882', '#B8977A', '#CDBE9A'];
            const roofColors = ['#8B4513', '#A0522D', '#6B3410', '#7B4513'];
            const wallC = wallColors[houseStyle];
            const roofC = roofColors[houseStyle];
            
            // 4x4 house with chimney
            for (let hx = 0; hx < 4; hx++) for (let hz = 0; hz < 4; hz++) for (let hy = 1; hy <= 3; hy++) {
              if (hx > 0 && hx < 3 && hz > 0 && hz < 3) continue; // hollow
              const isWindow = hy === 2 && ((hx === 0 && hz === 2) || (hx === 3 && hz === 2) || (hx === 2 && hz === 0) || (hx === 2 && hz === 3));
              const isDoor = hy <= 2 && hx === 1 && hz === 0;
              push((bX + lx + hx) * VOXEL_SIZE, (h + hy) * VOXEL_SIZE, (bZ + lz + hz) * VOXEL_SIZE,
                varyColor(isDoor ? '#664422' : isWindow ? '#AADDFF' : wallC, wx + hx, h + hy, wz + hz));
              if (isWindow) pushWin((bX + lx + hx) * VOXEL_SIZE, (h + hy) * VOXEL_SIZE, (bZ + lz + hz) * VOXEL_SIZE);
            }
            // Peaked roof
            for (let rx = -1; rx <= 4; rx++) for (let rz = -1; rz <= 4; rz++) {
              push((bX + lx + rx) * VOXEL_SIZE, (h + 4) * VOXEL_SIZE, (bZ + lz + rz) * VOXEL_SIZE,
                varyColor(roofC, wx + rx, h + 4, wz + rz, 4, 0.04, 0.06));
            }
            for (let rx = 0; rx <= 3; rx++) for (let rz = 0; rz <= 3; rz++) {
              push((bX + lx + rx) * VOXEL_SIZE, (h + 5) * VOXEL_SIZE, (bZ + lz + rz) * VOXEL_SIZE,
                varyColor(roofC, wx + rx, h + 5, wz + rz, 4, 0.04, 0.06));
            }
            // Chimney
            for (let cy = 4; cy <= 7; cy++) {
              push((bX + lx + 3) * VOXEL_SIZE, (h + cy) * VOXEL_SIZE, (bZ + lz + 3) * VOXEL_SIZE,
                varyColor('#776655', wx + 3, h + cy, wz + 3));
            }
            trackH(lx, lz, h + 7);
          }
        } else {
          // Crop field — rows of colorful crops
          const cropColor = CROP_COLORS[cropType];
          const stalkColor = CROP_STALK_COLORS[cropType];
          const rowPhase = ((wx % 3) + 3) % 3;
          
          if (rowPhase === 0 || rowPhase === 1) {
            // Tilled soil row
            push((bX + lx) * VOXEL_SIZE, h * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor('#6B4423', wx, h, wz, 3, 0.03, 0.05));
            
            // Crop on soil
            const cropH = 1 + (Math.abs(wx * 5 + wz * 3) % 2);
            if (rowPhase === 0 && ((wz % 2 + 2) % 2 === 0)) {
              for (let cy = 1; cy <= cropH; cy++) {
                push((bX + lx) * VOXEL_SIZE, (h + cy) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor(cy === cropH ? cropColor : stalkColor, wx, h + cy, wz, 8, 0.08, 0.08));
              }
              trackH(lx, lz, h + cropH);
            }
          } else {
            // Path between crop rows
            push((bX + lx) * VOXEL_SIZE, h * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor('#9B8B6B', wx, h, wz, 2, 0.02, 0.04));
          }
        }
      }

      /* ── Swamp features: dead trees, lily pads, mushrooms ── */
      if (biome === 'swamp' && h >= c.waterLevel - 1) {
        // Dead/twisted trees
        if (lx > 1 && lx < CHUNK_SIZE - 2 && lz > 1 && lz < CHUNK_SIZE - 2) {
          const stv = treeN(wx * 0.5 + 200, wz * 0.5 + 200);
          if (stv > 0.38 - cfg.treeDensity * 0.15) {
            const trunkH = 2 + (Math.abs(wx * 9 + wz * 5) % 4);
            for (let ty = 1; ty <= trunkH; ty++) {
              push((bX + lx) * VOXEL_SIZE, (h + ty) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#4a3a2a', wx, h + ty, wz, 4, 0.05, 0.06));
            }
            // Sparse hanging moss/leaves
            const leafR = 1 + (Math.abs(wx * 3) % 2);
            for (let dx = -leafR; dx <= leafR; dx++) for (let dz = -leafR; dz <= leafR; dz++) {
              if (Math.abs(dx) + Math.abs(dz) > leafR + 1) continue;
              if (dx === 0 && dz === 0) continue;
              const leafH = hashCoord(wx + dx, 0, wz + dz);
              if (leafH > 0.4) {
                push((bX + lx + dx) * VOXEL_SIZE, (h + trunkH) * VOXEL_SIZE, (bZ + lz + dz) * VOXEL_SIZE,
                  varyColor('#5a7a3a', wx + dx, h + trunkH, wz + dz, 6, 0.06, 0.08));
                // Hanging vines
                if (leafH > 0.7) {
                  const vineLen = 1 + Math.floor(leafH * 3);
                  for (let vy = 1; vy <= vineLen; vy++) {
                    push((bX + lx + dx) * VOXEL_SIZE, (h + trunkH - vy) * VOXEL_SIZE, (bZ + lz + dz) * VOXEL_SIZE,
                      varyColor('#4a6a2a', wx + dx, h + trunkH - vy, wz + dz, 5, 0.04, 0.06));
                  }
                }
              }
            }
            trackH(lx, lz, h + trunkH);
          }
          
          // Mushrooms
          const mushV = structN(wx * 0.8 + 500, wz * 0.8 + 500);
          if (mushV > 0.45 && h > c.waterLevel) {
            const mushColor = (Math.abs(wx * 7 + wz) % 3) === 0 ? '#cc4444' : (Math.abs(wx * 7 + wz) % 3) === 1 ? '#ddaa44' : '#aa88cc';
            push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor('#ddccaa', wx, h + 1, wz));
            push((bX + lx) * VOXEL_SIZE, (h + 2) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor(mushColor, wx, h + 2, wz, 6, 0.06, 0.08));
            for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
              if (dx === 0 && dz === 0) continue;
              push((bX + lx + dx) * VOXEL_SIZE, (h + 2) * VOXEL_SIZE, (bZ + lz + dz) * VOXEL_SIZE,
                varyColor(mushColor, wx + dx, h + 2, wz + dz, 6, 0.06, 0.08));
            }
            trackH(lx, lz, h + 2);
          }
        }
        
        // Lily pads on water surface
        if (h < c.waterLevel && lx > 0 && lx < CHUNK_SIZE - 1 && lz > 0 && lz < CHUNK_SIZE - 1) {
          const lilyV = treeN(wx * 0.9 + 400, wz * 0.9 + 400);
          if (lilyV > 0.35) {
            push((bX + lx) * VOXEL_SIZE, (c.waterLevel + 0.1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor('#44aa44', wx, c.waterLevel, wz, 5, 0.06, 0.08));
            // Occasional flower on lily pad
            if (lilyV > 0.55) {
              push((bX + lx) * VOXEL_SIZE, (c.waterLevel + 0.5) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#ff88cc', wx, c.waterLevel + 1, wz, 8, 0.08, 0.06));
            }
          }
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

      /* ── Pickups ── */
      if (cfg.pickupDensity > 0 && lx === 8 && lz === 8) {
        const pv = chunkRand();
        if (pv < cfg.pickupDensity * 0.15) {
          const iconIdx = Math.floor(chunkRand() * PICKUP_ICONS.length);
          pickups.push({ wx: (bX + lx) * VOXEL_SIZE, wy: (h + 6) * VOXEL_SIZE, wz: (bZ + lz) * VOXEL_SIZE, iconIdx });
        }
      }
    }
  }

  /* ── Compute dominant biome and average height for minimap ── */
  const biomeCounts = new Uint16Array(16);
  let heightSum = 0;
  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const idx2 = (lx + 1) * gW + (lz + 1);
      const b = bMap[idx2];
      if (b < biomeCounts.length) biomeCounts[b]++;
      heightSum += groundHeightMap[lx * CHUNK_SIZE + lz];
    }
  }
  let domBiomeIdx = 0;
  for (let i = 1; i < biomeCounts.length; i++) {
    if (biomeCounts[i] > biomeCounts[domBiomeIdx]) domBiomeIdx = i;
  }
  const domBiome = BIOME_TYPES[domBiomeIdx] ?? 'plains';
  const avgH = heightSum / (CHUNK_SIZE * CHUNK_SIZE);

  return {
    positions: posA.subarray(0, sc * 3), colors: colA.subarray(0, sc * 3), count: sc,
    waterPositions: wPosA.subarray(0, wc * 3), waterColors: wColA.subarray(0, wc * 3), waterCount: wc,
    pickups, windowLights: winPosA.subarray(0, winC * 3), windowLightCount: winC,
    streetLights: slPosA.subarray(0, slC * 3), streetLightCount: slC,
    groundHeightMap, npcWalkableMap, solidHeightMap, waterLevelMap,
    miniVoxelPositions: miniPosA.subarray(0, miniC * 3),
    miniVoxelColors: miniColA.subarray(0, miniC * 3),
    miniVoxelCount: miniC,
    paintPositions: paintPosA.subarray(0, paintC * 3),
    paintColors: paintColA.subarray(0, paintC * 3),
    paintScales: paintScaleA.subarray(0, paintC * 2),
    paintCount: paintC,
    chunkX: cx, chunkZ: cz,
    biome: domBiome,
    avgHeight: avgH,
  };
}
