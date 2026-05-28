import type { AnimatedPxlKitData } from '@pxlkit/core';

// ─── Sparkling Star (4 frames) ─────────────
// The same mirror-symmetric star as the static `star` icon (Y gold) with a
// white sparkle that rotates around the four corners. The old star base was
// asymmetric (arms at cols 0-13 instead of 1-14).

const STAR = [
  '.......YY.......',
  '.......YY.......',
  '......YYYY......',
  '......YYYY......',
  'YYYYYYYYYYYYYYYY',
  '.YYYYYYYYYYYYYY.',
  '..YYYYYYYYYYYY..',
  '...YYYYYYYYYY...',
  '...YYYYYYYYYY...',
  '..YYYYY..YYYYY..',
  '..YYY......YYY..',
  '.DYY........YYD.',
  '................',
  '................',
  '................',
  '................',
];

function withSparkle(cx: number, cy: number): { grid: string[] } {
  const g = STAR.map((row) => row.split(''));
  const put = (x: number, y: number) => {
    if (x >= 0 && x < 16 && y >= 0 && y < 16 && g[y][x] === '.') g[y][x] = 'W';
  };
  put(cx, cy);
  put(cx - 1, cy);
  put(cx + 1, cy);
  put(cx, cy - 1);
  put(cx, cy + 1);
  return { grid: g.map((row) => row.join('')) };
}

export const SparkleStar: AnimatedPxlKitData = {
  name: 'sparkle-star',
  size: 16,
  category: 'gamification',
  palette: {
    Y: '#FFD700', // star gold
    D: '#DAA520', // star shadow
    W: '#FFFFFF', // sparkle
  },
  frames: [
    withSparkle(2, 2), // top-left
    withSparkle(13, 2), // top-right
    withSparkle(13, 13), // bottom-right
    withSparkle(2, 13), // bottom-left
  ],
  frameDuration: 200,
  loop: true,
  trigger: 'loop',
  tags: ['star', 'sparkle', 'shine', 'magic', 'animated', 'effect'],
  author: 'pxlkit',
};
