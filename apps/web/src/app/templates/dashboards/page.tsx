import type { Metadata } from 'next';
import { PixelDashboardTemplate } from '@/components/templates/dashboard-template';

export const metadata: Metadata = {
  title: 'Admin Dashboard Template | Pxlkit',
  description:
    'Drop-in retro admin dashboard: sidebar, KPI cards with sparklines, area chart, sortable data table, slide-over drawer, ⌘K palette. Pxlkit.',
  keywords: [
    'admin dashboard template react',
    'next.js dashboard template',
    'tailwind admin template',
    'pixel art dashboard',
    'data table template',
    'sidebar dashboard layout',
    'command palette template',
    'sparkline kpi cards',
    'pxlkit templates',
    'pxlkit dashboard',
    'pxlkit ui-kit v1.9',
  ],
  openGraph: {
    type: 'website',
    title: 'Admin Dashboard Template | Pxlkit',
    description:
      'Drop-in retro admin dashboard: sidebar, KPI cards with sparklines, area chart, sortable data table, slide-over drawer, ⌘K palette.',
    url: 'https://pxlkit.xyz/templates/dashboards',
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 640,
        alt: 'Pxlkit admin dashboard template — sidebar, KPIs, charts, data table, command palette',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Admin Dashboard Template | Pxlkit',
    description:
      'Drop-in retro admin dashboard: sidebar, charts, sortable data table, slide-over drawer, ⌘K palette.',
    images: ['/og-twitter.png'],
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/templates/dashboards',
  },
};

export default function DashboardsTemplatePage() {
  return <PixelDashboardTemplate />;
}
