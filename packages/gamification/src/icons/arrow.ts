import type { PxlKitData } from '@pxlkit/core';

/**
 * 🏹 Arrow — a clean arrow pointing right: a small green chevron of fletching
 * at the tail, a thin brown shaft, and a prominent steel arrowhead (►) with a
 * white tip glint. The old version had an oversized green fletching blob and a
 * weak tip, so it read as a fish.
 *
 *   S = Steel head (#C0C0C0)
 *   B = Brown shaft (#8B4513)
 *   G = Green fletching (#228B22)
 *   W = Tip glint (#FFFFFF)
 */
export const Arrow: PxlKitData = {
  name: 'arrow',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '................',
    '................',
    '................',
    '..........S.....',
    '.GG.......SS....',
    '..GG......SSS...',
    '...GBBBBBBSSSSW.',
    '...GBBBBBBSSSSW.',
    '..GG......SSS...',
    '.GG.......SS....',
    '..........S.....',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    S: '#C0C0C0',
    B: '#8B4513',
    G: '#228B22',
    W: '#FFFFFF',
  },
  tags: ['arrow', 'projectile', 'direction', 'quest', 'ranged', 'bow'],
  author: 'pxlkit',
};
