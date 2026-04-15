import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse 226+ Pixel Art Icons — Source-Available SVG React Icons',
  description:
    'Browse and search 226+ source-available pixel art SVG icons across 7 themed packs: UI, Gamification, Social, Feedback, Effects, Weather, and Parallax 3D. Filter by category, preview animations, and copy React or SVG code instantly. Free with attribution, with paid no-attribution asset licenses available.',
  keywords: [
    'pixel art icons',
    'retro icons',
    'svg icons',
    'react icons',
    'gamification icons',
    'social icons',
    'weather icons',
    '8-bit icons',
    'pixel icons library',
    'source available icons',
    'free icons',
    'icon browser',
    'pixel art svg',
    'react icon library',
    'free svg icons',
    'animated pixel icons',
    'pixel art sprites',
    '16x16 pixel icons',
    'retro game icons',
    'rpg icons',
    'achievement icons',
    'trophy icons',
    'emoji pixel art',
    'notification icons',
    'feedback icons',
    'ui icons pack',
    'weather pixel icons',
    'effects icons animated',
    'parallax 3d icons',
    'pixel icon pack free',
    'indie game icons',
    'game ui icons',
    'hand-crafted icons',
    'typescript icons',
    'tree-shakeable icons',
    'icon search engine',
    'copy paste icons react',
    'pxlkit icons',
  ],
  openGraph: {
    title: 'Browse 226+ Pixel Art Icons — Pxlkit',
    description:
      '226+ hand-crafted pixel art SVG icons across 7 themed packs. Filter by category, preview animations, copy React or SVG code, and use them free in your projects.',
    url: 'https://pxlkit.xyz/icons',
  },
  twitter: {
    title: 'Browse 226+ Pixel Art Icons — Pxlkit',
    description:
      '226+ source-available pixel art icons — UI, Gamification, Social, Feedback, Effects, Weather, Parallax 3D. Free with attribution for shipped projects.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/icons',
  },
};

export default function IconsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
