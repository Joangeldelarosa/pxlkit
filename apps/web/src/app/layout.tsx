import type { Metadata, Viewport } from 'next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ThemeProvider } from '../components/ThemeProvider';
import { ToastProvider } from '../components/ToastProvider';
import './globals.css';
import { Analytics } from "@vercel/analytics/next";

/* ─── SEO Constants ─── */
const SITE_NAME = 'Pxlkit';
const SITE_URL = 'https://pxlkit.xyz';
const SITE_TAGLINE = 'Retro React UI Kit — Pixel-Art Components, Icons, 3D Voxel Engine & Procedural Worlds';
const SITE_DESCRIPTION =
  'Ship retro-styled React interfaces and build 3D voxel games in minutes. Pxlkit is a free, open-source toolkit with 40+ pixel-art UI components, 226+ hand-crafted SVG icons, a voxel game engine powered by Three.js & React Three Fiber, procedural world generation, 3D parallax effects, toast notifications, and a visual icon builder. TypeScript, Tailwind CSS, tree-shakeable — zero native browser UI.';

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
    'indie game ui',
    'open source react ui',
    'typescript ui kit',
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
    /* ── 3D / Parallax ── */
    '3d parallax icons',
    '3d pixel art',
    'parallax react component',
    'multi-layer 3d icons',
    /* ── Voxel Engine & Gaming ── */
    'voxel engine react',
    'voxel game engine',
    'react three fiber game engine',
    'three.js voxel engine',
    'procedural world generation',
    'procedural terrain react',
    'open source game engine',
    'react game engine',
    'voxel world builder',
    'procedural generation library',
    'infinite terrain generation',
    'biome generation',
    'chunk-based rendering',
    'react three fiber procedural',
    'threejs procedural terrain',
    'voxel physics engine',
    'npc game engine react',
    'open source voxel engine',
    'minecraft-like engine react',
    'procedural world react',
    '3d game library react',
    'webgl game engine',
    'browser game engine',
    'indie game engine',
    'react 3d world',
    'procedural biomes',
    'voxel sandbox',
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
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    creator: '@joangeldelarosa',
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/site.webmanifest',
  category: 'technology',
  other: {
    'msapplication-TileColor': '#0A0A0F',
  },
};

/** JSON-LD Structured Data — Organization + WebSite + SoftwareApplication + SoftwareSourceCode + ItemList + FAQPage */
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
    /* ── SoftwareApplication — UI Kit ── */
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#ui-kit`,
      name: `${SITE_NAME} UI Kit`,
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'React Component Library',
      operatingSystem: 'Web',
      description:
        'Open-source retro React UI kit with 40+ pixel-art components, 226+ hand-crafted SVG icons across 10 npm packages, 3D parallax effects, animated icons, a visual builder, and toast notifications. TypeScript-first, Tailwind CSS-powered, fully tree-shakeable.',
      url: SITE_URL,
      author: { '@id': `${SITE_URL}/#organization` },
      license: 'https://pxlkit.xyz/pricing',
      offers: [
        {
          '@type': 'Offer',
          name: 'Community',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free with attribution — all components and icons',
        },
        {
          '@type': 'Offer',
          name: 'Indie License',
          price: '9.50',
          priceCurrency: 'USD',
          description: 'One commercial project, no attribution, lifetime updates',
        },
        {
          '@type': 'Offer',
          name: 'Team License',
          price: '24.50',
          priceCurrency: 'USD',
          description: 'Unlimited projects, all future packs, priority support',
        },
      ],
      softwareVersion: '1.2.2',
      programmingLanguage: ['TypeScript', 'React', 'JavaScript'],
      downloadUrl: 'https://www.npmjs.com/package/@pxlkit/core',
      featureList: [
        '226+ pixel-art SVG icons',
        '40+ retro UI components',
        '10 themed npm packages',
        '3D parallax icons',
        'Animated icon effects',
        'Visual icon builder',
        'Toast notification system',
        'Tree-shakeable imports',
        'TypeScript strict mode',
        'Tailwind CSS integration',
      ],
    },
    /* ── SoftwareSourceCode — Voxel Engine ── */
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE_URL}/#voxel-engine`,
      name: '@pxlkit/voxels',
      description:
        'Open-source 3D voxel game engine built with Three.js and React Three Fiber. Features procedural world generation with 9+ biomes, chunk-based terrain streaming, day/night cycles, NPC systems, physics integration, and a full entity framework for building browser-based voxel games.',
      url: `${SITE_URL}/explore`,
      codeRepository: 'https://github.com/Joangeldelarosa/pxlkit',
      programmingLanguage: ['TypeScript', 'React', 'GLSL'],
      runtimePlatform: 'Web Browser',
      targetProduct: {
        '@type': 'SoftwareApplication',
        name: '@pxlkit/voxels — React Voxel Game Engine',
        applicationCategory: 'GameApplication',
        applicationSubCategory: 'Voxel Game Engine',
        operatingSystem: 'Web',
        description:
          'Build 3D voxel games in the browser with React. Procedural world generation, physics, NPCs, biomes, day/night cycles — open-source game engine powered by Three.js and React Three Fiber.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free and open source',
        },
      },
      author: { '@id': `${SITE_URL}/#organization` },
      license: 'https://pxlkit.xyz/pricing',
    },
    /* ── ItemList — npm Packages ── */
    {
      '@type': 'ItemList',
      name: 'Pxlkit npm Packages',
      description: 'All open-source npm packages in the Pxlkit ecosystem',
      numberOfItems: 10,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '@pxlkit/core', url: 'https://www.npmjs.com/package/@pxlkit/core', description: 'Core rendering engine, React components, and SVG utilities' },
        { '@type': 'ListItem', position: 2, name: '@pxlkit/ui-kit', url: 'https://www.npmjs.com/package/@pxlkit/ui-kit', description: '40+ retro pixel-art React UI components' },
        { '@type': 'ListItem', position: 3, name: '@pxlkit/gamification', url: 'https://www.npmjs.com/package/@pxlkit/gamification', description: '51 RPG, achievement, and reward pixel icons' },
        { '@type': 'ListItem', position: 4, name: '@pxlkit/feedback', url: 'https://www.npmjs.com/package/@pxlkit/feedback', description: '33 alert, status, and notification pixel icons' },
        { '@type': 'ListItem', position: 5, name: '@pxlkit/social', url: 'https://www.npmjs.com/package/@pxlkit/social', description: '43 community, emoji, and messaging pixel icons' },
        { '@type': 'ListItem', position: 6, name: '@pxlkit/weather', url: 'https://www.npmjs.com/package/@pxlkit/weather', description: '36 climate, moon, and nature pixel icons' },
        { '@type': 'ListItem', position: 7, name: '@pxlkit/ui', url: 'https://www.npmjs.com/package/@pxlkit/ui', description: '41 interface control and navigation pixel icons' },
        { '@type': 'ListItem', position: 8, name: '@pxlkit/effects', url: 'https://www.npmjs.com/package/@pxlkit/effects', description: '12 animated VFX and particle pixel icons' },
        { '@type': 'ListItem', position: 9, name: '@pxlkit/parallax', url: 'https://www.npmjs.com/package/@pxlkit/parallax', description: '10 multi-layer 3D parallax pixel icons' },
        { '@type': 'ListItem', position: 10, name: '@pxlkit/voxel', url: 'https://www.npmjs.com/package/@pxlkit/voxel', description: '3D voxel game engine with procedural world generation' },
      ],
    },
    /* ── FAQPage ── */
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is Pxlkit free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Pxlkit is open source and free with attribution. Paid licenses remove the attribution requirement and unlock priority support.',
          },
        },
        {
          '@type': 'Question',
          name: 'What frameworks does Pxlkit support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Pxlkit is built for React with TypeScript. It works with Next.js, Vite, CRA, and any React setup. Icons render as pure SVG so they work anywhere. The voxel engine uses React Three Fiber and Three.js.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many icons and components are included?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Pxlkit includes 40+ pixel-art UI components and 226+ hand-crafted SVG icons across 10 themed npm packages, plus animated icons, 3D parallax effects, and a voxel game engine.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the bundle size small?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Every icon and component is tree-shakeable. Import only what you use — your final bundle includes zero unused code.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is @pxlkit/voxels?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '@pxlkit/voxels is an open-source 3D voxel game engine built on Three.js and React Three Fiber. It features procedural world generation with 9+ biomes, chunk-based terrain, day/night cycles, physics, NPC systems, and a full entity framework for building browser-based voxel games with React.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I build games with Pxlkit?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The @pxlkit/voxels engine lets you create 3D voxel games in the browser using React. It provides procedural terrain generation, biome systems (plains, desert, tundra, forest, mountains, ocean, city, swamp, village), physics integration, NPC creation, and real-time chunk streaming — everything you need for a Minecraft-like game in React.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does the procedural world generation work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Pxlkit uses seeded Perlin noise and fractal Brownian motion (FBM) to generate infinite, deterministic worlds. Terrain is divided into 16×16 chunks that load dynamically around the camera with frustum culling. Each biome has unique elevation, vegetation, structures, and color palettes.',
          },
        },
        {
          '@type': 'Question',
          name: 'What biomes are available in the voxel engine?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The engine currently supports 9+ biomes: plains, desert, tundra, forest, mountains, ocean, city (with 20+ building types), swamp, and village. Each biome features unique terrain, vegetation, structures, and ambient effects like weather particles and wildlife.',
          },
        },
      ],
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
    } else {
      document.documentElement.classList.add('dark');
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="Pxlkit" />
      </head>
      <body className="min-h-screen relative flex flex-col overflow-x-clip">
        <ThemeProvider>
          <ToastProvider defaultPosition="top-right" maxToasts={6}>
            {/* Subtle grid background — adapts to theme via CSS variable */}
            <div className="fixed inset-0 pointer-events-none opacity-60 bg-grid-pattern" data-pxlkit="grid-bg" />

            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
