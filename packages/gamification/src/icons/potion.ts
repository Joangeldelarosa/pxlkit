import type { PxlKitData } from '@pxlkit/core';

/**
 * 🧪 Potion — 16×16 pixel art potion bottle icon
 *
 * A magical potion bottle for buffs and power-ups.
 *
 * Palette:
 *   G = Glass (#C0C0C0)
 *   P = Purple liquid (#9B59B6)
 *   L = Light purple (#BB77DD)
 *   D = Dark purple (#6C3483)
 *   K = Cork (#DEB887)
 *   W = White shine (#FFFFFF)
 */
export const Potion: PxlKitData = {
  name: 'potion',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '......KKKK......',
    '......GGGD......',
    '......GGGD......',
    '.....GGGGGD.....',
    '....GGGGGGGD....',
    '...GG.PPPPPGD...',
    '...GWPPPPPPGD...',
    '...GWLPPPPPDD...',
    '...GPLLPPPPDDD..',
    '...GPPPPPPPDDD..',
    '...GPPPPPPPDD...',
    '....GPPPPPDDD...',
    '.....DDDDDDD....',
    '................',
    '................',
  ],
  palette: {
    'G': '#C0C0C0',
    'P': '#9B59B6',
    'L': '#BB77DD',
    'D': '#708090',
    'K': '#DEB887',
    'W': '#FFFFFF',
  },
  tags: ['potion', 'magic', 'buff', 'heal', 'powerup', 'alchemy'],
  author: 'pxlkit',
};
