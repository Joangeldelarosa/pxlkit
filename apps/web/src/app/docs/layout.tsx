import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation — Installation, API & Guides',
  description:
    'Complete documentation for the Pxlkit ecosystem: retro pixel-art React UI Kit, 226+ SVG icon library, 3D parallax components, animated icons, toast notifications, visual icon builder, and the @pxlkit/voxel 3D game engine. Installation guides, API reference, TypeScript types, design tokens, and code examples for every package.',
  keywords: [
    'pxlkit documentation',
    'pixel art icons docs',
    'react ui kit docs',
    'retro ui documentation',
    'pixel icons guide',
    'install pixel icons',
    'react component docs',
    'tailwind ui docs',
    'icon packs guide',
    'pxlkit api reference',
    'pxlkit installation',
    'pxlkit tutorial',
    'react icon library docs',
    'svg icon usage guide',
    'typescript component api',
    'parallax icon docs',
    'animated icon docs',
    'toast notification docs',
    'voxel engine docs',
    'react three fiber docs',
    'procedural generation docs',
    'game engine documentation',
    'pxlkit getting started',
    'npm install pxlkit',
    'react ui kit tutorial',
    'pixel art react guide',
    'design tokens documentation',
    'icon builder tutorial',
  ],
  openGraph: {
    title: 'Documentation — Pxlkit',
    description:
      'Installation, API reference, and usage guides for the Pxlkit React UI Kit, 226+ pixel art icons, and @pxlkit/voxel 3D game engine.',
    url: 'https://pxlkit.xyz/docs',
  },
  twitter: {
    title: 'Documentation — Pxlkit',
    description:
      'Full documentation for Pxlkit: installation, component API, design tokens, icon packs, and voxel engine guides.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/docs',
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
