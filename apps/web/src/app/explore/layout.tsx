import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbList } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata({
  path: '/explore',
  title: 'Voxel World Demo — 3D Engine Preview (Coming Soon)',
  description:
    'Try the @pxlkit/voxel demo: procedural terrain, biomes and day/night cycles in React. An early preview, not yet on npm — explore it in the browser.',
  socialDescription:
    'Interactive preview of the @pxlkit/voxel 3D engine: procedural terrain, biomes, day/night cycles, built with Three.js and React Three Fiber. Early preview, not yet on npm.',
  imageAlt: 'Pxlkit voxel engine preview — procedural terrain, biomes and day/night cycles',
  keywords: [
    'voxel engine demo',
    'voxel world preview',
    'procedural terrain demo',
    'procedural world generation',
    'biome generation',
    'day night cycle',
    'three.js voxel',
    'react three fiber demo',
    'webgl demo',
    'pxlkit voxel',
  ],
});

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: 'Explore', path: '/explore' }])} />
      {children}
    </>
  );
}
