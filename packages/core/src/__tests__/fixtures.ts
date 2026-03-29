import type { PxlKitData, AnimatedPxlKitData, ParallaxPxlKitData } from '../types';

/** Minimal valid 4×4 icon for testing */
export const testIcon: PxlKitData = {
  name: 'test-icon',
  size: 8,
  category: 'test',
  grid: [
    '........',
    '.RR..GG.',
    '.RR..GG.',
    '........',
    '........',
    '.BB..YY.',
    '.BB..YY.',
    '........',
  ],
  palette: {
    R: '#FF0000',
    G: '#00FF00',
    B: '#0000FF',
    Y: '#FFFF00',
  },
  tags: ['test', 'fixture'],
};

/** Minimal animated icon for testing */
export const testAnimatedIcon: AnimatedPxlKitData = {
  name: 'test-animated',
  size: 8,
  category: 'test',
  palette: {
    A: '#FF0000',
    B: '#00FF00',
  },
  frames: [
    {
      grid: [
        '........',
        '..AA....',
        '..AA....',
        '........',
        '........',
        '........',
        '........',
        '........',
      ],
    },
    {
      grid: [
        '........',
        '........',
        '........',
        '........',
        '........',
        '....BB..',
        '....BB..',
        '........',
      ],
    },
  ],
  frameDuration: 200,
  loop: true,
  tags: ['test', 'animated'],
};

/** Icon with alpha/opacity in palette */
export const testIconWithAlpha: PxlKitData = {
  name: 'alpha-test',
  size: 8,
  category: 'test',
  grid: [
    '........',
    '.AA.....',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
  ],
  palette: {
    A: '#FF000080', // Red at ~50% opacity
  },
  tags: ['test', 'alpha'],
};

/** Minimal parallax icon for testing */
export const testParallaxIcon: ParallaxPxlKitData = {
  name: 'test-parallax',
  size: 8,
  category: 'test',
  layers: [
    {
      icon: {
        name: 'back-layer',
        size: 8,
        category: 'test',
        grid: [
          '........',
          '........',
          '........',
          '........',
          '........',
          '..AA....',
          '..AA....',
          '........',
        ],
        palette: { A: '#FFD700' },
        tags: [],
      },
      depth: 2,
    },
    {
      icon: testIcon,
      depth: 0,
    },
    {
      icon: {
        name: 'front-layer',
        size: 8,
        category: 'test',
        grid: [
          '........',
          '....CC..',
          '....CC..',
          '........',
          '........',
          '........',
          '........',
          '........',
        ],
        palette: { C: '#1A1A2E' },
        tags: [],
      },
      depth: -1.5,
    },
  ],
  tags: ['test', 'parallax'],
};
