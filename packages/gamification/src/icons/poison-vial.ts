import type { PxlKitData } from '@pxlkit/core';

/**
 * ☠️ PoisonVial — 16×16 pixel art green poison vial
 *
 * A slim cylindrical vial filled with bright green poison,
 * with a skull-and-crossbones label.
 *
 * Palette:
 *   G = Glass neck  (#A0C8A0)
 *   P = Poison      (#00D040)
 *   W = White skull (#FFFFFF)
 *   D = Dark glass  (#007020)
 *   K = Cork        (#6B3A1F)
 */
export const PoisonVial: PxlKitData = {
  name: 'poison-vial',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.......K........',
    '......KKK.......',
    '......GGG.......',
    '......GGG.......',
    '.....PPPPP......',
    '.....PPWPP......',
    '....PPPPPPP.....',
    '....PPWPWPP.....',
    '...PPPPPPPPP....',
    '...PPPWPWPPP....',
    '....PPPPPPP.....',
    '....DDDDDDD.....',
    '.....DDDDD......',
    '................',
    '................',
  ],
  palette: {
    G: '#A0C8A0',
    P: '#00D040',
    W: '#FFFFFF',
    D: '#007020',
    K: '#6B3A1F',
  },
  tags: ['poison', 'vial', 'toxic', 'green', 'status', 'consumable', 'rpg'],
  author: 'pxlkit',
};
