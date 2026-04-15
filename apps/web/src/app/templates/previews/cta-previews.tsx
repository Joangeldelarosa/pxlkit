'use client';

import { useState } from 'react';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Check, Package } from '@pxlkit/ui';
import { Trophy, Shield, Lightning, SparkleStar, FireSword } from '@pxlkit/gamification';
import { Globe, Community, Verified } from '@pxlkit/social';
import { CheckCircle, ShieldCheck, Mail, Sparkles } from '@pxlkit/feedback';
import {
  PixelButton,
  PixelFadeIn,
  PixelGlitch,
  PixelBounce,
  PixelStatCard,
  PixelTypewriter,
  PixelBadge,
  PixelInput,
  PixelSlideIn,
  PixelDivider,
  PixelTooltip,
  PixelPulse,
  PixelShake,
  PixelAlert,
} from '@pxlkit/ui-kit';

/* ── CTA Banner ─────────────────────────────────────────────────────────── */
export function CtaBannerPreview() {
  return (
    <section className="py-20 sm:py-28 bg-retro-green/5 border-y border-retro-green/20">
      <div className="max-w-3xl mx-auto px-6 flex flex-col items-center gap-6 text-center">
        <PixelBounce>
          <AnimatedPxlKitIcon icon={SparkleStar} size={48} colorful />
        </PixelBounce>

        <PixelGlitch>
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose">
            Start your quest
          </h2>
        </PixelGlitch>

        <p className="text-retro-text font-mono text-base sm:text-lg">
          Join <PixelTypewriter text="5,000+" speed={50} /> developers
        </p>

        <p className="text-retro-muted font-mono text-sm sm:text-base max-w-lg leading-relaxed">
          Join thousands of developers building pixel-perfect interfaces with
          production-ready retro components, icons, and animations.
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <PixelTooltip content="Growing every day" position="top">
            <PixelBadge tone="green">
              <span className="inline-flex items-center gap-1.5">
                <PxlKitIcon icon={Community} size={12} colorful />
                5,000+ devs
              </span>
            </PixelBadge>
          </PixelTooltip>
          <PixelTooltip content="Free for personal and commercial use" position="top">
            <PixelBadge tone="cyan">
              <span className="inline-flex items-center gap-1.5">
                <PxlKitIcon icon={ShieldCheck} size={12} colorful />
                MIT licensed
              </span>
            </PixelBadge>
          </PixelTooltip>
          <PixelTooltip content="Enterprise-grade reliability" position="top">
            <PixelBadge tone="gold">
              <span className="inline-flex items-center gap-1.5">
                <PxlKitIcon icon={Lightning} size={12} colorful />
                99.9% uptime
              </span>
            </PixelBadge>
          </PixelTooltip>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <PixelButton
            tone="green"
            size="lg"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
          >
            Get Started Free
          </PixelButton>
          <PixelButton tone="neutral" size="lg" variant="ghost">
            View Documentation
          </PixelButton>
        </div>
      </div>
    </section>
  );
}

/* ── CTA Split ──────────────────────────────────────────────────────────── */

const FEATURES = [
  { label: 'Tree-shakeable — zero unused code ships to production', icon: Check, tip: 'Only the components you use are bundled' },
  { label: '226+ handcrafted pixel-art SVG icons', icon: Package, tip: 'New icons added with every release' },
  { label: 'First-class TypeScript support & full SSR compatibility', icon: Shield, tip: 'Works seamlessly with Next.js and Remix' },
  { label: 'Accessible components that meet WCAG guidelines', icon: Verified, tip: 'Tested with screen readers and keyboard navigation' },
  { label: 'Active community & weekly releases', icon: Globe, tip: 'Join our Discord for support and updates' },
];

export function CtaSplitPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <PixelFadeIn>
          <div className="mb-4">
            <PixelBadge tone="purple">
              <span className="inline-flex items-center gap-1.5">
                <PxlKitIcon icon={Sparkles} size={12} colorful />
                Why Pxlkit
              </span>
            </PixelBadge>
          </div>

          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-4">
            Level up your UI
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base mb-6 leading-relaxed max-w-md">
            Blazingly fast, tree-shakeable components with pixel-art character.
            No bloat — just the essentials, done right.
          </p>

          {/* Feature list */}
          <ul className="space-y-3 mb-8">
            {FEATURES.map((f, i) => (
              <PixelTooltip key={i} content={f.tip} position="top">
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 mt-0.5">
                    <PxlKitIcon icon={f.icon} size={14} colorful />
                  </span>
                  <span className="font-mono text-sm text-retro-muted leading-relaxed">
                    {f.label}
                  </span>
                </li>
              </PixelTooltip>
            ))}
          </ul>

          <PixelButton
            tone="cyan"
            size="lg"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
          >
            Try it Now
          </PixelButton>
        </PixelFadeIn>

        <PixelSlideIn from="right">
          <div className="grid grid-cols-2 gap-4">
            <PixelPulse trigger="hover">
              <PixelStatCard label="Components" value="50+" tone="green" />
            </PixelPulse>
            <PixelPulse trigger="hover">
              <PixelStatCard label="Downloads" value="12k" tone="cyan" />
            </PixelPulse>
            <PixelPulse trigger="hover">
              <PixelStatCard label="Icons" value="226+" tone="gold" />
            </PixelPulse>
            <PixelPulse trigger="hover">
              <PixelStatCard label="Packages" value="10" tone="purple" />
            </PixelPulse>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 px-2">
            <div className="flex items-center gap-1.5">
              <PxlKitIcon icon={Trophy} size={14} colorful />
              <span className="font-mono text-xs text-retro-muted">#1 Pixel UI lib</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PxlKitIcon icon={CheckCircle} size={14} colorful />
              <span className="font-mono text-xs text-retro-muted">100% TypeScript</span>
            </div>
          </div>
        </PixelSlideIn>
      </div>
    </section>
  );
}

/* -- CTA Card -- */
export function CtaCardPreview() {
  const [signed, setSigned] = useState(false);

  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-retro-red/30 bg-retro-red/5 p-10 flex flex-col items-center gap-5 text-center">
          <PixelShake trigger={true}>
            <AnimatedPxlKitIcon icon={FireSword} size={56} colorful />
          </PixelShake>

          <h3 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose">
            <PixelTypewriter text="Join the adventure" speed={50} />
          </h3>

          <p className="text-retro-muted font-mono text-sm leading-relaxed max-w-xs">
            Get early access to new components, exclusive icon packs, and
            behind-the-scenes updates — straight to your inbox.
          </p>

          {/* Email input + submit / success state */}
          {signed ? (
            <PixelAlert
              tone="green"
              title="You are in!"
              message="Check your inbox for a confirmation link."
            />
          ) : (
            <div className="w-full flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <PixelInput
                  placeholder="you@example.com"
                  type="email"
                  tone="neutral"
                  size="lg"
                  icon={<PxlKitIcon icon={Mail} size={16} colorful />}
                />
              </div>
              <PixelButton
                tone="red"
                size="lg"
                iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
                onClick={() => setSigned(true)}
              >
                Sign Up
              </PixelButton>
            </div>
          )}

          {/* Trust indicators */}
          <PixelDivider className="my-1 w-full" />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <PxlKitIcon icon={ShieldCheck} size={12} colorful />
              <span className="font-mono text-[11px] text-retro-muted">No spam, ever</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PxlKitIcon icon={CheckCircle} size={12} colorful />
              <span className="font-mono text-[11px] text-retro-muted">Unsubscribe anytime</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PxlKitIcon icon={Community} size={12} colorful />
              <span className="font-mono text-[11px] text-retro-muted">5k+ subscribers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
