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
  PixelContainer,
  PixelSectionHeader,
  PixelCluster,
  PixelStack,
  PixelCenter,
} from '@pxlkit/ui-kit';

/* ── CTA Banner ─────────────────────────────────────────────────────────── */
export function CtaBannerPreview() {
  return (
    <PixelContainer
      maxWidth="md"
      padding="xl"
      className="bg-retro-green/5 border-y border-retro-green/20"
    >
      <PixelStack gap={6} align="center" className="text-center">
        <PixelBounce>
          <AnimatedPxlKitIcon icon={SparkleStar} size={48} colorful />
        </PixelBounce>

        <PixelGlitch>
          <h2 className="font-pixel text-xl sm:text-2xl md:text-3xl text-retro-text leading-loose break-words">
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
        <PixelCluster gap={3} justify="center">
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
        </PixelCluster>

        {/* Action buttons */}
        <PixelCluster gap={3} justify="center" className="mt-2">
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
        </PixelCluster>
      </PixelStack>
    </PixelContainer>
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
    <PixelContainer maxWidth="xl" padding="xl" className="bg-retro-bg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <PixelFadeIn>
          <div className="mb-4">
            <PixelBadge tone="purple">
              <span className="inline-flex items-center gap-1.5">
                <PxlKitIcon icon={Sparkles} size={12} colorful />
                Why Pxlkit
              </span>
            </PixelBadge>
          </div>

          <PixelSectionHeader
            size="md"
            spacing="tight"
            title="Level up your UI"
            description="Blazingly fast, tree-shakeable components with pixel-art character. No bloat — just the essentials, done right."
          />

          {/* Feature list */}
          <ul className="space-y-3 mb-8 mt-6">
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
          <PixelCluster gap={4} justify="center" className="mt-4 px-2">
            <div className="flex items-center gap-1.5">
              <PxlKitIcon icon={Trophy} size={14} colorful />
              <span className="font-mono text-xs text-retro-muted">#1 Pixel UI lib</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PxlKitIcon icon={CheckCircle} size={14} colorful />
              <span className="font-mono text-xs text-retro-muted">100% TypeScript</span>
            </div>
          </PixelCluster>
        </PixelSlideIn>
      </div>
    </PixelContainer>
  );
}

/* -- CTA Card -- */
export function CtaCardPreview() {
  const [signed, setSigned] = useState(false);

  return (
    <PixelContainer maxWidth="xl" padding="xl" className="bg-retro-bg">
      <PixelCenter maxWidth="sm" gutter={0}>
        <PixelStack
          gap={5}
          align="center"
          className="rounded-xl border border-retro-red/30 bg-retro-red/5 p-10 text-center"
        >
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
          <PixelCluster gap={4} justify="center">
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
          </PixelCluster>
        </PixelStack>
      </PixelCenter>
    </PixelContainer>
  );
}
