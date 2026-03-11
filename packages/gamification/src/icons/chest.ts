import type { PxlKitData } from '@pxlkit/core';

/**
 * 📦 Chest — 16×16 pixel art treasure chest icon
 *
 * A wooden treasure chest for loot and rewards.
 *
 * Palette:
 *   B = Brown (#8B4513)
 *   L = Light brown (#CD853F)
 *   D = Dark brown (#5C2D06)
 *   G = Gold trim (#FFD700)
 *   K = Keyhole dark (#2C1810)
 */
export const Chest: PxlKitData = {
  name: 'chest',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '................',
    '..DDDDDDDDDDDD..',
    '..DLLLLLLLLLLD..',
    '..DLBBBBBBBBLG..',
    '..DLBBBBBBBBLG..',
    '..GGGGGGGGGGGG..',
    '..GLBBBBBBBBDG..',
    '..GLBBBBBBBBDG..',
    '..GLBBBBBBBBDG..',
    '..GLBBGGGBBBDG..',
    '..GLBBGKGBBBDG..',
    '..GLBBGGGBBBDG..',
    '..GLBBBBBBBBDG..',
    '..GDDDDDDDDDDG..',
    '................',
  ],
  palette: {
    'B': '#8B4513',
    'L': '#CD853F',
    'D': '#5C2D06',
    'G': '#FFD700',
    'K': '#2C1810',
  },
  tags: ['chest', 'treasure', 'loot', 'reward', 'box', 'storage'],
  author: 'pxlkit',
};
