import type { PxlKitData } from '@pxlkit/core';

/**
 * 🪓 Axe — a battle axe: a crescent silver blade (cutting edge to the left)
 * attached along a vertical brown handle. The old one had an ambiguous head
 * plus a stray gold "guard" that read as a branch.
 *
 *   S = Silver blade (#C0C0C0)
 *   D = Dark blade (#808080)
 *   W = Cutting-edge shine (#FFFFFF)
 *   B = Brown handle (#8B4513)
 */
export const Axe: PxlKitData = {
  name: 'axe',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '...SSSSSBB......',
    '..SSSSSSBB......',
    '.SSSSSSSBB......',
    'WSSSSSSDBB......',
    '.SSSSSSSBB......',
    '..SSSSSSBB......',
    '...SSSSSBB......',
    '........BB......',
    '........BB......',
    '........BB......',
    '........BB......',
    '........BB......',
    '........BB......',
    '........BB......',
    '................',
  ],
  palette: {
    S: '#C0C0C0',
    D: '#808080',
    W: '#FFFFFF',
    B: '#8B4513',
  },
  tags: ['axe', 'weapon', 'battle', 'hack', 'warrior', 'rpg'],
  author: 'pxlkit',
};
