import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Licensing — Free, Indie & Team Plans',
  description:
    'Pxlkit is free and open-source under a Community License with attribution. Upgrade to Indie ($9.50) or Team ($24.50) for commercial use without attribution, priority support, and lifetime updates. Simple one-time pricing, no subscriptions. Covers all 226+ icons, 40+ components, and the voxel game engine.',
  keywords: [
    'pxlkit pricing',
    'pixel icons license',
    'react ui kit pricing',
    'open source license',
    'commercial license',
    'pixel art icons price',
    'retro ui license',
    'one-time purchase',
    'developer license',
    'no subscription',
    'free react ui kit',
    'open source icon license',
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
      'Free Community plan. Indie at $9.50 and Team at $24.50 for commercial use. One-time payment, no subscription, lifetime updates.',
    url: 'https://pxlkit.xyz/pricing',
  },
  twitter: {
    title: 'Pricing & Licensing — Pxlkit',
    description:
      'Free, Indie ($9.50), and Team ($24.50) plans. Commercial use, no attribution, one-time payment, lifetime updates.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
