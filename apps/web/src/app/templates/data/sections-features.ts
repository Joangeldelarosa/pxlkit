import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/feedback';

const iconGrid = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon } from '@pxlkit/core';
import { Package, Palette, CloudSync, Settings } from '@pxlkit/ui';
import { ShieldCheck, Sparkles, Bell } from '@pxlkit/feedback';
import {
  PixelCard,
  PixelFadeIn,
  PixelSection,
  PixelDivider,
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
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mb-3">
            Everything you need
          </h2>
          <p className="text-retro-muted font-mono text-sm max-w-xl mx-auto">
            A complete ecosystem for building beautiful retro React interfaces.
          </p>
        </div>
        <PixelDivider tone="neutral" spacing="md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <PixelFadeIn key={f.title} delay={i * 80}>
              <PixelCard className="p-6 h-full">
                <div className="mb-4">
                  <PxlKitIcon icon={f.icon} size={24} colorful />
                </div>
                <h3 className="font-pixel text-xs text-retro-text mb-2 leading-relaxed">
                  {f.title}
                </h3>
                <p className="text-retro-muted font-mono text-xs leading-relaxed">
                  {f.description}
                </p>
              </PixelCard>
            </PixelFadeIn>
          ))}
        </div>
      </div>
    </PixelSection>
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
  PixelFadeIn,
  PixelBadge,
  PixelSection,
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
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={\`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center \${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}\`}
          >
            {/* Text side */}
            <PixelSlideIn direction={i % 2 === 0 ? 'left' : 'right'}>
              <PixelBadge tone={f.tone} className="mb-4 inline-block">
                {f.badge}
              </PixelBadge>
              <h3 className="font-pixel text-base sm:text-xl text-retro-text leading-loose mb-4">
                {f.title}
              </h3>
              <p className="text-retro-muted font-mono text-sm leading-relaxed">
                {f.description}
              </p>
            </PixelSlideIn>

            {/* Icon side */}
            <PixelSlideIn direction={i % 2 === 0 ? 'right' : 'left'}>
              <div className={\`flex items-center justify-center h-48 rounded-sm border border-retro-border bg-retro-surface/30 \${i % 2 === 1 ? 'lg:order-first' : ''}\`}>
                <AnimatedPxlKitIcon icon={f.icon} size={80} colorful />
              </div>
            </PixelSlideIn>
          </div>
        ))}
      </div>
    </PixelSection>
  );
}
`;

const bentoGrid = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { Package, Palette } from '@pxlkit/ui';
import { ShieldCheck, Sparkles } from '@pxlkit/feedback';
import { SparkleStar, Trophy } from '@pxlkit/gamification';
import {
  PixelCard,
  PixelStatCard,
  PixelProgress,
  PixelFadeIn,
  PixelSection,
} from '@pxlkit/ui-kit';

export function BentoFeatureGrid() {
  return (
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mb-3">
            Feature Bento
          </h2>
          <p className="text-retro-muted font-mono text-sm max-w-lg mx-auto">
            Mix and match the grid layout to highlight your key features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
          {/* Large card spanning 2 cols */}
          <PixelFadeIn className="md:col-span-2" delay={0}>
            <PixelCard className="h-full p-8 flex flex-col justify-between bg-retro-green/5 border-retro-green/20 min-h-48">
              <div>
                <AnimatedPxlKitIcon icon={SparkleStar} size={40} colorful />
                <h3 className="font-pixel text-sm text-retro-text mt-4 mb-2 leading-relaxed">Pixel-perfect icons</h3>
                <p className="text-retro-muted font-mono text-xs leading-relaxed">226+ SVG icons hand-crafted on a pixel grid. Crisp at any resolution.</p>
              </div>
              <div className="mt-6 flex gap-3">
                <PixelStatCard label="Icons" value="226+" compact />
                <PixelStatCard label="Packs" value="7" compact />
              </div>
            </PixelCard>
          </PixelFadeIn>

          {/* Tall card */}
          <PixelFadeIn className="md:row-span-2" delay={100}>
            <PixelCard className="h-full p-6 flex flex-col gap-6 min-h-96">
              <div>
                <PxlKitIcon icon={Palette} size={24} colorful />
                <h3 className="font-pixel text-xs text-retro-text mt-3 mb-2 leading-relaxed">Design tokens</h3>
                <p className="text-retro-muted font-mono text-xs">Complete CSS variable system.</p>
              </div>
              <div className="space-y-3">
                <PixelProgress value={100} label="Dark mode" tone="green" />
                <PixelProgress value={100} label="Light mode" tone="cyan" />
                <PixelProgress value={90} label="Mobile" tone="gold" />
                <PixelProgress value={85} label="Accessibility" tone="purple" />
              </div>
            </PixelCard>
          </PixelFadeIn>

          {/* Small cards */}
          <PixelFadeIn delay={150}>
            <PixelCard className="p-5 h-full min-h-36">
              <PxlKitIcon icon={ShieldCheck} size={24} colorful />
              <h3 className="font-pixel text-[10px] text-retro-text mt-3 mb-1 leading-relaxed">Type-safe</h3>
              <p className="text-retro-muted font-mono text-xs">Full TypeScript support.</p>
            </PixelCard>
          </PixelFadeIn>

          <PixelFadeIn delay={200}>
            <PixelCard className="p-5 h-full bg-retro-gold/5 border-retro-gold/20 min-h-36">
              <PxlKitIcon icon={Trophy} size={24} colorful />
              <h3 className="font-pixel text-[10px] text-retro-text mt-3 mb-1 leading-relaxed">MIT License</h3>
              <p className="text-retro-muted font-mono text-xs">Free forever, open-source.</p>
            </PixelCard>
          </PixelFadeIn>
        </div>
      </div>
    </PixelSection>
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
