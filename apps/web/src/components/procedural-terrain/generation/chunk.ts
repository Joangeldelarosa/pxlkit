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
  BIOMES, BIOME_TYPES, BLOCK_SIZE, ROAD_W, LOT_INSET, AVENUE_W,
  CONTINENT_PROFILES,
} from '../constants';
import { mulberry32, fbm } from '../utils/noise';
import { varyColor, hashCoord } from '../utils/color';
import { getBiome, getVariedBiome, getContinent, getContinentElevation } from '../utils/biomes';
import { classifyCityCell, getBuildingType, getBuildingHeight, getSectorLampColors, getInterHighwayInfo, INTER_HW_HALF_W, TUNNEL_HEIGHT } from '../city/layout';
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
      if (biome === 'city' || biome === 'ocean') continue;

      const hwInfo = getInterHighwayInfo(wx, wz);
      if (!hwInfo) continue;

      const localIdx = lx * CHUNK_SIZE + lz;
      // Only actual road surface (not just shoulder)
      const onRoad = (Math.abs(hwInfo.distFromCenterX) <= INTER_HW_HALF_W && hwInfo.onX)
                  || (Math.abs(hwInfo.distFromCenterZ) <= INTER_HW_HALF_W && hwInfo.onZ);
      if (!onRoad && !hwInfo.isShoulder) continue;

      hwInfoMap[localIdx] = hwInfo;

      // Compute the highway surface level:
      // Take the minimum height in a small neighborhood along the highway
      // to create a smooth, relatively flat road.
      // For tunnels: road level is set to the minimum of surrounding terrain
      // minus any extreme peaks (clamp to a reasonable level).
      const c = variedConfigs[localIdx] || BIOMES[biome];
      const waterLevel = c.waterLevel;

      // Highway level = max(waterLevel + 2, min of nearby terrain + 1)
      // This ensures the road is above water but cuts through hills
      let roadLevel = h;

      // Sample neighbors along the highway to find a good road level.
      // Mountains skip this — they use current height and tunnel through instead.
      const sampleRange = 4;
      let minH = h;
      if (biome !== 'mountains') {
        for (let s = -sampleRange; s <= sampleRange; s++) {
          const sIdx = (Math.max(0, Math.min(gW - 1, lx + 1 + (hwInfo.onX ? s : 0)))) * gW
            + Math.max(0, Math.min(gW - 1, lz + 1 + (hwInfo.onZ ? s : 0)));
          if (hMap[sIdx] >= 0 && hMap[sIdx] < minH) minH = hMap[sIdx];
        }
      }
      roadLevel = Math.max(waterLevel + 2, minH);

      // Tunnel detection: if terrain is significantly higher than road level
      const isTunnel = biome === 'mountains' && h > roadLevel + TUNNEL_HEIGHT + 2;

      if (isTunnel) {
        // For tunnels, set road level to a reasonable grade
        // (lower than the mountain but above water)
        roadLevel = Math.max(waterLevel + 2, Math.min(roadLevel, h - TUNNEL_HEIGHT - 3));
      }

      hwLevelMap[localIdx] = roadLevel;
      hwTunnelMap[localIdx] = isTunnel ? 1 : 0;
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
      for (let y = 0; y <= h; y++) {
        const isTop = y === h;

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
      trackH(lx, lz, h);

      /* ── 2. WATER — flat surface plane for seamless cross-chunk rendering ── */
      if (h < wl) {
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

          // Road surface color — highways darker, avenues slightly lighter
          const roadBase = cell.isHighway ? '#2a2a2a'
                         : cell.isIntersection ? '#505050'
                         : cell.isAvenue ? '#424242'
                         : '#383838';
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
            if (rw >= AVENUE_W) {
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
              // Main shaft: single column of mini-voxels, ~40 units tall
              // Total real height: 40 * 0.075 = 3.0 world units (= 6 regular voxels)
              const shaftH = 40;
              for (let sy = 3; sy < shaftH; sy++) {
                pushMini(px, poleBaseY + sy * MVS, pz, '#555555');
              }
              // Top cap
              pushMini(px, poleBaseY + shaftH * MVS, pz, '#666666');
              // Lamp arm extends toward road center from corner
              const armDx = (modX === 0) ? 1 : -1;
              const armDz = (modZ === 0) ? 1 : -1;
              // X-direction arm (4 mini-voxels long) + light fixture
              for (let a = 1; a <= 4; a++) {
                pushMini(px + a * armDx * MVS, poleBaseY + (shaftH - 1) * MVS, pz, '#666666');
              }
              // Light at end of X arm (2×2 glow) — sector colored
              pushMini(px + 3 * armDx * MVS, poleBaseY + shaftH * MVS, pz, sectorColors.lampA);
              pushMini(px + 4 * armDx * MVS, poleBaseY + shaftH * MVS, pz, sectorColors.lampB);
              // Register X-arm light for night illumination
              pushSL(px + 3.5 * armDx * MVS, poleBaseY + shaftH * MVS, pz);
              // Z-direction arm + light
              for (let a = 1; a <= 4; a++) {
                pushMini(px, poleBaseY + (shaftH - 1) * MVS, pz + a * armDz * MVS, '#666666');
              }
              pushMini(px, poleBaseY + shaftH * MVS, pz + 3 * armDz * MVS, sectorColors.lampA);
              pushMini(px, poleBaseY + shaftH * MVS, pz + 4 * armDz * MVS, sectorColors.lampB);
              // Register Z-arm light for night illumination
              pushSL(px, poleBaseY + shaftH * MVS, pz + 3.5 * armDz * MVS);
              // trackH still uses regular voxel grid height
              trackH(lx, lz, h + 1 + Math.ceil((shaftH * MVS) / VOXEL_SIZE));
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
       *  Highways that cross plains, forests, deserts, mountains etc.
       *  When in mountains: tunnels with internal walls/ceiling/lighting.
       *  This section renders the highway surface, markings, barriers,
       *  tunnel enclosure, and lighting for non-city biomes. */
      if (isOnInterHW) {
        const onActualRoad = !hwInfo!.isShoulder;
        const roadY = hwLevel;
        npcWalkableMap[lIdx] = 1;

        if (onActualRoad) {
          // ── Highway asphalt surface ──
          const isMedian2 = hwInfo!.isMedian;
          const isBarrier2 = hwInfo!.isBarrier;
          const roadColor = isMedian2 ? '#448844'  // green median
            : isBarrier2 ? '#888888'   // concrete barrier
            : hwInfo!.isIntersection ? '#404040'
            : '#333333';              // dark asphalt

          push((bX + lx) * VOXEL_SIZE, roadY * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor(roadColor, wx, roadY, wz, 2, 0.02, 0.03));
          groundHeightMap[lIdx] = roadY;
          trackH(lx, lz, roadY);

          // ── Concrete barriers (raised 2 voxels) ──
          if (isBarrier2) {
            for (let by = 1; by <= 2; by++) {
              push((bX + lx) * VOXEL_SIZE, (roadY + by) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#999999', wx, roadY + by, wz, 2, 0.02, 0.04));
            }
            trackH(lx, lz, roadY + 2);
          }

          // ── Lane markings (flat paint) ──
          if (!isMedian2 && !isBarrier2 && !hwInfo!.isIntersection) {
            const paintY2 = roadY * VOXEL_SIZE + VOXEL_SIZE * 0.5 + 0.005;
            const cellCx2 = (bX + lx) * VOXEL_SIZE;
            const cellCz2 = (bZ + lz) * VOXEL_SIZE;
            const stripW2 = MVS * 1.5;
            const cellLen2 = VOXEL_SIZE;

            const absDistX = Math.abs(hwInfo!.distFromCenterX);
            const absDistZ = Math.abs(hwInfo!.distFromCenterZ);

            if (hwInfo!.onX && absDistX <= INTER_HW_HALF_W) {
              // White edge lines
              if (absDistX === INTER_HW_HALF_W - 1) {
                pushPaint(cellCx2, paintY2, cellCz2, '#cccccc', cellLen2, stripW2);
              }
              // Dashed white lane dividers at 1/3 and 2/3
              const laneW = INTER_HW_HALF_W - 2; // lanes between median and barrier
              if (absDistX > 1 && absDistX < INTER_HW_HALF_W - 1) {
                const lanePos = absDistX - 2;
                if (lanePos === Math.floor(laneW / 2) && ((wx % 6 + 6) % 6 < 3)) {
                  pushPaint(cellCx2, paintY2, cellCz2, '#aaaaaa', cellLen2 * 0.5, stripW2);
                }
              }
            }
            if (hwInfo!.onZ && absDistZ <= INTER_HW_HALF_W) {
              if (absDistZ === INTER_HW_HALF_W - 1) {
                pushPaint(cellCx2, paintY2, cellCz2, '#cccccc', stripW2, cellLen2);
              }
              const laneW2 = INTER_HW_HALF_W - 2;
              if (absDistZ > 1 && absDistZ < INTER_HW_HALF_W - 1) {
                const lanePos = absDistZ - 2;
                if (lanePos === Math.floor(laneW2 / 2) && ((wz % 6 + 6) % 6 < 3)) {
                  pushPaint(cellCx2, paintY2, cellCz2, '#aaaaaa', stripW2, cellLen2 * 0.5);
                }
              }
            }
          }

          // ── Tunnel rendering ──
          if (isTunnel) {
            const tunnelCeil = roadY + TUNNEL_HEIGHT;

            // Tunnel walls: on the barrier positions, extend up to ceiling
            if (isBarrier2) {
              for (let ty = 3; ty <= TUNNEL_HEIGHT; ty++) {
                push((bX + lx) * VOXEL_SIZE, (roadY + ty) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor('#777777', wx, roadY + ty, wz, 2, 0.02, 0.04));
              }
              trackH(lx, lz, tunnelCeil);
            }

            // Tunnel ceiling — render for ALL road cells (not just barriers)
            // Ceiling is 1 voxel at tunnelCeil + 1
            push((bX + lx) * VOXEL_SIZE, (tunnelCeil + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor('#666666', wx, tunnelCeil + 1, wz, 2, 0.02, 0.04));
            trackH(lx, lz, tunnelCeil + 1);

            // Tunnel lighting: yellow lights every 8 voxels along the ceiling
            if (!isBarrier2 && !isMedian2) {
              const lightSpacing = 8;
              const onLightX = hwInfo!.onX && ((wx % lightSpacing + lightSpacing) % lightSpacing === 0);
              const onLightZ = hwInfo!.onZ && ((wz % lightSpacing + lightSpacing) % lightSpacing === 0);
              if (onLightX || onLightZ) {
                // Light fixture on ceiling
                push((bX + lx) * VOXEL_SIZE, tunnelCeil * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                  varyColor('#ffee88', wx, tunnelCeil, wz, 3, 0.04, 0.06));
                // Register as street light for night illumination system
                pushSL((bX + lx) * VOXEL_SIZE, tunnelCeil * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE);
              }
            }
          }

        } else if (hwInfo!.isShoulder) {
          // ── Gravel shoulder ──
          push((bX + lx) * VOXEL_SIZE, (h > roadY ? roadY : h) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor('#999988', wx, roadY, wz, 2, 0.03, 0.04));
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
  };
}
