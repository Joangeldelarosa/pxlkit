'use client';

import { useState, useRef, useEffect } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Grid, Package, Search, Settings, Home } from '@pxlkit/ui';
import { Trophy, Shield, Lightning, Crown, Gem, Star } from '@pxlkit/gamification';
import { Globe, User } from '@pxlkit/social';
import { ShieldCheck, Bell } from '@pxlkit/feedback';
import { Sun, Moon } from '@pxlkit/weather';
import { PixelButton, PixelBadge, PixelTooltip } from '@pxlkit/ui-kit';

/* ── Shared theme toggle props ──────────────────────────────────────────── */
export interface ThemeToggleProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

function ThemeToggleButton({ isDark, onToggleTheme }: ThemeToggleProps) {
  if (!onToggleTheme) return null;
  return (
    <PixelTooltip content={isDark ? 'Switch to light' : 'Switch to dark'} position="bottom">
      <button
        onClick={onToggleTheme}
        className="p-2 rounded text-retro-muted hover:text-retro-gold hover:bg-retro-surface/40 transition-colors"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <PxlKitIcon icon={isDark ? Sun : Moon} size={16} colorful />
      </button>
    </PixelTooltip>
  );
}

/* ── Header Simple ──────────────────────────────────────────────────────── */
export function HeaderSimplePreview({ isDark, onToggleTheme }: ThemeToggleProps) {
  const [activeNav, setActiveNav] = useState('Home');

  const navItems = [
    { label: 'Home', icon: Home },
    { label: 'Features', icon: Star },
    { label: 'Pricing', icon: Gem },
    { label: 'Docs', icon: Package },
  ];

  return (
    <div className="bg-retro-bg">
      <header className="flex items-center justify-between px-6 h-16 border-b border-retro-border">
        <div className="flex items-center gap-2.5">
          <PxlKitIcon icon={Lightning} size={22} colorful />
          <span className="font-pixel text-sm text-retro-text">VoltApp</span>
        </div>

        <nav className="hidden sm:flex items-center gap-6">
          {navItems.map((item) => (
            <span
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`group flex items-center gap-1.5 font-mono text-sm cursor-pointer transition-colors ${
                activeNav === item.label
                  ? 'text-retro-green'
                  : 'text-retro-muted hover:text-retro-green'
              }`}
            >
              <PxlKitIcon icon={item.icon} size={14} colorful />
              <span className="relative">
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-retro-green transition-all ${
                    activeNav === item.label ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </span>
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggleButton isDark={isDark} onToggleTheme={onToggleTheme} />
          <PixelTooltip content="Search docs" position="bottom">
            <button
              className="p-2 rounded text-retro-muted hover:text-retro-green hover:bg-retro-surface/40 transition-colors"
              aria-label="Search"
            >
              <PxlKitIcon icon={Search} size={16} colorful />
            </button>
          </PixelTooltip>
          <PixelButton tone="green" size="sm">Sign Up</PixelButton>
        </div>
      </header>


    </div>
  );
}

/* ── Header Dropdown ────────────────────────────────────────────────────── */
const PRODUCTS_MENU = [
  { label: 'Icon Library', icon: Grid, desc: 'Pixel-perfect icon sets' },
  { label: 'UI Components', icon: Package, desc: 'Ready-to-use building blocks', isNew: true },
  { label: 'Gamification', icon: Trophy, desc: 'Engagement and rewards' },
  { label: 'Security Suite', icon: ShieldCheck, desc: 'Auth and protection tools' },
];

const RESOURCES_MENU = [
  { label: 'Documentation', icon: Globe, desc: 'Guides and API reference' },
  { label: 'Changelog', icon: Star, desc: 'Latest updates and releases' },
  { label: 'Community', icon: User, desc: 'Join the developer community' },
  { label: 'Status', icon: Shield, desc: 'System health and uptime' },
];

export function HeaderDropdownPreview({ isDark, onToggleTheme }: ThemeToggleProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenMenu(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
                      className={`inline-flex transition-transform ${
                        openMenu === item.label ? 'rotate-180' : ''
                      }`}
                    >
                      <svg viewBox="0 0 8 8" className="h-2.5 w-2.5 shrink-0" shapeRendering="crispEdges" fill="currentColor">
                        <rect x="1" y="2" width="1" height="1" />
                        <rect x="2" y="3" width="1" height="1" />
                        <rect x="3" y="4" width="2" height="1" />
                        <rect x="5" y="3" width="1" height="1" />
                        <rect x="6" y="2" width="1" height="1" />
                      </svg>
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
                          <span className="flex items-center gap-1.5 font-mono text-sm text-retro-text group-hover:text-retro-cyan transition-colors">
                            {menuItem.label}
                            {'isNew' in menuItem && (menuItem as { isNew?: boolean }).isNew && (
                              <PixelBadge tone="green">
                                <span className="text-[9px]">New</span>
                              </PixelBadge>
                            )}
                          </span>
                          <span className="block font-mono text-xs text-retro-muted/70 mt-0.5">
                            {menuItem.desc}
                          </span>
                        </span>
                      </button>
                    ))}
                    <div className="border-t border-retro-border/30 mt-1 pt-1 px-3 py-1.5">
                      <span className="font-mono text-[10px] text-retro-muted/40">
                        Press ESC to close
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggleButton isDark={isDark} onToggleTheme={onToggleTheme} />
          <button
            className="relative p-2 rounded text-retro-muted hover:text-retro-cyan hover:bg-retro-surface/40 transition-colors"
            aria-label="Notifications"
          >
            <PxlKitIcon icon={Bell} size={16} colorful />
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-retro-red text-white font-mono text-[9px] flex items-center justify-center px-1">
              3
            </span>
          </button>
          <PixelButton tone="neutral" size="sm" variant="ghost">
            Login
          </PixelButton>
          <PixelButton tone="cyan" size="sm">Get Started</PixelButton>
        </div>
      </header>


    </div>
  );
}

/* ── Header Centered Logo ───────────────────────────────────────────────── */
export function HeaderCenteredLogoPreview({ isDark, onToggleTheme }: ThemeToggleProps) {
  const [activeNav, setActiveNav] = useState('About');

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
                onClick={() => setActiveNav(item.label)}
                className={`group flex items-center gap-1.5 font-mono text-sm cursor-pointer transition-colors ${
                  activeNav === item.label
                    ? 'text-retro-gold'
                    : 'text-retro-muted hover:text-retro-gold'
                }`}
              >
                <PxlKitIcon icon={item.icon} size={14} colorful />
                <span className="relative">
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-retro-gold transition-all ${
                      activeNav === item.label ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </span>
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
                onClick={() => setActiveNav(item.label)}
                className={`group flex items-center gap-1.5 font-mono text-sm cursor-pointer transition-colors ${
                  activeNav === item.label
                    ? 'text-retro-gold'
                    : 'text-retro-muted hover:text-retro-gold'
                }`}
              >
                <PxlKitIcon icon={item.icon} size={14} colorful />
                <span className="relative">
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-retro-gold transition-all ${
                      activeNav === item.label ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </span>
              </span>
            ))}
            <ThemeToggleButton isDark={isDark} onToggleTheme={onToggleTheme} />
            <PixelTooltip content="App settings" position="bottom">
              <button
                className="p-2 rounded text-retro-muted hover:text-retro-gold hover:bg-retro-surface/40 transition-colors"
                aria-label="Settings"
              >
                <PxlKitIcon icon={Settings} size={16} colorful />
              </button>
            </PixelTooltip>
          </nav>
        </div>
      </header>


    </div>
  );
}

