import type { PxlKitData } from '@pxlkit/core';

/**
 * 🗡️ Dagger — 16×16 pixel art short dagger
 *
 * A short double-edged dagger pointed upward with a gold crossguard.
 *
 * Palette:
 *   W = White tip   (#FFFFFF)
 *   S = Silver      (#D0D0D0)
 *   D = Dark steel  (#808090)
 *   G = Gold guard  (#FFD700)
 *   B = Brown hilt  (#8B4513)
 */
export const Dagger: PxlKitData = {
  name: 'dagger',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.......WW.......',
    '......WSSWW.....',
    '.....WSSSSWW....',
    '......WSSWW.....',
    '.......WW.......',
    '.....GGGGGG.....',
    '......GGGG......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '......BBBB......',
    '......DDDD......',
    '................',
    '................',
  ],
  palette: {
    W: '#FFFFFF',
    S: '#D0D0D0',
    D: '#808090',
    G: '#FFD700',
    B: '#8B4513',
  },
  tags: ['dagger', 'knife', 'blade', 'rogue', 'stealth', 'rpg'],
  author: 'pxlkit',
};
