import type { PxlKitData } from '@pxlkit/core';

/**
 * 🏠 Home — 16×16 pixel art home icon
 *
 * A simple house with a triangular roof and door — home, start, main page.
 *
 * Palette:
 *   R = Roof red   (#CC4444)
 *   W = Wall tan   (#D4A96A)
 *   D = Door brown (#8B5E3C)
 *   O = Outline    (#443322)
 */
export const Home: PxlKitData = {
  name: 'home',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '........O.......',
    '.......ORO......',
    '......ORRRO.....',
    '.....ORRRRRO....',
    '....ORRRRRRRRO..',
    '...ORRRRRRRRRO..',
    '..ORRRRRRRRRRRO.',
    '...OWWWWWWWWO...',
    '...OWWWWWWWWO...',
    '...OWWWDWWWWO...',
    '...OWWWDWWWWO...',
    '...OWWWDDWWWO...',
    '...OWWWDDWWWO...',
    '...OOOOOOOOO....',
    '................',
  ],
  palette: {
    R: '#CC4444',
    W: '#D4A96A',
    D: '#8B5E3C',
    O: '#443322',
  },
  tags: ['home', 'house', 'start', 'main', 'ui'],
  author: 'pxlkit',
};
