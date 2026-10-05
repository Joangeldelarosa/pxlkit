import type { Metadata } from 'next';
import { JsonLd } from '../components/JsonLd';
import { LandingPageClient } from '../components/LandingPageClient';
import { UI_COMPONENTS_COUNT, ICON_COUNT_LABEL } from '@/lib/pxlkit-counts';
import { pageMetadata } from '@/lib/seo';
import { homeStructuredData } from '@/lib/structured-data';

// The title names the brand already: the root layout's `%s | Pxlkit` would repeat it.
const TITLE = 'Pxlkit — React Pixel Art UI Kit, Now for Vue & Angular';
const DESCRIPTION =
  `${UI_COMPONENTS_COUNT} retro React components and ${ICON_COUNT_LABEL} pixel-art SVG icons, now also for Vue and Angular. Pixel or flat surface in one prop. TypeScript, Tailwind v4, MIT.`;

export const metadata: Metadata = pageMetadata({
  path: '',
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  socialDescription:
    'The retro pixel-art UI kit for React: a pixel/flat surface switch, WAI-ARIA on every interactive, DataTable to OTPInput. New in 2.2: Vue and Angular editions.',
  imageAlt: 'Pxlkit — retro pixel-art UI kit for React, now also for Vue and Angular',
  keywords: [
    'react pixel art ui kit',
    'retro react components',
    'pixel art react components',
    'retro react ui kit',
    '8-bit ui kit',
    'pixel art ui kit',
    'retro design system',
    'react component library',
    'pixel art icons react',
    'retro ui components',
    'pixel art svg icons',
    'react ui kit typescript',
    'tailwind retro components',
    'react landing page template',
    'game ui components react',
    'mit react ui kit',
    'vue pixel art ui kit',
    'retro vue components',
    'angular pixel art ui kit',
    'retro angular components',
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeStructuredData({ title: TITLE, description: DESCRIPTION })} />
      <LandingPageClient />
    </>
  );
}
