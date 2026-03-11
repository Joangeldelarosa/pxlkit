import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UI Kit — Retro React Components',
  description:
    'Explore the Pxlkit UI Kit: production-ready retro React components built with TypeScript and Tailwind CSS. Buttons, Forms, Modals, Cards, Animations, and more — fully customizable with pixel-art design tokens.',
  keywords: [
    'react ui kit',
    'retro ui components',
    'pixel art ui',
    'react component library',
    'tailwind components',
    'pixel buttons',
    'pixel forms',
    'pixel modal',
    'pixel table',
    'animation components',
    'retro react',
    'pxlkit ui',
  ],
  openGraph: {
    title: 'Pxlkit UI Kit — Retro React Components',
    description:
      'Hand-crafted retro React components: buttons, forms, modals, tables, animations, and more. TypeScript-first, Tailwind-powered, zero native UI.',
    url: 'https://pxlkit.xyz/ui-kit',
  },
  twitter: {
    title: 'Pxlkit UI Kit — Retro React Components',
    description:
      'Production-ready retro React components built with TypeScript and Tailwind CSS.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/ui-kit',
  },
};

export default function UIKitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
