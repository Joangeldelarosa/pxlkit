import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { UI_COMPONENTS_COUNT } from '@/lib/pxlkit-counts';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbList, UI_KIT_STRUCTURED_DATA } from '@/lib/structured-data';

export const metadata: Metadata = pageMetadata({
  path: '/ui-kit',
  title: `${UI_COMPONENTS_COUNT} Retro React Components — Pixel Art UI Kit`,
  description: `Retro pixel-art UI kit for React: ${UI_COMPONENTS_COUNT} components (forms, overlays, data tables, charts, animations) with live demos. New in 2.2: Vue and Angular editions.`,
  socialDescription: `${UI_COMPONENTS_COUNT} retro pixel-art components for React with live demos and props tables — buttons, forms, modals, data tables, charts, toasts, animations, parallax. New in 2.2: the same kit for Vue 3 and Angular. TypeScript, Tailwind CSS v4, MIT.`,
  imageAlt: `Pxlkit UI Kit — ${UI_COMPONENTS_COUNT} retro pixel-art React components with live demos, now also for Vue and Angular`,
  keywords: [
    'react ui kit',
    'react component library',
    'retro react components',
    'pixel art react components',
    'pixel art ui kit',
    'retro design system',
    '8-bit ui kit',
    'tailwind css ui kit',
    'typescript react components',
    'pixel buttons',
    'pixel modal',
    'data table react',
    'date picker react',
    'toast notification component',
    'accessible ui components',
    'dark mode react ui',
    'game ui components',
    'next.js ui components',
    'vite react components',
    'mit react ui kit',
    'vue ui kit',
    'vue 3 component library',
    'nuxt ui kit',
    'angular ui kit',
    'angular standalone components',
    'pxlkit ui kit',
  ],
});

export default function UIKitLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={UI_KIT_STRUCTURED_DATA} />
      <JsonLd data={breadcrumbList([{ name: 'UI Kit', path: '/ui-kit' }])} />
      {children}
    </>
  );
}
