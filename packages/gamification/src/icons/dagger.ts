import type { PxlKitData } from '@pxlkit/core';

/**
 * 🗡️ Dagger — a long narrow double-edged blade pointing up, a wide gold
 * crossguard, a brown grip and a gold pommel. The old blade was a short
 * diamond that read as a gem on a stick.
 *
 *   W = White edge (#FFFFFF)
 *   S = Silver (#D0D0D0)
 *   G = Gold guard (#FFD700)
 *   B = Brown hilt (#8B4513)
 */
export const Dagger: PxlKitData = {
  name: 'dagger',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.......WW.......',
    '......WSSW......',
    '......WSSW......',
    '......WSSW......',
    '......WSSW......',
    '......WSSW......',
    '......WSSW......',
    '....GGGGGGGG....',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '......GGGG......',
    '................',
    '................',
    '................',
  ],
  palette: {
    W: '#FFFFFF',
    S: '#D0D0D0',
    G: '#FFD700',
    B: '#8B4513',
  },
  tags: ['dagger', 'knife', 'blade', 'rogue', 'stealth', 'rpg'],
  author: 'pxlkit',
};
