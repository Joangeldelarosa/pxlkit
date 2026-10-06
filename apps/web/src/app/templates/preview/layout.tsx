import type { Metadata } from 'next';

/**
 * A bare canvas for one section or page preview (`?id=`), opened from the
 * gallery. The gallery at /templates is the page to index.
 */
export const metadata: Metadata = {
  title: 'Template preview',
  robots: { index: false, follow: true },
};

export default function TemplatePreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
