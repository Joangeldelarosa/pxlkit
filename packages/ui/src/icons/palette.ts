import type { PxlKitData } from '@pxlkit/core';

/**
 * 🎨 Palette — 16×16 pixel art color palette icon
 *
 * An artist's palette with color dots.
 */
export const Palette: PxlKitData = {
  name: 'palette',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '....GGGGGG......',
    '..GGBBBBBBGG....',
    '.GBBBBBBBBBBG...',
    '.GBBRBBBBBBBBG..',
    'GBBBBBBBBBCBBBG.',
    'GBBBBBBBBBBBBGG.',
    'GBBBYBBBBBBBG.G.',
    'GBBBBBBBBBBG..G.',
    'GBBBBBBBBBG..G..',
    '.GBBBBMBBBG.G...',
    '.GBBBBBBBBGG....',
    '..GBBBBBBGG.....',
    '...GGGGGGGG.....',
    '....GGGG........',
    '................',
  ],
  palette: {
    G: '#555555',
    B: '#F5F0E8',
    R: '#FF4444',
    Y: '#FFD700',
    C: '#4ECDC4',
    M: '#9B59B6',
  },
  tags: ['palette', 'color', 'paint', 'art', 'design', 'brush'],
};
