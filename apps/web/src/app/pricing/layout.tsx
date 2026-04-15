import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Licensing — Free, Indie & Team Plans',
  description:
    'Pxlkit uses split licensing: MIT for code packages like @pxlkit/ui-kit and @pxlkit/voxel, plus free-with-attribution asset terms for the icon packs. Upgrade to Indie ($9.50) or Team ($24.50) to remove attribution for shipped asset usage.',
  keywords: [
    'pxlkit pricing',
    'pixel icons license',
    'react ui kit pricing',
    'mit code license',
    'commercial license',
    'pixel art icons price',
    'retro ui license',
    'one-time purchase',
    'developer license',
    'no subscription',
    'free react ui kit',
    'source available icon license',
    'commercial icon license',
    'indie developer license',
    'team license',
    'lifetime updates license',
    'react component license',
    'svg icon license',
    'game engine license',
    'voxel engine license',
    'pxlkit free plan',
    'pxlkit indie license',
    'pxlkit team license',
    'affordable ui kit',
    'one-time payment ui kit',
  ],
  openGraph: {
    title: 'Pricing & Licensing — Pxlkit',
    description:
      'MIT code packages plus icon packs free with attribution. Indie at $9.50 and Team at $24.50 remove attribution for shipped asset usage.',
    url: 'https://pxlkit.xyz/pricing',
  },
  twitter: {
    title: 'Pricing & Licensing — Pxlkit',
    description:
      'MIT code is free. Icon packs are free with attribution, or use Indie ($9.50) / Team ($24.50) to remove attribution.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
