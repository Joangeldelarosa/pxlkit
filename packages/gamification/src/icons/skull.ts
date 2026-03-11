import type { PxlKitData } from '@pxlkit/core';

/**
 * 💀 Skull — 16×16 pixel art skull icon
 *
 * A classic skull for danger, death, and hardcore modes.
 * Redesigned for better symmetry and cleaner pixel art.
 *
 * Palette:
 *   W = White bone (#F0EEE8)
 *   G = Gray shadow (#BABABA)
 *   D = Dark outline (#5A5A5A)
 *   K = Black eye socket (#222222)
 */
export const Skull: PxlKitData = {
  name: 'skull',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '......DDDDD.....',
    '....DDWWWWWDD...',
    '...DWWWWWWWWWD..',
    '...DWWWWWWWWWD..',
    '...DWKWWWWKWWD..',
    '...DWKKWWKKKWD..',
    '...DWWWWWWWWWD..',
    '...DWWGDGWWWWD..',
    '....DWWDDWWDD...',
    '....DGGWWWGGD...',
    '.....DDDDDDDD...',
    '.....DWDWDWD....',
    '.....WDWDWDW....',
    '................',
    '................',
  ],
  palette: {
    'W': '#F0EEE8',
    'G': '#BABABA',
    'D': '#5A5A5A',
    'K': '#222222',
  },
  tags: ['skull', 'danger', 'death', 'hardcore', 'skeleton', 'warning'],
  author: 'pxlkit',
};
