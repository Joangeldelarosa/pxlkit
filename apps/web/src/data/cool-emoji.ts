import type { PxlKitData, ParallaxPxlKitData } from '@pxlkit/core';

// ─────────────────────────────────────────────
// Layer 1 (back): Gold Chain
// ─────────────────────────────────────────────
const CoolEmojiChain: PxlKitData = {
  name: 'cool-emoji-chain',
  size: 32,
  category: 'parallax',
  grid: [
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '........CS.............CS.......',
    '........CS.............CS.......',
    '.........CS...........CS........',
    '..........CS.........CS.........',
    '...........CS.......CS..........',
    '............CS.....CS...........',
    '.............CCS.CCS............',
    '..............HCCH..............',
    '..............HHHH..............',
    '...............HH...............',
    '................................',
  ],
  palette: {
    C: '#FFD700', // Gold
    S: '#DAA520', // Gold shade
    H: '#FFF8DC', // Highlight / pendant
  },
  tags: ['chain', 'gold', 'jewelry', 'layer'],
  author: 'pxlkit',
};

// ─────────────────────────────────────────────
// Layer 2 (middle / anchor): Emoji Face
// ─────────────────────────────────────────────
const CoolEmojiFace: PxlKitData = {
  name: 'cool-emoji-face',
  size: 32,
  category: 'parallax',
  grid: [
    '................................',
    '................................',
    '................................',
    '............DDDDDDDD............',
    '..........DDDYYYYYYDDD..........',
    '........DDYYYYYYYYYYYYDD........',
    '.......DDYYYYYYYYYYYYYYDD.......',
    '......DDYYYYYYYYYYWWWYYYDD......',
    '......DYYYYYYYYYYYYWWYYYYD......',
    '.....DYYYYYYYYYYYYYYWYYYYYD.....',
    '.....DYYYYYYYYYYYYYYYYYYYYD.....',
    '....DDYYYYYYYYYYYYYYYYYYYYDD....',
    '....DYYYYYYYYYYYYYYYYYYYYYYD....',
    '....DYYYYYYYYYYYYYYYYYYYYYYD....',
    '....DYYYYYYYYYYYYYYYYYYYYYYD....',
    '....DYYYYYYYYYYYYYYYYYYYYYYD....',
    '....DYYYYYYYYYYYYYYYYYYYYYYD....',
    '....DYYYYYYYYYYYYYYYYYYYYYYD....',
    '....DDYYYYYYYYYYYYYYYYYYYYDD....',
    '.....DYYYYMMRRRRRRRRMMYYYYD.....',
    '.....DYYYYMRRRRRRRRRRMYYYYD.....',
    '......DYYYYMMRRRRRRMMYYYYD......',
    '......DDYYYYYMMMMMMYYYYYDD......',
    '.......DDYYYYYYYYYYYYYYDD.......',
    '........DDYYYYYYYYYYYYDD........',
    '..........DDDYYYYYYDDD..........',
    '............DDDDDDDD............',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
  palette: {
    Y: '#FFD93D', // Yellow face
    D: '#E8B830', // Darker outline
    M: '#8B4513', // Mouth outline
    R: '#C0392B', // Mouth interior
    W: '#FFF9C4', // Highlight
  },
  tags: ['face', 'emoji', 'smile', 'layer'],
  author: 'pxlkit',
};

// ─────────────────────────────────────────────
// Layer 3 (front): Sunglasses
// ─────────────────────────────────────────────
const CoolEmojiGlasses: PxlKitData = {
  name: 'cool-emoji-glasses',
  size: 32,
  category: 'parallax',
  grid: [
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '......FFFFFFFF...FFFFFFFF.......',
    '....FFFLGGLLLFFFFFLGGLLLFFF.....',
    '....FFFLGLLLLFFFFFLGLLLLFFF.....',
    '......FLLLLLLF...FLLLLLLF.......',
    '......FLLLLLLF...FLLLLLLF.......',
    '......FFFFFFFF...FFFFFFFF.......',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
  palette: {
    F: '#1A1A2E', // Dark frame
    L: '#16213E', // Dark lens
    G: '#4A90D9', // Lens glare / reflection
  },
  tags: ['sunglasses', 'glasses', 'cool', 'layer'],
  author: 'pxlkit',
};

// ─────────────────────────────────────────────
// Composed Parallax Icon
// ─────────────────────────────────────────────

/**
 * 😎 CoolEmoji — 32×32 multi-layer parallax pixel art
 *
 * A sunglasses-wearing emoji with a gold chain, composed of 3 depth layers:
 *   1. Gold chain (back, depth: 2.5) — moves most with mouse
 *   2. Emoji face (anchor, depth: 0)  — stays centered
 *   3. Sunglasses (front, depth: -1.5) — floats above, moves opposite
 *
 * Designed to demonstrate the parallax multi-layer icon system.
 */
export const CoolEmoji: ParallaxPxlKitData = {
  name: 'cool-emoji',
  size: 32,
  category: 'parallax',
  layers: [
    { icon: CoolEmojiChain,   depth: 2.5 },
    { icon: CoolEmojiFace,    depth: 0 },
    { icon: CoolEmojiGlasses, depth: -1.5 },
  ],
  tags: ['emoji', 'cool', 'sunglasses', 'chain', '3d', 'parallax', 'layered'],
  author: 'pxlkit',
};
