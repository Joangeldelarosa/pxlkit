'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { PixelBareButton } from '@pxlkit/ui-kit';
import { useTheme } from './ThemeProvider';
import { BrandMark } from './Logo';

const NAV_ITEMS: { href: string; label: string; badge?: string; external?: boolean }[] = [
  { href: '/', label: 'Home' },
  { href: '/icons', label: 'Icons' },
  { href: '/builder', label: 'Builder' },
  { href: '/ui-kit', label: 'UI Kit' },
  { href: '/templates', label: 'Templates' },
  { href: '/explore', label: 'Explore', badge: '🚧' },
  { href: '/docs', label: 'Docs' },
  // Storybook lives on a separate Vercel deploy — see STORYBOOK_DEPLOY.md.
  // Falls back to a placeholder until the subdomain is wired up; the badge
  // signals the entry is external.
  { href: 'https://storybook.pxlkit.xyz', label: 'Storybook', badge: '↗', external: true },
  { href: '/pricing', label: 'Pricing' },
];

/**
 * Pixel-art sun icon (8×8)
 */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={className} shapeRendering="crispEdges" fill="currentColor">
      <rect x="3" y="0" width="2" height="1" />
      <rect x="1" y="1" width="1" height="1" />
      <rect x="6" y="1" width="1" height="1" />
      <rect x="2" y="2" width="4" height="4" />
      <rect x="0" y="3" width="1" height="2" />
      <rect x="7" y="3" width="1" height="2" />
      <rect x="1" y="6" width="1" height="1" />
      <rect x="6" y="6" width="1" height="1" />
      <rect x="3" y="7" width="2" height="1" />
    </svg>
  );
}

/**
 * Pixel-art moon icon (8×8)
 */
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={className} shapeRendering="crispEdges" fill="currentColor">
      <rect x="3" y="0" width="3" height="1" />
      <rect x="2" y="1" width="1" height="1" />
      <rect x="1" y="2" width="1" height="2" />
      <rect x="2" y="4" width="1" height="1" />
      <rect x="5" y="1" width="1" height="1" />
      <rect x="6" y="2" width="1" height="1" />
      <rect x="5" y="3" width="1" height="1" />
      <rect x="3" y="4" width="2" height="1" />
      <rect x="2" y="5" width="1" height="1" />
      <rect x="1" y="5" width="1" height="1" />
      <rect x="1" y="6" width="3" height="1" />
      <rect x="3" y="7" width="3" height="1" />
    </svg>
  );
}

/**
 * Pixel-art star icon (8×8)
 */
function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={className} shapeRendering="crispEdges" fill="currentColor">
      <rect x="3" y="0" width="2" height="1" />
      <rect x="3" y="1" width="2" height="1" />
      <rect x="0" y="2" width="8" height="1" />
      <rect x="1" y="3" width="6" height="1" />
      <rect x="2" y="4" width="4" height="1" />
      <rect x="2" y="5" width="1" height="1" />
      <rect x="5" y="5" width="1" height="1" />
      <rect x="1" y="6" width="1" height="1" />
      <rect x="6" y="6" width="1" height="1" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-retro-border/50 bg-retro-bg/80 backdrop-blur-md theme-transition">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center group"
          onClick={() => setMenuOpen(false)}
          aria-label="Pxlkit home"
        >
          <BrandMark size={26} className="group-hover:opacity-95 transition-opacity" />
        </Link>

        {/* Desktop nav links + actions */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const className = `px-4 py-2 text-sm font-mono transition-all rounded relative ${
              isActive
                ? 'text-retro-green bg-retro-green/10'
                : 'text-retro-muted hover:text-retro-text hover:bg-retro-surface'
            }`;
            const content = (
              <>
                {item.label}
                {item.badge && (
                  <span className="ml-1 text-[10px]" title={item.external ? 'Opens in new tab' : 'Coming Soon'}>
                    {item.badge}
                  </span>
                )}
              </>
            );
            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className={className}>
                {content}
              </Link>
            );
          })}

          {/* Theme toggle */}
          <PixelBareButton
            onClick={toggleTheme}
            className="ml-2 p-2 rounded border border-retro-border/50 text-retro-muted hover:text-retro-gold hover:border-retro-gold/40 hover:bg-retro-gold/10 transition-all"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-4 h-4" />
            ) : (
              <MoonIcon className="w-4 h-4" />
            )}
          </PixelBareButton>

          {/* Star on GitHub */}
          <a
            href="https://github.com/joangeldelarosa/pxlkit"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded border border-retro-gold/30 text-retro-gold/80 hover:text-retro-gold hover:border-retro-gold/60 hover:bg-retro-gold/10 transition-all"
            aria-label="Star on GitHub"
            title="Star on GitHub"
          >
            <StarIcon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Star on GitHub</span>
            <span className="lg:hidden">Star</span>
          </a>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex lg:hidden items-center gap-1">
          <PixelBareButton
            onClick={toggleTheme}
            className="p-2 rounded border border-retro-border/50 text-retro-muted hover:text-retro-gold hover:border-retro-gold/40 transition-all"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-4 h-4" />
            ) : (
              <MoonIcon className="w-4 h-4" />
            )}
          </PixelBareButton>
          <PixelBareButton
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded border border-retro-border/50 text-retro-muted hover:text-retro-green hover:border-retro-green/40 transition-all"
            aria-label="Toggle menu"
          >
            {/* Pixel hamburger icon */}
            <svg viewBox="0 0 8 8" className="w-5 h-5" shapeRendering="crispEdges" fill="currentColor">
              {menuOpen ? (
                <>
                  <rect x="1" y="1" width="1" height="1" />
                  <rect x="6" y="1" width="1" height="1" />
                  <rect x="2" y="2" width="1" height="1" />
                  <rect x="5" y="2" width="1" height="1" />
                  <rect x="3" y="3" width="2" height="2" />
                  <rect x="2" y="5" width="1" height="1" />
                  <rect x="5" y="5" width="1" height="1" />
                  <rect x="1" y="6" width="1" height="1" />
                  <rect x="6" y="6" width="1" height="1" />
                </>
              ) : (
                <>
                  <rect x="1" y="1" width="6" height="1" />
                  <rect x="1" y="3" width="6" height="1" />
                  <rect x="1" y="5" width="6" height="1" />
                </>
              )}
            </svg>
          </PixelBareButton>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="lg:hidden border-t border-retro-border/50 bg-retro-bg/95 backdrop-blur-md animate-in slide-in-from-top duration-200">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const className = `block px-4 py-2.5 text-sm font-mono rounded transition-all ${
                isActive
                  ? 'text-retro-green bg-retro-green/10'
                  : 'text-retro-muted hover:text-retro-text hover:bg-retro-surface'
              }`;
              const content = (
                <>
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 text-[10px]" title={item.external ? 'Opens in new tab' : 'Coming Soon'}>
                      {item.badge}
                    </span>
                  )}
                </>
              );
              return item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className={className}
                >
                  {content}
                </a>
              ) : (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={className}>
                  {content}
                </Link>
              );
            })}
            <div className="pt-2 mt-2 border-t border-retro-border/30">
              <a
                href="https://github.com/joangeldelarosa/pxlkit"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-mono text-retro-gold/80 hover:text-retro-gold rounded transition-all"
              >
                <StarIcon className="w-4 h-4" />
                Star on GitHub
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
