import type { PxlKitData } from '@pxlkit/core';

/**
 * 💣 VoxelBomb — 32×32 pixel art bomb for voxel rendering
 *
 * A detailed round bomb designed for 3D voxel display.
 * Created by upscaling the classic 16×16 bomb concept
 * with additional detail and refinement for the larger canvas.
 *
 * Palette:
 *   K = Black body (#1a1a2e)
 *   D = Dark outline (#2d2d4e)
 *   G = Gray highlight (#5a5a8a)
 *   L = Light highlight (#8888bb)
 *   O = Orange spark (#FF8C00)
 *   Y = Yellow spark (#FFD700)
 *   W = White hot (#FFFFFF)
 *   R = Red fuse glow (#CC3333)
 *   B = Brown fuse (#8B6914)
 *   F = Fuse dark (#553311)
 */
export const VoxelBomb: PxlKitData = {
  name: 'voxel-bomb',
  size: 32,
  category: 'voxel',
  grid: [
    '................................', // 0
    '................................', // 1
    '.......................WYW......', // 2  spark
    '......................YWOYW.....', // 3  spark
    '.......................YOY......', // 4  spark
    '......................OO........', // 5  fuse glow
    '.....................RR.........', // 6  fuse
    '....................RR..........', // 7  fuse
    '...................BB...........', // 8  cord
    '..................BB............', // 9  cord
    '.................FF.............', // 10 cord base
    '..........DDDDDKKDDDDD..........', // 11 top rim
    '.........DDKKKKKKKKKKKKDD.......',  // 12
    '........DKKKKKKKKKKKKKKKKD......', // 13
    '.......DKKKKKKKKKKKKKKKKKKD.....', // 14
    '......DKKKKKKKKKKKKKKKKKKKD.....', // 15
    '......DKGKKKKKKKKKKKKKKKKKKD....', // 16 highlight
    '.....DKGLKKKKKKKKKKKKKKKKKKKD...', // 17 highlight
    '.....DKGKKKKKKKKKKKKKKKKKKKKD...', // 18
    '.....DKKKKKKKKKKKKKKKKKKKKKKD...', // 19
    '.....DKKKKKKKKKKKKKKKKKKKKKKD...', // 20
    '.....DKKKKKKKKKKKKKKKKKKKKKKD...', // 21
    '......DKKKKKKKKKKKKKKKKKKKKKD...', // 22
    '......DKKKKKKKKKKKKKKKKKKKKD....', // 23
    '.......DKKKKKKKKKKKKKKKKKKKD....', // 24
    '........DKKKKKKKKKKKKKKKKDD.....', // 25
    '.........DDKKKKKKKKKKKKDD.......', // 26
    '..........DDDDDDDDDDDD..........', // 27
    '................................', // 28
    '................................', // 29
    '................................', // 30
    '................................', // 31
  ],
  palette: {
    K: '#1a1a2e',
    D: '#2d2d4e',
    G: '#5a5a8a',
    L: '#8888bb',
    O: '#FF8C00',
    Y: '#FFD700',
    W: '#FFFFFF',
    R: '#CC3333',
    B: '#8B6914',
    F: '#553311',
  },
  tags: ['bomb', 'explosive', 'voxel', '3d', 'blast', 'attack'],
  author: 'pxlkit',
};
