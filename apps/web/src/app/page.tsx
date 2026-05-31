import type { Metadata } from 'next';
import { LandingPageClient } from '../components/LandingPageClient';

const SITE_URL = 'https://pxlkit.xyz';

export const metadata: Metadata = {
  title: 'Pxlkit — Ship a retro-future product this week',
  description:
    'A pixel-art React kit that swaps to a flat surface in one prop. Accessibility-first, batteries-included. MIT, TypeScript, Tailwind v4.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Pxlkit — Ship a retro-future product this week',
    description:
      'Switchable pixel/linear surface, WAI-ARIA on every interactive, and batteries from DataTable to OTPInput. MIT.',
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
    title: 'Pxlkit — Ship a retro-future product this week',
    description:
      'Switchable pixel/linear surface, WAI-ARIA on every interactive, batteries from DataTable to OTPInput. MIT.',
    images: ['/og-twitter.png'],
  },
};

export default function HomePage() {
  return <LandingPageClient />;
}
