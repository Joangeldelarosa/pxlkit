import type { Metadata } from 'next';
import PixelLandingFullTemplate from '../../../components/templates/landing-full-template';

export const metadata: Metadata = {
  title: 'SaaS Landing Template — Full Marketing Page Showcase | Pxlkit',
  description:
    'Complete SaaS landing template: sticky nav, split hero, bento grid, features, pricing, testimonials carousel, FAQ, CTA & footer. Drop-in retro.',
  alternates: { canonical: 'https://pxlkit.xyz/templates/landing-full' },
  openGraph: {
    type: 'website',
    title: 'SaaS Landing Template — Full Marketing Page Showcase | Pxlkit',
    description:
      'Complete SaaS marketing landing page composed with Pxlkit primitives: nav, hero, bento, features, pricing, testimonials, FAQ, CTA, footer.',
    url: 'https://pxlkit.xyz/templates/landing-full',
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 640,
        alt: 'Pxlkit SaaS landing template — full marketing page composed with retro primitives',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaaS Landing Template — Full Marketing Page Showcase | Pxlkit',
    description:
      'Drop-in SaaS landing template: sticky nav, hero, bento, features, pricing, testimonials carousel, FAQ, CTA & footer.',
    images: ['/og-twitter.png'],
  },
};

export default function LandingFullTemplatePage() {
  return <PixelLandingFullTemplate />;
}
