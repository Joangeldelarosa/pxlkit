import type { Metadata } from 'next';
import PixelPortfolioTemplate from '../../../components/templates/portfolio-template';
import { TemplatePageHeader } from '@/components/TemplatePageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/templates/portfolio',
  title: 'Pixel Art Portfolio Template for React',
  description:
    'A pixel-art portfolio page in React for designer-engineers: hero, bento, case studies, tech stack, stats and a contact CTA, built from Pxlkit components.',
  imageAlt: 'Pxlkit portfolio template — a designer-engineer case-study page',
  keywords: [
    'portfolio template react',
    'developer portfolio template',
    'designer portfolio template',
    'pixel art portfolio',
    'case study page template',
    'bento grid portfolio',
    'tailwind portfolio template',
    'pxlkit templates',
  ],
});

export default function PortfolioTemplatePage() {
  return (
    <>
      <TemplatePageHeader name="Portfolio" path="/templates/portfolio" title="Pixel-art portfolio template" as="p" />
      <PixelPortfolioTemplate />
    </>
  );
}
