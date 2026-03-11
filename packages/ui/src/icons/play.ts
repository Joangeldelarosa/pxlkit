import type { PxlKitData } from '@pxlkit/core';

/**
 * ▶ Play — 16×16 pixel art play button icon
 *
 * A right-pointing triangle for play/start actions.
 */
export const Play: PxlKitData = {
  name: 'play',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '..GG............',
    '..GGG...........',
    '..GGGG..........',
    '..GGGGG.........',
    '..GGGGGG........',
    '..GGGGGGG.......',
    '..GGGGGGG.......',
    '..GGGGGG........',
    '..GGGGG.........',
    '..GGGG..........',
    '..GGG...........',
    '..GG............',
    '................',
    '................',
  ],
  palette: {
    G: '#00FF88',
  },
  tags: ['play', 'start', 'begin', 'resume', 'media'],
};
