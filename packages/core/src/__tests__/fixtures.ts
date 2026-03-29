import type { PxlKitData, AnimatedPxlKitData } from '../types';

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
