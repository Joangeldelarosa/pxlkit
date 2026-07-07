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
  PixelBadge,
  PixelContainer,
  PixelStack,
  PixelCluster,
} from '@pxlkit/ui-kit';

export function HeroCentered() {
  return (
    <section className="min-h-screen flex items-center bg-retro-bg">
      <PixelContainer as="div" maxWidth="xl" padding="xl">
        <PixelStack gap={6} align="center" className="text-center">
          <PixelFadeIn delay={0}>
            <PixelBadge
              tone="green"
              iconLeft={<PxlKitIcon icon={SparkleSmall} size={12} className="text-retro-green" />}
            >
              Now open source
            </PixelBadge>
          </PixelFadeIn>

          <PixelFadeIn delay={100}>
            <PixelStack gap={4} align="center">
              <h1 className="font-pixel text-2xl sm:text-4xl text-retro-text leading-loose">
                <PixelTypewriter label="Build retro UIs" speed={60} />
              </h1>
              <p className="text-retro-muted font-mono text-sm sm:text-base max-w-xl mx-auto">
                Production-ready pixel-art React components. Ship fast. Look legendary.
              </p>
            </PixelStack>
          </PixelFadeIn>

          <PixelFadeIn delay={200}>
            <PixelCluster gap={3} justify="center">
              <PixelButton
                tone="green"
                size="lg"
                iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
              >
                Get Started
              </PixelButton>
              <PixelButton tone="neutral" size="lg" variant="outline">
                Browse Docs
              </PixelButton>
            </PixelCluster>
          </PixelFadeIn>

          <PixelFadeIn delay={300}>
            <PixelCluster gap={6} justify="center" className="mt-6 text-retro-muted font-mono text-xs">
              <PixelBounce>
                <AnimatedPxlKitIcon icon={SparkleStar} size={28} colorful />
              </PixelBounce>
              <span>226+ icons</span>
              <span className="text-retro-border">|</span>
              <span>7 themed packs</span>
              <span className="text-retro-border">|</span>
              <span>MIT licensed</span>
            </PixelCluster>
          </PixelFadeIn>
        </PixelStack>
      </PixelContainer>
    </section>
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
  PixelContainer,
  PixelStack,
  PixelCluster,
  PixelTwoColumn,
  PixelHeroMedia,
} from '@pxlkit/ui-kit';

export function HeroSplit() {
  const left = (
    <PixelSlideIn from="left">
      <PixelStack gap={4} align="start">
        <PixelBadge tone="cyan" iconLeft={<PxlKitIcon icon={Package} size={12} />}>
          v1.0 Released
        </PixelBadge>
        <h1 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose">
          Pixel-art React<br />
          <span className="text-retro-green">UI Components</span>
        </h1>
        <p className="text-retro-muted font-mono text-sm max-w-md">
          The open-source retro UI kit for React developers. Components, icons,
          animations, and 3D effects — all in one ecosystem.
        </p>
        <PixelCluster gap={3}>
          <PixelButton
            tone="green"
            size="lg"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
          >
            Start Building
          </PixelButton>
          <PixelButton tone="neutral" size="lg" variant="outline">
            View Examples
          </PixelButton>
        </PixelCluster>
      </PixelStack>
    </PixelSlideIn>
  );

  const right = (
    <PixelSlideIn from="right">
      <PixelHeroMedia ratio="16/10" framed tone="green">
        <div className="relative flex h-full w-full items-center justify-center bg-retro-green/5">
          <PixelFloat>
            <AnimatedPxlKitIcon icon={FloatingHearts} size={80} colorful />
          </PixelFloat>
          <div className="absolute top-4 right-4">
            <AnimatedPxlKitIcon icon={PulseHeart} size={24} colorful />
          </div>
        </div>
      </PixelHeroMedia>
    </PixelSlideIn>
  );

  return (
    <section className="min-h-screen flex items-center bg-retro-bg">
      <PixelContainer as="div" maxWidth="3xl" padding="lg">
        <PixelTwoColumn
          ratio="50/50"
          gap={12}
          stackBelow="lg"
          align="center"
          left={left}
          right={right}
        />
      </PixelContainer>
    </section>
  );
}
`;

const parallaxHero = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { ParallaxPxlKitIcon, PxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { PixelRocket, CoolEmoji, MagicOrb, PixelCrown } from '@pxlkit/parallax';
import {
  PixelButton,
  PixelFadeIn,
  PixelMouseParallax,
  PixelCenter,
  PixelStack,
} from '@pxlkit/ui-kit';

export function HeroParallax() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Parallax background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <PixelMouseParallax strength={14} className="absolute top-16 left-12">
          <ParallaxPxlKitIcon icon={PixelCrown} size={56} />
        </PixelMouseParallax>
        <PixelMouseParallax strength={26} className="absolute top-24 right-16">
          <ParallaxPxlKitIcon icon={MagicOrb} size={72} />
        </PixelMouseParallax>
        <PixelMouseParallax strength={10} className="absolute bottom-24 left-20">
          <ParallaxPxlKitIcon icon={CoolEmoji} size={48} />
        </PixelMouseParallax>
        <PixelMouseParallax strength={20} className="absolute bottom-16 right-12">
          <ParallaxPxlKitIcon icon={PixelRocket} size={64} />
        </PixelMouseParallax>
      </div>

      {/* Center content */}
      <PixelCenter maxWidth="sm" align="center" className="relative z-10">
        <PixelFadeIn>
          <PixelStack gap={6} align="center">
            <h1 className="font-pixel text-xl sm:text-3xl text-retro-text leading-loose">
              Experience the <span className="text-retro-gold">Pixel</span> Universe
            </h1>
            <p className="text-retro-muted font-mono text-sm">
              Interactive 3D parallax icons, animated effects, and retro components
              that bring your UI to life.
            </p>
            <PixelButton
              tone="gold"
              size="lg"
              iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
            >
              Explore Now
            </PixelButton>
          </PixelStack>
        </PixelFadeIn>
      </PixelCenter>
    </section>
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
