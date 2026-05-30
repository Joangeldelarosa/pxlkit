import type { PxlKitData } from '@pxlkit/core';

/**
 * 🧹 Eraser — 16×16 pixel art eraser icon
 *
 * Classic two-tone block eraser sitting upright: pink top half + grey
 * bottom half + dark outline. Cleaner silhouette than the previous tilted
 * pencil-eraser hybrid, and clearly reads as the universal eraser block at
 * 16 px.
 *
 *   P = Pink top   (#FF8FAB)
 *   G = Grey body  (#BFBFBF)
 *   O = Outline    (#333333)
 */
export const Eraser: PxlKitData = {
  name: 'eraser',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '................',
    '...OOOOOOOOOO...',
    '..OPPPPPPPPPPO..',
    '..OPPPPPPPPPPO..',
    '..OPPPPPPPPPPO..',
    '..OOOOOOOOOOOO..',
    '..OGGGGGGGGGGO..',
    '..OGGGGGGGGGGO..',
    '..OGGGGGGGGGGO..',
    '..OGGGGGGGGGGO..',
    '...OOOOOOOOOO...',
    '................',
    '................',
    '................',
  ],
  palette: {
    P: '#FF8FAB',
    G: '#BFBFBF',
    O: '#333333',
  },
  tags: ['eraser', 'delete', 'remove', 'clear', 'tool'],
  author: 'pxlkit',
};
