import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/feedback';

const iconGrid = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon } from '@pxlkit/core';
import { Package, Palette, CloudSync } from '@pxlkit/ui';
import { ShieldCheck, Sparkles, Bell } from '@pxlkit/feedback';
import {
  PixelFeatureCard,
  PixelFadeIn,
  PixelContainer,
  PixelSectionHeader,
  PixelGrid,
} from '@pxlkit/ui-kit';

const FEATURES = [
  {
    icon: Package,
    title: 'Modular Packages',
    description: 'Install only what you need. Each package is tree-shakeable and independently versioned.',
    tone: 'green',
  },
  {
    icon: Palette,
    title: 'Design Tokens',
    description: 'Consistent retro color palette via CSS variables. Switch between dark and light themes.',
    tone: 'cyan',
  },
  {
    icon: ShieldCheck,
    title: 'Type Safe',
    description: 'Full TypeScript support with strict types for all props, icons, and utilities.',
    tone: 'gold',
  },
  {
    icon: CloudSync,
    title: 'Zero Config',
    description: 'Works out of the box with Next.js, Vite, and any React setup. No extra config needed.',
    tone: 'purple',
  },
  {
    icon: Sparkles,
    title: 'Animations',
    description: '11 built-in animation components: FadeIn, SlideIn, Typewriter, Glitch, Bounce and more.',
    tone: 'pink',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'PixelToast notifications with customizable positions, durations, and tone variants.',
    tone: 'red',
  },
] as const;

export function IconFeatureGrid() {
  return (
    <PixelContainer as="section" maxWidth="3xl" padding="lg" aria-labelledby="features-grid-title">
      <PixelSectionHeader
        id="features-grid-title"
        align="center"
        size="md"
        title="Everything you need"
        description="A complete ecosystem for building beautiful retro React interfaces."
      />
      <div className="mt-10">
        <PixelGrid cols={{ base: 1, sm: 2, lg: 3 }} gap={4}>
          {FEATURES.map((f, i) => (
            <PixelFadeIn key={f.title} delay={i * 80}>
              <PixelFeatureCard
                className="h-full"
                tone={f.tone}
                icon={<PxlKitIcon icon={f.icon} size={24} colorful />}
                title={f.title}
                description={f.description}
                descriptionLines={3}
              />
            </PixelFadeIn>
          ))}
        </PixelGrid>
      </div>
    </PixelContainer>
  );
}
`;

const alternatingFeatures = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { AnimatedPxlKitIcon } from '@pxlkit/core';
import { SparkleStar, CoinSpin, GlowingSword } from '@pxlkit/gamification';
import {
  PixelSlideIn,
  PixelBadge,
  PixelContainer,
  PixelStack,
  PixelTwoColumn,
  PixelHeroMedia,
} from '@pxlkit/ui-kit';

const FEATURES = [
  {
    badge: 'Icons',
    tone: 'green' as const,
    title: '226+ Pixel Art Icons',
    description: 'Hand-crafted pixel art icons across 7 themed packs: UI, Feedback, Social, Gamification, Weather, Effects, and Parallax. Each icon is a pure SVG built from rectangles — perfectly crisp at any size.',
    icon: SparkleStar,
  },
  {
    badge: 'Components',
    tone: 'cyan' as const,
    title: '60+ React Components',
    description: 'Buttons, cards, inputs, tables, modals, accordions, tabs, pagination, animations — all built with Tailwind CSS and the retro design token system. No third-party UI library required.',
    icon: CoinSpin,
  },
  {
    badge: '3D Effects',
    tone: 'gold' as const,
    title: 'Parallax & 3D Icons',
    description: 'Mouse-tracking 3D parallax icons with layered depth using React Three Fiber. 10 iconic characters including rockets, skulls, orbs, and more.',
    icon: GlowingSword,
  },
] as const;

export function AlternatingFeatures() {
  return (
    <PixelContainer as="section" maxWidth="2xl" padding="lg">
      <div className="space-y-24">
        {FEATURES.map((f, i) => (
          <PixelTwoColumn
            key={f.title}
            ratio="50/50"
            gap={12}
            stackBelow="lg"
            align="center"
            reverse={i % 2 === 1}
            left={
              <PixelSlideIn from={i % 2 === 0 ? 'left' : 'right'}>
                <PixelStack gap={4} align="start">
                  <PixelBadge tone={f.tone}>{f.badge}</PixelBadge>
                  <h3 className="font-pixel text-base sm:text-xl text-retro-text leading-loose">
                    {f.title}
                  </h3>
                  <p className="text-retro-muted font-mono text-sm leading-relaxed">
                    {f.description}
                  </p>
                </PixelStack>
              </PixelSlideIn>
            }
            right={
              <PixelSlideIn from={i % 2 === 0 ? 'right' : 'left'}>
                <PixelHeroMedia ratio="16/10" framed tone={f.tone}>
                  <div className="flex h-full w-full items-center justify-center bg-retro-surface/30">
                    <AnimatedPxlKitIcon icon={f.icon} size={80} colorful />
                  </div>
                </PixelHeroMedia>
              </PixelSlideIn>
            }
          />
        ))}
      </div>
    </PixelContainer>
  );
}
`;

const bentoGrid = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { Palette } from '@pxlkit/ui';
import { ShieldCheck } from '@pxlkit/feedback';
import { SparkleStar, Trophy } from '@pxlkit/gamification';
import {
  PixelBento,
  PixelBentoCell,
  PixelStatCard,
  PixelProgress,
  PixelFadeIn,
  PixelContainer,
  PixelSectionHeader,
  PixelCluster,
  PixelStack,
} from '@pxlkit/ui-kit';

export function BentoFeatureGrid() {
  return (
    <PixelContainer as="section" maxWidth="3xl" padding="lg" aria-labelledby="bento-title">
      <PixelSectionHeader
        id="bento-title"
        align="center"
        size="md"
        title="Feature Bento"
        description="Mix and match the grid layout to highlight your key features."
      />

      <PixelFadeIn className="mt-10">
        <PixelBento columns={3} gap={4}>
          {/* Large card spanning 2 cols */}
          <PixelBentoCell span="2x1" variant="feature" tone="green">
            <AnimatedPxlKitIcon icon={SparkleStar} size={40} colorful />
            <h3 className="font-pixel text-sm text-retro-text leading-relaxed">Pixel-perfect icons</h3>
            <p className="text-retro-muted font-mono text-xs leading-relaxed">226+ SVG icons hand-crafted on a pixel grid. Crisp at any resolution.</p>
            <PixelCluster gap={3} className="mt-auto">
              <PixelStatCard label="Icons" value="226+" size="sm" />
              <PixelStatCard label="Packs" value="7" size="sm" />
            </PixelCluster>
          </PixelBentoCell>

          {/* Tall card */}
          <PixelBentoCell span="1x2" variant="feature">
            <PxlKitIcon icon={Palette} size={24} colorful />
            <h3 className="font-pixel text-xs text-retro-text leading-relaxed">Design tokens</h3>
            <p className="text-retro-muted font-mono text-xs">Complete CSS variable system.</p>
            <PixelStack gap={3} className="w-full">
              <PixelProgress value={100} label="Dark mode" tone="green" />
              <PixelProgress value={100} label="Light mode" tone="cyan" />
              <PixelProgress value={90} label="Mobile" tone="gold" />
              <PixelProgress value={85} label="Accessibility" tone="purple" />
            </PixelStack>
          </PixelBentoCell>

          {/* Small cards */}
          <PixelBentoCell span="1x1" variant="feature">
            <PxlKitIcon icon={ShieldCheck} size={24} colorful />
            <h3 className="font-pixel text-[10px] text-retro-text leading-relaxed">Type-safe</h3>
            <p className="text-retro-muted font-mono text-xs">Full TypeScript support.</p>
          </PixelBentoCell>

          <PixelBentoCell span="1x1" variant="feature" tone="gold">
            <PxlKitIcon icon={Trophy} size={24} colorful />
            <h3 className="font-pixel text-[10px] text-retro-text leading-relaxed">MIT License</h3>
            <p className="text-retro-muted font-mono text-xs">Free forever, open-source.</p>
          </PixelBentoCell>
        </PixelBento>
      </PixelFadeIn>
    </PixelContainer>
  );
}
`;

export const featuresSection: TemplateSection = {
  id: 'features',
  name: 'Feature Sections',
  description: 'Showcase your product features — icon grid, alternating rows, and bento layout.',
  icon: '✨',
  variants: [
    {
      id: 'features-icon-grid',
      name: 'Icon Feature Grid',
      description: '3-column responsive grid of feature cards, each with an icon and description.',
      installCmd: INSTALL,
      code: iconGrid,
    },
    {
      id: 'features-alternating',
      name: 'Alternating Features',
      description: 'Left/right alternating rows with badge, title, description, and animated icons.',
      installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/gamification',
      code: alternatingFeatures,
    },
    {
      id: 'features-bento',
      name: 'Bento Grid',
      description: 'CSS Grid bento layout with varying card sizes, stats, and progress bars.',
      installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/feedback @pxlkit/gamification',
      code: bentoGrid,
    },
  ],
};
