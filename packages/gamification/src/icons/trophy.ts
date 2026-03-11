import type { PxlKitData } from '@pxlkit/core';

/**
 * 🏆 Trophy — 16×16 pixel art trophy icon
 *
 * A golden trophy symbolizing achievement and victory.
 *
 * Palette:
 *   G = Gold (#FFD700)
 *   Y = Yellow highlight (#FFF44F)
 *   D = Dark gold (#B8860B)
 *   B = Brown base (#8B4513)
 *   W = White shine (#FFFFFF)
 */
export const Trophy: PxlKitData = {
  name: 'trophy',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '..GGGGGGGGGGGG..',
    '.GG.YYYYYYYY.GG.',
    '.G..YYYYYYYY..G.',
    '.G..YYYWYYYY..G.',
    '.GG.YYYYYYYY.GG.',
    '..GGGGGGGGGGGG..',
    '....GGGGGGGG....',
    '.....GGGGGG.....',
    '......GGGG......',
    '......GGGG......',
    '.....DDDDDD.....',
    '....DDDDDDDD....',
    '....BBBBBBBB....',
    '...BBBBBBBBBB...',
    '................',
  ],
  palette: {
    'G': '#FFD700',
    'Y': '#FFF44F',
    'D': '#B8860B',
    'B': '#8B4513',
    'W': '#FFFFFF',
  },
  tags: ['trophy', 'achievement', 'winner', 'reward', 'cup', 'prize'],
  author: 'pxlkit',
};
