import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌙☁️ CloudyNight — 16×16 pixel art cloudy night
 *
 * A crescent moon peeking behind a dark cloud — overcast night.
 *
 * Palette:
 *   M = Moon yellow (#F0C040)
 *   C = Cloud grey  (#778899)
 *   L = Cloud light (#99AABB)
 *   N = Navy sky    (#1A2A4A)
 */
export const CloudyNight: PxlKitData = {
  name: 'cloudy-night',
  size: 16,
  category: 'weather',
  grid: [
    '................',
    '................',
    '..........MMMM..',
    '.........MMMMMM.',
    '........MMMMMMMM',
    '...LLC.CCMMMMMMM',
    '..LCCCCCCCMMMMM.',
    '.LCCCCCCCCCCCC..',
    '.LCCCCCCCCCCCC..',
    '..LCCCCCCCCCCC..',
    '...CCCCCCCCCC...',
    '....CCCCCCCC....',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    M: '#F0C040',
    C: '#778899',
    L: '#99AABB',
    N: '#1A2A4A',
  },
  tags: ['night', 'cloudy', 'moon', 'overcast', 'weather'],
  author: 'pxlkit',
};
