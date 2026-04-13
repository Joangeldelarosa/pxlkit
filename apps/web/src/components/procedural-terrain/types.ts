/* ═══════════════════════════════════════════════════════════════
 *  Procedural Terrain — Shared Types
 * ═══════════════════════════════════════════════════════════════ */

export type WorldMode = 'infinite' | 'finite';

export interface WorldConfig {
  worldMode: WorldMode;
  worldSize: number;           // finite mode: world width/depth in voxels (16-512)
  renderDistance: number;       // 2-100 chunks
  flySpeed: number;            // 4-120
  treeDensity: number;         // 0-1
  structureDensity: number;    // 0-1
  cityFrequency: number;       // 0-1
  pickupDensity: number;       // 0-1
  fogDensity: number;          // 0-1
  biomeVariation: number;      // 0-1  how much each biome instance varies
  terrainRoughness: number;    // 0-1  extra detail noise amplitude
  particleIntensity: number;   // 0-1  controls ambient particles, birds, critters
  backgroundDetail: number;    // 0-1  distant mountain silhouette layers + haze
  chunkGenSpeed: number;       // 1-20 max chunks generated per frame
  graphicsQuality: 'potato' | 'low' | 'medium' | 'high' | 'ultra' | 'custom';
  timeMode: 'fixed' | 'cycle';   // fixed = locked time, cycle = dynamic day/night
  fixedHour: number;              // 0-24 hour of day when timeMode is 'fixed'
  dayDurationSeconds: number;     // how many real seconds = 24 in-game hours (e.g. 60 = 1 minute per full day)
  boatDensity: number;            // 0-1 controls how many boats spawn on water
  boatDistance: number;           // 2-100 chunk radius for boat spawning (max = renderDistance)
  windowLitProbability: number;   // 0-1 fraction of windows lit at night
  starDensity: number;            // 0-1 controls how many stars appear at night
  lightDistance: number;           // 1-100 chunk radius for window/lamp light rendering (max = renderDistance)
  lightFadeStart: number;          // 0-1 fraction of lightDistance where brightness fade begins (0 = fade from start, 1 = no fade)
  lampBrightness: number;         // 0-3 street lamp brightness multiplier
  lampColorTemp: 'warm' | 'neutral' | 'cool' | 'sodium';  // street lamp color temperature
  npcDensity: number;             // 0-1 how many NPCs per chunk (0 = off)
  npcDistance: number;            // 2-100 chunk radius for NPC population (max = renderDistance)
  npcScale: number;               // 0.25-2.0 NPC body scale multiplier
  npcMaxPerChunk: number;         // 1-50 max NPCs spawned per chunk
  chunkFadeStart: number;         // 0-1 where distance fade begins (0 = from camera, 1 = no fade). Chunks beyond this fraction of renderDistance start fading.
  chunkFadeStrength: number;      // 0-1 intensity of the distance fade (0 = no fade, 1 = chunks at edge fully darkened)
  chunkFadeSpeed: number;         // 0.5-3.0 how fast new chunks fade in from dark to clear (higher = faster)
}

export const DEFAULT_CONFIG: WorldConfig = {
  worldMode: 'infinite',
  worldSize: 128,
  renderDistance: 20,
  flySpeed: 14,
  treeDensity: 0.6,
  structureDensity: 0.6,
  cityFrequency: 0.45,
  pickupDensity: 0.5,
  fogDensity: 0.4,
  biomeVariation: 0.6,
  terrainRoughness: 0.5,
  particleIntensity: 0.7,
  backgroundDetail: 0.85,
  chunkGenSpeed: 4,
  graphicsQuality: 'high',
  timeMode: 'cycle',
  fixedHour: 12,
  dayDurationSeconds: 120,
  boatDensity: 0.5,
  boatDistance: 10,
  windowLitProbability: 0.75,
  starDensity: 0.6,
  lightDistance: 18,
  lightFadeStart: 0.5,
  lampBrightness: 1.2,
  lampColorTemp: 'sodium',
  npcDensity: 0.6,
  npcDistance: 8,
  npcScale: 0.5,
  npcMaxPerChunk: 6,
  chunkFadeStart: 0.6,
  chunkFadeStrength: 0.8,
  chunkFadeSpeed: 1.5,
};

/* ═══════════════════════════════════════════════════════════════
 *  Graphics Presets — 5 named quality levels + 'custom'
 *
 *  Each preset defines every performance-affecting config value.
 *  When a preset is selected the UI overwrites the config.
 *  If the user tweaks any individual slider the quality switches
 *  to 'custom' (preserving all other values).
 * ═══════════════════════════════════════════════════════════════ */

export type GraphicsPresetName = 'potato' | 'low' | 'medium' | 'high' | 'ultra';

/** Partial WorldConfig for the keys each preset controls */
export type GraphicsPresetValues = Pick<WorldConfig,
  | 'renderDistance' | 'chunkGenSpeed' | 'fogDensity'
  | 'chunkFadeStart' | 'chunkFadeStrength' | 'chunkFadeSpeed'
  | 'treeDensity' | 'structureDensity' | 'cityFrequency'
  | 'particleIntensity' | 'backgroundDetail'
  | 'boatDensity' | 'boatDistance'
  | 'windowLitProbability' | 'lightDistance' | 'lampBrightness'
  | 'npcDensity' | 'npcDistance' | 'npcMaxPerChunk'
  | 'starDensity' | 'graphicsQuality'
>;

export const GRAPHICS_PRESETS: Record<GraphicsPresetName, GraphicsPresetValues> = {
  potato: {
    graphicsQuality: 'potato',
    renderDistance: 6,
    chunkGenSpeed: 2,
    fogDensity: 0.6,
    chunkFadeStart: 0.5,
    chunkFadeStrength: 1,
    chunkFadeSpeed: 2.0,
    treeDensity: 0.2,
    structureDensity: 0.2,
    cityFrequency: 0.2,
    particleIntensity: 0,
    backgroundDetail: 0.2,
    boatDensity: 0,
    boatDistance: 4,
    windowLitProbability: 0.3,
    lightDistance: 4,
    lampBrightness: 0.8,
    npcDensity: 0,
    npcDistance: 3,
    npcMaxPerChunk: 2,
    starDensity: 0.2,
  },
  low: {
    graphicsQuality: 'low',
    renderDistance: 12,
    chunkGenSpeed: 3,
    fogDensity: 0.5,
    chunkFadeStart: 0.55,
    chunkFadeStrength: 0.9,
    chunkFadeSpeed: 1.8,
    treeDensity: 0.4,
    structureDensity: 0.4,
    cityFrequency: 0.3,
    particleIntensity: 0.3,
    backgroundDetail: 0.5,
    boatDensity: 0.2,
    boatDistance: 6,
    windowLitProbability: 0.5,
    lightDistance: 8,
    lampBrightness: 1.0,
    npcDensity: 0.3,
    npcDistance: 5,
    npcMaxPerChunk: 3,
    starDensity: 0.4,
  },
  medium: {
    graphicsQuality: 'medium',
    renderDistance: 20,
    chunkGenSpeed: 4,
    fogDensity: 0.4,
    chunkFadeStart: 0.6,
    chunkFadeStrength: 0.8,
    chunkFadeSpeed: 1.5,
    treeDensity: 0.6,
    structureDensity: 0.6,
    cityFrequency: 0.45,
    particleIntensity: 0.7,
    backgroundDetail: 0.85,
    boatDensity: 0.5,
    boatDistance: 10,
    windowLitProbability: 0.75,
    lightDistance: 18,
    lampBrightness: 1.2,
    npcDensity: 0.6,
    npcDistance: 8,
    npcMaxPerChunk: 6,
    starDensity: 0.6,
  },
  high: {
    graphicsQuality: 'high',
    renderDistance: 35,
    chunkGenSpeed: 6,
    fogDensity: 0.35,
    chunkFadeStart: 0.65,
    chunkFadeStrength: 0.75,
    chunkFadeSpeed: 1.2,
    treeDensity: 0.8,
    structureDensity: 0.8,
    cityFrequency: 0.6,
    particleIntensity: 0.85,
    backgroundDetail: 0.95,
    boatDensity: 0.7,
    boatDistance: 20,
    windowLitProbability: 0.85,
    lightDistance: 30,
    lampBrightness: 1.4,
    npcDensity: 0.8,
    npcDistance: 15,
    npcMaxPerChunk: 10,
    starDensity: 0.8,
  },
  ultra: {
    graphicsQuality: 'ultra',
    renderDistance: 60,
    chunkGenSpeed: 10,
    fogDensity: 0.3,
    chunkFadeStart: 0.7,
    chunkFadeStrength: 0.7,
    chunkFadeSpeed: 1.0,
    treeDensity: 1,
    structureDensity: 1,
    cityFrequency: 0.8,
    particleIntensity: 1,
    backgroundDetail: 1,
    boatDensity: 1,
    boatDistance: 40,
    windowLitProbability: 1,
    lightDistance: 50,
    lampBrightness: 1.6,
    npcDensity: 1,
    npcDistance: 30,
    npcMaxPerChunk: 20,
    starDensity: 1,
  },
};

export type BiomeType = 'plains' | 'desert' | 'tundra' | 'forest' | 'mountains' | 'ocean' | 'city' | 'swamp' | 'village';

export interface BiomeConfig {
  name: string;
  heightScale: number;
  heightBase: number;
  waterLevel: number;
  colors: { top: string; mid: string; bottom: string; accent: string; water: string };
}

/* ── Continent / Territory system ── */

/**
 * Large-scale territory types that control terrain elevation, biome distribution,
 * and overall character of huge regions of the world.
 */
export type ContinentType =
  | 'metropolis'    // Dense cityscape: mostly city biome, flat terrain, high buildings
  | 'wilderness'    // Untamed nature: forests, mountains, no cities, dramatic elevation
  | 'archipelago'   // Island chains: mostly ocean with scattered small islands
  | 'highlands'     // Elevated plateaus: high base elevation, rolling hills, sparse villages
  | 'wasteland'     // Barren desert: low vegetation, sand dunes, rare oases
  | 'farmland'      // Rural countryside: flat terrain, villages, crop fields
  | 'volcanic'      // Dramatic peaks: very high mountains, lava-colored accents
  | 'coastal';      // Mixed coast: beaches transitioning to inland, moderate elevation

/**
 * Per-continent profile that modifies terrain generation at a large scale.
 */
export interface ContinentProfile {
  name: string;
  /** Base elevation offset added to the entire continent (can be negative for ocean) */
  elevationBase: number;
  /** Multiplier for height noise amplitude (>1 = more dramatic terrain) */
  elevationScale: number;
  /** How much city biome appears (multiplier on cityFrequency) */
  cityDensity: number;
  /** How much village biome appears (multiplier) */
  villageDensity: number;
  /** Water level offset (positive = more water / flooding) */
  waterOffset: number;
  /** Building height multiplier for city zones */
  buildingHeightMult: number;
  /** Extra color tint applied to terrain [hue, sat, lit] shifts */
  colorTint: [number, number, number];
}

/** Data for one generated chunk */
export interface ChunkVoxelData {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
  waterPositions: Float32Array;
  waterColors: Float32Array;
  waterCount: number;
  pickups: { wx: number; wy: number; wz: number; iconIdx: number }[];
  /** Window positions for night-time lighting: [wx, wy, wz] world coords */
  windowLights: Float32Array;
  windowLightCount: number;
  /** Street lamp light positions: [wx, wy, wz] world coords for night illumination */
  streetLights: Float32Array;
  streetLightCount: number;
  /** Terrain-only top height per cell (ignores buildings/props/water) */
  groundHeightMap: Int32Array;
  /** 1 = NPC can walk/spawn here, 0 = blocked (e.g. buildings) */
  npcWalkableMap: Uint8Array;
  solidHeightMap: Int32Array;
  /** Per-cell water level (from the biome config) for accurate water detection */
  waterLevelMap: Int32Array;
  /** Mini-voxel positions for street furniture (lampposts, hydrants, benches, etc.) */
  miniVoxelPositions: Float32Array;
  /** Mini-voxel colors (r,g,b) */
  miniVoxelColors: Float32Array;
  /** Number of mini-voxels */
  miniVoxelCount: number;
  /** Road paint positions — flat decals (x,y,z) for lane markings, crosswalks */
  paintPositions: Float32Array;
  /** Road paint colors (r,g,b) */
  paintColors: Float32Array;
  /** Road paint sizes: [scaleX, scaleZ] per instance — width in each axis */
  paintScales: Float32Array;
  /** Number of road paint instances */
  paintCount: number;
  chunkX: number;
  chunkZ: number;
  /** Dominant biome type name for this chunk (used by minimap) */
  biome?: string;
  /** Average ground height across chunk cells (used by minimap shading) */
  avgHeight?: number;
}

/* ── City cell classification ── */

export type ZoneType = 'downtown' | 'commercial' | 'residential' | 'industrial' | 'civic';

/** Open zone types for non-building areas within the city biome */
export type OpenZoneType = 'none' | 'farmland' | 'highway_corridor' | 'green_buffer' | 'empty_lot' | 'suburban_yard';

export interface CityCell {
  isRoad: boolean;
  isAvenue: boolean;       // wider major road
  isIntersection: boolean;
  isSidewalk: boolean;
  isBuilding: boolean;
  /** True when this cell is part of an open zone (not a building, road, or sidewalk).
   *  Open zones break up the city grid with farmland, green buffers, empty lots, etc. */
  isOpenZone: boolean;
  /** Type of open zone (only meaningful when isOpenZone is true) */
  openZoneType: OpenZoneType;
  /** Local X within building footprint (0-based), -1 if not building */
  lotLocalX: number;
  /** Local Z within building footprint (0-based), -1 if not building */
  lotLocalZ: number;
  /** World-space lot ID for deterministic seeding */
  lotWorldX: number;
  lotWorldZ: number;
  /** Building footprint width (in cells) — multi-lot buildings span > 1 block */
  buildingW: number;
  /** Building footprint depth (in cells) */
  buildingD: number;
  /** Zone type for this area */
  zone: ZoneType;
  /** Road width at this cell (avenues are wider) */
  roadWidth: number;
  /** Road width in X direction at this cell's block */
  roadWidthX: number;
  /** Road width in Z direction at this cell's block */
  roadWidthZ: number;
  /** True if this road cell is on an intra-city highway (super-avenue) */
  isHighway: boolean;
  /** True if this is a wide city boulevard (12-voxel, 4+4 lane highway) */
  isCityHighway: boolean;
}

/** All building types available in the city */
export type BuildingType =
  | 'skyscraper' | 'skyscraper_twin' | 'skyscraper_stepped'
  | 'office' | 'office_tall'
  | 'tower' | 'tower_telecom'
  | 'house' | 'mansion' | 'castle'
  | 'shop' | 'mall'
  | 'warehouse' | 'factory'
  | 'park' | 'plaza' | 'fountain_plaza'
  | 'parking' | 'parking_garage'
  | 'hospital' | 'school'
  | 'stadium'
  | 'airport_terminal'
  | 'church'
  | 'bridge_base'
  | 'apartment' | 'hotel'
  | 'gas_station' | 'restaurant'
  | 'fire_station' | 'library'
  /* ── New building types (v2) ── */
  | 'condo' | 'townhouse' | 'cinema' | 'police_station'
  | 'museum' | 'convention_center' | 'supermarket' | 'gym'
  | 'bank' | 'data_center' | 'greenhouse' | 'water_tower'
  | 'radio_station' | 'rooftop_garden' | 'mixed_use' | 'loft_building'
  | 'penthouse_tower' | 'market_hall' | 'transit_station' | 'monument';

/** Pickup sprite data */
export interface PickupVoxel { x: number; y: number; color: string }
