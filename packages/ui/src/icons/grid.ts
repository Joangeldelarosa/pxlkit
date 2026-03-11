import type { PxlKitData } from '@pxlkit/core';

/**
 * ⊞ Grid — 16×16 pixel art grid layout icon
 *
 * A 2×2 grid of squares — gallery view, grid layout, app drawer.
 *
 * Palette:
 *   B = Block blue (#5B9BD5)
 *   O = Outline    (#334455)
 */
export const Grid: PxlKitData = {
  name: 'grid',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '..OOOOOOOOOOO...',
    '..OBBOOOBBBOO...',
    '..OBBOOOBBBOO...',
    '..OBBOOOBBBOO...',
    '..OOOOOOOOOOO...',
    '..OOOOOOOOOOO...',
    '..OBBOOOBBBOO...',
    '..OBBOOOBBBOO...',
    '..OBBOOOBBBOO...',
    '..OBBOOOBBBOO...',
    '..OOOOOOOOOOO...',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#5B9BD5',
    O: '#334455',
  },
  tags: ['grid', 'gallery', 'layout', 'tiles', 'ui'],
  author: 'pxlkit',
};
