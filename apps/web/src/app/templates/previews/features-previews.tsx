'use client';

import { useState } from 'react';
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
  PixelTooltip,
  PixelChip,
  PixelProgress,
  PixelPulse,
} from '@pxlkit/ui-kit';

/* ── Shared data ────────────────────────────────────────────────────────── */

const GRID_FEATURES = [
  {
    icon: Trophy,
    iconPack: 'Gamification Pack',
    title: 'Pixel Icons',
    desc: '226+ handcrafted pixel-art icons spanning 10 themed packs — retro charm, modern quality.',
    detail: 'Each icon is hand-drawn on a pixel grid and exported as optimized SVG. Available in colorful, monochrome, and animated variants across UI, gamification, social, weather, and more.',
    border: 'border-retro-gold/30 bg-retro-gold/5',
  },
  {
    icon: Shield,
    iconPack: 'Gamification Pack',
    title: 'Accessible',
    desc: 'ARIA-ready by default. Every component ships with proper roles and keyboard navigation.',
    detail: 'Built to WCAG 2.1 AA standards with full screen-reader support. Focus management, keyboard navigation, and semantic HTML are baked into every component.',
    border: 'border-retro-cyan/30 bg-retro-cyan/5',
  },
  {
    icon: Lightning,
    iconPack: 'Gamification Pack',
    title: 'Fast & Tiny',
    desc: 'Tree-shakeable imports ensure zero unused code reaches your production bundle.',
    detail: 'Each icon weighs under 1kb gzipped. ESM exports allow bundlers to eliminate unused icons automatically. Zero runtime dependencies.',
    border: 'border-retro-green/30 bg-retro-green/5',
  },
  {
    icon: Package,
    iconPack: 'UI Pack',
    title: 'Modular Packs',
    desc: 'Install only what you need — UI, gamification, social, weather, and more.',
    detail: 'Ten themed icon packs can be installed independently. Mix and match packs without bloating your bundle. Each pack has its own NPM package.',
    border: 'border-retro-purple/30 bg-retro-purple/5',
  },
  {
    icon: Globe,
    iconPack: 'Social Pack',
    title: 'Framework Agnostic',
    desc: 'Works with React, Next.js, Remix, and any component-driven framework out of the box.',
    detail: 'Pure React components with zero framework-specific code. Compatible with SSR, RSC, and any bundler. Drop-in support for Vite, Webpack, and Turbopack.',
    border: 'border-retro-red/30 bg-retro-red/5',
  },
  {
    icon: Sparkles,
    iconPack: 'Feedback Pack',
    title: 'Animations Built-in',
    desc: 'Fade, bounce, float, pulse — rich animation primitives with zero extra dependencies.',
    detail: 'Composable animation wrappers that work with any content. CSS-based for maximum performance. Configurable duration, delay, and trigger modes.',
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
    chips: [
      { label: 'SVG', tone: 'gold' as const },
      { label: 'Tree-shakeable', tone: 'green' as const },
    ],
    adoption: 95,
  },
  {
    icon: ShieldCheck,
    accentIcon: null,
    title: 'Accessibility First',
    desc: 'Full ARIA support, keyboard navigation, and screen-reader-friendly markup. Built to WCAG 2.1 AA standards.',
    stat: { label: 'WCAG', value: 'AA' },
    tone: 'cyan' as const,
    border: 'border-retro-cyan/30 bg-retro-cyan/5',
    chips: [
      { label: 'ARIA', tone: 'cyan' as const },
      { label: 'Keyboard Nav', tone: 'purple' as const },
    ],
    adoption: 88,
  },
  {
    icon: Lightning,
    accentIcon: null,
    title: 'Blazing Performance',
    desc: 'Tree-shakeable ESM exports, automatic dead-code elimination, and sub-kilobyte per-icon footprint.',
    stat: { label: 'Per icon', value: '<1kb' },
    tone: 'green' as const,
    border: 'border-retro-green/30 bg-retro-green/5',
    chips: [
      { label: 'ESM', tone: 'green' as const },
      { label: 'TypeScript', tone: 'cyan' as const },
    ],
    adoption: 92,
  },
  {
    icon: MagicWand,
    accentIcon: SparkleStar,
    title: 'Animation Primitives',
    desc: 'Fade, slide, bounce, float, pulse, zoom — composable motion building blocks with zero runtime overhead.',
    stat: { label: 'Animations', value: '8+' },
    tone: 'purple' as const,
    border: 'border-retro-purple/30 bg-retro-purple/5',
    chips: [
      { label: 'React', tone: 'cyan' as const },
      { label: 'CSS-based', tone: 'gold' as const },
    ],
    adoption: 78,
  },
];

/* ── Features Icon Grid ─────────────────────────────────────────────────── */
export function FeaturesIconGridPreview() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

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
                role="button"
                tabIndex={0}
                onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedIdx(selectedIdx === i ? null : i);
                  }
                }}
                className={`relative rounded-xl border p-8 text-center h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.03] ${f.border} ${
                  selectedIdx === i ? 'ring-2 ring-retro-green shadow-lg scale-[1.02]' : ''
                }`}
              >
                {i === 0 && (
                  <span className="absolute -top-2 -right-2">
                    <PixelBadge tone="gold">Featured</PixelBadge>
                  </span>
                )}
                <div className="flex justify-center mb-5">
                  <PixelTooltip content={f.iconPack} position="top">
                    <PxlKitIcon icon={f.icon} size={40} colorful />
                  </PixelTooltip>
                </div>
                <h3 className="font-pixel text-base text-retro-text mb-3">{f.title}</h3>
                <p className="font-mono text-sm text-retro-muted leading-relaxed">{f.desc}</p>
              </div>
            </PixelFadeIn>
          ))}
        </div>

        {selectedIdx !== null && (
          <PixelFadeIn>
            <div className="mt-8 rounded-xl border border-retro-green/30 bg-retro-green/5 p-6">
              <div className="flex items-center gap-3 mb-3">
                <PxlKitIcon icon={GRID_FEATURES[selectedIdx].icon} size={28} colorful />
                <h3 className="font-pixel text-base text-retro-text">
                  {GRID_FEATURES[selectedIdx].title}
                </h3>
              </div>
              <p className="font-mono text-sm text-retro-muted leading-relaxed">
                {GRID_FEATURES[selectedIdx].detail}
              </p>
            </div>
          </PixelFadeIn>
        )}

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
                    <PixelPulse>
                      <PixelBadge tone={f.tone}>{f.stat.label}: {f.stat.value}</PixelBadge>
                    </PixelPulse>
                  </div>
                  <p className="font-mono text-sm sm:text-base text-retro-muted leading-relaxed max-w-md mb-3">
                    {f.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {f.chips.map((c) => (
                      <PixelChip key={c.label} label={c.label} tone={c.tone} />
                    ))}
                  </div>
                  <PixelProgress value={f.adoption} tone={f.tone} label="Adoption" showValue />
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
          <div className="sm:row-span-2 rounded-xl border border-retro-green/30 bg-retro-green/5 p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,222,128,0.15)] hover:border-retro-green/50">
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
          <div className="relative rounded-xl border border-retro-purple/30 bg-retro-purple/5 p-6 flex flex-col gap-4">
            <span className="absolute -top-2 -right-2">
              <PixelBadge tone="green">New</PixelBadge>
            </span>
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

          {/* Wide stat row spanning 2 columns — staggered fade-in */}
          <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <PixelFadeIn delay={0}>
              <PixelStatCard label="Icons" value="226+" tone="gold" />
            </PixelFadeIn>
            <PixelFadeIn delay={100}>
              <PixelStatCard label="Packs" value="10" tone="green" />
            </PixelFadeIn>
            <PixelFadeIn delay={200}>
              <PixelStatCard label="Components" value="50+" tone="cyan" />
            </PixelFadeIn>
          </div>

          {/* Small compact card — Modular */}
          <PixelTooltip content="Import individual packs to keep bundles small" position="top">
            <div className="rounded-xl border border-retro-gold/30 bg-retro-gold/5 p-5 flex items-center gap-4">
              <PxlKitIcon icon={Package} size={28} colorful />
              <div>
                <h3 className="font-pixel text-xs text-retro-text mb-1">Modular</h3>
                <p className="font-mono text-xs text-retro-muted">Install only the packs you need.</p>
              </div>
            </div>
          </PixelTooltip>

          {/* Small compact card — Searchable */}
          <PixelTooltip content="Built-in fuzzy search across all icon packs" position="top">
            <div className="rounded-xl border border-retro-border bg-retro-surface/30 p-5 flex items-center gap-4">
              <PxlKitIcon icon={Search} size={28} colorful />
              <div>
                <h3 className="font-pixel text-xs text-retro-text mb-1">Searchable</h3>
                <p className="font-mono text-xs text-retro-muted">Find any icon in milliseconds.</p>
              </div>
            </div>
          </PixelTooltip>

          {/* Small compact card — Configurable */}
          <PixelTooltip content="Customize size, color, tone, and animation per icon" position="top">
            <div className="rounded-xl border border-retro-red/30 bg-retro-red/5 p-5 flex items-center gap-4">
              <PxlKitIcon icon={Settings} size={28} colorful />
              <div>
                <h3 className="font-pixel text-xs text-retro-text mb-1">Configurable</h3>
                <p className="font-mono text-xs text-retro-muted">Size, color, tone — fully yours.</p>
              </div>
            </div>
          </PixelTooltip>
        </div>
      </div>
    </section>
  );
}
