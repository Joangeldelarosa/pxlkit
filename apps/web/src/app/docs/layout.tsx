import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { UI_COMPONENTS_COUNT } from '@/lib/pxlkit-counts';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbList } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata({
  path: '/docs',
  title: 'Docs — Install the React Pixel Art UI Kit & Icons',
  description: `Install Pxlkit in React (or in Vue and Angular, new in 2.2): setup, icon components, the ${UI_COMPONENTS_COUNT}-component API reference, design tokens and TypeScript types.`,
  socialDescription: `Pxlkit docs: install the React pixel-art UI kit — or its new Vue and Angular editions — set up Tailwind CSS v4, render the icon components and browse the API of all ${UI_COMPONENTS_COUNT} components.`,
  imageAlt: 'Pxlkit docs — install the React pixel-art UI kit and icons',
  keywords: [
    'pxlkit documentation',
    'pxlkit docs',
    'pxlkit installation',
    'pxlkit api reference',
    'npm install pxlkit',
    'quick start react ui kit',
    'react ui kit docs',
    'component api reference',
    'react component docs',
    'typescript component api',
    'icon component api',
    'pixel art icons docs',
    'animated icon docs',
    'parallax icon docs',
    'toast notification docs',
    'design tokens reference',
    'tailwind css v4 setup',
    'next.js setup pxlkit',
    'vite setup pxlkit',
    'vue setup pxlkit',
    'nuxt setup pxlkit',
    'angular setup pxlkit',
    'dark mode setup guide',
    'accessibility docs',
  ],
});

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: 'Docs', path: '/docs' }])} />
      {children}
    </>
  );
}
