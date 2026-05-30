'use client';

import { useState } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { Trophy, Crown, Coin, Lightning, Gem } from '@pxlkit/gamification';
import { CheckCircle, ShieldCheck } from '@pxlkit/feedback';
import {
  PixelButton,
  PixelBadge,
  PixelFadeIn,
  PixelSlideIn,
  PixelSwitch,
  PixelTooltip,
  PixelTextLink,
  PixelBounce,
  PixelContainer,
  PixelSectionHeader,
  PixelEqualHeightGrid,
  PixelPricingCard,
} from '@pxlkit/ui-kit';

type PlanTone = 'neutral' | 'green' | 'cyan';

interface PlanFeature {
  label: string;
  tooltip: string;
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
      { label: 'All 7 icon packs included', tooltip: 'Every current and future icon pack' },
      { label: 'Email & priority support', tooltip: 'Direct email line with faster response times' },
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
      { label: 'All 7 icon packs included', tooltip: 'Every current and future icon pack' },
      { label: 'Dedicated Slack channel', tooltip: 'Private Slack channel with direct team support' },
      { label: 'Multi-seat team license', tooltip: 'Cover up to 25 developers under one license' },
      { label: 'Lifetime updates', tooltip: 'Every new icon and update, forever' },
      { label: 'Custom icon requests', tooltip: 'Request bespoke icons tailored to your brand' },
    ],
    cta: 'Start Team Plan',
  },
];

/* ── Pricing Cards ──────────────────────────────────────────────────────── */
export function PricingCardsPreview() {
  return (
    <PixelContainer as="section" maxWidth="xl" padding="xl" className="bg-retro-bg">
      <PixelSectionHeader
        align="center"
        size="md"
        spacing="normal"
        title="Simple, transparent pricing"
        description="Pick the plan that fits your project. Upgrade or downgrade anytime — no lock-in."
        eyebrow="New plans available"
      />

      <div className="mt-16">
        <PixelEqualHeightGrid cols={{ base: 1, sm: 3 }} gap={6}>
          {CARDS_PLANS.map((plan, idx) => (
            <PixelFadeIn key={plan.name}>
              <PixelSlideIn from={idx === 0 ? 'left' : idx === 2 ? 'right' : 'left'}>
                <PixelPricingCard
                  tone={plan.tone}
                  highlight={plan.popular}
                  popular={plan.popular ? { label: 'MOST POPULAR', tone: 'gold' } : undefined}
                  icon={<PxlKitIcon icon={plan.icon} size={32} colorful />}
                  name={plan.name}
                  description={plan.description}
                  price={{ amount: plan.price, period: plan.period }}
                  features={plan.features.map((f) => ({ label: f.label, tooltip: f.tooltip }))}
                  cta={
                    <PixelButton
                      tone={plan.tone}
                      size="md"
                      className="w-full justify-center"
                      iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
                    >
                      {plan.cta}
                    </PixelButton>
                  }
                />
              </PixelSlideIn>
            </PixelFadeIn>
          ))}
        </PixelEqualHeightGrid>
      </div>

      <div className="text-center mt-10 space-y-3">
        <p className="inline-flex items-center gap-2 font-mono text-xs text-retro-muted">
          <PxlKitIcon icon={ShieldCheck} size={14} colorful />
          30-day money-back guarantee · Cancel anytime
        </p>
        <div>
          <PixelTextLink href="#" tone="green">Compare plans in detail</PixelTextLink>
        </div>
      </div>
    </PixelContainer>
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
    <PixelContainer as="section" maxWidth="md" padding="xl" className="bg-retro-bg">
      <PixelSectionHeader
        align="center"
        size="md"
        spacing="normal"
        title="Compare plans"
        description="See what's included in each tier at a glance."
      />

      <div className="mt-14">
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
    </PixelContainer>
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
      'All 7 icon packs included',
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
      'SLA & invoicing',
    ],
  },
];

export function PricingTogglePreview() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <PixelContainer as="section" maxWidth="xl" padding="xl" className="bg-retro-bg">
      <div className="text-center mb-12">
        <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-5">
          Choose your plan
        </h2>

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

      <PixelEqualHeightGrid cols={{ base: 1, sm: 3 }} gap={6}>
        {TOGGLE_PLANS.map((plan) => {
          const price = isYearly ? plan.yearly : plan.monthly;
          const perMonth = isYearly ? Math.round(plan.yearly / 12) : plan.monthly;
          const savings = isYearly ? plan.monthly * 12 - plan.yearly : 0;
          const displayAmount = isYearly ? `$${price}` : `$${perMonth}`;
          const displayPeriod = isYearly ? '/yr' : '/mo';

          return (
            <PixelFadeIn key={plan.name}>
              <PixelPricingCard
                tone={plan.tone}
                highlight={plan.popular}
                popular={plan.popular ? { label: 'BEST VALUE', tone: 'gold' } : undefined}
                icon={<PxlKitIcon icon={plan.icon} size={28} colorful />}
                name={plan.name}
                description={plan.description}
                price={{ amount: displayAmount, period: displayPeriod }}
                features={plan.features.map((f) => ({ label: f.replace(/&amp;/g, '&') }))}
                cta={
                  <PixelButton
                    tone={plan.tone}
                    size="md"
                    className="w-full justify-center"
                    iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
                  >
                    Select {plan.name}
                  </PixelButton>
                }
                footer={
                  isYearly ? (
                    <span className="font-mono text-xs text-retro-green">
                      ${perMonth}/mo · You save ${savings}/yr
                    </span>
                  ) : undefined
                }
              />
            </PixelFadeIn>
          );
        })}
      </PixelEqualHeightGrid>

      <div className="text-center mt-10">
        <p className="inline-flex items-center gap-2 font-mono text-xs text-retro-muted">
          <PxlKitIcon icon={ShieldCheck} size={14} colorful />
          30-day money-back guarantee · No questions asked
        </p>
      </div>
    </PixelContainer>
  );
}
