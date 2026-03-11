import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 *  CoinFlip  1616 animated pixel art
 *
 * A gold coin performing a single flip in the air showing face  edge  back.
 * 6 frames: different from CoinSpin (which rotates in place); this one arcs upward.
 */
export const CoinFlip: AnimatedPxlKitData = {
  name: 'coin-flip',
  size: 16,
  category: 'gamification',
  palette: {
    G: '#FFD700', // gold
    D: '#B8860B', // dark edge
    W: '#FFFACD', // shine
    S: '#8B6914', // shadow side
    T: '#FFE8A3', // launch trail
  },
  frames: [
    {
      // Launch pose with short trail (distinct from CoinSpin)
      grid: [
        '................',
        '................',
        '................',
        '................',
        '..TT............',
        '..TGGGG.........',
        '..GGWWGG........',
        '..GGGGGGGG......',
        '..GGGDDDDGG.....',
        '..GGGGDGGGG.....',
        '...GGDDDDG......',
        '....GGGGG.......',
        '.....DDD........',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Tilting right (start of flip)
      grid: [
        '................',
        '.......GGGGG....',
        '.....GGWWGGG....',
        '....GGGGGGGGG...',
        '....GGGGGGGGG...',
        '...GGGGGDDDDGG..',
        '...GGGGGDGGGGG..',
        '...GGGGDDDDDGG..',
        '...GGGGGGGDGGG..',
        '...GGGGGDDDGGG..',
        '...GGGGGGGGGGG..',
        '....GGGGGGGGG...',
        '....GGGGGGGGG...',
        '.....GGGGGGG....',
        '.......DDDDD....',
        '................',
      ],
    },
    {
      // Edge-on (coin is thin, flipping)
      grid: [
        '................',
        '.........GG.....',
        '.........GG.....',
        '.........GG.....',
        '.........GG.....',
        '.........GG.....',
        '.........GG.....',
        '.........GD.....',
        '.........GD.....',
        '.........GD.....',
        '.........GD.....',
        '.........GD.....',
        '.........GD.....',
        '.........DD.....',
        '................',
        '................',
      ],
    },
    {
      // Back face showing
      grid: [
        '................',
        '.....SSSSS......',
        '...SSSSSSSSSS...',
        '..SSSSSSSSSSS...',
        '..SSSSSSSSSSS...',
        '.SSSSSGSSSSSSSS.',
        '.SSSSGSSSSSSSS..',
        '.SSSSGSSSSSSS...',
        '.SSSSGGSSSSSSS..',
        '.SSSSGSSSSSSS...',
        '.SSSSSSSSSSS....',
        '..SSSSSSSSSS....',
        '..SSSSSSSSSSD...',
        '...SSSSSSSDD....',
        '.....DDDDD......',
        '................',
      ],
    },
    {
      // Edge-on (flipping back)
      grid: [
        '................',
        '.........GG.....',
        '.........GG.....',
        '.........GG.....',
        '.........GG.....',
        '.........GG.....',
        '.........GG.....',
        '.........GD.....',
        '.........GD.....',
        '.........GD.....',
        '.........GD.....',
        '.........GD.....',
        '.........GD.....',
        '.........DD.....',
        '................',
        '................',
      ],
    },
    {
      // Full face landed
      grid: [
        '................',
        '.....GGGGG......',
        '...GGWWGGGGG....',
        '..GGGGGGGGGGG...',
        '..GGGGGGGGGGG...',
        '.GGGGGDDDDGGGG..',
        '.GGGGGDGGGGG....',
        '.GGGGDDDDDGGG...',
        '.GGGGGGGDGGGG...',
        '.GGGGGDDDGGGG...',
        '.GGGGGGGGGGG....',
        '..GGGGGGGGGGG...',
        '..GGGGGGGGGGD...',
        '...GGGGGGGDD....',
        '.....DDDDD......',
        '................',
      ],
    },
  ],
  frameDuration: 100,
  loop: true,
  trigger: 'loop',
  tags: ['coin', 'flip', 'gold', 'luck', 'animated', 'rpg'],
  author: 'pxlkit',
};
