'use client';

import { useState } from 'react';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { Star, SparkleStar, Crown } from '@pxlkit/gamification';
import { Verified } from '@pxlkit/social';
import { Sparkles } from '@pxlkit/feedback';
import {
  PixelAvatar,
  PixelBadge,
  PixelButton,
  PixelFadeIn,
  PixelFloat,
  PixelTooltip,
  PixelTextLink,
  PixelPulse,
} from '@pxlkit/ui-kit';

/* ── Shared data ────────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    name: 'Alice Johnson',
    role: 'Frontend Lead',
    company: 'Acme Inc.',
    quote:
      'Pxlkit saved us weeks of design work. The retro aesthetic is iconic and our users absolutely love it. The component quality is outstanding.',
    tone: 'green' as const,
    border: 'border-retro-green/20',
    bg: 'bg-retro-green/5',
  },
  {
    name: 'Bob Smith',
    role: 'Indie Maker',
    company: 'PixelForge',
    quote:
      "Best component library I've used. Customers love the pixel style — it's unlike anything else out there. Shipped my SaaS in half the time.",
    tone: 'cyan' as const,
    border: 'border-retro-cyan/20',
    bg: 'bg-retro-cyan/5',
  },
  {
    name: 'Carol Lee',
    role: 'UX Designer',
    company: 'Studio Pixel',
    quote:
      "Finally, pixel-art UI that's actually accessible and production-ready. It's been a game changer for every project we touch.",
    tone: 'gold' as const,
    border: 'border-retro-gold/20',
    bg: 'bg-retro-gold/5',
  },
];

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <PxlKitIcon key={i} icon={Star} size={14} colorful />
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
          <PixelBadge tone="gold">
            <PxlKitIcon icon={Crown} size={12} colorful />
            <span className="ml-1.5">Testimonials</span>
          </PixelBadge>
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mb-3 mt-4">
            Loved by developers
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base max-w-lg mx-auto">
            Don&apos;t take our word for it — here&apos;s what our community has to say.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <PixelFadeIn key={t.name} delay={i * 100}>
              <div
                className={`rounded-xl border ${t.border} ${t.bg} p-6 flex flex-col h-full transition-all hover:shadow-lg hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Stars />
                  <PixelTooltip content="Verified customer" position="top">
                    <PxlKitIcon icon={Verified} size={16} colorful />
                  </PixelTooltip>
                </div>

                <p className="font-mono text-sm text-retro-muted leading-relaxed flex-1 italic mb-4">
                  &quot;{t.quote}&quot;
                </p>

                <div className="mb-4">
                  <PixelTextLink href="#" tone="green">Read full review</PixelTextLink>
                </div>

                <div className="flex items-center gap-3">
                  <PixelAvatar name={t.name} size="md" tone={t.tone} />
                  <div className="flex-1 min-w-0">
                    <p className="font-pixel text-xs text-retro-text">{t.name}</p>
                    <p className="font-mono text-xs text-retro-muted truncate">
                      {t.role} · {t.company}
                    </p>
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
  const [quoteIndex, setQuoteIndex] = useState(0);
  const current = TESTIMONIALS[quoteIndex];

  const goNext = () => setQuoteIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  const goPrev = () =>
    setQuoteIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="relative max-w-3xl mx-auto text-center">
        {/* Floating animated accent -- top-right */}
        <span className="absolute -top-4 right-4 sm:right-0 opacity-40 pointer-events-none">
          <PixelFloat duration={3200} distance={6}>
            <AnimatedPxlKitIcon icon={SparkleStar} size={28} colorful />
          </PixelFloat>
        </span>

        {/* Floating animated accent -- bottom-left */}
        <span className="absolute -bottom-2 left-4 sm:left-0 opacity-30 pointer-events-none">
          <PixelFloat duration={2800} distance={5}>
            <PxlKitIcon icon={Sparkles} size={22} colorful />
          </PixelFloat>
        </span>

        <div className="flex justify-center">
          <PixelPulse trigger="hover">
            <Stars />
          </PixelPulse>
        </div>

        <div className="mt-8 mb-8 relative">
          <span className="font-pixel text-6xl sm:text-7xl text-retro-green/20 leading-none select-none block">
            &ldquo;
          </span>
          <p className="font-mono text-base sm:text-lg text-retro-text leading-relaxed px-6 sm:px-10 -mt-4">
            {current.quote}
          </p>
          <span className="font-pixel text-6xl sm:text-7xl text-retro-green/20 leading-none select-none block text-right">
            &rdquo;
          </span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <PixelAvatar name={current.name} size="lg" tone={current.tone} />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="font-pixel text-sm text-retro-text">{current.name}</p>
              <PxlKitIcon icon={Verified} size={14} colorful />
            </div>
            <p className="font-mono text-sm text-retro-muted">
              {current.role} · {current.company}
            </p>
          </div>
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <PixelButton tone="green" size="sm" onClick={goPrev} aria-label="Previous quote">
            <PxlKitIcon icon={ArrowRight} size={14} className="rotate-180" />
          </PixelButton>
          <span className="font-mono text-xs text-retro-muted">
            {quoteIndex + 1} of {TESTIMONIALS.length}
          </span>
          <PixelButton tone="green" size="sm" onClick={goNext} aria-label="Next quote">
            <PxlKitIcon icon={ArrowRight} size={14} />
          </PixelButton>
        </div>

        {/* Company logo placeholder area */}
        <div className="mt-10 pt-8 border-t border-retro-border/30">
          <p className="font-mono text-xs text-retro-muted/60 mb-4 uppercase tracking-wider">
            Trusted by teams at
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['Acme Inc.', 'PixelForge', 'Studio Pixel', 'RetroLabs'].map((name) => (
              <span
                key={name}
                className="font-pixel text-xs text-retro-muted/50 px-3 py-1.5 rounded-md border border-retro-border/20 bg-retro-surface/20 hover:border-retro-green/40 hover:text-retro-green hover:bg-retro-surface/30 transition-all cursor-pointer"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials Slider ────────────────────────────────────────────────── */
export function TestimonialsSliderPreview() {
  const [slideIndex, setSlideIndex] = useState(0);
  const current = TESTIMONIALS[slideIndex];

  const goNext = () => setSlideIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  const goPrev = () =>
    setSlideIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="py-20 sm:py-28 px-6 bg-retro-bg">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose">
            What devs say
          </h2>
          <p className="text-retro-muted font-mono text-sm mt-2">
            Hear from developers who ship with PxlKit every day.
          </p>
        </div>

        <div
          className={`rounded-xl border ${current.border} ${current.bg} p-8 text-center transition-colors`}
        >
          <div className="flex justify-center mb-5">
            <Stars />
          </div>
          <p className="font-mono text-sm sm:text-base text-retro-muted leading-relaxed mb-6 italic max-w-md mx-auto">
            &quot;{current.quote}&quot;
          </p>
          <div className="flex flex-col items-center gap-2 mb-6">
            <PixelAvatar name={current.name} size="md" tone={current.tone} />
            <div>
              <div className="flex items-center justify-center gap-1.5">
                <p className="font-pixel text-xs text-retro-text">{current.name}</p>
                <PxlKitIcon icon={Verified} size={12} colorful />
              </div>
              <p className="font-mono text-xs text-retro-muted">
                {current.role} · {current.company}
              </p>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-center gap-4">
            <PixelButton tone="green" size="sm" onClick={goPrev} aria-label="Previous testimonial">
              <PxlKitIcon icon={ArrowRight} size={14} className="rotate-180" />
            </PixelButton>

            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <span
                  key={idx}
                  className={`rounded-full transition-all ${
                    idx === slideIndex
                      ? 'w-2.5 h-2.5 bg-retro-green'
                      : 'w-2 h-2 bg-retro-muted/30'
                  }`}
                />
              ))}
            </div>

            <PixelButton tone="green" size="sm" onClick={goNext} aria-label="Next testimonial">
              <PxlKitIcon icon={ArrowRight} size={14} />
            </PixelButton>
          </div>

          <p className="font-mono text-xs text-retro-muted/50 mt-4">
            {slideIndex + 1} of {TESTIMONIALS.length}
          </p>
        </div>
      </div>
    </section>
  );
}
