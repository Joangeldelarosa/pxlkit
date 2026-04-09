import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UI Kit — 40+ Retro Pixel Art React Components',
  description:
    'Explore the Pxlkit UI Kit: 40+ production-ready retro pixel-art React components built with TypeScript and Tailwind CSS. Buttons, Forms, Modals, Cards, Tables, Animations, Toast Notifications, and more — fully customizable with design tokens. Zero native browser UI, tree-shakeable, compatible with Next.js, Vite, and any React setup.',
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
    'pixel art react components',
    'retro design system',
    'typescript react components',
    'tailwind css ui kit',
    'open source ui kit',
    'free react components',
    'pixel card component',
    'pixel toast react',
    'retro button react',
    'pixel checkbox',
    'pixel input field',
    'pixel dropdown',
    'pixel tabs component',
    'retro progress bar',
    'pixel avatar component',
    'pixel badge component',
    'game ui components',
    'indie game ui react',
    '8-bit ui kit',
    'nostalgic design system',
    'react design tokens',
    'dark mode react ui',
    'accessible ui components',
    'responsive pixel ui',
    'next.js ui components',
    'vite react components',
  ],
  openGraph: {
    title: 'Pxlkit UI Kit — 40+ Retro Pixel Art React Components',
    description:
      '40+ hand-crafted retro React components: buttons, forms, modals, tables, toast notifications, and more. TypeScript-first, Tailwind-powered, zero native UI. Free and open source.',
    url: 'https://pxlkit.xyz/ui-kit',
  },
  twitter: {
    title: 'Pxlkit UI Kit — 40+ Retro Pixel Art React Components',
    description:
      '40+ production-ready retro pixel-art React components. TypeScript, Tailwind CSS, tree-shakeable. Free & open source.',
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/ui-kit',
  },
};

export default function UIKitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
