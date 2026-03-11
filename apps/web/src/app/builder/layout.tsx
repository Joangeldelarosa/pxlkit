import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visual Icon Builder',
  description:
    'Design your own pixel art icons with the Pxlkit Visual Builder. Draw on a 16×16 grid, choose colors, and export as React component, SVG, or data URI in seconds.',
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
  ],
  openGraph: {
    title: 'Visual Icon Builder — Pxlkit',
    description:
      'Design pixel art icons on a 16×16 grid and export as React, SVG, or data URI. Fast, free, and browser-based.',
    url: 'https://pxlkit.xyz/builder',
  },
  twitter: {
    title: 'Visual Icon Builder — Pxlkit',
    description:
      'Create custom pixel art icons on a 16×16 grid. Export as React component, SVG, or data URI.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/builder',
  },
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
