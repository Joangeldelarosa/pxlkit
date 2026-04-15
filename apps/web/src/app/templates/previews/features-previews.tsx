'use client';

import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { Trophy, Shield, Lightning } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelFadeIn,
  PixelSlideIn,
} from '@pxlkit/ui-kit';

const TONE_BORDER: Record<string, string> = {
  gold: 'border-retro-gold/30 bg-retro-gold/5',
  cyan: 'border-retro-cyan/30 bg-retro-cyan/5',
  green: 'border-retro-green/30 bg-retro-green/5',
  neutral: 'border-retro-border bg-retro-surface/40',
};

const FEATURES = [
  { icon: Trophy, title: 'Pixel Icons', desc: '226+ handcrafted icons', tone: 'gold' },
  { icon: Shield, title: 'Accessible', desc: 'ARIA-ready by default', tone: 'cyan' },
  { icon: Lightning, title: 'Fast', desc: 'Tree-shakable & tiny', tone: 'green' },
];

/* ── Features Icon Grid ───────────────────────────────────────────────── */
export function FeaturesIconGridPreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="text-center mb-6">
        <h2 className="font-pixel text-base text-retro-text leading-loose">Features</h2>
        <p className="text-retro-muted font-mono text-xs">Everything you need to build retro UIs.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
        {FEATURES.map((f) => (
          <PixelFadeIn key={f.title}>
            <div className={`rounded-xl border p-4 ${TONE_BORDER[f.tone] ?? TONE_BORDER.neutral}`}>
              <div className="text-center py-3">
                <PxlKitIcon icon={f.icon} size={28} colorful />
                <h3 className="font-pixel text-[10px] text-retro-text mt-2 mb-1">{f.title}</h3>
                <p className="font-mono text-[9px] text-retro-muted">{f.desc}</p>
              </div>
            </div>
          </PixelFadeIn>
        ))}
      </div>
    </section>
  );
}

/* ── Features Alternating ─────────────────────────────────────────────── */
export function FeaturesAlternatingPreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="max-w-lg mx-auto space-y-6">
        {FEATURES.map((f, i) => (
          <PixelSlideIn key={f.title} from={i % 2 === 0 ? 'left' : 'right'}>
            <div className={`flex items-center gap-4 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0 w-14 h-14 rounded border border-retro-border bg-retro-surface/40 flex items-center justify-center">
                <PxlKitIcon icon={f.icon} size={28} colorful />
              </div>
              <div>
                <h3 className="font-pixel text-[10px] text-retro-text mb-0.5">{f.title}</h3>
                <p className="font-mono text-[9px] text-retro-muted">{f.desc}</p>
              </div>
            </div>
          </PixelSlideIn>
        ))}
      </div>
    </section>
  );
}

/* ── Features Bento Grid ──────────────────────────────────────────────── */
export function FeaturesBentoPreview() {
  return (
    <section className="py-10 px-4 bg-retro-bg">
      <div className="max-w-xl mx-auto grid grid-cols-2 gap-2">
        {/* Large featured card */}
        <div className="col-span-2 sm:col-span-1 sm:row-span-2 rounded border border-retro-green/30 bg-retro-green/5 p-4 flex flex-col justify-center">
          <PxlKitIcon icon={Trophy} size={32} colorful />
          <h3 className="font-pixel text-xs text-retro-text mt-2 mb-1">Pixel Icons</h3>
          <p className="font-mono text-[9px] text-retro-muted">226+ handcrafted pixel icons across 10 themed packs.</p>
          <PixelButton tone="green" size="sm" className="mt-3 self-start">
            Browse
            <PxlKitIcon icon={ArrowRight} size={10} className="ml-1" />
          </PixelButton>
        </div>
        {/* Small cards */}
        <div className="rounded border border-retro-border bg-retro-surface/30 p-3">
          <PxlKitIcon icon={Shield} size={22} colorful />
          <h3 className="font-pixel text-[9px] text-retro-text mt-1">Accessible</h3>
          <p className="font-mono text-[8px] text-retro-muted">ARIA-ready</p>
        </div>
        <div className="rounded border border-retro-border bg-retro-surface/30 p-3">
          <PxlKitIcon icon={Lightning} size={22} colorful />
          <h3 className="font-pixel text-[9px] text-retro-text mt-1">Fast</h3>
          <p className="font-mono text-[8px] text-retro-muted">Tree-shakable</p>
        </div>
      </div>
    </section>
  );
}
