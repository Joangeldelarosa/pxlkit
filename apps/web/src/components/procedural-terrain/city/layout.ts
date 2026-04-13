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

import type { CityCell, ZoneType, BuildingType, OpenZoneType } from '../types';
import {
  BLOCK_SIZE, ROAD_W, AVENUE_W, LOT_INSET, AVENUE_INTERVAL, CITY_HW_W,
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

/* ── Road width detection (avenues are wider, city highways widest) ── */

function isAvenueX(blockX: number): boolean {
  return ((blockX % AVENUE_INTERVAL) + AVENUE_INTERVAL) % AVENUE_INTERVAL === 0;
}
function isAvenueZ(blockZ: number): boolean {
  return ((blockZ % AVENUE_INTERVAL) + AVENUE_INTERVAL) % AVENUE_INTERVAL === 0;
}

function getRoadWidthX(wx: number): number {
  const blockX = Math.floor(wx / BLOCK_SIZE);
  if (isHighwayX(blockX)) return CITY_HW_W;
  return isAvenueX(blockX) ? AVENUE_W : ROAD_W;
}
function getRoadWidthZ(wz: number): number {
  const blockZ = Math.floor(wz / BLOCK_SIZE);
  if (isHighwayZ(blockZ)) return CITY_HW_W;
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

/* ═══════════════════════════════════════════════════════════════
 *  Urban Fabric System — Open Zones
 *
 *  Cities shouldn't be solid grids of buildings. Real cities have:
 *  - Farmland/agricultural fields at the periphery
 *  - Highway corridors with wide open shoulders
 *  - Green buffer zones (parks, nature strips)
 *  - Empty lots / construction sites
 *  - Suburban yards with scattered houses
 *
 *  This system uses multi-octave noise to carve organic "holes"
 *  in the city fabric. The open zone type is determined by the
 *  zone context: residential areas get yards, industrial gets
 *  empty lots, edge areas get farmland, etc.
 * ═══════════════════════════════════════════════════════════════ */

/** Classify whether a block should be an open zone instead of a building.
 *  Returns the open zone type, or 'none' if it should be a normal building lot. */
function classifyOpenZone(
  structN: (x: number, y: number) => number,
  lotWX: number, lotWZ: number,
  zone: ZoneType,
  blockX: number, blockZ: number,
): OpenZoneType {
  // Use a dedicated low-frequency noise channel for urban fabric
  // This creates large organic patches, not per-block randomness
  const fabricN1 = structN(lotWX * 0.06 + 2000, lotWZ * 0.06 + 2000);
  const fabricN2 = structN(lotWX * 0.12 + 3000, lotWZ * 0.12 + 3000);
  const fabricN3 = structN(lotWX * 0.03 + 4000, lotWZ * 0.03 + 4000);

  // Highway corridor: blocks adjacent to highways get open shoulders
  const nearHwX = isHighwayX(blockX) || isHighwayX(blockX - 1) || isHighwayX(blockX + 1);
  const nearHwZ = isHighwayZ(blockZ) || isHighwayZ(blockZ - 1) || isHighwayZ(blockZ + 1);
  if ((nearHwX || nearHwZ) && fabricN2 > -0.1) {
    // ~60% of highway-adjacent blocks become open corridor
    if (fabricN1 > -0.2) return 'highway_corridor';
  }

  // Downtown zones are dense — very few open areas
  if (zone === 'downtown') {
    // Only occasional plazas (handled by building type selection, not open zones)
    return 'none';
  }

  // Large-scale fabric noise: creates organic patches of non-building areas
  // The threshold varies by zone — residential has more open space than commercial
  const openThreshold = zone === 'residential' ? 0.18
    : zone === 'industrial' ? 0.25
    : zone === 'civic' ? 0.30
    : 0.28; // commercial

  if (fabricN1 > openThreshold) {
    // Determine what kind of open zone based on secondary noise + zone
    if (zone === 'residential') {
      if (fabricN2 > 0.2) return 'suburban_yard';
      if (fabricN3 > 0.1) return 'green_buffer';
      return 'suburban_yard';
    }
    if (zone === 'industrial') {
      if (fabricN2 > 0.15) return 'empty_lot';
      return 'green_buffer';
    }
    if (zone === 'civic') {
      return 'green_buffer';
    }
    // Commercial: mix of empty lots and green buffers
    if (fabricN2 > 0.1) return 'empty_lot';
    return 'green_buffer';
  }

  // Farmland: large patches at city edges (detected via very low-freq noise)
  // fabricN3 is the lowest frequency → creates very large patches
  if (fabricN3 > 0.30) {
    if (fabricN1 > -0.1) return 'farmland';
  }

  return 'none';
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

  // Highway detection
  const hwX = isHighwayX(blockX);
  const hwZ = isHighwayZ(blockZ);
  const isHw = isRoad && (hwX || hwZ);
  // City highway: wide 12-voxel road (CITY_HW_W) with 4+4 lanes
  const isCityHw = isRoad && ((onRoadX && rw >= CITY_HW_W) || (onRoadZ && rdz >= CITY_HW_W));

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
      isOpenZone: false, openZoneType: 'none',
      lotLocalX: -1, lotLocalZ: -1, lotWorldX, lotWorldZ,
      buildingW: 0, buildingD: 0,
      zone: 'downtown', // roads don't have zones
      roadWidth: effectiveRW,
      roadWidthX: rw,
      roadWidthZ: rdz,
      isHighway: isHw,
      isCityHighway: isCityHw,
    };
  }

  const isSidewalk = lotRawX < LOT_INSET || lotRawX >= lotSizeX - LOT_INSET
                   || lotRawZ < LOT_INSET || lotRawZ >= lotSizeZ - LOT_INSET;

  // Default zone (will be overridden if structN is provided)
  let zone: ZoneType = 'residential';
  let buildingW = 1, buildingD = 1;
  let localBX = lotRawX - LOT_INSET;
  let localBZ = lotRawZ - LOT_INSET;
  let openZoneType: OpenZoneType = 'none';

  if (structN) {
    zone = getZone(structN, lotWorldX, lotWorldZ);

    // Check if this block should be an open zone
    openZoneType = classifyOpenZone(structN, lotWorldX, lotWorldZ, zone, blockX, blockZ);

    if (openZoneType !== 'none') {
      // Open zone overrides building — but we keep the sidewalk for edge definition
      return {
        isRoad: false, isAvenue: false, isIntersection: false,
        isSidewalk,
        isBuilding: false,
        isOpenZone: !isSidewalk, // sidewalk cells remain sidewalk, interior becomes open
        openZoneType: isSidewalk ? 'none' : openZoneType,
        lotLocalX: localBX,
        lotLocalZ: localBZ,
        lotWorldX, lotWorldZ,
        buildingW: 0, buildingD: 0,
        zone,
        roadWidth: effectiveRW,
        roadWidthX: rw,
        roadWidthZ: rdz,
        isHighway: false,
        isCityHighway: false,
      };
    }

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
    isOpenZone: false, openZoneType: 'none',
    lotLocalX: localBX,
    lotLocalZ: localBZ,
    lotWorldX, lotWorldZ,
    buildingW, buildingD,
    zone,
    roadWidth: effectiveRW,
    roadWidthX: rw,
    roadWidthZ: rdz,
    isHighway: false,
    isCityHighway: false,
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
  const v3 = structN(lotWX * 0.9 + 131, lotWZ * 0.9 + 131);
  const area = buildingW * buildingD;

  // Large footprint buildings
  if (area >= 12) {
    if (zone === 'civic') return v > 0 ? 'convention_center' : 'stadium';
    return 'stadium';
  }
  if (area >= 6) {
    if (zone === 'civic') return v > 0.3 ? 'convention_center' : v > 0 ? 'hospital' : 'museum';
    if (zone === 'commercial') return v > 0.3 ? 'mall' : 'supermarket';
    if (zone === 'industrial') return v > 0.3 ? 'factory' : 'data_center';
    if (zone === 'downtown') return v > 0.3 ? 'airport_terminal' : 'transit_station';
    return 'stadium';
  }
  if (area >= 4) {
    if (zone === 'downtown') return v > 0.5 ? 'skyscraper_twin' : v > 0.2 ? 'penthouse_tower' : 'skyscraper_stepped';
    if (zone === 'commercial') return v > 0.5 ? 'mall' : v > 0.2 ? 'market_hall' : 'supermarket';
    if (zone === 'civic') return v > 0.3 ? 'museum' : v > 0 ? 'hospital' : 'school';
    if (zone === 'industrial') return v > 0.3 ? 'factory' : v > 0 ? 'data_center' : 'warehouse';
    if (zone === 'residential') return v > 0.5 ? 'castle' : v > 0.2 ? 'mansion' : 'condo';
    return 'office_tall';
  }
  if (area >= 2) {
    if (zone === 'residential') return v > 0.5 ? 'castle' : v > 0.2 ? 'townhouse' : 'mansion';
    if (zone === 'commercial') return v > 0.5 ? 'mall' : v > 0.2 ? 'gym' : 'shop';
    if (zone === 'industrial') return v > 0.3 ? 'warehouse' : 'data_center';
    return 'office_tall';
  }

  // Single-lot buildings — zone-dependent selection with more variety
  switch (zone) {
    case 'downtown':
      if (v > 0.35 + (1 - density) * 0.15) return v2 > 0.5 ? 'skyscraper' : v2 > 0.2 ? 'penthouse_tower' : 'skyscraper_stepped';
      if (v > 0.2) return v2 > 0.3 ? 'tower' : v3 > 0.3 ? 'mixed_use' : 'office_tall';
      if (v > 0.05) return v2 > 0.5 ? 'hotel' : v3 > 0.3 ? 'loft_building' : 'office';
      if (v > -0.05) return v3 > 0.4 ? 'bank' : 'parking_garage';
      if (v > -0.15) return v3 > 0.3 ? 'transit_station' : 'plaza';
      return v > -0.25 ? 'monument' : 'fountain_plaza';

    case 'commercial':
      if (v > 0.35) return v2 > 0.4 ? 'hotel' : 'cinema';
      if (v > 0.2) return v2 > 0.3 ? 'office' : v3 > 0.4 ? 'bank' : 'gym';
      if (v > 0.1) return v2 > 0.5 ? 'restaurant' : v3 > 0.3 ? 'supermarket' : 'shop';
      if (v > -0.05) return v2 > 0.3 ? 'gas_station' : v3 > 0.4 ? 'market_hall' : 'parking';
      if (v > -0.2) return 'fountain_plaza';
      return 'park';

    case 'residential':
      if (v > 0.4) return v2 > 0.5 ? 'penthouse_tower' : v3 > 0.3 ? 'condo' : 'apartment';
      if (v > 0.2) return v2 > 0.4 ? 'loft_building' : v3 > 0.3 ? 'townhouse' : 'apartment';
      if (v > 0.05) return v2 > 0.5 ? 'mixed_use' : 'house';
      if (v > -0.1) return v3 > 0.5 ? 'rooftop_garden' : 'park';
      if (v > -0.2) return v3 > 0.3 ? 'greenhouse' : 'church';
      return 'parking';

    case 'industrial':
      if (v > 0.25) return v2 > 0.4 ? 'warehouse' : 'data_center';
      if (v > 0.05) return v2 > 0.3 ? 'factory' : 'water_tower';
      if (v > -0.1) return v3 > 0.4 ? 'radio_station' : 'gas_station';
      if (v > -0.25) return 'parking';
      return 'park';

    case 'civic':
      if (v > 0.3) return v2 > 0.4 ? 'museum' : v3 > 0.3 ? 'hospital' : 'school';
      if (v > 0.15) return v2 > 0.4 ? 'police_station' : v3 > 0.3 ? 'library' : 'fire_station';
      if (v > 0.05) return v3 > 0.4 ? 'monument' : 'church';
      if (v > -0.1) return 'fountain_plaza';
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
  // Primary noise — smooth, per-lot variation
  const v = Math.abs(structN(lotWX * 3.7 + 100, lotWZ * 3.7 + 100));
  // Secondary noise — adds dramatic spikes (some buildings much taller than neighbours)
  const spike = Math.abs(structN(lotWX * 7.3 + 200, lotWZ * 7.3 + 200));
  // Spike multiplier: 10% of buildings get 1.3-1.6× height boost
  const spikeBoost = spike > 0.85 ? 1.3 + (spike - 0.85) * 2.0 : 1.0;

  let base = 0;
  switch (type) {
    case 'skyscraper':         base = 12 + Math.floor(v * 20);   break; // 12-31
    case 'skyscraper_twin':    base = 10 + Math.floor(v * 18);   break; // 10-27
    case 'skyscraper_stepped': base = 14 + Math.floor(v * 16);   break; // 14-29
    case 'tower':              base = 8 + Math.floor(v * 14);    break; // 8-21
    case 'tower_telecom':      base = 10 + Math.floor(v * 10);   break; // 10-19
    case 'office':             base = 5 + Math.floor(v * 8);     break; // 5-12
    case 'office_tall':        base = 7 + Math.floor(v * 10);    break; // 7-16
    case 'warehouse':          base = 3 + Math.floor(v * 3);     break; // 3-5
    case 'factory':            base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'shop':               base = 3 + Math.floor(v * 2);     break; // 3-4
    case 'mall':               base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'house':              base = 3 + Math.floor(v * 3);     break; // 3-5
    case 'mansion':            base = 5 + Math.floor(v * 5);     break; // 5-9
    case 'castle':             base = 8 + Math.floor(v * 10);    break; // 8-17
    case 'hospital':           base = 6 + Math.floor(v * 8);     break; // 6-13
    case 'school':             base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'church':             base = 5 + Math.floor(v * 5);     break; // 5-9
    case 'stadium':            base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'parking_garage':     base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'airport_terminal':   base = 4 + Math.floor(v * 3);     break; // 4-6
    case 'apartment':          base = 6 + Math.floor(v * 14);    break; // 6-19
    case 'hotel':              base = 8 + Math.floor(v * 16);    break; // 8-23
    case 'gas_station':        base = 2 + Math.floor(v * 1);     break; // 2
    case 'restaurant':         base = 3 + Math.floor(v * 3);     break; // 3-5
    case 'fire_station':       base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'library':            base = 4 + Math.floor(v * 5);     break; // 4-8
    case 'plaza':              return 0;
    case 'fountain_plaza':     return 0;
    case 'park':               return 0;
    case 'parking':            return 0;
    case 'bridge_base':        base = 3 + Math.floor(v * 3);     break; // 3-5
    /* ── New building heights (v2) ── */
    case 'condo':              base = 8 + Math.floor(v * 16);    break; // 8-23
    case 'townhouse':          base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'cinema':             base = 5 + Math.floor(v * 5);     break; // 5-9
    case 'police_station':     base = 4 + Math.floor(v * 5);     break; // 4-8
    case 'museum':             base = 5 + Math.floor(v * 6);     break; // 5-10
    case 'convention_center':  base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'supermarket':        base = 3 + Math.floor(v * 3);     break; // 3-5
    case 'gym':                base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'bank':               base = 5 + Math.floor(v * 6);     break; // 5-10
    case 'data_center':        base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'greenhouse':         base = 3 + Math.floor(v * 3);     break; // 3-5
    case 'water_tower':        base = 6 + Math.floor(v * 5);     break; // 6-10
    case 'radio_station':      base = 3 + Math.floor(v * 3);     break; // 3-5
    case 'rooftop_garden':     return 0;
    case 'mixed_use':          base = 6 + Math.floor(v * 10);    break; // 6-15
    case 'loft_building':      base = 5 + Math.floor(v * 8);     break; // 5-12
    case 'penthouse_tower':    base = 10 + Math.floor(v * 18);   break; // 10-27
    case 'market_hall':        base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'transit_station':    base = 4 + Math.floor(v * 4);     break; // 4-7
    case 'monument':           return 0;
    default:                   return 0;
  }
  // Apply dramatic spike boost to ~10% of buildings
  return Math.floor(base * spikeBoost);
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

/* ═══════════════════════════════════════════════════════════════
 *  Sector-based lamp/post color system
 *
 *  Different neighborhoods get distinct pole & lamp colors so large
 *  cities don't look monotonous. Sector is determined by a low-frequency
 *  hash of the block coordinates, giving ~5-block-wide color zones.
 * ═══════════════════════════════════════════════════════════════ */

/** Pole body colors by sector (muted metallics) */
const SECTOR_POLE_COLORS = [
  '#3a3a3a', // dark iron (default)
  '#2a3a2a', // verdigris / green patina
  '#3a2a2a', // rusty brown
  '#2a2a3a', // blue-black
  '#3a3a2a', // olive
  '#4a3a3a', // warm brown
];
/** Lamp glow colors by sector */
const SECTOR_LAMP_COLORS = [
  ['#ffee88', '#ffdd66'], // warm yellow (default)
  ['#ffeedd', '#ffddcc'], // warm white
  ['#ddffee', '#cceecc'], // cool green-white
  ['#ffeebb', '#ffddaa'], // sodium orange
  ['#eeeeff', '#ddddff'], // cool blue-white
  ['#ffe8cc', '#ffd8bb'], // peachy warm
];

/** Get pole and lamp colors for a sector based on world coordinates */
export function getSectorLampColors(wx: number, wz: number): {
  pole: string; lampA: string; lampB: string;
} {
  // Sector: every ~5 city blocks = 100 voxels ≈ distinct neighborhood
  const sectorX = Math.floor(wx / 100);
  const sectorZ = Math.floor(wz / 100);
  const sectorHash = Math.abs(sectorX * 7919 + sectorZ * 6271) % SECTOR_POLE_COLORS.length;
  return {
    pole: SECTOR_POLE_COLORS[sectorHash],
    lampA: SECTOR_LAMP_COLORS[sectorHash][0],
    lampB: SECTOR_LAMP_COLORS[sectorHash][1],
  };
}

/* ═══════════════════════════════════════════════════════════════
 *  Highway / Autopista System
 *
 *  Two layers:
 *  1) INTRA-CITY highways: mega-avenues inside city biomes (every
 *     HIGHWAY_INTERVAL blocks). These are the main city arteries.
 *  2) INTER-BIOME highways: long-distance highways that span the
 *     world, connecting cities across plains, forests, deserts,
 *     and mountains. When they hit mountains they become TUNNELS.
 *
 *  Realism features:
 *  - NOT all grid lines become highways — noise-based activation
 *    means ~55-65% of potential highway slots are realized.
 *  - Highway CLASS varies: rural 2-lane, standard 4-lane, or
 *    6-lane autopista, based on continent type + proximity to cities.
 *  - Gentle lateral CURVES via sinusoidal noise offset.
 *  - Varied lighting: highway lamps with sodium/LED glow, cat-eye
 *    reflectors, periodic green direction signs, billboards.
 *  - Tunnel PORTALS: concrete arch at mountain entrance with smooth
 *    transition.
 * ═══════════════════════════════════════════════════════════════ */

/** Intra-city highway interval: every N blocks */
export const HIGHWAY_INTERVAL = 16;
/** Highway total width in voxels (inside cities) */
export const HIGHWAY_W = 12;

/** Returns true if this block coordinate is on an intra-city highway in X */
export function isHighwayX(blockX: number): boolean {
  return ((blockX % HIGHWAY_INTERVAL) + HIGHWAY_INTERVAL) % HIGHWAY_INTERVAL === 0;
}
/** Returns true if this block coordinate is on an intra-city highway in Z */
export function isHighwayZ(blockZ: number): boolean {
  return ((blockZ % HIGHWAY_INTERVAL) + HIGHWAY_INTERVAL) % HIGHWAY_INTERVAL === 0;
}

/* ── Inter-biome highway system ── */

/** Spacing between inter-biome highways in world-voxel coordinates.
 *  320 = 16 chunks × CHUNK_SIZE(16) + room for terrain variation. */
export const INTER_HW_SPACING = 320;

/** Half-width of the inter-biome highway — varies by class.
 *  The base value is for standard 4-lane highways. */
export const INTER_HW_HALF_W = 5;

/** Tunnel internal height in voxels (floor to ceiling clearance) */
export const TUNNEL_HEIGHT = 6;

/* ── Highway class system ──
 *  Each highway grid line can be:
 *  - 'none':     not built (gap in the network — ~35-45% of lines)
 *  - 'rural':    narrow 2-lane road (half-width = 3, no median barrier)
 *  - 'standard': normal 4-lane highway (half-width = 5, barriers)
 *  - 'autopista': wide 6-lane freeway (half-width = 7, double barriers, wider median)
 *
 *  Determined by noise hash of the grid-line index. */
export type HighwayClass = 'none' | 'rural' | 'standard' | 'autopista';

/** Returns the class of a highway grid line.
 *  `gridIdx` is the integer grid line index: Math.round(coord / INTER_HW_SPACING). */
export function getHighwayClass(gridIdxX: number, _gridIdxZ: number, isX: boolean): HighwayClass {
  // Deterministic hash per grid line
  const idx = isX ? gridIdxX : _gridIdxZ;
  // Use a stable hash: combine index with a magic prime offset per axis
  const h1 = Math.abs(((idx * 73856093 + (isX ? 37 : 91)) ^ (idx * 19349663)) | 0) / 2147483647;
  const h2 = Math.abs(((idx * 83492791 + (isX ? 113 : 257)) ^ (idx * 59441693)) | 0) / 2147483647;

  // ~38% of lines are not built (breaks the uniform grid feel)
  if (h1 < 0.38) return 'none';

  // Of the remaining ~62%:
  //  ~22% rural, ~30% standard, ~10% autopista
  if (h2 < 0.35) return 'rural';
  if (h2 < 0.84) return 'standard';
  return 'autopista';
}

/** Get the half-width for a highway class */
export function getHWHalfWidth(hwClass: HighwayClass): number {
  switch (hwClass) {
    case 'rural': return 3;
    case 'standard': return 5;
    case 'autopista': return 7;
    default: return 5;
  }
}

/* ── Highway curve / lateral offset ──
 *  Highways are NOT perfectly straight. A low-frequency sinusoidal
 *  offset is applied perpendicular to the highway direction. This
 *  creates gentle sweeping curves that look natural.
 *  The offset is deterministic per world-position (based on coordinate
 *  along the highway axis). */

/** Maximum lateral offset in voxels (gentle curve amplitude) */
const HW_CURVE_AMPLITUDE = 3;
/** Wavelength of the curve in voxels (~200 = gentle sweep) */
const HW_CURVE_WAVELENGTH = 220;

/** Compute the lateral offset for a highway at a given position along its axis.
 *  Returns a fractional voxel offset perpendicular to the highway.
 *  `axisPos` is the world coordinate along the highway (wx for X-running, wz for Z-running).
 *  `gridIdx` is the integer grid line index for this highway. */
function hwCurveOffset(axisPos: number, gridIdx: number): number {
  // Two sine waves with different phases per highway (based on gridIdx)
  const phase1 = gridIdx * 2.718;
  const phase2 = gridIdx * 1.618;
  const s1 = Math.sin((axisPos / HW_CURVE_WAVELENGTH) * Math.PI * 2 + phase1);
  const s2 = Math.sin((axisPos / (HW_CURVE_WAVELENGTH * 0.6)) * Math.PI * 2 + phase2) * 0.4;
  return (s1 + s2) * HW_CURVE_AMPLITUDE;
}

/* ── Highway furniture placement ──
 *  Deterministic placement of highway furniture (signs, lamps, billboards)
 *  along the highway, with spacing and variety. */

/** Highway furniture types */
export type HighwayFurnitureType =
  | 'lamp_sodium'       // tall highway lamp with orange glow
  | 'lamp_led'          // modern LED lamp (white/cool)
  | 'lamp_rural'        // shorter rural lamp
  | 'reflector'         // cat-eye reflector between lanes
  | 'sign_direction'    // green direction sign
  | 'sign_speed'        // speed limit sign
  | 'billboard'         // advertising billboard
  | 'emergency_phone'   // tunnel emergency phone
  | 'none';

/** Determine what furniture (if any) to place at this highway position.
 *  Returns the furniture type and which side of the road it's on. */
export function getHighwayFurniture(
  wx: number, wz: number,
  hwClass: HighwayClass,
  isBarrier: boolean,
  isTunnel: boolean,
  onX: boolean,
): { type: HighwayFurnitureType; side: 'left' | 'right' | 'center' } {
  if (!isBarrier) {
    // Cat-eye reflectors: on the median line, every 4 voxels
    const axisPos = onX ? wx : wz;
    if (((axisPos % 4) + 4) % 4 === 0) {
      return { type: 'reflector', side: 'center' };
    }
    return { type: 'none', side: 'center' };
  }

  // Barrier-position furniture (lamps, signs)
  const axisPos = onX ? wx : wz;

  if (isTunnel) {
    // Tunnel: lights every 6 voxels, emergency phones every 48
    if (((axisPos % 6) + 6) % 6 === 0) {
      return { type: 'lamp_led', side: 'left' };
    }
    if (((axisPos % 48) + 48) % 48 === 0) {
      return { type: 'emergency_phone', side: 'right' };
    }
    return { type: 'none', side: 'center' };
  }

  // Open road furniture
  const lampSpacing = hwClass === 'autopista' ? 10 : hwClass === 'standard' ? 14 : 20;
  const signSpacing = hwClass === 'autopista' ? 64 : hwClass === 'standard' ? 80 : 120;
  const billboardSpacing = 96;

  // Lamps
  if (((axisPos % lampSpacing) + lampSpacing) % lampSpacing === 0) {
    const lampType = hwClass === 'rural' ? 'lamp_rural'
      : hwClass === 'autopista' ? 'lamp_led'
      : 'lamp_sodium';
    // Alternate left/right
    const side = ((Math.floor(axisPos / lampSpacing) % 2) === 0) ? 'left' : 'right';
    return { type: lampType, side };
  }

  // Direction signs (on right side only)
  if (((axisPos % signSpacing) + signSpacing) % signSpacing === 0) {
    return { type: 'sign_direction', side: 'right' };
  }

  // Speed signs (offset from direction signs)
  if ((((axisPos + Math.floor(signSpacing / 3)) % signSpacing) + signSpacing) % signSpacing === 0) {
    return { type: 'sign_speed', side: 'right' };
  }

  // Billboards (rural and standard only — autopistas are too wide/clean)
  if (hwClass !== 'autopista' && (((axisPos % billboardSpacing) + billboardSpacing) % billboardSpacing === 0)) {
    // Hash to decide if this particular spot gets a billboard (~40%)
    const bh = hashCoord(axisPos * 31, 0, (onX ? wz : wx) * 47);
    if (bh > 0.6) {
      return { type: 'billboard', side: 'right' };
    }
  }

  return { type: 'none', side: 'center' };
}

/** Check if a world-voxel coordinate is on an inter-biome highway.
 *  Returns an object with info about the highway at this position,
 *  or null if the position is not on a highway.
 *
 *  Now includes: highway class, curve offset, furniture info, and
 *  tunnel portal detection. */
export interface InterHighwayInfo {
  onX: boolean;          // highway runs along X axis
  onZ: boolean;          // highway runs along Z axis
  distFromCenterX: number; // signed distance from X-highway center (with curve)
  distFromCenterZ: number; // signed distance from Z-highway center (with curve)
  isMedian: boolean;     // center median
  isBarrier: boolean;    // outermost lane voxels (concrete barrier)
  isShoulder: boolean;   // gravel shoulders outside the road
  isIntersection: boolean; // X-highway crosses Z-highway
  hwClassX: HighwayClass; // class of X-running highway at this position
  hwClassZ: HighwayClass; // class of Z-running highway at this position
  hwHalfWX: number;      // actual half-width of X highway
  hwHalfWZ: number;      // actual half-width of Z highway
  /** True if this position is in the tunnel portal zone (transition from
   *  open road to tunnel — 3-4 voxels of concrete arch). */
  isTunnelPortal: boolean;
  /** Perpendicular distance from the nearest tunnel portal entrance.
   *  0 = at the portal face, positive = inside tunnel approach zone.
   *  -1 if not near a portal. */
  portalDepth: number;
}

export function getInterHighwayInfo(wx: number, wz: number): InterHighwayInfo | null {
  const SHOULDER = 2; // 2 extra voxels of gravel on each side

  // ── X-running highway (grid lines on wz axis) ──
  const gridIdxX = Math.round(wz / INTER_HW_SPACING);
  const snapX = gridIdxX * INTER_HW_SPACING;
  const hwClassX = getHighwayClass(gridIdxX, 0, true);

  // ── Z-running highway (grid lines on wx axis) ──
  const gridIdxZ = Math.round(wx / INTER_HW_SPACING);
  const snapZ = gridIdxZ * INTER_HW_SPACING;
  const hwClassZ = getHighwayClass(0, gridIdxZ, false);

  // Apply curve offset
  const curveX = hwClassX !== 'none' ? hwCurveOffset(wx, gridIdxX) : 0;
  const curveZ = hwClassZ !== 'none' ? hwCurveOffset(wz, gridIdxZ) : 0;

  const distX = (wz - snapX) - Math.round(curveX); // distance from X-running highway center (curved)
  const distZ = (wx - snapZ) - Math.round(curveZ); // distance from Z-running highway center (curved)

  const hwX = hwClassX !== 'none' ? getHWHalfWidth(hwClassX) : 0;
  const hwZ = hwClassZ !== 'none' ? getHWHalfWidth(hwClassZ) : 0;

  const onXroad = hwClassX !== 'none' && Math.abs(distX) <= hwX;
  const onZroad = hwClassZ !== 'none' && Math.abs(distZ) <= hwZ;
  const onXshoulder = !onXroad && hwClassX !== 'none' && Math.abs(distX) <= hwX + SHOULDER;
  const onZshoulder = !onZroad && hwClassZ !== 'none' && Math.abs(distZ) <= hwZ + SHOULDER;

  if (!onXroad && !onZroad && !onXshoulder && !onZshoulder) return null;

  // Determine effective half-width for the dominant highway at this cell
  const effectiveHWX = hwX;
  const effectiveHWZ = hwZ;

  // Median: center 2 voxels
  const medianWidthX = hwClassX === 'autopista' ? 2 : 1;
  const medianWidthZ = hwClassZ === 'autopista' ? 2 : 1;
  const isMedian = (onXroad && Math.abs(distX) <= medianWidthX)
                || (onZroad && Math.abs(distZ) <= medianWidthZ);

  // Barriers: outermost 1-2 voxels
  const barrierWidth = 1;
  const isBarrier = (onXroad && Math.abs(distX) >= effectiveHWX - barrierWidth && Math.abs(distX) <= effectiveHWX)
                 || (onZroad && Math.abs(distZ) >= effectiveHWZ - barrierWidth && Math.abs(distZ) <= effectiveHWZ);

  const isShoulder = onXshoulder || onZshoulder;

  return {
    onX: onXroad || onXshoulder,
    onZ: onZroad || onZshoulder,
    distFromCenterX: distX,
    distFromCenterZ: distZ,
    isMedian,
    isBarrier,
    isShoulder,
    isIntersection: onXroad && onZroad,
    hwClassX,
    hwClassZ,
    hwHalfWX: effectiveHWX,
    hwHalfWZ: effectiveHWZ,
    isTunnelPortal: false, // computed later in chunk.ts with terrain context
    portalDepth: -1,
  };
}
