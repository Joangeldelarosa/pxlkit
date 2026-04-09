/* ═══════════════════════════════════════════════════════════════
 *  Procedural Terrain — Constants
 * ═══════════════════════════════════════════════════════════════ */

import type { BiomeType, BiomeConfig } from './types';

export const CHUNK_SIZE = 16;
export const VOXEL_SIZE = 0.5;
export const MAX_HEIGHT = 32;
export const DEFAULT_CHUNKS_PER_FRAME = 2;
export const PLAYER_HEIGHT = 1.5;
export const NO_FACE = MAX_HEIGHT + 1;
export const DIR_PRECISION = 10;
export const VIEW_DIR_WEIGHT = 2;
export const DIST_PENALTY = 0.5;

/* ── City layout ── */

/** Total city block repeat size (road + lot) */
export const BLOCK_SIZE = 10;
/** Standard road width in voxels */
export const ROAD_W = 2;
/** Avenue width in voxels (wider major roads) */
export const AVENUE_W = 3;
/** Sidewalk width on each side */
export const LOT_INSET = 1;
/** Interval for major avenues (every N blocks) */
export const AVENUE_INTERVAL = 4;

/* ── Biome definitions ── */

export const BIOMES: Record<BiomeType, BiomeConfig> = {
  plains: {
    name: 'Plains', heightScale: 5, heightBase: 7, waterLevel: 5,
    colors: { top: '#66ee88', mid: '#cc8844', bottom: '#99aabb', accent: '#ccaaff', water: '#88ddff' },
  },
  desert: {
    name: 'Desert', heightScale: 4, heightBase: 6, waterLevel: 2,
    colors: { top: '#ffeecc', mid: '#ddbb88', bottom: '#aa8866', accent: '#88cc55', water: '#66bbdd' },
  },
  tundra: {
    name: 'Tundra', heightScale: 6, heightBase: 7, waterLevel: 4,
    colors: { top: '#eef4ff', mid: '#99aabb', bottom: '#778899', accent: '#aaddff', water: '#77ccee' },
  },
  forest: {
    name: 'Forest', heightScale: 7, heightBase: 8, waterLevel: 5,
    colors: { top: '#339955', mid: '#886644', bottom: '#556655', accent: '#ee5544', water: '#55aacc' },
  },
  mountains: {
    name: 'Mountains', heightScale: 18, heightBase: 5, waterLevel: 3,
    colors: { top: '#bbccdd', mid: '#8899aa', bottom: '#667788', accent: '#eef4ff', water: '#6699bb' },
  },
  ocean: {
    name: 'Ocean', heightScale: 3, heightBase: 2, waterLevel: 8,
    colors: { top: '#ffeecc', mid: '#ddcc99', bottom: '#99aabb', accent: '#ff9999', water: '#4499cc' },
  },
  city: {
    name: 'City', heightScale: 1, heightBase: 7, waterLevel: 5,
    colors: { top: '#888888', mid: '#666666', bottom: '#444444', accent: '#ffdd44', water: '#88ddff' },
  },
  swamp: {
    name: 'Swamp', heightScale: 3, heightBase: 6, waterLevel: 6,
    colors: { top: '#5a7a4a', mid: '#4a5a3a', bottom: '#3a4a2a', accent: '#7a9a5a', water: '#4a7744' },
  },
  village: {
    name: 'Village', heightScale: 4, heightBase: 7, waterLevel: 4,
    colors: { top: '#88cc66', mid: '#aa8855', bottom: '#887755', accent: '#ddaa44', water: '#77bbdd' },
  },
};

export const BIOME_TYPES: BiomeType[] = ['plains', 'desert', 'tundra', 'forest', 'mountains', 'ocean', 'city', 'swamp', 'village'];

/** Region scale — how large a single biome "patch" is in voxels */
export const REGION_SCALE = 0.003;

/* ── Building palettes ── */

export const BUILDING_WALL_PALETTES: Record<string, string[]> = {
  skyscraper:         ['#8899aa', '#99aabb', '#7788aa', '#aabbcc', '#6688aa'],
  skyscraper_twin:    ['#7799bb', '#88aacc', '#6688aa', '#99bbdd'],
  skyscraper_stepped: ['#8888aa', '#9999bb', '#7777aa', '#aaaacc'],
  tower:              ['#778899', '#8899aa', '#6677aa', '#99aacc'],
  tower_telecom:      ['#888888', '#999999', '#777777'],
  office:             ['#bbaa88', '#ccbb99', '#aa9977', '#c4a882'],
  office_tall:        ['#aa9988', '#bb9977', '#998866'],
  warehouse:          ['#998877', '#887766', '#aa9988', '#776655'],
  factory:            ['#888888', '#777777', '#999999', '#666666'],
  shop:               ['#ddccbb', '#eeddcc', '#ccbbaa', '#ffeecc'],
  mall:               ['#ccbbaa', '#ddccbb', '#bbaa99', '#eeddcc'],
  house:              ['#ddccaa', '#ccbb99', '#eeddbb', '#d4c098'],
  mansion:            ['#eeddcc', '#ddccbb', '#ffeecc', '#d4c8a8'],
  castle:             ['#8899aa', '#778899', '#99aabb', '#667788'],
  hospital:           ['#ddeeff', '#ccddef', '#bbccdd'],
  school:             ['#ddcc99', '#ccbb88', '#eedd99'],
  church:             ['#ccbbaa', '#bbaa99', '#ddccbb'],
  stadium:            ['#aaaaaa', '#999999', '#bbbbbb'],
  parking_garage:     ['#888888', '#777777', '#999999'],
  airport_terminal:   ['#bbccdd', '#aabbcc', '#99aabb', '#ccdded'],
};

export const BUILDING_ROOF_COLORS: Record<string, string> = {
  skyscraper: '#556677', skyscraper_twin: '#445566', skyscraper_stepped: '#556688',
  tower: '#445566', tower_telecom: '#555555',
  office: '#886644', office_tall: '#775544',
  warehouse: '#665544', factory: '#555555',
  shop: '#cc8844', mall: '#bb7744',
  house: '#cc6633', mansion: '#aa5533', castle: '#556677',
  hospital: '#dddddd', school: '#cc9944',
  church: '#886644', stadium: '#777777',
  parking_garage: '#666666',
  airport_terminal: '#667788',
};
