import type { PxlKitData } from '@pxlkit/core';

/**
 * 📜 Scroll — 16×16 pixel art scroll icon
 *
 * A rolled parchment for quests, spells, and knowledge.
 *
 * Palette:
 *   P = Parchment (#F5DEB3)
 *   L = Light parchment (#FFF8DC)
 *   D = Dark edge (#D2B48C)
 *   B = Brown rod (#8B4513)
 *   T = Text marks (#8B7355)
 */
export const Scroll: PxlKitData = {
  name: 'scroll',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '...BBBBBBBB.....',
    '..BPPPPPPPPB....',
    '..BLLLLLLLPB....',
    '..BLTTTTTLPB....',
    '..BLLLLLLLPB....',
    '..BLTTTLLLPB....',
    '..BLLLLLLLPB....',
    '..BLTTTTTLPB....',
    '..BLLLLLLLPB....',
    '..BLTTTLLLPB....',
    '..BLLLLLLLPB....',
    '..BPPPPPPPDB....',
    '...BBBBBBBB.....',
    '................',
    '................',
  ],
  palette: {
    'P': '#F5DEB3',
    'L': '#FFF8DC',
    'D': '#D2B48C',
    'B': '#8B4513',
    'T': '#8B7355',
  },
  tags: ['scroll', 'quest', 'spell', 'knowledge', 'parchment', 'mission'],
  author: 'pxlkit',
};
