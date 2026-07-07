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
  PixelBounce,
  PixelContainer,
  PixelSectionHeader,
  PixelStack,
  PixelCluster,
} from '@pxlkit/ui-kit';

export function BannerCta() {
  return (
    <PixelContainer
      as="section"
      maxWidth="lg"
      padding="lg"
      className="bg-retro-green/5 border-y border-retro-green/20"
      aria-labelledby="banner-cta-title"
    >
      <PixelStack gap={6} align="center" className="text-center">
        <PixelBounce>
          <AnimatedPxlKitIcon icon={SparkleStar} size={48} colorful />
        </PixelBounce>
        <PixelSectionHeader
          id="banner-cta-title"
          align="center"
          size="sm"
          spacing="tight"
          title="Start building today"
          description="Everything you need to ship a beautiful retro interface. Free, open-source, zero lock-in."
        />
        <PixelCluster gap={3} justify="center">
          <PixelButton
            tone="green"
            size="lg"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
          >
            Get Started Free
          </PixelButton>
          <PixelButton tone="neutral" size="lg" variant="outline">
            Read the Docs
          </PixelButton>
        </PixelCluster>
      </PixelStack>
    </PixelContainer>
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
  PixelStatCard,
  PixelSlideIn,
  PixelContainer,
  PixelSectionHeader,
  PixelStack,
  PixelTwoColumn,
} from '@pxlkit/ui-kit';

export function SplitCta() {
  const stats = [
    { icon: Trophy, label: 'Stars', value: '4.2k', tone: 'gold' as const },
    { icon: Coin, label: 'Downloads/mo', value: '18k', tone: 'cyan' as const },
    { icon: LevelUp, label: 'Components', value: '60+', tone: 'green' as const },
  ];

  return (
    <PixelContainer as="section" maxWidth="3xl" padding="lg">
      <PixelTwoColumn
        ratio="50/50"
        gap={12}
        stackBelow="lg"
        align="center"
        left={
          <PixelSlideIn from="left">
            <PixelSectionHeader
              size="sm"
              title="Join 4k+ developers"
              description="Building beautiful retro interfaces with Pxlkit. From indie hackers to enterprise teams."
              actions={
                <>
                  <PixelButton
                    tone="green"
                    size="lg"
                    iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
                  >
                    Start Free
                  </PixelButton>
                  <PixelButton tone="neutral" size="lg" variant="outline">
                    See examples
                  </PixelButton>
                </>
              }
            />
          </PixelSlideIn>
        }
        right={
          <PixelSlideIn from="right">
            <PixelStack gap={4}>
              {stats.map((s) => (
                <PixelStatCard
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  tone={s.tone}
                  icon={<PxlKitIcon icon={s.icon} size={20} colorful />}
                />
              ))}
            </PixelStack>
          </PixelSlideIn>
        }
      />
    </PixelContainer>
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
  PixelContainer,
  PixelStack,
  PixelCluster,
} from '@pxlkit/ui-kit';

export function CardCta() {
  return (
    <PixelContainer as="section" maxWidth="sm" padding="lg">
      <PixelFadeIn>
        <PixelCard tone="gold" padding="lg" className="text-center sm:p-12">
          <PixelStack gap={5} align="center">
            <AnimatedPxlKitIcon icon={FireSword} size={56} colorful />
            <h2 className="font-pixel text-lg sm:text-xl text-retro-text leading-loose">
              <PixelTypewriter label="Level up your UI" speed={50} />
            </h2>
            <p className="text-retro-muted font-mono text-sm max-w-md mx-auto">
              Ship production-ready retro interfaces in minutes, not days.
              Free forever. No credit card required.
            </p>
            <PixelCluster gap={3} justify="center">
              <PixelButton
                tone="gold"
                size="lg"
                iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
              >
                Start for Free
              </PixelButton>
              <PixelButton tone="neutral" size="lg" variant="ghost">
                View on GitHub
              </PixelButton>
            </PixelCluster>
          </PixelStack>
        </PixelCard>
      </PixelFadeIn>
    </PixelContainer>
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
      description: 'Full-width banner with animated icon, section header, and dual buttons.',
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
