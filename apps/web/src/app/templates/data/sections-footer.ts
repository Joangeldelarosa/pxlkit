import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/social';

const minimalFooter = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import Link from 'next/link';
import { PxlKitIcon } from '@pxlkit/core';
import { Globe, AtSign } from '@pxlkit/social';
import { PixelCenter } from '@pxlkit/ui-kit';

export function MinimalFooter() {
  return (
    <footer className="border-t border-retro-border/50 bg-retro-bg/80">
      <PixelCenter as="div" maxWidth="3xl" gutter="lg" className="py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-pixel text-[10px] text-retro-green">MYAPP</span>

          <div className="flex items-center gap-4 font-mono text-xs text-retro-muted">
            <Link href="/privacy" className="hover:text-retro-text transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-retro-text transition-colors">Terms</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-retro-text transition-colors">
              GitHub
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-retro-muted hover:text-retro-cyan transition-colors" aria-label="Twitter">
              <PxlKitIcon icon={AtSign} size={16} />
            </a>
            <a href="https://myapp.com" target="_blank" rel="noopener noreferrer" className="text-retro-muted hover:text-retro-green transition-colors" aria-label="Website">
              <PxlKitIcon icon={Globe} size={16} />
            </a>
          </div>
        </div>
      </PixelCenter>
    </footer>
  );
}
`;

const multiColumnFooter = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import Link from 'next/link';
import { PxlKitIcon } from '@pxlkit/core';
import { Globe, AtSign, Heart } from '@pxlkit/social';
import { Mail } from '@pxlkit/feedback';
import {
  PixelInput,
  PixelButton,
  PixelTextLink,
  PixelContainer,
  PixelGrid,
  PixelStack,
  PixelCluster,
  PixelDivider,
} from '@pxlkit/ui-kit';

const LINKS = {
  Product: [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/docs', label: 'Documentation' },
    { href: '/changelog', label: 'Changelog' },
  ],
  Community: [
    { href: 'https://github.com', label: 'GitHub', external: true },
    { href: '/discord', label: 'Discord' },
    { href: '/blog', label: 'Blog' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/license', label: 'License' },
  ],
};

export function MultiColumnFooter() {
  return (
    <footer className="border-t border-retro-border/50 bg-retro-surface/30 mt-auto">
      <PixelContainer as="div" maxWidth="3xl" padding="md">
        <PixelGrid cols={{ base: 1, md: 4 }} gap={8}>
          {/* Brand + newsletter */}
          <PixelStack gap={3} align="start">
            <Link href="/" className="font-pixel text-[10px] text-retro-green">MYAPP</Link>
            <p className="text-retro-muted font-mono text-xs">
              The open-source retro React UI kit.
            </p>
            <div className="flex w-full gap-2">
              <div className="flex-1">
                <PixelInput
                  size="sm"
                  placeholder="your@email.com"
                  aria-label="Newsletter email"
                />
              </div>
              <PixelButton tone="green" size="sm" aria-label="Subscribe">
                <PxlKitIcon icon={Mail} size={14} />
              </PixelButton>
            </div>
          </PixelStack>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <PixelStack key={group} gap={4} align="start">
              <h3 className="font-pixel text-[9px] text-retro-text uppercase">{group}</h3>
              <PixelStack as="ul" gap={2} align="start">
                {items.map((item) => (
                  <li key={item.href}>
                    <PixelTextLink
                      href={item.href}
                      className="text-xs font-mono"
                      target={'external' in item && item.external ? '_blank' : undefined}
                      rel={'external' in item && item.external ? 'noopener noreferrer' : undefined}
                    >
                      {item.label}
                    </PixelTextLink>
                  </li>
                ))}
              </PixelStack>
            </PixelStack>
          ))}
        </PixelGrid>

        <PixelDivider tone="neutral" spacing="md" />

        <PixelCluster gap={3} justify="between">
          <p className="text-retro-muted text-xs font-mono">
            © {new Date().getFullYear()} MyApp. All rights reserved.
          </p>
          <PixelCluster gap={3}>
            <span className="flex items-center gap-1 text-retro-muted text-xs font-mono">
              Built with <PxlKitIcon icon={Heart} size={12} colorful className="mx-1" /> and pixels
            </span>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-retro-muted hover:text-retro-cyan transition-colors" aria-label="Twitter">
              <PxlKitIcon icon={AtSign} size={14} />
            </a>
            <a href="https://myapp.com" target="_blank" rel="noopener noreferrer" className="text-retro-muted hover:text-retro-green transition-colors" aria-label="Website">
              <PxlKitIcon icon={Globe} size={14} />
            </a>
          </PixelCluster>
        </PixelCluster>
      </PixelContainer>
    </footer>
  );
}
`;

const ctaFooter = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import Link from 'next/link';
import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { Heart, Globe } from '@pxlkit/social';
import {
  PixelCard,
  PixelButton,
  PixelGlitch,
  PixelFadeIn,
  PixelContainer,
  PixelCenter,
  PixelStack,
  PixelCluster,
} from '@pxlkit/ui-kit';

export function CtaFooter() {
  return (
    <footer className="border-t border-retro-border/50 bg-retro-bg">
      {/* CTA card */}
      <PixelContainer as="div" maxWidth="md" padding="md">
        <PixelFadeIn>
          <PixelCard tone="green" padding="lg" className="text-center sm:p-12">
            <PixelStack gap={5} align="center">
              <PixelGlitch>
                <h2 className="font-pixel text-lg sm:text-2xl text-retro-text leading-loose">
                  Ready to ship pixels?
                </h2>
              </PixelGlitch>
              <p className="text-retro-muted font-mono text-sm max-w-md mx-auto">
                Join thousands of developers building with Pxlkit. Free forever, open source.
              </p>
              <PixelCluster gap={3} justify="center">
                <PixelButton
                  tone="green"
                  size="lg"
                  iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
                >
                  Get Started Free
                </PixelButton>
                <PixelButton tone="neutral" size="lg" variant="outline">
                  View on GitHub
                </PixelButton>
              </PixelCluster>
            </PixelStack>
          </PixelCard>
        </PixelFadeIn>
      </PixelContainer>

      {/* Bottom bar */}
      <div className="border-t border-retro-border/30">
        <PixelCenter as="div" maxWidth="3xl" gutter="lg" className="py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-retro-muted">
            <span className="font-pixel text-[10px] text-retro-green">MYAPP</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-retro-text transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-retro-text transition-colors">Terms</Link>
            </div>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <PxlKitIcon icon={Heart} size={12} colorful />
              <a href="https://myapp.com" className="hover:text-retro-green transition-colors" aria-label="Website">
                <PxlKitIcon icon={Globe} size={14} />
              </a>
            </div>
          </div>
        </PixelCenter>
      </div>
    </footer>
  );
}
`;

export const footerSection: TemplateSection = {
  id: 'footer',
  name: 'Footers',
  description: 'Site footers ranging from minimal single-row to full multi-column with newsletter.',
  icon: '🔻',
  variants: [
    {
      id: 'footer-minimal',
      name: 'Minimal Footer',
      description: 'Single-row footer with brand name, links, and social icons.',
      installCmd: INSTALL,
      code: minimalFooter,
    },
    {
      id: 'footer-multi',
      name: 'Multi-column',
      description: '4-column footer with link groups, newsletter signup, and social icons.',
      installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/social @pxlkit/feedback',
      code: multiColumnFooter,
    },
    {
      id: 'footer-cta',
      name: 'CTA Footer',
      description: 'Footer with large PixelCard CTA section above the standard links.',
      installCmd: INSTALL,
      code: ctaFooter,
    },
  ],
};
