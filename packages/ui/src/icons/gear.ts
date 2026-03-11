import type { PxlKitData } from '@pxlkit/core';

/**
 * ⚙️ Gear — 16×16 pixel art gear cog
 *
 * A classic six-tooth gear wheel — engine, process, build, system.
 *
 * Palette:
 *   G = Gear grey  (#889099)
 *   D = Dark edge  (#556677)
 *   H = Hole       (#FFFFFF)
 */
export const Gear: PxlKitData = {
  name: 'gear',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '....DGGDGGD.....',
    '....GGGGGGG.....',
    '.DGGGGGGGGGGGD..',
    '.GGGGGGHGGGGGG..',
    '.GGGGHHHGGGGDD..',
    '.GGGGGHHHGGGGG..',
    '.DGGGGGGHGGGGGD.',
    '.GGGGGGHHHGGGGG.',
    '.GGGGGHHHGGGGG..',
    '.GGGGGHHGGGGDD..',
    '.GGGGGGGGGGGGG..',
    '.DGGGGGGGGGGGD..',
    '....GGGGGGG.....',
    '....DGGDGGD.....',
    '................',
  ],
  palette: {
    G: '#889099',
    D: '#556677',
    H: '#FFFFFF',
  },
  tags: ['gear', 'cog', 'engine', 'process', 'system', 'ui'],
  author: 'pxlkit',
};
