import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbList } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata({
  path: '/pricing',
  title: 'Pricing — Free MIT UI Kit, One-Time Icon Licenses',
  description:
    'The UI kit (React, plus Vue and Angular) is MIT and free. Icon packs are free with attribution; Indie $9.50 or Team $24.50 removes it. One-time payment.',
  socialDescription:
    'MIT-licensed UI kit for React — and now Vue and Angular — free forever. Icon packs are free with attribution; Indie $9.50 or Team $24.50 for no-attribution commercial use. One-time payment, lifetime license.',
  imageAlt: 'Pxlkit pricing — free MIT code and one-time icon licenses',
  keywords: [
    'pxlkit pricing',
    'pxlkit license',
    'pxlkit indie license',
    'pxlkit team license',
    'react ui kit free',
    'mit react ui kit',
    'mit license',
    'pixel icons license',
    'icon pack license',
    'commercial icon license',
    'commercial use icons',
    'free with attribution',
    'no attribution license',
    'remove attribution icons',
    'one-time payment',
    'no subscription',
    'lifetime license',
    'split licensing',
  ],
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: 'Pricing', path: '/pricing' }])} />
      {children}
    </>
  );
}
