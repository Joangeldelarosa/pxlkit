import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * ✨ GlowingSword — 16×16 animated pixel art
 *
 * A magical silver sword with a pulsing blue/purple glow aura.
 * 4 frames: glow expands then contracts around the blade.
 */
export const GlowingSword: AnimatedPxlKitData = {
  name: 'glowing-sword',
  size: 16,
  category: 'gamification',
  palette: {
    S: '#C0C0C0', // steel blade
    W: '#FFFFFF', // bright shine
    G: '#8B4513', // grip
    D: '#5C2D00', // grip dark
    P: '#FFD700', // pommel
    A: '#7B68EE', // aura purple
    B: '#9B8FFF', // aura bright
  },
  frames: [
    {
      // Faint idle glow
      grid: [
        '..............BW',
        '.............BWS',
        '............BWSD',
        '...........BWSD.',
        '..........BWSD..',
        '.........BWSD...',
        '........BWSD....',
        '.......BWSD.....',
        '......BWSD......',
        '.....BWSD.......',
        '...GGGWGD.......',
        '..G.GGG.........',
        '.G...GGD........',
        '....GGD.........',
        '...GGD..........',
        '...PD...........',
      ],
    },
    {
      // Soft glow
      grid: [
        '..............BW',
        '.............BWS',
        '............BWSD',
        '...........BWSD.',
        '..........BWSD..',
        '.........BWSD...',
        '........BWSD....',
        '.......BWSD.....',
        '......BWSD......',
        '.....BWSD.......',
        '...GGGWGD.......',
        '..G.GGG.........',
        '.G...GGD........',
        '....GGD.........',
        '...GGD..........',
        '...PD...........',
      ],
    },
    {
      // Full glow (brightest)
      grid: [
        '.............ABW',
        '............ABWS',
        '...........ABWSD',
        '..........ABWSD.',
        '.........ABWSD..',
        '........ABWSD...',
        '.......ABWSD....',
        '......ABWSD.....',
        '.....ABWSD......',
        '....ABWSD.......',
        '...GGGWGD.......',
        '..G.GGG.........',
        '.G...GGD........',
        '....GGD.........',
        '...GGD..........',
        '...PD...........',
      ],
    },
    {
      // Fade back
      grid: [
        '..............BW',
        '.............BWS',
        '............BWSD',
        '...........BWSD.',
        '..........BWSD..',
        '.........BWSD...',
        '........BWSD....',
        '.......BWSD.....',
        '......BWSD......',
        '.....BWSD.......',
        '...GGGWGD.......',
        '..G.GGG.........',
        '.G...GGD........',
        '....GGD.........',
        '...GGD..........',
        '...PD...........',
      ],
    },
  ],
  frameDuration: 180,
  loop: true,
  trigger: 'loop',
  tags: ['sword', 'glow', 'magic', 'enchanted', 'animated', 'rpg'],
  author: 'pxlkit',
};
