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
const SITE_TAGLINE = 'Open-Source Retro React UI Kit & Icon Library';
const SITE_DESCRIPTION =
  'Pxlkit is a free, open-source retro React UI kit with 40 pixel-art components and 204+ hand-crafted icons. Build pixel-perfect interfaces with TypeScript, Tailwind CSS, and zero native browser UI. Community-driven and tree-shakeable.';

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
    'retro react ui kit',
    'pixel art ui kit',
    'react component library',
    'pixel art icons',
    'retro icons',
    '16x16 icons',
    '8-bit icons',
    'svg icons',
    'react icons',
    'icon library',
    'icon builder',
    'pixel art generator',
    'open source react ui',
    'tailwind ui components',
    'pixel buttons',
    'pixel forms',
    'retro UI components',
    'gamification icons',
    'tree-shakeable icons',
    'typescript ui kit',
    'pxlkit',
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

/** JSON-LD Structured Data — SoftwareApplication + WebSite */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/icons?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      author: {
        '@type': 'Person',
        name: 'Joangel De La Rosa',
        url: 'https://github.com/joangeldelarosa',
      },
      license: 'https://pxlkit.xyz/pricing',
      offers: [
        {
          '@type': 'Offer',
          name: 'Community',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free with attribution',
        },
        {
          '@type': 'Offer',
          name: 'Indie License',
          price: '29',
          priceCurrency: 'USD',
          description: 'One project, no attribution required',
        },
        {
          '@type': 'Offer',
          name: 'Team License',
          price: '79',
          priceCurrency: 'USD',
          description: 'Unlimited projects, no attribution required',
        },
      ],
      softwareVersion: '1.0.0',
      programmingLanguage: ['TypeScript', 'React'],
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
            <div className="fixed inset-0 pointer-events-none opacity-60 bg-grid-pattern" />

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
