'use client';

import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Package, Settings, Search } from '@pxlkit/ui';
import { Trophy, Shield, Lightning, Crown, Gem, MagicWand, SparkleStar } from '@pxlkit/gamification';
import { Globe } from '@pxlkit/social';
import { ShieldCheck, Sparkles } from '@pxlkit/feedback';
import {
  PixelButton,
  PixelBadge,
  PixelFadeIn,
  PixelSlideIn,
  PixelStatCard,
  PixelFloat,
} from '@pxlkit/ui-kit';

/* ── Shared data ────────────────────────────────────────────────────────── */

const GRID_FEATURES = [
  {
    icon: Trophy,
    title: 'Pixel Icons',
    desc: '226+ handcrafted pixel-art icons spanning 10 themed packs — retro charm, modern quality.',
    border: 'border-retro-gold/30 bg-retro-gold/5',
  },
  {
    icon: Shield,
    title: 'Accessible',
    desc: 'ARIA-ready by default. Every component ships with proper roles and keyboard navigation.',
    border: 'border-retro-cyan/30 bg-retro-cyan/5',
  },
  {
    icon: Lightning,
    title: 'Fast & Tiny',
    desc: 'Tree-shakeable imports ensure zero unused code reaches your production bundle.',
    border: 'border-retro-green/30 bg-retro-green/5',
  },
  {
    icon: Package,
    title: 'Modular Packs',
    desc: 'Install only what you need — UI, gamification, social, weather, and more.',
    border: 'border-retro-purple/30 bg-retro-purple/5',
  },
  {
    icon: Globe,
    title: 'Framework Agnostic',
    desc: 'Works with React, Next.js, Remix, and any component-driven framework out of the box.',
    border: 'border-retro-red/30 bg-retro-red/5',
  },
  {
    icon: Sparkles,
    title: 'Animations Built-in',
    desc: 'Fade, bounce, float, pulse — rich animation primitives with zero extra dependencies.',
    border: 'border-retro-gold/30 bg-retro-gold/5',
  },
];

const ALT_FEATURES = [
  {
    icon: Crown,
    accentIcon: SparkleStar,
    title: 'Premium Icon Library',
    desc: '226+ pixel-perfect icons across 10 themed packs. Every icon available in colorful, monochrome, and animated variants.',
    stat: { label: 'Icons', value: '226+' },
    tone: 'gold' as const,
    border: 'border-retro-gold/30 bg-retro-gold/5',
  },
  {
    icon: ShieldCheck,
    accentIcon: null,
    title: 'Accessibility First',
    desc: 'Full ARIA support, keyboard navigation, and screen-reader-friendly markup. Built to WCAG 2.1 AA standards.',
    stat: { label: 'WCAG', value: 'AA' },
    tone: 'cyan' as const,
    border: 'border-retro-cyan/30 bg-retro-cyan/5',
  },
  {
    icon: Lightning,
    accentIcon: null,
    title: 'Blazing Performance',
    desc: 'Tree-shakeable ESM exports, automatic dead-code elimination, and sub-kilobyte per-icon footprint.',
    stat: { label: 'Per icon', value: '<1kb' },
    tone: 'green' as const,
    border: 'border-retro-green/30 bg-retro-green/5',
  },
  {
    icon: MagicWand,
    accentIcon: SparkleStar,
    title: 'Animation Primitives',
    desc: 'Fade, slide, bounce, float, pulse, zoom — composable motion building blocks with zero runtime overhead.',
    stat: { label: 'Animations', value: '8+' },
    tone: 'purple' as const,
    border: 'border-retro-purple/30 bg-retro-purple/5',
  },
];

/* ── Features Icon Grid ─────────────────────────────────────────────────── */
export function FeaturesIconGridPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <PixelBadge tone="green">
            <PxlKitIcon icon={Gem} size={12} colorful />
            <span className="ml-1.5">Core Features</span>
          </PixelBadge>
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3 mt-4">
            Everything you need to ship
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base max-w-xl mx-auto">
            A complete pixel-art design system — icons, components, animations, and utilities — all
            crafted to make your product stand out.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GRID_FEATURES.map((f, i) => (
            <PixelFadeIn key={f.title} delay={i * 80}>
              <div
                className={`rounded-xl border p-8 text-center h-full transition-shadow hover:shadow-lg ${f.border}`}
              >
                <div className="flex justify-center mb-5">
                  <PxlKitIcon icon={f.icon} size={40} colorful />
                </div>
                <h3 className="font-pixel text-base text-retro-text mb-3">{f.title}</h3>
                <p className="font-mono text-sm text-retro-muted leading-relaxed">{f.desc}</p>
              </div>
            </PixelFadeIn>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <PixelButton
            tone="green"
            size="md"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
          >
            Browse all features
          </PixelButton>
        </div>
      </div>
    </section>
  );
}

/* ── Features Alternating ───────────────────────────────────────────────── */
export function FeaturesAlternatingPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3">
            Built to last
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base max-w-lg mx-auto">
            Every layer of PxlKit is designed for longevity, performance, and developer happiness.
          </p>
        </div>

        <div className="space-y-14">
          {ALT_FEATURES.map((f, i) => (
            <PixelSlideIn key={f.title} from={i % 2 === 0 ? 'left' : 'right'}>
              <div
                className={`flex flex-col sm:flex-row items-center gap-8 ${
                  i % 2 === 1 ? 'sm:flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`relative flex-shrink-0 w-28 h-28 rounded-xl border ${f.border} flex items-center justify-center`}
                >
                  <PxlKitIcon icon={f.icon} size={48} colorful />
                  {f.accentIcon && (
                    <span className="absolute -top-2 -right-2">
                      <PixelFloat duration={2800} distance={4}>
                        <AnimatedPxlKitIcon icon={f.accentIcon} size={18} colorful />
                      </PixelFloat>
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-pixel text-base sm:text-lg text-retro-text">{f.title}</h3>
                    <PixelBadge tone={f.tone}>{f.stat.label}: {f.stat.value}</PixelBadge>
                  </div>
                  <p className="font-mono text-sm sm:text-base text-retro-muted leading-relaxed max-w-md">
                    {f.desc}
                  </p>
                </div>
              </div>
            </PixelSlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features Bento Grid ────────────────────────────────────────────────── */
export function FeaturesBentoPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3">
            The full toolkit
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base max-w-lg mx-auto">
            Icons, components, animations, and utilities — everything in one pixel-perfect package.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Large featured card — spans 2 rows */}
          <div className="sm:row-span-2 rounded-xl border border-retro-green/30 bg-retro-green/5 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <PxlKitIcon icon={Crown} size={44} colorful />
                <PixelBadge tone="gold">
                  <PxlKitIcon icon={Trophy} size={10} colorful />
                  <span className="ml-1">Flagship</span>
                </PixelBadge>
              </div>
              <h3 className="font-pixel text-base sm:text-lg text-retro-text mb-3">
                Pixel Icon Library
              </h3>
              <p className="font-mono text-sm text-retro-muted leading-relaxed">
                226+ handcrafted pixel icons across 10 themed packs. Available in colorful,
                monochrome, and animated variants — all SVG, all tree-shakeable.
              </p>
            </div>
            <PixelButton
              tone="green"
              size="md"
              iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
              className="mt-6 self-start"
            >
              Browse Icons
            </PixelButton>
          </div>

          {/* Medium card with stat — Accessibility */}
          <div className="rounded-xl border border-retro-cyan/30 bg-retro-cyan/5 p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <PxlKitIcon icon={ShieldCheck} size={36} colorful />
              <PixelBadge tone="cyan">WCAG AA</PixelBadge>
            </div>
            <div>
              <h3 className="font-pixel text-sm text-retro-text mb-2">Accessible</h3>
              <p className="font-mono text-sm text-retro-muted leading-relaxed">
                ARIA-ready with full keyboard navigation and screen-reader support.
              </p>
            </div>
          </div>

          {/* Medium card with stat — Performance */}
          <div className="rounded-xl border border-retro-purple/30 bg-retro-purple/5 p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <PxlKitIcon icon={Lightning} size={36} colorful />
              <PixelBadge tone="purple">&lt;1kb each</PixelBadge>
            </div>
            <div>
              <h3 className="font-pixel text-sm text-retro-text mb-2">Blazing Fast</h3>
              <p className="font-mono text-sm text-retro-muted leading-relaxed">
                Tree-shakeable ESM. Zero unused code in your production bundle.
              </p>
            </div>
          </div>

          {/* Wide stat row spanning 2 columns */}
          <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <PixelStatCard label="Icons" value="226+" tone="gold" />
            <PixelStatCard label="Packs" value="10" tone="green" />
            <PixelStatCard label="Components" value="50+" tone="cyan" />
          </div>

          {/* Small compact card — Modular */}
          <div className="rounded-xl border border-retro-gold/30 bg-retro-gold/5 p-5 flex items-center gap-4">
            <PxlKitIcon icon={Package} size={28} colorful />
            <div>
              <h3 className="font-pixel text-xs text-retro-text mb-1">Modular</h3>
              <p className="font-mono text-xs text-retro-muted">Install only the packs you need.</p>
            </div>
          </div>

          {/* Small compact card — Searchable */}
          <div className="rounded-xl border border-retro-border bg-retro-surface/30 p-5 flex items-center gap-4">
            <PxlKitIcon icon={Search} size={28} colorful />
            <div>
              <h3 className="font-pixel text-xs text-retro-text mb-1">Searchable</h3>
              <p className="font-mono text-xs text-retro-muted">Find any icon in milliseconds.</p>
            </div>
          </div>

          {/* Small compact card — Configurable */}
          <div className="rounded-xl border border-retro-red/30 bg-retro-red/5 p-5 flex items-center gap-4">
            <PxlKitIcon icon={Settings} size={28} colorful />
            <div>
              <h3 className="font-pixel text-xs text-retro-text mb-1">Configurable</h3>
              <p className="font-mono text-xs text-retro-muted">Size, color, tone — fully yours.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
