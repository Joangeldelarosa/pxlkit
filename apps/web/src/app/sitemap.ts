import type { MetadataRoute } from 'next';
import { UI_KIT_LATEST_DATE } from '@/lib/pxlkit-version';

/**
 * Dynamic sitemap generated at build time by Next.js.
 *
 * Next.js automatically serves this at /sitemap.xml — no static file
 * needed in `public/`.  Add new entries here whenever you create a new
 * public-facing page.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

const SITE_URL = 'https://pxlkit.xyz';

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
  /** When the page last changed (`YYYY-MM-DD`), if not with the latest release. */
  lastModified?: string;
};

const ROUTES: Entry[] = [
  // Top-level
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/ui-kit', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/templates', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/icons', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/docs', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/skills', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/builder', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/changelog', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/explore', changeFrequency: 'monthly', priority: 0.6 },

  // Template detail pages
  { path: '/templates/dashboards', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/templates/docs', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/templates/landing-full', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/templates/portfolio', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/templates/ecommerce', changeFrequency: 'monthly', priority: 0.7 },
];

/**
 * `lastModified` is the date a page's content last changed, never the build
 * time: search engines only trust a `lastmod` that moves when the page does.
 * The pages follow the kit — its components, counts, version and docs — so
 * they take the date of the latest release (`packages/ui-kit/version-meta.json`);
 * a page that changes between releases gets its own `lastModified` above.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(`${r.lastModified ?? UI_KIT_LATEST_DATE}T00:00:00Z`),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
