'use client';

import { PixelCollapsible, PixelBadge } from '@pxlkit/ui-kit';

const FAQ_ITEMS = [
  {
    q: 'What is Pxlkit?',
    a: 'A complete pixel-art component library for React. It includes 40+ UI components, 226+ handcrafted SVG icons across 10 packages, animations, and a 3D voxel engine.',
  },
  {
    q: 'Is it free to use?',
    a: 'Yes. Pxlkit is MIT licensed and fully open source. A commercial license removes attribution requirements for production apps.',
  },
  {
    q: 'Does it work with Next.js?',
    a: 'Absolutely. Full SSR, RSC, and App Router support out of the box. Works with Vite, CRA, and any React setup.',
  },
  {
    q: 'How do I install it?',
    a: 'Run `npm install @pxlkit/core @pxlkit/ui-kit` and add the CSS import. That\'s all — no extra configuration needed.',
  },
];

/* ── FAQ Accordion ──────────────────────────────────────────────────────── */
export function FaqAccordionPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3">
            Frequently asked questions
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base">
            Everything you need to know about Pxlkit.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-retro-border bg-retro-surface/20 px-5 py-4"
            >
              <PixelCollapsible label={item.q} defaultOpen={i === 0} tone="neutral">
                <p className="font-mono text-sm text-retro-muted leading-relaxed pt-1">
                  {item.a}
                </p>
              </PixelCollapsible>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ Two-Column ─────────────────────────────────────────────────────── */
export function FaqTwoColumnPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1">
          <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mb-3">
            FAQ
          </h2>
          <p className="font-mono text-sm text-retro-muted leading-relaxed mb-5">
            Can&apos;t find your answer? Reach out and we&apos;ll help you.
          </p>
          <PixelBadge tone="cyan">Contact support</PixelBadge>
        </div>

        <div className="md:col-span-2 space-y-6">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border-b border-retro-border/30 pb-6 last:border-0 last:pb-0">
              <p className="font-pixel text-sm text-retro-text mb-2">{item.q}</p>
              <p className="font-mono text-sm text-retro-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ Tabbed ─────────────────────────────────────────────────────────── */
export function FaqTabbedPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3">
            Help Center
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base">
            Browse by topic.
          </p>
        </div>

        {/* Tab strip */}
        <div className="flex gap-1 border-b border-retro-border mb-8">
          {['General', 'Billing', 'Technical'].map((tab, i) => (
            <button
              key={tab}
              className={`px-5 py-2.5 font-mono text-sm cursor-pointer transition-colors ${
                i === 0
                  ? 'text-retro-green border-b-2 border-retro-green -mb-px'
                  : 'text-retro-muted hover:text-retro-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.slice(0, 3).map((item, i) => (
            <div key={i} className="rounded-xl border border-retro-border bg-retro-surface/20 p-5">
              <p className="font-pixel text-sm text-retro-text mb-2">{item.q}</p>
              <p className="font-mono text-sm text-retro-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
