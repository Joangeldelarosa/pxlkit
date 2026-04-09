import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Procedural Voxel Worlds — 3D Game Engine Demo',
  description:
    'Fly through infinite procedural voxel worlds powered by @pxlkit/voxels — an open-source 3D game engine built with Three.js and React Three Fiber. Features 9+ biomes, day/night cycles, dynamic cities, physics, NPC systems, chunk-based terrain streaming, and real-time world generation. Build your own Minecraft-like browser game with React.',
  keywords: [
    /* ── Core Engine ── */
    'procedural terrain',
    'voxel world',
    'voxel engine',
    'voxel game engine',
    'open source game engine',
    'react game engine',
    'three.js game engine',
    'react three fiber game engine',
    'webgl game engine',
    'browser game engine',
    'indie game engine',
    '3d game engine javascript',
    'typescript game engine',
    /* ── Procedural Generation ── */
    'procedural generation',
    'procedural world generation',
    'procedural terrain generation',
    'infinite terrain generation',
    'chunk-based rendering',
    'procedural biomes',
    'perlin noise terrain',
    'fractal brownian motion',
    'seeded world generation',
    'procedural city generation',
    'terrain streaming',
    'procedural landscape',
    'procedural environment',
    'random world generator',
    'infinite world engine',
    /* ── Biomes & World ── */
    'biome generation',
    'voxel biomes',
    'procedural forest',
    'procedural desert',
    'procedural mountains',
    'procedural ocean',
    'procedural city',
    'procedural village',
    'voxel terrain',
    'voxel landscape',
    'voxel sandbox',
    'voxel world builder',
    /* ── Gaming Features ── */
    'day night cycle game',
    'npc system react',
    'game physics react',
    'voxel physics',
    'entity component system',
    'game entity framework',
    'minecraft-like engine',
    'minecraft clone react',
    'voxel game react',
    'browser voxel game',
    'web game engine',
    '3d browser game',
    /* ── React & Three.js ── */
    'react three fiber',
    'three.js terrain',
    'react 3d world',
    'react procedural generation',
    'threejs procedural terrain',
    'react three fiber procedural',
    'react voxel rendering',
    'webgl procedural',
    'three.js voxel',
    'r3f game',
    /* ── Pxlkit Specific ── */
    'pxlkit voxel',
    'pxlkit voxels',
    'pxlkit game engine',
    'pxlkit explore',
    'pxlkit 3d',
  ],
  openGraph: {
    title: 'Explore Procedural Voxel Worlds — Pxlkit 3D Game Engine',
    description:
      'Fly through infinite procedural voxel worlds with 9+ biomes, day/night cycles, dynamic cities, and real-time terrain generation. Open-source engine built with Three.js & React Three Fiber.',
    url: 'https://pxlkit.xyz/explore',
  },
  twitter: {
    title: 'Explore Procedural Voxel Worlds — Pxlkit 3D Game Engine',
    description:
      'Infinite procedural voxel worlds with 9+ biomes, day/night cycles, physics, NPCs, and dynamic cities. Open-source React game engine powered by Three.js.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/explore',
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
