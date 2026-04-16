import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voxel World Demo — 3D Engine Preview (Coming Soon) | Pxlkit',
  description:
    'Preview the @pxlkit/voxel 3D engine demo: procedural terrain, biomes & day/night cycles in React. Coming soon — explore the interactive tech preview.',
  keywords: [
    'voxel engine demo',
    'voxel world preview',
    '3d engine demo',
    'voxel game demo',
    'procedural terrain demo',
    'coming soon game engine',
    'pxlkit voxel preview',
    'react game engine demo',
    'three.js demo',
    'react three fiber demo',
    'webgl demo',
    'browser 3d demo',
    'procedural generation demo',
    'voxel engine',
    'voxel game engine',
    'react game engine',
    'three.js game engine',
    'react three fiber game engine',
    'webgl game engine',
    'browser game engine',
    'procedural terrain',
    'procedural biomes',
    'procedural world generation',
    'chunk-based rendering',
    'voxel terrain',
    'biome generation',
    'day night cycle game',
    'voxel sandbox',
    'minecraft-like engine',
    'browser voxel game',
    'react three fiber',
    'three.js voxel',
    'react 3d world',
    'pxlkit voxel',
    'pxlkit explore',
    'pxlkit 3d',
    'pxlkit game engine',
    'mit game engine',
    'indie game engine',
    'typescript game engine',
  ],
  openGraph: {
    title: 'Voxel World Demo — 3D Engine Preview (Coming Soon) | Pxlkit',
    description:
      'Interactive preview of the @pxlkit/voxel 3D engine: procedural terrain, biomes, day/night cycles. Coming soon — built with Three.js & React Three Fiber.',
    url: 'https://pxlkit.xyz/explore',
  },
  twitter: {
    title: 'Voxel World Demo — 3D Engine Preview (Coming Soon) | Pxlkit',
    description:
      'Preview the Pxlkit voxel 3D engine demo: procedural terrain, biomes & day/night cycles in React. Coming soon.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/explore',
  },
  other: {
    'article:author': 'Pxlkit',
    'og:updated_time': new Date().toISOString(),
    'og:type': 'website',
    'og:site_name': 'Pxlkit',
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
