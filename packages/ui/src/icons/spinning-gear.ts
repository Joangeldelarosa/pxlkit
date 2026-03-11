import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * ⚙️ SpinningGear — 16×16 animated spinning gear
 *
 * A gear cog that rotates — processing, loading, system, config.
 * 4 frames — gear rotating by 45° steps, 150ms per frame.
 *
 * Palette:
 *   G = Gear grey  (#889099)  D = Dark edge (#556677)  H = Hole (#FFFFFF)
 */
export const SpinningGear: AnimatedPxlKitData = {
  name: 'spinning-gear',
  size: 16,
  category: 'ui',
  palette: {
    G: '#889099',
    D: '#556677',
    H: '#FFFFFF',
  },
  frames: [
    {
      grid: [
        '................',
        '......D.D.......',
        '....DGGGGGGD....',
        '..DGGGGGGGGGGD..',
        '.DGGGGGGHGGGGGD.',
        '.GGGGGHHHGGGGG..',
        '.DGGGGGHGGGGGDD.',
        '.GGGGGHHHGGGGG..',
        '.DGGGGGHGGGGGDD.',
        '.GGGGGGHGGGGGG..',
        '..DGGGGGHGGGD...',
        '....DGGGGGGD....',
        '......D.D.......',
        '................',
        '...D.....D......',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '......D.D.......',
        '....DGGGGGGD....',
        '..DGGGGGGGGGGG..',
        '.DGGGGGGHGGGGD..',
        '.GGGGGHHHGGGGG..',
        '.DGGGGGHGGGGGD..',
        '.GGGGGHHHGGGGG..',
        '.DGGGGGHGGGGGD..',
        '.GGGGGGHGGGGGD..',
        '..DGGGGGHGGGD...',
        '....DGGGGGGD....',
        '......D.D.......',
        '................',
        '...D.....D......',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '....DGGDGGD.....',
        '....GGGGGGG.....',
        '.DGGGGGGGGGGGD..',
        '.GGGGGGHGGGGGG..',
        '.GGGGGHHHHGGGGG.',
        '.GGGGGHGGGGGGGG.',
        '.DGGGGHGGGGGGD..',
        '.GGGGGHHHGGGGG..',
        '.GGGGGHHHHGGGGG.',
        '.GGGGGHGGGGGGGD.',
        '.GGGGGGGGGGGGG..',
        '.DGGGGGGGGGGGD..',
        '....GGGGGGG.....',
        '....DGGDGGD.....',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '.....D....D.....',
        '...DGGGGGGGGD...',
        '..DGGGGGGGGGGGD.',
        '..GGGGGGHGGGGG..',
        '..DGGGGHHHHGGD..',
        '..GGGGGGHGGGGG..',
        '..DGGGGHHHHGGD..',
        '..GGGGGGHGGGGG..',
        '..DGGGGHHHHGGD..',
        '..GGGGGGHGGGGG..',
        '..DGGGGGGGGGGD..',
        '.....D....D.....',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 150,
  loop: true,
  trigger: 'loop',
  tags: ['gear', 'spin', 'loading', 'process', 'config', 'animated', 'ui'],
  author: 'pxlkit',
};
