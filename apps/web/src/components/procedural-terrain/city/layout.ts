/* ═══════════════════════════════════════════════════════════════
 *  City Layout System — Advanced Grid with Multi-Lot Buildings,
 *  Avenues, Zoning, and Intelligent Road Details
 *
 *  Architecture:
 *  - Grid-based layout with BLOCK_SIZE spacing
 *  - Major avenues every AVENUE_INTERVAL blocks (wider, boulevard-style)
 *  - Zoning noise determines district types (downtown, commercial, etc.)
 *  - Buildings can span multiple lots (2×1, 2×2, 3×3, etc.)
 *  - Road details (lane markings, crosswalks) adapt to road width
 * ═══════════════════════════════════════════════════════════════ */

import type { CityCell, ZoneType, BuildingType } from '../types';
import {
  BLOCK_SIZE, ROAD_W, AVENUE_W, LOT_INSET, AVENUE_INTERVAL,
  BUILDING_WALL_PALETTES, BUILDING_ROOF_COLORS,
} from '../constants';
import { hashCoord } from '../utils/color';

/* ── Zone classification via noise ── */

/** Determine the zone type at a world lot position */
export function getZone(
  structN: (x: number, y: number) => number,
  lotWX: number, lotWZ: number,
): ZoneType {
  const v = structN(lotWX * 0.15 + 300, lotWZ * 0.15 + 300);
  const v2 = structN(lotWX * 0.25 + 500, lotWZ * 0.25 + 500);
  // Distance from origin creates a natural downtown core
  const dist = Math.sqrt(lotWX * lotWX + lotWZ * lotWZ);
  const centralBonus = Math.max(0, 1 - dist * 0.04); // fades over ~25 blocks

  if (v + centralBonus > 0.6) return 'downtown';
  if (v > 0.2) return v2 > 0 ? 'commercial' : 'civic';
  if (v > -0.15) return 'residential';
  return 'industrial';
}

/* ── Multi-lot building detection ── */

/**
 * Determines if the lot at (lotWX, lotWZ) is the anchor of a multi-lot building.
 * Returns [width, depth] in lots, or [1,1] for single-lot buildings.
 * Only the anchor lot (bottom-left of the building footprint) returns > 1.
 */
export function getMultiLotSize(
  structN: (x: number, y: number) => number,
  lotWX: number, lotWZ: number,
  zone: ZoneType,
): [number, number] {
  // Use deterministic hash to decide if this lot starts a multi-lot building
  const h = hashCoord(lotWX * 7 + 31, 0, lotWZ * 13 + 47);
  const h2 = hashCoord(lotWX * 11 + 71, 0, lotWZ * 3 + 89);

  switch (zone) {
    case 'downtown':
      // Downtown: 30% chance of 2×2, 10% chance of 3×2
      if (h > 0.9) return [3, 2];
      if (h > 0.7) return [2, 2];
      return [1, 1];
    case 'commercial':
      // Commercial: 25% chance of 2×1 (strip mall), 10% chance of 3×2 (mall)
      if (h > 0.9) return [3, 2];
      if (h > 0.75) return [2, 1];
      return [1, 1];
    case 'civic':
      // Civic: 20% chance of 2×2 (school/hospital), 5% chance of 4×3 (stadium)
      if (h > 0.95) return [4, 3];
      if (h > 0.8) return [2, 2];
      return [1, 1];
    case 'residential':
      // Residential: 15% mansion (2×1), 8% castle (3×2)
      if (h > 0.92 && h2 > 0.3) return [3, 2]; // castle
      if (h > 0.82 && h2 > 0.5) return [2, 2]; // large mansion
      if (h > 0.72) return [2, 1]; // mansion
      return [1, 1];
    case 'industrial':
      // Industrial: 30% chance of 2×2 (warehouse complex), 10% chance of 3×2 (factory)
      if (h > 0.9) return [3, 2];
      if (h > 0.7) return [2, 2];
      return [1, 1];
    default:
      return [1, 1];
  }
}

/**
 * For a given lot, find its anchor lot (the bottom-left lot of the multi-lot building
 * it belongs to). Returns the anchor lotWX, lotWZ and the building size.
 * This does a local search to see if a nearby anchor claims this lot.
 */
export function findBuildingAnchor(
  structN: (x: number, y: number) => number,
  lotWX: number, lotWZ: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _zone: ZoneType,
): { anchorX: number; anchorZ: number; w: number; d: number; localX: number; localZ: number } {
  // Check lots in a 4×4 area to the left/below this one
  for (let dx = 0; dx >= -4; dx--) {
    for (let dz = 0; dz >= -4; dz--) {
      const ax = lotWX + dx, az = lotWZ + dz;
      const anchorZone = getZone(structN, ax, az);
      const [w, d] = getMultiLotSize(structN, ax, az, anchorZone);
      // Does this anchor's footprint cover our lot?
      if (lotWX >= ax && lotWX < ax + w && lotWZ >= az && lotWZ < az + d) {
        return {
          anchorX: ax, anchorZ: az,
          w, d,
          localX: lotWX - ax,
          localZ: lotWZ - az,
        };
      }
    }
  }
  // Fallback: single lot
  return { anchorX: lotWX, anchorZ: lotWZ, w: 1, d: 1, localX: 0, localZ: 0 };
}

/* ── Road width detection (avenues are wider) ── */

function isAvenueX(blockX: number): boolean {
  return ((blockX % AVENUE_INTERVAL) + AVENUE_INTERVAL) % AVENUE_INTERVAL === 0;
}
function isAvenueZ(blockZ: number): boolean {
  return ((blockZ % AVENUE_INTERVAL) + AVENUE_INTERVAL) % AVENUE_INTERVAL === 0;
}

function getRoadWidthX(wx: number): number {
  const blockX = Math.floor(wx / BLOCK_SIZE);
  return isAvenueX(blockX) ? AVENUE_W : ROAD_W;
}
function getRoadWidthZ(wz: number): number {
  const blockZ = Math.floor(wz / BLOCK_SIZE);
  return isAvenueZ(blockZ) ? AVENUE_W : ROAD_W;
}

/* ── Road termination — procedural dead-ends and T-intersections ──
 *  Non-avenue road segments can be "closed" (converted to building lot)
 *  based on deterministic noise. Avenues always remain open so connectivity
 *  is guaranteed: every block is reachable via the avenue grid.
 *
 *  A road segment runs along X between two Z-direction intersections
 *  (or vice versa). We hash the block coordinate of that segment and
 *  close ~20% of non-avenue segments. The closed segment becomes
 *  extra building space (a cul-de-sac lot).
 */

/** Returns true if the X-direction road at this Z-block is closed (terminated). */
function isRoadXClosed(blockX: number, blockZ: number): boolean {
  // Avenues never close
  if (isAvenueZ(blockZ)) return false;
  // Roads adjacent to avenues stay open for access
  const mod = ((blockZ % AVENUE_INTERVAL) + AVENUE_INTERVAL) % AVENUE_INTERVAL;
  if (mod === 1 || mod === AVENUE_INTERVAL - 1) return false;
  // Deterministic hash: ~20% of eligible segments are closed
  const h = hashCoord(blockX * 31 + 173, 0, blockZ * 47 + 211);
  return h > 0.80;
}

/** Returns true if the Z-direction road at this X-block is closed (terminated). */
function isRoadZClosed(blockX: number, blockZ: number): boolean {
  if (isAvenueX(blockX)) return false;
  const mod = ((blockX % AVENUE_INTERVAL) + AVENUE_INTERVAL) % AVENUE_INTERVAL;
  if (mod === 1 || mod === AVENUE_INTERVAL - 1) return false;
  const h = hashCoord(blockX * 53 + 347, 0, blockZ * 29 + 197);
  return h > 0.80;
}

/* ── Main classification function ── */

export function classifyCityCell(
  wx: number, wz: number,
  structN?: (x: number, y: number) => number,
): CityCell {
  const rw = getRoadWidthX(wx);
  const rdz = getRoadWidthZ(wz);
  const effectiveRW = Math.max(rw, rdz);

  const modX = ((wx % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
  const modZ = ((wz % BLOCK_SIZE) + BLOCK_SIZE) % BLOCK_SIZE;
  let onRoadX = modX < rw;
  let onRoadZ = modZ < rdz;

  // Apply road termination: closed segments become building lot
  const blockX = Math.floor(wx / BLOCK_SIZE);
  const blockZ = Math.floor(wz / BLOCK_SIZE);
  if (onRoadX && !onRoadZ && isRoadXClosed(blockX, blockZ)) onRoadX = false;
  if (onRoadZ && !onRoadX && isRoadZClosed(blockX, blockZ)) onRoadZ = false;

  const isRoad = onRoadX || onRoadZ;
  const isIntersection = onRoadX && onRoadZ;
  const isAvenue = (onRoadX && rw >= AVENUE_W) || (onRoadZ && rdz >= AVENUE_W);

  // Lot-local coordinates (per-dimension to handle avenue vs standard road)
  const lotRawX = modX - rw;
  const lotRawZ = modZ - rdz;
  const lotSizeX = BLOCK_SIZE - rw;
  const lotSizeZ = BLOCK_SIZE - rdz;

  // Lot world ID
  const lotWorldX = Math.floor(wx / BLOCK_SIZE);
  const lotWorldZ = Math.floor(wz / BLOCK_SIZE);

  if (isRoad) {
    return {
      isRoad: true, isAvenue, isIntersection, isSidewalk: false, isBuilding: false,
      lotLocalX: -1, lotLocalZ: -1, lotWorldX, lotWorldZ,
      buildingW: 0, buildingD: 0,
      zone: 'downtown', // roads don't have zones
      roadWidth: effectiveRW,
      roadWidthX: rw,
      roadWidthZ: rdz,
    };
  }

  const isSidewalk = lotRawX < LOT_INSET || lotRawX >= lotSizeX - LOT_INSET
                   || lotRawZ < LOT_INSET || lotRawZ >= lotSizeZ - LOT_INSET;

  // Default zone (will be overridden if structN is provided)
  let zone: ZoneType = 'residential';
  let buildingW = 1, buildingD = 1;
  let localBX = lotRawX - LOT_INSET;
  let localBZ = lotRawZ - LOT_INSET;

  if (structN) {
    zone = getZone(structN, lotWorldX, lotWorldZ);
    const anchor = findBuildingAnchor(structN, lotWorldX, lotWorldZ, zone);
    buildingW = anchor.w;
    buildingD = anchor.d;

    // For multi-lot buildings, adjust local coords to be relative to the full footprint
    if (anchor.w > 1 || anchor.d > 1) {
      const lotFootprint = BLOCK_SIZE - ROAD_W - LOT_INSET * 2;
      // Global position within the building footprint
      localBX = anchor.localX * lotFootprint + (lotRawX - LOT_INSET);
      localBZ = anchor.localZ * lotFootprint + (lotRawZ - LOT_INSET);
    }
  }

  return {
    isRoad: false, isAvenue: false, isIntersection: false, isSidewalk,
    isBuilding: !isSidewalk,
    lotLocalX: localBX,
    lotLocalZ: localBZ,
    lotWorldX, lotWorldZ,
    buildingW, buildingD,
    zone,
    roadWidth: effectiveRW,
    roadWidthX: rw,
    roadWidthZ: rdz,
  };
}

/* ═══════════════════════════════════════════════════════════════
 *  Building Type Selection — zone-aware with multi-lot support
 * ═══════════════════════════════════════════════════════════════ */

export function getBuildingType(
  structN: (x: number, y: number) => number,
  lotWX: number, lotWZ: number,
  density: number,
  zone: ZoneType,
  buildingW: number,
  buildingD: number,
): BuildingType {
  const v = structN(lotWX * 0.7 + 42, lotWZ * 0.7 + 42);
  const v2 = structN(lotWX * 1.3 + 77, lotWZ * 1.3 + 77);
  const area = buildingW * buildingD;

  // Large footprint buildings
  if (area >= 12) return 'stadium';
  if (area >= 6) {
    if (zone === 'civic') return v > 0 ? 'hospital' : 'school';
    if (zone === 'commercial') return 'mall';
    if (zone === 'industrial') return 'factory';
    if (zone === 'downtown') return 'airport_terminal';
    return 'stadium';
  }
  if (area >= 4) {
    if (zone === 'downtown') return v > 0.3 ? 'skyscraper_twin' : 'skyscraper_stepped';
    if (zone === 'commercial') return 'mall';
    if (zone === 'civic') return v > 0 ? 'hospital' : 'school';
    if (zone === 'industrial') return v > 0 ? 'factory' : 'warehouse';
    if (zone === 'residential') return v > 0.2 ? 'castle' : 'mansion';
    return 'office_tall';
  }
  if (area >= 2) {
    if (zone === 'residential') return v > 0.4 ? 'castle' : 'mansion';
    if (zone === 'commercial') return v > 0.3 ? 'mall' : 'shop';
    if (zone === 'industrial') return 'warehouse';
    return 'office_tall';
  }

  // Single-lot buildings — zone-dependent selection
  switch (zone) {
    case 'downtown':
      if (v > 0.35 + (1 - density) * 0.15) return v2 > 0.3 ? 'skyscraper' : 'skyscraper_stepped';
      if (v > 0.2) return v2 > 0.0 ? 'tower' : 'office_tall';
      if (v > 0.05) return v2 > 0.5 ? 'hotel' : 'office';
      if (v > -0.1) return 'parking_garage';
      return v > -0.25 ? 'plaza' : 'fountain_plaza';

    case 'commercial':
      if (v > 0.35) return 'hotel';
      if (v > 0.2) return 'office';
      if (v > 0.1) return v2 > 0.3 ? 'restaurant' : 'shop';
      if (v > -0.05) return v2 > 0 ? 'gas_station' : 'parking';
      if (v > -0.2) return 'fountain_plaza';
      return 'park';

    case 'residential':
      if (v > 0.35) return v2 > 0.5 ? 'apartment' : 'mansion';
      if (v > 0.15) return v2 > 0.4 ? 'apartment' : 'house';
      if (v > 0.05) return 'house';
      if (v > -0.15) return 'park';
      if (v > -0.3) return 'church';
      return 'parking';

    case 'industrial':
      if (v > 0.25) return 'warehouse';
      if (v > 0.0) return 'factory';
      if (v > -0.15) return 'gas_station';
      if (v > -0.3) return 'parking';
      return 'park';

    case 'civic':
      if (v > 0.3) return v2 > 0 ? 'hospital' : 'school';
      if (v > 0.15) return v2 > 0.3 ? 'library' : 'fire_station';
      if (v > 0.05) return 'church';
      if (v > -0.15) return 'fountain_plaza';
      return 'plaza';

    default:
      return 'house';
  }
}

export function getBuildingHeight(
  structN: (x: number, y: number) => number,
  lotWX: number, lotWZ: number,
  type: BuildingType,
): number {
  const v = Math.abs(structN(lotWX * 3.7 + 100, lotWZ * 3.7 + 100));
  switch (type) {
    case 'skyscraper':         return 12 + Math.floor(v * 16);   // 12-28
    case 'skyscraper_twin':    return 10 + Math.floor(v * 14);   // 10-24
    case 'skyscraper_stepped': return 14 + Math.floor(v * 12);   // 14-26
    case 'tower':              return 8 + Math.floor(v * 10);    // 8-18
    case 'tower_telecom':      return 10 + Math.floor(v * 8);    // 10-18
    case 'office':             return 5 + Math.floor(v * 6);     // 5-11
    case 'office_tall':        return 7 + Math.floor(v * 8);     // 7-15
    case 'warehouse':          return 3 + Math.floor(v * 2);     // 3-5
    case 'factory':            return 4 + Math.floor(v * 3);     // 4-7
    case 'shop':               return 3 + Math.floor(v * 2);     // 3-5
    case 'mall':               return 4 + Math.floor(v * 3);     // 4-7
    case 'house':              return 3 + Math.floor(v * 2);     // 3-5
    case 'mansion':            return 5 + Math.floor(v * 4);     // 5-9 (taller)
    case 'castle':             return 8 + Math.floor(v * 8);     // 8-16
    case 'hospital':           return 6 + Math.floor(v * 6);     // 6-12
    case 'school':             return 4 + Math.floor(v * 3);     // 4-7
    case 'church':             return 5 + Math.floor(v * 4);     // 5-9
    case 'stadium':            return 4 + Math.floor(v * 3);     // 4-7
    case 'parking_garage':     return 4 + Math.floor(v * 3);     // 4-7
    case 'airport_terminal':   return 4 + Math.floor(v * 2);     // 4-6
    case 'apartment':          return 6 + Math.floor(v * 10);    // 6-16
    case 'hotel':              return 8 + Math.floor(v * 12);    // 8-20
    case 'gas_station':        return 2 + Math.floor(v * 1);     // 2-3
    case 'restaurant':         return 3 + Math.floor(v * 2);     // 3-5
    case 'fire_station':       return 4 + Math.floor(v * 3);     // 4-7
    case 'library':            return 4 + Math.floor(v * 4);     // 4-8
    case 'plaza':              return 0;
    case 'fountain_plaza':     return 0;
    case 'park':               return 0;
    case 'parking':            return 0;
    case 'bridge_base':        return 3 + Math.floor(v * 2);     // 3-5
    default:                   return 0;
  }
}

/** Get the wall palette for a building type, with fallback */
export function getWallPalette(type: BuildingType): string[] {
  const key = type.replace(/_twin|_stepped|_tall|_telecom/g, '') as string;
  return BUILDING_WALL_PALETTES[type] || BUILDING_WALL_PALETTES[key] || ['#ddccaa'];
}

/** Get the roof color for a building type, with fallback */
export function getRoofColor(type: BuildingType): string {
  const key = type.replace(/_twin|_stepped|_tall|_telecom/g, '') as string;
  return BUILDING_ROOF_COLORS[type] || BUILDING_ROOF_COLORS[key] || '#cc6633';
}
