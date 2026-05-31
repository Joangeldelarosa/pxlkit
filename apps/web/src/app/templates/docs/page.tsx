import type { Metadata } from 'next';
import { PixelDocsTemplate } from '@/components/templates/docs-template';

export const metadata: Metadata = {
  title: 'Docs Site Template — Sidebar + Props Table | Pxlkit',
  description:
    'Drop-in retro docs layout: sticky sidebar, prose column, live previews, code blocks, props table, on-this-page rail. Tailwind, fully responsive.',
  keywords: [
    'docs template react',
    'documentation site template',
    'docs sidebar layout',
    'component documentation template',
    'sidebar nav template',
    'docusaurus alternative',
    'pixel art docs template',
    'react docs page template',
    'props table component',
    'on this page rail',
    'pxlkit templates',
    'pxlkit docs',
  ],
  openGraph: {
    type: 'website',
    title: 'Docs Site Template — Sidebar + Props Table | Pxlkit',
    description:
      'Sidebar nav, prose content column, live previews, code blocks, props table, on-this-page rail — all retro-styled.',
    url: 'https://pxlkit.xyz/templates/docs',
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 640,
        alt: 'Pxlkit docs template — sidebar nav, prose column, props table',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Docs Site Template — Sidebar + Props Table | Pxlkit',
    description:
      'Drop-in retro docs layout: sidebar, prose column, props table, and on-this-page rail.',
    images: ['/og-twitter.png'],
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/templates/docs',
  },
};

export default function DocsTemplatePage() {
  return <PixelDocsTemplate />;
}
