import type { Metadata, Viewport } from 'next';
import { ConditionalShell } from '../components/ConditionalShell';
import { ThemeProvider } from '../components/ThemeProvider';
import { ToastProvider } from '../components/ToastProvider';
import { UI_KIT_VERSION } from '@/lib/pxlkit-version';
import { UI_COMPONENTS_COUNT, ICON_COUNT_LABEL, ICON_PACK_COUNT, PAGE_TEMPLATE_COUNT } from '@/lib/pxlkit-counts';
import { LANDING_FAQS } from '@/lib/landing-faq';
import './globals.css';
import { Analytics } from "@vercel/analytics/next";

/* ─── SEO Constants ─── */
const SITE_NAME = 'Pxlkit';
const SITE_URL = 'https://pxlkit.xyz';
const SITE_TAGLINE = `Retro React UI Kit — Pixel-Art Components, Ready-Made Templates & ${ICON_COUNT_LABEL} SVG Icons`;
const SITE_DESCRIPTION =
  `${UI_COMPONENTS_COUNT} retro pixel-art React components, ${ICON_COUNT_LABEL} SVG icons across ${ICON_PACK_COUNT} themed packs, section variants & ${PAGE_TEMPLATE_COUNT} full-page templates. TypeScript-first, Tailwind CSS, tree-shakeable. Open-source UI kit.`;

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0F' },
    { media: '(prefers-color-scheme: light)', color: '#F2F0EB' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  colorScheme: 'dark light',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    /* ── Brand & General ── */
    'pxlkit',
    'pixel art react',
    'retro react ui kit',
    'pixel art ui kit',
    'retro design system',
    'nostalgic ui kit',
    'retro web design',
    'mit react ui kit',
    'typescript ui kit',
    'open source ui kit',
    'free react ui kit',
    'react design system',
    '8-bit ui kit',
    'pixel art design system',
    /* ── Icons ── */
    'pixel art icons',
    'retro icons',
    '16x16 icons',
    '8-bit icons',
    'svg icons',
    'react icons',
    'icon library',
    'icon builder',
    'pixel art generator',
    'react svg icons',
    'gamification icons',
    'tree-shakeable icons',
    'free pixel icons',
    'pixel icon pack',
    'hand-crafted svg icons',
    'animated pixel icons',
    'pixel art sprite',
    'ai icon generator',
    'pixel icon builder',
    /* ── UI Components ── */
    'react component library',
    'tailwind ui components',
    'pixel buttons',
    'pixel forms',
    'retro UI components',
    'react pixel components',
    'pixel art css',
    'pixel modal component',
    'pixel table react',
    'retro toast notifications',
    'toast notifications react',
    'copy paste react components',
    'react select component',
    'react badge component',
    'react tooltip component',
    'react card component',
    'react input component',
    'tailwind css components',
    'tailwind react components',
    'pixel art buttons',
    'retro form components',
    'react ui library',
    'zero native browser ui',
    /* ── Templates & Sections ── */
    'react landing page template',
    'react hero section',
    'react pricing table',
    'react pricing component',
    'react cta section',
    'react testimonials section',
    'react faq section',
    'react features section',
    'react header component',
    'react footer component',
    'ready-to-use react templates',
    'react page templates',
    'landing page components react',
    'react website template',
    'retro landing page',
    'pixel art website template',
    'react section components',
    'saas landing page react',
    'startup template react',
    'copy paste react sections',
    /* ── 3D / Parallax ── */
    '3d parallax icons',
    '3d pixel art',
    'parallax react component',
    'multi-layer 3d icons',
    /* ── Voxel / Gaming (coming soon) ── */
    'voxel engine react',
    'react game engine',
    'voxel world builder',
    'browser game engine',
    'react three fiber game engine',
    'indie game engine',
  ],
  authors: [{ name: 'Joangel De La Rosa', url: 'https://github.com/joangeldelarosa' }],
  creator: 'Joangel De La Rosa',
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 640,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    creator: '@joangeldelarosa',
    images: ['/og-twitter.png'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/site.webmanifest',
  category: 'technology',
  other: {
    'msapplication-TileColor': '#0A0A0F',
    'article:author': 'https://github.com/joangeldelarosa',
    'og:updated_time': new Date().toISOString(),
    'profile:username': 'joangeldelarosa',
  },
};

/** JSON-LD Structured Data — Organization + WebSite + WebPage + SoftwareApplication + SoftwareSourceCode + ItemList + FAQPage + BreadcrumbList */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    /* ── Organization ── */
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      sameAs: [
        'https://github.com/Joangeldelarosa/pxlkit',
        'https://www.npmjs.com/org/pxlkit',
        'https://twitter.com/joangeldelarosa',
      ],
      founder: {
        '@type': 'Person',
        name: 'Joangel De La Rosa',
        url: 'https://github.com/joangeldelarosa',
      },
    },
    /* ── WebSite ── */
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: 'en-US',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/icons?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    /* ── WebPage — Landing Page ── */
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: SITE_DESCRIPTION,
      inLanguage: 'en-US',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#ui-kit` },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
      datePublished: '2024-01-01T00:00:00Z',
      dateModified: new Date().toISOString(),
      breadcrumb: { '@id': `${SITE_URL}/#breadcrumb` },
    },
    /* ── BreadcrumbList ── */
    {
      '@type': 'BreadcrumbList',
      '@id': `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'UI Kit',
          item: `${SITE_URL}/ui-kit`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Icons',
          item: `${SITE_URL}/icons`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Templates',
          item: `${SITE_URL}/templates`,
        },
      ],
    },
    /* ── SoftwareApplication — UI Kit + Templates + Icons ── */
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#ui-kit`,
      name: `${SITE_NAME} — Retro React UI Kit & Templates`,
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'React Component Library',
      operatingSystem: 'Web',
      description:
        `Open-source retro React UI kit with ${UI_COMPONENTS_COUNT} pixel-art components, ${ICON_COUNT_LABEL} SVG icons across ${ICON_PACK_COUNT} themed packs, section variants and ${PAGE_TEMPLATE_COUNT} full-page templates (dashboard, landing, portfolio, ecommerce, docs, changelog). TypeScript-first, Tailwind CSS-powered, tree-shakeable.`,
      url: SITE_URL,
      author: { '@id': `${SITE_URL}/#organization` },
      license: 'https://github.com/Joangeldelarosa/pxlkit/blob/main/LICENSE',
      offers: [
        {
          '@type': 'Offer',
          name: 'Community',
          price: '0',
          priceCurrency: 'USD',
          description: 'MIT code packages plus icon packs free with attribution',
        },
        {
          '@type': 'Offer',
          name: 'Indie License',
          price: '9.50',
          priceCurrency: 'USD',
          description: 'One commercial project, no asset attribution, lifetime updates',
        },
        {
          '@type': 'Offer',
          name: 'Team License',
          price: '24.50',
          priceCurrency: 'USD',
          description: 'Unlimited projects, all future packs, priority support',
        },
      ],
      softwareVersion: UI_KIT_VERSION,
      programmingLanguage: ['TypeScript', 'React', 'JavaScript'],
      downloadUrl: 'https://www.npmjs.com/package/@pxlkit/core',
      featureList: [
        `${UI_COMPONENTS_COUNT} retro pixel-art UI components`,
        `${ICON_COUNT_LABEL} hand-crafted SVG icons across ${ICON_PACK_COUNT} packs`,
        'Section variants — hero, pricing, CTA, testimonial, FAQ, features, header & footer',
        '6 complete page templates — dashboard, landing, portfolio, ecommerce, docs, changelog',
        'Visual pixel icon builder',
        'AI icon generation via LLM prompts',
        '3D parallax icons',
        'Toast notification system',
        'Tree-shakeable imports',
        'TypeScript strict mode',
        'Tailwind CSS integration',
        'Zero native browser UI',
      ],
    },
    /* ── SoftwareSourceCode — Voxel Engine (coming soon) ── */
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE_URL}/#voxel-engine`,
      name: '@pxlkit/voxel',
      description:
        'MIT-licensed 3D voxel toolkit built with Three.js and React Three Fiber. v0.1.x ships voxel utility primitives (pxlToVoxels, upscaleGrid); the procedural world engine — biomes, chunk-based terrain, day/night cycles — is live in the /explore showcase and being prepared for the v1 package.',
      url: `${SITE_URL}/explore`,
      codeRepository: 'https://github.com/Joangeldelarosa/pxlkit',
      programmingLanguage: ['TypeScript', 'React', 'GLSL'],
      runtimePlatform: 'Web Browser',
      author: { '@id': `${SITE_URL}/#organization` },
      license: 'https://github.com/Joangeldelarosa/pxlkit/blob/main/LICENSE-CODE',
    },
    /* ── ItemList — npm Packages ── */
    {
      '@type': 'ItemList',
      name: 'Pxlkit npm Packages',
      description: 'React UI kit, template, and icon packages in the Pxlkit ecosystem',
      numberOfItems: 10,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '@pxlkit/ui-kit',
          url: 'https://www.npmjs.com/package/@pxlkit/ui-kit',
          description: `${UI_COMPONENTS_COUNT} retro pixel-art React UI components — buttons, inputs, modals, data tables, charts, calendars, selects, animations, parallax, locale support, and more`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '@pxlkit/core',
          url: 'https://www.npmjs.com/package/@pxlkit/core',
          description: 'Core rendering engine, React components, and SVG utilities',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: '@pxlkit/ui',
          url: 'https://www.npmjs.com/package/@pxlkit/ui',
          description: '41 interface control and navigation pixel icons',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '@pxlkit/gamification',
          url: 'https://www.npmjs.com/package/@pxlkit/gamification',
          description: '51 RPG, achievement, and reward pixel icons',
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: '@pxlkit/social',
          url: 'https://www.npmjs.com/package/@pxlkit/social',
          description: '43 community, emoji, and messaging pixel icons',
        },
        {
          '@type': 'ListItem',
          position: 6,
          name: '@pxlkit/weather',
          url: 'https://www.npmjs.com/package/@pxlkit/weather',
          description: '36 climate, moon, and nature pixel icons',
        },
        {
          '@type': 'ListItem',
          position: 7,
          name: '@pxlkit/feedback',
          url: 'https://www.npmjs.com/package/@pxlkit/feedback',
          description: '33 alert, status, and notification pixel icons',
        },
        {
          '@type': 'ListItem',
          position: 8,
          name: '@pxlkit/effects',
          url: 'https://www.npmjs.com/package/@pxlkit/effects',
          description: '12 animated VFX and particle pixel icons',
        },
        {
          '@type': 'ListItem',
          position: 9,
          name: '@pxlkit/parallax',
          url: 'https://www.npmjs.com/package/@pxlkit/parallax',
          description: '10 multi-layer 3D parallax pixel icons',
        },
        {
          '@type': 'ListItem',
          position: 10,
          name: '@pxlkit/voxel',
          url: 'https://www.npmjs.com/package/@pxlkit/voxel',
          description: 'Coming soon — 3D voxel game engine with procedural world generation',
        },
      ],
    },
    /* ── FAQPage — mirrors the visible landing FAQ verbatim (SSoT: lib/landing-faq.ts) ── */
    {
      '@type': 'FAQPage',
      mainEntity: LANDING_FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    },
  ],
};

/**
 * Inline script that runs before React hydrates to set the correct
 * theme class on `<html>`, preventing a flash of the wrong theme.
 */
const THEME_INIT_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem('pxlkit-theme');
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  } catch(e){}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {/* Icons — SVG first for modern browsers, PNG fallbacks for legacy. */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="Pxlkit" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen relative flex flex-col overflow-x-clip">
        <ThemeProvider>
          <ToastProvider defaultPosition="top-right" maxToasts={6}>
            {/* Subtle grid background — adapts to theme via CSS variable */}
            <div className="fixed inset-0 pointer-events-none opacity-60 bg-grid-pattern" data-pxlkit="grid-bg" />

            <div className="relative z-10 flex flex-col min-h-screen">
              <ConditionalShell>
                {children}
              </ConditionalShell>
            </div>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
