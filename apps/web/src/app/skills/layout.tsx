import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { INSTALL_COMMAND, PLUGIN_VERSION, SKILLS } from '@/lib/skills-data';
import { breadcrumbList } from '@/lib/structured-data';

/**
 * No " | Pxlkit" suffix here: the root layout applies a `%s | Pxlkit` title
 * template, so including it produces "… | Pxlkit | Pxlkit" in the tab and in
 * every search result.
 */
const TITLE = 'Claude Code Skills — Build Pixel-Perfect UI with AI';
const DESCRIPTION =
  'Five Claude Code skills for the pxlkit React kit: imagine pixel-art frontends, convert existing ones, author icons, audit the result. One-command install.';

export const metadata: Metadata = pageMetadata({
  path: '/skills',
  title: TITLE,
  description: DESCRIPTION,
  imageAlt: 'Pxlkit Claude Code skills — build pixel-perfect interfaces with AI',
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
});

/** The plugin as an application, and a HowTo whose single step is the install command. */
const SKILLS_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'pxlkit Claude Code plugin',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'macOS, Linux, Windows',
      softwareVersion: PLUGIN_VERSION,
      description: DESCRIPTION,
      url: absoluteUrl('/skills'),
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
          url: absoluteUrl('/skills#install'),
        },
      ],
    },
  ],
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={SKILLS_STRUCTURED_DATA} />
      <JsonLd data={breadcrumbList([{ name: 'Skills', path: '/skills' }])} />
      {children}
    </>
  );
}
