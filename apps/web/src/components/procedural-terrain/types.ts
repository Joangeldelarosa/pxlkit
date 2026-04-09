/* ═══════════════════════════════════════════════════════════════
 *  Procedural Terrain — Shared Types
 * ═══════════════════════════════════════════════════════════════ */

export type WorldMode = 'infinite' | 'finite';

export interface WorldConfig {
  worldMode: WorldMode;
  worldSize: number;           // finite mode: world width/depth in voxels (16-512)
  renderDistance: number;       // 2-50 chunks
  flySpeed: number;
  treeDensity: number;         // 0-1
  structureDensity: number;    // 0-1
  cityFrequency: number;       // 0-1
  pickupDensity: number;       // 0-1
  fogDensity: number;          // 0-1
  biomeVariation: number;      // 0-1  how much each biome instance varies
  terrainRoughness: number;    // 0-1  extra detail noise amplitude
  particleIntensity: number;   // 0-1  controls ambient particles, birds, critters
  backgroundDetail: number;    // 0-1  distant mountain silhouette layers + haze
  chunkGenSpeed: number;       // 1-10 max chunks generated per frame
  graphicsQuality: 'low' | 'medium' | 'high';
  voxelDetail: number;         // 0-16 subdivisions for nearby surface detail
  detailDistance: number;       // 1-20 radius in voxel-units for surface detail rendering
  detailSharpness: number;     // 0-1 unified texture intensity (drives height, gaps, color, scale)
  detailMaxInstances: number;  // 1000-200000 max mini-voxel instances (GPU budget)
}

export const DEFAULT_CONFIG: WorldConfig = {
  worldMode: 'infinite',
  worldSize: 128,
  renderDistance: 5,
  flySpeed: 12,
  treeDensity: 0.5,
  structureDensity: 0.5,
  cityFrequency: 0.4,
  pickupDensity: 0.5,
  fogDensity: 0.5,
  biomeVariation: 0.5,
  terrainRoughness: 0.5,
  particleIntensity: 0.7,
  backgroundDetail: 0.8,
  chunkGenSpeed: 2,
  graphicsQuality: 'medium',
  voxelDetail: 2,
  detailDistance: 3,
  detailSharpness: 0.5,
  detailMaxInstances: 12000,
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
  solidHeightMap: Int32Array;
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
}

/** All building types available in the city */
export type BuildingType =
  | 'skyscraper' | 'skyscraper_twin' | 'skyscraper_stepped'
  | 'office' | 'office_tall'
  | 'tower' | 'tower_telecom'
  | 'house' | 'mansion'
  | 'shop' | 'mall'
  | 'warehouse' | 'factory'
  | 'park' | 'plaza' | 'fountain_plaza'
  | 'parking' | 'parking_garage'
  | 'hospital' | 'school'
  | 'stadium'
  | 'airport_terminal'
  | 'church'
  | 'bridge_base';

/** Pickup sprite data */
export interface PickupVoxel { x: number; y: number; color: string }
