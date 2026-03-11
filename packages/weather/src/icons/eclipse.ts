import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌑 Eclipse — 16×16 pixel art solar eclipse
 *
 * A solar eclipse with a dark moon blocking the sun's corona — rare event.
 *
 * Palette:
 *   Y = Sun yellow (#FFD700)
 *   O = Corona     (#FF8C00)
 *   K = Moon dark  (#1A1A2E)
 *   D = Shadow     (#33334A)
 *   G = Glow       (#FFEE88)
 */
export const Eclipse: PxlKitData = {
  name: 'eclipse',
  size: 16,
  category: 'weather',
  grid: [
    '................',
    '.....GGOOOOGG...',
    '...GOOKKKKKOOG..',
    '..GOKKKKKKKKKOOG',
    '.GOKKDDDDDDKKOG.',
    '.OOKKKDDDDDDKKO.',
    '.OOKKKDDDDDDKKO.',
    '.OOKKKDDDDDDKKO.',
    '.OOKKKDDDDDDKKO.',
    '.GOKKDDDDDDKKOG.',
    '..GOKKKKKKKKKOOG',
    '...GOOKKKKKOOG..',
    '.....GGOOOOGG...',
    '................',
    '................',
    '................',
  ],
  palette: {
    Y: '#FFD700',
    O: '#FF8C00',
    K: '#1A1A2E',
    D: '#33334A',
    G: '#FFEE88',
  },
  tags: ['eclipse', 'solar', 'moon', 'sun', 'rare', 'weather'],
  author: 'pxlkit',
};
