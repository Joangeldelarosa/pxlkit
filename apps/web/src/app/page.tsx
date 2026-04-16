'use client';

import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon, parseAnyIconCode, ParallaxPxlKitIcon } from '@pxlkit/core';
import type { PxlKitData, AnyIcon } from '@pxlkit/core';
import {
  Trophy, Lightning, GamificationPack, FireSword,
} from '@pxlkit/gamification';
import {
  Robot, Palette, Package, ArrowRight, UiPack,
} from '@pxlkit/ui';
import {
  FeedbackPack,
  CheckCircle, XCircle, InfoCircle, WarningTriangle, Bell,
} from '@pxlkit/feedback';
import { SocialPack, Heart } from '@pxlkit/social';
import { WeatherPack, Sun } from '@pxlkit/weather';
import { EffectsPack } from '@pxlkit/effects';
import { ParallaxPack } from '@pxlkit/parallax';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { TOTAL_ICON_COUNT } from '../components/HeroCollage';
import { useToast } from '../components/ToastProvider';
import type { ToastTone } from '../components/ToastProvider';
import { CoolEmoji } from '../data/cool-emoji';
import {
  PixelBadge,
  PixelButton,
  PixelCard,
  PixelCodeInline,
  PixelTextarea,
  PixelParallaxLayer,
  PixelMouseParallax,
  UI_KIT_COMPONENTS,
} from '@pxlkit/ui-kit';

const UI_COMPONENTS_COUNT = UI_KIT_COMPONENTS.length;

const VoxelPreview = dynamic(() => import('../components/VoxelPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="font-pixel text-xs text-retro-muted animate-pulse">Loading 3D…</div>
    </div>
  ),
});

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden w-full max-w-[100vw]">
      <HeroSection />
      <TrustBar />
      <TemplatesShowcase />
      <FeaturesSection />
      <HowItWorks />
      <IconShowcase />
      <ParallaxShowcase />
      <ToastSection />
      <AISection />
      <PricingPreview />
      <FAQSection />
      <VoxelComingSoon />
      <CTASection />
    </div>
  );
}

/* ──────────────────── HERO ──────────────────── */
function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '90vh' }}>
      {/* ── Background glows ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-retro-green/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-retro-purple/5 rounded-full blur-[120px]" />
        <div className="absolute top-2/3 left-1/2 w-[300px] h-[300px] bg-retro-gold/4 rounded-full blur-[100px]" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14 md:py-20" style={{ minHeight: '90vh' }}>
        <div className="w-full max-w-5xl mx-auto text-center">

          {/* Status badges */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-5 sm:mb-6"
          >
            <PixelBadge tone="green">MIT Code · Licensed Assets</PixelBadge>
            <PixelBadge tone="cyan">TypeScript + Tailwind</PixelBadge>
            <PixelBadge tone="gold"><span aria-label="50 percent off launch price">🔥 50% Off Launch</span></PixelBadge>
          </motion.div>

          {/* ── H1 — SEO-rich, benefit-driven ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-retro-green leading-tight text-glow mb-2 sm:mb-3">
              READY-TO-USE REACT<br className="hidden sm:block" /> TEMPLATES &amp; UI KIT
            </h1>
            <p className="font-pixel text-xs sm:text-sm md:text-base text-retro-gold">
              Ship Pixel-Perfect Retro Interfaces in Minutes, Not Days.
            </p>
          </motion.div>

          {/* ── Subheading — outcome-focused copy ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-retro-muted max-w-2xl mx-auto leading-relaxed"
          >
            Stop building from scratch.{' '}
            <span className="text-retro-text font-medium">Copy-paste hero sections, pricing tables, CTAs, and full landing pages</span>{' '}
            built with {UI_COMPONENTS_COUNT}+ pixel-art components and {TOTAL_ICON_COUNT}+ hand-crafted SVG icons.{' '}
            <span className="text-retro-green font-bold">Production-ready today</span>.
          </motion.p>

          {/* ── Stats — social proof ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-5 sm:mt-6 text-xs sm:text-sm font-mono"
          >
            <PixelCodeInline tone="green">{UI_COMPONENTS_COUNT}+ components</PixelCodeInline>
            <PixelCodeInline tone="gold">{TOTAL_ICON_COUNT}+ icons</PixelCodeInline>
            <PixelCodeInline tone="purple">7 themed packs</PixelCodeInline>
            <PixelCodeInline tone="cyan">8 section types</PixelCodeInline>
            <PixelCodeInline>5 page templates</PixelCodeInline>
          </motion.div>

          {/* ── CTA Buttons — clear hierarchy ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mt-6 sm:mt-8"
          >
            <PixelButton tone="green" iconRight={<PxlKitIcon icon={ArrowRight} size={14} />} onClick={() => router.push('/templates')}>
              Browse Templates
            </PixelButton>
            <PixelButton tone="cyan" variant="ghost" iconRight={<PxlKitIcon icon={ArrowRight} size={14} />} onClick={() => router.push('/ui-kit')}>
              Explore UI Kit
            </PixelButton>
            <PixelButton tone="purple" variant="ghost" iconRight={<PxlKitIcon icon={ArrowRight} size={14} />} onClick={() => router.push('/icons')}>
              Browse {TOTAL_ICON_COUNT}+ Icons
            </PixelButton>
          </motion.div>

          {/* ── Install command — instant gratification ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-5 sm:mt-6"
          >
            <div className="inline-block rounded-lg border border-retro-border bg-retro-bg/80 px-3 sm:px-5 py-2 sm:py-3 font-mono text-[10px] sm:text-xs text-retro-muted">
              <span className="text-retro-green mr-2">$</span>
              npm i @pxlkit/core @pxlkit/ui-kit @pxlkit/ui
              <span className="text-retro-muted/40 ml-2" aria-label="ready in seconds">— ready in seconds</span>
            </div>
          </motion.div>

          {/* ── Icon Showcase Row — visual proof ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-8 sm:mt-10"
          >
            <div className="relative rounded-xl border border-retro-border/30 overflow-hidden bg-retro-surface/40 backdrop-blur-sm px-4 sm:px-8 py-5 sm:py-6 max-w-3xl mx-auto">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-retro-green/50 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-retro-green/50 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-retro-purple/50 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-retro-purple/50 rounded-br-xl" />

              <p className="font-mono text-[9px] sm:text-[10px] text-retro-muted/60 mb-3 sm:mb-4 text-center">
                Sample icons from 7 themed packs
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
                {[
                  { icon: Trophy, label: 'Trophy', pack: 'gamification' },
                  { icon: Heart, label: 'Heart', pack: 'social' },
                  { icon: Sun, label: 'Sun', pack: 'weather' },
                  { icon: Bell, label: 'Bell', pack: 'feedback' },
                  { icon: Package, label: 'Package', pack: 'ui' },
                  { icon: Lightning, label: 'Lightning', pack: 'gamification' },
                ].map((item) => (
                  <div key={item.label} className="text-center group">
                    <div className="group-hover:scale-110 transition-transform">
                      <PxlKitIcon icon={item.icon} size={36} colorful />
                    </div>
                    <span className="block mt-1 font-mono text-[8px] sm:text-[9px] text-retro-muted group-hover:text-retro-green transition-colors">
                      {item.label}
                    </span>
                  </div>
                ))}
                <AnimatedPxlKitIcon icon={FireSword} size={36} colorful />
              </div>

              <div className="mt-3 sm:mt-4 flex justify-center">
                <span className="bg-retro-bg/80 backdrop-blur-sm border border-retro-border/40 rounded px-2 sm:px-3 py-0.5 sm:py-1 font-mono text-[8px] sm:text-[10px] text-retro-muted/60">
                  {TOTAL_ICON_COUNT}+ icons · 7 packs · tree-shakeable SVG
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── TRUST BAR ──────────────────── */
function TrustBar() {
  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6 border-t border-retro-border/20 bg-retro-surface/10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {[
            { value: `${UI_COMPONENTS_COUNT}+`, label: 'UI Components' },
            { value: `${TOTAL_ICON_COUNT}+`, label: 'Pixel Icons' },
            { value: '29', label: 'Template Sections' },
            { value: '5', label: 'Page Templates' },
            { value: '100%', label: 'TypeScript' },
          ].map((stat) => (
            <div key={stat.label} className="text-center min-w-[70px]">
              <div className="font-pixel text-base sm:text-lg md:text-xl text-retro-green text-glow">{stat.value}</div>
              <div className="font-mono text-[9px] sm:text-[10px] text-retro-muted/70 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
        <p className="text-center font-mono text-[8px] text-retro-muted/40 mt-3">Ready-to-use · Copy-paste · Zero native browser UI · Tree-shakeable</p>
      </div>
    </section>
  );
}

/* ──────────────────── TEMPLATES SHOWCASE ──────────────────── */
const TEMPLATE_CATEGORIES = [
  { name: 'Hero Sections', count: 3, color: 'text-retro-green', borderColor: 'border-retro-green/30', desc: 'Centered, split-layout, and parallax hero variants with responsive design' },
  { name: 'Headers', count: 3, color: 'text-retro-cyan', borderColor: 'border-retro-cyan/30', desc: 'Simple nav, mega dropdown, and centered logo header variants' },
  { name: 'Pricing Tables', count: 3, color: 'text-retro-gold', borderColor: 'border-retro-gold/30', desc: 'Cards, comparison table, and monthly/yearly toggle layouts' },
  { name: 'Testimonials', count: 3, color: 'text-retro-purple', borderColor: 'border-retro-purple/30', desc: 'Card grid, large quote, and slider testimonial sections' },
  { name: 'CTAs', count: 3, color: 'text-retro-red', borderColor: 'border-retro-red/30', desc: 'Banner, split, and card call-to-action blocks' },
  { name: 'Features', count: 3, color: 'text-retro-pink', borderColor: 'border-retro-pink/30', desc: 'Icon grid, alternating, and bento feature layouts' },
  { name: 'FAQs', count: 3, color: 'text-retro-cyan', borderColor: 'border-retro-cyan/30', desc: 'Accordion, two-column, and tabbed FAQ sections' },
  { name: 'Footers', count: 3, color: 'text-retro-muted', borderColor: 'border-retro-border/50', desc: 'Minimal, multi-column, and CTA footer variants' },
];

const FULL_PAGE_TEMPLATES = [
  { name: 'SaaS Landing', color: 'text-retro-green', desc: 'Complete startup landing page with all sections' },
  { name: 'Portfolio', color: 'text-retro-gold', desc: 'Developer or designer portfolio with project grid' },
  { name: 'Indie Game', color: 'text-retro-purple', desc: 'Game marketing page with feature highlights' },
  { name: 'Admin Dashboard', color: 'text-retro-cyan', desc: 'Pixel-art admin panel with stats and tables' },
  { name: 'Blog', color: 'text-retro-pink', desc: 'Content-focused blog layout with sidebar' },
];

function TemplatesShowcase() {
  const router = useRouter();

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30 bg-retro-surface/10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap justify-center">
            <PixelBadge tone="green">COPY &amp; PASTE</PixelBadge>
            <PixelBadge tone="cyan">RESPONSIVE</PixelBadge>
            <PixelBadge tone="gold">PRODUCTION-READY</PixelBadge>
          </div>
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-green mb-2 sm:mb-3">
            TEMPLATES &amp; SECTIONS — SHIP IN MINUTES
          </h2>
          <p className="text-retro-muted max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed px-2">
            29 ready-to-use section templates across 8 categories, plus 5 complete page layouts.
            Every template is built with Pxlkit components, fully responsive, and supports{' '}
            <span className="text-retro-green font-bold">dark and light mode</span> out of the box.
            Copy the code, drop it in your project, customize, and ship.
          </p>
        </motion.div>

        {/* Section template categories */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-60px' }}
        >
          {TEMPLATE_CATEGORIES.map((cat) => (
            <motion.div
              key={cat.name}
              variants={fadeInUp}
              className={`rounded-lg border ${cat.borderColor} bg-retro-bg/40 backdrop-blur-sm p-3 sm:p-4 hover:bg-retro-card/40 transition-colors cursor-pointer group`}
              onClick={() => router.push('/templates')}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className={`font-pixel text-[9px] sm:text-[11px] ${cat.color}`}>{cat.name}</h4>
                <span className="font-mono text-[9px] text-retro-muted/60">{cat.count}×</span>
              </div>
              <p className="text-retro-muted/70 text-[9px] sm:text-[10px] leading-relaxed group-hover:text-retro-muted transition-colors">
                {cat.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Full page templates */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 min-w-0">
            <h3 className="font-pixel text-[10px] sm:text-[11px] shrink-0 text-retro-gold">Full Page Templates</h3>
            <span className="font-mono text-[10px] text-retro-muted/60 shrink-0">
              5 complete layouts
            </span>
            <div className="flex-1 border-t border-retro-border/20 min-w-[12px]" />
            <span className="hidden sm:block font-mono text-[10px] text-retro-muted/40 truncate">drop-in · responsive · themed</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {FULL_PAGE_TEMPLATES.map((tpl) => (
              <div
                key={tpl.name}
                onClick={() => router.push('/templates')}
                className="flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-lg border border-retro-border/30 bg-retro-surface/20 hover:bg-retro-card/40 transition-colors cursor-pointer group"
              >
                <span className={`font-pixel text-[9px] sm:text-[10px] ${tpl.color} group-hover:text-glow transition-all`}>
                  {tpl.name}
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] text-retro-muted/60 text-center leading-relaxed">
                  {tpl.desc}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-10">
          <PixelButton
            tone="green"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} className="inline-block" />}
            onClick={() => router.push('/templates')}
          >
            Browse All Templates
          </PixelButton>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── VOXEL COMING SOON ──────────────────── */

function VoxelComingSoon() {
  return (
    <section className="relative py-10 sm:py-14 px-4 sm:px-6 border-t border-retro-border/20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-retro-purple/4 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-retro-purple opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-retro-purple" />
            </span>
            <PixelBadge tone="purple">COMING SOON</PixelBadge>
          </div>

          <h2 className="font-pixel text-sm sm:text-base text-retro-purple mb-2">
            WHAT&apos;S NEXT: @pxlkit/voxel
          </h2>
          <p className="text-retro-muted max-w-xl mx-auto text-xs sm:text-sm leading-relaxed px-2">
            A <span className="text-retro-purple font-bold">3D voxel engine</span> for React is on the way.
            Procedural worlds, biome generation, interactive scenes — the retro aesthetic in full 3D.
          </p>
        </motion.div>

        {/* 3D Preview */}
        <motion.div
          className="relative mx-auto max-w-3xl"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="relative rounded-xl border border-retro-border/30 overflow-hidden bg-retro-surface/60 backdrop-blur-sm">
            <div className="w-full aspect-[16/10] min-h-[200px]">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="font-pixel text-xs text-retro-muted animate-pulse">Loading 3D…</div>
                  </div>
                }
              >
                <VoxelPreview />
              </Suspense>
            </div>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
              <span className="bg-retro-bg/80 backdrop-blur-sm border border-retro-border/40 rounded px-2 py-0.5 font-mono text-[8px] sm:text-[10px] text-retro-muted/60">
                🎮 Drag to orbit · @pxlkit/voxel preview
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tech pills */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-5 sm:mt-6">
          <PixelBadge tone="purple">React Three Fiber</PixelBadge>
          <PixelBadge tone="green">Procedural Worlds</PixelBadge>
          <PixelBadge tone="gold">9+ Biomes</PixelBadge>
          <PixelBadge tone="cyan">MIT License</PixelBadge>
        </div>

        <div className="mt-4 text-center">
          <div className="inline-block rounded-lg border border-retro-border/30 bg-retro-bg/60 px-3 py-1.5 font-mono text-[10px] sm:text-xs text-retro-muted/60">
            <span className="text-retro-purple mr-2">$</span>
            npm i @pxlkit/voxel{' '}
            <span className="text-retro-muted/40 ml-1">← coming soon</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── FEATURES ──────────────────── */
const FEATURES: { icon: PxlKitData | AnyIcon; title: string; description: string; color: string; animated?: boolean }[] = [
  {
    icon: Package,
    title: 'Ship Faster with Ready-Made Components',
    description:
      `${UI_COMPONENTS_COUNT}+ pixel-art components — buttons, inputs, cards, modals, tables, selects, badges, tooltips, and more. Drop them in, customize the theme, and ship.`,
    color: 'text-retro-green',
  },
  {
    icon: Lightning,
    title: 'Templates You Can Copy-Paste Today',
    description:
      'Hero sections, pricing tables, testimonials, CTAs, FAQs, headers, footers, and 5 full page templates. All responsive, themed, and production-ready.',
    color: 'text-retro-gold',
  },
  {
    icon: FireSword,
    title: 'Icons That Load in Microseconds',
    description:
      `${TOTAL_ICON_COUNT}+ hand-crafted 16×16 SVG icons across 7 thematic packs. Tree-shakeable — your bundle only includes what you actually use. Zero runtime dependencies.`,
    color: 'text-retro-red',
    animated: true,
  },
  {
    icon: Bell,
    title: 'Toast Notifications Built In',
    description:
      'Retro-styled toast system with animated pixel icons, progress bars, 6 screen positions, and smooth stacking. No extra libraries needed.',
    color: 'text-retro-purple',
  },
  {
    icon: Palette,
    title: 'Visual Icon Builder — Create in the Browser',
    description:
      'Paint-style pixel editor with retro palettes, drawing tools, undo/redo, and live code export. Design custom icons without leaving the browser.',
    color: 'text-retro-pink',
  },
  {
    icon: Robot,
    title: 'Let AI Generate Your Icons',
    description:
      'Our grid format is tailor-made for LLMs. Copy a prompt, paste the result, preview instantly. Works with ChatGPT, Claude, Gemini, and more.',
    color: 'text-retro-cyan',
  },
];

function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <PixelParallaxLayer speed={-0.03}>
            <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-green mb-2 sm:mb-3">EVERYTHING YOU NEED TO BUILD RETRO UIS</h2>
            <p className="text-retro-muted max-w-lg mx-auto text-xs sm:text-sm px-2">
              Components, templates, icons, toasts, a visual builder, and AI icon generation — a complete retro toolkit so you focus on your product, not pixel-art plumbing.
            </p>
          </PixelParallaxLayer>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="group"
            >
              <PixelCard
                title={feature.title}
                icon={
                  feature.animated && isAnimatedIcon(feature.icon)
                    ? <AnimatedPxlKitIcon icon={feature.icon} size={24} colorful />
                    : <PxlKitIcon icon={feature.icon as PxlKitData} size={24} colorful />
                }
              >
                <span className={feature.color}>{feature.description}</span>
              </PixelCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────── PARALLAX 3D ICONS (NEW) ──────────────────── */
function ParallaxShowcase() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30 bg-retro-surface/20 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-retro-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap justify-center">
            <PixelBadge tone="gold">NEW</PixelBadge>
            <PixelBadge tone="purple">Interactive 3D</PixelBadge>
            <PixelBadge tone="green">{ParallaxPack.length} Icons</PixelBadge>
          </div>
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-gold mb-2 sm:mb-3">
            ICONS THAT POP OFF THE SCREEN
          </h2>
          <p className="text-retro-muted max-w-2xl mx-auto text-xs sm:text-sm px-2">
            Not flat. Not boring. Each icon has multiple layers floating at different Z-depths with real CSS 3D perspective.
            Move your mouse to rotate —<span className="text-retro-gold font-bold"> click any icon</span> for
            particle bursts, layer explosions, and color shifts. Your users will love this.
          </p>
        </motion.div>

        {/* Hero icon — large CoolEmoji demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8 sm:mb-12"
        >
          <div className="relative p-6 sm:p-10 rounded-2xl border border-retro-gold/20 bg-retro-bg/60 backdrop-blur-sm">
            <div className="absolute inset-0 rounded-2xl border border-retro-gold/10 animate-pulse pointer-events-none" />
            <ParallaxPxlKitIcon
              icon={CoolEmoji}
              size={180}
              strength={20}
              layerGap={30}
              interactive
              colorful
            />
            <p className="mt-3 sm:mt-5 text-center font-mono text-[9px] sm:text-[10px] text-retro-muted">
              ↕ Move mouse to rotate · Click to interact
            </p>
          </div>
        </motion.div>

        {/* Full collection grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
        >
          {/* Pack header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 min-w-0">
            <h3 className="font-pixel text-[10px] sm:text-[11px] shrink-0 text-retro-gold">3D Parallax Pack</h3>
            <span className="font-mono text-[10px] text-retro-muted/60 shrink-0">
              {ParallaxPack.length} interactive icons
            </span>
            <div className="flex-1 border-t border-retro-border/20 min-w-[12px]" />
            <span className="hidden sm:block font-mono text-[10px] text-retro-muted/40 truncate">animated · 3-layer · click-reactive</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {ParallaxPack.map((icon) => (
              <motion.div
                key={icon.name}
                whileHover={{ scale: 1.05 }}
                className="relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg border border-retro-gold/20 bg-retro-surface/30 hover:bg-retro-card transition-colors group"
              >
                <ParallaxPxlKitIcon
                  icon={icon}
                  size={64}
                  strength={16}
                  interactive
                  colorful
                />
                <span className="font-mono text-[9px] text-retro-muted truncate w-full text-center group-hover:text-retro-gold transition-colors">
                  {icon.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info row below grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-6 sm:mt-10">
          {[
            { label: 'True 3D Depth', desc: 'CSS perspective + preserve-3d + per-layer translateZ', color: 'text-retro-gold' },
            { label: 'Page-Wide Tracking', desc: 'Mouse rotation works across the entire viewport', color: 'text-retro-cyan' },
            { label: 'Click Interactions', desc: 'Particle bursts, layer explosions, color shifts on click', color: 'text-retro-green' },
            { label: 'Animated Layers', desc: 'Frame-based animation per layer — glints, pulses, sparkles', color: 'text-retro-purple' },
          ].map((item) => (
            <div key={item.label} className="p-2.5 sm:p-3 rounded-lg border border-retro-border/20 bg-retro-surface/20">
              <h4 className={`font-pixel text-[8px] sm:text-[10px] ${item.color} mb-1`}>{item.label}</h4>
              <p className="text-retro-muted text-[8px] sm:text-[10px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── ICON SHOWCASE (ALL PACKS) ──────────────────── */
const SHOWCASE_PACKS: {
  pack: { id: string; name: string; description: string; icons: AnyIcon[] };
  color: string;
  borderColor: string;
  limit: number;
}[] = [
  { pack: GamificationPack, color: 'text-retro-gold',   borderColor: 'border-retro-gold/30',   limit: 8 },
  { pack: FeedbackPack,     color: 'text-retro-cyan',   borderColor: 'border-retro-cyan/30',   limit: 6 },
  { pack: SocialPack,       color: 'text-retro-pink',   borderColor: 'border-retro-pink/30',   limit: 6 },
  { pack: WeatherPack,      color: 'text-retro-purple', borderColor: 'border-retro-purple/30', limit: 6 },
  { pack: UiPack,           color: 'text-retro-text',   borderColor: 'border-retro-border/50', limit: 5 },
  { pack: EffectsPack,      color: 'text-retro-green',  borderColor: 'border-retro-green/30',  limit: 6 },
];

function IconShowcase() {
  const router = useRouter();

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-gold mb-2 sm:mb-3">{TOTAL_ICON_COUNT}+ HAND-CRAFTED PIXEL ART SVG ICONS</h2>
          <p className="text-retro-muted font-mono text-xs sm:text-sm max-w-lg mx-auto px-2">
            Every icon is a 16×16 pixel masterpiece. Organized into 7 themed packs so you find what you need instantly — and tree-shake the rest away.
          </p>
        </motion.div>

        <div className="space-y-8 sm:space-y-12">
          {SHOWCASE_PACKS.map(({ pack, color, borderColor, limit }) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
            >
              {/* Pack header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5 min-w-0">
                <h3 className={`font-pixel text-[10px] sm:text-[11px] shrink-0 ${color}`}>{pack.name}</h3>
                <span className="font-mono text-[9px] sm:text-[10px] text-retro-muted/60 shrink-0">
                  {pack.icons.length} icons
                </span>
                <div className="flex-1 border-t border-retro-border/20 min-w-[12px]" />
                <span className="hidden sm:block font-mono text-[10px] text-retro-muted/40 truncate">@pxlkit/{pack.id}</span>
              </div>

              {/* Icons grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5">
                {pack.icons.slice(0, limit).map((icon) => {
                  const animated = isAnimatedIcon(icon);
                  return (
                    <div
                      key={icon.name}
                      className={`relative flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-lg border ${borderColor} bg-retro-surface/30 hover:bg-retro-card transition-colors group cursor-pointer`}
                    >
                      {animated ? (
                        <AnimatedPxlKitIcon icon={icon} size={36} colorful className="group-hover:scale-110 transition-transform" />
                      ) : (
                        <PxlKitIcon icon={icon as PxlKitData} size={36} colorful className="group-hover:scale-110 transition-transform" />
                      )}
                      <span className="font-mono text-[9px] text-retro-muted truncate w-full text-center group-hover:text-retro-text transition-colors">
                        {icon.name}
                      </span>
                    </div>
                  );
                })}

                {/* "+N more" chip */}
                {pack.icons.length > limit && (
                  <Link
                    href={`/icons`}
                    className={`flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-lg border border-dashed ${borderColor} hover:bg-retro-surface/50 transition-colors`}
                  >
                    <span className={`font-pixel text-[10px] sm:text-xs ${color}`}>+{pack.icons.length - limit}</span>
                    <span className="font-mono text-[8px] sm:text-[9px] text-retro-muted">more</span>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <PixelButton
            tone="green"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} className="inline-block" />}
            onClick={() => router.push('/icons')}
          >
            Browse all {TOTAL_ICON_COUNT} icons
          </PixelButton>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── TOAST SECTION ──────────────────── */
const TOAST_DEMOS: { tone: ToastTone; title: string; message: string; icon: PxlKitData; color: string }[] = [
  { tone: 'success', title: 'SAVED',      message: 'Your changes have been saved',         icon: CheckCircle,      color: '#00ff88' },
  { tone: 'error',   title: 'ERROR',       message: 'Could not connect to server',          icon: XCircle,          color: '#ff6b6b' },
  { tone: 'info',    title: 'NEW UPDATE',  message: 'Pxlkit v2.0 is now available',         icon: InfoCircle,       color: '#4ecdc4' },
  { tone: 'warning', title: 'LOW STORAGE', message: 'Only 12MB remaining — clean up soon', icon: WarningTriangle,  color: '#ffa300' },
];

function ToastSection() {
  const router = useRouter();
  const { toast } = useToast();

  const fireDemo = useCallback((d: typeof TOAST_DEMOS[number]) => {
    toast({ tone: d.tone, title: d.title, message: d.message, icon: d.icon, position: 'top-right', duration: 3500 });
  }, [toast]);

  const fireBurst = useCallback(() => {
    TOAST_DEMOS.forEach((d, i) => {
      setTimeout(() => {
        toast({ tone: d.tone, title: d.title, message: d.message, icon: d.icon, position: 'top-right', duration: 5000 });
      }, i * 350);
    });
  }, [toast]);

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30 bg-retro-surface/20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-purple mb-2 sm:mb-3">TOASTS THAT FEEL ALIVE</h2>
          <p className="text-retro-muted max-w-lg mx-auto text-xs sm:text-sm px-2">
            Retro-styled notifications your users will actually notice. Animated pixel icons, smooth progress bars,
            6 screen positions, smart stacking. Click the buttons below — see them in action right now.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {TOAST_DEMOS.map((d) => (
            <motion.div
              key={d.tone}
              whileHover={{ scale: 1.04, y: -2 }}
              className="group"
            >
              <PixelCard
                title={d.title}
                icon={<PxlKitIcon icon={d.icon} size={20} colorful className="shrink-0" />}
                footer={
                  <PixelButton tone="purple" size="sm" onClick={() => fireDemo(d)}>
                    Trigger Toast
                  </PixelButton>
                }
              >
                {d.message}
              </PixelCard>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <PixelButton tone="gold" onClick={fireBurst}>Stack All 4</PixelButton>
          </motion.div>
          <PixelButton tone="cyan" variant="ghost" onClick={() => router.push('/ui-kit#pixel-toast')}>
            Explore PixelToast
          </PixelButton>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── HOW IT WORKS ──────────────────── */
function HowItWorks() {
  const sampleCode = `import type { PxlKitData } from '@pxlkit/core';

export const Trophy: PxlKitData = {
  name: 'trophy',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '..GGGGGGGGGGGG..',
    '.GG.YYYYYYYY.GG.',
    '.G..YYYYYYYY..G.',
    '.G..YYYWYYYY..G.',
    '.GG.YYYYYYYY.GG.',
    '..GGGGGGGGGGGG..',
    '....GGGGGGGG....',
    '.....GGGGGG.....',
    '......GGGG......',
    '......GGGG......',
    '.....DDDDDD.....',
    '....DDDDDDDD....',
    '....BBBBBBBB....',
    '...BBBBBBBBBB...',
    '................',
  ],
  palette: {
    'G': '#FFD700',  // Gold
    'Y': '#FFF44F',  // Yellow highlight
    'D': '#B8860B',  // Dark gold
    'B': '#8B4513',  // Brown base
    'W': '#FFFFFF',  // White shine
  },
  tags: ['trophy', 'achievement'],
};`;

  const usageCode = `import { PxlKitIcon } from '@pxlkit/core';
import { Trophy } from '@pxlkit/gamification';

// Colorful rendering
<PxlKitIcon icon={Trophy} size={32} colorful />

// Monochrome (inherits text color)
<PxlKitIcon icon={Trophy} size={32} />

// Custom monochrome color
<PxlKitIcon icon={Trophy} size={48} color="#FF0000" />`;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-cyan mb-2 sm:mb-3">
            FROM NPM INSTALL TO PIXEL-PERFECT IN 3 STEPS
          </h2>
          <p className="text-retro-muted max-w-xl mx-auto text-xs sm:text-sm px-2">
            Icons are simple character grids — each character maps to a color.
            No complex APIs, no config files, no learning curve. Install, import, render.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Definition code */}
          <PixelParallaxLayer speed={0.04}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-retro-red" />
              <span className="w-3 h-3 rounded-full bg-retro-gold" />
              <span className="w-3 h-3 rounded-full bg-retro-green" />
              <span className="ml-2 font-mono text-xs text-retro-muted">
                trophy.ts — Icon Definition
              </span>
            </div>
            <pre className="code-block text-xs leading-relaxed overflow-x-auto">
              <code className="text-retro-text/90">{sampleCode}</code>
            </pre>
          </motion.div>
          </PixelParallaxLayer>

          {/* Usage + preview */}
          <PixelParallaxLayer speed={-0.04}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-retro-red" />
              <span className="w-3 h-3 rounded-full bg-retro-gold" />
              <span className="w-3 h-3 rounded-full bg-retro-green" />
              <span className="ml-2 font-mono text-xs text-retro-muted">
                App.tsx — Usage
              </span>
            </div>
            <pre className="code-block text-xs leading-relaxed mb-6 overflow-x-auto">
              <code className="text-retro-text/90">{usageCode}</code>
            </pre>

            {/* Live preview */}
            <div className="p-6 rounded-xl border border-retro-border bg-retro-surface">
              <p className="font-mono text-xs text-retro-muted mb-4">
                Live Preview:
              </p>
              <div className="flex flex-wrap items-end gap-4 sm:gap-6">
                <div className="text-center">
                  <PxlKitIcon icon={Trophy} size={48} colorful />
                  <span className="block mt-2 font-mono text-[9px] text-retro-muted">Trophy</span>
                </div>
                <div className="text-center">
                  <PxlKitIcon icon={Heart} size={48} colorful />
                  <span className="block mt-2 font-mono text-[9px] text-retro-muted">Heart</span>
                </div>
                <div className="text-center">
                  <PxlKitIcon icon={Sun} size={48} colorful />
                  <span className="block mt-2 font-mono text-[9px] text-retro-muted">Sun</span>
                </div>
                <div className="text-center">
                  <PxlKitIcon icon={Bell} size={48} colorful />
                  <span className="block mt-2 font-mono text-[9px] text-retro-muted">Bell</span>
                </div>
                <div className="text-center">
                  <AnimatedPxlKitIcon icon={FireSword} size={48} colorful />
                  <span className="block mt-2 font-mono text-[9px] text-retro-gold">Animated</span>
                </div>
                <div className="text-center text-retro-green">
                  <PxlKitIcon icon={Trophy} size={48} />
                  <span className="block mt-2 font-mono text-[9px] text-retro-muted">mono</span>
                </div>
              </div>
            </div>
          </motion.div>
          </PixelParallaxLayer>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── AI SECTION ──────────────────── */
const INCOMING_ICON_KEY = 'pxlkit-builder-incoming';

function AISection() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<AnyIcon | null>(null);
  const [mode, setMode] = useState<'static' | 'animated'>('static');
  const [parseError, setParseError] = useState('');

  function handlePreview() {
    setParseError('');
    const parsed = parseAnyIconCode(code);
    if (!parsed) {
      setParseError('Could not parse — check the JSON format');
      setPreview(null);
      return;
    }
    setPreview(parsed);
  }

  function handleOpenInBuilder() {
    if (!preview) return;
    try {
      localStorage.setItem(INCOMING_ICON_KEY, JSON.stringify(preview));
    } catch {}
    router.push('/builder');
  }

  const staticPrompt = `Generate a pixel art icon in this exact JSON format.
You can choose 8x8, 16x16, 24x24, 32x32, 48x48, or 64x64.

{
  "name": "icon-name",
  "size": 16,
  "category": "your-category",
  "grid": [
    "................",
    "................",
    "......AABB......",
    ".....AACCBB.....",
    "....AACCCCBB....",
    "....ACCCCCCB....",
    "....ACCDDCCB....",
    "....ACCDDCCB....",
    "....ACCCCCCB....",
    "....AACCCCBB....",
    ".....AACCBB.....",
    "......AABB......",
    "................",
    "................",
    "................",
    "................"
  ],
  "palette": {
    "A": "#1E40AF",
    "B": "#3B82F6",
    "C": "#60A5FA",
    "D": "#FFFFFF"
  },
  "tags": ["example", "orb"]
}

Rules:
- Grid must have exactly N rows of N characters (matching "size")
- "." means transparent (empty pixel)
- Each non-"." character must appear in the palette
- Use 3-6 colors max for clean pixel art
- Think in terms of pixels on a grid

Create a [DESCRIBE YOUR ICON HERE] icon.`;

  const animatedPrompt = `Generate an animated pixel art icon in this exact JSON format.
You can choose 8x8, 16x16, 24x24, 32x32, 48x48, or 64x64.

{
  "name": "pulse-dot",
  "size": 16,
  "category": "effects",
  "palette": {
    "A": "#FF4500",
    "B": "#FF8C00",
    "C": "#FFD700"
  },
  "frames": [
    {
      "grid": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "......AA........",
        "......AA........",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................"
      ]
    },
    {
      "grid": [
        "................",
        "................",
        "................",
        "................",
        ".....BBBB.......",
        "....BAAAAB......",
        "....BAAAAB......",
        ".....BBBB.......",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................"
      ]
    },
    {
      "grid": [
        "................",
        "................",
        "................",
        "....CCCCCC......",
        "...CBBBBBC......",
        "...CBAAABC......",
        "...CBAAABC......",
        "...CBBBBBC......",
        "....CCCCCC......",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................"
      ]
    }
  ],
  "frameDuration": 200,
  "loop": true,
  "tags": ["pulse", "animated"]
}

Rules:
- All frames share the same base palette
- Each frame has its own "grid" (same NxN size)
- A frame can optionally override palette colors with "palette": {}
- frameDuration is in milliseconds per frame
- Use 3-8 frames for smooth animation
- "." means transparent pixel
- 3-6 colors max, think in pixels

Create an animated [DESCRIBE YOUR ICON HERE] icon.`;

  const activePrompt = mode === 'static' ? staticPrompt : animatedPrompt;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30 bg-retro-surface/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-purple mb-2 sm:mb-3">
            CREATE ICONS WITH AI IN SECONDS
          </h2>
          <p className="text-retro-muted max-w-xl mx-auto text-xs sm:text-sm px-2">
            Our grid format was designed for AI from day one. Copy the prompt,
            ask ChatGPT, Claude, or any LLM — paste the result and see your icon instantly.
            Then polish it in the visual builder.
          </p>
          {/* Mode toggle */}
          <div className="inline-flex gap-1 mt-4 p-1 bg-retro-bg rounded-lg border border-retro-border/30">
            <button
              onClick={() => setMode('static')}
              className={`px-4 py-1.5 text-xs font-mono rounded transition-all ${
                mode === 'static'
                  ? 'bg-retro-green/20 text-retro-green border border-retro-green/40'
                  : 'text-retro-muted hover:text-retro-text border border-transparent'
              }`}
            >
              Static Icon
            </button>
            <button
              onClick={() => setMode('animated')}
              className={`px-4 py-1.5 text-xs font-mono rounded transition-all ${
                mode === 'animated'
                  ? 'bg-retro-purple/20 text-retro-purple border border-retro-purple/40'
                  : 'text-retro-muted hover:text-retro-text border border-transparent'
              }`}
            >
              Animated Icon
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Prompt template */}
          <div>
            <h3 className="font-mono text-sm text-retro-green mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === 'static' ? 'bg-retro-green' : 'bg-retro-purple'}`} />
              {mode === 'static' ? 'Static' : 'Animated'} Prompt Template
            </h3>
            <pre className="code-block text-xs leading-relaxed h-[400px] overflow-y-auto">
              <code className="text-retro-muted">{activePrompt}</code>
            </pre>
            <div className="mt-3">
              <PixelButton tone={mode === 'static' ? 'green' : 'purple'} size="sm" onClick={() => navigator.clipboard?.writeText(activePrompt)}>
                Copy Prompt
              </PixelButton>
            </div>
          </div>

          {/* Paste & preview */}
          <div>
            <h3 className="font-mono text-sm text-retro-cyan mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-retro-cyan rounded-full" />
              Paste AI Output
            </h3>
            <PixelTextarea
              label="AI Output"
              value={code}
              onChange={(e) => { setCode(e.target.value); setParseError(''); }}
              placeholder={mode === 'static' ? 'Paste the AI-generated static icon JSON here...' : 'Paste the AI-generated animated icon JSON here...'}
              tone="cyan"
              className="h-[300px] text-base sm:text-xs"
            />
            <div className="flex flex-wrap gap-3 mt-3">
              <PixelButton tone="cyan" size="sm" onClick={handlePreview}>
                Preview Icon
              </PixelButton>
              <PixelButton
                tone="gold"
                size="sm"
                variant="ghost"
                onClick={handleOpenInBuilder}
                disabled={!preview}
              >
                Open in Builder →
              </PixelButton>
            </div>
            {parseError && (
              <p className="mt-2 text-xs font-mono text-retro-red">{parseError}</p>
            )}

            {/* Preview area */}
            {preview && (
              <div className="mt-6 p-6 rounded-xl border border-retro-border bg-retro-surface flex flex-col items-center justify-center gap-3">
                {isAnimatedIcon(preview) ? (
                  <>
                    <AnimatedPxlKitIcon icon={preview} size={128} colorful />
                    <span className="text-[10px] font-mono text-retro-muted">
                      {preview.frames.length} frames · {Math.round(1000 / preview.frameDuration)} FPS · {preview.size}×{preview.size}
                    </span>
                  </>
                ) : (
                  <>
                    <PxlKitIcon icon={preview} size={128} colorful />
                    <span className="text-[10px] font-mono text-retro-muted">
                      {preview.size}×{preview.size} · {Object.keys(preview.palette).length} colors
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── PRICING PREVIEW ──────────────────── */
function PricingPreview() {
  const router = useRouter();

  const plans = [
    {
      name: 'Community',
      price: 'Free',
      suffix: 'forever — no credit card',
      color: 'green' as const,
      features: [`${TOTAL_ICON_COUNT}+ pixel art icons`, '7 thematic packs', `${UI_COMPONENTS_COUNT}+ React components`, 'All section templates', 'Asset attribution required'],
    },
    {
      name: 'Indie',
      price: '$9.50',
      originalPrice: '$19',
      suffix: 'one-time · 1 project · lifetime',
      color: 'gold' as const,
      popular: true,
      features: ['No attribution needed', '1 commercial project', 'Lifetime updates included', 'All current icon packs'],
    },
    {
      name: 'Team',
      price: '$24.50',
      originalPrice: '$49',
      suffix: 'one-time · unlimited projects',
      color: 'cyan' as const,
      features: ['Unlimited commercial projects', 'All future packs free', 'Priority support', 'Sponsor logo on GitHub'],
    },
  ];

  const toneColors = {
    green: { border: 'border-retro-green/30', text: 'text-retro-green', bg: 'bg-retro-green/5' },
    gold: { border: 'border-retro-gold/30', text: 'text-retro-gold', bg: 'bg-retro-gold/5' },
    cyan: { border: 'border-retro-cyan/30', text: 'text-retro-cyan', bg: 'bg-retro-cyan/5' },
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <PixelBadge tone="red"><span aria-label="50% off launch price">🔥 50% OFF — Launch Price</span></PixelBadge>
          </div>
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-green mb-2 sm:mb-3">
            PAY ONCE, USE FOREVER
          </h2>
          <p className="text-retro-muted max-w-lg mx-auto text-xs sm:text-sm px-2">
            MIT code is free, and icon packs are free with attribution. Need no-attribution asset use?{' '}
            <span className="text-retro-gold font-bold">Grab a lifetime license at 50% off</span> — this price won&apos;t last.
            One payment, no subscriptions, no surprises.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          {plans.map((plan) => {
            const tc = toneColors[plan.color];
            return (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                className={`relative rounded-xl border ${tc.border} ${tc.bg} p-5 transition-all hover:scale-[1.02] ${
                  plan.popular ? 'ring-1 ring-retro-gold/30' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <PixelBadge tone="gold">Most Popular</PixelBadge>
                  </div>
                )}
                <h3 className={`font-pixel text-sm ${tc.text} mb-1 ${plan.popular ? 'mt-2' : ''}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-pixel text-2xl text-retro-text">{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="font-mono text-xs text-retro-muted line-through">{plan.originalPrice}</span>
                  )}
                </div>
                <p className="font-mono text-[10px] text-retro-muted mb-4">{plan.suffix}</p>
                <ul className="space-y-1.5 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-retro-muted">
                      <span className={`w-1.5 h-1.5 rounded-full ${tc.text} bg-current shrink-0`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <PixelButton
                  tone={plan.color}
                  size="sm"
                  variant={plan.popular ? 'solid' : 'ghost'}
                  onClick={() => router.push('/pricing')}
                  className="w-full"
                >
                  {plan.price === 'Free' ? 'Get Started' : 'View Details'}
                </PixelButton>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────── FAQ ──────────────────── */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Is Pxlkit really free?',
      a: 'Yes. The code packages (UI kit, core, parallax) are MIT-licensed and completely free. The icon packs are free with a small attribution link. Paid licenses only remove the icon/asset attribution requirement.',
    },
    {
      q: 'What templates and sections are included?',
      a: 'Pxlkit includes 29 section templates across 8 categories: hero sections, headers, footers, CTAs, pricing tables, testimonials, FAQ sections, and feature grids — each with 3 design variants. Plus 5 complete page templates: SaaS landing, portfolio, indie game, admin dashboard, and blog.',
    },
    {
      q: 'What React components does the UI kit include?',
      a: `The UI kit provides ${UI_COMPONENTS_COUNT}+ production-ready components: buttons, inputs, textareas, selects, checkboxes, switches, cards, modals, tables, badges, tooltips, toasts, code blocks, and more. All are TypeScript-first, Tailwind-powered, and fully themed.`,
    },
    {
      q: 'Does Pxlkit work with Next.js?',
      a: 'Yes. Pxlkit is built for React with TypeScript and integrates seamlessly with Next.js, Vite, Create React App, Remix, and any React setup. The SVG icons work in any framework since they\'re pure markup.',
    },
    {
      q: 'Will it slow down my app?',
      a: 'No. Every icon and component is tree-shakeable — your final bundle only includes the code you actually import. Icons are pure SVG with zero runtime dependencies. The UI kit has minimal peer dependencies (React + Tailwind).',
    },
    {
      q: 'Can I use Pxlkit in a commercial product?',
      a: 'Absolutely. MIT code packages can be used commercially without attribution. If you ship the icon packs and want to remove attribution there too, grab an Indie ($9.50) or Team ($24.50) asset license.',
    },
    {
      q: 'How many icons are included?',
      a: `${TOTAL_ICON_COUNT}+ hand-crafted 16×16 SVG icons across 7 themed packs: UI controls, gamification, social, weather, feedback, animated effects, and 3D parallax. All are tree-shakeable React components.`,
    },
    {
      q: 'How do I create custom icons?',
      a: 'Three ways: use the visual builder on our website, let AI generate them with our prompt templates (works with ChatGPT, Claude, Gemini, etc.), or hand-code the simple grid + palette JSON format directly.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30 bg-retro-surface/20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-cyan mb-2 sm:mb-3">
            QUESTIONS? WE&apos;VE GOT ANSWERS
          </h2>
          <p className="text-retro-muted text-xs sm:text-sm px-2">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-4 sm:px-5 py-3 sm:py-4 rounded-lg border border-retro-border/30 bg-retro-bg/60 hover:bg-retro-surface/50 transition-colors group"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-mono text-xs sm:text-sm text-retro-text group-hover:text-retro-green transition-colors">
                    {faq.q}
                  </h3>
                  <span className={`font-pixel text-retro-muted text-xs shrink-0 transition-transform ${openIndex === i ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </div>
                {openIndex === i && (
                  <p className="mt-2 sm:mt-3 text-retro-muted text-xs sm:text-sm leading-relaxed pr-6">
                    {faq.a}
                  </p>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── CTA ──────────────────── */
function CTASection() {
  const router = useRouter();

  return (
    <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30 overflow-hidden">
      {/* Decorative parallax background elements */}
      <PixelMouseParallax strength={40} invert>
        <div className="absolute top-10 left-[10%] opacity-10 pointer-events-none">
          <PxlKitIcon icon={Trophy} size={64} colorful />
        </div>
      </PixelMouseParallax>
      <PixelMouseParallax strength={25}>
        <div className="absolute bottom-10 right-[12%] opacity-10 pointer-events-none">
          <PxlKitIcon icon={Lightning} size={56} colorful />
        </div>
      </PixelMouseParallax>
      <PixelParallaxLayer speed={0.08} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none">
        <div className="w-full h-full bg-retro-green/5 rounded-full blur-[120px]" />
      </PixelParallaxLayer>

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <PixelParallaxLayer speed={-0.03}>
            <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-green mb-3 sm:mb-4">
              YOUR NEXT PROJECT DESERVES A RETRO UI KIT
            </h2>
            <p className="text-retro-muted mb-4 sm:mb-5 max-w-md mx-auto text-xs sm:text-sm px-2">
              Join developers shipping retro-styled interfaces in minutes instead of days.
              {UI_COMPONENTS_COUNT}+ components, {TOTAL_ICON_COUNT}+ icons, ready-to-use templates — MIT code, and ready when you are.
            </p>
            <div className="rounded-lg border border-retro-border bg-retro-bg/80 px-3 sm:px-4 py-2 sm:py-3 font-mono text-[10px] sm:text-xs text-retro-muted overflow-x-auto max-w-sm mx-auto mb-6 sm:mb-8">
              <span className="text-retro-green mr-2">$</span>
              npm i @pxlkit/core @pxlkit/ui-kit
            </div>
          </PixelParallaxLayer>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PixelButton tone="green" onClick={() => router.push('/docs')}>
              Get Started — It&apos;s Free
            </PixelButton>
            <PixelButton tone="gold" variant="ghost" onClick={() => router.push('/pricing')}>
              View Pricing
            </PixelButton>
            <PixelButton tone="neutral" variant="ghost" onClick={() => window.open('https://github.com/joangeldelarosa/pxlkit', '_blank', 'noopener,noreferrer')}>
              Star on GitHub
            </PixelButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
