'use client';

import Link from 'next/link';
import { MouseProvider } from './mouseContext';
import { HeroBackground } from './HeroBackground';
import { IconField } from './IconField';
import { VoxelText } from './VoxelText';

/**
 * Cinematic homepage hero — replaces the previous text-block hero.
 * Wave 1 skeleton: background + minimal text + 2 CTAs. Subsequent waves
 * will mount the IconField, VoxelText and DustParticles layers.
 */
export function HeroCinematic() {
  return (
    <MouseProvider>
      <section
        data-testid="hero-cinematic"
        className="relative overflow-hidden"
        style={{ minHeight: '90vh' }}
      >
        <HeroBackground />
        <IconField />

        {/* Content layer */}
        <div
          className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 py-16 md:py-24 gap-8"
          style={{ minHeight: '90vh' }}
        >
          <VoxelText>PXLKIT</VoxelText>

          <p className="font-mono text-sm sm:text-base text-retro-muted max-w-xl text-center">
            Retro pixel-art React UI kit · 226+ icons · 54 components · MIT code,
            source-available art.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/templates"
              className="font-pixel text-xs sm:text-sm bg-retro-green text-retro-bg px-5 py-3 border-2 border-retro-green hover:bg-retro-green/90 transition-colors"
            >
              Browse templates
            </Link>
            <Link
              href="/icons"
              className="font-pixel text-xs sm:text-sm bg-transparent text-retro-green px-5 py-3 border-2 border-retro-green hover:bg-retro-green/10 transition-colors"
            >
              Explore icons
            </Link>
          </div>
        </div>
      </section>
    </MouseProvider>
  );
}
