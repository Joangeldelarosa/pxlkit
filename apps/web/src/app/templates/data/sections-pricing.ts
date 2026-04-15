import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui';

const simplePricingCards = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon } from '@pxlkit/core';
import { Check, ArrowRight } from '@pxlkit/ui';
import {
  PixelCard,
  PixelButton,
  PixelBadge,
  PixelDivider,
  PixelFadeIn,
  PixelSection,
} from '@pxlkit/ui-kit';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Perfect for side projects and learning.',
    features: ['5 projects', 'Basic components', 'Community support', '1GB storage'],
    cta: 'Start Free',
    tone: 'neutral' as const,
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/mo',
    description: 'For developers who ship frequently.',
    features: ['Unlimited projects', 'All components', 'Priority support', '10GB storage', 'Custom themes'],
    cta: 'Start Pro Trial',
    tone: 'green' as const,
    highlight: true,
  },
  {
    name: 'Team',
    price: '$39',
    period: '/mo',
    description: 'For teams that build together.',
    features: ['Everything in Pro', 'Team seats (5)', 'Shared workspace', 'Advanced analytics', 'SLA support'],
    cta: 'Contact Sales',
    tone: 'cyan' as const,
    highlight: false,
  },
];

export function SimplePricingCards() {
  return (
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mb-3">
            Simple pricing
          </h2>
          <p className="text-retro-muted font-mono text-sm">
            No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <PixelFadeIn key={plan.name} delay={i * 100}>
              <PixelCard
                className={\`p-6 h-full flex flex-col \${plan.highlight ? 'border-retro-green/50 bg-retro-green/5' : ''}\`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-pixel text-xs text-retro-text">{plan.name}</span>
                  {plan.highlight && <PixelBadge tone="green">Popular</PixelBadge>}
                </div>

                <div className="mb-4">
                  <span className="font-pixel text-2xl text-retro-text">{plan.price}</span>
                  <span className="text-retro-muted font-mono text-xs ml-1">{plan.period}</span>
                </div>

                <p className="text-retro-muted font-mono text-xs mb-4">{plan.description}</p>
                <PixelDivider tone="neutral" spacing="sm" />

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 font-mono text-xs text-retro-text">
                      <PxlKitIcon icon={Check} size={12} className="text-retro-green flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <PixelButton
                  tone={plan.tone}
                  size="md"
                  variant={plan.highlight ? 'solid' : 'outline'}
                  className="w-full justify-center"
                >
                  {plan.cta}
                  <PxlKitIcon icon={ArrowRight} size={12} className="ml-1.5" />
                </PixelButton>
              </PixelCard>
            </PixelFadeIn>
          ))}
        </div>
      </div>
    </PixelSection>
  );
}
`;

const comparisonTable = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon } from '@pxlkit/core';
import { Check, Close } from '@pxlkit/ui';
import {
  PixelTable,
  PixelBadge,
  PixelButton,
  PixelSection,
} from '@pxlkit/ui-kit';

const ROWS = [
  { feature: 'Projects', free: '5', pro: 'Unlimited', team: 'Unlimited' },
  { feature: 'Components', free: 'Basic', pro: 'All', team: 'All' },
  { feature: 'Custom themes', free: false, pro: true, team: true },
  { feature: 'Priority support', free: false, pro: true, team: true },
  { feature: 'Team seats', free: false, pro: false, team: '5 seats' },
  { feature: 'SLA', free: false, pro: false, team: true },
];

function Val({ val }: { val: string | boolean }) {
  if (val === true) return <PxlKitIcon icon={Check} size={16} className="text-retro-green" />;
  if (val === false) return <PxlKitIcon icon={Close} size={16} className="text-retro-muted/40" />;
  return <span className="font-mono text-xs text-retro-text">{val}</span>;
}

export function ComparisonTable() {
  return (
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mb-3">
            Compare plans
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-sm">
            <thead>
              <tr className="border-b border-retro-border">
                <th className="text-left py-3 px-4 text-retro-muted text-xs">Feature</th>
                <th className="py-3 px-4 text-center">
                  <span className="text-retro-text text-xs font-pixel">Free</span>
                </th>
                <th className="py-3 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-retro-green text-xs font-pixel">Pro</span>
                    <PixelBadge tone="green" className="text-[8px]">Popular</PixelBadge>
                  </div>
                </th>
                <th className="py-3 px-4 text-center">
                  <span className="text-retro-cyan text-xs font-pixel">Team</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-retro-border/50 hover:bg-retro-surface/30 transition-colors">
                  <td className="py-3 px-4 text-retro-muted text-xs">{row.feature}</td>
                  <td className="py-3 px-4 text-center"><Val val={row.free} /></td>
                  <td className="py-3 px-4 text-center bg-retro-green/5"><Val val={row.pro} /></td>
                  <td className="py-3 px-4 text-center"><Val val={row.team} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          <PixelButton tone="neutral" size="md" variant="outline" className="justify-center">Free — $0/mo</PixelButton>
          <PixelButton tone="green" size="md" className="justify-center">Pro — $12/mo</PixelButton>
          <PixelButton tone="cyan" size="md" variant="outline" className="justify-center">Team — $39/mo</PixelButton>
        </div>
      </div>
    </PixelSection>
  );
}
`;

const togglePricing = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { useState } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Check, ArrowRight } from '@pxlkit/ui';
import {
  PixelCard,
  PixelButton,
  PixelBadge,
  PixelSegmented,
  PixelSlideIn,
  PixelSection,
} from '@pxlkit/ui-kit';

const PLANS = [
  { name: 'Starter', monthly: 9, yearly: 7, features: ['3 projects', 'Core components', 'Email support'], tone: 'neutral' as const },
  { name: 'Pro', monthly: 19, yearly: 15, features: ['Unlimited projects', 'All components', 'Priority support', 'Custom themes'], tone: 'green' as const, highlight: true },
  { name: 'Team', monthly: 49, yearly: 39, features: ['Everything in Pro', '10 team seats', 'Analytics', 'SLA'], tone: 'cyan' as const },
];

export function TogglePricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mb-6">
            Choose your plan
          </h2>
          <div className="flex items-center justify-center gap-4">
            <PixelSegmented
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              value={billing}
              onChange={(v) => setBilling(v as 'monthly' | 'yearly')}
            />
            {billing === 'yearly' && (
              <PixelBadge tone="green" className="text-xs">Save 20%</PixelBadge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <PixelSlideIn key={plan.name} direction="up" delay={i * 80}>
              <PixelCard
                className={\`p-6 h-full flex flex-col \${'highlight' in plan && plan.highlight ? 'border-retro-green/40 bg-retro-green/5' : ''}\`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-pixel text-xs text-retro-text">{plan.name}</span>
                  {'highlight' in plan && plan.highlight && <PixelBadge tone="green">Best value</PixelBadge>}
                </div>
                <div className="mb-6">
                  <span className="font-pixel text-2xl text-retro-text">
                    \${billing === 'monthly' ? plan.monthly : plan.yearly}
                  </span>
                  <span className="text-retro-muted font-mono text-xs ml-1">/mo</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 font-mono text-xs text-retro-text">
                      <PxlKitIcon icon={Check} size={12} className="text-retro-green flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <PixelButton
                  tone={plan.tone}
                  size="md"
                  variant={'highlight' in plan && plan.highlight ? 'solid' : 'outline'}
                  className="w-full justify-center"
                >
                  Get {plan.name}
                  <PxlKitIcon icon={ArrowRight} size={12} className="ml-1.5" />
                </PixelButton>
              </PixelCard>
            </PixelSlideIn>
          ))}
        </div>
      </div>
    </PixelSection>
  );
}
`;

export const pricingSection: TemplateSection = {
  id: 'pricing',
  name: 'Pricing Tables',
  description: 'Pricing sections with cards, comparison table, and monthly/yearly toggle.',
  icon: '💎',
  variants: [
    {
      id: 'pricing-cards',
      name: 'Simple Pricing Cards',
      description: '3 plan cards (Free/Pro/Team) with popular badge, feature list, and CTA.',
      installCmd: INSTALL,
      code: simplePricingCards,
    },
    {
      id: 'pricing-comparison',
      name: 'Comparison Table',
      description: 'Feature comparison table with checkmarks and plan headers.',
      installCmd: INSTALL,
      code: comparisonTable,
    },
    {
      id: 'pricing-toggle',
      name: 'Toggle Pricing',
      description: 'Monthly/yearly billing toggle using PixelSegmented with animated price switch.',
      installCmd: INSTALL,
      code: togglePricing,
    },
  ],
};
