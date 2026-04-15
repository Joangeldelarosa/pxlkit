'use client';

import { PxlKitIcon } from '@pxlkit/core';
import { Check } from '@pxlkit/ui';
import {
  PixelButton,
  PixelBadge,
  PixelFadeIn,
} from '@pxlkit/ui-kit';

const TONE_BORDER: Record<string, string> = {
  neutral: 'border-retro-border bg-retro-surface/40',
  green: 'border-retro-green/30 bg-retro-green/5',
  cyan: 'border-retro-cyan/30 bg-retro-cyan/5',
};

const PLAN_FEATURES = ['Unlimited icons', 'All packages', 'Priority support'];

/* ── Pricing Cards ────────────────────────────────────────────────────── */
export function PricingCardsPreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="text-center mb-6">
        <h2 className="font-pixel text-base text-retro-text leading-loose">Pricing</h2>
        <p className="text-retro-muted font-mono text-xs">Simple, transparent pricing.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
        {[
          { name: 'Free', price: '$0', tone: 'neutral' as const },
          { name: 'Pro', price: '$19', tone: 'green' as const },
          { name: 'Team', price: '$49', tone: 'cyan' as const },
        ].map((plan) => (
          <PixelFadeIn key={plan.name}>
            <div className={`rounded-xl border p-4 ${TONE_BORDER[plan.tone] ?? TONE_BORDER.neutral}`}>
              <div className="py-3 text-center">
                <h3 className="font-pixel text-[10px] text-retro-text">{plan.name}</h3>
                <p className="font-pixel text-lg text-retro-text mt-1 mb-2">{plan.price}<span className="font-mono text-[9px] text-retro-muted">/mo</span></p>
                <ul className="space-y-1 mb-3">
                  {PLAN_FEATURES.map((f) => (
                    <li key={f} className="font-mono text-[9px] text-retro-muted flex items-center justify-center gap-1">
                      <PxlKitIcon icon={Check} size={10} className="text-retro-green" />
                      {f}
                    </li>
                  ))}
                </ul>
                <PixelButton tone={plan.tone} size="sm">
                  Choose
                </PixelButton>
              </div>
            </div>
          </PixelFadeIn>
        ))}
      </div>
    </section>
  );
}

/* ── Pricing Table ────────────────────────────────────────────────────── */
export function PricingTablePreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="max-w-md mx-auto">
        <h2 className="font-pixel text-base text-retro-text leading-loose text-center mb-4">Compare Plans</h2>
        <table className="w-full text-[9px] font-mono">
          <thead>
            <tr className="border-b border-retro-border">
              <th className="text-left py-2 text-retro-muted">Feature</th>
              <th className="text-center py-2 text-retro-muted">Free</th>
              <th className="text-center py-2 text-retro-green">Pro</th>
              <th className="text-center py-2 text-retro-cyan">Team</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Icons', '50', '226+', '226+'],
              ['Packages', '3', 'All', 'All'],
              ['Support', 'Community', 'Email', 'Priority'],
            ].map(([feat, ...vals]) => (
              <tr key={feat} className="border-b border-retro-border/30">
                <td className="py-2 text-retro-text">{feat}</td>
                {vals.map((v, i) => (
                  <td key={i} className="text-center py-2 text-retro-muted">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ── Pricing Toggle ───────────────────────────────────────────────────── */
export function PricingTogglePreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="text-center mb-4">
        <h2 className="font-pixel text-base text-retro-text leading-loose mb-2">Pricing</h2>
        <div className="inline-flex items-center gap-2 bg-retro-surface/40 border border-retro-border rounded px-3 py-1.5">
          <span className="font-mono text-[9px] text-retro-green">Monthly</span>
          <div className="w-6 h-3 bg-retro-green/40 rounded-full relative">
            <div className="absolute left-0.5 top-0.5 w-2 h-2 bg-retro-green rounded-full" />
          </div>
          <span className="font-mono text-[9px] text-retro-muted">Yearly</span>
          <PixelBadge tone="gold">-20%</PixelBadge>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto">
        {[
          { name: 'Starter', price: '$9' },
          { name: 'Pro', price: '$29' },
        ].map((plan) => (
          <div key={plan.name} className="rounded-xl border border-retro-green/30 bg-retro-green/5 p-4">
            <div className="py-3 text-center">
              <h3 className="font-pixel text-[10px] text-retro-text">{plan.name}</h3>
              <p className="font-pixel text-lg text-retro-text mt-1 mb-3">{plan.price}<span className="font-mono text-[9px] text-retro-muted">/mo</span></p>
              <PixelButton tone="green" size="sm">Select</PixelButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
