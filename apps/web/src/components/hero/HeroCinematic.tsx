'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { PixelBadge, PixelButton } from '@pxlkit/ui-kit';
import { MouseProvider } from './mouseContext';
import { HeroBackground } from './HeroBackground';
import { IconField } from './IconField';
import { VoxelText } from './VoxelText';
import { useReducedMotion } from './useReducedMotion';

const DustParticles = dynamic(() => import('./DustParticles'), { ssr: false });

/**
 * Cinematic homepage hero — 3-layer floating icon field + R3F dust + voxel
 * headline. Content layer: status badges → voxel headline → gold sub-tagline
 * → compact stats line → 2 CTAs → npm install command.
 */
export function HeroCinematic() {
  const reduced = useReducedMotion();
  const router = useRouter();

  return (
    <MouseProvider>
      <section
        data-testid="hero-cinematic"
        className="relative overflow-hidden"
        style={{ minHeight: '90vh' }}
      >
        <HeroBackground />
        {!reduced && <DustParticles />}
        <IconField />

        {/* Content layer */}
        <div
          className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 py-14 md:py-20 gap-5 sm:gap-6"
          style={{ minHeight: '90vh' }}
        >
          {/* Status badges */}
          <div className="flex flex-wrap justify-center gap-2">
            <PixelBadge tone="purple">PIXEL-ART UI KIT v2.0.0</PixelBadge>
            <PixelBadge tone="green">MIT Code · Licensed Assets</PixelBadge>
            <PixelBadge tone="cyan">TypeScript + Tailwind</PixelBadge>
            <PixelBadge tone="gold">
              <span aria-label="50 percent off launch price">🔥 50% Off Launch</span>
            </PixelBadge>
          </div>

          {/* Voxel headline */}
          <VoxelText>PXLKIT</VoxelText>

          {/* Gold sub-tagline */}
          <p className="font-pixel text-xs sm:text-sm md:text-base text-retro-gold text-center px-2">
            Ship Pixel-Perfect Retro Interfaces in Minutes, Not Days.
          </p>

          {/* Compact stats line */}
          <p className="font-mono text-xs sm:text-sm text-retro-muted max-w-xl text-center px-2">
            Retro pixel-art React UI kit · 226+ icons · 111+ components · MIT code,
            source-available art.
          </p>

          {/* CTAs (ui-kit PixelButton) */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mt-1">
            <PixelButton
              tone="green"
              iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
              onClick={() => router.push('/templates')}
            >
              Browse Templates
            </PixelButton>
            <PixelButton
              tone="cyan"
              variant="ghost"
              iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
              onClick={() => router.push('/icons')}
            >
              Explore Icons
            </PixelButton>
          </div>

          {/* Install command */}
          <div className="max-w-[calc(100vw-2rem)] inline-block rounded-lg border border-retro-border/60 bg-retro-bg/80 backdrop-blur-sm px-3 sm:px-5 py-2 sm:py-2.5 font-mono text-[11px] sm:text-sm text-retro-fg break-words">
            <span className="text-retro-green mr-2">$</span>
            npm i @pxlkit/core @pxlkit/ui-kit @pxlkit/ui
            <span className="text-retro-muted ml-2">— ready in seconds</span>
          </div>
        </div>
      </section>
    </MouseProvider>
  );
}
