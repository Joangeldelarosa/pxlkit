import type { PxlKitData } from '@pxlkit/core';

/**
 * 🗺️ QuestMap — 16×16 pixel art rolled quest parchment map
 *
 * A rolled parchment with an X-marks-the-spot and dotted path.
 *
 * Palette:
 *   B = Brown edge  (#8B5E3C)
 *   P = Parchment   (#F5DEB3)
 *   T = Tan path    (#C8A060)
 *   X = Red X mark  (#CC2020)
 *   D = Dark ink    (#5C3A1E)
 */
export const QuestMap: PxlKitData = {
  name: 'quest-map',
  size: 16,
  category: 'gamification',
  grid: [
    '...BBBBBBBBB....',
    '..BPPPPPPPPPB...',
    '..BPPPPPPPPPB...',
    '..BPPXPPPPPPB...',
    '..BPPTPPPPPPB...',
    '..BPPPTPPPPPB...',
    '..BPPPPTPPPPB...',
    '..BPPPPXPPPBB...',
    '..BPPPPPPPPPB...',
    '..BPDDDDDDPDB...',
    '..BPPPPPPPPPB...',
    '..BPPPPPPPPPB...',
    '...BBBBBBBBB....',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#8B5E3C',
    P: '#F5DEB3',
    T: '#C8A060',
    X: '#CC2020',
    D: '#5C3A1E',
  },
  tags: ['map', 'quest', 'parchment', 'navigation', 'adventure', 'rpg'],
  author: 'pxlkit',
};
