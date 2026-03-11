import type { AnimatedPxlKitData } from '@pxlkit/core';

// ─── Coin Spin (8 frames) ──────────────────
// A gold coin rotating smoothly.
// 8 frames: front → ¾ → ½ → edge → back → ¾ back → edge → ¾ front

export const CoinSpin: AnimatedPxlKitData = {
  name: 'coin-spin',
  size: 16,
  category: 'gamification',
  palette: {
    G: '#FFD700', // gold face
    D: '#DAA520', // dark gold
    B: '#8B6914', // edge brown
    W: '#FFF8DC', // highlight
    S: '#C0A000', // dollar sign
  },
  frames: [
    {
      // Frame 0 — Front face (full width)
      grid: [
        '................',
        '.....GGGGG......',
        '...GGWWGGGGG....',
        '..GGWGGGGGGGG...',
        '..GGGGGGGGGGG...',
        '.GGGGGSSSSGGGG..',
        '.GGGGSGGGGGGG...',
        '.GGGGSSSSGGGGG..',
        '.GGGGGGGGSGGGG..',
        '.GGGGSSSSGGGGG..',
        '.GGGGGGGGGGGGG..',
        '..GGGGGGGGGGG...',
        '..GGGGGGGGGGD...',
        '...GGGGGGGDD....',
        '.....DDDDD......',
        '................',
      ],
    },
    {
      // Frame 1 — ¾ turning right
      grid: [
        '................',
        '......GGGGG.....',
        '....GGWWGGGG....',
        '....GWGGGGGG....',
        '...GGGGGGGGG....',
        '...GGGSSSSGG....',
        '...GGSGGGGG.....',
        '...GGSSSSGGG....',
        '...GGGGGGSGG....',
        '...GGSSSSGGG....',
        '...GGGGGGGGG....',
        '....GGGGGGGG....',
        '....GGGGGGGD....',
        '.....GGGGDD.....',
        '......DDDDD.....',
        '................',
      ],
    },
    {
      // Frame 2 — Half width
      grid: [
        '................',
        '.......GGGG.....',
        '......GWGGG.....',
        '......GGGGG.....',
        '.....GGGGGG.....',
        '.....GGSSGG.....',
        '.....GGSGGG.....',
        '.....GGSSGGG....',
        '.....GGGSGGG....',
        '.....GGSSGG.....',
        '.....GGGGGG.....',
        '......GGGGG.....',
        '......GGGGD.....',
        '.......GGDD.....',
        '........DDD.....',
        '................',
      ],
    },
    {
      // Frame 3 — Thin edge
      grid: [
        '................',
        '........GG......',
        '........GG......',
        '........GG......',
        '........GG......',
        '........BB......',
        '........BB......',
        '........BB......',
        '........BB......',
        '........BB......',
        '........BB......',
        '........GG......',
        '........GG......',
        '........DD......',
        '........DD......',
        '................',
      ],
    },
    {
      // Frame 4 — Back face (reversed, darker)
      grid: [
        '................',
        '.....DDDDD......',
        '...DDDDDDDGG....',
        '..DDDDDDDDDDG...',
        '..DDDDDDDDDDG...',
        '.DDDDDDDDDDDGG..',
        '.DDDDDDDDDDDGG..',
        '.DDDDDDDDDDDGG..',
        '.DDDDDDDDDDDGG..',
        '.DDDDDDDDDDDGG..',
        '.DDDDDDDDDDDGG..',
        '..DDDDDDDDDDG...',
        '..DDDDDDDDDGG...',
        '...DDDDDGGGG....',
        '.....GGGGG......',
        '................',
      ],
    },
    {
      // Frame 5 — ¾ back (narrower)
      grid: [
        '................',
        '......DDDDD.....',
        '....DDDDDDDGG...',
        '....DDDDDDDGG...',
        '...DDDDDDDDDG...',
        '...DDDDDDDDGG...',
        '...DDDDDDDDGG...',
        '...DDDDDDDDGG...',
        '...DDDDDDDDGG...',
        '...DDDDDDDDGG...',
        '...DDDDDDDDDG...',
        '....DDDDDDDGG...',
        '....DDDDDGGGG...',
        '.....DDDGGGG....',
        '......GGGGG.....',
        '................',
      ],
    },
    {
      // Frame 6 — Edge again
      grid: [
        '................',
        '........DD......',
        '........DD......',
        '........DD......',
        '........GG......',
        '........GG......',
        '........BB......',
        '........BB......',
        '........BB......',
        '........BB......',
        '........BB......',
        '........BB......',
        '........GG......',
        '........GG......',
        '........GG......',
        '........DD......',
      ],
    },
    {
      // Frame 7 — ¾ returning to front
      grid: [
        '................',
        '.....GGGGG......',
        '....GGWWGGGG....',
        '...GWGGGGGGG....',
        '...GGGGGGGGG....',
        '..GGGGSSSSGG....',
        '..GGGSGGGGGGG...',
        '..GGGSSSSGGG....',
        '..GGGGGGGSGGGG..',
        '..GGGSSSSGGG....',
        '..GGGGGGGGGGG...',
        '...GGGGGGGGG....',
        '...GGGGGGGDD....',
        '....GGGGGDD.....',
        '.....DDDDD......',
        '................',
      ],
    },
  ],
  frameDuration: 100,
  loop: true,
  trigger: 'loop',
  tags: ['coin', 'spin', 'gold', 'money', 'animated', 'reward'],
  author: 'pxlkit',
};
