import type { Metadata, Viewport } from 'next';
import { ConditionalShell } from '../components/ConditionalShell';
import { JsonLd } from '../components/JsonLd';
import { ThemeProvider } from '../components/ThemeProvider';
import { ToastProvider } from '../components/ToastProvider';
import { SITE_NAME, SITE_URL, SOCIAL_IMAGE, TWITTER_IMAGE } from '@/lib/seo';
import { SITE_DESCRIPTION, SITE_TAGLINE } from '@/lib/site-copy';
import { SITE_STRUCTURED_DATA } from '@/lib/structured-data';
import './globals.css';
import { Analytics } from "@vercel/analytics/next";

const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
const DEFAULT_IMAGE_ALT = 'Pxlkit — retro pixel-art UI kit for React, now also for Vue and Angular';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0F' },
    { media: '(prefers-color-scheme: light)', color: '#F2F0EB' },
  ],
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark light',
};

/**
 * Defaults for every page. Each indexable page sets its canonical URL and its
 * previews with `pageMetadata` (lib/seo.ts); there is no canonical here, where
 * a page without its own would inherit the home page's.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'pxlkit',
    'react pixel art ui kit',
    'retro react components',
    'pixel art react components',
    '8-bit react components',
    'retro react ui kit',
    'pixel art ui kit',
    'retro design system',
    'react component library',
    'react ui kit typescript',
    'tailwind css react components',
    'pixel art icons react',
    'pixel art svg icons',
    'retro icons',
    '8-bit icons',
    'animated pixel icons',
    '3d parallax icons',
    'pixel icon builder',
    'react landing page template',
    'react dashboard template',
    'retro toast notifications',
    'vue pixel art ui kit',
    'retro vue components',
    'nuxt ui kit',
    'angular pixel art ui kit',
    'retro angular components',
    'angular standalone components',
  ],
  authors: [{ name: 'Joangel De La Rosa', url: 'https://github.com/joangeldelarosa' }],
  creator: 'Joangel De La Rosa',
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  referrer: 'origin-when-cross-origin',
  // Indexing and following are the defaults, so a page that opts out emits one robots tag.
  robots: {
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ ...SOCIAL_IMAGE, alt: DEFAULT_IMAGE_ALT }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ ...TWITTER_IMAGE, alt: DEFAULT_IMAGE_ALT }],
  },
  manifest: '/site.webmanifest',
  icons: {
    // SVG first for current browsers, PNG fallbacks for the rest.
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  appleWebApp: {
    title: SITE_NAME,
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  category: 'technology',
  other: {
    'msapplication-TileColor': '#0A0A0F',
  },
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
        <JsonLd data={SITE_STRUCTURED_DATA} />
      </head>
      <body className="min-h-screen relative flex flex-col overflow-x-clip">
        <ThemeProvider>
          <ToastProvider defaultPosition="top-right" maxToasts={6}>
            {/* Subtle grid background — adapts to theme via CSS variable */}
            <div className="fixed inset-0 pointer-events-none opacity-60 bg-grid-pattern" data-pxlkit="grid-bg" />

            <div className="relative z-10 flex flex-col min-h-screen">
              {/* The footer's copyright year, from this render rather than the reader's clock. */}
              <ConditionalShell year={new Date().getFullYear()}>
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
