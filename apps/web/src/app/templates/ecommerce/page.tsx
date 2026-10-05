import type { Metadata } from 'next';
import { PixelEcommerceTemplate } from '@/components/templates/ecommerce-template';
import { TemplatePageHeader } from '@/components/TemplatePageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/templates/ecommerce',
  title: 'Retro React Ecommerce Template — Grid & Cart',
  description:
    'Drop-in retro React storefront: sticky search, filter sidebar, product grid with NEW/SALE ribbons and star ratings, pagination and a bottom-sheet cart.',
  imageAlt: 'Pxlkit ecommerce template — product grid with a bottom-sheet cart',
  keywords: [
    'ecommerce template react',
    'product listing template',
    'storefront template',
    'shop ui template',
    'product grid template',
    'cart bottom sheet',
    'filter sidebar template',
    'pixel art ecommerce',
    'tailwind ecommerce template',
    'pxlkit templates',
  ],
});

export default function EcommerceTemplatePage() {
  return (
    <>
      <TemplatePageHeader name="Ecommerce" path="/templates/ecommerce" title="Retro React ecommerce template" as="p" />
      <PixelEcommerceTemplate />
    </>
  );
}
