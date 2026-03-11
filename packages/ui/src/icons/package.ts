import type { PxlKitData } from '@pxlkit/core';

/**
 * 📦 Package — 16×16 pixel art package/box icon
 *
 * A cardboard box/package for modules/packs.
 */
export const Package: PxlKitData = {
  name: 'package',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '.......GG.......',
    '....GGGGGGGG....',
    '..GGDDDDDDDDGG..',
    '.GDDDDDDDDDDDDG.',
    '.GDDDDDDDDDDDDG.',
    '.GDDDDDGDGDDDDG.',
    '.GDDDDDGDGDDDDG.',
    '.GDDDDDGGGDDDDG.',
    '.GDDDDDDDDDDDDG.',
    '.GDDDDDDDDDDDG..',
    '.GDDDDDDDDDDG...',
    '.GDDDDDDDDDG....',
    '.GGGGGGGGGG.....',
    '................',
    '................',
  ],
  palette: {
    G: '#8B6914',
    D: '#D4A04A',
  },
  tags: ['package', 'box', 'module', 'pack', 'npm', 'ship'],
};
