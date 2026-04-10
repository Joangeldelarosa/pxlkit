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
  // Buffer size accounts for wider roads (3× original), taller lampposts (12 voxels),
  // and larger building footprints from increased BLOCK_SIZE
  const maxV = CHUNK_SIZE * CHUNK_SIZE * 24;
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
      const biome = getBiome(biomeN, tempN, wx, wz, cfg.cityFrequency);
      const base = BIOMES[biome];
      const c = biome === 'city' ? base : getVariedBiome(base, wx, wz, regionN, cfg.biomeVariation, cfg.terrainRoughness);

      if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
        variedConfigs[lx * CHUNK_SIZE + lz] = c;
      }

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
  /** Push a mini-voxel (VOXEL_SIZE*0.15 cube) for street furniture / road markings */
  function pushMini(px: number, py: number, pz: number, hex: string) {
    if (miniC >= maxMini) return;
    const i3 = miniC * 3;
    miniPosA[i3] = px; miniPosA[i3 + 1] = py; miniPosA[i3 + 2] = pz;
    _tc.set(hex); miniColA[i3] = _tc.r; miniColA[i3 + 1] = _tc.g; miniColA[i3 + 2] = _tc.b;
    miniC++;
  }
  /** Mini-voxel step size = VOXEL_SIZE * 0.15 */
  const MVS = VOXEL_SIZE * 0.15;

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
      const lIdx = lx * CHUNK_SIZE + lz;
      waterLevelMap[lIdx] = wl;
      groundHeightMap[lIdx] = h;
      npcWalkableMap[lIdx] = biome === 'city' ? 0 : 1;

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

      /* ── 2. WATER — flat surface plane for seamless cross-chunk rendering ── */
      if (h < wl) {
        pushW((bX + lx) * VOXEL_SIZE, wl * VOXEL_SIZE + VOXEL_SIZE * 0.5, (bZ + lz) * VOXEL_SIZE,
          varyColor(c.colors.water, wx, wl, wz, 4, 0.06, 0.06));
        trackH(lx, lz, wl);
      }

      /* ══════════════════ 3. CITY BIOME ══════════════════ */
      if (biome === 'city') {
        const cell = classifyCityCell(wx, wz, structN);
        npcWalkableMap[lIdx] = (cell.isRoad || cell.isSidewalk) ? 1 : 0;
        if (cell.isRoad || cell.isSidewalk) groundHeightMap[lIdx] = h + 1;

        if (cell.isRoad) {
          /* ── Road surface ── */
          const modX = ((wx % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
          const modZ = ((wz % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
          const rw = cell.roadWidth;

          // Road surface color — avenues slightly lighter than standard
          const roadBase = cell.isIntersection ? '#505050'
                         : cell.isAvenue ? '#424242'
                         : '#383838';
          push((bX + lx) * VOXEL_SIZE, (h + 1) * VOXEL_SIZE, (bZ + lz) * VOXEL_SIZE,
            varyColor(roadBase, wx, h + 1, wz, 2, 0.02, 0.03));
          trackH(lx, lz, h + 1);

          const onRoadX = modX < cell.roadWidthX;
          const onRoadZ = modZ < cell.roadWidthZ;
          // Y position for markings: sits on top of road voxel surface
          const markY = (h + 1) * VOXEL_SIZE + VOXEL_SIZE * 0.5 + MVS * 0.5;
          // Center of this voxel cell
          const cellCx = (bX + lx) * VOXEL_SIZE;
          const cellCz = (bZ + lz) * VOXEL_SIZE;

          /* ── Lane markings as mini-voxels (non-intersection) ── */
          if (!cell.isIntersection) {
            if (rw >= AVENUE_W) {
              /* Avenue markings (9 wide):
                 0: white edge | 1-2: lanes | 3: dashed divider
                 4: green median | 5: dashed divider | 6-7: lanes | 8: white edge */
              const mid = Math.floor(rw / 2); // 4 for width 9
              if (onRoadZ && !onRoadX) {
                // Road runs along X axis, modZ = cross-section position
                if (modZ === 0 || modZ === cell.roadWidthZ - 1) {
                  // Solid white edge lines — thin strip along X direction
                  for (let s = -2; s <= 2; s++) {
                    pushMini(cellCx + s * MVS, markY, cellCz, '#cccccc');
                  }
                } else if (modZ === mid - 1 || modZ === mid + 1) {
                  // Dashed white lane dividers along X
                  if (((wx % 6) + 6) % 6 < 3) {
                    for (let s = -2; s <= 2; s++) {
                      pushMini(cellCx + s * MVS, markY, cellCz, '#aaaaaa');
                    }
                  }
                } else if (modZ === mid) {
                  // Raised green median strip — slightly wider
                  for (let sx = -2; sx <= 2; sx++) {
                    for (let sz = -1; sz <= 1; sz++) {
                      pushMini(cellCx + sx * MVS, markY + MVS, cellCz + sz * MVS,
                        varyColor('#448844', wx, h + 1, wz, 3, 0.04, 0.06));
                    }
                  }
                }
              }
              if (onRoadX && !onRoadZ) {
                // Road runs along Z axis, modX = cross-section position
                if (modX === 0 || modX === cell.roadWidthX - 1) {
                  for (let s = -2; s <= 2; s++) {
                    pushMini(cellCx, markY, cellCz + s * MVS, '#cccccc');
                  }
                } else if (modX === mid - 1 || modX === mid + 1) {
                  if (((wz % 6) + 6) % 6 < 3) {
                    for (let s = -2; s <= 2; s++) {
                      pushMini(cellCx, markY, cellCz + s * MVS, '#aaaaaa');
                    }
                  }
                } else if (modX === mid) {
                  for (let sx = -1; sx <= 1; sx++) {
                    for (let sz = -2; sz <= 2; sz++) {
                      pushMini(cellCx + sx * MVS, markY + MVS, cellCz + sz * MVS,
                        varyColor('#448844', wx, h + 1, wz, 3, 0.04, 0.06));
                    }
                  }
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
                  for (let s = -2; s <= 2; s++) {
                    pushMini(cellCx + s * MVS, markY, cellCz, '#bbbbbb');
                  }
                } else if (modZ === cL && ((wx % 4) + 4) % 4 < 2) {
                  // Left yellow center line
                  for (let s = -2; s <= 2; s++) {
                    pushMini(cellCx + s * MVS, markY, cellCz + MVS, '#ffdd44');
                  }
                } else if (modZ === cR && ((wx % 4) + 4) % 4 < 2) {
                  // Right yellow center line
                  for (let s = -2; s <= 2; s++) {
                    pushMini(cellCx + s * MVS, markY, cellCz - MVS, '#ffdd44');
                  }
                }
              }
              if (onRoadX && !onRoadZ) {
                // Road runs along Z, markings along Z direction
                if (modX === 0 || modX === cell.roadWidthX - 1) {
                  for (let s = -2; s <= 2; s++) {
                    pushMini(cellCx, markY, cellCz + s * MVS, '#bbbbbb');
                  }
                } else if (modX === cL && ((wz % 4) + 4) % 4 < 2) {
                  for (let s = -2; s <= 2; s++) {
                    pushMini(cellCx + MVS, markY, cellCz + s * MVS, '#ffdd44');
                  }
                } else if (modX === cR && ((wz % 4) + 4) % 4 < 2) {
                  for (let s = -2; s <= 2; s++) {
                    pushMini(cellCx - MVS, markY, cellCz + s * MVS, '#ffdd44');
                  }
                }
              }
            }
          }

          /* ── Crosswalk zebra stripes at intersections (mini-voxels) ── */
          if (cell.isIntersection) {
            const rwX = cell.roadWidthX;
            const rwZ = cell.roadWidthZ;
            const nearEdgeX = modX <= 1 || modX >= rwX - 2;
            const nearEdgeZ = modZ <= 1 || modZ >= rwZ - 2;
            if ((nearEdgeX || nearEdgeZ) && (((modX + modZ) % 2) === 0)) {
              // Draw crosswalk stripe perpendicular to road edge
              if (nearEdgeZ && !nearEdgeX) {
                // Stripe runs along X (across Z-road at edge)
                for (let s = -2; s <= 2; s++) {
                  pushMini(cellCx + s * MVS, markY, cellCz, '#dddddd');
                }
              } else if (nearEdgeX && !nearEdgeZ) {
                // Stripe runs along Z (across X-road at edge)
                for (let s = -2; s <= 2; s++) {
                  pushMini(cellCx, markY, cellCz + s * MVS, '#dddddd');
                }
              } else {
                // Corner of intersection — small cross
                pushMini(cellCx, markY, cellCz, '#dddddd');
                pushMini(cellCx + MVS, markY, cellCz, '#dddddd');
                pushMini(cellCx - MVS, markY, cellCz, '#dddddd');
                pushMini(cellCx, markY, cellCz + MVS, '#dddddd');
                pushMini(cellCx, markY, cellCz - MVS, '#dddddd');
              }
            }
          }

          /* ── Lampposts as mini-voxels — thin poles at NPC scale ── */
          if (cell.isIntersection) {
            const rwX = cell.roadWidthX;
            const rwZ = cell.roadWidthZ;
            const atCorner = (modX === 0 || modX === rwX - 1) && (modZ === 0 || modZ === rwZ - 1);
            if (atCorner) {
              // Pole base sits on the road surface: (h+1)*VOXEL_SIZE + VOXEL_SIZE*0.5
              const poleBaseY = (h + 1) * VOXEL_SIZE + VOXEL_SIZE * 0.5;
              const px = cellCx;
              const pz = cellCz;
              // Thick base (2×2 mini-voxels, 3 tall)
              for (let by = 0; by < 3; by++) {
                for (let bx = -1; bx <= 0; bx++) {
                  for (let bz = -1; bz <= 0; bz++) {
                    pushMini(px + bx * MVS, poleBaseY + by * MVS, pz + bz * MVS, '#3a3a3a');
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
              // Light at end of X arm (2×2 glow)
              pushMini(px + 3 * armDx * MVS, poleBaseY + shaftH * MVS, pz, '#ffee88');
              pushMini(px + 4 * armDx * MVS, poleBaseY + shaftH * MVS, pz, '#ffdd66');
              // Z-direction arm + light
              for (let a = 1; a <= 4; a++) {
                pushMini(px, poleBaseY + (shaftH - 1) * MVS, pz + a * armDz * MVS, '#666666');
              }
              pushMini(px, poleBaseY + shaftH * MVS, pz + 3 * armDz * MVS, '#ffee88');
              pushMini(px, poleBaseY + shaftH * MVS, pz + 4 * armDz * MVS, '#ffdd66');
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

        } else if (cell.isBuilding) {
          /* ── Building — use modular building system ── */
          const bType = getBuildingType(
            structN, cell.lotWorldX, cell.lotWorldZ,
            cfg.structureDensity, cell.zone, cell.buildingW, cell.buildingD,
          );
          const bh = getBuildingHeight(structN, cell.lotWorldX, cell.lotWorldZ, bType);
          const baseFootprint = BLOCK_SIZE - ROAD_W - LOT_INSET * 2;
          // Single-lot: use actual per-dimension footprint for correct wall placement
          // Multi-lot: use ROAD_W-based baseFootprint for consistent cross-lot alignment
          const footprintX = BLOCK_SIZE - cell.roadWidthX - LOT_INSET * 2;
          const footprintZ = BLOCK_SIZE - cell.roadWidthZ - LOT_INSET * 2;
          const totalW = cell.buildingW > 1 ? cell.buildingW * baseFootprint : footprintX;
          const totalD = cell.buildingD > 1 ? cell.buildingD * baseFootprint : footprintZ;

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
    groundHeightMap, npcWalkableMap, solidHeightMap, waterLevelMap,
    miniVoxelPositions: miniPosA.subarray(0, miniC * 3),
    miniVoxelColors: miniColA.subarray(0, miniC * 3),
    miniVoxelCount: miniC,
    chunkX: cx, chunkZ: cz,
  };
}
