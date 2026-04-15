'use client';

import { PxlKitIcon } from '@pxlkit/core';
import { Grid } from '@pxlkit/ui';
import { PixelButton, PixelBadge } from '@pxlkit/ui-kit';

/* ── Header Simple ────────────────────────────────────────────────────── */
export function HeaderSimplePreview() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-retro-border bg-retro-bg">
      <div className="flex items-center gap-2">
        <PxlKitIcon icon={Grid} size={18} className="text-retro-green" />
        <span className="font-pixel text-xs text-retro-text">MyApp</span>
      </div>
      <nav className="hidden sm:flex items-center gap-4">
        <span className="font-mono text-[10px] text-retro-muted hover:text-retro-green cursor-pointer">Home</span>
        <span className="font-mono text-[10px] text-retro-muted hover:text-retro-green cursor-pointer">Features</span>
        <span className="font-mono text-[10px] text-retro-muted hover:text-retro-green cursor-pointer">Pricing</span>
        <span className="font-mono text-[10px] text-retro-muted hover:text-retro-green cursor-pointer">Docs</span>
      </nav>
      <PixelButton tone="green" size="sm">
        Sign Up
      </PixelButton>
    </header>
  );
}

/* ── Header Dropdown ──────────────────────────────────────────────────── */
export function HeaderDropdownPreview() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-retro-border bg-retro-bg">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <PxlKitIcon icon={Grid} size={18} className="text-retro-cyan" />
          <span className="font-pixel text-xs text-retro-text">DevKit</span>
        </div>
        <nav className="hidden sm:flex items-center gap-3">
          <span className="font-mono text-[10px] text-retro-text cursor-pointer border-b border-retro-cyan pb-0.5">
            Products ▾
          </span>
          <span className="font-mono text-[10px] text-retro-muted cursor-pointer">Solutions</span>
          <span className="font-mono text-[10px] text-retro-muted cursor-pointer">Resources ▾</span>
          <span className="font-mono text-[10px] text-retro-muted cursor-pointer">Pricing</span>
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
  );
}

/* ── Header Centered Logo ─────────────────────────────────────────────── */
export function HeaderCenteredLogoPreview() {
  return (
    <header className="px-4 py-3 border-b border-retro-border bg-retro-bg">
      <div className="flex items-center justify-between">
        <nav className="hidden sm:flex items-center gap-3">
          <span className="font-mono text-[10px] text-retro-muted cursor-pointer">About</span>
          <span className="font-mono text-[10px] text-retro-muted cursor-pointer">Shop</span>
        </nav>
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <PxlKitIcon icon={Grid} size={20} className="text-retro-gold" />
          <span className="font-pixel text-sm text-retro-text">PIXEL</span>
          <PixelBadge tone="gold">PRO</PixelBadge>
        </div>
        <nav className="hidden sm:flex items-center gap-3">
          <span className="font-mono text-[10px] text-retro-muted cursor-pointer">Blog</span>
          <span className="font-mono text-[10px] text-retro-muted cursor-pointer">Contact</span>
        </nav>
      </div>
    </header>
  );
}
