import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbList } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata({
  path: '/icons',
  title: '226+ Pixel Art Icons for React — Free SVG Packs',
  description:
    'Browse 226+ pixel-art SVG icons in 7 packs. Copy the React code (or, new in 2.2, Vue and Angular) or download the SVG. Free with attribution.',
  socialDescription:
    '226+ hand-crafted pixel-art SVG icons in 7 themed packs. Filter, preview animations, copy the React code (or Vue and Angular, new in 2.2) and download the SVG.',
  imageAlt: 'Pxlkit — 226+ pixel-art SVG icons for React, now also for Vue and Angular',
  keywords: [
    'pixel art icons',
    'pixel icons for react',
    'react icon library',
    'retro icons',
    'svg icons',
    'free svg icons',
    'pixel art svg',
    'animated pixel icons',
    '16x16 pixel icons',
    '8-bit icons',
    'retro game icons',
    'rpg icons',
    'gamification icons',
    'weather pixel icons',
    'notification icons',
    'emoji pixel art',
    'parallax 3d icons',
    'tree-shakeable icons',
    'download svg icons',
    'vue icons',
    'angular icons',
    'pxlkit icons',
  ],
});

export default function IconsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: 'Icons', path: '/icons' }])} />
      {children}
    </>
  );
}
