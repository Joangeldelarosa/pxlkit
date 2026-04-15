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

/* ── CTA Banner ───────────────────────────────────────────────────────── */
export function CtaBannerPreview() {
  return (
    <section className="py-10 bg-retro-green/5 border-y border-retro-green/20">
      <div className="max-w-lg mx-auto px-4 text-center">
        <PixelBounce>
          <AnimatedPxlKitIcon icon={SparkleStar} size={36} colorful />
        </PixelBounce>
        <PixelGlitch>
          <h2 className="font-pixel text-base text-retro-text leading-loose mt-3 mb-2">
            Start your quest
          </h2>
        </PixelGlitch>
        <p className="text-retro-muted font-mono text-xs mb-5">
          Join 5,000+ developers building with pixel-perfect components.
        </p>
        <PixelButton tone="green" size="md">
          Get Started Free
          <PxlKitIcon icon={ArrowRight} size={12} className="ml-1" />
        </PixelButton>
      </div>
    </section>
  );
}

/* ── CTA Split ────────────────────────────────────────────────────────── */
export function CtaSplitPreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center max-w-xl mx-auto">
        <div>
          <h2 className="font-pixel text-base text-retro-text leading-loose mb-2">
            Level up your UI
          </h2>
          <p className="text-retro-muted font-mono text-xs mb-4">
            Blazingly fast components with retro character.
          </p>
          <PixelButton tone="cyan" size="md">
            Try it Now
            <PxlKitIcon icon={ArrowRight} size={12} className="ml-1" />
          </PixelButton>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <PixelStatCard label="Components" value="50+" tone="green" />
          <PixelStatCard label="Downloads" value="12k" tone="cyan" />
        </div>
      </div>
    </section>
  );
}

/* ── CTA Card ─────────────────────────────────────────────────────────── */
export function CtaCardPreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="max-w-sm mx-auto">
        <div className="rounded-xl border border-retro-red/30 bg-retro-red/5 p-4">
          <div className="text-center py-4">
            <PixelBounce>
              <AnimatedPxlKitIcon icon={FireSword} size={36} colorful />
            </PixelBounce>
            <h3 className="font-pixel text-sm text-retro-text leading-loose mt-3 mb-1">
              <PixelTypewriter text="Join the adventure" speed={50} />
            </h3>
            <p className="text-retro-muted font-mono text-xs mb-4">
              Get early access to new components and icons.
            </p>
            <PixelButton tone="red" size="md">
              Sign Up
              <PxlKitIcon icon={ArrowRight} size={12} className="ml-1" />
            </PixelButton>
          </div>
        </div>
      </div>
    </section>
  );
}
