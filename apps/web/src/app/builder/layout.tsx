import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visual Pixel Art Icon Builder — Free Online Editor',
  description:
    'Design your own pixel art icons with the Pxlkit Visual Builder. Draw on a 16×16 grid, pick from retro color palettes, preview in real-time, and export as React component, SVG, data URI, or TypeScript code in seconds. Free, browser-based, no signup required.',
  keywords: [
    'pixel art builder',
    'icon builder',
    'visual icon maker',
    'pixel art generator',
    'create pixel icons',
    'svg icon creator',
    'react icon generator',
    '16x16 icon editor',
    'retro icon maker',
    'custom pixel art',
    'pixel art editor online',
    'pixel art tool free',
    'pixel drawing app',
    'pixel art creator',
    'sprite editor online',
    'pixel art design tool',
    'icon design tool',
    'svg generator online',
    'react component generator',
    'pixel grid editor',
    'retro art maker',
    '8-bit art generator',
    'pixel art export svg',
    'pixel art export react',
    'pixel art color palette',
    'retro palette generator',
    'game icon maker',
    'indie game sprite editor',
    'free icon editor',
    'browser pixel editor',
    'pxlkit builder',
  ],
  openGraph: {
    title: 'Visual Pixel Art Icon Builder — Pxlkit',
    description:
      'Design pixel art icons on a 16×16 grid and export as React, SVG, or data URI. Free, fast, and browser-based. No signup required.',
    url: 'https://pxlkit.xyz/builder',
  },
  twitter: {
    title: 'Visual Pixel Art Icon Builder — Pxlkit',
    description:
      'Create custom pixel art icons on a 16×16 grid. Export as React component, SVG, or data URI. Free & browser-based.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/builder',
  },
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
