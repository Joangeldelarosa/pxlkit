import type { Metadata } from 'next';
import { PixelChangelogTemplate } from '@/components/templates/changelog-template';

export const metadata: Metadata = {
  title: 'Pxlkit Changelog — Filter by Version & Category',
  description:
    'Browse every Pxlkit release. Filter by version and Added/Changed/Fixed/Deps, jump straight to the GitHub PR. Latest: v2.0 — Master Overhaul.',
  keywords: [
    'pxlkit changelog',
    'pxlkit releases',
    'pxlkit release notes',
    'pxlkit version history',
    'pxlkit what\'s new',
    'pxlkit updates',
    'pxlkit v1.9',
    'pxlkit v1.8',
    'pxlkit v1.7',
    'pxlkit v1.6',
    'pxlkit data table',
    'pxlkit overlay components',
    'pxlkit form components',
    'pxlkit timeline component',
    'react ui kit changelog',
    'retro ui changelog',
    'pixel art components changelog',
    'design system release notes',
    'design system changelog',
    'open source release notes',
    'component library updates',
  ],
  openGraph: {
    type: 'website',
    title: 'Pxlkit Changelog — Filter by Version & Category',
    description:
      'Every shipped Pxlkit wave with filterable categories (Added / Changed / Fixed / Deps) and per-version chip filters. Latest highlighted.',
    url: 'https://pxlkit.xyz/templates/changelog',
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 640,
        alt: 'Pxlkit changelog template — Filterable release notes with version chips',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pxlkit Changelog — Filter by Version & Category',
    description:
      'Every Pxlkit wave: foundation, hero + cards, overlays + forms, data table + kit depth. Filterable, with GitHub PR links.',
    images: ['/og-twitter.png'],
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/templates/changelog',
  },
  other: {
    'article:author': 'Pxlkit',
    'og:updated_time': new Date().toISOString(),
    'og:type': 'website',
    'og:site_name': 'Pxlkit',
  },
};

export default function ChangelogTemplatePage() {
  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      <PixelChangelogTemplate />
    </div>
  );
}
