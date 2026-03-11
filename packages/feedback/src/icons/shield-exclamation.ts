import type { PxlKitData } from '@pxlkit/core';

/**
 * 🛡️! ShieldExclamation — 16×16 pixel art shield with exclamation
 *
 * An orange shield with a white ! — security warning or policy issue.
 *
 * Palette:
 *   O = Orange      (#E67E22)
 *   D = Dark orange (#CA6F1E)
 *   W = White mark  (#FFFFFF)
 *   L = Light tint  (#F0A04B)
 */
export const ShieldExclamation: PxlKitData = {
  name: 'shield-exclamation',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '....OOOOOOOO....',
    '...OOOOOOOOOOO..',
    '..OOOOLOOOOLOO..',
    '..OOOOWOOOOOO...',
    '..OOOOWOOOOOO...',
    '..OOOOWOOOOOO...',
    '..OOOOWOOOOO....',
    '..OOOOO.OOOO....',
    '..OOOOWOOOO.....',
    '..OOOOWOOO......',
    '...OOOOOOO......',
    '....OOOOOOO.....',
    '.....OOOOOO.....',
    '......OOOO......',
    '.......OO.......',
  ],
  palette: {
    O: '#E67E22',
    D: '#CA6F1E',
    W: '#FFFFFF',
    L: '#F0A04B',
  },
  tags: ['shield', 'exclamation', 'warning', 'alert', 'security', 'feedback'],
  author: 'pxlkit',
};
