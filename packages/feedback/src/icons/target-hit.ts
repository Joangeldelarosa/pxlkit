import type { PxlKitData } from '@pxlkit/core';

/**
 * 🎯✓ TargetHit — 16×16 pixel art target with checkmark hit
 *
 * A bullseye with a green checkmark arrow hitting center — "goal achieved".
 *
 * Palette:
 *   R = Red target    (#E74C3C)
 *   W = White ring    (#FFFFFF)
 *   G = Green arrow   (#00CC44)
 *   D = Arrow dark    (#008822)
 */
export const TargetHit: PxlKitData = {
  name: 'target-hit',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '.....RRRRR......',
    '...RRWWWWWRR....',
    '..RWWWRRRRWWR...',
    '.RWWRR....RRWR..',
    '.RWRR......RRW..',
    '.RWR........RW..',
    '.RWR...GG...RW..',
    '.RWR..GGDG..RW..',
    '.RWRR.GDDGRRW...',
    '.RWWRRGDRRWR....',
    '..RWWWGDWWR.....',
    '...RRGDWRR......',
    '.....GD.........',
    '......G.........',
    '................',
  ],
  palette: {
    R: '#E74C3C',
    W: '#FFFFFF',
    G: '#00CC44',
    D: '#008822',
  },
  tags: ['target', 'hit', 'goal', 'success', 'bullseye', 'feedback'],
  author: 'pxlkit',
};
