import type { IconAppearance } from '@pxlkit/core';

export type Background = 'checker' | 'dark' | 'light';
export type InspectorMode = 'single' | 'collection';
/** How a whole collection is laid out when no single icon is selected. */
export type CollectionView = 'grid' | 'slider' | 'strip';

export interface InspectorState {
  /** Pack id (one of PACK_IDS). */
  pack: string;
  /** Selected icon name, or null for contact-sheet mode. */
  icon: string | null;
  /** Render sizes in px (sorted asc, deduped, clamped 1..512). */
  sizes: number[];
  /** Pixel-grid overlay on/off. */
  grid: boolean;
  /** Overlay stroke color (hex). */
  gridColor: string;
  /** Stage background. */
  bg: Background;
  /** Color mode passed to PxlKitIcon. */
  appearance: IconAppearance;
  /** Tint/solid color (hex) or null. */
  color: string | null;
  /** Cell size in px for collection views. */
  cell: number;
  /** Collection layout (applies only when no single icon is selected). */
  view: CollectionView;
  /** Animated icons play (true) or freeze on `frame` (false). */
  playing: boolean;
  /** Frame index shown when an animated icon is paused. */
  frame: number;
}

export const PACK_IDS = [
  'gamification',
  'feedback',
  'social',
  'weather',
  'ui',
  'effects',
] as const;

export const BACKGROUNDS: Background[] = ['checker', 'dark', 'light'];
export const APPEARANCES: IconAppearance[] = ['palette', 'tinted', 'solid'];
export const VIEWS: CollectionView[] = ['grid', 'slider', 'strip'];

export const DEFAULT_SIZES = [16, 24, 32, 48, 64, 128, 256];
export const DEFAULT_GRID_COLOR = '#00E5A0';
export const DEFAULT_CELL = 64;
export const DEFAULT_VIEW: CollectionView = 'grid';
export const DEFAULT_PLAYING = true;
export const DEFAULT_FRAME = 0;
export const FRAME_MAX = 63;
export const SIZE_MIN = 1;
export const SIZE_MAX = 512;
export const CELL_MIN = 8;
export const CELL_MAX = 256;

export function modeOf(state: InspectorState): InspectorMode {
  return state.icon ? 'single' : 'collection';
}
