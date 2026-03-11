import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Complete documentation for the Pxlkit open-source pixel art React UI Kit and icon library. Learn how to install, use components, apply design tokens, and integrate icon packs into your project.',
  keywords: [
    'pxlkit documentation',
    'pixel art icons docs',
    'react ui kit docs',
    'retro ui documentation',
    'pixel icons guide',
    'install pixel icons',
    'react component docs',
    'tailwind ui docs',
    'icon packs guide',
  ],
  openGraph: {
    title: 'Documentation — Pxlkit',
    description:
      'Installation, API reference, and usage guides for the Pxlkit React UI Kit and pixel art icon library.',
    url: 'https://pxlkit.xyz/docs',
  },
  twitter: {
    title: 'Documentation — Pxlkit',
    description:
      'Full documentation for Pxlkit: installation, component API, design tokens, and icon pack guides.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/docs',
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
