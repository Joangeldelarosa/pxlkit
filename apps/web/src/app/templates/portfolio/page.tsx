import type { Metadata } from 'next';
import PixelPortfolioTemplate from '../../../components/templates/portfolio-template';

export const metadata: Metadata = {
  title: 'Portfolio Template — Designer-Engineer Case Study Shell | Pxlkit',
  description:
    'A ready-to-use portfolio page template for designer-engineers. Hero, bento, case studies, stack, stats & CTA — composed with Pxlkit primitives.',
  alternates: { canonical: 'https://pxlkit.xyz/templates/portfolio' },
  openGraph: {
    type: 'website',
    title: 'Portfolio Template — Designer-Engineer Case Study Shell | Pxlkit',
    description:
      'Drop-in portfolio template for designer-engineers: hero, bento, case studies, tech stack, stats & contact CTA.',
    url: 'https://pxlkit.xyz/templates/portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 640,
        alt: 'Pxlkit portfolio template — Designer-engineer case study shell',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio Template — Designer-Engineer Case Study Shell | Pxlkit',
    description:
      'Drop-in portfolio template for designer-engineers: hero, bento, case studies, tech stack, stats & contact CTA.',
    images: ['/og-twitter.png'],
  },
};

export default function PortfolioTemplatePage() {
  return <PixelPortfolioTemplate />;
}
