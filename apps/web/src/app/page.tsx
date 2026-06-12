import type { Metadata } from 'next';
import { LandingPageClient } from '../components/LandingPageClient';
import { UI_COMPONENTS_COUNT, ICON_COUNT_LABEL, ICON_PACK_COUNT, PAGE_TEMPLATE_COUNT } from '@/lib/pxlkit-counts';

const SITE_URL = 'https://pxlkit.xyz';

const TITLE = `Pxlkit — React Pixel Art UI Kit · ${UI_COMPONENTS_COUNT} Retro Components`;
const DESCRIPTION =
  `${UI_COMPONENTS_COUNT} retro React components, ${ICON_COUNT_LABEL} pixel-art SVG icons in ${ICON_PACK_COUNT} packs, ${PAGE_TEMPLATE_COUNT} page templates. Pixel or flat surface in one prop, WCAG 2.1 AA, TypeScript, Tailwind v4. MIT.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
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
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: TITLE,
    description:
      `Switchable pixel/linear surface, WAI-ARIA on every interactive, and batteries from DataTable to OTPInput. ${UI_COMPONENTS_COUNT} components, ${ICON_COUNT_LABEL} icons. MIT.`,
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 640,
        alt: 'Pxlkit — Ship a retro-future product without rolling your own design system',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description:
      `Switchable pixel/linear surface, WAI-ARIA on every interactive, batteries from DataTable to OTPInput. ${UI_COMPONENTS_COUNT} components, ${ICON_COUNT_LABEL} icons. MIT.`,
    images: ['/og-twitter.png'],
  },
};

export default function HomePage() {
  return <LandingPageClient />;
}
