import type { TemplateSection } from '../types';

const INSTALL_CORE_UIKIT = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/gamification';
const INSTALL_PARALLAX = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/parallax';
const INSTALL_SOCIAL = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/social';

const centeredCtaHero = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, SparkleSmall } from '@pxlkit/ui';
import { SparkleStar } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelFadeIn,
  PixelTypewriter,
  PixelBounce,
  PixelSection,
  PixelBadge,
} from '@pxlkit/ui-kit';

export function HeroCentered() {
  return (
    <PixelSection className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20">
      <PixelFadeIn delay={0}>
        <PixelBadge tone="green" className="mb-6 inline-flex items-center gap-2">
          <PxlKitIcon icon={SparkleSmall} size={12} className="text-retro-green" />
          Now open source
        </PixelBadge>
      </PixelFadeIn>

      <PixelFadeIn delay={100}>
        <h1 className="font-pixel text-2xl sm:text-4xl text-retro-text leading-loose mb-4">
          <PixelTypewriter text="Build retro UIs" speed={60} />
        </h1>
        <p className="text-retro-muted font-mono text-sm sm:text-base max-w-xl mx-auto mb-8">
          Production-ready pixel-art React components. Ship fast. Look legendary.
        </p>
      </PixelFadeIn>

      <PixelFadeIn delay={200}>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PixelButton tone="green" size="lg">
            Get Started
            <PxlKitIcon icon={ArrowRight} size={14} className="ml-2" />
          </PixelButton>
          <PixelButton tone="neutral" size="lg" variant="outline">
            Browse Docs
          </PixelButton>
        </div>
      </PixelFadeIn>

      <PixelFadeIn delay={300}>
        <div className="mt-12 flex items-center justify-center gap-6 text-retro-muted font-mono text-xs">
          <PixelBounce>
            <AnimatedPxlKitIcon icon={SparkleStar} size={28} colorful />
          </PixelBounce>
          <span>226+ icons</span>
          <span className="text-retro-border">|</span>
          <span>10 packages</span>
          <span className="text-retro-border">|</span>
          <span>MIT licensed</span>
        </div>
      </PixelFadeIn>
    </PixelSection>
  );
}
`;

const splitHero = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Package } from '@pxlkit/ui';
import { FloatingHearts, PulseHeart } from '@pxlkit/social';
import {
  PixelButton,
  PixelSlideIn,
  PixelFloat,
  PixelBadge,
  PixelSection,
} from '@pxlkit/ui-kit';

export function HeroSplit() {
  return (
    <PixelSection className="min-h-screen flex items-center px-4 py-16">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <PixelSlideIn direction="left">
          <PixelBadge tone="cyan" className="mb-4 inline-flex items-center gap-2">
            <PxlKitIcon icon={Package} size={12} />
            v1.0 Released
          </PixelBadge>
          <h1 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-4">
            Pixel-art React<br />
            <span className="text-retro-green">UI Components</span>
          </h1>
          <p className="text-retro-muted font-mono text-sm max-w-md mb-8">
            The open-source retro UI kit for React developers. Components, icons,
            animations, and 3D effects — all in one ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <PixelButton tone="green" size="lg">
              Start Building
              <PxlKitIcon icon={ArrowRight} size={14} className="ml-2" />
            </PixelButton>
            <PixelButton tone="neutral" size="lg" variant="outline">
              View Examples
            </PixelButton>
          </div>
        </PixelSlideIn>

        {/* Right: Icon showcase */}
        <PixelSlideIn direction="right">
          <div className="relative flex items-center justify-center h-64 lg:h-80">
            <div className="absolute inset-0 bg-retro-green/5 border border-retro-green/20 rounded-sm" />
            <PixelFloat>
              <AnimatedPxlKitIcon icon={FloatingHearts} size={80} colorful />
            </PixelFloat>
            <div className="absolute top-4 right-4">
              <AnimatedPxlKitIcon icon={PulseHeart} size={24} colorful />
            </div>
          </div>
        </PixelSlideIn>
      </div>
    </PixelSection>
  );
}
`;

const parallaxHero = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { ParallaxPxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { PixelRocket, CoolEmoji, MagicOrb, PixelCrown } from '@pxlkit/parallax';
import {
  PixelButton,
  PixelFadeIn,
  PixelMouseParallax,
  PixelParallaxGroup,
  PixelParallaxLayer,
  PixelSection,
} from '@pxlkit/ui-kit';

export function HeroParallax() {
  return (
    <PixelSection className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Parallax background layers */}
      <PixelMouseParallax className="absolute inset-0 pointer-events-none">
        <PixelParallaxGroup>
          <PixelParallaxLayer depth={0.2} className="absolute top-16 left-12">
            <ParallaxPxlKitIcon icon={PixelCrown} size={56} />
          </PixelParallaxLayer>
          <PixelParallaxLayer depth={0.4} className="absolute top-24 right-16">
            <ParallaxPxlKitIcon icon={MagicOrb} size={72} />
          </PixelParallaxLayer>
          <PixelParallaxLayer depth={0.15} className="absolute bottom-24 left-20">
            <ParallaxPxlKitIcon icon={CoolEmoji} size={48} />
          </PixelParallaxLayer>
          <PixelParallaxLayer depth={0.3} className="absolute bottom-16 right-12">
            <ParallaxPxlKitIcon icon={PixelRocket} size={64} />
          </PixelParallaxLayer>
        </PixelParallaxGroup>
      </PixelMouseParallax>

      {/* Center content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <PixelFadeIn>
          <h1 className="font-pixel text-xl sm:text-3xl text-retro-text leading-loose mb-6">
            Experience the <span className="text-retro-gold">Pixel</span> Universe
          </h1>
          <p className="text-retro-muted font-mono text-sm mb-8">
            Interactive 3D parallax icons, animated effects, and retro components
            that bring your UI to life.
          </p>
          <PixelButton tone="gold" size="lg">
            Explore Now
            <PxlKitIcon icon={ArrowRight} size={14} className="ml-2" />
          </PixelButton>
        </PixelFadeIn>
      </div>
    </PixelSection>
  );
}
`;

export const heroSection: TemplateSection = {
  id: 'hero',
  name: 'Hero Sections',
  description: 'Full-width hero sections for landing pages — centered, split layout, and parallax.',
  icon: '🚀',
  variants: [
    {
      id: 'hero-centered',
      name: 'Centered CTA',
      description: 'Minimal centered hero with typewriter headline and dual CTA buttons.',
      installCmd: INSTALL_CORE_UIKIT,
      code: centeredCtaHero,
    },
    {
      id: 'hero-split',
      name: 'Split with Icons',
      description: 'Two-column hero with text left, animated icon showcase right.',
      installCmd: INSTALL_SOCIAL,
      code: splitHero,
    },
    {
      id: 'hero-parallax',
      name: 'Parallax Background',
      description: 'Mouse-tracking parallax icons floating in the background.',
      installCmd: INSTALL_PARALLAX,
      code: parallaxHero,
    },
  ],
};
