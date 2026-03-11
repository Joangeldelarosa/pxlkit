import type { PxlKitData } from '@pxlkit/core';

/**
 * ⏸ Pause — 16×16 pixel art pause button icon
 *
 * Two vertical bars for pause actions.
 */
export const Pause: PxlKitData = {
  name: 'pause',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '...GGG..GGG.....',
    '................',
    '................',
  ],
  palette: {
    G: '#FFD700',
  },
  tags: ['pause', 'stop', 'hold', 'media'],
};
