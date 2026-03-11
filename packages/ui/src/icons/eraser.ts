import type { PxlKitData } from '@pxlkit/core';

/**
 * 🧹 Eraser — 16×16 pixel art eraser icon
 *
 * A rectangular eraser for removing/clearing.
 */
export const Eraser: PxlKitData = {
  name: 'eraser',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '........GGGGGG..',
    '.......GPPPPGG..',
    '......GPPPPGG...',
    '.....GPPPPGG....',
    '....GPPPPGG.....',
    '...GPPPPGG......',
    '..GPPPPGG.......',
    '..GWWWGG........',
    '..GWWWG.........',
    '..GWWGG.........',
    '..GWGG..........',
    '..GGG...........',
    '...G............',
    '................',
  ],
  palette: {
    G: '#555555',
    P: '#FF8FAB',
    W: '#FFFFFF',
  },
  tags: ['eraser', 'delete', 'remove', 'clear', 'tool'],
};
