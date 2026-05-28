import type { PxlKitData } from '@pxlkit/core';

/**
 * ⛑️ Helmet — a knight's great-helm with a "+" visor (vertical breathing slit
 * crossed by a horizontal eye slit) — the iconic medieval-helm read. The old
 * one was a rounded box with a plain dark band.
 *
 *   S = Silver (#B0B8C0)
 *   H = Hi-light (#D0D8E8)
 *   V = Visor slit (#1C2430)
 */
export const Helmet: PxlKitData = {
  name: 'helmet',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '......SSSS......',
    '....SSSSSSSS....',
    '...SSSSSSSSSS...',
    '..SHHHHHHHHHHS..',
    '..SSSSSVVSSSSS..',
    '..SSSSSVVSSSSS..',
    '..SVVVVVVVVVVS..',
    '..SSSSSVVSSSSS..',
    '..SSSSSVVSSSSS..',
    '...SSSSSSSSSS...',
    '....SSSSSSSS....',
    '......SSSS......',
    '................',
    '................',
    '................',
  ],
  palette: {
    S: '#B0B8C0',
    H: '#D0D8E8',
    V: '#1C2430',
  },
  tags: ['helmet', 'helm', 'knight', 'defense', 'head', 'rpg'],
  author: 'pxlkit',
};
