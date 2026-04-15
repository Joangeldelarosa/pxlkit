'use client';

import { PxlKitIcon } from '@pxlkit/core';
import { Star } from '@pxlkit/gamification';
import { PixelAvatar, PixelFadeIn } from '@pxlkit/ui-kit';

const TESTIMONIALS = [
  { name: 'Alice', role: 'Frontend Dev', quote: 'Pxlkit saved us weeks of design work. The retro look is iconic.' },
  { name: 'Bob', role: 'Indie Maker', quote: "Best component library I've used. Customers love the pixel style." },
  { name: 'Carol', role: 'Designer', quote: "Finally, pixel-art UI that's accessible and production-ready." },
];

/* ── Testimonials Cards ───────────────────────────────────────────────── */
export function TestimonialsCardsPreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="text-center mb-6">
        <h2 className="font-pixel text-base text-retro-text leading-loose">Loved by devs</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
        {TESTIMONIALS.map((t) => (
          <PixelFadeIn key={t.name}>
            <div className="rounded-xl border border-retro-border bg-retro-surface/40 p-4">
              <div className="py-3 px-2">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <PxlKitIcon key={i} icon={Star} size={10} className="text-retro-gold" />
                  ))}
                </div>
                <p className="font-mono text-[9px] text-retro-muted mb-3 italic">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-2">
                  <PixelAvatar name={t.name} size="sm" />
                  <div>
                    <p className="font-pixel text-[9px] text-retro-text">{t.name}</p>
                    <p className="font-mono text-[8px] text-retro-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </PixelFadeIn>
        ))}
      </div>
    </section>
  );
}

/* ── Testimonials Large Quote ─────────────────────────────────────────── */
export function TestimonialsLargeQuotePreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="max-w-md mx-auto text-center">
        <span className="text-3xl text-retro-green/40 font-pixel leading-none">&quot;</span>
        <p className="font-mono text-xs text-retro-text leading-relaxed mb-4">
          Pxlkit saved us weeks of design work. The retro look is iconic and our users absolutely love it.
        </p>
        <span className="text-3xl text-retro-green/40 font-pixel leading-none">&quot;</span>
        <div className="mt-4 flex items-center justify-center gap-2">
          <PixelAvatar name="Alice" size="md" />
          <div className="text-left">
            <p className="font-pixel text-[10px] text-retro-text">Alice Johnson</p>
            <p className="font-mono text-[9px] text-retro-muted">Frontend Lead, Acme Inc.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials Slider ──────────────────────────────────────────────── */
export function TestimonialsSliderPreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="max-w-sm mx-auto">
        <div className="rounded-xl border border-retro-green/30 bg-retro-green/5 p-4">
          <div className="py-4 px-3 text-center">
            <div className="flex gap-0.5 justify-center mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <PxlKitIcon key={i} icon={Star} size={12} className="text-retro-gold" />
              ))}
            </div>
            <p className="font-mono text-[10px] text-retro-muted leading-relaxed mb-3 italic">
              &quot;Best component library I&apos;ve used. Customers love the pixel style.&quot;
            </p>
            <PixelAvatar name="Bob" size="md" />
            <p className="font-pixel text-[9px] text-retro-text mt-2">Bob Smith</p>
            <p className="font-mono text-[8px] text-retro-muted">Indie Maker</p>
            {/* Dots indicator */}
            <div className="flex justify-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-retro-muted/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-retro-green" />
              <span className="w-1.5 h-1.5 rounded-full bg-retro-muted/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
