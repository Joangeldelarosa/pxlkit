import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbList } from '@/lib/structured-data';

interface TemplatePageHeaderProps {
  /** The template's short name, for the breadcrumb. */
  name: string;
  /** The page's route. */
  path: string;
  /** What the page is: the page heading, unless the template brings its own `h1`. */
  title: string;
  /** `'p'` when the template under the strip renders the page's `h1` itself. */
  as?: 'h1' | 'p';
}

/**
 * The strip above a full-page template demo: where it sits on the site, what
 * it is — React code built from the kit — and the way back to the gallery,
 * where its code is.
 */
export function TemplatePageHeader({ name, path, title, as: Heading = 'h1' }: TemplatePageHeaderProps) {
  return (
    <>
      <JsonLd
        data={breadcrumbList([
          { name: 'Templates', path: '/templates' },
          { name, path },
        ])}
      />
      <div className="border-b border-retro-border/40 bg-retro-surface/30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-retro-muted">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/templates" className="hover:text-retro-green transition-colors">
                  Templates
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-retro-text">
                {name}
              </li>
            </ol>
          </nav>
          <Heading className="font-mono text-xs text-retro-muted">
            {title} · React code built from the Pxlkit UI kit
          </Heading>
          <Link
            href="/templates"
            className="ml-auto font-mono text-xs text-retro-cyan hover:text-retro-green transition-colors"
          >
            Copy the code in the gallery →
          </Link>
        </div>
      </div>
    </>
  );
}
