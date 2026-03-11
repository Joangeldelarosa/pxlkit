import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 🌪️ SpinningTornado — 16×16 animated spinning tornado
 *
 * A funnel cloud that rotates / shifts, growing narrower at the base.
 * 4 frames — swirl shifting left/right, 160ms per frame.
 *
 * Palette:
 *   G = Grey cloud (#889099)  D = Dark (#566070)  L = Light (#AABBCC)
 */
export const SpinningTornado: AnimatedPxlKitData = {
  name: 'spinning-tornado',
  size: 16,
  category: 'weather',
  palette: {
    G: '#889099',
    D: '#566070',
    L: '#AABBCC',
  },
  frames: [
    {
      grid: [
        'LLLLLLLLLLLLLLLL',
        'DGGGGGGGGGGGGGGD',
        'DGGGGGGGGGGGGGGD',
        '.DGGGGGGGGGGGGD.',
        '..DGGGGGGGGGD...',
        '...DGGDGGGGGD...',
        '....DGGGGGGD....',
        '....DGGGGGGD....',
        '....DGDGGGD.....',
        '.....DGGGGD.....',
        '.....DGGGGD.....',
        '......DGGD......',
        '......DGGD......',
        '.......DD.......',
        '................',
        '................',
      ],
    },
    {
      grid: [
        'LLLLLLLLLLLLLLLL',
        'DGGGGGGGGGGGGGGD',
        'DGGGGGGGGGGGGGGD',
        '.DGGGGGGGGGGGGD.',
        '..DGGGGGGGGGD...',
        '...DGGGDGGGD....',
        '....DGGGGGGD....',
        '....DGGGGGGD....',
        '.....DGDGGD.....',
        '.....DGGGGD.....',
        '.....DGGGGD.....',
        '......DGGD......',
        '......DGGD......',
        '.......DD.......',
        '................',
        '................',
      ],
    },
    {
      grid: [
        'LLLLLLLLLLLLLLLL',
        'DGGGGGGGGGGGGGGD',
        'DGGGGGGGGGGGGGGD',
        '.DGGGGGGGGGGGGD.',
        '..DGGGGGGGGGD...',
        '...DGGGGGDGGD...',
        '....DGGGGGGD....',
        '....DGGGGGGD....',
        '....DGGDGGGD....',
        '.....DGGGGD.....',
        '.....DGGGGD.....',
        '......DGGD......',
        '......DGGD......',
        '.......DD.......',
        '................',
        '................',
      ],
    },
    {
      grid: [
        'LLLLLLLLLLLLLLLL',
        'DGGGGGGGGGGGGGGD',
        'DGGGGGGGGGGGGGGD',
        '.DGGGGGGGGGGGGD.',
        '..DGGGGGGGGGD...',
        '...DGGGGGGDGD...',
        '....DGGGGGGD....',
        '....DGGGGGGD....',
        '....DGGGDDGGD...',
        '.....DGGGGD.....',
        '.....DGGGGD.....',
        '......DGGD......',
        '......DGGD......',
        '.......DD.......',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 160,
  loop: true,
  trigger: 'loop',
  tags: ['tornado', 'spin', 'storm', 'funnel', 'animated', 'weather'],
  author: 'pxlkit',
};
