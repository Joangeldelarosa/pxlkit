import type { Metadata } from 'next';
import PixelLandingFullTemplate from '../../../components/templates/landing-full-template';
import { TemplatePageHeader } from '@/components/TemplatePageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/templates/landing-full',
  title: 'Retro SaaS Landing Page Template for React',
  description:
    'A complete retro SaaS landing page in React: sticky nav, split hero, bento grid, features, pricing, testimonials carousel, FAQ, CTA and footer.',
  imageAlt: 'Pxlkit SaaS landing template — a full marketing page built from the kit',
  keywords: [
    'saas landing page template react',
    'landing page template react',
    'retro landing page',
    'hero section react',
    'pricing section react',
    'testimonials carousel react',
    'faq section react',
    'tailwind landing page',
    'pxlkit templates',
  ],
});

export default function LandingFullTemplatePage() {
  return (
    <>
      <TemplatePageHeader name="SaaS landing" path="/templates/landing-full" title="Retro SaaS landing page template" as="p" />
      <PixelLandingFullTemplate />
    </>
  );
}
