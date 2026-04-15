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

/* ── Hero Centered ──────────────────────────────────────────────────────── */
export function HeroCenteredPreview() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-20 sm:py-28 bg-retro-bg min-h-[480px]">
      <PixelFadeIn>
        <PixelBadge tone="green">
          <span className="inline-flex items-center gap-1">
            <PxlKitIcon icon={SparkleSmall} size={12} />
            Now open source
          </span>
        </PixelBadge>
      </PixelFadeIn>

      <PixelFadeIn delay={120}>
        <h1 className="font-pixel text-2xl sm:text-4xl text-retro-text leading-loose mt-6 mb-3">
          <PixelTypewriter text="Build retro UIs" speed={55} />
        </h1>
        <p className="text-retro-muted font-mono text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
          Production-ready pixel-art React components. Ship fast. Look legendary.
        </p>
      </PixelFadeIn>

      <PixelFadeIn delay={240}>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PixelButton
            tone="green"
            size="lg"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
          >
            Get Started
          </PixelButton>
          <PixelButton tone="neutral" size="lg" variant="ghost">
            Browse Docs
          </PixelButton>
        </div>
      </PixelFadeIn>

      <PixelFadeIn delay={360}>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-retro-muted font-mono text-sm">
          <PixelBounce>
            <AnimatedPxlKitIcon icon={SparkleStar} size={28} colorful />
          </PixelBounce>
          <span>226+ icons</span>
          <span className="text-retro-border">|</span>
          <span>40+ components</span>
          <span className="text-retro-border">|</span>
          <span>MIT licensed</span>
        </div>
      </PixelFadeIn>
    </section>
  );
}

/* ── Hero Split ─────────────────────────────────────────────────────────── */
export function HeroSplitPreview() {
  return (
    <section className="bg-retro-bg min-h-[480px] flex items-center">
      <div className="w-full max-w-5xl mx-auto px-6 py-20 sm:py-28 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <PixelSlideIn from="left">
          <div>
            <PixelBadge tone="cyan">v2.0 release</PixelBadge>
            <h1 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mt-5 mb-4">
              Social meets <span className="text-retro-cyan">Retro</span>
            </h1>
            <p className="text-retro-muted font-mono text-sm sm:text-base mb-7 max-w-md leading-relaxed">
              Animated social icons, floating hearts, and community-ready
              components built for the pixel age.
            </p>
            <div className="flex flex-wrap gap-3">
              <PixelButton
                tone="cyan"
                size="lg"
                iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
              >
                Get Started
              </PixelButton>
              <PixelButton tone="neutral" size="lg" variant="ghost">
                View Docs
              </PixelButton>
            </div>
          </div>
        </PixelSlideIn>

        <PixelSlideIn from="right">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[SparkleStar, SparkleStar, SparkleStar].map((icon, i) => (
              <PixelFloat key={i} duration={2200 + i * 400} distance={8 + i * 2}>
                <AnimatedPxlKitIcon icon={icon} size={48 + i * 16} colorful />
              </PixelFloat>
            ))}
          </div>
        </PixelSlideIn>
      </div>
    </section>
  );
}

/* ── Hero Parallax ──────────────────────────────────────────────────────── */
export function HeroParallaxPreview() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden px-6 py-20 sm:py-28 bg-retro-bg min-h-[480px]">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <PixelFloat duration={3000} distance={10}>
          <span className="absolute top-10 left-[8%] text-4xl opacity-20">✨</span>
        </PixelFloat>
        <PixelFloat duration={2600} distance={8}>
          <span className="absolute top-20 right-[10%] text-5xl opacity-12">🚀</span>
        </PixelFloat>
        <PixelFloat duration={3400} distance={12}>
          <span className="absolute bottom-16 left-[15%] text-3xl opacity-18">👑</span>
        </PixelFloat>
        <PixelFloat duration={2800} distance={9}>
          <span className="absolute bottom-12 right-[8%] text-4xl opacity-12">🔮</span>
        </PixelFloat>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <PixelFadeIn>
          <PixelBadge tone="gold">Interactive</PixelBadge>
          <h1 className="font-pixel text-2xl sm:text-4xl text-retro-text leading-loose mt-6 mb-4">
            Experience the{' '}
            <span className="text-retro-gold">Pixel</span> Universe
          </h1>
          <p className="text-retro-muted font-mono text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
            Interactive 3D parallax icons, animated effects, and retro
            components for modern web experiences.
          </p>
          <PixelButton
            tone="gold"
            size="lg"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
          >
            Explore Now
          </PixelButton>
        </PixelFadeIn>
      </div>
    </section>
  );
}
