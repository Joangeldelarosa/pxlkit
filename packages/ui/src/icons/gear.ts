import type { PxlKitData } from '@pxlkit/core';

/**
 * ⚙️ Gear — 16×16 pixel art gear cog
 *
 * Classic 8-tooth cog: a tooth at each of the 4 cardinal directions plus
 * 4 corner teeth, with a clear circular centre hole. Cleaner silhouette
 * than the previous noisy scatter of white pixels — reads as a gear at
 * 16 px without needing context.
 *
 *   G = Gear grey (#889099)
 *   H = Centre    (#FFFFFF)
 */
export const Gear: PxlKitData = {
  name: 'gear',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '......GGGG......',
    '...GG.GGGG.GG...',
    '.GGGGGGGGGGGGGG.',
    '.GG..........GG.',
    'GG............GG',
    'GG.....HH.....GG',
    'GG....HHHH....GG',
    'GG....HHHH....GG',
    'GG.....HH.....GG',
    'GG............GG',
    '.GG..........GG.',
    '.GGGGGGGGGGGGGG.',
    '...GG.GGGG.GG...',
    '......GGGG......',
    '................',
  ],
  palette: {
    G: '#889099',
    H: '#FFFFFF',
  },
  tags: ['gear', 'cog', 'engine', 'process', 'system', 'ui'],
  author: 'pxlkit',
};
