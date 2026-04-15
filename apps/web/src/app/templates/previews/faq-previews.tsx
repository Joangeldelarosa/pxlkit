'use client';

import {
  PixelCollapsible,
  PixelBadge,
} from '@pxlkit/ui-kit';

const FAQ_ITEMS = [
  { q: 'What is Pxlkit?', a: 'A pixel-art component library for React.' },
  { q: 'Is it free?', a: 'Yes, Pxlkit is MIT licensed and open source.' },
  { q: 'Does it work with Next.js?', a: 'Absolutely. Full SSR and RSC support.' },
];

/* ── FAQ Accordion ────────────────────────────────────────────────────── */
export function FaqAccordionPreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="text-center mb-6">
        <h2 className="font-pixel text-base text-retro-text leading-loose">FAQ</h2>
        <p className="text-retro-muted font-mono text-xs">Common questions answered.</p>
      </div>
      <div className="max-w-md mx-auto space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <PixelCollapsible key={i} label={item.q} defaultOpen={i === 0}>
            <p className="font-mono text-[10px] text-retro-muted">{item.a}</p>
          </PixelCollapsible>
        ))}
      </div>
    </section>
  );
}

/* ── FAQ Two-Column ───────────────────────────────────────────────────── */
export function FaqTwoColumnPreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <h2 className="font-pixel text-sm text-retro-text leading-loose mb-1">FAQ</h2>
          <p className="font-mono text-[9px] text-retro-muted">
            Can&apos;t find your answer? Contact us.
          </p>
        </div>
        <div className="sm:col-span-2 space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border-b border-retro-border/30 pb-2">
              <p className="font-pixel text-[10px] text-retro-text mb-0.5">{item.q}</p>
              <p className="font-mono text-[9px] text-retro-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ Tabbed ────────────────────────────────────────────────────────── */
export function FaqTabbedPreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="text-center mb-4">
        <h2 className="font-pixel text-base text-retro-text leading-loose">Help Center</h2>
      </div>
      <div className="max-w-md mx-auto">
        {/* Tab strip */}
        <div className="flex gap-1 border-b border-retro-border mb-4">
          {['General', 'Billing', 'Technical'].map((tab, i) => (
            <span
              key={tab}
              className={`px-3 py-1.5 font-mono text-[9px] cursor-pointer ${
                i === 0
                  ? 'text-retro-green border-b-2 border-retro-green'
                  : 'text-retro-muted hover:text-retro-text'
              }`}
            >
              {tab}
            </span>
          ))}
        </div>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="rounded-xl border border-retro-border bg-retro-surface/40 p-3">
              <p className="font-pixel text-[9px] text-retro-text mb-0.5">{item.q}</p>
              <p className="font-mono text-[8px] text-retro-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
