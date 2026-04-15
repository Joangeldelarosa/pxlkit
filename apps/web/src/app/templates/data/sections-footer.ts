import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/social';

const minimalFooter = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import Link from 'next/link';
import { PxlKitIcon } from '@pxlkit/core';
import { Globe, AtSign } from '@pxlkit/social';

export function MinimalFooter() {
  return (
    <footer className="border-t border-retro-border/50 bg-retro-bg/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
import { PixelInput, PixelButton, PixelTextLink } from '@pxlkit/ui-kit';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand + newsletter */}
          <div className="md:col-span-1">
            <Link href="/" className="font-pixel text-[10px] text-retro-green block mb-3">MYAPP</Link>
            <p className="text-retro-muted font-mono text-xs mb-4">
              The open-source retro React UI kit.
            </p>
            <div className="flex gap-2">
              <PixelInput
                size="sm"
                placeholder="your@email.com"
                className="flex-1"
                aria-label="Newsletter email"
              />
              <PixelButton tone="green" size="sm">
                <PxlKitIcon icon={Mail} size={14} />
              </PixelButton>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <h3 className="font-pixel text-[9px] text-retro-text mb-4 uppercase">{group}</h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <PixelTextLink
                      href={item.href}
                      external={'external' in item && item.external}
                      className="text-xs font-mono"
                    >
                      {item.label}
                    </PixelTextLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-retro-border/30 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-retro-muted text-xs font-mono">
            © {new Date().getFullYear()} MyApp. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-retro-muted text-xs font-mono">
            <span className="flex items-center gap-1">
              Built with <PxlKitIcon icon={Heart} size={12} colorful className="mx-1" /> and pixels
            </span>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-retro-cyan transition-colors">
              <PxlKitIcon icon={AtSign} size={14} />
            </a>
            <a href="https://myapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-retro-green transition-colors">
              <PxlKitIcon icon={Globe} size={14} />
            </a>
          </div>
        </div>
      </div>
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
} from '@pxlkit/ui-kit';

export function CtaFooter() {
  return (
    <footer className="border-t border-retro-border/50 bg-retro-bg">
      {/* CTA card */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <PixelFadeIn>
          <PixelCard className="text-center p-8 sm:p-12 bg-retro-green/5 border-retro-green/30">
            <PixelGlitch active>
              <h2 className="font-pixel text-lg sm:text-2xl text-retro-text mb-4 leading-loose">
                Ready to ship pixels?
              </h2>
            </PixelGlitch>
            <p className="text-retro-muted font-mono text-sm mb-6 max-w-md mx-auto">
              Join thousands of developers building with Pxlkit. Free forever, open source.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <PixelButton tone="green" size="lg">
                Get Started Free
                <PxlKitIcon icon={ArrowRight} size={14} className="ml-2" />
              </PixelButton>
              <PixelButton tone="neutral" size="lg" variant="outline">
                View on GitHub
              </PixelButton>
            </div>
          </PixelCard>
        </PixelFadeIn>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-retro-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-retro-muted">
          <span className="font-pixel text-[10px] text-retro-green">MYAPP</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-retro-text transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-retro-text transition-colors">Terms</Link>
          </div>
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <PxlKitIcon icon={Heart} size={12} colorful />
            <a href="https://myapp.com" className="hover:text-retro-green transition-colors">
              <PxlKitIcon icon={Globe} size={14} />
            </a>
          </div>
        </div>
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
