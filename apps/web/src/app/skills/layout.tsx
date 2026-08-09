import type { Metadata } from 'next';
import { INSTALL_COMMAND, PLUGIN_VERSION, SKILLS } from '@/lib/skills-data';

/**
 * No " | Pxlkit" suffix here: the root layout applies a `%s | Pxlkit` title
 * template, so including it produces "… | Pxlkit | Pxlkit" in the tab and in
 * every search result.
 */
const TITLE = 'Claude Code Skills — Build Pixel-Perfect UI with AI';
const DESCRIPTION =
  'Five Claude Code skills for pxlkit: imagine new pixel-art frontends, convert existing sites, author icons, and audit for canonical usage. Install with one command.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'claude code plugin',
    'claude code skills',
    'claude code marketplace',
    'ai ui generation',
    'ai design system',
    'pixel art ui ai',
    'pxlkit skills',
    'pxlkit claude',
    'generate react ui with ai',
    'convert site to pixel art',
    'ai component generation',
    'claude plugin install',
    'retro ui ai',
    'design system agent',
    'ai frontend generator',
    'pixel art icon generator',
    'react ui kit ai',
  ],
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://pxlkit.xyz/skills',
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 640,
        alt: 'Pxlkit Claude Code skills — build pixel-perfect interfaces with AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-twitter.png'],
  },
  alternates: {
    canonical: 'https://pxlkit.xyz/skills',
  },
};

/**
 * Structured data.
 *
 * The audience for this page includes agents as much as people: someone pastes the
 * URL into an assistant, or a model searches for "pxlkit claude skill". SoftwareApplication
 * plus a HowTo whose single step is the install command is what makes that legible.
 */
function JsonLd() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'pxlkit Claude Code plugin',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'macOS, Linux, Windows',
        softwareVersion: PLUGIN_VERSION,
        description: DESCRIPTION,
        url: 'https://pxlkit.xyz/skills',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: SKILLS.map((s) => `${s.command} — ${s.tagline}`),
      },
      {
        '@type': 'HowTo',
        name: 'Install the pxlkit Claude Code plugin',
        description: 'Register the marketplace and install the plugin.',
        step: [
          {
            '@type': 'HowToStep',
            name: 'Install',
            text: INSTALL_COMMAND,
            url: 'https://pxlkit.xyz/skills#install',
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- static, locally constructed JSON-LD
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd />
      {children}
    </>
  );
}
