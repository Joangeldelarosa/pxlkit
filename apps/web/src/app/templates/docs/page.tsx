import type { Metadata } from 'next';
import { PixelDocsTemplate } from '@/components/templates/docs-template';
import { TemplatePageHeader } from '@/components/TemplatePageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/templates/docs',
  title: 'React Docs Site Template — Sidebar & Props Table',
  description:
    'Drop-in retro React docs layout: sticky sidebar, prose column, live previews, code blocks, props table and an on-this-page rail. Tailwind CSS, responsive.',
  imageAlt: 'Pxlkit docs template — sidebar nav, prose column, props table',
  keywords: [
    'docs template react',
    'documentation site template',
    'docs sidebar layout',
    'component documentation template',
    'react docs page template',
    'props table component',
    'on this page rail',
    'pixel art docs template',
    'pxlkit templates',
    'pxlkit docs',
  ],
});

export default function DocsTemplatePage() {
  return (
    <>
      <TemplatePageHeader name="Docs site" path="/templates/docs" title="Retro React docs site template" />
      <PixelDocsTemplate />
    </>
  );
}
