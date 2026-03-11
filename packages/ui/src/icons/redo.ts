import type { PxlKitData } from '@pxlkit/core';

/**
 * ↪ Redo — 16×16 pixel art redo arrow icon
 *
 * A curved right-pointing arrow for redo actions.
 */
export const Redo: PxlKitData = {
  name: 'redo',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '...........G....',
    '...........GG...',
    '.....GGGGGGGGG..',
    '...GGGGGGGGGG...',
    '..GGGG.....G....',
    '..GGGG..........',
    '..GGGG..........',
    '..GGGG..........',
    '...GGGG.........',
    '....GGGG........',
    '......GGGGG.....',
    '................',
    '................',
    '................',
  ],
  palette: {
    G: '#AAAAAA',
  },
  tags: ['redo', 'forward', 'repeat', 'history'],
};
