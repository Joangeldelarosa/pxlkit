'use client';

import { MouseProvider } from '../../components/hero/mouseContext';
import { HeroBackground } from '../../components/hero/HeroBackground';
import { IconField } from '../../components/hero/IconField';
import { BrandIcon } from '../../components/Logo';

/**
 * Curated full-bleed frame used by the OG / Twitter / README screenshot
 * pipeline. Static (icons frozen at base positions) so captures are
 * deterministic and legible at 1280×640 / 1200×630 / 1920×1080.
 *
 * Composition: floating-icon field (frozen, sparse, low contrast) in the
 * back; centered brand mark with big "P" icon + giant PXLKIT voxel text
 * + gold tagline in the foreground; "pxlkit.xyz" wordmark bottom-right.
 */
export function OgFrame() {
  return (
    <MouseProvider>
      <main
        data-testid="og-frame"
        className="relative w-screen h-screen overflow-hidden bg-retro-bg"
      >
        <HeroBackground />
        {/* Sparser, frozen icon field for legibility — density 30 vs hero 48. */}
        <IconField density={30} freeze />

        {/* Centered brand composition */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-12 gap-7">
          {/* Big brand mark (icon + voxel wordmark) — sized for OG */}
          <div className="flex items-center gap-6 sm:gap-8 text-retro-green">
            <BrandIcon size={120} />
            <span
              className="font-pixel text-7xl sm:text-8xl lg:text-9xl tracking-wider leading-none select-none"
              style={{
                textShadow: [
                  '2px 2px 0 var(--color-retro-green-dark, #2a8f5f)',
                  '4px 4px 0 var(--color-retro-green-dark, #2a8f5f)',
                  '6px 6px 0 var(--color-retro-green-dark, #2a8f5f)',
                  '8px 8px 0 var(--color-retro-green-dark, #2a8f5f)',
                  '10px 10px 0 #0a0a0f',
                  '12px 12px 0 #0a0a0f',
                  '14px 14px 24px rgba(0, 200, 120, 0.55)',
                ].join(', '),
              }}
            >
              PXLKIT
            </span>
          </div>

          {/* Gold tagline */}
          <p className="font-pixel text-lg sm:text-xl lg:text-2xl text-retro-gold text-center max-w-3xl">
            Ship Pixel-Perfect Retro Interfaces in Minutes, Not Days.
          </p>

          {/* Mono summary */}
          <p className="font-mono text-sm sm:text-base text-retro-muted text-center max-w-2xl">
            Retro pixel-art React UI kit · 226+ icons · 54 components · 7 themed
            packs · MIT code, source-available art.
          </p>
        </div>

        {/* Bottom-right wordmark */}
        <div className="absolute bottom-6 right-8 z-10 font-mono text-xs text-retro-muted/70 tracking-wider">
          pxlkit.xyz
        </div>
      </main>
    </MouseProvider>
  );
}
