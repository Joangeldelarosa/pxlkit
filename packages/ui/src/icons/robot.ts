import type { PxlKitData } from '@pxlkit/core';

/**
 * 🤖 Robot — 16×16 pixel art robot icon
 *
 * A friendly robot head for AI/automation features.
 */
export const Robot: PxlKitData = {
  name: 'robot',
  size: 16,
  category: 'ui',
  grid: [
    '.......AA.......',
    '.......AA.......',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGCCGGGGCCGG..',
    '..GGCCGGGGCCGG..',
    '..GGGGGGGGGGGG..',
    '..GGGGMMMGGGGG..',
    '..GGGGGGGGGGGG..',
    '...GGGGGGGGGG...',
    'AA.GGGGGGGGGG.AA',
    'AA..GGGGGGGG..AA',
    '......GGGG......',
    '......GGGG......',
    '................',
  ],
  palette: {
    G: '#8899AA',
    A: '#AABBCC',
    C: '#4ECDC4',
    M: '#AAAAAA',
  },
  tags: ['robot', 'ai', 'bot', 'automation', 'artificial-intelligence'],
};
