/**
 * Structured data (schema.org JSON-LD) for the site's pages. Each page carries
 * what describes it: the root layout the organization and the site, the home
 * page its packages and FAQ, /ui-kit the kit, every other page its
 * breadcrumb trail.
 */

import { LANDING_FAQS } from './landing-faq';
import { ICON_COUNT_LABEL, ICON_PACK_COUNT, PAGE_TEMPLATE_COUNT, UI_COMPONENTS_COUNT } from './pxlkit-counts';
import { UI_KIT_LATEST_DATE, UI_KIT_VERSION } from './pxlkit-version';
import { absoluteUrl, REPOSITORY_URL, SITE_NAME, SITE_URL, SOCIAL_IMAGE } from './seo';
import { SITE_DESCRIPTION } from './site-copy';

const SCHEMA = 'https://schema.org';

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const UI_KIT_ID = `${SITE_URL}/ui-kit#software`;

const LICENSE_URL = `${REPOSITORY_URL}/blob/main/LICENSE`;
const CODE_LICENSE_URL = `${REPOSITORY_URL}/blob/main/LICENSE-CODE`;

/** The first public release: @pxlkit/core 1.0.0 on npm. */
const FIRST_RELEASE_DATE = '2026-03-10';

/** Sitewide: the organization behind Pxlkit and the website. */
export const SITE_STRUCTURED_DATA = {
  '@context': SCHEMA,
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      description:
        'Pxlkit makes a retro pixel-art UI kit for React — now also for Vue and Angular — with pixel-art icon packs, page templates and a visual icon builder.',
      sameAs: [REPOSITORY_URL, 'https://www.npmjs.com/package/@pxlkit/ui-kit'],
      founder: {
        '@type': 'Person',
        name: 'Joangel De La Rosa',
        url: 'https://github.com/joangeldelarosa',
      },
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
      publisher: { '@id': ORGANIZATION_ID },
    },
  ],
};

export interface Crumb {
  name: string;
  /** The route from the site root, as in `pageMetadata`. */
  path: string;
}

/** A page's place in the site, from the home page down to the page. */
export function breadcrumbList(trail: Crumb[]) {
  return {
    '@context': SCHEMA,
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '' }, ...trail].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

const npm = (name: string) => `https://www.npmjs.com/package/${name}`;

/** The packages, React's kit first. `@pxlkit/voxel` is not on npm yet. */
const PACKAGES: ReadonlyArray<{ name: string; url: string; description: string }> = [
  {
    name: '@pxlkit/ui-kit',
    url: npm('@pxlkit/ui-kit'),
    description: `The React UI kit: ${UI_COMPONENTS_COUNT} retro pixel-art components — forms, overlays, data tables, charts, animations, parallax and more`,
  },
  {
    name: '@pxlkit/ui-kit-vue',
    url: npm('@pxlkit/ui-kit-vue'),
    description: `New in 2.2: the same ${UI_COMPONENTS_COUNT} components for Vue 3`,
  },
  {
    name: '@pxlkit/ui-kit-angular',
    url: npm('@pxlkit/ui-kit-angular'),
    description: `New in 2.2: the same ${UI_COMPONENTS_COUNT} components for Angular, standalone and signal-based`,
  },
  {
    name: '@pxlkit/ui-kit-core',
    url: npm('@pxlkit/ui-kit-core'),
    description: 'The framework-neutral core the three kits share: design tokens, the Tailwind CSS v4 theme, class recipes and DOM behaviour',
  },
  { name: '@pxlkit/core', url: npm('@pxlkit/core'), description: 'The pixel-art rendering engine and the React icon components' },
  { name: '@pxlkit/vue', url: npm('@pxlkit/vue'), description: 'New in 2.2: the icon components for Vue 3' },
  { name: '@pxlkit/angular', url: npm('@pxlkit/angular'), description: 'New in 2.2: the icon components for Angular' },
  { name: '@pxlkit/ui', url: npm('@pxlkit/ui'), description: '41 interface, control and navigation pixel-art icons' },
  { name: '@pxlkit/gamification', url: npm('@pxlkit/gamification'), description: '51 RPG, achievement and reward pixel-art icons' },
  { name: '@pxlkit/social', url: npm('@pxlkit/social'), description: '43 community, emoji and messaging pixel-art icons' },
  { name: '@pxlkit/weather', url: npm('@pxlkit/weather'), description: '36 weather, moon and nature pixel-art icons' },
  { name: '@pxlkit/feedback', url: npm('@pxlkit/feedback'), description: '33 alert, status and notification pixel-art icons' },
  { name: '@pxlkit/effects', url: npm('@pxlkit/effects'), description: '12 animated effect pixel-art icons' },
  { name: '@pxlkit/parallax', url: npm('@pxlkit/parallax'), description: '10 multi-layer 3D parallax pixel-art icons' },
  {
    name: '@pxlkit/voxel',
    url: `${REPOSITORY_URL}/tree/main/packages/voxel`,
    description: 'Early preview, not yet on npm: a 3D voxel toolkit for React Three Fiber',
  },
];

/** The home page: the page itself, the packages and the visible FAQ. */
export function homeStructuredData(page: { title: string; description: string }) {
  return {
    '@context': SCHEMA,
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: page.title,
        description: page.description,
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': UI_KIT_ID },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: absoluteUrl(SOCIAL_IMAGE.url),
          width: SOCIAL_IMAGE.width,
          height: SOCIAL_IMAGE.height,
        },
        datePublished: FIRST_RELEASE_DATE,
        dateModified: UI_KIT_LATEST_DATE,
      },
      {
        '@type': 'ItemList',
        name: 'Pxlkit packages',
        description: 'The React UI kit, its Vue and Angular editions, the icon components and the icon packs',
        numberOfItems: PACKAGES.length,
        itemListElement: PACKAGES.map((pkg, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: pkg.name,
          url: pkg.url,
          description: pkg.description,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: LANDING_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    ],
  };
}

const kitSource = (fragment: string, name: string, directory: string, runtimePlatform: string, description: string) => ({
  '@type': 'SoftwareSourceCode',
  '@id': `${SITE_URL}/ui-kit#${fragment}`,
  name,
  description,
  programmingLanguage: 'TypeScript',
  runtimePlatform,
  codeRepository: `${REPOSITORY_URL}/tree/main/packages/${directory}`,
  license: CODE_LICENSE_URL,
  version: UI_KIT_VERSION,
  targetProduct: { '@id': UI_KIT_ID },
});

/** /ui-kit: the kit as an application, and its React, Vue and Angular sources. */
export const UI_KIT_STRUCTURED_DATA = {
  '@context': SCHEMA,
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': UI_KIT_ID,
      name: 'Pxlkit UI Kit',
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'UI component library',
      operatingSystem: 'Any',
      softwareRequirements: 'React 18.2+ or 19 and Tailwind CSS v4 (the Vue edition needs Vue 3.5+, the Angular edition Angular 20–22)',
      softwareVersion: UI_KIT_VERSION,
      url: absoluteUrl('/ui-kit'),
      description: `Retro pixel-art UI kit for React — ${UI_COMPONENTS_COUNT} components, ${ICON_COUNT_LABEL} SVG icons in ${ICON_PACK_COUNT} packs, section variants and ${PAGE_TEMPLATE_COUNT} React page templates. New in 2.2: the same kit for Vue 3 and Angular. TypeScript, Tailwind CSS v4.`,
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID },
      license: LICENSE_URL,
      downloadUrl: npm('@pxlkit/ui-kit'),
      featureList: [
        `${UI_COMPONENTS_COUNT} retro pixel-art React components — forms, overlays, data tables, charts, animations, parallax`,
        'New in 2.2: the same kit for Vue 3 and Angular, checked against React by parity tests',
        'A pixel or a flat linear surface on every component, switched with one prop',
        'Built for WCAG 2.1 AA: WAI-ARIA patterns, keyboard support and visible focus',
        `${ICON_COUNT_LABEL} pixel-art SVG icons in ${ICON_PACK_COUNT} tree-shakeable packs`,
        `Section variants and ${PAGE_TEMPLATE_COUNT} React page templates`,
        'Toast notifications, dark mode and Turkish locale support',
        'TypeScript and Tailwind CSS v4',
      ],
      offers: [
        {
          '@type': 'Offer',
          name: 'Community',
          price: '0',
          priceCurrency: 'USD',
          url: absoluteUrl('/pricing'),
          description: 'The MIT-licensed code — the UI kits and the icon components — and the icon packs with attribution',
        },
        {
          '@type': 'Offer',
          name: 'Indie',
          price: '9.50',
          priceCurrency: 'USD',
          url: absoluteUrl('/pricing'),
          description: 'Icons without attribution in one shipped product; a lifetime license with the updates available at purchase',
        },
        {
          '@type': 'Offer',
          name: 'Team',
          price: '24.50',
          priceCurrency: 'USD',
          url: absoluteUrl('/pricing'),
          description: 'Icons without attribution in unlimited projects, every current and future pack, and priority support',
        },
      ],
    },
    kitSource(
      'react',
      '@pxlkit/ui-kit',
      'ui-kit',
      'React 18.2+ or 19',
      `The React edition of the Pxlkit UI kit: ${UI_COMPONENTS_COUNT} retro pixel-art components.`,
    ),
    {
      ...kitSource(
        'vue',
        '@pxlkit/ui-kit-vue',
        'ui-kit-vue',
        'Vue 3.5+',
        'New in 2.2: the Vue 3 edition, with the same components, markup and behaviour as the React kit.',
      ),
      isBasedOn: { '@id': `${SITE_URL}/ui-kit#react` },
    },
    {
      ...kitSource(
        'angular',
        '@pxlkit/ui-kit-angular',
        'ui-kit-angular',
        'Angular 20–22',
        'New in 2.2: the Angular edition — standalone, signal-based components with the same markup and behaviour as the React kit.',
      ),
      isBasedOn: { '@id': `${SITE_URL}/ui-kit#react` },
    },
  ],
};
