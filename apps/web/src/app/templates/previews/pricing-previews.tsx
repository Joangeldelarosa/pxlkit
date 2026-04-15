'use client';

import { PxlKitIcon } from '@pxlkit/core';
import { Check } from '@pxlkit/ui';
import { PixelButton, PixelBadge, PixelFadeIn } from '@pxlkit/ui-kit';

const PLAN_FEATURES = [
  'All packages included',
  'Unlimited projects',
  'Priority support',
  'Lifetime updates',
];

/* ── Pricing Cards ──────────────────────────────────────────────────────── */
export function PricingCardsPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3">
            Simple pricing
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base">
            Transparent plans. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { name: 'Free', price: '$0', tone: 'neutral' as const, features: ['50 icons', '3 packages', 'Community support'] },
            { name: 'Pro', price: '$19', tone: 'green' as const, popular: true, features: ['226+ icons', 'All packages', 'Email support'] },
            { name: 'Team', price: '$49', tone: 'cyan' as const, features: ['226+ icons', 'All packages', 'Priority support'] },
          ].map((plan) => (
            <PixelFadeIn key={plan.name}>
              <div
                className={`rounded-xl border p-8 flex flex-col h-full relative ${
                  plan.tone === 'neutral'
                    ? 'border-retro-border bg-retro-surface/30'
                    : plan.tone === 'green'
                    ? 'border-retro-green/40 bg-retro-green/5'
                    : 'border-retro-cyan/40 bg-retro-cyan/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <PixelBadge tone="green">Most Popular</PixelBadge>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-pixel text-base text-retro-text mb-3">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-pixel text-3xl text-retro-text">{plan.price}</span>
                    <span className="font-mono text-sm text-retro-muted">/mo</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="font-mono text-sm text-retro-muted flex items-center gap-2">
                      <PxlKitIcon icon={Check} size={12} className="text-retro-green flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <PixelButton tone={plan.tone} size="md" className="w-full justify-center">
                  Get {plan.name}
                </PixelButton>
              </div>
            </PixelFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing Table ──────────────────────────────────────────────────────── */
export function PricingTablePreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3">
            Compare plans
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base">
            See what&apos;s included in each tier.
          </p>
        </div>

        <div className="rounded-xl border border-retro-border overflow-hidden">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-retro-border bg-retro-surface/60">
                <th className="text-left px-6 py-4 text-retro-muted font-semibold">Feature</th>
                <th className="text-center px-6 py-4 text-retro-muted font-semibold">Free</th>
                <th className="text-center px-6 py-4 text-retro-green font-semibold">Pro</th>
                <th className="text-center px-6 py-4 text-retro-cyan font-semibold">Team</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Icons', '50', '226+', '226+'],
                ['Packages', '3', 'All 10', 'All 10'],
                ['Projects', '1', 'Unlimited', 'Unlimited'],
                ['Support', 'Community', 'Email', 'Priority'],
                ['Updates', '6 months', 'Lifetime', 'Lifetime'],
              ].map(([feat, ...vals], idx) => (
                <tr
                  key={feat}
                  className={`border-b border-retro-border/30 hover:bg-retro-surface/20 transition-colors ${
                    idx % 2 === 1 ? 'bg-retro-surface/10' : ''
                  }`}
                >
                  <td className="px-6 py-3.5 text-retro-text">{feat}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="text-center px-6 py-3.5 text-retro-muted">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ── Pricing Toggle ─────────────────────────────────────────────────────── */
export function PricingTogglePreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-5">
            Pricing
          </h2>
          <div className="inline-flex items-center gap-3 bg-retro-surface/40 border border-retro-border rounded-lg px-4 py-2">
            <span className="font-mono text-sm text-retro-green font-semibold">Monthly</span>
            <div className="w-10 h-5 bg-retro-surface border border-retro-border rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-0.5 w-3.5 h-3.5 bg-retro-green rounded-full shadow" />
            </div>
            <span className="font-mono text-sm text-retro-muted">Yearly</span>
            <PixelBadge tone="gold">Save 20%</PixelBadge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {[
            { name: 'Starter', price: '$9', features: PLAN_FEATURES.slice(0, 2) },
            { name: 'Pro', price: '$29', features: PLAN_FEATURES },
          ].map((plan) => (
            <div
              key={plan.name}
              className="rounded-xl border border-retro-green/30 bg-retro-green/5 p-8"
            >
              <h3 className="font-pixel text-base text-retro-text mb-3">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-pixel text-3xl text-retro-text">{plan.price}</span>
                <span className="font-mono text-sm text-retro-muted">/mo</span>
              </div>
              <ul className="space-y-3 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="font-mono text-sm text-retro-muted flex items-center gap-2">
                    <PxlKitIcon icon={Check} size={12} className="text-retro-green flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <PixelButton tone="green" size="md" className="w-full justify-center">
                Select {plan.name}
              </PixelButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
