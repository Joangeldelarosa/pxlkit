import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { PAGE_TEMPLATE_COUNT } from '@/lib/pxlkit-counts';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbList } from '@/lib/structured-data';
import TemplatesGallery from './TemplatesGallery';

export const metadata: Metadata = pageMetadata({
  path: '/templates',
  title: 'Retro React Templates & Copy-Paste Sections',
  description: `Copy-paste retro React templates: ${PAGE_TEMPLATE_COUNT} full pages (dashboard, SaaS landing, docs, portfolio, ecommerce, changelog) plus section variants in 8 categories.`,
  imageAlt: 'Pxlkit templates — copy-paste retro React pages and sections',
  keywords: [
    'react templates',
    'react page templates',
    'retro ui templates',
    'pixel art templates',
    'copy paste react components',
    'landing page template react',
    'react hero section',
    'pricing section react',
    'react cta section',
    'testimonial component react',
    'react feature section template',
    'navbar template react',
    'footer template react',
    'faq section react',
    'react dashboard template',
    'retro saas landing page',
    'portfolio template react',
    'ecommerce template react',
    'docs site template react',
    'tailwind retro templates',
    'pxlkit templates',
  ],
});

export default function TemplatesPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: 'Templates', path: '/templates' }])} />
      <TemplatesGallery />
    </>
  );
}
