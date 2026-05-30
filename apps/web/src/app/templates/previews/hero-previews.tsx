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
  PixelMouseParallax,
  PixelTooltip,
  PixelCodeInline,
  PixelGlitch,
  PixelChip,
  PixelContainer,
  PixelStack,
  PixelCluster,
  PixelTwoColumn,
  PixelHeroMedia,
} from '@pxlkit/ui-kit';

/* ── Hero Centered ──────────────────────────────────────────────────────── */
export function HeroCenteredPreview() {
  return (
    <section className="bg-retro-bg min-h-[480px] flex items-center">
      <PixelContainer maxWidth="xl" padding="xl">
        <PixelStack gap={6} align="center" className="text-center">
          <PixelFadeIn>
            <PixelBadge tone="green">
              <span className="inline-flex items-center gap-1">
                <PxlKitIcon icon={Verified} size={12} colorful />
                Now open source
              </span>
            </PixelBadge>
          </PixelFadeIn>

          <PixelFadeIn delay={120}>
            <PixelStack gap={3} align="center" className="text-center">
              <h1 className="font-pixel text-2xl sm:text-4xl text-retro-text leading-loose">
                <PixelGlitch trigger="hover" intensity={3} duration={800}>
                  <PixelTypewriter text="Build retro UIs" speed={55} />
                </PixelGlitch>
              </h1>
              <p className="text-retro-muted font-mono text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Production-ready pixel-art React components with 226+ colorful
                icons, rich animations, and a full design system. Ship fast. Look
                legendary.
              </p>
            </PixelStack>
          </PixelFadeIn>

          <PixelFadeIn delay={240}>
            <PixelCluster gap={3} justify="center">
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
            </PixelCluster>
          </PixelFadeIn>

          <PixelFadeIn delay={300}>
            <div className="inline-flex items-center gap-2 rounded-lg border border-retro-border bg-retro-surface/40 px-4 py-2 font-mono text-sm">
              <PixelCodeInline tone="green">npm install @pxlkit/core</PixelCodeInline>
            </div>
          </PixelFadeIn>

          <PixelFadeIn delay={360}>
            <PixelMouseParallax strength={15}>
              <PixelCluster gap={6} justify="center" className="text-retro-muted font-mono text-sm">
                <PixelBounce>
                  <AnimatedPxlKitIcon icon={SparkleStar} size={28} colorful />
                </PixelBounce>
                <PixelTooltip content="Across 7 themed icon packs" position="top">
                  <span className="inline-flex items-center gap-1.5">
                    <PxlKitIcon icon={Package} size={14} colorful />
                    226+ icons
                  </span>
                </PixelTooltip>
                <span className="text-retro-border">|</span>
                <PixelTooltip content="Buttons, cards, modals, animations, and more" position="top">
                  <span className="inline-flex items-center gap-1.5">
                    <PxlKitIcon icon={Grid} size={14} colorful />
                    54 components
                  </span>
                </PixelTooltip>
                <span className="text-retro-border">|</span>
                <PixelTooltip content="Free for personal and commercial use" position="top">
                  <span className="inline-flex items-center gap-1.5">
                    <PxlKitIcon icon={ShieldCheck} size={14} colorful />
                    MIT licensed
                  </span>
                </PixelTooltip>
              </PixelCluster>
            </PixelMouseParallax>
          </PixelFadeIn>

          <PixelFadeIn delay={480}>
            <PixelCluster gap={4} justify="center" className="text-retro-muted font-mono text-xs">
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
            </PixelCluster>
          </PixelFadeIn>
        </PixelStack>
      </PixelContainer>
    </section>
  );
}

/* ── Hero Split ─────────────────────────────────────────────────────────── */
const splitShowcaseIcons = [
  { icon: FireSword, size: 48, label: 'Gamification Pack' },
  { icon: CoinSpin, size: 64, label: 'Gamification Pack' },
  { icon: FloatingGem, size: 48, label: 'Gamification Pack' },
] as const;

export function HeroSplitPreview() {
  const left = (
    <PixelSlideIn from="left">
      <PixelStack gap={4} align="start">
        <PixelBadge tone="cyan">
          <span className="inline-flex items-center gap-1">
            <PxlKitIcon icon={Lightning} size={12} colorful />
            v2.0 release
          </span>
        </PixelBadge>

        <PixelStack gap={3} align="start">
          <h1 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose">
            Gamify your <span className="text-retro-cyan">Interface</span>
          </h1>
          <p className="text-retro-muted font-mono text-sm sm:text-base max-w-md leading-relaxed">
            Animated gamification icons, community-ready social components,
            and pixel-perfect feedback indicators — all built for the retro
            web.
          </p>
        </PixelStack>

        <PixelCluster gap={2} justify="start">
          <PixelChip label="React" tone="cyan" />
          <PixelChip label="TypeScript" tone="purple" />
          <PixelChip label="Tailwind" tone="green" />
        </PixelCluster>

        <PixelCluster gap={4} justify="start" className="text-retro-muted font-mono text-xs">
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
        </PixelCluster>

        <PixelPulse>
          <PixelBadge tone="gold">
            <span className="inline-flex items-center gap-1">
              <PxlKitIcon icon={Star} size={12} colorful />
              2.4k stars
            </span>
          </PixelBadge>
        </PixelPulse>

        <PixelCluster gap={3} justify="start">
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
        </PixelCluster>
      </PixelStack>
    </PixelSlideIn>
  );

  const right = (
    <PixelSlideIn from="right">
      <PixelHeroMedia ratio="1/1" anchor="baseline-headline">
        <PixelCluster gap={8} justify="center" className="h-full">
          {splitShowcaseIcons.map(({ icon, size, label }, i) => (
            <PixelTooltip key={i} content={label} position="top">
              <PixelFloat
                duration={2200 + i * 400}
                distance={8 + i * 2}
              >
                <AnimatedPxlKitIcon icon={icon} size={size} colorful />
              </PixelFloat>
            </PixelTooltip>
          ))}
        </PixelCluster>
      </PixelHeroMedia>
    </PixelSlideIn>
  );

  return (
    <section className="bg-retro-bg min-h-[480px] flex items-center">
      <PixelContainer maxWidth="xl" padding="xl">
        <PixelTwoColumn
          ratio="50/50"
          gap={10}
          stackBelow="md"
          align="center"
          left={left}
          right={right}
        />
      </PixelContainer>
    </section>
  );
}

/* ── Hero Parallax ──────────────────────────────────────────────────────── */
const parallaxIcons = [
  { icon: Crown, top: 'top-10', left: 'left-[8%]', size: 36, duration: 3000, distance: 10, useParallax: true, tip: 'Gamification Pack' },
  { icon: Gem, top: 'top-20', left: 'right-[10%]', size: 40, duration: 2600, distance: 8, useParallax: true, tip: 'Gamification Pack' },
  { icon: Trophy, top: 'bottom-16', left: 'left-[15%]', size: 32, duration: 3400, distance: 12, useParallax: false, tip: 'Gamification Pack' },
  { icon: Lightning, top: 'bottom-12', left: 'right-[8%]', size: 36, duration: 2800, distance: 9, useParallax: true, tip: 'Gamification Pack' },
  { icon: Star, top: 'top-[40%]', left: 'left-[3%]', size: 24, duration: 3200, distance: 7, useParallax: false, tip: 'Gamification Pack' },
  { icon: Shield, top: 'top-[35%]', left: 'right-[4%]', size: 28, duration: 2900, distance: 11, useParallax: false, tip: 'Gamification Pack' },
] as const;

export function HeroParallaxPreview() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden px-6 py-20 sm:py-28 bg-retro-bg min-h-[480px]">
      {/* Floating decorative icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {parallaxIcons.map(({ icon, top, left, size, duration, distance, useParallax }, i) => {
          const inner = (
            <span className={`absolute ${top} ${left} opacity-20`}>
              <PxlKitIcon icon={icon} size={size} colorful />
            </span>
          );

          if (useParallax) {
            return (
              <PixelMouseParallax key={i} strength={12 + i * 3}>
                {inner}
              </PixelMouseParallax>
            );
          }

          return (
            <PixelFloat key={i} duration={duration} distance={distance}>
              {inner}
            </PixelFloat>
          );
        })}

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
            <PixelTooltip content="Crown - Gamification Pack" position="top">
              <PixelPulse>
                <PxlKitIcon icon={Crown} size={36} colorful />
              </PixelPulse>
            </PixelTooltip>
            <PixelTooltip content="SparkleStar - Gamification Pack" position="top">
              <PixelBounce>
                <AnimatedPxlKitIcon icon={SparkleStar} size={40} colorful />
              </PixelBounce>
            </PixelTooltip>
            <PixelTooltip content="Gem - Gamification Pack" position="top">
              <PixelPulse>
                <PxlKitIcon icon={Gem} size={36} colorful />
              </PixelPulse>
            </PixelTooltip>
          </div>
        </PixelZoomIn>

        <PixelFadeIn delay={420}>
          <p className="mt-8 font-mono text-sm text-retro-muted">
            Trusted by{' '}
            <span className="text-retro-gold font-pixel">
              <PixelTypewriter text="3,200+" speed={70} />
            </span>{' '}
            developers
          </p>
        </PixelFadeIn>

        <PixelFadeIn delay={500}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-retro-muted font-mono text-xs">
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
