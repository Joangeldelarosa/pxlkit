import type { MetadataRoute } from 'next';

/**
 * Dynamic robots.txt generated at build time by Next.js.
 *
 * Next.js automatically serves this at /robots.txt — no static file
 * needed in `public/`.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

const SITE_URL = 'https://pxlkit.xyz';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
