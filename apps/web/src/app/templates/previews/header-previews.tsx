'use client';

import { useState, useRef, useEffect } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Grid, Package, Search, Settings, Home } from '@pxlkit/ui';
import { Trophy, Shield, Lightning, Crown, Gem, Star } from '@pxlkit/gamification';
import { Globe, User } from '@pxlkit/social';
import { ShieldCheck, Bell } from '@pxlkit/feedback';
import { PixelButton, PixelBadge } from '@pxlkit/ui-kit';

/* ── Header Simple ──────────────────────────────────────────────────────── */
export function HeaderSimplePreview() {
  return (
    <div className="bg-retro-bg">
      <header className="flex items-center justify-between px-6 h-16 border-b border-retro-border">
        <div className="flex items-center gap-2.5">
          <PxlKitIcon icon={Lightning} size={22} colorful />
          <span className="font-pixel text-sm text-retro-text">VoltApp</span>
        </div>

        <nav className="hidden sm:flex items-center gap-6">
          {[
            { label: 'Home', icon: Home },
            { label: 'Features', icon: Star },
            { label: 'Pricing', icon: Gem },
            { label: 'Docs', icon: Package },
          ].map((item) => (
            <span
              key={item.label}
              className="group flex items-center gap-1.5 font-mono text-sm text-retro-muted hover:text-retro-green cursor-pointer transition-colors"
            >
              <PxlKitIcon icon={item.icon} size={14} colorful />
              <span className="relative">
                {item.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-retro-green transition-all group-hover:w-full" />
              </span>
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded text-retro-muted hover:text-retro-green hover:bg-retro-surface/40 transition-colors"
            aria-label="Search"
          >
            <PxlKitIcon icon={Search} size={16} colorful />
          </button>
          <PixelButton tone="green" size="sm">Sign Up</PixelButton>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center px-6 py-24 gap-5 text-center">
        <div className="flex items-center gap-2">
          <PxlKitIcon icon={Lightning} size={16} colorful />
          <p className="font-pixel text-xs text-retro-muted/60 tracking-widest uppercase">
            Simple Header
          </p>
          <PxlKitIcon icon={Lightning} size={16} colorful />
        </div>
        <p className="font-mono text-sm text-retro-muted max-w-md">
          Logo left with brand icon, nav center with icon accents and hover
          underlines, search button and CTA right. Clean and polished.
        </p>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 font-mono text-xs text-retro-muted/50">
            <PxlKitIcon icon={Home} size={12} colorful />
            Icon nav items
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-retro-muted/50">
            <PxlKitIcon icon={Search} size={12} colorful />
            Search action
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-retro-muted/50">
            <PxlKitIcon icon={Star} size={12} colorful />
            Hover underline
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Header Dropdown ────────────────────────────────────────────────────── */
const PRODUCTS_MENU = [
  { label: 'Icon Library', icon: Grid, desc: 'Pixel-perfect icon sets' },
  { label: 'UI Components', icon: Package, desc: 'Ready-to-use building blocks' },
  { label: 'Gamification', icon: Trophy, desc: 'Engagement and rewards' },
  { label: 'Security Suite', icon: ShieldCheck, desc: 'Auth and protection tools' },
];

const RESOURCES_MENU = [
  { label: 'Documentation', icon: Globe, desc: 'Guides and API reference' },
  { label: 'Changelog', icon: Star, desc: 'Latest updates and releases' },
  { label: 'Community', icon: User, desc: 'Join the developer community' },
  { label: 'Status', icon: Shield, desc: 'System health and uptime' },
];

export function HeaderDropdownPreview() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Products', hasDropdown: true, items: PRODUCTS_MENU },
    { label: 'Solutions', hasDropdown: false },
    { label: 'Resources', hasDropdown: true, items: RESOURCES_MENU },
    { label: 'Pricing', hasDropdown: false },
  ];

  return (
    <div className="bg-retro-bg">
      <header
        ref={headerRef}
        className="relative flex items-center justify-between px-6 h-16 border-b border-retro-border"
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <PxlKitIcon icon={Crown} size={22} colorful />
            <span className="font-pixel text-sm text-retro-text">DevKit</span>
            <PixelBadge tone="cyan">v2</PixelBadge>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                <button
                  onClick={() => {
                    if (item.hasDropdown) {
                      setOpenMenu(openMenu === item.label ? null : item.label);
                    }
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 font-mono text-sm cursor-pointer rounded transition-colors ${
                    openMenu === item.label
                      ? 'text-retro-cyan bg-retro-cyan/10'
                      : 'text-retro-muted hover:text-retro-text hover:bg-retro-surface/40'
                  }`}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <span
                      className={`inline-block text-[10px] transition-transform ${
                        openMenu === item.label ? 'rotate-180' : ''
                      }`}
                    >
                      <PxlKitIcon
                        icon={Grid}
                        size={8}
                        className={
                          openMenu === item.label
                            ? 'text-retro-cyan'
                            : 'text-retro-muted'
                        }
                      />
                    </span>
                  )}
                </button>

                {item.hasDropdown && openMenu === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-retro-bg border border-retro-border rounded-lg shadow-lg shadow-black/20 p-2 z-50">
                    {item.items?.map((menuItem) => (
                      <button
                        key={menuItem.label}
                        onClick={() => setOpenMenu(null)}
                        className="flex items-start gap-3 w-full px-3 py-2.5 rounded-md text-left hover:bg-retro-surface/60 transition-colors group"
                      >
                        <span className="mt-0.5">
                          <PxlKitIcon
                            icon={menuItem.icon}
                            size={18}
                            colorful
                          />
                        </span>
                        <span>
                          <span className="block font-mono text-sm text-retro-text group-hover:text-retro-cyan transition-colors">
                            {menuItem.label}
                          </span>
                          <span className="block font-mono text-xs text-retro-muted/70 mt-0.5">
                            {menuItem.desc}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded text-retro-muted hover:text-retro-cyan hover:bg-retro-surface/40 transition-colors"
            aria-label="Notifications"
          >
            <PxlKitIcon icon={Bell} size={16} colorful />
          </button>
          <PixelButton tone="neutral" size="sm" variant="ghost">
            Login
          </PixelButton>
          <PixelButton tone="cyan" size="sm">Get Started</PixelButton>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center px-6 py-24 gap-5 text-center">
        <div className="flex items-center gap-2">
          <PxlKitIcon icon={Crown} size={16} colorful />
          <p className="font-pixel text-xs text-retro-muted/60 tracking-widest uppercase">
            Dropdown Header
          </p>
          <PxlKitIcon icon={Crown} size={16} colorful />
        </div>
        <p className="font-mono text-sm text-retro-muted max-w-md">
          Logo with version badge, interactive dropdown nav with icon-rich
          menus, notification bell, and dual CTAs. Click &ldquo;Products&rdquo;
          or &ldquo;Resources&rdquo; to open dropdown panels.
        </p>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 font-mono text-xs text-retro-muted/50">
            <PxlKitIcon icon={Trophy} size={12} colorful />
            Interactive menus
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-retro-muted/50">
            <PxlKitIcon icon={Bell} size={12} colorful />
            Notifications
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-retro-muted/50">
            <PxlKitIcon icon={ShieldCheck} size={12} colorful />
            Click outside to close
          </span>
        </div>
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
            {[
              { label: 'About', icon: Globe },
              { label: 'Shop', icon: Gem },
            ].map((item) => (
              <span
                key={item.label}
                className="group flex items-center gap-1.5 font-mono text-sm text-retro-muted hover:text-retro-gold cursor-pointer transition-colors"
              >
                <PxlKitIcon icon={item.icon} size={14} colorful />
                {item.label}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 mx-auto">
            <PxlKitIcon icon={Crown} size={24} colorful />
            <span className="font-pixel text-base text-retro-text tracking-wide">
              PIXEL
            </span>
            <PixelBadge tone="gold">PRO</PixelBadge>
          </div>

          <nav className="hidden sm:flex items-center gap-6 flex-1 justify-end">
            {[
              { label: 'Blog', icon: Star },
              { label: 'Contact', icon: User },
            ].map((item) => (
              <span
                key={item.label}
                className="group flex items-center gap-1.5 font-mono text-sm text-retro-muted hover:text-retro-gold cursor-pointer transition-colors"
              >
                <PxlKitIcon icon={item.icon} size={14} colorful />
                {item.label}
              </span>
            ))}
            <button
              className="p-2 rounded text-retro-muted hover:text-retro-gold hover:bg-retro-surface/40 transition-colors"
              aria-label="Settings"
            >
              <PxlKitIcon icon={Settings} size={16} colorful />
            </button>
          </nav>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center px-6 py-24 gap-5 text-center">
        <div className="flex items-center gap-2">
          <PxlKitIcon icon={Gem} size={16} colorful />
          <p className="font-pixel text-xs text-retro-muted/60 tracking-widest uppercase">
            Centered Logo Header
          </p>
          <PxlKitIcon icon={Gem} size={16} colorful />
        </div>
        <p className="font-mono text-sm text-retro-muted max-w-md">
          Symmetric layout with centered crown brand logo, balanced icon
          navigation on each side, settings action, and a pro badge accent.
        </p>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 font-mono text-xs text-retro-muted/50">
            <PxlKitIcon icon={Crown} size={12} colorful />
            Centered brand
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-retro-muted/50">
            <PxlKitIcon icon={Globe} size={12} colorful />
            Icon nav links
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-retro-muted/50">
            <PxlKitIcon icon={Settings} size={12} colorful />
            Settings action
          </span>
        </div>
      </div>
    </div>
  );
}

