import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Procedural Worlds',
  description:
    'Fly through infinite procedural voxel worlds with dynamic terrain generation, multiple biomes, and real-time chunk loading. Powered by @pxlkit/voxel.',
  keywords: [
    'procedural terrain',
    'voxel world',
    'terrain generation',
    'procedural generation',
    'voxel engine',
    'infinite terrain',
    'biome generation',
    'three.js terrain',
    'react three fiber',
    'pxlkit voxel',
  ],
  openGraph: {
    title: 'Explore Procedural Worlds — Pxlkit',
    description:
      'Fly through infinite procedural voxel worlds with dynamic terrain, biomes, and chunk-based rendering.',
    url: 'https://pxlkit.xyz/explore',
  },
  twitter: {
    title: 'Explore Procedural Worlds — Pxlkit',
    description:
      'Infinite procedural voxel worlds with dynamic terrain generation and multiple biomes.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/explore',
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
