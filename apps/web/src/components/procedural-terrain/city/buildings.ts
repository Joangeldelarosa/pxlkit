/* ═══════════════════════════════════════════════════════════════
 *  City Building Generators — voxel-by-voxel building construction
 *
 *  Each function receives the push() helper and constructs
 *  the building column by column. This keeps the main chunk
 *  generator clean and lets us add new building types easily.
 * ═══════════════════════════════════════════════════════════════ */

import type { BuildingType } from '../types';
import { VOXEL_SIZE } from '../constants';
import { varyColor, hashCoord } from '../utils/color';
import { getWallPalette, getRoofColor } from './layout';

type PushFn = (px: number, py: number, pz: number, hex: string) => void;
type TrackFn = (lx: number, lz: number, h: number) => void;
type PushWinFn = (px: number, py: number, pz: number) => void;

/** Flags indicating which building faces are exposed due to biome boundaries.
 *  When true, the face must render a wall even if the column isn't at the
 *  footprint edge — this closes holes where the city biome ends mid-building. */
interface ForceEdge {
  xNeg: boolean;  // −X face exposed
  xPos: boolean;  // +X face exposed
  zNeg: boolean;  // −Z face exposed
  zPos: boolean;  // +Z face exposed
}

interface BuildCtx {
  push: PushFn;
  trackH: TrackFn;
  pushWin: PushWinFn;  // register window position for night lighting
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
  /** Biome-boundary forced wall flags */
  forceEdge: ForceEdge;
}

const VS = VOXEL_SIZE;

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
    case 'castle':         return genCastle(ctx);
    case 'apartment':      return genApartment(ctx);
    case 'hotel':          return genHotel(ctx);
    case 'gas_station':    return genGasStation(ctx);
    case 'restaurant':     return genRestaurant(ctx);
    case 'fire_station':   return genFireStation(ctx);
    case 'library':        return genLibrary(ctx);
    case 'skyscraper_twin':    return genSkyscraperTwin(ctx);
    case 'skyscraper_stepped': return genSkyscraperStepped(ctx);
    case 'tower_telecom':  return genTelecomTower(ctx);
    /* ── New building generators (v2) ── */
    case 'condo':              return genCondo(ctx);
    case 'townhouse':          return genTownhouse(ctx);
    case 'cinema':             return genCinema(ctx);
    case 'police_station':     return genPoliceStation(ctx);
    case 'museum':             return genMuseum(ctx);
    case 'convention_center':  return genConventionCenter(ctx);
    case 'supermarket':        return genSupermarket(ctx);
    case 'gym':                return genGym(ctx);
    case 'bank':               return genBank(ctx);
    case 'data_center':        return genDataCenter(ctx);
    case 'greenhouse':         return genGreenhouse(ctx);
    case 'water_tower':        return genWaterTower(ctx);
    case 'radio_station':      return genRadioStation(ctx);
    case 'rooftop_garden':     return genRooftopGarden(ctx);
    case 'mixed_use':          return genMixedUse(ctx);
    case 'loft_building':      return genLoftBuilding(ctx);
    case 'penthouse_tower':    return genPenthouseTower(ctx);
    case 'market_hall':        return genMarketHall(ctx);
    case 'transit_station':    return genTransitStation(ctx);
    case 'monument':           return genMonument(ctx);
    default:               return genStandardBuilding(ctx);
  }
}

/* ── Helpers ── */
function isEdge(x: number, z: number, w: number, d: number): boolean {
  return x === 0 || x === w - 1 || z === 0 || z === d - 1;
}

/**
 * Returns true if this column should render a wall.
 * A column is a wall if it is on the natural footprint edge OR if a biome
 * boundary forces the adjacent face to be exposed.
 *
 * Note: forced edges affect columns 1 step inside the boundary. This assumes
 * that building generators render walls on the outermost ring of footprint
 * columns (the `onEdge` pattern). All existing generators follow this convention.
 */
function isExposedWall(x: number, z: number, w: number, d: number, fe: ForceEdge): boolean {
  if (x === 0 || x === w - 1 || z === 0 || z === d - 1) return true;
  // Check forced edges: if this column is 1 step inside the boundary, the
  // missing neighbor makes it an effective edge.
  if (fe.xNeg && x === 1) return true;
  if (fe.xPos && x === w - 2) return true;
  if (fe.zNeg && z === 1) return true;
  if (fe.zPos && z === d - 2) return true;
  return false;
}

/* ═══════════════ STANDARD BUILDINGS ═══════════════ */
// Covers: skyscraper, office, office_tall, tower, house, shop
// Now with 5 facade styles determined by building lot hash

function genStandardBuilding(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bType, bh, forceEdge } = ctx;
  const walls = getWallPalette(bType);
  const wallBase = walls[0];
  const roofCol = getRoofColor(bType);
  const doorCol = '#886644';
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const isEdgeZ = blZ === 0 || blZ === footD - 1;
  const isEdgeX = blX === 0 || blX === footW - 1;

  // Facade style determined by building anchor hash (same for all columns of one building)
  const facadeHash = hashCoord(wx - blX, 0, wz - blZ);
  const facadeStyle = Math.floor(facadeHash * 5); // 0-4

  // Window color variants
  const windowColors = ['#aaddff', '#99ccee', '#bbddee', '#88bbdd', '#aaccdd'];
  const windowCol = windowColors[facadeStyle];

  // Window spacing pattern (varies by facade style)
  const winRowMod = facadeStyle === 2 ? 3 : 2;
  const winColOdd = facadeStyle >= 3; // use even columns instead of odd for windows

  // Accent/trim colors per style
  const trimColors = ['#99887a', '#8a9a7a', '#7a8a9a', '#9a8a8a', '#8a8a7a'];
  const trimCol = trimColors[facadeStyle];

  // Whether to add horizontal band / cornice
  const hasBand = facadeStyle === 1 || facadeStyle === 3;
  // Whether to add pilasters (vertical trim strips at corners)
  const hasPilasters = facadeStyle === 2 || facadeStyle === 4;

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue; // hollow interior
    let color: string;
    if (by === bh) {
      // Roof
      color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by === 1 && blZ === 0 && blX >= 1 && blX <= Math.min(2, footW - 2)) {
      // Door
      color = varyColor(doorCol, wx, h + by, wz, 3, 0.04, 0.05);
    } else if (hasBand && onEdge && (by === Math.floor(bh * 0.5) || by === bh - 1)) {
      // Horizontal trim band (cornice/belt course)
      color = varyColor(trimCol, wx, h + by, wz, 3, 0.03, 0.05);
    } else if (hasPilasters && onEdge && by > 1 && by < bh
               && ((isEdgeZ && (blX === 0 || blX === footW - 1 || blX === Math.floor(footW / 2)))
                || (isEdgeX && (blZ === 0 || blZ === footD - 1 || blZ === Math.floor(footD / 2))))) {
      // Pilaster columns at corners and center
      color = varyColor(trimCol, wx, h + by, wz, 4, 0.04, 0.06);
    } else if (onEdge && by > 1 && by < bh && by % winRowMod === 0) {
      // Window rows
      const isWindowCol = isEdgeZ
        ? (blX >= 1 && blX <= footW - 2 && (winColOdd ? blX % 2 === 0 : blX % 2 === 1))
        : (blZ >= 1 && blZ <= footD - 2 && (winColOdd ? blZ % 2 === 0 : blZ % 2 === 1));
      if (isWindowCol) {
        color = varyColor(windowCol, wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        // Use secondary wall color from palette if available
        const wallAlt = walls.length > 1 ? walls[1] : wallBase;
        color = varyColor(facadeStyle >= 3 ? wallAlt : wallBase, wx, h + by, wz, 5, 0.06, 0.07);
      }
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
      // Awning — color varies by facade
      const awningColors = ['#ee6644', '#4488cc', '#44aa66', '#dd8833', '#886644'];
      push((bX + lx) * VS, (h + 3) * VS, (bZ + lz - 1) * VS,
        varyColor(awningColors[facadeStyle], wx, h + 3, wz - 1, 5, 0.06, 0.06));
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
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const walls = getWallPalette('skyscraper_twin');
  const roofCol = getRoofColor('skyscraper_twin');
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

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
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
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
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
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

  /** Tier-level edge detection that respects both tier insets and biome boundaries.
   *  At the outermost tier (inset=0), forceEdge applies directly.
   *  At inner tiers, forceEdge shifts the detection inward by the same delta. */
  function isTierEdge(x: number, z: number, inset: number): boolean {
    // Natural tier edge
    if (!inRange(x, z, inset + 1)) return true;
    // Biome-forced edge (shifted by inset)
    if (forceEdge.xNeg && x === inset + 1) return true;
    if (forceEdge.xPos && x === footW - inset - 2) return true;
    if (forceEdge.zNeg && z === inset + 1) return true;
    if (forceEdge.zPos && z === footD - inset - 2) return true;
    return false;
  }

  let maxY = 0;
  // Tier 1 (full width)
  if (inRange(blX, blZ, inset1)) {
    const onEdgeT = isTierEdge(blX, blZ, inset1);
    for (let by = 1; by <= tier1; by++) {
      if (!onEdgeT && by < tier1) continue;
      let color: string;
      if (by === tier1) {
        color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
      } else if (onEdgeT && by > 1 && by % 2 === 0) {
        color = varyColor('#88aabb', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    maxY = tier1;
  }

  // Tier 2 (medium)
  if (inRange(blX, blZ, inset2)) {
    const onEdgeT = isTierEdge(blX, blZ, inset2);
    for (let by = tier1 + 1; by <= tier2; by++) {
      if (!onEdgeT && by < tier2) continue;
      let color: string;
      if (by === tier2) {
        color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
      } else if (onEdgeT && by % 2 === 0) {
        color = varyColor('#99bbdd', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    maxY = tier2;
  }

  // Tier 3 (small top)
  if (inRange(blX, blZ, inset3)) {
    const onEdgeT = isTierEdge(blX, blZ, inset3);
    for (let by = tier2 + 1; by <= tier3; by++) {
      if (!onEdgeT && by < tier3) continue;
      let color: string;
      if (by === tier3) {
        color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
      } else if (onEdgeT && by % 3 === 0) {
        color = varyColor('#aaccee', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    maxY = tier3;
  }

  trackH(lx, lz, h + maxY);
}

/* ═══════════════ TELECOM TOWER ═══════════════ */
function genTelecomTower(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const midX = Math.floor(footW / 2), midZ = Math.floor(footD / 2);
  const isTower = blX === midX && blZ === midZ;
  const isBase = Math.abs(blX - midX) <= 1 && Math.abs(blZ - midZ) <= 1;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

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
    // Ground - concrete pad (add small wall at biome boundary)
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
      varyColor('#999999', wx, h + 1, wz, 2, 0.03, 0.04));
    if (onEdge) {
      // Small perimeter wall at biome boundary to close any gaps
      push((bX + lx) * VS, (h + 2) * VS, (bZ + lz) * VS,
        varyColor('#888888', wx, h + 2, wz, 2, 0.03, 0.04));
      trackH(lx, lz, h + 2);
    } else {
      trackH(lx, lz, h + 1);
    }
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
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ } = ctx;
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
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

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
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
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
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

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
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
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
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('school');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#cc9944', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (onEdge && by % 2 === 0) {
      // Windows (large)
      const isWin = blX >= 1 && blX <= footW - 2 && blX % 2 === 0;
      if (isWin) {
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 4, 0.04, 0.06);
      }
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
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

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
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const isInner = blX >= 2 && blX < footW - 2 && blZ >= 2 && blZ < footD - 2;
  const onOuterEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

  if (isInner) {
    // Field
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS, varyColor('#44bb55', wx, h + 1, wz, 3, 0.04, 0.06));
    trackH(lx, lz, h + 1);
  } else {
    // Stadium seating — rises toward edges
    const distFromEdge = Math.min(blX, footW - 1 - blX, blZ, footD - 1 - blZ);
    const seatH = Math.max(1, bh - distFromEdge);
    for (let by = 1; by <= seatH; by++) {
      // Force fill wall voxels at biome boundary even for interior seating columns
      if (!onOuterEdge && by < seatH && distFromEdge > 0) continue;
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
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#bb7744', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (by <= 2 && blZ === 0 && blX >= 2 && blX < footW - 2) {
      // Glass entrance
      color = varyColor('#88ccee', wx, h + by, wz, 2, 0.04, 0.05);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else if (onEdge && by % 2 === 0) {
      // Alternating glass/wall
      if (blX % 2 === 0) {
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor('#ccbbaa', wx, h + by, wz, 4, 0.04, 0.06);
      }
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
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

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

/* ═══════════════ MANSION (improved — larger, more detailed) ═══════════════ */
function genMansion(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

  // Style variations based on lot position
  const style = Math.abs(ctx.wx * 3 + ctx.wz * 7) % 4;
  const wallPalette = [
    ['#eeddcc', '#ddccbb'], // cream
    ['#d4c8a8', '#c4b898'], // sandstone
    ['#ccbbaa', '#bbaa99'], // stone grey
    ['#f0e0d0', '#e0d0c0'], // warm white
  ][style];
  const roofC = ['#aa5533', '#8B4513', '#6B3410', '#884422'][style];
  const trimC = ['#ccbb99', '#bbaa88', '#aa9977', '#ddcc99'][style];

  // Garden area (outer 2 rings for large footprints)
  const gardenRing = footW > 10 ? 2 : 1;
  const isGarden = blX < gardenRing || blX >= footW - gardenRing || blZ < gardenRing || blZ >= footD - gardenRing;

  if (isGarden) {
    // Decorative garden with paths, hedges, flowers
    const isPath = (blX === gardenRing - 1 && blZ >= gardenRing && blZ < footD - gardenRing) ||
                   (blZ === gardenRing - 1 && blX >= gardenRing && blX < footW - gardenRing);
    if (isPath) {
      push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS, varyColor('#bbaa88', wx, h + 1, wz, 2, 0.03, 0.04));
    } else {
      push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS, varyColor('#55bb66', wx, h + 1, wz));
    }
    // Hedge at outer edge
    if (onEdge) {
      push((bX + lx) * VS, (h + 2) * VS, (bZ + lz) * VS, varyColor('#337744', wx, h + 2, wz));
      // Gate pillars at entrance
      if (blZ === 0 && (blX === Math.floor(footW / 2) - 1 || blX === Math.floor(footW / 2) + 1)) {
        push((bX + lx) * VS, (h + 3) * VS, (bZ + lz) * VS, varyColor('#aaaaaa', wx, h + 3, wz));
        push((bX + lx) * VS, (h + 4) * VS, (bZ + lz) * VS, varyColor('#ffdd44', wx, h + 4, wz)); // lantern
      }
    }
    // Fountain in large garden center
    if (footW > 10 && blX === 0 && blZ === Math.floor(footD / 2)) {
      push((bX + lx) * VS, (h + 2) * VS, (bZ + lz) * VS, '#4488cc'); // water
      push((bX + lx) * VS, (h + 3) * VS, (bZ + lz) * VS, '#66aadd'); // spout
    }
    trackH(lx, lz, h + (onEdge ? 2 : 1));
    return;
  }

  // Main building (inner)
  const innerEdge = blX === gardenRing || blX === footW - gardenRing - 1 ||
                    blZ === gardenRing || blZ === footD - gardenRing - 1;

  for (let by = 1; by <= bh; by++) {
    if (!innerEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor(roofC, wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by === 1 && blZ === gardenRing && blX === Math.floor(footW / 2)) {
      color = varyColor('#664422', wx, h + by, wz, 3, 0.04, 0.05); // door
    } else if (innerEdge && by > 1 && by < bh) {
      // Windows with decorative trim on alternating columns
      const isWinRow = by % 2 === 0;
      const isWinCol = (blX + blZ) % 2 === 0;
      if (isWinRow && isWinCol) {
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else if (by === bh - 1) {
        color = varyColor(trimC, wx, h + by, wz, 3, 0.03, 0.05); // cornice
      } else {
        color = varyColor(wallPalette[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
    } else {
      color = varyColor(wallPalette[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Peaked roof with dormers
  if (innerEdge) {
    const midX = Math.floor(footW / 2);
    const dist = Math.abs(blX - midX);
    const maxRoof = Math.min(3, Math.floor(footW / 4));
    const roofExtra = Math.max(0, maxRoof - dist);
    for (let ry = 1; ry <= roofExtra; ry++) {
      push((bX + lx) * VS, (h + bh + ry) * VS, (bZ + lz) * VS,
        varyColor(roofC, wx, h + bh + ry, wz, 4, 0.04, 0.06));
    }
    // Dormer windows on large roofs
    if (roofExtra >= 2 && (blZ === gardenRing || blZ === footD - gardenRing - 1) && dist < 2) {
      pushWin((bX + lx) * VS, (h + bh + 1) * VS, (bZ + lz) * VS);
    }
    // Chimney
    if (blX === footW - gardenRing - 2 && blZ === footD - gardenRing - 2) {
      for (let cy = roofExtra + 1; cy <= roofExtra + 3; cy++) {
        push((bX + lx) * VS, (h + bh + cy) * VS, (bZ + lz) * VS,
          varyColor('#776655', wx, h + bh + cy, wz));
      }
      trackH(lx, lz, h + bh + roofExtra + 3);
    } else {
      trackH(lx, lz, h + bh + roofExtra);
    }
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ CASTLE ═══════════════ */
function genCastle(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('castle');
  const roofCol = getRoofColor('castle');

  // Corner tower detection (2×2 corners)
  const isCornerTower = (blX < 2 || blX >= footW - 2) && (blZ < 2 || blZ >= footD - 2);
  // Gatehouse (front center)
  const midX = Math.floor(footW / 2);
  const isGate = blZ < 2 && Math.abs(blX - midX) <= 1;
  // Wall walk (outer ring)
  const isOuterWall = onEdge || blX === 1 || blX === footW - 2 || blZ === 1 || blZ === footD - 2;
  // Inner courtyard
  const isCourtyard = blX >= 3 && blX < footW - 3 && blZ >= 3 && blZ < footD - 3;
  // Keep (central tall structure)
  const keepInset = Math.max(3, Math.floor(footW * 0.25));
  const isKeep = blX >= keepInset && blX < footW - keepInset &&
                 blZ >= keepInset && blZ < footD - keepInset;

  const towerH = bh + 4;
  const wallH = bh;
  const keepH = bh + 2;

  if (isCornerTower) {
    // Corner towers — taller than walls with crenellations
    for (let by = 1; by <= towerH; by++) {
      let color: string;
      if (by === towerH) {
        // Crenellations (battlements)
        const isMerlon = (blX + blZ) % 2 === 0;
        if (isMerlon) {
          color = varyColor(walls[0], wx, h + by, wz, 4, 0.04, 0.06);
        } else continue; // gap in battlements
      } else if (by > 2 && by < towerH - 1 && by % 3 === 0 && isEdge(blX < 2 ? 0 : 1, blZ < 2 ? 0 : 1, 2, 2)) {
        // Arrow slit windows
        color = varyColor('#334455', wx, h + by, wz, 2, 0.03, 0.04);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[by > wallH ? 1 : 0], wx, h + by, wz, 5, 0.06, 0.07);
      }
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    // Conical tower roof
    const tcx = blX < 2 ? 0.5 : footW - 1.5;
    const tcz = blZ < 2 ? 0.5 : footD - 1.5;
    const dist = Math.sqrt((blX - tcx) ** 2 + (blZ - tcz) ** 2);
    if (dist < 1.8) {
      for (let ry = 1; ry <= 3 - Math.floor(dist); ry++) {
        push((bX + lx) * VS, (h + towerH + ry) * VS, (bZ + lz) * VS,
          varyColor(roofCol, wx, h + towerH + ry, wz, 3, 0.03, 0.05));
      }
      trackH(lx, lz, h + towerH + 3);
    } else {
      trackH(lx, lz, h + towerH);
    }
  } else if (isGate) {
    // Gatehouse with archway
    const gateHeight = Math.min(3, wallH - 1);
    for (let by = 1; by <= wallH + 2; by++) {
      if (by <= gateHeight && blX === midX) {
        // Archway opening
        continue;
      }
      const color = by === wallH + 2
        ? (((blX + blZ) % 2 === 0) ? varyColor(walls[0], wx, h + by, wz, 4, 0.04, 0.06) : undefined)
        : varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      if (color) push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    // Portcullis hint
    if (blX === midX && blZ === 0) {
      push((bX + lx) * VS, (h + gateHeight + 1) * VS, (bZ + lz) * VS,
        varyColor('#555555', wx, h + gateHeight + 1, wz, 2, 0.02, 0.04));
    }
    trackH(lx, lz, h + wallH + 2);
  } else if (isKeep) {
    // Central keep — tallest structure
    const keepEdge = blX === keepInset || blX === footW - keepInset - 1 ||
                     blZ === keepInset || blZ === footD - keepInset - 1;
    for (let by = 1; by <= keepH; by++) {
      if (!keepEdge && by < keepH) continue;
      let color: string;
      if (by === keepH) {
        // Crenellations
        const isMerlon = (blX + blZ) % 2 === 0;
        color = isMerlon ? varyColor(walls[2], wx, h + by, wz, 4, 0.04, 0.06) : varyColor(walls[0], wx, h + by, wz, 4, 0.04, 0.06);
      } else if (keepEdge && by > 2 && by % 2 === 0) {
        // Windows
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[2], wx, h + by, wz, 5, 0.06, 0.07);
      }
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    trackH(lx, lz, h + keepH);
  } else if (isOuterWall) {
    // Castle walls with battlements
    for (let by = 1; by <= wallH; by++) {
      let color: string;
      if (by === wallH) {
        // Crenellations
        const isMerlon = (blX + blZ) % 2 === 0;
        color = isMerlon ? varyColor(walls[0], wx, h + by, wz, 4, 0.04, 0.06) : varyColor(walls[1], wx, h + by, wz, 3, 0.04, 0.06);
      } else if (by > 2 && by % 4 === 0 && onEdge) {
        // Arrow slits
        color = varyColor('#334455', wx, h + by, wz, 2, 0.03, 0.04);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    trackH(lx, lz, h + wallH);
  } else if (isCourtyard) {
    // Courtyard ground — cobblestone
    const isTile = (blX + blZ) % 2 === 0;
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
      varyColor(isTile ? '#999988' : '#888877', wx, h + 1, wz, 2, 0.03, 0.04));
    // Well in center
    const cMidX = Math.floor(footW / 2), cMidZ = Math.floor(footD / 2);
    if (Math.abs(blX - cMidX) <= 1 && Math.abs(blZ - cMidZ) <= 1) {
      if (blX === cMidX && blZ === cMidZ) {
        push((bX + lx) * VS, (h + 1.5) * VS, (bZ + lz) * VS, '#4488cc'); // water
      } else {
        push((bX + lx) * VS, (h + 2) * VS, (bZ + lz) * VS, varyColor('#888888', wx, h + 2, wz));
      }
    }
    trackH(lx, lz, h + 1);
  } else {
    // In-between space (between walls and courtyard)
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
      varyColor('#777766', wx, h + 1, wz, 2, 0.03, 0.04));
    trackH(lx, lz, h + 1);
  }
}

/* ═══════════════ APARTMENT ═══════════════ */
function genApartment(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('apartment');
  const roofCol = getRoofColor('apartment');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by === 1 && blZ === 0 && blX >= 1 && blX <= 2) {
      // Entrance door
      color = varyColor('#664422', wx, h + by, wz, 3, 0.04, 0.05);
    } else if (onEdge && by > 1 && by < bh) {
      // Window grid — every 2 floors, alternating columns
      const isWinFloor = by % 2 === 0;
      const isWinCol = (blZ === 0 || blZ === footD - 1)
        ? (blX >= 1 && blX <= footW - 2 && blX % 2 === 0)
        : (blZ >= 1 && blZ <= footD - 2 && blZ % 2 === 0);
      if (isWinFloor && isWinCol) {
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Balcony ledges every 3 floors on front face
  if (blZ === 0 && blX >= 1 && blX <= footW - 2 && bh > 4) {
    for (let fl = 3; fl < bh; fl += 3) {
      push((bX + lx) * VS, (h + fl) * VS, (bZ + lz - 1) * VS,
        varyColor('#999999', wx, h + fl, wz - 1, 2, 0.03, 0.04));
    }
  }

  // AC units on side walls (every 4 floors)
  if ((blX === 0 || blX === footW - 1) && blZ >= 1 && blZ < footD - 1 && blZ % 3 === 0) {
    for (let fl = 4; fl < bh; fl += 4) {
      const acX = blX === 0 ? -1 : 1;
      push((bX + lx + acX) * VS, (h + fl) * VS, (bZ + lz) * VS,
        varyColor('#aaaaaa', wx + acX, h + fl, wz, 2, 0.02, 0.04));
    }
  }

  trackH(lx, lz, h + bh);
}

/* ═══════════════ HOTEL ═══════════════ */
function genHotel(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('hotel');
  const roofCol = getRoofColor('hotel');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by <= 2 && blZ === 0 && blX >= 1 && blX <= Math.min(3, footW - 2)) {
      // Grand entrance — glass doors
      color = varyColor('#88ccee', wx, h + by, wz, 2, 0.04, 0.05);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else if (onEdge && by > 2 && by < bh && by % 2 === 0) {
      // Uniform window grid
      const isWinCol = (blZ === 0 || blZ === footD - 1)
        ? (blX >= 1 && blX <= footW - 2)
        : (blZ >= 1 && blZ <= footD - 2);
      if (isWinCol) {
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
    } else if (by === 1 && onEdge) {
      // Ground floor — lobby trim
      color = varyColor('#ddccaa', wx, h + by, wz, 3, 0.04, 0.06);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Rooftop pool at center
  if (bh > 6) {
    const midX = Math.floor(footW / 2), midZ = Math.floor(footD / 2);
    if (Math.abs(blX - midX) <= 1 && Math.abs(blZ - midZ) <= 1) {
      push((bX + lx) * VS, (h + bh + 0.1) * VS, (bZ + lz) * VS, '#4488cc');
    }
  }

  // Entrance canopy
  if (blZ === 0 && blX >= 0 && blX <= Math.min(4, footW - 1)) {
    push((bX + lx) * VS, (h + 3) * VS, (bZ + lz - 1) * VS,
      varyColor('#bbaa88', wx, h + 3, wz - 1, 2, 0.03, 0.04));
  }

  trackH(lx, lz, h + bh);
}

/* ═══════════════ GAS STATION ═══════════════ */
function genGasStation(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

  // Small booth in corner
  const isShop = blX >= footW - 3 && blZ >= footD - 3;
  // Canopy area (fuel pumps)
  const isCanopy = blX < footW - 3;

  if (isShop) {
    for (let by = 1; by <= bh; by++) {
      const shopEdge = (blX === footW - 3 || blX === footW - 1 || blZ === footD - 3 || blZ === footD - 1);
      if (!shopEdge && by < bh) continue;
      let color: string;
      if (by === bh) {
        color = varyColor('#888888', wx, h + by, wz, 3, 0.03, 0.05);
      } else if (by === 1 && blZ === footD - 3 && blX === footW - 2) {
        color = varyColor('#88ccee', wx, h + by, wz, 2, 0.04, 0.05); // door
      } else {
        color = varyColor('#dddddd', wx, h + by, wz, 4, 0.04, 0.06);
      }
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    trackH(lx, lz, h + bh);
  } else if (isCanopy) {
    // Concrete ground
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
      varyColor('#aaaaaa', wx, h + 1, wz, 2, 0.02, 0.04));

    // Canopy roof on pillars
    const isPillar = (blX === 0 || blX === footW - 4) && (blZ === 0 || blZ === footD - 1);
    if (isPillar) {
      for (let py = 2; py <= bh + 1; py++) {
        push((bX + lx) * VS, (h + py) * VS, (bZ + lz) * VS,
          varyColor('#888888', wx, h + py, wz, 2, 0.02, 0.04));
      }
    }
    // Canopy slab at top
    push((bX + lx) * VS, (h + bh + 2) * VS, (bZ + lz) * VS,
      varyColor('#eeeeee', wx, h + bh + 2, wz, 2, 0.02, 0.03));

    // Fuel pumps (3 per row, centered)
    if (blZ === Math.floor(footD / 2) && blX >= 1 && blX <= footW - 5 && blX % 2 === 1) {
      push((bX + lx) * VS, (h + 2) * VS, (bZ + lz) * VS, '#dd4444');
      push((bX + lx) * VS, (h + 3) * VS, (bZ + lz) * VS, '#eeeeee');
    }
    trackH(lx, lz, h + bh + 2);
  } else {
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
      varyColor(onEdge ? '#999999' : '#aaaaaa', wx, h + 1, wz, 2, 0.02, 0.04));
    trackH(lx, lz, h + 1);
  }
}

/* ═══════════════ RESTAURANT ═══════════════ */
function genRestaurant(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('restaurant');
  const roofCol = getRoofColor('restaurant');
  // Style variation based on position
  const style = Math.abs(wx * 3 + wz * 7) % 3;
  const accentColor = ['#ee4444', '#44aa44', '#4488cc'][style];

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by <= 2 && blZ === 0 && blX >= 1 && blX <= Math.min(2, footW - 2)) {
      // Glass front windows
      color = varyColor('#88ccee', wx, h + by, wz, 2, 0.04, 0.05);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else if (by === bh - 1 && onEdge) {
      // Color accent band near top
      color = varyColor(accentColor, wx, h + by, wz, 4, 0.04, 0.06);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Awning on front
  if (blZ === 0) {
    push((bX + lx) * VS, (h + bh) * VS, (bZ + lz - 1) * VS,
      varyColor(accentColor, wx, h + bh, wz - 1, 3, 0.04, 0.06));
  }

  // Outdoor seating area
  if (blZ === footD - 1 && blX >= 1 && blX <= footW - 2 && blX % 2 === 0) {
    push((bX + lx) * VS, (h + 2) * VS, (bZ + lz + 1) * VS,
      varyColor('#885533', wx, h + 2, wz + 1, 3, 0.04, 0.05)); // table
  }

  // Rooftop signage
  if (blX === Math.floor(footW / 2) && blZ === 0) {
    push((bX + lx) * VS, (h + bh + 1) * VS, (bZ + lz) * VS,
      varyColor(accentColor, wx, h + bh + 1, wz, 2, 0.03, 0.05));
    trackH(lx, lz, h + bh + 1);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ FIRE STATION ═══════════════ */
function genFireStation(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('fire_station');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#882222', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (by <= 3 && blZ === 0 && blX >= 1 && blX <= Math.min(footW - 2, 4)) {
      // Large garage bay doors
      color = varyColor('#555555', wx, h + by, wz, 2, 0.02, 0.04);
    } else if (onEdge && by > 3 && by % 2 === 0) {
      // Windows above bay doors
      const isWin = (blZ === 0 || blZ === footD - 1)
        ? (blX >= 1 && blX < footW - 1 && blX % 2 === 1)
        : (blZ >= 1 && blZ < footD - 1 && blZ % 2 === 1);
      if (isWin) {
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Hose tower at back corner
  if (blX === footW - 1 && blZ === footD - 1) {
    for (let ty = 1; ty <= 3; ty++) {
      push((bX + lx) * VS, (h + bh + ty) * VS, (bZ + lz) * VS,
        varyColor('#777777', wx, h + bh + ty, wz, 2, 0.02, 0.04));
    }
    trackH(lx, lz, h + bh + 3);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ LIBRARY ═══════════════ */
function genLibrary(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('library');
  const roofCol = getRoofColor('library');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by <= 2 && blZ === 0 && blX === Math.floor(footW / 2)) {
      // Grand entrance with columns
      color = varyColor('#dddddd', wx, h + by, wz, 2, 0.02, 0.04);
    } else if (onEdge && by > 1 && by < bh) {
      // Tall arched windows (every column on sides)
      const isWinRow = by > 1 && by < bh - 1;
      const isWinCol = (blZ === 0 || blZ === footD - 1)
        ? (blX >= 1 && blX <= footW - 2 && blX % 2 === 1)
        : (blZ >= 1 && blZ <= footD - 2 && blZ % 2 === 1);
      if (isWinRow && isWinCol) {
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }

  // Front columns (pillars)
  if (blZ === 0 && (blX === 1 || blX === footW - 2)) {
    for (let py = 1; py <= bh; py++) {
      push((bX + lx) * VS, (h + py) * VS, (bZ + lz - 1) * VS,
        varyColor('#cccccc', wx, h + py, wz - 1, 2, 0.02, 0.04));
    }
  }

  // Peaked pediment on front
  if (onEdge && blZ === 0) {
    const midX = Math.floor(footW / 2);
    const dist = Math.abs(blX - midX);
    const peakH = Math.max(0, 2 - dist);
    for (let ry = 1; ry <= peakH; ry++) {
      push((bX + lx) * VS, (h + bh + ry) * VS, (bZ + lz) * VS,
        varyColor('#ccbbaa', wx, h + bh + ry, wz, 3, 0.03, 0.05));
    }
    trackH(lx, lz, h + bh + peakH);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════════════════════════════════════════════════════
 *  NEW BUILDING GENERATORS (v2) — 20 additional building types
 *  for richer, more varied cityscapes
 * ═══════════════════════════════════════════════════════════════ */

/* ═══════════════ CONDO (tall residential, balconies every 3 floors) ═══════════════ */
function genCondo(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('condo');
  const roofCol = getRoofColor('condo');
  const style = Math.abs((wx - blX) * 3 + (wz - blZ) * 7) % 3;
  const accentBand = ['#aa9988', '#88aaaa', '#aaaa88'][style];

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor(roofCol, wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by === 1 && blZ === 0 && blX >= 1 && blX <= 2) {
      color = varyColor('#88ccee', wx, h + by, wz, 2, 0.04, 0.05);
    } else if (onEdge && by > 1 && by < bh && by % 2 === 0) {
      const isWinCol = (blZ === 0 || blZ === footD - 1) ? blX % 2 === 0 : blZ % 2 === 0;
      if (isWinCol) {
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
    } else if (onEdge && by % 3 === 0) {
      color = varyColor(accentBand, wx, h + by, wz, 3, 0.03, 0.05);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // Balconies on front every 3 floors
  if (blZ === 0 && blX >= 1 && blX <= footW - 2 && bh > 4) {
    for (let fl = 3; fl < bh; fl += 3) {
      push((bX + lx) * VS, (h + fl) * VS, (bZ + lz - 1) * VS,
        varyColor('#aaaaaa', wx, h + fl, wz - 1, 2, 0.03, 0.04));
    }
  }
  trackH(lx, lz, h + bh);
}

/* ═══════════════ TOWNHOUSE (row of narrow units, peaked roofs) ═══════════════ */
function genTownhouse(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const unitIdx = Math.floor(blX / 3);
  const wallStyles = ['#cc9966', '#ddaa77', '#bb8855', '#ccbb88'];
  const wallC = wallStyles[unitIdx % wallStyles.length];
  const roofC = getRoofColor('townhouse');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor(roofC, wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by === 1 && blZ === 0 && blX % 3 === 1) {
      color = varyColor('#664422', wx, h + by, wz, 3, 0.04, 0.05);
    } else if (onEdge && by === 2 && blZ === 0 && blX % 3 === 1) {
      color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else if (onEdge && blX % 3 === 2 && by > 1 && by < bh) {
      color = varyColor('#887766', wx, h + by, wz, 3, 0.04, 0.06);
    } else {
      color = varyColor(wallC, wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // Small peaked roof per unit
  if (onEdge) {
    const unitMid = (unitIdx * 3) + 1;
    const dist = Math.abs(blX - unitMid);
    const roofExtra = Math.max(0, 1 - dist);
    for (let ry = 1; ry <= roofExtra; ry++) {
      push((bX + lx) * VS, (h + bh + ry) * VS, (bZ + lz) * VS,
        varyColor(roofC, wx, h + bh + ry, wz, 4, 0.04, 0.06));
    }
    trackH(lx, lz, h + bh + roofExtra);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ CINEMA (dark exterior, marquee sign) ═══════════════ */
function genCinema(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('cinema');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#333344', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (by <= 2 && blZ === 0 && blX >= 1 && blX <= footW - 2) {
      color = varyColor('#88ccee', wx, h + by, wz, 2, 0.04, 0.05);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // Marquee sign
  if (blZ === 0) {
    const marqueeColors = ['#ff4444', '#ffdd44', '#44aaff'];
    const mc = marqueeColors[(blX + Math.floor(wx / 3)) % 3];
    push((bX + lx) * VS, (h + bh + 1) * VS, (bZ + lz - 1) * VS, varyColor(mc, wx, h + bh + 1, wz, 3, 0.04, 0.06));
    trackH(lx, lz, h + bh + 1);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ POLICE STATION (blue-trimmed civic building) ═══════════════ */
function genPoliceStation(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('police_station');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#334488', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (by <= 2 && blZ === 0 && blX >= 1 && blX <= 3) {
      color = varyColor('#555555', wx, h + by, wz, 2, 0.02, 0.04);
    } else if (onEdge && by > 2 && by % 2 === 0) {
      const isWin = (blZ === 0 || blZ === footD - 1) ? blX % 2 === 1 : blZ % 2 === 1;
      if (isWin) {
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
    } else if (onEdge && by === 1) {
      color = varyColor('#3355aa', wx, h + by, wz, 3, 0.04, 0.06);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // Beacon light on roof
  if (blX === Math.floor(footW / 2) && blZ === Math.floor(footD / 2)) {
    push((bX + lx) * VS, (h + bh + 1) * VS, (bZ + lz) * VS, '#4466ff');
    trackH(lx, lz, h + bh + 1);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ MUSEUM (grand classical facade, columns) ═══════════════ */
function genMuseum(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('museum');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#aa9977', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (onEdge && by > 1 && by < bh - 1 && blX % 3 === 1) {
      color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else if (onEdge && by === bh - 1) {
      color = varyColor('#ccbb99', wx, h + by, wz, 3, 0.03, 0.05);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // Front columns
  if (blZ === 0 && blX >= 1 && blX <= footW - 2 && blX % 2 === 0) {
    for (let py = 1; py <= bh; py++) {
      push((bX + lx) * VS, (h + py) * VS, (bZ + lz - 1) * VS,
        varyColor('#ddddcc', wx, h + py, wz - 1, 2, 0.02, 0.04));
    }
  }
  // Pediment
  if (onEdge && blZ === 0) {
    const midX = Math.floor(footW / 2);
    const dist = Math.abs(blX - midX);
    const peakH = Math.max(0, 3 - dist);
    for (let ry = 1; ry <= peakH; ry++) {
      push((bX + lx) * VS, (h + bh + ry) * VS, (bZ + lz) * VS,
        varyColor('#ddddcc', wx, h + bh + ry, wz, 3, 0.03, 0.05));
    }
    trackH(lx, lz, h + bh + peakH);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ CONVENTION CENTER (wide glass facade) ═══════════════ */
function genConventionCenter(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      const centerDist = Math.abs(blX - footW / 2) / (footW / 2);
      color = varyColor(centerDist < 0.5 ? '#aabbcc' : '#99aabb', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (onEdge && by >= 2) {
      color = varyColor('#88bbdd', wx, h + by, wz, 3, 0.05, 0.06);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else {
      color = varyColor('#bbccdd', wx, h + by, wz, 4, 0.04, 0.06);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  trackH(lx, lz, h + bh);
}

/* ═══════════════ SUPERMARKET (flat commercial box, signage) ═══════════════ */
function genSupermarket(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('supermarket');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#998866', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (by <= 2 && blZ === 0 && blX >= 2 && blX < footW - 2) {
      color = varyColor('#88ccee', wx, h + by, wz, 2, 0.04, 0.05);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // Brand color sign strip
  const signColor = ['#dd3333', '#3388dd', '#33aa33'][Math.abs(wx - blX) % 3];
  if (blZ === 0) {
    push((bX + lx) * VS, (h + bh + 1) * VS, (bZ + lz) * VS,
      varyColor(signColor, wx, h + bh + 1, wz, 3, 0.04, 0.06));
    trackH(lx, lz, h + bh + 1);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ GYM (bright accent, large ground floor windows) ═══════════════ */
function genGym(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('gym');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#aa5522', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (by <= 2 && onEdge && blX >= 1 && blX <= footW - 2) {
      color = varyColor('#88ccee', wx, h + by, wz, 2, 0.04, 0.05);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else if (onEdge && by === bh - 1) {
      color = varyColor('#ee8844', wx, h + by, wz, 4, 0.04, 0.06);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  trackH(lx, lz, h + bh);
}

/* ═══════════════ BANK (stone facade, columns, vault look) ═══════════════ */
function genBank(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('bank');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#777788', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (by === 1 && blZ === 0 && blX === Math.floor(footW / 2)) {
      color = varyColor('#886644', wx, h + by, wz, 3, 0.04, 0.05);
    } else if (onEdge && by > 2 && by < bh - 1 && blX % 2 === 0) {
      color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else if (onEdge && (by === 1 || by === bh - 1)) {
      color = varyColor('#999aab', wx, h + by, wz, 3, 0.03, 0.05);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // Front columns
  if (blZ === 0 && (blX === 1 || blX === footW - 2)) {
    for (let py = 1; py <= bh; py++) {
      push((bX + lx) * VS, (h + py) * VS, (bZ + lz - 1) * VS,
        varyColor('#cccccc', wx, h + py, wz - 1, 2, 0.02, 0.04));
    }
  }
  trackH(lx, lz, h + bh);
}

/* ═══════════════ DATA CENTER (no windows, ventilation units) ═══════════════ */
function genDataCenter(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('data_center');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#445555', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (by <= 2 && blZ === 0 && blX >= 1 && blX <= 2) {
      color = varyColor('#555555', wx, h + by, wz, 2, 0.02, 0.04);
    } else if (onEdge && by > 1 && by < bh && blX % 4 === 0) {
      // Ventilation grilles (dark slits)
      color = varyColor('#334444', wx, h + by, wz, 2, 0.02, 0.04);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // AC units on roof
  if (blX % 3 === 1 && blZ % 3 === 1 && blX < footW - 1 && blZ < footD - 1) {
    push((bX + lx) * VS, (h + bh + 1) * VS, (bZ + lz) * VS,
      varyColor('#aaaaaa', wx, h + bh + 1, wz, 2, 0.02, 0.04));
    trackH(lx, lz, h + bh + 1);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ GREENHOUSE (translucent green glass panels) ═══════════════ */
function genGreenhouse(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#88cc88', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (onEdge) {
      // Glass panels — alternating green tints
      color = varyColor(blX % 2 === 0 ? '#88cc88' : '#77bb77', wx, h + by, wz, 4, 0.04, 0.06);
    } else {
      color = varyColor('#55aa55', wx, h + by, wz, 3, 0.04, 0.06);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // Plants inside (on ground level)
  if (!onEdge && blX > 0 && blX < footW - 1 && blZ > 0 && blZ < footD - 1) {
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
      varyColor('#44aa44', wx, h + 1, wz, 6, 0.06, 0.08));
  }
  trackH(lx, lz, h + bh);
}

/* ═══════════════ WATER TOWER (cylindrical tank on legs) ═══════════════ */
function genWaterTower(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const midX = Math.floor(footW / 2), midZ = Math.floor(footD / 2);
  const dist = Math.sqrt((blX - midX) ** 2 + (blZ - midZ) ** 2);
  const isLeg = dist < 1.5 && (blX === midX || blZ === midZ);
  const tankR = Math.max(2, Math.floor(footW * 0.4));
  const isTank = dist <= tankR;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const legH = Math.floor(bh * 0.6);
  const tankH = bh;

  if (isLeg) {
    // Support legs
    for (let by = 1; by <= legH; by++) {
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS,
        varyColor('#888888', wx, h + by, wz, 3, 0.03, 0.05));
    }
    trackH(lx, lz, h + legH);
  }
  if (isTank) {
    // Tank body
    const tankEdge = dist >= tankR - 0.5;
    for (let by = legH + 1; by <= tankH; by++) {
      if (!tankEdge && by < tankH) continue;
      const color = by === tankH
        ? varyColor('#777777', wx, h + by, wz, 3, 0.03, 0.05)
        : varyColor('#999999', wx, h + by, wz, 4, 0.04, 0.06);
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
    }
    trackH(lx, lz, h + tankH);
  } else if (!isLeg) {
    // Ground pad
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
      varyColor(onEdge ? '#777777' : '#888888', wx, h + 1, wz, 2, 0.02, 0.04));
    trackH(lx, lz, h + 1);
  }
}

/* ═══════════════ RADIO STATION (small building + tall antenna) ═══════════════ */
function genRadioStation(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('radio_station');
  const midX = Math.floor(footW / 2), midZ = Math.floor(footD / 2);

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS,
      varyColor(by === bh ? '#777777' : walls[0], wx, h + by, wz, 4, 0.04, 0.06));
  }
  // Tall antenna at center
  if (blX === midX && blZ === midZ) {
    for (let ay = 1; ay <= 8; ay++) {
      push((bX + lx) * VS, (h + bh + ay) * VS, (bZ + lz) * VS,
        varyColor('#aaaaaa', wx, h + bh + ay, wz, 2, 0.02, 0.04));
    }
    push((bX + lx) * VS, (h + bh + 9) * VS, (bZ + lz) * VS, '#ff2222');
    trackH(lx, lz, h + bh + 9);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ ROOFTOP GARDEN (green open lot with paths) ═══════════════ */
function genRooftopGarden(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD } = ctx;
  const isPath = blX === Math.floor(footW / 2) || blZ === Math.floor(footD / 2);
  if (isPath) {
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
      varyColor('#bbaa88', wx, h + 1, wz, 2, 0.03, 0.04));
  } else {
    push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
      varyColor('#55bb66', wx, h + 1, wz, 5, 0.06, 0.08));
    // Occasional flowers
    if ((blX + blZ) % 4 === 0) {
      const flowerColors = ['#ff6688', '#ffaa44', '#ff44aa', '#aaddff', '#ffff44'];
      push((bX + lx) * VS, (h + 2) * VS, (bZ + lz) * VS,
        varyColor(flowerColors[(blX * 3 + blZ) % flowerColors.length], wx, h + 2, wz, 6, 0.06, 0.08));
    }
  }
  // Benches
  if (blX === 1 && blZ === Math.floor(footD / 2) + 1) {
    push((bX + lx) * VS, (h + 2) * VS, (bZ + lz) * VS, varyColor('#885533', wx, h + 2, wz, 4, 0.05, 0.06));
  }
  trackH(lx, lz, h + 1);
}

/* ═══════════════ MIXED USE (shops on ground, apartments above) ═══════════════ */
function genMixedUse(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('mixed_use');
  const shopFloor = 2; // first 2 floors are shops

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#887766', wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by <= shopFloor && blZ === 0) {
      // Shop front — large glass
      color = varyColor('#88ccee', wx, h + by, wz, 2, 0.04, 0.05);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else if (by === shopFloor + 1 && onEdge) {
      // Accent band between shop and apartments
      color = varyColor('#887766', wx, h + by, wz, 3, 0.03, 0.05);
    } else if (onEdge && by > shopFloor && by % 2 === 0) {
      const isWin = (blZ === 0 || blZ === footD - 1) ? blX % 2 === 0 : blZ % 2 === 0;
      if (isWin) {
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // Awnings on shop front
  if (blZ === 0 && blX % 3 === 0 && blX < footW - 1) {
    const awningColors = ['#cc4444', '#44aa66', '#4488cc', '#ccaa44'];
    push((bX + lx) * VS, (h + shopFloor + 1) * VS, (bZ + lz - 1) * VS,
      varyColor(awningColors[blX % awningColors.length], wx, h + shopFloor + 1, wz - 1, 4, 0.04, 0.06));
  }
  trackH(lx, lz, h + bh);
}

/* ═══════════════ LOFT BUILDING (brick, industrial chic, fire escape) ═══════════════ */
function genLoftBuilding(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('loft_building');

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#774433', wx, h + by, wz, 4, 0.04, 0.06);
    } else if (onEdge && by > 1 && by < bh && by % 2 === 0) {
      // Large loft windows
      const isWin = (blZ === 0 || blZ === footD - 1) ? blX >= 1 && blX <= footW - 2 : blZ >= 1 && blZ <= footD - 2;
      if (isWin) {
        color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
        pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
      } else {
        color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
      }
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // Fire escape on side
  if (blX === footW - 1 && blZ >= 1 && blZ < footD - 1 && blZ % 2 === 0) {
    for (let fl = 2; fl < bh; fl += 2) {
      push((bX + lx + 1) * VS, (h + fl) * VS, (bZ + lz) * VS,
        varyColor('#555555', wx + 1, h + fl, wz, 2, 0.02, 0.04));
    }
  }
  trackH(lx, lz, h + bh);
}

/* ═══════════════ PENTHOUSE TOWER (luxury tall, glass-heavy, crown) ═══════════════ */
function genPenthouseTower(ctx: BuildCtx) {
  const { push, trackH, pushWin, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const walls = getWallPalette('penthouse_tower');

  // Top 3 floors are "penthouse" with different styling
  const penthouseStart = bh - 3;

  for (let by = 1; by <= bh; by++) {
    if (!onEdge && by < bh) continue;
    let color: string;
    if (by === bh) {
      color = varyColor('#556677', wx, h + by, wz, 4, 0.04, 0.06);
    } else if (by >= penthouseStart && onEdge) {
      // Penthouse: full glass
      color = varyColor('#88ccee', wx, h + by, wz, 3, 0.05, 0.06);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else if (onEdge && by > 1 && by % 2 === 0) {
      // Regular floor windows
      color = varyColor('#aaddff', wx, h + by, wz, 3, 0.05, 0.06);
      pushWin((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS);
    } else if (onEdge && by === penthouseStart - 1) {
      // Crown ledge
      color = varyColor('#ccccdd', wx, h + by, wz, 3, 0.03, 0.05);
    } else {
      color = varyColor(walls[0], wx, h + by, wz, 5, 0.06, 0.07);
    }
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS, color);
  }
  // Spire at center
  const midX = Math.floor(footW / 2), midZ = Math.floor(footD / 2);
  if (blX === midX && blZ === midZ) {
    for (let sy = 1; sy <= 3; sy++) {
      push((bX + lx) * VS, (h + bh + sy) * VS, (bZ + lz) * VS,
        varyColor('#aaaaaa', wx, h + bh + sy, wz, 2, 0.02, 0.04));
    }
    push((bX + lx) * VS, (h + bh + 4) * VS, (bZ + lz) * VS, '#ff4444');
    trackH(lx, lz, h + bh + 4);
  } else {
    trackH(lx, lz, h + bh);
  }
}

/* ═══════════════ MARKET HALL (open-air stalls with roof) ═══════════════ */
function genMarketHall(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const isPillar = (blX % 3 === 0 && blZ % 3 === 0);

  // Ground slab
  push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
    varyColor('#bbaa88', wx, h + 1, wz, 2, 0.03, 0.04));

  if (isPillar) {
    // Support pillars
    for (let py = 2; py <= bh; py++) {
      push((bX + lx) * VS, (h + py) * VS, (bZ + lz) * VS,
        varyColor('#887766', wx, h + py, wz, 3, 0.03, 0.05));
    }
  }
  // Roof slab
  push((bX + lx) * VS, (h + bh + 1) * VS, (bZ + lz) * VS,
    varyColor('#aa8844', wx, h + bh + 1, wz, 3, 0.03, 0.05));

  // Market stalls (colored awning blocks between pillars)
  if (!isPillar && !onEdge && blX > 0 && blX < footW - 1 && blZ > 0 && blZ < footD - 1) {
    if ((blX + blZ) % 4 < 2) {
      const stallColors = ['#dd6644', '#44aa88', '#ddaa44', '#6688cc'];
      push((bX + lx) * VS, (h + 2) * VS, (bZ + lz) * VS,
        varyColor(stallColors[(blX + blZ) % stallColors.length], wx, h + 2, wz, 4, 0.04, 0.06));
    }
  }
  trackH(lx, lz, h + bh + 1);
}

/* ═══════════════ TRANSIT STATION (platform with canopy) ═══════════════ */
function genTransitStation(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD, bh, forceEdge } = ctx;
  const onEdge = isExposedWall(blX, blZ, footW, footD, forceEdge);
  const isPlatformEdge = blZ === 0 || blZ === footD - 1;

  // Platform base
  push((bX + lx) * VS, (h + 1) * VS, (bZ + lz) * VS,
    varyColor(isPlatformEdge ? '#ffdd44' : '#aaaaaa', wx, h + 1, wz, 2, 0.03, 0.04));

  if (onEdge || (blX % 4 === 0)) {
    // Pillars supporting canopy
    for (let py = 2; py <= bh; py++) {
      if (!onEdge && py < bh) continue;
      push((bX + lx) * VS, (h + py) * VS, (bZ + lz) * VS,
        varyColor(py === bh ? '#667799' : '#8899aa', wx, h + py, wz, 3, 0.03, 0.05));
    }
  }
  // Canopy roof
  push((bX + lx) * VS, (h + bh + 1) * VS, (bZ + lz) * VS,
    varyColor('#556677', wx, h + bh + 1, wz, 3, 0.03, 0.05));

  // Signs at entrances
  if (blX === Math.floor(footW / 2) && (blZ === 0 || blZ === footD - 1)) {
    push((bX + lx) * VS, (h + bh + 2) * VS, (bZ + lz) * VS,
      varyColor('#4488ff', wx, h + bh + 2, wz, 3, 0.04, 0.06));
    trackH(lx, lz, h + bh + 2);
  } else {
    trackH(lx, lz, h + bh + 1);
  }
}

/* ═══════════════ MONUMENT (stone column/obelisk with steps) ═══════════════ */
function genMonument(ctx: BuildCtx) {
  const { push, trackH, bX, bZ, lx, lz, h, wx, wz, blX, blZ, footW, footD } = ctx;
  const midX = Math.floor(footW / 2), midZ = Math.floor(footD / 2);
  const dist = Math.max(Math.abs(blX - midX), Math.abs(blZ - midZ));

  // Stepped base
  const stepH = Math.max(0, 3 - dist);
  for (let by = 1; by <= stepH; by++) {
    push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS,
      varyColor('#ccccbb', wx, h + by, wz, 3, 0.03, 0.05));
  }

  // Central obelisk
  if (dist <= 1) {
    const obeliskH = 8;
    for (let by = stepH + 1; by <= stepH + obeliskH; by++) {
      const taper = by > stepH + obeliskH - 2 && dist === 1;
      if (taper) continue;
      push((bX + lx) * VS, (h + by) * VS, (bZ + lz) * VS,
        varyColor(by === stepH + obeliskH ? '#ffdd44' : '#ddddcc', wx, h + by, wz, 3, 0.03, 0.05));
    }
    if (blX === midX && blZ === midZ) {
      // Pointed tip
      push((bX + lx) * VS, (h + stepH + obeliskH + 1) * VS, (bZ + lz) * VS,
        varyColor('#ffdd44', wx, h + stepH + obeliskH + 1, wz, 2, 0.02, 0.04));
      trackH(lx, lz, h + stepH + obeliskH + 1);
    } else {
      trackH(lx, lz, h + stepH + obeliskH);
    }
  } else {
    trackH(lx, lz, h + Math.max(1, stepH));
  }
}
