'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { PixelBadge, PixelButton, useReducedMotion } from '@pxlkit/ui-kit';
import { UI_KIT_VERSION_LABEL } from '@/lib/pxlkit-version';
import { ICON_COUNT_LABEL, UI_COMPONENTS_COUNT } from '@/lib/pxlkit-counts';
import { POSITIONING_LINE } from '@/lib/site-copy';
import { MouseProvider } from './mouseContext';
import { HeroBackground } from './HeroBackground';
import { IconField } from './IconField';
import { VoxelText } from './VoxelText';

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
            <PixelBadge tone="purple">{`PIXEL-ART UI KIT ${UI_KIT_VERSION_LABEL}`}</PixelBadge>
            <PixelBadge tone="green">MIT Code · Licensed Assets</PixelBadge>
            <PixelBadge tone="cyan">TypeScript + Tailwind</PixelBadge>
            <PixelBadge tone="gold">
              <span aria-label="50 percent off launch price">🔥 50% Off Launch</span>
            </PixelBadge>
          </div>

          {/* Voxel headline */}
          <VoxelText subtitle="the retro pixel-art UI kit for React">PXLKIT</VoxelText>

          {/* Gold sub-tagline */}
          <p className="font-pixel text-xs sm:text-sm md:text-base text-retro-gold text-center px-2">
            Ship Pixel-Perfect Retro Interfaces in Minutes, Not Days.
          </p>

          {/* Compact stats line */}
          <p className="font-mono text-xs sm:text-sm text-retro-muted max-w-xl text-center px-2">
            {POSITIONING_LINE} · {UI_COMPONENTS_COUNT} components · {ICON_COUNT_LABEL} icons · MIT code,
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
          <div className="flex flex-col items-center gap-1.5">
            <div className="max-w-[calc(100vw-2rem)] inline-block rounded-lg border border-retro-border/60 bg-retro-bg/80 backdrop-blur-sm px-3 sm:px-5 py-2 sm:py-2.5 font-mono text-[11px] sm:text-sm text-retro-text break-words">
              <span className="text-retro-green mr-2">$</span>
              npm i @pxlkit/ui-kit
              <span className="text-retro-muted ml-2">— ready in seconds</span>
            </div>
            <p className="font-mono text-[10px] sm:text-xs text-retro-muted text-center px-2">
              Vue: <span className="text-retro-text">@pxlkit/ui-kit-vue</span> · Angular:{' '}
              <span className="text-retro-text">@pxlkit/ui-kit-angular</span>
            </p>
          </div>
        </div>
      </section>
    </MouseProvider>
  );
}
