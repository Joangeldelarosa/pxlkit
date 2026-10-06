import type { Metadata } from 'next';
import { PixelDashboardTemplate } from '@/components/templates/dashboard-template';
import { TemplatePageHeader } from '@/components/TemplatePageHeader';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/templates/dashboards',
  title: 'Retro React Admin Dashboard Template',
  description:
    'Drop-in retro React admin dashboard: sidebar, KPI cards with sparklines, area chart, sortable data table, slide-over drawer and a ⌘K command palette.',
  imageAlt: 'Pxlkit admin dashboard template — sidebar, KPIs, charts, data table, command palette',
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
  ],
});

export default function DashboardsTemplatePage() {
  return (
    <>
      <TemplatePageHeader name="Admin dashboard" path="/templates/dashboards" title="Retro React admin dashboard template" />
      <PixelDashboardTemplate />
    </>
  );
}
