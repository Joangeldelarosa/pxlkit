import type { Metadata } from 'next';
import { PixelEcommerceTemplate } from '@/components/templates/ecommerce-template';

export const metadata: Metadata = {
  title: 'Ecommerce Template — Grid + Cart Sheet | Pxlkit',
  description:
    'Drop-in retro ecommerce: sticky search, filter sidebar, product grid with NEW/SALE ribbons + star ratings, pagination, and a bottom-sheet cart.',
  keywords: [
    'ecommerce template react',
    'product listing template',
    'storefront template',
    'shop ui template',
    'product grid template',
    'cart bottom sheet',
    'filter sidebar template',
    'pixel art ecommerce',
    'react shop template',
    'tailwind ecommerce template',
    'pxlkit templates',
    'pxlkit ecommerce',
  ],
  openGraph: {
    type: 'website',
    title: 'Ecommerce Template — Grid + Cart Sheet | Pxlkit',
    description:
      'Sticky search, filter sidebar, product grid with ribbons and ratings, pagination, and a bottom-sheet cart — all retro-styled.',
    url: 'https://pxlkit.xyz/templates/ecommerce',
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 640,
        alt: 'Pxlkit ecommerce template — Product grid with cart bottom-sheet',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ecommerce Template — Grid + Cart Sheet | Pxlkit',
    description:
      'Sticky search, filter sidebar, product grid with ribbons and ratings, pagination, and bottom-sheet cart.',
    images: ['/og-twitter.png'],
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/templates/ecommerce',
  },
};

export default function EcommerceTemplatePage() {
  return <PixelEcommerceTemplate />;
}
