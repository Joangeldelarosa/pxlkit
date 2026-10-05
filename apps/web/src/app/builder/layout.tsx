import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbList } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata({
  path: '/builder',
  title: 'Free Pixel Art Icon Builder — Draw & Export SVG',
  description:
    'Draw pixel-art icons on 8×8 to 64×64 grids with retro palettes and animation frames. Export SVG, PNG or PxlKitData code for React, Vue or Angular. Free.',
  socialDescription:
    'A free, browser-based pixel-art icon editor: retro palettes, mirroring, animation frames. Export SVG, PNG or PxlKitData code for React (or Vue and Angular). No signup.',
  imageAlt: 'Pxlkit icon builder — draw pixel-art icons and export SVG, PNG or code',
  keywords: [
    'pixel art icon builder',
    'pixel art editor online',
    'free online pixel editor',
    'pixel art creator',
    'pixel art design tool',
    'icon maker free',
    'svg icon creator',
    'svg export tool',
    'pixel art export svg',
    'pixel art export png',
    'typescript code export',
    '16x16 icon editor',
    'pixel grid editor',
    'retro icon maker',
    '8-bit icon creator',
    'pixel art color palette',
    'sprite editor online',
    'game icon maker',
    'browser pixel editor',
    'no signup icon editor',
    'favicon maker pixel',
    'pxlkit icon builder',
  ],
});

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: 'Icon builder', path: '/builder' }])} />
      {/* The editor fills the viewport; the heading names it for assistive technology and the outline. */}
      <h1 className="sr-only">Pixel art icon builder</h1>
      {children}
    </>
  );
}
