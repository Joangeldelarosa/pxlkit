'use client';

import Link from 'next/link';
import { PxlKitIcon } from '@pxlkit/core';
import { Heart } from '@pxlkit/social';
import { BrandMark } from './Logo';
import { UI_KIT_VERSION_LABEL } from '@/lib/pxlkit-version';

export function Footer() {
  return (
    <footer className="border-t border-retro-border/50 bg-retro-surface/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 inline-block">
              <BrandMark size={26} />
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
                <Link href="/ui-kit" className="inline-block py-1 -my-1 text-retro-muted hover:text-retro-green transition-colors">
                  UI Kit
                </Link>
              </li>
              <li>
                <Link href="/icons" className="inline-block py-1 -my-1 text-retro-muted hover:text-retro-green transition-colors">
                  Browse Icons
                </Link>
              </li>
              <li>
                <Link href="/builder" className="inline-block py-1 -my-1 text-retro-muted hover:text-retro-green transition-colors">
                  Icon Builder
                </Link>
              </li>
              <li>
                <Link href="/templates" className="inline-block py-1 -my-1 text-retro-muted hover:text-retro-green transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/explore" className="inline-block py-1 -my-1 text-retro-muted hover:text-retro-green transition-colors">
                  Explore <span className="text-[10px] opacity-70">🚧</span>
                </Link>
              </li>
              <li>
                <Link href="/docs" className="inline-block py-1 -my-1 text-retro-muted hover:text-retro-green transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <a
                  href="https://storybook.pxlkit.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-retro-muted hover:text-retro-green transition-colors inline-flex items-center gap-1 py-1 -my-1"
                >
                  Storybook <span className="text-[10px] opacity-70">↗</span>
                </a>
              </li>
              <li>
                <Link href="/pricing" className="inline-block py-1 -my-1 text-retro-muted hover:text-retro-green transition-colors">
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
                  className="inline-block py-1 -my-1 text-retro-muted hover:text-retro-green transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/joangeldelarosa/pxlkit/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 -my-1 text-retro-muted hover:text-retro-green transition-colors"
                >
                  Report Issues
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/joangeldelarosa/pxlkit/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 -my-1 text-retro-muted hover:text-retro-green transition-colors"
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
              {UI_KIT_VERSION_LABEL} — Built with <PxlKitIcon icon={Heart} size={12} colorful className="inline-block mx-1" /> and pixels
            </p>
            <p className="text-retro-muted/40 text-[10px] font-mono">
              Created by{' '}
              <a
                href="https://github.com/joangeldelarosa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-1.5 -my-1.5 text-retro-green/60 hover:text-retro-green transition-colors"
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
