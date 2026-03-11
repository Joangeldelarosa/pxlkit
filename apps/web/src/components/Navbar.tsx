'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from './ThemeProvider';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/icons', label: 'Icons' },
  { href: '/builder', label: 'Builder' },
  { href: '/ui-kit', label: 'UI Kit' },
  { href: '/docs', label: 'Docs' },
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
          className="flex items-center gap-2 sm:gap-3 group"
          onClick={() => setMenuOpen(false)}
        >
          {/* Tiny pixel art logo — matches favicon "P" */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 relative">
            <svg viewBox="0 0 32 32" className="w-full h-full" shapeRendering="crispEdges">
              <rect width="32" height="32" fill="var(--retro-bg)" rx="4" />
              <rect x="4" y="2" width="24" height="2" fill="var(--retro-green)" />
              <rect x="2" y="4" width="2" height="24" fill="var(--retro-green)" />
              <rect x="28" y="4" width="2" height="24" fill="var(--retro-cyan)" />
              <rect x="4" y="28" width="24" height="2" fill="var(--retro-cyan)" />
              <rect x="4" y="4" width="2" height="2" fill="var(--retro-green)" />
              <rect x="26" y="4" width="2" height="2" fill="var(--retro-cyan)" />
              <rect x="4" y="26" width="2" height="2" fill="var(--retro-cyan)" />
              <rect x="26" y="26" width="2" height="2" fill="var(--retro-cyan)" />
              <rect x="8" y="8" width="2" height="14" fill="var(--retro-gold)" />
              <rect x="10" y="8" width="8" height="2" fill="var(--retro-gold)" />
              <rect x="18" y="10" width="2" height="6" fill="var(--retro-gold)" />
              <rect x="10" y="14" width="8" height="2" fill="var(--retro-gold)" />
              <rect x="22" y="20" width="2" height="2" fill="var(--retro-red)" />
              <rect x="24" y="18" width="2" height="2" fill="var(--retro-red)" />
              <rect x="22" y="22" width="4" height="2" fill="var(--retro-red)" />
            </svg>
          </div>
          <span className="font-pixel text-[10px] sm:text-xs text-retro-green group-hover:text-glow transition-all">
            PXLKIT
          </span>
        </Link>

        {/* Desktop nav links + actions */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-mono transition-all rounded ${
                  isActive
                    ? 'text-retro-green bg-retro-green/10'
                    : 'text-retro-muted hover:text-retro-text hover:bg-retro-surface'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Theme toggle */}
          <button
            type="button"
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
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/joangeldelarosa/pxlkit"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 px-3 py-2 text-retro-muted hover:text-retro-text transition-colors"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current" shapeRendering="crispEdges">
              <rect x="3" y="0" width="10" height="1" />
              <rect x="2" y="1" width="1" height="1" />
              <rect x="13" y="1" width="1" height="1" />
              <rect x="1" y="2" width="1" height="1" />
              <rect x="14" y="2" width="1" height="1" />
              <rect x="0" y="3" width="1" height="7" />
              <rect x="15" y="3" width="1" height="7" />
              <rect x="1" y="10" width="1" height="1" />
              <rect x="14" y="10" width="1" height="1" />
              <rect x="2" y="11" width="2" height="1" />
              <rect x="12" y="11" width="2" height="1" />
              <rect x="4" y="12" width="3" height="1" />
              <rect x="9" y="12" width="3" height="1" />
              <rect x="5" y="13" width="6" height="1" />
              <rect x="4" y="4" width="2" height="2" />
              <rect x="10" y="4" width="2" height="2" />
              <rect x="6" y="8" width="4" height="1" />
            </svg>
          </a>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded border border-retro-border/50 text-retro-muted hover:text-retro-gold hover:border-retro-gold/40 transition-all"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-4 h-4" />
            ) : (
              <MoonIcon className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
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
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-retro-border/50 bg-retro-bg/95 backdrop-blur-md animate-in slide-in-from-top duration-200">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-mono rounded transition-all ${
                    isActive
                      ? 'text-retro-green bg-retro-green/10'
                      : 'text-retro-muted hover:text-retro-text hover:bg-retro-surface'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 mt-2 border-t border-retro-border/30">
              <a
                href="https://github.com/joangeldelarosa/pxlkit"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-mono text-retro-muted hover:text-retro-text rounded transition-all"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current" shapeRendering="crispEdges">
                  <rect x="3" y="0" width="10" height="1" />
                  <rect x="2" y="1" width="1" height="1" />
                  <rect x="13" y="1" width="1" height="1" />
                  <rect x="1" y="2" width="1" height="1" />
                  <rect x="14" y="2" width="1" height="1" />
                  <rect x="0" y="3" width="1" height="7" />
                  <rect x="15" y="3" width="1" height="7" />
                  <rect x="1" y="10" width="1" height="1" />
                  <rect x="14" y="10" width="1" height="1" />
                  <rect x="2" y="11" width="2" height="1" />
                  <rect x="12" y="11" width="2" height="1" />
                  <rect x="4" y="12" width="3" height="1" />
                  <rect x="9" y="12" width="3" height="1" />
                  <rect x="5" y="13" width="6" height="1" />
                  <rect x="4" y="4" width="2" height="2" />
                  <rect x="10" y="4" width="2" height="2" />
                  <rect x="6" y="8" width="4" height="1" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
