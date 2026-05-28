import type { IconAppearance } from '@pxlkit/core';
import {
  APPEARANCES,
  BACKGROUNDS,
  CELL_MAX,
  CELL_MIN,
  DEFAULT_CELL,
  DEFAULT_FRAME,
  DEFAULT_GRID_COLOR,
  DEFAULT_PLAYING,
  DEFAULT_SIZES,
  DEFAULT_VIEW,
  FRAME_MAX,
  PACK_IDS,
  SIZE_MAX,
  SIZE_MIN,
  VIEWS,
  type Background,
  type CollectionView,
  type InspectorState,
} from './types';

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const isHex = (v: string | null): v is string => !!v && HEX.test(v);
const oneOf = <T extends string>(v: string | null, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(v ?? '') ? (v as T) : fallback;

function parseSizes(raw: string | null): number[] {
  if (!raw) return [...DEFAULT_SIZES];
  const nums = raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n))
    .map((n) => clamp(n, SIZE_MIN, SIZE_MAX));
  const uniq = Array.from(new Set(nums)).sort((a, b) => a - b);
  return uniq.length ? uniq : [...DEFAULT_SIZES];
}

export function parseInspectorParams(sp: URLSearchParams): InspectorState {
  const icon = sp.get('icon') || null;
  const gridRaw = sp.get('grid');
  const grid = gridRaw === null ? icon != null : gridRaw === '1' || gridRaw === 'true';
  const cellRaw = parseInt(sp.get('cell') ?? '', 10);
  const playingRaw = sp.get('playing');
  const frameRaw = parseInt(sp.get('frame') ?? '', 10);

  return {
    pack: oneOf(sp.get('pack'), PACK_IDS, 'gamification'),
    icon,
    sizes: parseSizes(sp.get('sizes')),
    grid,
    gridColor: isHex(sp.get('gridColor')) ? (sp.get('gridColor') as string) : DEFAULT_GRID_COLOR,
    bg: oneOf<Background>(sp.get('bg'), BACKGROUNDS, 'checker'),
    appearance: oneOf<IconAppearance>(sp.get('appearance'), APPEARANCES, 'palette'),
    color: isHex(sp.get('color')) ? (sp.get('color') as string) : null,
    cell: Number.isFinite(cellRaw) ? clamp(cellRaw, CELL_MIN, CELL_MAX) : DEFAULT_CELL,
    view: oneOf<CollectionView>(sp.get('view'), VIEWS, DEFAULT_VIEW),
    playing: playingRaw === null ? DEFAULT_PLAYING : playingRaw === '1' || playingRaw === 'true',
    frame: Number.isFinite(frameRaw) ? clamp(frameRaw, 0, FRAME_MAX) : DEFAULT_FRAME,
  };
}

export function serializeInspectorParams(state: InspectorState): string {
  const sp = new URLSearchParams();
  sp.set('pack', state.pack);
  if (state.icon) sp.set('icon', state.icon);
  sp.set('sizes', state.sizes.join(','));
  sp.set('grid', state.grid ? '1' : '0');
  sp.set('gridColor', state.gridColor);
  sp.set('bg', state.bg);
  sp.set('appearance', state.appearance);
  if (state.color) sp.set('color', state.color);
  sp.set('cell', String(state.cell));
  sp.set('view', state.view);
  sp.set('playing', state.playing ? '1' : '0');
  sp.set('frame', String(state.frame));
  return sp.toString();
}
