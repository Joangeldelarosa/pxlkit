import type { PxlKitData } from '@pxlkit/core';

/**
 * ✦ SparkleSmall — 16×16 pixel art small sparkle/diamond icon
 *
 * A small four-pointed sparkle for decorative indicators.
 */
export const SparkleSmall: PxlKitData = {
  name: 'sparkle-small',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '.......G........',
    '.......G........',
    '......GGG.......',
    '.....GGGGG......',
    '....GGGGGGG.....',
    '...GGGGGGGGG....',
    '....GGGGGGG.....',
    '.....GGGGG......',
    '......GGG.......',
    '.......G........',
    '.......G........',
    '................',
    '................',
    '................',
  ],
  palette: {
    G: '#FFD700',
  },
  tags: ['sparkle', 'star', 'special', 'indicator', 'diamond'],
};
