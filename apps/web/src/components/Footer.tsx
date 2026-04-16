'use client';

import Link from 'next/link';
import { PxlKitIcon } from '@pxlkit/core';
import { Heart } from '@pxlkit/social';

export function Footer() {
  return (
    <footer className="border-t border-retro-border/50 bg-retro-surface/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6">
                <svg viewBox="0 0 32 32" className="w-full h-full" shapeRendering="crispEdges">
                  <rect width="32" height="32" fill="rgb(var(--retro-bg))" rx="4" />
                  <rect x="4" y="2" width="24" height="2" fill="rgb(var(--retro-green))" />
                  <rect x="2" y="4" width="2" height="24" fill="rgb(var(--retro-green))" />
                  <rect x="28" y="4" width="2" height="24" fill="rgb(var(--retro-cyan))" />
                  <rect x="4" y="28" width="24" height="2" fill="rgb(var(--retro-cyan))" />
                  <rect x="4" y="4" width="2" height="2" fill="rgb(var(--retro-green))" />
                  <rect x="26" y="4" width="2" height="2" fill="rgb(var(--retro-cyan))" />
                  <rect x="4" y="26" width="2" height="2" fill="rgb(var(--retro-cyan))" />
                  <rect x="26" y="26" width="2" height="2" fill="rgb(var(--retro-cyan))" />
                  <rect x="8" y="8" width="2" height="14" fill="rgb(var(--retro-gold))" />
                  <rect x="10" y="8" width="8" height="2" fill="rgb(var(--retro-gold))" />
                  <rect x="18" y="10" width="2" height="6" fill="rgb(var(--retro-gold))" />
                  <rect x="10" y="14" width="8" height="2" fill="rgb(var(--retro-gold))" />
                  <rect x="22" y="20" width="2" height="2" fill="rgb(var(--retro-red))" />
                  <rect x="24" y="18" width="2" height="2" fill="rgb(var(--retro-red))" />
                  <rect x="22" y="22" width="4" height="2" fill="rgb(var(--retro-red))" />
                </svg>
              </div>
              <span className="font-pixel text-[10px] text-retro-green">
                PXLKIT
              </span>
            </Link>
            <p className="text-retro-muted text-sm font-mono max-w-sm">
              The retro React toolkit with MIT code packages and licensed icon assets.
              Ship pixel-perfect interfaces with components, icons, and 3D effects — all from code.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-pixel text-[10px] text-retro-text mb-4">
              RESOURCES
            </h3>
            <ul className="space-y-2 font-mono text-sm">
              <li>
                <Link href="/ui-kit" className="text-retro-muted hover:text-retro-green transition-colors">
                  UI Kit
                </Link>
              </li>
              <li>
                <Link href="/icons" className="text-retro-muted hover:text-retro-green transition-colors">
                  Browse Icons
                </Link>
              </li>
              <li>
                <Link href="/builder" className="text-retro-muted hover:text-retro-green transition-colors">
                  Icon Builder
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-retro-muted hover:text-retro-green transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-retro-muted hover:text-retro-green transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-retro-muted hover:text-retro-green transition-colors">
                  Licensing &amp; Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-pixel text-[10px] text-retro-text mb-4">
              COMMUNITY
            </h3>
            <ul className="space-y-2 font-mono text-sm">
              <li>
                <a
                  href="https://github.com/joangeldelarosa/pxlkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-retro-muted hover:text-retro-green transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/joangeldelarosa/pxlkit/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-retro-muted hover:text-retro-green transition-colors"
                >
                  Report Issues
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/joangeldelarosa/pxlkit/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-retro-muted hover:text-retro-green transition-colors"
                >
                  Contribute
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-retro-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-retro-muted text-xs font-mono">
            Split licensing • MIT code + asset terms © {new Date().getFullYear()} Pxlkit Contributors
          </p>
          <div className="flex flex-col items-center sm:items-end gap-1">
            <p className="text-retro-muted/50 text-xs font-mono">
              v1.0.2 — Built with <PxlKitIcon icon={Heart} size={12} colorful className="inline-block mx-1" /> and pixels
            </p>
            <p className="text-retro-muted/40 text-[10px] font-mono">
              Created by{' '}
              <a
                href="https://github.com/joangeldelarosa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-retro-green/60 hover:text-retro-green transition-colors"
              >
                Joangel De La Rosa
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
