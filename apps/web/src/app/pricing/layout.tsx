import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Licensing',
  description:
    'Pxlkit is free and open-source under a Community License. Upgrade to Indie ($19) or Team ($49) for commercial use without attribution and priority support. Simple, one-time pricing.',
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
  ],
  openGraph: {
    title: 'Pricing & Licensing — Pxlkit',
    description:
      'Free Community plan. Indie at $19 and Team at $49 for commercial use. One-time payment, no subscription.',
    url: 'https://pxlkit.xyz/pricing',
  },
  twitter: {
    title: 'Pricing & Licensing — Pxlkit',
    description:
      'Free, Indie ($19), and Team ($49) plans. Commercial use, no attribution, one-time payment.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
