import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔑 Key — 16×16 pixel art key icon
 *
 * A golden key for unlocking achievements and secrets.
 *
 * Palette:
 *   G = Gold (#FFD700)
 *   D = Dark gold (#B8860B)
 *   Y = Yellow (#FFF44F)
 */
export const Key: PxlKitData = {
  name: 'key',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '................',
    '....GGGGG.......',
    '...GDDDDDG......',
    '...GD...DG......',
    '...GD...DG......',
    '...GDDDDDG......',
    '....GGGGG.......',
    '......GD........',
    '......GD........',
    '......GDGG......',
    '......GDDD......',
    '......GD........',
    '......GDGG......',
    '......GDDD......',
    '................',
  ],
  palette: {
    'G': '#FFD700',
    'D': '#B8860B',

  },
  tags: ['key', 'unlock', 'access', 'secret', 'lock', 'open'],
  author: 'pxlkit',
};
