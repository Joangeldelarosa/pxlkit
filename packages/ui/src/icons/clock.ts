import type { PxlKitData } from '@pxlkit/core';

/**
 * 🕐 Clock — 16×16 pixel art analog clock
 *
 * A round clock face with hour and minute hands — time, schedule, duration.
 *
 * Palette:
 *   W = White face (#FFFFFF)
 *   O = Outline    (#334455)
 *   H = Hour hand  (#334455)
 *   M = Min hand   (#5B9BD5)
 *   D = Dot center (#CC4444)
 */
export const Clock: PxlKitData = {
  name: 'clock',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '.....OOOOO......',
    '...OOWWWWWOO....',
    '..OWWWWHWWWWO...',
    '.OWWWWWHWWWWWO..',
    '.OWWWWWHWWWWWO..',
    '.OWWWWHDWMWWWO..',
    '.OWWWWWWMMWWWO..',
    '.OWWWWWWWMWWWO..',
    '.OWWWWWWWWWWWO..',
    '..OWWWWWWWWWO...',
    '...OOWWWWWOO....',
    '.....OOOOO......',
    '................',
    '................',
    '................',
  ],
  palette: {
    W: '#FFFFFF',
    O: '#334455',
    H: '#334455',
    M: '#5B9BD5',
    D: '#CC4444',
  },
  tags: ['clock', 'time', 'schedule', 'duration', 'ui'],
  author: 'pxlkit',
};
