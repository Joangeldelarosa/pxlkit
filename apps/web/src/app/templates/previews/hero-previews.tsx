'use client';

import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, SparkleSmall } from '@pxlkit/ui';
import { SparkleStar } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelFadeIn,
  PixelTypewriter,
  PixelBounce,
  PixelBadge,
  PixelSlideIn,
  PixelFloat,
} from '@pxlkit/ui-kit';

/* ── Hero Centered ────────────────────────────────────────────────────── */
export function HeroCenteredPreview() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-4 py-14 bg-retro-bg">
      <PixelFadeIn delay={0}>
        <PixelBadge tone="green">
          <PxlKitIcon icon={SparkleSmall} size={12} className="mr-1" />
          Now open source
        </PixelBadge>
      </PixelFadeIn>

      <PixelFadeIn delay={100}>
        <h1 className="font-pixel text-lg sm:text-2xl text-retro-text leading-loose mt-4 mb-2">
          <PixelTypewriter text="Build retro UIs" speed={60} />
        </h1>
        <p className="text-retro-muted font-mono text-xs max-w-md mx-auto mb-6">
          Production-ready pixel-art React components. Ship fast. Look legendary.
        </p>
      </PixelFadeIn>

      <PixelFadeIn delay={200}>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <PixelButton tone="green" size="md">
            Get Started
            <PxlKitIcon icon={ArrowRight} size={12} className="ml-1" />
          </PixelButton>
          <PixelButton tone="neutral" size="md" variant="ghost">
            Browse Docs
          </PixelButton>
        </div>
      </PixelFadeIn>

      <PixelFadeIn delay={300}>
        <div className="mt-8 flex items-center justify-center gap-4 text-retro-muted font-mono text-[10px]">
          <PixelBounce>
            <AnimatedPxlKitIcon icon={SparkleStar} size={22} colorful />
          </PixelBounce>
          <span>226+ icons</span>
          <span className="text-retro-border">|</span>
          <span>10 packages</span>
        </div>
      </PixelFadeIn>
    </section>
  );
}

/* ── Hero Split ───────────────────────────────────────────────────────── */
export function HeroSplitPreview() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center px-4 py-14 bg-retro-bg">
      <PixelSlideIn from="left">
        <div>
          <PixelBadge tone="cyan">v2.0 release</PixelBadge>
          <h1 className="font-pixel text-lg sm:text-2xl text-retro-text leading-loose mt-3 mb-2">
            Social meets <span className="text-retro-cyan">Retro</span>
          </h1>
          <p className="text-retro-muted font-mono text-xs mb-5 max-w-sm">
            Animated social icons, floating hearts, and community-ready components.
          </p>
          <div className="flex gap-2">
            <PixelButton tone="cyan" size="md">
              Get Started
              <PxlKitIcon icon={ArrowRight} size={12} className="ml-1" />
            </PixelButton>
            <PixelButton tone="neutral" size="md" variant="ghost">
              Docs
            </PixelButton>
          </div>
        </div>
      </PixelSlideIn>

      <PixelSlideIn from="right">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[SparkleStar, SparkleStar, SparkleStar].map((icon, i) => (
            <PixelFloat key={i}>
              <AnimatedPxlKitIcon icon={icon} size={36 + i * 8} colorful />
            </PixelFloat>
          ))}
        </div>
      </PixelSlideIn>
    </section>
  );
}

/* ── Hero Parallax ────────────────────────────────────────────────────── */
export function HeroParallaxPreview() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden px-4 py-14 bg-retro-bg">
      {/* Simulated parallax dots */}
      <div className="absolute inset-0 pointer-events-none">
        <PixelFloat>
          <span className="absolute top-4 left-8 text-2xl opacity-30">✨</span>
        </PixelFloat>
        <PixelFloat>
          <span className="absolute top-10 right-10 text-3xl opacity-20">🚀</span>
        </PixelFloat>
        <PixelFloat>
          <span className="absolute bottom-8 left-14 text-xl opacity-25">👑</span>
        </PixelFloat>
        <PixelFloat>
          <span className="absolute bottom-6 right-8 text-2xl opacity-20">🔮</span>
        </PixelFloat>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto">
        <PixelFadeIn>
          <h1 className="font-pixel text-lg sm:text-2xl text-retro-text leading-loose mb-3">
            Experience the <span className="text-retro-gold">Pixel</span> Universe
          </h1>
          <p className="text-retro-muted font-mono text-xs mb-6">
            Interactive 3D parallax icons, animated effects, and retro components.
          </p>
          <PixelButton tone="gold" size="md">
            Explore Now
            <PxlKitIcon icon={ArrowRight} size={12} className="ml-1" />
          </PixelButton>
        </PixelFadeIn>
      </div>
    </section>
  );
}
