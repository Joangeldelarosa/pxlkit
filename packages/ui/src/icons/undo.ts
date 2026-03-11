import type { PxlKitData } from '@pxlkit/core';

/**
 * ↩ Undo — 16×16 pixel art undo arrow icon
 *
 * A curved left-pointing arrow for undo actions.
 */
export const Undo: PxlKitData = {
  name: 'undo',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '....G...........',
    '...GG...........',
    '..GGGGGGGGG.....',
    '...GGGGGGGGGG...',
    '....G.....GGGG..',
    '..........GGGG..',
    '..........GGGG..',
    '..........GGGG..',
    '.........GGGG...',
    '........GGGG....',
    '.....GGGGG......',
    '................',
    '................',
    '................',
  ],
  palette: {
    G: '#AAAAAA',
  },
  tags: ['undo', 'back', 'reverse', 'history', 'revert'],
};
