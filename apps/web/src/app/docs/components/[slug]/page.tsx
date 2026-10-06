import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata, SITE_NAME } from '@/lib/seo';
import { breadcrumbList } from '@/lib/structured-data';
import { DOCS_COMPONENT_PAGES } from '../../sections/component-pages.generated';
import { DOCS_COMPONENT_SECTIONS } from '../../sections/component-sections.generated';
import { componentPagePath, componentReferencePath } from '../paths';

/**
 * Each component's own page: its generated docs section — lead, API in
 * React, Vue and Angular, accessibility, usage and examples — rendered on
 * the server, with the component's name as the page's h1. One page per
 * component of the kit, built at build time; any other slug is a 404.
 *
 * The title, description and neighbours come from the manifests, through
 * `npm run docs:build` (sections/component-pages.generated.ts).
 */

export const dynamicParams = false;

interface ComponentPageProps {
  params: Promise<{ slug: string }>;
}

/** What the social preview image shows: the site's own card. */
const IMAGE_ALT = 'Pxlkit — retro pixel-art UI kit for React, now also for Vue and Angular';

function pageOf(slug: string) {
  return DOCS_COMPONENT_PAGES.find((page) => page.slug === slug);
}

export function generateStaticParams(): Array<{ slug: string }> {
  return DOCS_COMPONENT_PAGES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ComponentPageProps): Promise<Metadata> {
  const page = pageOf((await params).slug);
  if (!page) return {};
  return pageMetadata({
    path: componentPagePath(page.slug),
    // The docs layout's own title stops the root layout's " | Pxlkit" template
    // from reaching the pages under it, so the page writes the brand itself.
    title: `${page.title} | ${SITE_NAME}`,
    absoluteTitle: true,
    socialTitle: page.title,
    description: page.description,
    imageAlt: IMAGE_ALT,
    keywords: [...page.keywords],
  });
}

const linkClass = 'text-retro-cyan hover:text-retro-green transition-colors';

export default async function ComponentPage({ params }: ComponentPageProps) {
  const page = pageOf((await params).slug);
  const load = page ? DOCS_COMPONENT_SECTIONS[page.slug] : undefined;
  if (!page || !load) notFound();
  const { default: Section } = await load();

  return (
    <div className="component-page mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 py-8 pb-24">
      <JsonLd
        data={breadcrumbList([
          { name: 'Docs', path: '/docs' },
          { name: page.name, path: componentPagePath(page.slug) },
        ])}
      />
      <nav aria-label="Breadcrumb" className="mb-6 font-mono text-[11px] text-retro-muted">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <li>
            <Link href="/" className={linkClass}>
              Home
            </Link>
          </li>
          <li>
            <span aria-hidden="true">/ </span>
            <Link href="/docs" className={linkClass}>
              Docs
            </Link>
          </li>
          <li>
            <span aria-hidden="true">/ </span>
            <span aria-current="page" className="text-retro-text">
              {page.name}
            </span>
          </li>
        </ol>
      </nav>

      <Section className="component-docs" headingLevel={1} links="pages" />

      <nav
        aria-label={`More ${page.categoryLabel.toLowerCase()} components`}
        className="mt-12 border-t border-retro-border/30 pt-6 font-mono text-xs"
      >
        <ul className="grid gap-3 sm:grid-cols-3">
          <li>
            {page.previous && (
              <Link href={componentPagePath(page.previous.slug)} rel="prev" className={linkClass}>
                ← {page.previous.name}
              </Link>
            )}
          </li>
          <li className="sm:text-center">
            <Link href={componentReferencePath(page.slug)} className={linkClass}>
              {page.name} in the component reference
            </Link>
          </li>
          <li className="sm:text-right">
            {page.next && (
              <Link href={componentPagePath(page.next.slug)} rel="next" className={linkClass}>
                {page.next.name} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}
