'use client';

import { useState } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Check, ArrowRight } from '@pxlkit/ui';
import { Trophy, Crown, Coin, Lightning, Gem } from '@pxlkit/gamification';
import { CheckCircle, ShieldCheck, Sparkles } from '@pxlkit/feedback';
import {
  PixelButton,
  PixelBadge,
  PixelFadeIn,
  PixelSlideIn,
  PixelDivider,
  PixelSwitch,
} from '@pxlkit/ui-kit';

type PlanTone = 'neutral' | 'green' | 'cyan';

interface Plan {
  name: string;
  description: string;
  price: string;
  period: string;
  tone: PlanTone;
  icon: typeof Coin;
  popular?: boolean;
  features: string[];
  cta: string;
}

const CARDS_PLANS: Plan[] = [
  {
    name: 'Free',
    description: 'For side projects and experiments',
    price: '$0',
    period: 'forever',
    tone: 'neutral',
    icon: Coin,
    features: [
      '50 pixel-art icons',
      '3 core packages',
      'Community Discord support',
      'Personal use license',
      '6 months of updates',
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Pro',
    description: 'For indie devs and freelancers',
    price: '$19',
    period: '/mo',
    tone: 'green',
    icon: Trophy,
    popular: true,
    features: [
      '226+ icons across all packs',
      'All 10 packages included',
      'Email &amp; priority support',
      'Commercial use license',
      'Lifetime updates',
      'Early access to new icons',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Team',
    description: 'For startups and growing teams',
    price: '$49',
    period: '/mo',
    tone: 'cyan',
    icon: Crown,
    features: [
      '226+ icons across all packs',
      'All 10 packages included',
      'Dedicated Slack channel',
      'Multi-seat team license',
      'Lifetime updates',
      'Custom icon requests',
    ],
    cta: 'Start Team Plan',
  },
];

const TONE_STYLES: Record<PlanTone, { border: string; bg: string; glow: string }> = {
  neutral: {
    border: 'border-retro-border',
    bg: 'bg-retro-surface/30',
    glow: '',
  },
  green: {
    border: 'border-retro-green/50',
    bg: 'bg-retro-green/5',
    glow: 'shadow-[0_0_30px_-5px] shadow-retro-green/20 ring-1 ring-retro-green/20',
  },
  cyan: {
    border: 'border-retro-cyan/40',
    bg: 'bg-retro-cyan/5',
    glow: '',
  },
};

/* ── Pricing Cards ──────────────────────────────────────────────────────── */
export function PricingCardsPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <PixelFadeIn>
            <PixelBadge tone="green">
              <span className="inline-flex items-center gap-1.5">
                <PxlKitIcon icon={Sparkles} size={12} colorful />
                New plans available
              </span>
            </PixelBadge>
          </PixelFadeIn>
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mt-4 mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base max-w-lg mx-auto">
            Pick the plan that fits your project. Upgrade or downgrade anytime &mdash; no lock-in.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
          {CARDS_PLANS.map((plan, idx) => (
            <PixelFadeIn key={plan.name}>
              <PixelSlideIn from={idx === 0 ? 'left' : idx === 2 ? 'right' : 'left'}>
                <div
                  className={`rounded-xl border p-8 flex flex-col h-full relative transition-all ${TONE_STYLES[plan.tone].border} ${TONE_STYLES[plan.tone].bg} ${plan.popular ? TONE_STYLES[plan.tone].glow : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <PixelBadge tone="green">
                        <span className="inline-flex items-center gap-1">
                          <PxlKitIcon icon={Lightning} size={12} colorful />
                          Most Popular
                        </span>
                      </PixelBadge>
                    </div>
                  )}

                  {/* Icon + name */}
                  <div className="text-center mb-6 pt-2">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg border border-retro-border/50 bg-retro-surface/40 mb-4">
                      <PxlKitIcon icon={plan.icon} size={32} colorful />
                    </div>
                    <h3 className="font-pixel text-lg text-retro-text mb-1">{plan.name}</h3>
                    <p className="font-mono text-xs text-retro-muted">{plan.description}</p>
                  </div>

                  <PixelDivider tone="neutral" />

                  {/* Price */}
                  <div className="flex items-baseline justify-center gap-1 my-6">
                    <span className="font-pixel text-4xl text-retro-text">{plan.price}</span>
                    <span className="font-mono text-sm text-retro-muted">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="font-mono text-sm text-retro-muted flex items-start gap-2.5">
                        <PxlKitIcon icon={CheckCircle} size={14} colorful className="flex-shrink-0 mt-0.5" />
                        <span dangerouslySetInnerHTML={{ __html: f }} />
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <PixelButton
                    tone={plan.tone}
                    size="md"
                    className="w-full justify-center"
                    iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
                  >
                    {plan.cta}
                  </PixelButton>
                </div>
              </PixelSlideIn>
            </PixelFadeIn>
          ))}
        </div>

        {/* Guarantee */}
        <div className="text-center mt-10">
          <p className="inline-flex items-center gap-2 font-mono text-xs text-retro-muted">
            <PxlKitIcon icon={ShieldCheck} size={14} colorful />
            30-day money-back guarantee &middot; Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Pricing Table ──────────────────────────────────────────────────────── */

type CellValue = true | false | string;

const TABLE_FEATURES: [string, CellValue, CellValue, CellValue][] = [
  ['Pixel-art icons', '50', '226+', '226+'],
  ['Icon packages', '3', 'All 10', 'All 10'],
  ['Projects', '1', 'Unlimited', 'Unlimited'],
  ['Commercial license', false, true, true],
  ['Priority support', false, false, true],
  ['Lifetime updates', false, true, true],
  ['Early access', false, true, true],
  ['Custom icon requests', false, false, true],
];

const TIERS = [
  { name: 'Free', icon: Coin, tone: 'text-retro-muted', recommended: false },
  { name: 'Pro', icon: Trophy, tone: 'text-retro-green', recommended: true },
  { name: 'Team', icon: Crown, tone: 'text-retro-cyan', recommended: false },
] as const;

function TableCell({ value }: { value: CellValue }) {
  if (value === true) {
    return <PxlKitIcon icon={CheckCircle} size={16} colorful />;
  }
  if (value === false) {
    return <span className="text-retro-border">&mdash;</span>;
  }
  return <>{value}</>;
}

export function PricingTablePreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3">
            Compare plans
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base">
            See what&apos;s included in each tier at a glance.
          </p>
        </div>

        {/* Table */}
        <PixelFadeIn>
          <div className="rounded-xl border border-retro-border overflow-hidden">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="border-b border-retro-border bg-retro-surface/60">
                  <th className="text-left px-6 py-4 text-retro-muted font-semibold">Feature</th>
                  {TIERS.map((tier) => (
                    <th
                      key={tier.name}
                      className={`text-center px-6 py-4 font-semibold ${tier.tone} ${tier.recommended ? 'bg-retro-green/5' : ''}`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <PxlKitIcon icon={tier.icon} size={20} colorful />
                        <span>{tier.name}</span>
                        {tier.recommended && (
                          <PixelBadge tone="green">
                            <span className="text-[10px]">Recommended</span>
                          </PixelBadge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_FEATURES.map(([feat, free, pro, team], idx) => (
                  <tr
                    key={feat}
                    className={`border-b border-retro-border/30 hover:bg-retro-surface/20 transition-colors ${
                      idx % 2 === 1 ? 'bg-retro-surface/10' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5 text-retro-text">{feat}</td>
                    <td className="text-center px-6 py-3.5 text-retro-muted">
                      <div className="flex justify-center"><TableCell value={free} /></div>
                    </td>
                    <td className="text-center px-6 py-3.5 text-retro-muted bg-retro-green/[0.02]">
                      <div className="flex justify-center"><TableCell value={pro} /></div>
                    </td>
                    <td className="text-center px-6 py-3.5 text-retro-muted">
                      <div className="flex justify-center"><TableCell value={team} /></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PixelFadeIn>
      </div>
    </section>
  );
}

/* ── Pricing Toggle ─────────────────────────────────────────────────────── */

interface TogglePlan {
  name: string;
  description: string;
  icon: typeof Coin;
  monthly: number;
  yearly: number;
  tone: PlanTone;
  features: string[];
  popular?: boolean;
}

const TOGGLE_PLANS: TogglePlan[] = [
  {
    name: 'Starter',
    description: 'Everything you need to get started',
    icon: Gem,
    monthly: 9,
    yearly: 86,
    tone: 'neutral',
    features: [
      '100 pixel-art icons',
      '5 core packages',
      'Community support',
      'Personal license',
    ],
  },
  {
    name: 'Pro',
    description: 'Best value for professionals',
    icon: Trophy,
    monthly: 29,
    yearly: 278,
    tone: 'green',
    popular: true,
    features: [
      '226+ icons, all packs',
      'All 10 packages included',
      'Priority email support',
      'Commercial license',
      'Lifetime updates',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For teams that need more',
    icon: Crown,
    monthly: 79,
    yearly: 758,
    tone: 'cyan',
    features: [
      'Everything in Pro',
      'Unlimited team seats',
      'Dedicated Slack channel',
      'Custom icon requests',
      'SLA &amp; invoicing',
    ],
  },
];

export function PricingTogglePreview() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-5">
            Choose your plan
          </h2>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-retro-surface/40 border border-retro-border rounded-lg px-5 py-3">
            <span
              className={`font-mono text-sm font-semibold transition-colors ${!isYearly ? 'text-retro-green' : 'text-retro-muted'}`}
            >
              Monthly
            </span>
            <PixelSwitch
              label=""
              checked={isYearly}
              onChange={setIsYearly}
              tone="green"
            />
            <span
              className={`font-mono text-sm font-semibold transition-colors ${isYearly ? 'text-retro-green' : 'text-retro-muted'}`}
            >
              Yearly
            </span>
            <PixelBadge tone="gold">
              <span className="inline-flex items-center gap-1">
                <PxlKitIcon icon={Lightning} size={10} colorful />
                Save 20%
              </span>
            </PixelBadge>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
          {TOGGLE_PLANS.map((plan) => {
            const price = isYearly ? plan.yearly : plan.monthly;
            const perMonth = isYearly ? Math.round(plan.yearly / 12) : plan.monthly;
            const savings = isYearly ? plan.monthly * 12 - plan.yearly : 0;

            return (
              <PixelFadeIn key={plan.name}>
                <div
                  className={`rounded-xl border p-8 flex flex-col h-full relative transition-all ${TONE_STYLES[plan.tone].border} ${TONE_STYLES[plan.tone].bg} ${plan.popular ? TONE_STYLES[plan.tone].glow : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <PixelBadge tone="green">
                        <span className="inline-flex items-center gap-1">
                          <PxlKitIcon icon={Lightning} size={12} colorful />
                          Best Value
                        </span>
                      </PixelBadge>
                    </div>
                  )}

                  <div className="text-center mb-4 pt-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg border border-retro-border/50 bg-retro-surface/40 mb-3">
                      <PxlKitIcon icon={plan.icon} size={28} colorful />
                    </div>
                    <h3 className="font-pixel text-lg text-retro-text mb-1">{plan.name}</h3>
                    <p className="font-mono text-xs text-retro-muted">{plan.description}</p>
                  </div>

                  <div className="text-center my-5">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-pixel text-4xl text-retro-text">
                        ${isYearly ? price : perMonth}
                      </span>
                      <span className="font-mono text-sm text-retro-muted">
                        {isYearly ? '/yr' : '/mo'}
                      </span>
                    </div>
                    {isYearly && (
                      <p className="font-mono text-xs text-retro-green mt-1">
                        ${perMonth}/mo &middot; You save ${savings}/yr
                      </p>
                    )}
                  </div>

                  <PixelDivider tone="neutral" />

                  <ul className="space-y-3 my-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="font-mono text-sm text-retro-muted flex items-start gap-2.5">
                        <PxlKitIcon icon={Check} size={12} className="text-retro-green flex-shrink-0 mt-0.5" />
                        <span dangerouslySetInnerHTML={{ __html: f }} />
                      </li>
                    ))}
                  </ul>

                  <PixelButton
                    tone={plan.tone}
                    size="md"
                    className="w-full justify-center"
                    iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
                  >
                    Select {plan.name}
                  </PixelButton>
                </div>
              </PixelFadeIn>
            );
          })}
        </div>

        {/* Guarantee */}
        <div className="text-center mt-10">
          <p className="inline-flex items-center gap-2 font-mono text-xs text-retro-muted">
            <PxlKitIcon icon={ShieldCheck} size={14} colorful />
            30-day money-back guarantee &middot; No questions asked
          </p>
        </div>
      </div>
    </section>
  );
}
