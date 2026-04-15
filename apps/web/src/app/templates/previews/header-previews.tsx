'use client';

import { PxlKitIcon } from '@pxlkit/core';
import { Grid } from '@pxlkit/ui';
import { PixelButton, PixelBadge } from '@pxlkit/ui-kit';

const NAV_ITEMS = ['Home', 'Features', 'Pricing', 'Docs'];

/* ── Header Simple ──────────────────────────────────────────────────────── */
export function HeaderSimplePreview() {
  return (
    <div className="bg-retro-bg">
      <header className="flex items-center justify-between px-6 h-16 border-b border-retro-border">
        <div className="flex items-center gap-2.5">
          <PxlKitIcon icon={Grid} size={22} className="text-retro-green" />
          <span className="font-pixel text-sm text-retro-text">MyApp</span>
        </div>

        <nav className="hidden sm:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <span
              key={item}
              className="font-mono text-sm text-retro-muted hover:text-retro-green cursor-pointer transition-colors"
            >
              {item}
            </span>
          ))}
        </nav>

        <PixelButton tone="green" size="sm">
          Sign Up
        </PixelButton>
      </header>

      <div className="flex flex-col items-center justify-center px-6 py-24 gap-4 text-center">
        <p className="font-pixel text-xs text-retro-muted/60 tracking-widest uppercase">
          Header Preview
        </p>
        <p className="font-mono text-sm text-retro-muted max-w-sm">
          Logo left · Nav center · CTA right. Clean and minimal.
        </p>
      </div>
    </div>
  );
}

/* ── Header Dropdown ────────────────────────────────────────────────────── */
export function HeaderDropdownPreview() {
  return (
    <div className="bg-retro-bg">
      <header className="flex items-center justify-between px-6 h-16 border-b border-retro-border">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <PxlKitIcon icon={Grid} size={22} className="text-retro-cyan" />
            <span className="font-pixel text-sm text-retro-text">DevKit</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Products ▾', active: true },
              { label: 'Solutions', active: false },
              { label: 'Resources ▾', active: false },
              { label: 'Pricing', active: false },
            ].map((item) => (
              <span
                key={item.label}
                className={`px-3 py-1.5 font-mono text-sm cursor-pointer rounded transition-colors ${
                  item.active
                    ? 'text-retro-cyan bg-retro-cyan/10'
                    : 'text-retro-muted hover:text-retro-text hover:bg-retro-surface/40'
                }`}
              >
                {item.label}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <PixelButton tone="neutral" size="sm" variant="ghost">
            Login
          </PixelButton>
          <PixelButton tone="cyan" size="sm">
            Get Started
          </PixelButton>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center px-6 py-24 gap-4 text-center">
        <p className="font-pixel text-xs text-retro-muted/60 tracking-widest uppercase">
          Header Preview
        </p>
        <p className="font-mono text-sm text-retro-muted max-w-sm">
          Logo + dropdown nav · dual CTAs. Active item highlighted.
        </p>
      </div>
    </div>
  );
}

/* ── Header Centered Logo ───────────────────────────────────────────────── */
export function HeaderCenteredLogoPreview() {
  return (
    <div className="bg-retro-bg">
      <header className="border-b border-retro-border">
        <div className="flex items-center h-16 px-6">
          <nav className="hidden sm:flex items-center gap-6 flex-1">
            {['About', 'Shop'].map((item) => (
              <span
                key={item}
                className="font-mono text-sm text-retro-muted hover:text-retro-gold cursor-pointer transition-colors"
              >
                {item}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2 mx-auto">
            <PxlKitIcon icon={Grid} size={24} className="text-retro-gold" />
            <span className="font-pixel text-base text-retro-text">PIXEL</span>
            <PixelBadge tone="gold">PRO</PixelBadge>
          </div>

          <nav className="hidden sm:flex items-center gap-6 flex-1 justify-end">
            {['Blog', 'Contact'].map((item) => (
              <span
                key={item}
                className="font-mono text-sm text-retro-muted hover:text-retro-gold cursor-pointer transition-colors"
              >
                {item}
              </span>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center px-6 py-24 gap-4 text-center">
        <p className="font-pixel text-xs text-retro-muted/60 tracking-widest uppercase">
          Header Preview
        </p>
        <p className="font-mono text-sm text-retro-muted max-w-sm">
          Symmetric layout · centered brand logo · balanced navigation.
        </p>
      </div>
    </div>
  );
}

