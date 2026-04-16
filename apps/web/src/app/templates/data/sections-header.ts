import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui';

const simpleNavbar = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { useState } from 'react';
import Link from 'next/link';
import { PxlKitIcon } from '@pxlkit/core';
import { Menu, Close, ArrowRight } from '@pxlkit/ui';
import { PixelButton, PixelBadge } from '@pxlkit/ui-kit';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/docs', label: 'Docs' },
  { href: '/pricing', label: 'Pricing' },
];

export function SimpleNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-retro-border/50 bg-retro-bg/90 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-pixel text-xs text-retro-green hover:text-glow transition-all">
          MYAPP
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-mono text-retro-muted hover:text-retro-text hover:bg-retro-surface rounded transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          <PixelButton tone="green" size="sm">
            Get Started
            <PxlKitIcon icon={ArrowRight} size={12} className="ml-1.5" />
          </PixelButton>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-retro-muted hover:text-retro-text border border-retro-border/50 rounded transition-all"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <PxlKitIcon icon={open ? Close : Menu} size={18} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-retro-border/50 bg-retro-bg/95 px-4 py-3 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-mono text-retro-muted hover:text-retro-text hover:bg-retro-surface rounded transition-all"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2">
            <PixelButton tone="green" size="sm" className="w-full justify-center">
              Get Started
            </PixelButton>
          </div>
        </div>
      )}
    </header>
  );
}
`;

const navbarWithDropdown = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { useState } from 'react';
import Link from 'next/link';
import { PxlKitIcon } from '@pxlkit/core';
import { Menu, Close, Bell, ArrowRight, ChainLink } from '@pxlkit/ui';
import { PixelButton, PixelBadge, PixelDropdown } from '@pxlkit/ui-kit';

export function NavbarWithDropdown() {
  const [open, setOpen] = useState(false);

  const productItems = [
    { label: 'Icons', href: '/icons', description: '226+ pixel art icons' },
    { label: 'UI Kit', href: '/ui-kit', description: 'Retro React components' },
    { label: 'Builder', href: '/builder', description: 'Visual icon editor' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-retro-border/50 bg-retro-bg/90 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-pixel text-xs text-retro-green">MYAPP</Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {/* Product dropdown */}
          <PixelDropdown
            trigger={
              <button className="px-4 py-2 text-sm font-mono text-retro-muted hover:text-retro-text hover:bg-retro-surface rounded transition-all">
                Product ▾
              </button>
            }
            items={productItems.map((i) => ({
              label: i.label,
              description: i.description,
              href: i.href,
            }))}
          />
          <Link href="/docs" className="px-4 py-2 text-sm font-mono text-retro-muted hover:text-retro-text hover:bg-retro-surface rounded transition-all">
            Docs
          </Link>
          <Link href="/pricing" className="px-4 py-2 text-sm font-mono text-retro-muted hover:text-retro-text hover:bg-retro-surface rounded transition-all">
            Pricing
          </Link>
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <button className="relative p-2 text-retro-muted hover:text-retro-text border border-retro-border/50 rounded transition-all">
            <PxlKitIcon icon={Bell} size={16} />
            <PixelBadge tone="red" className="absolute -top-1 -right-1 text-[8px] px-1">3</PixelBadge>
          </button>
          <PixelButton tone="green" size="sm">
            Sign Up
            <PxlKitIcon icon={ArrowRight} size={12} className="ml-1.5" />
          </PixelButton>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-retro-muted border border-retro-border/50 rounded transition-all"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <PxlKitIcon icon={open ? Close : Menu} size={18} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-retro-border/50 bg-retro-bg/95 px-4 py-3 space-y-1">
          {productItems.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-mono text-retro-muted hover:text-retro-text hover:bg-retro-surface rounded transition-all"
            >
              <PxlKitIcon icon={ChainLink} size={14} />
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
`;

const centeredLogoHeader = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import Link from 'next/link';
import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Search } from '@pxlkit/ui';
import { PixelButton, PixelDivider } from '@pxlkit/ui-kit';

const LEFT_NAV = [
  { href: '/features', label: 'Features' },
  { href: '/docs', label: 'Docs' },
];
const RIGHT_NAV = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
];

export function CenteredLogoHeader() {
  return (
    <header className="border-b border-retro-border/50 bg-retro-bg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left nav */}
        <div className="flex items-center gap-1">
          {LEFT_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-mono text-retro-muted hover:text-retro-text hover:bg-retro-surface rounded transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Center logo */}
        <Link href="/" className="font-pixel text-sm text-retro-green hover:text-glow transition-all">
          MYAPP
        </Link>

        {/* Right nav */}
        <div className="flex items-center gap-1">
          {RIGHT_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-mono text-retro-muted hover:text-retro-text hover:bg-retro-surface rounded transition-all"
            >
              {item.label}
            </Link>
          ))}
          <button className="ml-1 p-2 text-retro-muted hover:text-retro-text border border-retro-border/50 rounded transition-all" aria-label="Search">
            <PxlKitIcon icon={Search} size={16} />
          </button>
          <PixelButton tone="green" size="sm" className="ml-1">
            Sign Up
            <PxlKitIcon icon={ArrowRight} size={12} className="ml-1.5" />
          </PixelButton>
        </div>
      </nav>
      <PixelDivider tone="neutral" />
    </header>
  );
}
`;

export const headerSection: TemplateSection = {
  id: 'header',
  name: 'Headers & Navbars',
  description: 'Sticky navigation headers with links, CTAs, dropdowns, and mobile menus.',
  icon: '🧭',
  variants: [
    {
      id: 'header-simple',
      name: 'Simple Navbar',
      description: 'Clean sticky navbar with links, CTA button, and responsive mobile menu.',
      installCmd: INSTALL,
      code: simpleNavbar,
    },
    {
      id: 'header-dropdown',
      name: 'Navbar with Dropdown',
      description: 'Navbar with PixelDropdown product menu and notification badge.',
      installCmd: INSTALL,
      code: navbarWithDropdown,
    },
    {
      id: 'header-centered',
      name: 'Centered Logo',
      description: 'Centered brand logo with nav links on both sides and a divider.',
      installCmd: INSTALL,
      code: centeredLogoHeader,
    },
  ],
};
