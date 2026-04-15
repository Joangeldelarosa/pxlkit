'use client';

import { PxlKitIcon } from '@pxlkit/core';
import { Grid, ArrowRight } from '@pxlkit/ui';
import { PixelButton, PixelDivider } from '@pxlkit/ui-kit';

/* ── Footer Minimal ───────────────────────────────────────────────────── */
export function FooterMinimalPreview() {
  return (
    <footer className="px-4 py-4 border-t border-retro-border bg-retro-bg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PxlKitIcon icon={Grid} size={14} className="text-retro-green" />
          <span className="font-pixel text-[10px] text-retro-text">MyApp</span>
        </div>
        <nav className="flex items-center gap-3 font-mono text-[9px] text-retro-muted">
          <span className="cursor-pointer hover:text-retro-green">Privacy</span>
          <span className="cursor-pointer hover:text-retro-green">Terms</span>
          <span className="cursor-pointer hover:text-retro-green">GitHub</span>
        </nav>
        <span className="font-mono text-[9px] text-retro-muted/60">© 2026 MyApp</span>
      </div>
    </footer>
  );
}

/* ── Footer Multi-column ──────────────────────────────────────────────── */
export function FooterMultiColumnPreview() {
  return (
    <footer className="px-4 py-6 border-t border-retro-border bg-retro-bg">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {['Product', 'Resources', 'Company', 'Legal'].map((title) => (
          <div key={title}>
            <p className="font-pixel text-[9px] text-retro-text mb-2">{title}</p>
            <ul className="space-y-1">
              {['Link 1', 'Link 2', 'Link 3'].map((link) => (
                <li key={link} className="font-mono text-[9px] text-retro-muted cursor-pointer hover:text-retro-green">
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <PixelDivider tone="neutral" />
      <div className="flex items-center justify-between mt-3">
        <span className="font-mono text-[9px] text-retro-muted/60">© 2026 DevKit. All rights reserved.</span>
        <div className="flex gap-2">
          {['🐦', '💬', '📧'].map((e) => (
            <span key={e} className="text-sm cursor-pointer opacity-50 hover:opacity-100">{e}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ── Footer CTA ───────────────────────────────────────────────────────── */
export function FooterCtaPreview() {
  return (
    <footer className="px-4 py-6 bg-retro-bg">
      <div className="rounded border border-retro-green/30 bg-retro-green/5 px-4 py-4 text-center mb-4">
        <p className="font-pixel text-xs text-retro-text mb-1">Ready to ship?</p>
        <p className="font-mono text-[10px] text-retro-muted mb-3">
          Get started with Pxlkit in under 2 minutes.
        </p>
        <PixelButton tone="green" size="sm">
          Start Building
          <PxlKitIcon icon={ArrowRight} size={11} className="ml-1" />
        </PixelButton>
      </div>
      <div className="flex items-center justify-between border-t border-retro-border pt-3">
        <span className="font-mono text-[9px] text-retro-muted/60">© 2026 Pxlkit</span>
        <nav className="flex gap-3 font-mono text-[9px] text-retro-muted">
          <span className="cursor-pointer hover:text-retro-green">Terms</span>
          <span className="cursor-pointer hover:text-retro-green">Privacy</span>
        </nav>
      </div>
    </footer>
  );
}
