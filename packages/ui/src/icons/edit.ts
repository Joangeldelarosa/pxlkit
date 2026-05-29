import type { PxlKitData } from '@pxlkit/core';

/**
 * ✏️ Edit — 16×16 pixel art edit / write icon
 *
 * Diagonal pencil tip drawing a horizontal underline — the act of editing
 * (not just a pencil on its own; see the `pencil` icon for that). The line
 * across the bottom-left signals "writing / modifying" so the silhouette
 * differs from the plain pencil even at 16 px.
 *
 *   Y = Yellow body (#FFD700)
 *   P = Pink eraser (#FF99AA)
 *   G = Grey band   (#AABBCC)
 *   D = Dark tip    (#334455)
 *   O = Outline     (#443322)
 *   L = Line drawn  (#5B9BD5)
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
    '.....OYYYYYYYO..',
    '....OYYYYYYYOO..',
    '...OYYYYYYYOO...',
    '..ODYYYYYYOO....',
    '..DDDYYYYDOO....',
    '..DDDDDDDOO.....',
    '..DDDDDDOO......',
    '...DDDDO........',
    'LLLLLLLLLLLLLL..',
    '................',
  ],
  palette: {
    Y: '#FFD700',
    P: '#FF99AA',
    G: '#AABBCC',
    D: '#334455',
    O: '#443322',
    L: '#5B9BD5',
  },
  tags: ['edit', 'pencil', 'write', 'modify', 'compose', 'ui'],
  author: 'pxlkit',
};
