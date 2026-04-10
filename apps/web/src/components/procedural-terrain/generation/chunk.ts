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
  CHUNK_SIZE, VOXEL_SIZE, MAX_HEIGHT, NO_FACE,
  BIOMES, BIOME_TYPES, BLOCK_SIZE, ROAD_W, LOT_INSET, AVENUE_W,
} from '../constants';
import { mulberry32, fbm } from '../utils/noise';
import { varyColor, hashCoord } from '../utils/color';
import { getBiome, getVariedBiome } from '../utils/biomes';
import { classifyCityCell, getBuildingType, getBuildingHeight } from '../city/layout';
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
  const maxWin = CHUNK_SIZE * CHUNK_SIZE * 4;
  const winPosA = new Float32Array(maxWin * 3);
  let winC = 0;
  const solidHeightMap = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);
  const waterLevelMap = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);

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
  const wlMap = new Int32Array(gW * gW);   // water level for extended grid (inc. borders)
  const variedConfigs: BiomeConfig[] = new Array(CHUNK_SIZE * CHUNK_SIZE);

  for (let lx = -1; lx <= CHUNK_SIZE; lx++) {
    for (let lz = -1; lz <= CHUNK_SIZE; lz++) {
      const wx = bX + lx, wz = bZ + lz;
      const idx = (lx + 1) * gW + (lz + 1);
      const biome = getBiome(biomeN, tempN, wx, wz, cfg.cityFrequency);
      const base = BIOMES[biome];
      const c = biome === 'city' ? base : getVariedBiome(base, wx, wz, regionN, cfg.biomeVariation, cfg.terrainRoughness);

      if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
        variedConfigs[lx * CHUNK_SIZE + lz] = c;
      }
      wlMap[idx] = c.waterLevel;

      let h: number;
      if (biome === 'city') {
        h = c.heightBase;
      } else {
        const base2 = fbm(heightN, wx * 0.02, wz * 0.02, 4, 2.0, 0.5);
        const det = detailN(wx * 0.08, wz * 0.08) * (0.2 + cfg.terrainRoughness * 0.3);
        let extra = 0;
        if (biome === 'mountains') {
          extra = Math.abs(fbm(detailN, wx * 0.015 + 200, wz * 0.015 + 200, 2)) * (4 + cfg.terrainRoughness * 4);
        }
        h = Math.max(0, Math.min(MAX_HEIGHT, Math.floor(c.heightBase + (base2 + det) * c.heightScale + extra)));
      }
      const fade = edgeFade(wx, wz);
      if (fade <= 0) { hMap[idx] = -1; bMap[idx] = BIOME_TYPES.indexOf(biome); continue; }
      if (fade < 1) h = Math.max(0, Math.floor(h * fade));
      hMap[idx] = h;
      bMap[idx] = BIOME_TYPES.indexOf(biome);
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

  const chunkRand = mulberry32(cx * 73856093 + cz * 19349663);

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
      waterLevelMap[lx * CHUNK_SIZE + lz] = wl;

      /* ── 1. TERRAIN ── */
      for (let y = 0; y <= h; y++) {
        const isTop = y === h;
        const exposed = isTop || y === 0 || y > hN || y > hS || y > hE || y > hWest;
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

      /* ── 2. WATER ── */
      if (h < wl) {
        for (let wy = h + 1; wy <= wl; wy++) {
          const isWTop = wy === wl;
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

      /* ── 2b. WATERFALL — cascade water at edges where neighbor has higher water ── */
      {
        const myTop = Math.max(h, wl);
        // Check each neighbor for higher water that should cascade into this cell
        const nDirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        let maxNeighborWater = -1;
        for (const [dlx, dlz] of nDirs) {
          const nIdx = (lx + dlx + 1) * gW + (lz + dlz + 1);
          const nh = hMap[nIdx];
          const nwl = wlMap[nIdx];
          // Neighbor has water (terrain below its water level) AND its water is above our surface
          if (nh >= 0 && nh < nwl && nwl > myTop) {
            if (nwl > maxNeighborWater) maxNeighborWater = nwl;
          }
        }
        if (maxNeighborWater > myTop) {
          // Add cascading water voxels from myTop+1 up to the neighbor's water level
          const waterCol = c.colors.water || '#88ddff';
          for (let wy = myTop + 1; wy <= maxNeighborWater; wy++) {
            pushW((bX + lx) * VOXEL_SIZE, wy * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
              varyColor(waterCol, wx, wy, wz, 6, 0.15, 0.20));
          }
          trackH(lx, lz, maxNeighborWater);
          // Update water level map for this cell so NPC/boats can see it
          if (maxNeighborWater > waterLevelMap[lx * CHUNK_SIZE + lz]) {
            waterLevelMap[lx * CHUNK_SIZE + lz] = maxNeighborWater;
          }
        }
      }

      /* ══════════════════ 3. CITY BIOME ══════════════════ */
      if (biome === 'city') {
        const cell = classifyCityCell(wx, wz, structN);

        if (cell.isRoad) {
          /* ── Road surface ── */
          const modX = ((wx % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
          const modZ = ((wz % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
          const rw = cell.roadWidth;

          // Road surface color — avenues are slightly different
          const roadBase = cell.isIntersection ? '#555555'
                         : cell.isAvenue ? '#444444'
                         : '#3a3a3a';
          push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor(roadBase, wx, h + 1, wz, 2, 0.03, 0.04));
          trackH(lx, lz, h + 1);

          /* Road markings — intelligent: adapt to road width */
          const onRoadX = modX < rw;
          const onRoadZ = modZ < rw;

          if (rw >= AVENUE_W) {
            // Avenue — has center line, edge lines, and lane markings
            // Center dashed yellow line
            if (onRoadZ && !onRoadX && modZ === Math.floor(rw / 2) && (((wx % 4) + 4) % 4) < 2) {
              push((bX + lx) * VOXEL_SIZE, (h + 1.05) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffdd44');
            }
            if (onRoadX && !onRoadZ && modX === Math.floor(rw / 2) && (((wz % 4) + 4) % 4) < 2) {
              push((bX + lx) * VOXEL_SIZE, (h + 1.05) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffdd44');
            }
            // White edge lines
            if ((onRoadX && !onRoadZ && (modX === 0 || modX === rw - 1)) ||
                (onRoadZ && !onRoadX && (modZ === 0 || modZ === rw - 1))) {
              push((bX + lx) * VOXEL_SIZE, (h + 1.05) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#cccccc');
            }
          } else {
            // Standard road (ROAD_W = 2) — yellow center when width allows
            if (onRoadZ && !onRoadX && modZ === 0 && (((wx % 4) + 4) % 4) < 2) {
              push((bX + lx) * VOXEL_SIZE, (h + 1.05) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffdd44');
            }
            if (onRoadX && !onRoadZ && modX === 0 && (((wz % 4) + 4) % 4) < 2) {
              push((bX + lx) * VOXEL_SIZE, (h + 1.05) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffdd44');
            }
            // White edge lines
            if ((onRoadX && !onRoadZ && (modX === 0 || modX === rw - 1)) ||
                (onRoadZ && !onRoadX && (modZ === 0 || modZ === rw - 1))) {
              push((bX + lx) * VOXEL_SIZE, (h + 1.05) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#bbbbbb');
            }
          }

          // Crosswalk at intersections
          if (cell.isIntersection && ((modX + modZ) % 2 === 0)) {
            push((bX + lx) * VOXEL_SIZE, (h + 1.05) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#dddddd');
          }

          /* Lampposts at intersection corners */
          if (modX === 0 && modZ === 0) {
            for (let ly = 2; ly <= 5; ly++) {
              push((bX + lx) * VOXEL_SIZE, (h + ly) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#666666');
            }
            push((bX + lx) * VOXEL_SIZE, (h + 6) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffee88');
            push((bX + lx + 1) * VOXEL_SIZE, (h + 5) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#555555');
            push((bX + lx + 1) * VOXEL_SIZE, (h + 6) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE, '#ffee88');
            trackH(lx, lz, h + 6);
          }

          /* Avenue median / boulevard strip */
          if (cell.isAvenue && !cell.isIntersection) {
            const midX = Math.floor(rw / 2);
            const midZ = Math.floor(rw / 2);
            // Green median strip in the center of avenues
            if ((onRoadX && !onRoadZ && modX === midX) ||
                (onRoadZ && !onRoadX && modZ === midZ)) {
              push((bX + lx) * VOXEL_SIZE, (h + 1.08) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
                varyColor('#448844', wx, h + 1, wz, 3, 0.04, 0.06));
            }
          }

        } else if (cell.isSidewalk) {
          push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor('#aaaaaa', wx, h + 1, wz, 2, 0.03, 0.05));
          trackH(lx, lz, h + 1);

        } else if (cell.isBuilding) {
          /* ── Building — use modular building system ── */
          const bType = getBuildingType(
            structN, cell.lotWorldX, cell.lotWorldZ,
            cfg.structureDensity, cell.zone, cell.buildingW, cell.buildingD,
          );
          const bh = getBuildingHeight(structN, cell.lotWorldX, cell.lotWorldZ, bType);
          const footprint = BLOCK_SIZE - ROAD_W - LOT_INSET * 2;
          const totalW = cell.buildingW > 1 ? cell.buildingW * footprint : footprint;
          const totalD = cell.buildingD > 1 ? cell.buildingD * footprint : footprint;

          generateBuildingColumn({
            push, trackH, pushWin,
            bX, bZ, lx, lz, h, wx, wz,
            blX: cell.lotLocalX, blZ: cell.lotLocalZ,
            footW: totalW, footD: totalD,
            bType, bh,
          });
        }
        continue; // city biome handled
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
    solidHeightMap, waterLevelMap, chunkX: cx, chunkZ: cz,
  };
}
