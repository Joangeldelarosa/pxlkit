import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui';

const simplePricingCards = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import {
  PixelPricingCard,
  PixelButton,
  PixelFadeIn,
  PixelContainer,
  PixelSectionHeader,
  PixelEqualHeightGrid,
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
    <PixelContainer as="section" maxWidth="2xl" padding="lg" aria-labelledby="pricing-title">
      <PixelSectionHeader
        id="pricing-title"
        align="center"
        size="md"
        title="Simple pricing"
        description="No hidden fees. Cancel anytime."
      />

      <div className="mt-10">
        <PixelEqualHeightGrid cols={{ base: 1, md: 3 }} gap={6}>
          {PLANS.map((plan, i) => (
            <PixelFadeIn key={plan.name} delay={i * 100} className="h-full">
              <PixelPricingCard
                className="h-full"
                tone={plan.tone}
                highlight={plan.highlight}
                popular={plan.highlight ? { label: 'Popular', tone: 'green' } : undefined}
                name={plan.name}
                description={plan.description}
                price={{ amount: plan.price, period: plan.period }}
                features={plan.features.map((label) => ({ label }))}
                cta={
                  <PixelButton
                    tone={plan.tone}
                    size="md"
                    variant={plan.highlight ? 'solid' : 'outline'}
                    className="w-full justify-center"
                    iconRight={<PxlKitIcon icon={ArrowRight} size={12} />}
                  >
                    {plan.cta}
                  </PixelButton>
                }
              />
            </PixelFadeIn>
          ))}
        </PixelEqualHeightGrid>
      </div>
    </PixelContainer>
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
  PixelContainer,
  PixelSectionHeader,
  PixelGrid,
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
    <PixelContainer as="section" maxWidth="lg" padding="lg" aria-labelledby="compare-title">
      <PixelSectionHeader
        id="compare-title"
        align="center"
        size="md"
        title="Compare plans"
      />

      <div className="mt-10">
        <PixelTable
          columns={[
            { key: 'feature', header: 'Feature' },
            {
              key: 'free',
              align: 'center',
              header: <span className="text-retro-text text-xs font-pixel">Free</span>,
            },
            {
              key: 'pro',
              align: 'center',
              className: 'bg-retro-green/5',
              header: (
                <span className="inline-flex flex-col items-center gap-1">
                  <span className="text-retro-green text-xs font-pixel">Pro</span>
                  <PixelBadge tone="green" size="sm">Popular</PixelBadge>
                </span>
              ),
            },
            {
              key: 'team',
              align: 'center',
              header: <span className="text-retro-cyan text-xs font-pixel">Team</span>,
            },
          ]}
          data={ROWS.map((row) => ({
            feature: row.feature,
            free: <Val val={row.free} />,
            pro: <Val val={row.pro} />,
            team: <Val val={row.team} />,
          }))}
        />
      </div>

      <PixelGrid cols={{ base: 1, md: 3 }} gap={3} className="mt-8">
        <PixelButton tone="neutral" size="md" variant="outline" className="justify-center">Free — $0/mo</PixelButton>
        <PixelButton tone="green" size="md" className="justify-center">Pro — $12/mo</PixelButton>
        <PixelButton tone="cyan" size="md" variant="outline" className="justify-center">Team — $39/mo</PixelButton>
      </PixelGrid>
    </PixelContainer>
  );
}
`;

const togglePricing = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { useState } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import {
  PixelPricingCard,
  PixelButton,
  PixelBadge,
  PixelSegmented,
  PixelSlideIn,
  PixelContainer,
  PixelSectionHeader,
  PixelEqualHeightGrid,
} from '@pxlkit/ui-kit';

const PLANS = [
  { name: 'Starter', monthly: 9, yearly: 7, features: ['3 projects', 'Core components', 'Email support'], tone: 'neutral' as const },
  { name: 'Pro', monthly: 19, yearly: 15, features: ['Unlimited projects', 'All components', 'Priority support', 'Custom themes'], tone: 'green' as const, highlight: true },
  { name: 'Team', monthly: 49, yearly: 39, features: ['Everything in Pro', '10 team seats', 'Analytics', 'SLA'], tone: 'cyan' as const },
];

export function TogglePricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <PixelContainer as="section" maxWidth="2xl" padding="lg" aria-labelledby="toggle-pricing-title">
      <PixelSectionHeader
        id="toggle-pricing-title"
        align="center"
        size="md"
        title="Choose your plan"
        actions={
          <PixelSegmented
            label=""
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
            value={billing}
            onChange={(v) => setBilling(v as 'monthly' | 'yearly')}
          />
        }
      />

      <div className="mt-10">
        <PixelEqualHeightGrid cols={{ base: 1, md: 3 }} gap={6}>
          {PLANS.map((plan, i) => (
            <PixelSlideIn key={plan.name} from="up" delay={i * 80} className="h-full">
              <PixelPricingCard
                className="h-full"
                tone={plan.tone}
                highlight={'highlight' in plan && plan.highlight}
                popular={'highlight' in plan && plan.highlight ? { label: 'Best value', tone: 'green' } : undefined}
                name={plan.name}
                descriptionLines="none"
                price={{ amount: \`$\${billing === 'monthly' ? plan.monthly : plan.yearly}\`, period: '/mo' }}
                priceBadge={
                  billing === 'yearly' ? <PixelBadge tone="green" size="sm">Save 20%</PixelBadge> : undefined
                }
                features={plan.features.map((label) => ({ label }))}
                cta={
                  <PixelButton
                    tone={plan.tone}
                    size="md"
                    variant={'highlight' in plan && plan.highlight ? 'solid' : 'outline'}
                    className="w-full justify-center"
                    iconRight={<PxlKitIcon icon={ArrowRight} size={12} />}
                  >
                    Get {plan.name}
                  </PixelButton>
                }
              />
            </PixelSlideIn>
          ))}
        </PixelEqualHeightGrid>
      </div>
    </PixelContainer>
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
