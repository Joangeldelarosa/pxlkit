import type { PxlKitData } from '@pxlkit/core';

/**
 * 🪓 Axe — 16×16 pixel art battle axe
 *
 * A wide-bladed battle axe with brown handle and gold guard.
 *
 * Palette:
 *   S = Silver blade (#C0C0C0)
 *   D = Dark blade   (#808080)
 *   W = Blade shine  (#FFFFFF)
 *   G = Gold guard   (#FFD700)
 *   B = Brown handle (#8B4513)
 */
export const Axe: PxlKitData = {
  name: 'axe',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '........SSSSSS..',
    '.......SSSSSSS..',
    '......SDDSSSSS..',
    '.....SDDDSSSS...',
    '....SDDDDSSS....',
    '...GGGGGB.......',
    '....G...B.......',
    '.....G..B.......',
    '......GBBB......',
    '.......BBB......',
    '........BB......',
    '........DB......',
    '.........D......',
    '................',
    '................',
  ],
  palette: {
    S: '#C0C0C0',
    D: '#808080',
    W: '#FFFFFF',
    G: '#FFD700',
    B: '#8B4513',
  },
  tags: ['axe', 'weapon', 'battle', 'hack', 'warrior', 'rpg'],
  author: 'pxlkit',
};
