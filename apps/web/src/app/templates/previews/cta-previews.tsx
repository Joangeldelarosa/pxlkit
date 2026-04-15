'use client';

import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { SparkleStar, FireSword } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelFadeIn,
  PixelGlitch,
  PixelBounce,
  PixelStatCard,
  PixelTypewriter,
} from '@pxlkit/ui-kit';

/* ── CTA Banner ─────────────────────────────────────────────────────────── */
export function CtaBannerPreview() {
  return (
    <section className="py-20 sm:py-28 bg-retro-green/5 border-y border-retro-green/20">
      <div className="max-w-2xl mx-auto px-6 flex flex-col items-center gap-6 text-center">
        <PixelBounce>
          <AnimatedPxlKitIcon icon={SparkleStar} size={48} colorful />
        </PixelBounce>
        <PixelGlitch>
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose">
            Start your quest
          </h2>
        </PixelGlitch>
        <p className="text-retro-muted font-mono text-sm sm:text-base max-w-lg leading-relaxed">
          Join 5,000+ developers building pixel-perfect interfaces with
          production-ready retro components.
        </p>
        <PixelButton
          tone="green"
          size="lg"
          iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
        >
          Get Started Free
        </PixelButton>
      </div>
    </section>
  );
}

/* ── CTA Split ──────────────────────────────────────────────────────────── */
export function CtaSplitPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <PixelFadeIn>
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-4">
            Level up your UI
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base mb-7 leading-relaxed max-w-md">
            Blazingly fast, tree-shakeable components with pixel-art character.
            No bloat — just the essentials, done right.
          </p>
          <PixelButton
            tone="cyan"
            size="lg"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
          >
            Try it Now
          </PixelButton>
        </PixelFadeIn>

        <div className="grid grid-cols-2 gap-4">
          <PixelStatCard label="Components" value="50+" tone="green" />
          <PixelStatCard label="Downloads" value="12k" tone="cyan" />
          <PixelStatCard label="Icons" value="226+" tone="gold" />
          <PixelStatCard label="Packages" value="10" tone="purple" />
        </div>
      </div>
    </section>
  );
}

/* ── CTA Card ───────────────────────────────────────────────────────────── */
export function CtaCardPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-retro-red/30 bg-retro-red/5 p-8 flex flex-col items-center gap-5 text-center">
          <PixelBounce>
            <AnimatedPxlKitIcon icon={FireSword} size={48} colorful />
          </PixelBounce>
          <h3 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose">
            <PixelTypewriter text="Join the adventure" speed={50} />
          </h3>
          <p className="text-retro-muted font-mono text-sm leading-relaxed max-w-xs">
            Get early access to new components and exclusive icon packs.
          </p>
          <PixelButton
            tone="red"
            size="lg"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
          >
            Sign Up Free
          </PixelButton>
        </div>
      </div>
    </section>
  );
}
