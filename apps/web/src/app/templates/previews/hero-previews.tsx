'use client';

import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Package, Grid, Check } from '@pxlkit/ui';
import {
  Trophy,
  Crown,
  Gem,
  Lightning,
  Shield,
  Star,
  SparkleStar,
  FireSword,
  CoinSpin,
  FloatingGem,
} from '@pxlkit/gamification';
import { Verified, Globe, Community } from '@pxlkit/social';
import { Sparkles, CheckCircle, ShieldCheck } from '@pxlkit/feedback';
import { GlowPulse, Twinkle } from '@pxlkit/effects';
import {
  PixelButton,
  PixelFadeIn,
  PixelTypewriter,
  PixelBounce,
  PixelBadge,
  PixelSlideIn,
  PixelFloat,
  PixelPulse,
  PixelZoomIn,
} from '@pxlkit/ui-kit';

/* ── Hero Centered ──────────────────────────────────────────────────────── */
export function HeroCenteredPreview() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-20 sm:py-28 bg-retro-bg min-h-[480px]">
      <PixelFadeIn>
        <PixelBadge tone="green">
          <span className="inline-flex items-center gap-1">
            <PxlKitIcon icon={Verified} size={12} colorful />
            Now open source
          </span>
        </PixelBadge>
      </PixelFadeIn>

      <PixelFadeIn delay={120}>
        <h1 className="font-pixel text-2xl sm:text-4xl text-retro-text leading-loose mt-6 mb-3">
          <PixelTypewriter text="Build retro UIs" speed={55} />
        </h1>
        <p className="text-retro-muted font-mono text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
          Production-ready pixel-art React components with 250+ colorful
          icons, rich animations, and a full design system. Ship fast. Look
          legendary.
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
          <span className="inline-flex items-center gap-1.5">
            <PxlKitIcon icon={Package} size={14} colorful />
            250+ icons
          </span>
          <span className="text-retro-border">|</span>
          <span className="inline-flex items-center gap-1.5">
            <PxlKitIcon icon={Grid} size={14} colorful />
            40+ components
          </span>
          <span className="text-retro-border">|</span>
          <span className="inline-flex items-center gap-1.5">
            <PxlKitIcon icon={ShieldCheck} size={14} colorful />
            MIT licensed
          </span>
        </div>
      </PixelFadeIn>

      <PixelFadeIn delay={480}>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-retro-muted font-mono text-xs">
          <span className="inline-flex items-center gap-1">
            <PxlKitIcon icon={CheckCircle} size={12} colorful />
            TypeScript-first
          </span>
          <span className="inline-flex items-center gap-1">
            <PxlKitIcon icon={CheckCircle} size={12} colorful />
            Tree-shakeable
          </span>
          <span className="inline-flex items-center gap-1">
            <PxlKitIcon icon={CheckCircle} size={12} colorful />
            SSR ready
          </span>
        </div>
      </PixelFadeIn>
    </section>
  );
}

/* ── Hero Split ─────────────────────────────────────────────────────────── */
const splitShowcaseIcons = [
  { icon: FireSword, size: 48 },
  { icon: CoinSpin, size: 64 },
  { icon: FloatingGem, size: 48 },
] as const;

export function HeroSplitPreview() {
  return (
    <section className="bg-retro-bg min-h-[480px] flex items-center">
      <div className="w-full max-w-5xl mx-auto px-6 py-20 sm:py-28 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <PixelSlideIn from="left">
          <div>
            <PixelBadge tone="cyan">
              <span className="inline-flex items-center gap-1">
                <PxlKitIcon icon={Lightning} size={12} colorful />
                v2.0 release
              </span>
            </PixelBadge>
            <h1 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mt-5 mb-4">
              Gamify your <span className="text-retro-cyan">Interface</span>
            </h1>
            <p className="text-retro-muted font-mono text-sm sm:text-base mb-5 max-w-md leading-relaxed">
              Animated gamification icons, community-ready social components,
              and pixel-perfect feedback indicators — all built for the retro
              web.
            </p>

            <div className="flex flex-wrap gap-4 mb-7 text-retro-muted font-mono text-xs">
              <span className="inline-flex items-center gap-1.5">
                <PxlKitIcon icon={Trophy} size={14} colorful />
                6 icon packs
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PxlKitIcon icon={Globe} size={14} colorful />
                i18n ready
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PxlKitIcon icon={Shield} size={14} colorful />
                Fully typed
              </span>
            </div>

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
            {splitShowcaseIcons.map(({ icon, size }, i) => (
              <PixelFloat
                key={i}
                duration={2200 + i * 400}
                distance={8 + i * 2}
              >
                <AnimatedPxlKitIcon icon={icon} size={size} colorful />
              </PixelFloat>
            ))}
          </div>
        </PixelSlideIn>
      </div>
    </section>
  );
}

/* ── Hero Parallax ──────────────────────────────────────────────────────── */
const parallaxIcons = [
  { icon: Crown, top: 'top-10', left: 'left-[8%]', size: 36, duration: 3000, distance: 10 },
  { icon: Gem, top: 'top-20', left: 'right-[10%]', size: 40, duration: 2600, distance: 8 },
  { icon: Trophy, top: 'bottom-16', left: 'left-[15%]', size: 32, duration: 3400, distance: 12 },
  { icon: Lightning, top: 'bottom-12', left: 'right-[8%]', size: 36, duration: 2800, distance: 9 },
  { icon: Star, top: 'top-[40%]', left: 'left-[3%]', size: 24, duration: 3200, distance: 7 },
  { icon: Shield, top: 'top-[35%]', left: 'right-[4%]', size: 28, duration: 2900, distance: 11 },
] as const;

export function HeroParallaxPreview() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden px-6 py-20 sm:py-28 bg-retro-bg min-h-[480px]">
      {/* Floating decorative icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {parallaxIcons.map(({ icon, top, left, size, duration, distance }, i) => (
          <PixelFloat key={i} duration={duration} distance={distance}>
            <span className={`absolute ${top} ${left} opacity-20`}>
              <PxlKitIcon icon={icon} size={size} colorful />
            </span>
          </PixelFloat>
        ))}

        {/* Animated accent icons */}
        <PixelFloat duration={3600} distance={6}>
          <span className="absolute top-8 left-[45%] opacity-15">
            <AnimatedPxlKitIcon icon={Twinkle} size={20} colorful />
          </span>
        </PixelFloat>
        <PixelFloat duration={3100} distance={8}>
          <span className="absolute bottom-8 left-[50%] opacity-15">
            <AnimatedPxlKitIcon icon={GlowPulse} size={22} colorful />
          </span>
        </PixelFloat>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <PixelFadeIn>
          <PixelBadge tone="gold">
            <span className="inline-flex items-center gap-1">
              <PxlKitIcon icon={Sparkles} size={12} colorful />
              Interactive
            </span>
          </PixelBadge>
        </PixelFadeIn>

        <PixelFadeIn delay={100}>
          <h1 className="font-pixel text-2xl sm:text-4xl text-retro-text leading-loose mt-6 mb-4">
            Experience the{' '}
            <span className="text-retro-gold">Pixel</span> Universe
          </h1>
          <p className="text-retro-muted font-mono text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
            Parallax-ready icons, animated effects, and a complete retro
            design system for modern web experiences. Every icon renders in
            rich multi-color pixel art.
          </p>
        </PixelFadeIn>

        <PixelFadeIn delay={200}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <PixelButton
              tone="gold"
              size="lg"
              iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
            >
              Explore Now
            </PixelButton>
            <PixelButton tone="neutral" size="lg" variant="ghost">
              Live Playground
            </PixelButton>
          </div>
        </PixelFadeIn>

        <PixelZoomIn delay={350}>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <PixelPulse>
              <PxlKitIcon icon={Crown} size={36} colorful />
            </PixelPulse>
            <PixelBounce>
              <AnimatedPxlKitIcon icon={SparkleStar} size={40} colorful />
            </PixelBounce>
            <PixelPulse>
              <PxlKitIcon icon={Gem} size={36} colorful />
            </PixelPulse>
          </div>
        </PixelZoomIn>

        <PixelFadeIn delay={500}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-retro-muted font-mono text-xs">
            <span className="inline-flex items-center gap-1.5">
              <PxlKitIcon icon={Community} size={14} colorful />
              2k+ stars
            </span>
            <span className="text-retro-border">|</span>
            <span className="inline-flex items-center gap-1.5">
              <PxlKitIcon icon={Check} size={14} colorful />
              Zero dependencies
            </span>
            <span className="text-retro-border">|</span>
            <span className="inline-flex items-center gap-1.5">
              <PxlKitIcon icon={Globe} size={14} colorful />
              Used worldwide
            </span>
          </div>
        </PixelFadeIn>
      </div>
    </section>
  );
}
