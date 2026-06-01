import type { Metadata } from 'next';
import Script from 'next/script';
import { UI_KIT_VERSION } from '@/lib/pxlkit-version';

export const metadata: Metadata = {
  title: '95+ Retro Pixel-Art React Components — UI Kit with Live Demos | Pxlkit',
  description:
    'Production-ready retro React UI kit: 95+ pixel-art components — buttons, forms, modals, tables, animations, parallax & more. TypeScript, Tailwind CSS. MIT-licensed.',
  keywords: [
    'react ui kit',
    'react component library',
    'pixel art ui',
    'retro ui components',
    'retro react',
    'retro design system',
    'pixel art react components',
    'tailwind components',
    'tailwind css ui kit',
    'typescript react components',
    'button component',
    'pixel buttons',
    'retro button react',
    'form component',
    'pixel forms',
    'pixel input field',
    'pixel checkbox',
    'pixel radio button',
    'pixel select component',
    'pixel dropdown',
    'modal component',
    'pixel modal',
    'dialog component react',
    'table component',
    'pixel table',
    'data table react',
    'pixel tabs component',
    'tab component react',
    'component playground',
    'live demo components',
    'interactive component preview',
    'pixel card component',
    'pixel toast react',
    'toast notification component',
    'retro progress bar',
    'progress bar component',
    'pixel avatar component',
    'pixel badge component',
    'tooltip component react',
    'accordion component react',
    'pixel sidebar component',
    'pixel navbar component',
    'pagination component react',
    'slider component react',
    'switch toggle component',
    'animation components',
    'react design tokens',
    'dark mode react ui',
    'accessible ui components',
    'responsive pixel ui',
    'game ui components',
    'indie game ui react',
    '8-bit ui kit',
    'nostalgic design system',
    'mit react ui kit',
    'free react components',
    'open source ui kit',
    'next.js ui components',
    'vite react components',
    'zero native browser ui',
    'tree-shakeable components',
    'react ui library 2024',
    'pixel art design system',
    'customizable react components',
    'themed react components',
    'react component demos',
    'pxlkit ui',
    'pxlkit ui kit',
    'pxlkit components',
  ],
  openGraph: {
    type: 'website',
    title: '95+ Retro Pixel-Art React Components — UI Kit with Live Demos | Pxlkit',
    description:
      '95+ hand-crafted retro React components: buttons, forms, modals, tables, toast notifications, animations, parallax, locale support, and more. TypeScript-first, Tailwind-powered, zero native UI. MIT-licensed and free to use.',
    url: 'https://pxlkit.xyz/ui-kit',
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 640,
        alt: 'Pxlkit UI Kit — 95+ retro pixel-art React components with live demos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '95+ Retro Pixel-Art React Components — UI Kit with Live Demos | Pxlkit',
    description:
      'Production-ready retro pixel-art React UI kit: 95+ components with live demos. TypeScript, Tailwind CSS, tree-shakeable. MIT-licensed.',
    images: ['/og-twitter.png'],
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/ui-kit',
  },
  other: {
    'article:author': 'Pxlkit',
    'og:updated_time': new Date().toISOString(),
    'og:type': 'website',
    'og:site_name': 'Pxlkit',
  },
};

const UI_KIT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '@pxlkit/ui-kit',
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'React Component Library',
  operatingSystem: 'Web',
  url: 'https://pxlkit.xyz/ui-kit',
  description:
    '95+ accessible retro React primitives — buttons, forms, modals, tables, charts, calendars, parallax, and more. TypeScript-first, Tailwind v4, MIT.',
  softwareVersion: UI_KIT_VERSION,
  programmingLanguage: ['TypeScript', 'React', 'JavaScript'],
  downloadUrl: 'https://www.npmjs.com/package/@pxlkit/ui-kit',
  license: 'https://github.com/Joangeldelarosa/pxlkit/blob/main/LICENSE',
  offers: [
    {
      '@type': 'Offer',
      name: 'Community',
      price: '0',
      priceCurrency: 'USD',
      description: 'MIT-licensed code, free forever',
    },
    {
      '@type': 'Offer',
      name: 'Indie',
      price: '9.50',
      priceCurrency: 'USD',
      description: 'One commercial project, no asset attribution, lifetime updates',
    },
    {
      '@type': 'Offer',
      name: 'Team',
      price: '24.50',
      priceCurrency: 'USD',
      description: 'Unlimited projects, all future packs, priority support',
    },
  ],
};

export default function UIKitLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="ldjson-ui-kit"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(UI_KIT_JSON_LD) }}
      />
      {children}
    </>
  );
}
