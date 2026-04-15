'use client';

import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { Trophy, Shield, Lightning } from '@pxlkit/gamification';
import { PixelButton, PixelFadeIn, PixelSlideIn } from '@pxlkit/ui-kit';

const FEATURES = [
  {
    icon: Trophy,
    title: 'Pixel Icons',
    desc: '226+ handcrafted pixel-art icons across 10 themed packs.',
    tone: 'gold',
    border: 'border-retro-gold/30 bg-retro-gold/5',
  },
  {
    icon: Shield,
    title: 'Accessible',
    desc: 'ARIA-ready by default. Every component ships with proper roles.',
    tone: 'cyan',
    border: 'border-retro-cyan/30 bg-retro-cyan/5',
  },
  {
    icon: Lightning,
    title: 'Fast & Tiny',
    desc: 'Tree-shakeable imports. Zero unused code in your bundle.',
    tone: 'green',
    border: 'border-retro-green/30 bg-retro-green/5',
  },
];

/* ── Features Icon Grid ─────────────────────────────────────────────────── */
export function FeaturesIconGridPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3">
            Everything you need
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base max-w-lg mx-auto">
            Build retro UIs with the components and icons that make your product stand out.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <PixelFadeIn key={f.title}>
              <div className={`rounded-xl border p-8 text-center h-full ${f.border}`}>
                <div className="flex justify-center mb-5">
                  <PxlKitIcon icon={f.icon} size={40} colorful />
                </div>
                <h3 className="font-pixel text-base text-retro-text mb-3">{f.title}</h3>
                <p className="font-mono text-sm text-retro-muted leading-relaxed">{f.desc}</p>
              </div>
            </PixelFadeIn>
          ))}
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
        <div className="text-center mb-14">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3">
            Built to last
          </h2>
        </div>

        <div className="space-y-10">
          {FEATURES.map((f, i) => (
            <PixelSlideIn key={f.title} from={i % 2 === 0 ? 'left' : 'right'}>
              <div
                className={`flex flex-col sm:flex-row items-center gap-8 ${
                  i % 2 === 1 ? 'sm:flex-row-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-24 h-24 rounded-xl border ${f.border} flex items-center justify-center`}>
                  <PxlKitIcon icon={f.icon} size={44} colorful />
                </div>
                <div>
                  <h3 className="font-pixel text-base sm:text-lg text-retro-text mb-2">
                    {f.title}
                  </h3>
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3">
            Features
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base">
            Everything in one toolkit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Large featured card */}
          <div className="sm:row-span-2 rounded-xl border border-retro-green/30 bg-retro-green/5 p-8 flex flex-col justify-between">
            <div>
              <PxlKitIcon icon={Trophy} size={44} colorful />
              <h3 className="font-pixel text-base sm:text-lg text-retro-text mt-5 mb-3">
                Pixel Icons
              </h3>
              <p className="font-mono text-sm text-retro-muted leading-relaxed">
                226+ handcrafted pixel icons across 10 themed packs. Colorful, monochrome,
                animated — all SVG, all tree-shakeable.
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

          {/* Small card 1 */}
          <div className="rounded-xl border border-retro-cyan/30 bg-retro-cyan/5 p-6">
            <PxlKitIcon icon={Shield} size={36} colorful />
            <h3 className="font-pixel text-sm text-retro-text mt-4 mb-2">Accessible</h3>
            <p className="font-mono text-sm text-retro-muted leading-relaxed">
              ARIA-ready by default, keyboard navigable.
            </p>
          </div>

          {/* Small card 2 */}
          <div className="rounded-xl border border-retro-border bg-retro-surface/30 p-6">
            <PxlKitIcon icon={Lightning} size={36} colorful />
            <h3 className="font-pixel text-sm text-retro-text mt-4 mb-2">Fast</h3>
            <p className="font-mono text-sm text-retro-muted leading-relaxed">
              Tree-shakeable. Zero unused code in your bundle.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
