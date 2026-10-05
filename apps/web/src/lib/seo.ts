import type { Metadata } from 'next';

/**
 * The site's origin and the metadata every page shares.
 *
 * Next.js replaces a parent's `openGraph` and `twitter` objects instead of
 * merging them, so a page that sets one has to set all of it: `pageMetadata`
 * builds the complete set — title, description, canonical URL, Open Graph and
 * Twitter previews — from one description of the page.
 */

export const SITE_URL = 'https://pxlkit.xyz';
export const SITE_NAME = 'Pxlkit';
export const REPOSITORY_URL = 'https://github.com/Joangeldelarosa/pxlkit';

/** The social preview images, at their real pixel sizes (`npm run og:capture`). */
export const SOCIAL_IMAGE = { url: '/og-image.png', width: 1200, height: 630 } as const;
export const TWITTER_IMAGE = { url: '/og-twitter.png', width: 1200, height: 630 } as const;

export interface PageSeo {
  /** The route from the site root: `''` for the home page, `'/ui-kit'`. */
  path: string;
  /** The page title; the root layout's template appends " | Pxlkit" unless `absoluteTitle` is set. */
  title: string;
  /** Use `title` as it is, for a title that already names the brand. */
  absoluteTitle?: boolean;
  /** The meta description — at most 155 characters, so search results show it whole. */
  description: string;
  /** The link-preview title and description, where they differ from the page's. */
  socialTitle?: string;
  socialDescription?: string;
  /** What the preview image shows, for readers who cannot see it. */
  imageAlt: string;
  keywords?: string[];
}

/** The absolute URL of a route. */
export function absoluteUrl(path: string): string {
  return path === '' || path === '/' ? SITE_URL : `${SITE_URL}${path}`;
}

/** A page's complete metadata. */
export function pageMetadata(seo: PageSeo): Metadata {
  const url = absoluteUrl(seo.path);
  const title = seo.socialTitle ?? seo.title;
  const description = seo.socialDescription ?? seo.description;
  return {
    title: seo.absoluteTitle ? { absolute: seo.title } : seo.title,
    description: seo.description,
    ...(seo.keywords ? { keywords: seo.keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      title,
      description,
      images: [{ ...SOCIAL_IMAGE, alt: seo.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ ...TWITTER_IMAGE, alt: seo.imageAlt }],
    },
  };
}
