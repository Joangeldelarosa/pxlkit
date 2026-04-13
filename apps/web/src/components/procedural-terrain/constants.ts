/* ═══════════════════════════════════════════════════════════════
 *  Procedural Terrain — Constants
 * ═══════════════════════════════════════════════════════════════ */

import type { BiomeType, BiomeConfig, ContinentType, ContinentProfile } from './types';

export const CHUNK_SIZE = 16;
export const VOXEL_SIZE = 0.5;
export const MAX_HEIGHT = 64;
export const DEFAULT_CHUNKS_PER_FRAME = 2;
export const PLAYER_HEIGHT = 1.5;
export const NO_FACE = MAX_HEIGHT + 1;
export const DIR_PRECISION = 10;
export const VIEW_DIR_WEIGHT = 2;
export const DIST_PENALTY = 0.5;

/* ── City layout ── */

/** Total city block repeat size (road + lot) */
export const BLOCK_SIZE = 20;
/** Standard road width in voxels (6-wide: edge + 2 lanes + double-yellow center + 2 lanes + edge) */
export const ROAD_W = 6;
/** Avenue width in voxels (9-wide: edge + 2 lanes + divider + median + divider + 2 lanes + edge) */
export const AVENUE_W = 9;
/** Sidewalk width on each side (curb + walkway) */
export const LOT_INSET = 2;
/** Interval for major avenues (every N blocks) */
export const AVENUE_INTERVAL = 4;
/** City highway width in voxels (12-wide: 4 lanes + median + 4 lanes + barriers) */
export const CITY_HW_W = 12;

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
    name: 'Mountains', heightScale: 24, heightBase: 8, waterLevel: 3,
    colors: { top: '#bbccdd', mid: '#8899aa', bottom: '#667788', accent: '#eef4ff', water: '#6699bb' },
  },
  ocean: {
    name: 'Ocean', heightScale: 3, heightBase: 2, waterLevel: 10,
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
  apartment:          ['#ccbbaa', '#bbaa99', '#ddccbb', '#aa9988'],
  hotel:              ['#ddccaa', '#ccbb99', '#eeddbb', '#bbaa88'],
  gas_station:        ['#dddddd', '#cccccc', '#eeeeee'],
  restaurant:         ['#eeddcc', '#ddccbb', '#ffeecc'],
  fire_station:       ['#cc4444', '#bb3333', '#dd5555', '#aa2222'],
  library:            ['#ccbbaa', '#bbaa99', '#ddccbb', '#aa9988'],
  /* ── New building palettes (v2) ── */
  condo:              ['#c8b8a0', '#b8a890', '#d8c8b0', '#a89880'],
  townhouse:          ['#cc9966', '#bb8855', '#ddaa77', '#aa7744'],
  cinema:             ['#444455', '#333344', '#555566', '#222233'],
  police_station:     ['#4466aa', '#3355aa', '#5577bb', '#335599'],
  museum:             ['#e8e0d0', '#d8d0c0', '#f0e8e0', '#c8c0b0'],
  convention_center:  ['#aabbcc', '#99aabb', '#bbccdd', '#88aacc'],
  supermarket:        ['#eeeedd', '#ddddcc', '#ffffee', '#ccccbb'],
  gym:                ['#dd8844', '#cc7733', '#ee9955', '#bb6622'],
  bank:               ['#bbbbcc', '#aaaabc', '#ccccdd', '#9999ab'],
  data_center:        ['#556666', '#445555', '#667777', '#334444'],
  greenhouse:         ['#88cc88', '#77bb77', '#99dd99', '#66aa66'],
  water_tower:        ['#999999', '#888888', '#aaaaaa', '#777777'],
  radio_station:      ['#aaaaaa', '#999999', '#bbbbbb', '#888888'],
  rooftop_garden:     ['#ccbbaa', '#bbaa99', '#ddccbb'],
  mixed_use:          ['#c0b0a0', '#b0a090', '#d0c0b0', '#a09080'],
  loft_building:      ['#aa7755', '#996644', '#bb8866', '#884433'],
  penthouse_tower:    ['#90a0b0', '#80909f', '#a0b0c0', '#70808f'],
  market_hall:        ['#ddbb88', '#ccaa77', '#eedd99', '#bb9966'],
  transit_station:    ['#8899aa', '#7788aa', '#99aabb', '#667799'],
  monument:           ['#ddddcc', '#ccccbb', '#eeeedd', '#bbbbaa'],
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
  apartment: '#886644',
  hotel: '#aa8855',
  gas_station: '#888888',
  restaurant: '#cc6633',
  fire_station: '#882222',
  library: '#886644',
  /* ── New roof colors (v2) ── */
  condo: '#887755', townhouse: '#995533', cinema: '#333344',
  police_station: '#334488', museum: '#aa9977', convention_center: '#556688',
  supermarket: '#998866', gym: '#aa5522', bank: '#777788',
  data_center: '#445555', greenhouse: '#558855', water_tower: '#666666',
  radio_station: '#777777', rooftop_garden: '#44aa55', mixed_use: '#887766',
  loft_building: '#774433', penthouse_tower: '#556677', market_hall: '#aa8844',
  transit_station: '#556677', monument: '#aaaaaa',
};

/* ═══════════════════════════════════════════════════════════════
 *  Continent / Territory System
 *
 *  Continents are the largest-scale procedural feature. They control
 *  base elevation, biome distribution, and the overall "feel" of
 *  huge world regions (100s of chunks across).
 * ═══════════════════════════════════════════════════════════════ */

/** Continent noise frequency — very low for massive landmasses */
export const CONTINENT_SCALE = 0.0008;
/** Secondary continent detail frequency */
export const CONTINENT_DETAIL_SCALE = 0.002;

export const CONTINENT_TYPES: ContinentType[] = [
  'metropolis', 'wilderness', 'archipelago', 'highlands',
  'wasteland', 'farmland', 'volcanic', 'coastal',
];

export const CONTINENT_PROFILES: Record<ContinentType, ContinentProfile> = {
  metropolis: {
    name: 'Metropolis',
    elevationBase: 8,
    elevationScale: 0.3,
    cityDensity: 2.5,
    villageDensity: 0.3,
    waterOffset: -2,
    buildingHeightMult: 1.5,
    colorTint: [0, -0.05, 0.02],
  },
  wilderness: {
    name: 'Wilderness',
    elevationBase: 10,
    elevationScale: 2.2,
    cityDensity: 0,
    villageDensity: 0.2,
    waterOffset: 0,
    buildingHeightMult: 1.0,
    colorTint: [0.02, 0.08, -0.02],
  },
  archipelago: {
    name: 'Archipelago',
    elevationBase: -4,
    elevationScale: 1.8,
    cityDensity: 0.15,
    villageDensity: 0.4,
    waterOffset: 6,
    buildingHeightMult: 0.8,
    colorTint: [0.03, 0.04, 0.04],
  },
  highlands: {
    name: 'Highlands',
    elevationBase: 18,
    elevationScale: 1.6,
    cityDensity: 0.2,
    villageDensity: 0.8,
    waterOffset: -3,
    buildingHeightMult: 0.7,
    colorTint: [0, 0, 0.03],
  },
  wasteland: {
    name: 'Wasteland',
    elevationBase: 5,
    elevationScale: 1.0,
    cityDensity: 0.05,
    villageDensity: 0.1,
    waterOffset: -4,
    buildingHeightMult: 0.6,
    colorTint: [0.04, -0.08, 0.06],
  },
  farmland: {
    name: 'Farmland',
    elevationBase: 7,
    elevationScale: 0.4,
    cityDensity: 0.3,
    villageDensity: 2.5,
    waterOffset: -1,
    buildingHeightMult: 0.5,
    colorTint: [-0.01, 0.06, 0.02],
  },
  volcanic: {
    name: 'Volcanic',
    elevationBase: 12,
    elevationScale: 3.0,
    cityDensity: 0,
    villageDensity: 0,
    waterOffset: 2,
    buildingHeightMult: 1.0,
    colorTint: [0.06, -0.06, -0.04],
  },
  coastal: {
    name: 'Coastal',
    elevationBase: 4,
    elevationScale: 1.2,
    cityDensity: 0.6,
    villageDensity: 1.2,
    waterOffset: 2,
    buildingHeightMult: 1.0,
    colorTint: [0.01, 0.02, 0.02],
  },
};

/* ── Expanded building wall palette variations ──
 *  These are additional palettes that get mixed in based on continent type,
 *  giving buildings in different territories distinct color characters. */
export const CONTINENT_BUILDING_TINTS: Record<ContinentType, [number, number, number]> = {
  metropolis:   [0, -0.04, 0.03],    // cooler, slightly brighter glass towers
  wilderness:   [0.02, 0.05, -0.05], // warm wood tones
  archipelago:  [0.03, 0, 0.06],     // sun-bleached pastel
  highlands:    [0, -0.02, -0.02],   // stone-grey muted
  wasteland:    [0.04, -0.08, 0.04], // sandy, desaturated
  farmland:     [-0.01, 0.04, 0.02], // earthy warm
  volcanic:     [0.05, -0.05, -0.06],// dark, reddish
  coastal:      [0.02, 0, 0.04],     // bright, airy
};
