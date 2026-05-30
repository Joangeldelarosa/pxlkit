import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌙 ClearNight — 16×16 pixel art clear night sky
 *
 * A small gold crescent moon with three twinkling white stars — the
 * "clear / calm night" weather state. Distinct from `full-moon` (full disc)
 * and `crescent-moon` (larger, centred crescent).
 *
 *   M = Moon yellow (#F0C040)
 *   D = Dark edge   (#C89020)
 *   S = Star white  (#FFFFFF)
 */
export const ClearNight: PxlKitData = {
  name: 'clear-night',
  size: 16,
  category: 'weather',
  grid: [
    '................',
    '.S......DDD.....',
    '.......DMMMD....',
    '......DMM..D....',
    '......DMM.......',
    '..........S.....',
    '......DMM.......',
    '......DMM..D....',
    '.......DMMMD....',
    '........DDD.....',
    '..S.............',
    '................',
    '.............S..',
    '................',
    '................',
    '................',
  ],
  palette: {
    M: '#F0C040',
    D: '#C89020',
    S: '#FFFFFF',
  },
  tags: ['night', 'clear', 'moon', 'stars', 'calm', 'weather'],
  author: 'pxlkit',
};
