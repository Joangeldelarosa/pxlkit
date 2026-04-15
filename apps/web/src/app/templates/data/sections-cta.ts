import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/gamification';

const bannerCta = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { SparkleStar } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelGlitch,
  PixelBounce,
  PixelSection,
} from '@pxlkit/ui-kit';

export function BannerCta() {
  return (
    <PixelSection className="py-16 sm:py-24 bg-retro-green/5 border-y border-retro-green/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex justify-center mb-6">
          <PixelBounce>
            <AnimatedPxlKitIcon icon={SparkleStar} size={48} colorful />
          </PixelBounce>
        </div>
        <PixelGlitch active={false}>
          <h2 className="font-pixel text-xl sm:text-3xl text-retro-text leading-loose mb-4">
            Start building today
          </h2>
        </PixelGlitch>
        <p className="text-retro-muted font-mono text-sm sm:text-base max-w-xl mx-auto mb-8">
          Everything you need to ship a beautiful retro interface. Free, open-source, zero lock-in.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PixelButton tone="green" size="lg">
            Get Started Free
            <PxlKitIcon icon={ArrowRight} size={14} className="ml-2" />
          </PixelButton>
          <PixelButton tone="neutral" size="lg" variant="outline">
            Read the Docs
          </PixelButton>
        </div>
      </div>
    </PixelSection>
  );
}
`;

const splitCta = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { Trophy, Coin, LevelUp } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelCard,
  PixelStatCard,
  PixelSlideIn,
  PixelSection,
} from '@pxlkit/ui-kit';

export function SplitCta() {
  const stats = [
    { icon: Trophy, label: 'Stars', value: '4.2k', tone: 'gold' as const },
    { icon: Coin, label: 'Downloads/mo', value: '18k', tone: 'cyan' as const },
    { icon: LevelUp, label: 'Components', value: '60+', tone: 'green' as const },
  ];

  return (
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: text */}
        <PixelSlideIn direction="left">
          <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mb-4">
            Join 4k+ developers
          </h2>
          <p className="text-retro-muted font-mono text-sm mb-6">
            Building beautiful retro interfaces with Pxlkit. From indie hackers
            to enterprise teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <PixelButton tone="green" size="lg">
              Start Free
              <PxlKitIcon icon={ArrowRight} size={14} className="ml-2" />
            </PixelButton>
            <PixelButton tone="neutral" size="lg" variant="outline">
              See examples
            </PixelButton>
          </div>
        </PixelSlideIn>

        {/* Right: stats */}
        <PixelSlideIn direction="right">
          <div className="grid grid-cols-1 gap-4">
            {stats.map((s) => (
              <PixelStatCard
                key={s.label}
                label={s.label}
                value={s.value}
                icon={<PxlKitIcon icon={s.icon} size={20} colorful />}
              />
            ))}
          </div>
        </PixelSlideIn>
      </div>
    </PixelSection>
  );
}
`;

const cardCta = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { FireSword } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelCard,
  PixelTypewriter,
  PixelFadeIn,
  PixelSection,
} from '@pxlkit/ui-kit';

export function CardCta() {
  return (
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <PixelFadeIn>
          <PixelCard className="text-center p-8 sm:p-12 border-retro-gold/30 bg-retro-gold/5">
            <div className="flex justify-center mb-6">
              <AnimatedPxlKitIcon icon={FireSword} size={56} colorful />
            </div>
            <h2 className="font-pixel text-lg sm:text-xl text-retro-text leading-loose mb-3">
              <PixelTypewriter text="Level up your UI" speed={50} />
            </h2>
            <p className="text-retro-muted font-mono text-sm max-w-md mx-auto mb-8">
              Ship production-ready retro interfaces in minutes, not days.
              Free forever. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <PixelButton tone="gold" size="lg">
                Start for Free
                <PxlKitIcon icon={ArrowRight} size={14} className="ml-2" />
              </PixelButton>
              <PixelButton tone="neutral" size="lg" variant="ghost">
                View on GitHub
              </PixelButton>
            </div>
          </PixelCard>
        </PixelFadeIn>
      </div>
    </PixelSection>
  );
}
`;

export const ctaSection: TemplateSection = {
  id: 'cta',
  name: 'CTA Sections',
  description: 'Call-to-action sections to convert visitors — banner, split, and card styles.',
  icon: '⚡',
  variants: [
    {
      id: 'cta-banner',
      name: 'Banner CTA',
      description: 'Full-width banner with animated icon, glitch headline, and dual buttons.',
      installCmd: INSTALL,
      code: bannerCta,
    },
    {
      id: 'cta-split',
      name: 'Split CTA',
      description: 'Two-column with text + PixelStatCards showing social proof.',
      installCmd: INSTALL,
      code: splitCta,
    },
    {
      id: 'cta-card',
      name: 'Card CTA',
      description: 'Centered PixelCard CTA with typewriter headline and animated icon.',
      installCmd: INSTALL,
      code: cardCta,
    },
  ],
};
