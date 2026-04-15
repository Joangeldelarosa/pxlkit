'use client';

import { PxlKitIcon } from '@pxlkit/core';
import { Grid, ArrowRight } from '@pxlkit/ui';
import { PixelButton, PixelDivider } from '@pxlkit/ui-kit';

/* ── Footer Minimal ─────────────────────────────────────────────────────── */
export function FooterMinimalPreview() {
  return (
    <div className="bg-retro-bg">
      <div className="flex flex-col items-center justify-center px-6 py-20 gap-3 text-center">
        <p className="font-pixel text-xs text-retro-muted/60 tracking-widest uppercase">
          Footer Preview
        </p>
        <p className="font-mono text-sm text-retro-muted max-w-sm">
          Minimal one-line footer with brand, links, and copyright.
        </p>
      </div>
      <footer className="px-6 py-5 border-t border-retro-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PxlKitIcon icon={Grid} size={18} className="text-retro-green" />
            <span className="font-pixel text-sm text-retro-text">MyApp</span>
          </div>
          <nav className="flex items-center gap-6 font-mono text-sm text-retro-muted">
            <span className="cursor-pointer hover:text-retro-green transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-retro-green transition-colors">Terms</span>
            <span className="cursor-pointer hover:text-retro-green transition-colors">GitHub</span>
          </nav>
          <span className="font-mono text-sm text-retro-muted/50">© 2026 MyApp</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Footer Multi-column ────────────────────────────────────────────────── */
export function FooterMultiColumnPreview() {
  return (
    <div className="bg-retro-bg">
      <div className="flex flex-col items-center justify-center px-6 py-16 gap-3 text-center">
        <p className="font-pixel text-xs text-retro-muted/60 tracking-widest uppercase">
          Footer Preview
        </p>
        <p className="font-mono text-sm text-retro-muted max-w-sm">
          Multi-column footer with organized link categories.
        </p>
      </div>
      <footer className="border-t border-retro-border bg-retro-bg">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            {['Product', 'Resources', 'Company', 'Legal'].map((title) => (
              <div key={title}>
                <p className="font-pixel text-xs text-retro-text mb-3">{title}</p>
                <ul className="space-y-2">
                  {['Overview', 'Changelog', 'Contact'].map((link) => (
                    <li
                      key={link}
                      className="font-mono text-sm text-retro-muted cursor-pointer hover:text-retro-green transition-colors"
                    >
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <PixelDivider tone="neutral" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
            <span className="font-mono text-sm text-retro-muted/50">
              © 2026 DevKit. All rights reserved.
            </span>
            <div className="flex gap-4">
              {['🐦', '💬', '📧'].map((e) => (
                <span
                  key={e}
                  className="text-xl cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                >
                  {e}
                </span>
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
      <div className="flex flex-col items-center justify-center px-6 py-16 gap-3 text-center">
        <p className="font-pixel text-xs text-retro-muted/60 tracking-widest uppercase">
          Footer Preview
        </p>
        <p className="font-mono text-sm text-retro-muted max-w-sm">
          Footer with an embedded CTA banner above copyright links.
        </p>
      </div>
      <footer className="border-t border-retro-border bg-retro-bg">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="rounded-xl border border-retro-green/30 bg-retro-green/5 px-6 py-8 text-center mb-8">
            <p className="font-pixel text-sm sm:text-base text-retro-text mb-2">
              Ready to ship?
            </p>
            <p className="font-mono text-sm text-retro-muted mb-5">
              Get started with Pxlkit in under 2 minutes.
            </p>
            <PixelButton
              tone="green"
              size="md"
              iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
            >
              Start Building
            </PixelButton>
          </div>
          <PixelDivider tone="neutral" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
            <span className="font-mono text-sm text-retro-muted/50">© 2026 Pxlkit</span>
            <nav className="flex gap-6 font-mono text-sm text-retro-muted">
              <span className="cursor-pointer hover:text-retro-green transition-colors">Terms</span>
              <span className="cursor-pointer hover:text-retro-green transition-colors">Privacy</span>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
