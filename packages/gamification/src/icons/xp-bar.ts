import type { PxlKitData } from '@pxlkit/core';

/**
 * 📊 XpBar — 16×16 pixel art experience progress bar
 *
 * A classic RPG-style XP progress bar partially filled — experience, progress, level.
 *
 * Palette:
 *   B = Bar border  (#334455)
 *   F = Fill green  (#00CC66)
 *   E = Empty dark  (#112233)
 *   L = Light shine (#66FFAA)
 *   T = Text gold   (#FFD700)
 */
export const XpBar: PxlKitData = {
  name: 'xp-bar',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '................',
    '.TTTT...........',
    '.TTTT...........',
    '................',
    '.BBBBBBBBBBBBBB.',
    '.BFFFFFLLEEEEEB.',
    '.BFFFFFLLEEEEEB.',
    '.BFFFFFLLEEEEEB.',
    '.BFFFFFLLEEEEEB.',
    '.BBBBBBBBBBBBBB.',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#334455',
    F: '#00CC66',
    E: '#112233',
    L: '#66FFAA',
    T: '#FFD700',
  },
  tags: ['xp', 'experience', 'progress', 'bar', 'level', 'rpg'],
  author: 'pxlkit',
};
