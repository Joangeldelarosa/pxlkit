/* ═══════════════════════════════════════════════════════════════
 *  City Building Generators — voxel-by-voxel building construction
 *
 *  Each function receives the push() helper and constructs
 *  the building column by column. This keeps the main chunk
 *  generator clean and lets us add new building types easily.
 * ═══════════════════════════════════════════════════════════════ */

import type { BuildingType } from '../types';
import { BLOCK_SIZE, ROAD_W, LOT_INSET, VOXEL_SIZE } from '../constants';
import { varyColor, hashCoord } from '../utils/color';
import { getWallPalette, getRoofColor } from './layout';

type PushFn = (px: number, py: number, pz: number, hex: string) => void;
type TrackFn = (lx: number, lz: number, h: number) => void;

interface BuildCtx {
  push: PushFn;
  trackH: TrackFn;
  bX: number;       // chunk base X in voxels
  bZ: number;       // chunk base Z in voxels
  lx: number;       // local X within chunk
  lz: number;       // local Z within chunk
  h: number;        // ground height
  wx: number;       // world X
  wz: number;       // world Z
  blX: number;      // local X within building footprint
  blZ: number;      // local Z within building footprint
  footW: number;    // total building footprint width
  footD: number;    // total building footprint depth
  bType: BuildingType;
  bh: number;       // building height
}

const VS = VOXEL_SIZE;
const singleLotFoot = BLOCK_SIZE - ROAD_W - LOT_INSET * 2; // 6

/** Generate voxels for a building at one column */
export function generateBuildingColumn(ctx: BuildCtx): void {
  const { bType } = ctx;

  switch (bType) {
    case 'park':           return genPark(ctx);
    case 'parking':        return genParking(ctx);
    case 'plaza':          return genPlaza(ctx);
    case 'fountain_plaza': return genFountainPlaza(ctx);
    case 'warehouse':      return genWarehouse(ctx);
    case 'factory':        return genFactory(ctx);
    case 'parking_garage': return genParkingGarage(ctx);
    case 'hospital':       return genHospital(ctx);
    case 'school':         return genSchool(ctx);
    case 'church':         return genChurch(ctx);
    case 'stadium':        return genStadium(ctx);
    case 'mall':           return genMall(ctx);
    case 'airport_terminal': return genAirportTerminal(ctx);
    case 'mansion':        return genMansion(ctx);
    case 'skyscraper_twin':    return genSkyscraperTwin(ctx);
    case 'skyscraper_stepped': return genSkyscraperStepped(ctx);
    case 'tower_telecom':  return genTelecomTower(ctx);
    default:               return genStandardBuilding(ctx);
  }
}

/* ── Helper ── */
function isEdge(x: number, z: number, w: number, d: number): boolean {
  return x === 0 || x === w - 1 || z === 0 || z === d - 1;
}

/* ═══════════════ STANDARD BUILDINGS ═══════════════ */
// Covers: skyscraper, office, office_tall, tower, house, shop

function genStandardBuilding(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bType, bh } = ctx;
  const walls = getWallPalette(bType);
  const wallBase = walls[0];
  const roofCol = getRoofColor(bType);
  const windowCol = '#aaddff';
  const doorCol = '#886644';
  const onEdge = isEdge(blX, blZ, footW, footD);
  const isEdgeX = blX === 0 || blX === footW - 1;
  const isEdgeZ = blZ === 0 || blZ === footD - 1;

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue; // hollow interior
    let color: string;
    if (by === bh) {
      // Roof
      color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by === 1 && blZ === 0 && blX >= 1 && blX <= Math.min(2, footW - 2)) {
      // Door
      color = varyColor(doorCol, wx, h + by, wz, 3, 0.04, 0.05);
    } else if (onEdge && by > 1 && by < bh && by % 2 === 0) {
      // Window rows
      const isWindowCol = isEdgeZ
        ? (blX >= 1 && blX <= footW - 2 && blX % 2 === 1)
        : (blZ >= 1 && blZ <= footD - 2 && blZ % 2 === 1);
      color = isWindowCol
        ? varyColor(windowCol, wx, h + by, wz, 3, 0.05, 0.06)
        : varyColor(wallBase, wx, h + by, wz, 5, 0.06, 0.07);
    } else {
      color = varyColor(wallBase, wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Peaked roof for houses & shops
  if ((bType === 'house' || bType === 'shop') && onEdge) {
    const midX = Math.floor(footW / 2);
    const dist = Math.abs(blX - midX);
    const roofExtra = Math.max(0, 2 - dist);
    for (let ry = 1; ry <= roofExtra; ry++) {
      push((bX + lx) * VS, (h + bh + ry) * VS, (bZ + lz) * VS,
        varyColor(roofCol, wx, h + bh + ry, wz, 4, 0.04, 0.06));
    }
    if (bType === 'shop' && blZ === 0 && roofExtra === 0) {
      // Awning
      push((bX + lx) * VS, (h + 3) * VS, (bZ + lz - 1) * VS,
        varyColor('#ee6644', wx, h + 3, wz - 1, 5, 0.06, 0.06));
    }
    trackH(lx, lz, h + bh + roofExtra);
  } else if (bType === 'tower' && blX === Math.floor(footW / 2) && blZ === Math.floor(footD / 2)) {
    // Antenna
    for (let ay = 1; ay <= 4; ay++) {
      push((bX + lx) * VS, (h + bh + ay) * VS, (bZ + lz) * VS,
        varyColor('#999999', wx, h + bh + ay, wz, 2, 0.02, 0.04));
    }
    push((bX + lx) * VS, (h + bh + 5) * VS, (bZ + lz) * VS, '#ff4444');
    trackH(lx, lz, h + bh + 5);
  } else if (bType === 'skyscraper' && blX === Math.floor(footW / 2) && blZ === Math.floor(footD / 2)) {
    // Helipad
    push((bX + lx) * VS, (h + bh + 0.1) * VS, (bZ + lz) * VS, '#dddd44');
    trackH(lx, lz, h + bh);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ SKYSCRAPER TWIN ═══════════════ */
function genSkyscraperTwin(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const walls = getWallPalette('skyscraper_twin');
  const roofCol = getRoofColor('skyscraper_twin');
  const onEdge = isEdge(blX, blZ, footW, footD);

  // Twin tower: two towers with a gap in the middle
  const midX = Math.floor(footW / 2);
  const isGap = blX >= midX - 1 && blX <= midX; // 2-wide gap between towers
  const towerH = isGap ? Math.floor(bh * 0.4) : bh; // skybridge at 40% height

  for (let by = 1; by <= towerH; by++) {
    if (!onEdge && !isGap && by < towerH) continue;
    let color: string;
    if (by === towerH) {
      color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
    } else if (onEdge && by > 1 && by % 3 === 0) {
      color = varyColor('#88ccff', wx, h + by, wz, 3, 0.05, 0.06); // blue glass
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Skybridge at 40% height
  if (isGap && towerH > 3) {
    const bridgeY = Math.floor(bh * 0.4);
    push((bX + lx) * VS, (h + bridgeY) * VS, (bZ + lz) * VS,
      varyColor('#aabbcc', wx, h + bridgeY, wz, 3, 0.03, 0.05));
  }

  trackH(lx, lz, h + towerH);
}

/* ═══════════════ SKYSCRAPER STEPPED ═══════════════ */
function genSkyscraperStepped(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const walls = getWallPalette('skyscraper_stepped');
  const roofCol = getRoofColor('skyscraper_stepped');

  // Stepped: each "tier" is smaller. 3 tiers at 33%, 66%, 100% height
  const tier1 = Math.floor(bh * 0.4);
  const tier2 = Math.floor(bh * 0.7);
  const tier3 = bh;

  // Tier insets
  const inset1 = 0;
  const inset2 = 1;
  const inset3 = 2;

  function inRange(x: number, z: number, inset: number): boolean {
    return x >= inset && x < footW - inset && z >= inset && z < footD - inset;
  }

  let maxY = 0;
  // Tier 1 (full width)
  if (inRange(blX, blZ, inset1)) {
    const onEdgeT = !inRange(blX, blZ, inset1 + 1);
    for (let by = 1; by <= tier1; by++) {
      if (!onEdgeT && by < tier1) continue;
      const color = by === tier1
        ? varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06)
        : varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    maxY = tier1;
  }

  // Tier 2 (medium)
  if (inRange(blX, blZ, inset2)) {
    const onEdgeT = !inRange(blX, blZ, inset2 + 1);
    for (let by = tier1 + 1; by <= tier2; by++) {
      if (!onEdgeT && by < tier2) continue;
      const color = by === tier2
        ? varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06)
        : (by % 2 === 0 ? varyColor('#99bbdd', wx, h + by, wz, 3, 0.05, 0.06) : varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07));
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    maxY = tier2;
  }

  // Tier 3 (small top)
  if (inRange(blX, blZ, inset3)) {
    const onEdgeT = !inRange(blX, blZ, inset3 + 1);
    for (let by = tier2 + 1; by <= tier3; by++) {
      if (!onEdgeT && by < tier3) continue;
      const color = by === tier3
        ? varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06)
        : varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    maxY = tier3;
  }

  trackH(lx, lz, h + maxY);
}

/* ═══════════════ TELECOM TOWER ═══════════════ */
function genTelecomTower(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const midX = Math.floor(footW / 2), midZ = Math.floor(footD / 2);
  const isTower = blX === midX && blZ === midZ;
  const isBase = Math.abs(blX - midX) <= 1 && Math.abs(blZ - midZ) <= 1;

  if (isTower) {
    // Main tower column
    for (let by = 1; by <= bh + 6; by++) {
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS,
        varyColor(by <= bh ? '#888888' : '#aaaaaa', wx, h + by, wz, 2, 0.02, 0.04));
    }
    push((bX + lx) * VS, (h + bh + 7) * VS, (bZ + lz) * VS, '#ff2222'); // beacon
    trackH(lx, lz, h + bh + 7);
  } else if (isBase) {
    // Base structure (3×3)
    for (let by = 1; by <= Math.floor(bh * 0.4); by++) {
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS,
        varyColor('#777777', wx, h + by, wz, 3, 0.03, 0.05));
    }
    // Dish arms at mid height
    if ((blX === midX - 1 || blX === midX + 1) && blZ === midZ) {
      push((bX + lx) * VS, (h + Math.floor(bh * 0.6)) * VS, (bZ + lz) * VS,
        varyColor('#cccccc', wx, h + Math.floor(bh * 0.6), wz, 2, 0.02, 0.04));
    }
    trackH(lx, lz, h + Math.floor(bh * 0.4));
  } else {
    // Ground - concrete pad
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
      varyColor('#999999', wx, h + 1, wz, 2, 0.03, 0.04));
    trackH(lx, lz, h + 1);
  }
}

/* ═══════════════ PARK ═══════════════ */
function genPark(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD } = ctx;
  push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS, varyColor('#66cc77', wx, h + 1, wz));
  trackH(lx, lz, h + 1);

  // Tree at center
  if (blX === Math.floor(footW / 2) && blZ === Math.floor(footD / 2)) {
    for (let ty = 2; ty <= 4; ty++) push((bX + lx) * VS, (h + ty) * VS, (bZ + lz) * VS, varyColor('#664422', wx, h + ty, wz, 4, 0.05, 0.06));
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      push((bX + lx + dx) * VS, (h + 5) * VS, (bZ + lz + dz) * VS, varyColor('#44aa66', wx + dx, h + 5, wz + dz));
      if (dx === 0 || dz === 0) push((bX + lx + dx) * VS, (h + 6) * VS, (bZ + lz + dz) * VS, varyColor('#44aa66', wx + dx, h + 6, wz + dz));
    }
    trackH(lx, lz, h + 6);
  }

  // Benches at edges
  if (blX === 1 && blZ === Math.floor(footD / 2)) {
    push((bX + lx) * VS, (h + 2) * VS, (bZ + lz) * VS, varyColor('#885533', wx, h + 2, wz, 3, 0.04, 0.05));
  }
}

/* ═══════════════ PLAZA ═══════════════ */
function genPlaza(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD } = ctx;
  // Tiled ground pattern
  const isTile = (blX + blZ) % 2 === 0;
  push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
    varyColor(isTile ? '#ccbbaa' : '#bbaa99', wx, h + 1, wz, 2, 0.03, 0.04));
  trackH(lx, lz, h + 1);
}

/* ═══════════════ FOUNTAIN PLAZA ═══════════════ */
function genFountainPlaza(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD } = ctx;
  const midX = Math.floor(footW / 2), midZ = Math.floor(footD / 2);
  const isTile = (blX + blZ) % 2 === 0;

  // Ground
  push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
    varyColor(isTile ? '#ccbbaa' : '#bbaa99', wx, h + 1, wz, 2, 0.03, 0.04));

  // Fountain basin (3×3 center)
  const dx = Math.abs(blX - midX), dz = Math.abs(blZ - midZ);
  if (dx <= 1 && dz <= 1) {
    if (dx === 1 || dz === 1) {
      // Basin wall
      push((bX + lx) * VS, (h + 2) * VS, (bZ + lz) * VS, varyColor('#aaaaaa', wx, h + 2, wz, 2, 0.03, 0.04));
    } else {
      // Water center
      push((bX + lx) * VS, (h + 1.5) * VS, (bZ + lz) * VS, '#4488cc');
      // Spout
      push((bX + lx) * VS, (h + 3) * VS, (bZ + lz) * VS, '#66aadd');
    }
  }
  trackH(lx, lz, h + (dx <= 1 && dz <= 1 ? 3 : 1));
}

/* ═══════════════ PARKING ═══════════════ */
function genParking(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ } = ctx;
  const stripe = blZ % 3 === 0 && blX > 0 && blX < 5;
  push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
    varyColor(stripe ? '#eeeeee' : '#666666', wx, h + 1, wz, 2, 0.03, 0.04));
  trackH(lx, lz, h + 1);
}

/* ═══════════════ PARKING GARAGE ═══════════════ */
function genParkingGarage(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const onEdge = isEdge(blX, blZ, footW, footD);

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by % 2 !== 0) continue; // open sides on every other floor
    let color: string;
    if (by === bh) {
      color = varyColor('#777777', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (onEdge && by % 2 === 0) {
      // Ramp slots
      const isOpening = blX > 1 && blX < footW - 2 && (blZ === 0 || blZ === footD - 1);
      color = isOpening ? '#333333' : varyColor('#888888', wx, h + by, wz, 3, 0.03, 0.05);
    } else {
      // Floor slabs
      color = varyColor('#999999', wx, h + by, wz, 2, 0.02, 0.04);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  trackH(lx, lz, h + bh);
}

/* ═══════════════ WAREHOUSE ═══════════════ */
function genWarehouse(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const onEdge = isEdge(blX, blZ, footW, footD);
  const walls = getWallPalette('warehouse');
  const roofCol = getRoofColor('warehouse');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor(blX % 2 === 0 ? roofCol : '#776655', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (by <= 2 && blZ === 0 && blX >= 1 && blX <= Math.min(4, footW - 2)) {
      color = varyColor('#555555', wx, h + by, wz, 2, 0.02, 0.04); // roll-up door
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 4, 0.04, 0.06);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  trackH(lx, lz, h + bh);
}

/* ═══════════════ FACTORY ═══════════════ */
function genFactory(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const onEdge = isEdge(blX, blZ, footW, footD);

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#666666', wx, h + by, wz, 3, 0.03, 0.05);
    } else {
      color = varyColor('#777777', wx, h + by, wz, 3, 0.04, 0.06);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Smokestacks at corners
  if ((blX === 0 && blZ === 0) || (blX === footW - 1 && blZ === footD - 1)) {
    for (let sy = 1; sy <= 3; sy++) {
      push((bX + lx) * VS, (h + bh + sy) * VS, (bZ + lz) * VS,
        varyColor('#555555', wx, h + bh + sy, wz, 2, 0.02, 0.04));
    }
    trackH(lx, lz, h + bh + 3);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ HOSPITAL ═══════════════ */
function genHospital(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const onEdge = isEdge(blX, blZ, footW, footD);
  const walls = getWallPalette('hospital');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#dddddd', wx, h + by, wz, 3, 0.02, 0.04);
    } else if (by === 1 && blZ === 0 && blX >= 2 && blX <= 3) {
      // Entrance
      color = varyColor('#88ccff', wx, h + by, wz, 2, 0.03, 0.04);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 4, 0.04, 0.06);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Red cross on roof
  const midX = Math.floor(footW / 2), midZ = Math.floor(footD / 2);
  if ((blX === midX && Math.abs(blZ - midZ) <= 1) || (blZ === midZ && Math.abs(blX - midX) <= 1)) {
    push((bX + lx) * VS, (h + bh + 0.1) * VS, (bZ + lz) * VS, '#ff3333');
  }
  trackH(lx, lz, h + bh);
}

/* ═══════════════ SCHOOL ═══════════════ */
function genSchool(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const onEdge = isEdge(blX, blZ, footW, footD);
  const walls = getWallPalette('school');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#cc9944', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (onEdge && by % 2 === 0) {
      // Windows (large)
      const isWin = blX >= 1 && blX <= footW - 2 && blX % 2 === 0;
      color = isWin ? varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06) : varyColor(walls[0], wx, h + by, wz, 4, 0.04, 0.06);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 4, 0.04, 0.06);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Flagpole at entrance
  if (blX === 0 && blZ === 0) {
    for (let fy = 1; fy <= 4; fy++) {
      push((bX + lx) * VS, (h + bh + fy) * VS, (bZ + lz) * VS, '#888888');
    }
    push((bX + lx + 1) * VS, (h + bh + 4) * VS, (bZ + lz) * VS, '#ff4444'); // flag
    trackH(lx, lz, h + bh + 4);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ CHURCH ═══════════════ */
function genChurch(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const onEdge = isEdge(blX, blZ, footW, footD);

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#886644', wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by === Math.floor(bh * 0.6) && onEdge && blX % 2 === 1) {
      color = varyColor('#dd8844', wx, h + by, wz, 3, 0.04, 0.05); // stained glass
    } else {
      color = varyColor('#ccbbaa', wx, h + by, wz, 4, 0.04, 0.06);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Steeple at center-back
  const midX = Math.floor(footW / 2);
  if (blX === midX && blZ === footD - 1) {
    for (let sy = 1; sy <= 5; sy++) {
      push((bX + lx) * VS, (h + bh + sy) * VS, (bZ + lz) * VS,
        varyColor(sy <= 4 ? '#bbaa99' : '#ffdd44', wx, h + bh + sy, wz, 2, 0.02, 0.04));
    }
    trackH(lx, lz, h + bh + 5);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ STADIUM ═══════════════ */
function genStadium(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const onEdge = isEdge(blX, blZ, footW, footD);
  const isInner = blX >= 2 && blX < footW - 2 && blZ >= 2 && blZ < footD - 2;

  if (isInner) {
    // Field
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS, varyColor('#44bb55', wx, h + 1, wz, 3, 0.04, 0.06));
    trackH(lx, lz, h + 1);
  } else {
    // Stadium seating — rises toward edges
    const distFromEdge = Math.min(blX, footW - 1 - blX, blZ, footD - 1 - blZ);
    const seatH = Math.max(1, bh - distFromEdge);
    for (let by = 1; by <= seatH; by++) {
      const color = by === seatH
        ? varyColor((blX + blZ) % 2 === 0 ? '#bbbbbb' : '#999999', wx, h + by, wz, 2, 0.03, 0.04)
        : varyColor('#aaaaaa', wx, h + by, wz, 3, 0.03, 0.05);
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    // Light towers at corners
    if ((blX === 0 || blX === footW - 1) && (blZ === 0 || blZ === footD - 1)) {
      for (let ly = seatH + 1; ly <= seatH + 4; ly++) {
        push((bX + lx) * VS, (h + ly) * VS, (bZ + lz) * VS, '#888888');
      }
      push((bX + lx) * VS, (h + seatH + 5) * VS, (bZ + lz) * VS, '#ffffaa');
      trackH(lx, lz, h + seatH + 5);
    } else {
      trackH(lx, lz, h + seatH);
    }
  }
}

/* ═══════════════ MALL ═══════════════ */
function genMall(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const onEdge = isEdge(blX, blZ, footW, footD);

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#bb7744', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (by <= 2 && blZ === 0 && blX >= 2 && blX < footW - 2) {
      // Glass entrance
      color = varyColor('#88ccee', wx, h + by, wz, 2, 0.04, 0.05);
    } else if (onEdge && by % 2 === 0) {
      // Alternating glass/wall
      color = blX % 2 === 0 ? varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06)
                            : varyColor('#ccbbaa', wx, h + by, wz, 4, 0.04, 0.06);
    } else {
      color = varyColor('#ccbbaa', wx, h + by, wz, 4, 0.04, 0.06);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Rooftop signage
  if (blX === Math.floor(footW / 2) && blZ === 0) {
    push((bX + lx) * VS, (h + bh + 1) * VS, (bZ + lz) * VS, '#ff6644');
    trackH(lx, lz, h + bh + 1);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ AIRPORT TERMINAL ═══════════════ */
function genAirportTerminal(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const onEdge = isEdge(blX, blZ, footW, footD);

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      // Curved roof — lighter at center
      const centerDist = Math.abs(blX - footW / 2) / (footW / 2);
      color = varyColor(centerDist < 0.5 ? '#aabbcc' : '#99aabb', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (onEdge && by >= 2) {
      // All glass facade
      color = varyColor('#88bbdd', wx, h + by, wz, 3, 0.05, 0.06);
    } else {
      color = varyColor('#bbccdd', wx, h + by, wz, 4, 0.04, 0.06);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Control tower at one end
  if (blX === footW - 1 && blZ === Math.floor(footD / 2)) {
    for (let ty = 1; ty <= 6; ty++) {
      push((bX + lx) * VS, (h + bh + ty) * VS, (bZ + lz) * VS,
        varyColor(ty <= 4 ? '#888888' : '#88ccee', wx, h + bh + ty, wz, 2, 0.02, 0.04));
    }
    trackH(lx, lz, h + bh + 6);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ MANSION ═══════════════ */
function genMansion(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh } = ctx;
  const onEdge = isEdge(blX, blZ, footW, footD);

  // Garden area (outer ring)
  const isGarden = blX < 1 || blX >= footW - 1 || blZ < 1 || blZ >= footD - 1;
  if (isGarden) {
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS, varyColor('#55bb66', wx, h + 1, wz));
    // Hedge at edge
    if (onEdge) {
      push((bX + lx) * VS, (h + 2) * VS, (bZ + lz) * VS, varyColor('#337744', wx, h + 2, wz));
    }
    trackH(lx, lz, h + (onEdge ? 2 : 1));
    return;
  }

  // Main building (inner)
  const innerEdge = blX === 1 || blX === footW - 2 || blZ === 1 || blZ === footD - 2;
  for (let by = 1; by <= bh; by++) {
    if (!innerEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#aa5533', wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by === 1 && blZ === 1 && blX === Math.floor(footW / 2)) {
      color = varyColor('#886644', wx, h + by, wz, 3, 0.04, 0.05); // door
    } else if (innerEdge && by % 2 === 0) {
      color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06); // windows
    } else {
      color = varyColor('#eeddcc', wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Peaked roof
  if (innerEdge) {
    const midX = Math.floor(footW / 2);
    const dist = Math.abs(blX - midX);
    const roofExtra = Math.max(0, 2 - dist);
    for (let ry = 1; ry <= roofExtra; ry++) {
      push((bX + lx) * VS, (h + bh + ry) * VS, (bZ + lz) * VS,
        varyColor('#aa5533', wx, h + bh + ry, wz, 4, 0.04, 0.06));
    }
    trackH(lx, lz, h + bh + roofExtra);
  } else {
    trackH(lx, lz, h + bh);
  }
}
