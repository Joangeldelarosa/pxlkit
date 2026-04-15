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
  PixelTooltip,
  PixelTextLink,
  PixelBounce,
} from '@pxlkit/ui-kit';

type PlanTone = 'neutral' | 'green' | 'cyan';

interface PlanFeature {
  label: string;
  tooltip: string;
  html?: boolean;
}

interface Plan {
  name: string;
  description: string;
  price: string;
  period: string;
  tone: PlanTone;
  icon: typeof Coin;
  popular?: boolean;
  features: PlanFeature[];
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
      { label: '50 pixel-art icons', tooltip: 'Hand-crafted pixel icons from the core set' },
      { label: '3 core packages', tooltip: 'Includes ui, feedback, and core icon packs' },
      { label: 'Community Discord support', tooltip: 'Get help from the community on Discord' },
      { label: 'Personal use license', tooltip: 'Use in non-commercial personal projects only' },
      { label: '6 months of updates', tooltip: 'Receive new icons and fixes for 6 months' },
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
      { label: '226+ icons across all packs', tooltip: 'Full access to every icon in every pack' },
      { label: 'All 10 packages included', tooltip: 'Every current and future icon package' },
      { label: 'Email &amp; priority support', tooltip: 'Direct email line with faster response times', html: true },
      { label: 'Commercial use license', tooltip: 'Ship in client and commercial projects' },
      { label: 'Lifetime updates', tooltip: 'Every new icon and update, forever' },
      { label: 'Early access to new icons', tooltip: 'Preview and use icons before public release' },
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
      { label: '226+ icons across all packs', tooltip: 'Full library access for your entire team' },
      { label: 'All 10 packages included', tooltip: 'Every current and future icon package' },
      { label: 'Dedicated Slack channel', tooltip: 'Private Slack channel with direct team support' },
      { label: 'Multi-seat team license', tooltip: 'Cover up to 25 developers under one license' },
      { label: 'Lifetime updates', tooltip: 'Every new icon and update, forever' },
      { label: 'Custom icon requests', tooltip: 'Request bespoke icons tailored to your brand' },
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
                  className={`rounded-xl border p-8 flex flex-col h-full relative hover:scale-[1.02] transition-transform ${TONE_STYLES[plan.tone].border} ${TONE_STYLES[plan.tone].bg} ${plan.popular ? TONE_STYLES[plan.tone].glow : ''}`}
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
                      <li key={f.label} className="font-mono text-sm text-retro-muted flex items-start gap-2.5">
                        <PxlKitIcon icon={CheckCircle} size={14} colorful className="flex-shrink-0 mt-0.5" />
                        <PixelTooltip content={f.tooltip} position="top">
                          {f.html ? (
                            <span dangerouslySetInnerHTML={{ __html: f.label }} />
                          ) : (
                            <span>{f.label}</span>
                          )}
                        </PixelTooltip>
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
        <div className="text-center mt-10 space-y-3">
          <p className="inline-flex items-center gap-2 font-mono text-xs text-retro-muted">
            <PxlKitIcon icon={ShieldCheck} size={14} colorful />
            30-day money-back guarantee &middot; Cancel anytime
          </p>
          <div>
            <PixelTextLink href="#" tone="green">Compare plans in detail</PixelTextLink>
          </div>
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

const FEATURE_TOOLTIPS: Record<string, string> = {
  'Pixel-art icons': 'Total number of hand-crafted pixel icons available',
  'Icon packages': 'Themed icon collections you can install independently',
  'Projects': 'Number of projects covered by your license',
  'Commercial license': 'Use icons in commercial and client projects',
  'Priority support': 'Faster response times via dedicated support channels',
  'Lifetime updates': 'Receive every future icon and patch at no extra cost',
  'Early access': 'Preview and use new icons before they launch publicly',
  'Custom icon requests': 'Request bespoke icons designed for your brand',
};

const TIER_CTA: { label: string; tone: PlanTone }[] = [
  { label: 'Get Started Free', tone: 'neutral' },
  { label: 'Upgrade to Pro', tone: 'green' },
  { label: 'Start Team Plan', tone: 'cyan' },
];

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
                    className={`border-b border-retro-border/30 hover:bg-retro-surface/40 hover:shadow-sm transition-colors ${
                      idx % 2 === 1 ? 'bg-retro-surface/10' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5 text-retro-text">
                      <PixelTooltip content={FEATURE_TOOLTIPS[feat] ?? feat} position="top">
                        <span className="cursor-help border-b border-dotted border-retro-border/50">{feat}</span>
                      </PixelTooltip>
                    </td>
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
              <tfoot>
                <tr className="border-t border-retro-border">
                  <td className="px-6 py-5" />
                  {TIER_CTA.map((cta) => (
                    <td key={cta.label} className="text-center px-6 py-5">
                      <PixelButton
                        tone={cta.tone}
                        size="sm"
                        className="w-full justify-center"
                        iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
                      >
                        {cta.label}
                      </PixelButton>
                    </td>
                  ))}
                </tr>
              </tfoot>
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
            <PixelBounce trigger={isYearly}>
              <PixelBadge tone="gold">
                <span className="inline-flex items-center gap-1">
                  <PxlKitIcon icon={Lightning} size={10} colorful />
                  Save 20%
                </span>
              </PixelBadge>
            </PixelBounce>
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
                    <PixelTooltip content={`${plan.name} plan`} position="top">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg border border-retro-border/50 bg-retro-surface/40 mb-3">
                        <PxlKitIcon icon={plan.icon} size={28} colorful />
                      </div>
                    </PixelTooltip>
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
                      <PixelFadeIn>
                        <p className="font-mono text-xs text-retro-green mt-1">
                          ${perMonth}/mo &middot; You save ${savings}/yr
                        </p>
                      </PixelFadeIn>
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
