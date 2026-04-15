'use client';

import { PxlKitIcon } from '@pxlkit/core';
import { Star } from '@pxlkit/gamification';
import { PixelAvatar, PixelFadeIn } from '@pxlkit/ui-kit';

const TESTIMONIALS = [
  {
    name: 'Alice Johnson',
    role: 'Frontend Lead',
    company: 'Acme Inc.',
    quote: 'Pxlkit saved us weeks of design work. The retro aesthetic is iconic and our users absolutely love it.',
    tone: 'green' as const,
  },
  {
    name: 'Bob Smith',
    role: 'Indie Maker',
    company: 'Solo Founder',
    quote: "Best component library I've used. Customers love the pixel style — it's unlike anything else out there.",
    tone: 'cyan' as const,
  },
  {
    name: 'Carol Lee',
    role: 'UX Designer',
    company: 'Studio Pixel',
    quote: "Finally, pixel-art UI that's actually accessible and production-ready. It's been a game changer.",
    tone: 'gold' as const,
  },
];

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <PxlKitIcon key={i} icon={Star} size={14} className="text-retro-gold" />
      ))}
    </div>
  );
}

/* ── Testimonials Cards ─────────────────────────────────────────────────── */
export function TestimonialsCardsPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3">
            Loved by developers
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base">
            Don&apos;t take our word for it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <PixelFadeIn key={t.name}>
              <div className="rounded-xl border border-retro-border bg-retro-surface/30 p-6 flex flex-col h-full">
                <Stars />
                <p className="font-mono text-sm text-retro-muted mt-4 mb-6 leading-relaxed flex-1 italic">
                  &quot;{t.quote}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <PixelAvatar name={t.name} size="md" tone={t.tone} />
                  <div>
                    <p className="font-pixel text-xs text-retro-text">{t.name}</p>
                    <p className="font-mono text-xs text-retro-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            </PixelFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials Large Quote ───────────────────────────────────────────── */
export function TestimonialsLargeQuotePreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-3xl mx-auto text-center">
        <Stars />
        <div className="mt-8 mb-8">
          <span className="font-pixel text-5xl text-retro-green/30 leading-none select-none">&ldquo;</span>
          <p className="font-mono text-base sm:text-lg text-retro-text leading-relaxed px-4 -mt-2">
            Pxlkit saved us weeks of design work. The retro look is iconic and
            our users absolutely love it. Nothing else compares.
          </p>
          <span className="font-pixel text-5xl text-retro-green/30 leading-none select-none">&rdquo;</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <PixelAvatar name="Alice Johnson" size="lg" tone="green" />
          <div className="text-left">
            <p className="font-pixel text-sm text-retro-text">Alice Johnson</p>
            <p className="font-mono text-sm text-retro-muted">Frontend Lead · Acme Inc.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials Slider ────────────────────────────────────────────────── */
export function TestimonialsSliderPreview() {
  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose">
            What devs say
          </h2>
        </div>

        <div className="rounded-xl border border-retro-green/30 bg-retro-green/5 p-8 text-center">
          <div className="flex justify-center mb-5">
            <Stars />
          </div>
          <p className="font-mono text-sm sm:text-base text-retro-muted leading-relaxed mb-6 italic max-w-md mx-auto">
            &quot;Best component library I&apos;ve used. Customers love the pixel style —
            it&apos;s unlike anything else out there.&quot;
          </p>
          <div className="flex flex-col items-center gap-2">
            <PixelAvatar name="Bob Smith" size="md" tone="cyan" />
            <div>
              <p className="font-pixel text-xs text-retro-text">Bob Smith</p>
              <p className="font-mono text-xs text-retro-muted">Indie Maker</p>
            </div>
          </div>
          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-6">
            <span className="w-2 h-2 rounded-full bg-retro-muted/30" />
            <span className="w-2 h-2 rounded-full bg-retro-green" />
            <span className="w-2 h-2 rounded-full bg-retro-muted/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
