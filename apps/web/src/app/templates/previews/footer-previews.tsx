'use client';

import { useState } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Grid, ArrowRight, ExternalLink } from '@pxlkit/ui';
import { Globe, ChatBubble } from '@pxlkit/social';
import { Mail, Sparkles, ShieldCheck } from '@pxlkit/feedback';
import { Lightning } from '@pxlkit/gamification';
import { PixelButton, PixelDivider, PixelTooltip, PixelInput, PixelChip } from '@pxlkit/ui-kit';

const socialLinks = [
  { icon: Globe, label: 'Website', tip: 'Visit our website' },
  { icon: ChatBubble, label: 'Discord', tip: 'Join our Discord server' },
  { icon: Mail, label: 'Email', tip: 'Send us an email' },
] as const;

const columns: Record<string, string[]> = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Resources: ['Documentation', 'Tutorials', 'Blog', 'Examples'],
  Company: ['About', 'Careers', 'Press Kit', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licenses'],
};

/* ── Footer Minimal ─────────────────────────────────────────────────────── */
export function FooterMinimalPreview() {
  return (
    <div className="bg-retro-bg">
      <footer className="px-6 py-5 border-t border-retro-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PxlKitIcon icon={Grid} size={18} colorful />
            <span className="font-pixel text-sm text-retro-text">MyApp</span>
          </div>
          <nav className="flex items-center gap-6 font-mono text-sm text-retro-muted">
            <span className="cursor-pointer hover:text-retro-green transition-colors">Docs</span>
            <span className="cursor-pointer hover:text-retro-green transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-retro-green transition-colors">Terms</span>
            <span className="inline-flex items-center gap-1 cursor-pointer hover:text-retro-green transition-colors">
              GitHub
              <PxlKitIcon icon={ExternalLink} size={12} className="text-retro-muted" />
            </span>
          </nav>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon, label, tip }) => (
              <PixelTooltip key={label} content={tip} position="top">
                <span className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                  <PxlKitIcon icon={icon} size={16} colorful />
                </span>
              </PixelTooltip>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Footer Multi-column ────────────────────────────────────────────────── */
export function FooterMultiColumnPreview() {
  const [email, setEmail] = useState('');

  return (
    <div className="bg-retro-bg">
      <footer className="border-t border-retro-border bg-retro-bg">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">
          {/* Brand + columns */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <PxlKitIcon icon={Grid} size={20} colorful />
                <span className="font-pixel text-sm text-retro-text">DevKit</span>
              </div>
              <p className="font-mono text-xs text-retro-muted leading-relaxed mb-4">
                Ship pixel-perfect interfaces with retro flair and modern tooling.
              </p>
              {/* Newsletter signup */}
              <div className="flex gap-1.5 mb-4">
                <PixelInput
                  placeholder="you@email.com"
                  type="email"
                  tone="neutral"
                  size="sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<PxlKitIcon icon={Mail} size={12} colorful />}
                />
                <PixelButton tone="green" size="sm">
                  <PxlKitIcon icon={ArrowRight} size={12} />
                </PixelButton>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-retro-green animate-pulse" />
                <span className="font-mono text-xs text-retro-green">All systems operational</span>
              </div>
            </div>

            {Object.entries(columns).map(([title, links]) => (
              <div key={title}>
                <p className="font-pixel text-xs text-retro-text mb-3">{title}</p>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li
                      key={link}
                      className="font-mono text-sm text-retro-muted cursor-pointer hover:text-retro-green hover:underline underline-offset-2 transition-colors inline-flex items-center gap-1.5"
                    >
                      {link}
                      {link === 'Changelog' && <PixelChip label="New" tone="green" />}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <PixelDivider tone="neutral" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
            <span className="font-mono text-sm text-retro-muted/50">
              &copy; 2026 DevKit. All rights reserved.
            </span>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon, label, tip }) => (
                <PixelTooltip key={label} content={tip} position="top">
                  <span
                    className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                  >
                    <PxlKitIcon icon={icon} size={18} colorful />
                  </span>
                </PixelTooltip>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Footer CTA ─────────────────────────────────────────────────────────── */
export function FooterCtaPreview() {
  return (
    <div className="bg-retro-bg">
      <footer className="border-t border-retro-border bg-retro-bg">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="rounded-xl border border-retro-green/30 bg-retro-green/5 px-6 py-10 text-center mb-8 hover:scale-[1.01] transition-transform">
            <div className="mb-4">
              <PxlKitIcon icon={Lightning} size={28} colorful />
            </div>
            <p className="font-pixel text-sm sm:text-base text-retro-text mb-2">
              Ready to ship something great?
            </p>
            <p className="font-mono text-sm text-retro-muted mb-6 max-w-md mx-auto">
              Get started with Pxlkit in under 2 minutes — pixel-perfect components, zero config.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <PixelButton
                tone="green"
                size="md"
                iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
              >
                Start Building
              </PixelButton>
              <PixelButton
                tone="neutral"
                size="md"
                iconRight={<PxlKitIcon icon={ExternalLink} size={14} />}
              >
                View Docs
              </PixelButton>
            </div>
          </div>

          <PixelDivider tone="neutral" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-retro-muted/50">&copy; 2026 Pxlkit</span>
              <PixelTooltip content="Independently audited and certified" position="top">
                <span className="inline-flex items-center gap-1 font-mono text-xs text-retro-muted/40 cursor-default">
                  <PxlKitIcon icon={ShieldCheck} size={12} colorful />
                  SOC 2 Compliant
                </span>
              </PixelTooltip>
            </div>
            <nav className="flex items-center gap-6 font-mono text-sm text-retro-muted">
              <span className="cursor-pointer hover:text-retro-green transition-colors">Terms</span>
              <span className="cursor-pointer hover:text-retro-green transition-colors">Privacy</span>
              <span className="cursor-pointer hover:text-retro-green transition-colors">Security</span>
              <span className="inline-flex items-center gap-1 cursor-pointer hover:text-retro-green transition-colors">
                Status
                <PxlKitIcon icon={Sparkles} size={12} colorful />
              </span>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
