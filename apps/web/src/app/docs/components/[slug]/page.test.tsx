import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DOCS_COMPONENT_PAGES } from '../../sections/component-pages.generated';
import { DOCS_COMPONENT_SECTIONS } from '../../sections/component-sections.generated';
import { DOCS_SECTIONS } from '../../sections/registry';
import ComponentPage, { dynamicParams, generateMetadata, generateStaticParams } from './page';

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe('/docs/components/[slug]', () => {
  it("builds one page per entry of /docs's component reference, and no other", () => {
    const slugs = generateStaticParams().map(({ slug }) => slug);
    expect(new Set(slugs)).toEqual(new Set(Object.keys(DOCS_SECTIONS)));
    expect(slugs).toHaveLength(Object.keys(DOCS_SECTIONS).length);
    expect(dynamicParams).toBe(false);
    expect(Object.keys(DOCS_COMPONENT_SECTIONS).sort()).toEqual([...slugs].sort());
  });

  it('gives each page its canonical URL, previews, and a title and description that fit search results', async () => {
    const metadata = await generateMetadata(params('pixel-button'));
    expect(metadata.title).toEqual({ absolute: 'PixelButton — React Button Component | Pxlkit' });
    expect(metadata.alternates?.canonical).toBe('https://pxlkit.xyz/docs/components/pixel-button');
    expect(metadata.openGraph).toMatchObject({ url: 'https://pxlkit.xyz/docs/components/pixel-button', title: 'PixelButton — React Button Component' });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
    expect(metadata.description).toMatch(/^PixelButton for React: .+ — in Vue and Angular too\.$/);
    for (const page of DOCS_COMPONENT_PAGES) {
      expect(`${page.title} | Pxlkit`.length, page.title).toBeLessThanOrEqual(60);
      expect(page.description.length, page.description).toBeLessThanOrEqual(155);
    }
  });

  it("renders the component's section with its name as the one h1, React's API table and code, and its trail", async () => {
    const html = renderToString(await ComponentPage(params('pixel-button')));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('<h1 id="pixel-button-heading">PixelButton</h1>');
    expect(html).toContain('<h2 id="pixel-button-api">API</h2>');
    expect(html).not.toMatch(/<h4[\s>]/);
    expect(html).toContain('<table class="docs-props" aria-label="PixelButton props">');
    expect(html).toContain('import { PixelButton } from &#x27;@pxlkit/ui-kit&#x27;;');
    expect(html).not.toContain('@pxlkit/ui-kit-vue');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"item":"https://pxlkit.xyz/docs/components/pixel-button"');
    // Its neighbours in its category, its entry on /docs, and its related components' pages.
    expect(html).toContain('href="/docs/components/pixel-bare-button"');
    expect(html).toContain('href="/docs/components/pixel-split-button"');
    expect(html).toContain('href="/docs#pixel-button"');
    expect(html).toContain('href="/docs/components/pixel-icon-button"');
  });
});
