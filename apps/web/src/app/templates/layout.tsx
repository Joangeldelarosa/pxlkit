import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Templates — Ready-to-Use Sections & Full Pages',
  description:
    'Copy-paste ready templates built with Pxlkit: hero sections, headers, footers, CTAs, feature grids, pricing tables, testimonials, FAQ accordions, and 5 complete page layouts. Fully responsive, retro pixel-art styled React + Tailwind CSS components.',
  keywords: [
    'pxlkit templates',
    'react templates pixel art',
    'retro ui templates',
    'pixel art landing page',
    'react hero section',
    'pixel footer template',
    'retro header component',
    'react cta section',
    'pixel pricing table',
    'react feature section template',
    'pixel art dashboard template',
    'retro saas landing page',
    'react boilerplate retro',
    'copy paste react components',
    'tailwind retro templates',
    'pxlkit boilerplate',
    'pixel art web template',
    'react page template pixel',
  ],
  openGraph: {
    title: 'Templates — Pxlkit',
    description:
      'Ready-to-use React templates and sections built with Pxlkit components. Copy the code and ship faster.',
    url: 'https://pxlkit.xyz/templates',
  },
  twitter: {
    title: 'Templates — Pxlkit',
    description:
      'Copy-paste React templates: hero sections, headers, footers, pricing tables, full pages — all pixel-art styled.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/templates',
  },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
