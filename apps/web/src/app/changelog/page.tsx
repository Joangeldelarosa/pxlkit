import type { Metadata } from 'next';
import { PixelChangelogTemplate } from '@/components/templates/changelog-template';

export const metadata: Metadata = {
  title: 'Changelog — Every Pxlkit Release | Pxlkit',
  description:
    'All shipped Pxlkit waves with details on every component and fix. Filter by version, category, and jump to the GitHub PR.',
  alternates: { canonical: 'https://pxlkit.xyz/changelog' },
  openGraph: {
    type: 'website',
    title: 'Changelog — Every Pxlkit Release | Pxlkit',
    description:
      'All shipped Pxlkit waves with details on every component and fix. Filter by version, category, jump to GitHub PR.',
    url: 'https://pxlkit.xyz/changelog',
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 640,
        alt: 'Pxlkit changelog — Every shipped wave with filterable categories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changelog — Every Pxlkit Release | Pxlkit',
    description:
      'All shipped Pxlkit waves with details on every component and fix. Filter by version, category.',
    images: ['/og-twitter.png'],
  },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      <PixelChangelogTemplate />
    </div>
  );
}
