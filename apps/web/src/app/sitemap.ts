import type { MetadataRoute } from 'next';

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/ui-kit`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/templates`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/icons`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/builder`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
}
