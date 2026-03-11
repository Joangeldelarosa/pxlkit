import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Pixel Art Icons',
  description:
    'Browse 204+ open-source pixel art icons across 6 packs: UI, Gamification, Social, Feedback, Effects, Weather, and more. Filter, preview, and copy React or SVG code instantly.',
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
    'open source icons',
    'free icons',
    'icon browser',
  ],
  openGraph: {
    title: 'Browse Pixel Art Icons — Pxlkit',
    description:
      '204+ hand-crafted pixel art icons across 6 packs. Filter by category, copy React or SVG code, and use them in your projects for free.',
    url: 'https://pxlkit.xyz/icons',
  },
  twitter: {
    title: 'Browse Pixel Art Icons — Pxlkit',
    description:
      '204+ open-source pixel art icons — UI, Gamification, Social, Feedback, Effects, Weather and more.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/icons',
  },
};

export default function IconsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
