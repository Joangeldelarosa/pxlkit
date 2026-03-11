import type { PxlKitData } from '@pxlkit/core';

/**
 * ✏️ Edit — 16×16 pixel art edit / pencil icon
 *
 * A diagonal pencil with eraser — edit, write, modify, compose.
 *
 * Palette:
 *   Y = Yellow body (#FFD700)
 *   P = Pink eraser (#FF99AA)
 *   G = Grey band   (#AABBCC)
 *   D = Dark tip    (#334455)
 *   O = Outline     (#443322)
 */
export const Edit: PxlKitData = {
  name: 'edit',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '..........PPPP..',
    '.........PGGGP..',
    '........PYYYYP..',
    '.......OYYYYYP..',
    '......OYYYYYYY..',
    '.....OYYYYYYYYY.',
    '....OYYYYYYYYYO.',
    '...OYYYYYYYYYOO.',
    '..ODYYYYYYYYYOO.',
    '..DDYYYYYYYDOO..',
    '..DDDYYYYDDO....',
    '..DDDDDDDDO.....',
    '...DDDDDO.......',
    '................',
    '................',
  ],
  palette: {
    Y: '#FFD700',
    P: '#FF99AA',
    G: '#AABBCC',
    D: '#334455',
    O: '#443322',
  },
  tags: ['edit', 'pencil', 'write', 'modify', 'compose', 'ui'],
  author: 'pxlkit',
};
