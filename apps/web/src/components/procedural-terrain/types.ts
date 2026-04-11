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
  graphicsQuality: 'low' | 'medium' | 'high';
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
  chunkFadeStart: number;         // 0-1 where distance fade begins (0 = from camera, 1 = no fade). Chunks beyond this start fading into atmosphere.
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
  chunkFadeStart: 0.5,
};

export type BiomeType = 'plains' | 'desert' | 'tundra' | 'forest' | 'mountains' | 'ocean' | 'city' | 'swamp' | 'village';

export interface BiomeConfig {
  name: string;
  heightScale: number;
  heightBase: number;
  waterLevel: number;
  colors: { top: string; mid: string; bottom: string; accent: string; water: string };
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
}

/* ── City cell classification ── */

export type ZoneType = 'downtown' | 'commercial' | 'residential' | 'industrial' | 'civic';

export interface CityCell {
  isRoad: boolean;
  isAvenue: boolean;       // wider major road
  isIntersection: boolean;
  isSidewalk: boolean;
  isBuilding: boolean;
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
  | 'fire_station' | 'library';

/** Pickup sprite data */
export interface PickupVoxel { x: number; y: number; color: string }
