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
import { TOTAL_ICON_COUNT } from './HeroCollage';
import { HeroCinematic, StatCardStrip } from './hero';
import { useToast } from './ToastProvider';
import type { ToastTone } from './ToastProvider';
import { WhatsNewStrip, type WhatsNewItem } from './whats-new-strip';
import {
  PixelAccordion,
  PixelBadge,
  PixelBento,
  PixelBentoCell,
  PixelButton,
  PixelCard,
  PixelCluster,
  PixelContainer,
  PixelEqualHeightGrid,
  PixelFeatureCard,
  PixelGrid,
  PixelMouseParallax,
  PixelParallaxLayer,
  PixelSectionHeader,
  PixelSegmented,
  PixelStatGroup,
  PixelTextarea,
  UI_KIT_COMPONENTS,
} from '@pxlkit/ui-kit';

const UI_COMPONENTS_COUNT = UI_KIT_COMPONENTS.length;

const VoxelPreview = dynamic(() => import('./VoxelPreview'), {
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

const WHATS_NEW_ITEMS: WhatsNewItem[] = [
  { name: 'PixelDataTable', category: 'data', href: '/ui-kit#pixel-data-table', isNew: true },
  { name: 'PixelStepper', category: 'navigation', href: '/ui-kit#pixel-stepper', isNew: true },
  { name: 'PixelSidebar', category: 'navigation', href: '/ui-kit#pixel-sidebar', isNew: true },
  { name: 'PixelTimeline', category: 'data', href: '/ui-kit#pixel-timeline', isNew: true },
  { name: 'PixelCarousel', category: 'data', href: '/ui-kit#pixel-carousel', isNew: true },
  { name: 'PixelCalendarGrid', category: 'forms', href: '/ui-kit#pixel-calendar-grid', isNew: true },
  { name: 'PixelDatePicker', category: 'forms', href: '/ui-kit#pixel-date-picker', isNew: true },
  { name: 'PixelColorInput', category: 'forms', href: '/ui-kit#pixel-color-input', isNew: true },
  { name: 'PixelStatGroup', category: 'data', href: '/ui-kit#pixel-stat-group', isNew: true },
  { name: 'PixelChartPrimitives', category: 'data', href: '/ui-kit#pixel-chart-primitives', isNew: true },
];

export function LandingPageClient() {
  return (
    <div className="relative overflow-x-hidden w-full max-w-[100vw]">
      <HeroCinematic />
      <StatCardStrip />
      <WhatsNewStrip
        version="2.0.0"
        date="2026-05-31"
        items={WHATS_NEW_ITEMS}
        changelogHref="/templates/changelog"
      />
      <PillarsBento />
      <FeaturesShowcase />
      <TemplatesTeaser />
      <StatsStrip />
      <HowItWorks />
      <ParallaxShowcase />
      <IconShowcase />
      <ToastSection />
      <AISection />
      <PricingPreview />
      <FAQSection />
      <VoxelComingSoon />
      <LandingCta />
    </div>
  );
}

/* ──────────────────── 3-PILLAR BENTO ──────────────────── */
function PillarsBento() {
  return (
    <PixelContainer as="section" maxWidth="xl" padding="md">
      <PixelSectionHeader
        eyebrow="Built on three pillars"
        title="Pick the aesthetic. Keep the engineering."
        description="A switchable surface, accessibility on every interactive, and batteries you'd otherwise spend two sprints assembling. Same kit, three reasons it's worth keeping."
        align="center"
        titleTone="cyan"
        size="md"
      />

      <div className="mt-10">
        <PixelBento columns={3} gap={4}>
          <PixelBentoCell tone="cyan" kind="feature">
            <div className="flex items-center gap-3 mb-1">
              <PxlKitIcon icon={Palette} size={24} colorful />
              <h3 className="font-pixel text-sm text-retro-cyan">Surface system</h3>
            </div>
            <p className="text-sm text-retro-muted leading-relaxed">
              Flip the whole kit between an 8-bit pixel aesthetic and a flat linear
              one with a single <strong>surface</strong> prop. Same components,
              same API, different look — no fork, no rewrite when the brand pivots.
            </p>
          </PixelBentoCell>

          <PixelBentoCell tone="green" kind="feature">
            <div className="flex items-center gap-3 mb-1">
              <PxlKitIcon icon={CheckCircle} size={24} colorful />
              <h3 className="font-pixel text-sm text-retro-green">Accessibility-first</h3>
            </div>
            <p className="text-sm text-retro-muted leading-relaxed">
              WAI-ARIA roles, keyboard nav, focus rings, and reduced-motion
              fallbacks ship with every interactive — not retrofitted later.
              WCAG 2.1 contrast tokens by default.
            </p>
          </PixelBentoCell>

          <PixelBentoCell tone="gold" kind="feature">
            <div className="flex items-center gap-3 mb-1">
              <PxlKitIcon icon={Package} size={24} colorful />
              <h3 className="font-pixel text-sm text-retro-gold">Batteries-included</h3>
            </div>
            <p className="text-sm text-retro-muted leading-relaxed">
              DataTable, Stepper, Sidebar, Timeline, Calendar, Charts, OTPInput,
              Toasts — the boring bits are already done. Drop them in, theme once,
              focus on what makes your product different.
            </p>
          </PixelBentoCell>
        </PixelBento>
      </div>
    </PixelContainer>
  );
}

/* ──────────────────── FEATURES (equal-height, 6 cards) ──────────────────── */
type FeatureRow = {
  icon: PxlKitData | AnyIcon;
  title: string;
  description: string;
  tone: 'green' | 'gold' | 'cyan' | 'purple' | 'pink' | 'red';
  animated?: boolean;
};

const FEATURES: FeatureRow[] = [
  {
    icon: Package,
    title: 'Skip the design-system sprint',
    description: `${UI_COMPONENTS_COUNT}+ accessible React primitives — buttons, inputs, DataTable, Stepper, Calendar, Sidebar, Timeline, Charts — wired to the same surface/tone/density contract. Drop them in and theme once.`,
    tone: 'green',
  },
  {
    icon: Lightning,
    title: 'Land your first screens this week',
    description: 'Sections (hero, pricing, FAQ, header, footer) and 6 full-page layouts you copy-paste into the route. Dark + light included, responsive out of the box.',
    tone: 'gold',
  },
  {
    icon: FireSword,
    title: 'Bundle stays tiny — only what you import',
    description: `${TOTAL_ICON_COUNT}+ hand-crafted 16×16 SVG icons across 7 packs, fully tree-shakeable. Pure SVG, zero runtime deps, no font loading. Your bundle only carries what you actually render.`,
    tone: 'red',
    animated: true,
  },
  {
    icon: Bell,
    title: 'Notify users without picking a toast library',
    description: 'Animated pixel icons, progress bars, 6 screen positions, smooth stacking, and a useToast() hook — already inside the kit. One less dependency to pin.',
    tone: 'purple',
  },
  {
    icon: Palette,
    title: 'Make a brand icon without opening Figma',
    description: 'A paint-style pixel editor with retro palettes, undo/redo, and live code export. Sketch a one-off icon in the browser, paste the result straight into your repo.',
    tone: 'pink',
  },
  {
    icon: Robot,
    title: 'Let an LLM draft icons for you',
    description: 'The grid format reads like ASCII art with a legend — perfect for ChatGPT, Claude, or Gemini. Copy the prompt, paste the output, preview instantly.',
    tone: 'cyan',
  },
];

function FeaturesShowcase() {
  return (
    <PixelContainer as="section" maxWidth="xl" padding="md">
      <PixelSectionHeader
        eyebrow="What you actually get back"
        title="The hours you'd spend rolling your own."
        description="Six reasons teams swap their half-built design system for Pxlkit — measured in days of work you don't repeat."
        align="center"
        titleTone="green"
        size="md"
      />

      <motion.div
        className="mt-10"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
      >
        <PixelEqualHeightGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          gap={6}
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={fadeInUp}>
              <PixelFeatureCard
                tone={f.tone}
                iconSize={56}
                title={f.title}
                description={f.description}
                descriptionLines={4}
                icon={
                  f.animated && isAnimatedIcon(f.icon)
                    ? <AnimatedPxlKitIcon icon={f.icon} size={28} colorful />
                    : <PxlKitIcon icon={f.icon as PxlKitData} size={28} colorful />
                }
              />
            </motion.div>
          ))}
        </PixelEqualHeightGrid>
      </motion.div>
    </PixelContainer>
  );
}

/* ──────────────────── TEMPLATES TEASER (6 PixelCard) ──────────────────── */
type TemplateLink = {
  slug: string;
  name: string;
  description: string;
  tone: 'green' | 'gold' | 'cyan' | 'purple' | 'pink' | 'neutral';
};

const TEMPLATE_LINKS: TemplateLink[] = [
  { slug: 'dashboards', name: 'Admin dashboards', description: 'Perfect for: ops consoles, internal tools, and analytics views you ship on Monday.', tone: 'cyan' },
  { slug: 'changelog', name: 'Changelog', description: 'Perfect for: release notes and public roadmap drops that look intentional, not improvised.', tone: 'gold' },
  { slug: 'docs', name: 'Docs site', description: 'Perfect for: API references and SDK guides with MDX content and live code blocks.', tone: 'green' },
  { slug: 'landing-full', name: 'Full landing', description: 'Perfect for: product launches and SaaS homepages — hero through FAQ, ready to A/B.', tone: 'purple' },
  { slug: 'portfolio', name: 'Portfolio', description: 'Perfect for: designer/engineer portfolios and agency reels that need a unique surface.', tone: 'pink' },
  { slug: 'ecommerce', name: 'E-commerce', description: 'Perfect for: storefronts and checkout flows — product cards, cart drawer, stepper included.', tone: 'neutral' },
];

function TemplatesTeaser() {
  const router = useRouter();

  return (
    <PixelContainer
      as="section"
      maxWidth="xl"
      padding="md"
      className="bg-retro-surface/10 border-t border-retro-border/30"
    >
      <PixelSectionHeader
        eyebrow="Templates"
        title="Skip the first day of every project."
        description="Six full layouts wired end-to-end with the kit. Dark + light included, components already composed — open the file, swap the copy, ship."
        align="center"
        titleTone="gold"
        size="md"
        actions={
          <PixelButton
            tone="gold"
            size="md"
            variant="ghost"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} className="inline-block" />}
            onClick={() => router.push('/templates')}
          >
            Browse all templates
          </PixelButton>
        }
      />

      <div className="mt-10">
        <PixelGrid cols={{ base: 1, sm: 2, lg: 3 }} gap={4}>
          {TEMPLATE_LINKS.map((tpl) => (
            <PixelCard
              key={tpl.slug}
              tone={tpl.tone}
              interactive
              title={tpl.name}
              onClick={() => router.push(`/templates/${tpl.slug}`)}
              footer={
                <span className="font-mono text-[10px] text-retro-muted/70">
                  /templates/{tpl.slug} →
                </span>
              }
            >
              {tpl.description}
            </PixelCard>
          ))}
        </PixelGrid>
      </div>
    </PixelContainer>
  );
}

/* ──────────────────── STATS STRIP (PixelStatGroup) ──────────────────── */
function StatsStrip() {
  const stats = [
    { label: 'Components', value: '95+', tone: 'green' as const },
    { label: 'Tests', value: '745', tone: 'cyan' as const },
    { label: 'Waves shipped', value: '5', tone: 'gold' as const },
    { label: 'A11y baseline', value: 'WCAG 2.1', tone: 'purple' as const },
  ];

  return (
    <PixelContainer as="section" maxWidth="xl" padding="sm">
      <PixelStatGroup
        layout="grid"
        columns={4}
        tone="cyan"
        aria-label="Pxlkit v2.0.0 by the numbers"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-4 sm:p-6 flex flex-col items-center text-center gap-1"
          >
            <span className={`font-pixel text-base sm:text-xl text-retro-${s.tone}`}>
              {s.value}
            </span>
            <span className="font-mono text-[10px] sm:text-xs text-retro-muted uppercase tracking-wider">
              {s.label}
            </span>
          </div>
        ))}
      </PixelStatGroup>
    </PixelContainer>
  );
}

/* ──────────────────── HOW IT WORKS (preserved) ──────────────────── */
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
    'G': '#FFD700',
    'Y': '#FFF44F',
    'D': '#B8860B',
    'B': '#8B4513',
    'W': '#FFFFFF',
  },
  tags: ['trophy', 'achievement'],
};`;

  const usageCode = `import { PxlKitIcon } from '@pxlkit/core';
import { Trophy } from '@pxlkit/gamification';

<PxlKitIcon icon={Trophy} size={32} colorful />
<PxlKitIcon icon={Trophy} size={32} />
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
            FROM NPM INSTALL TO RENDERED ICON IN 3 STEPS
          </h2>
          <p className="text-retro-muted max-w-xl mx-auto text-xs sm:text-sm px-2">
            Icons are simple character grids where each letter maps to a color — readable by humans and by LLMs.
            Install, import, render.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
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
                <span className="ml-2 font-mono text-xs text-retro-muted">App.tsx — Usage</span>
              </div>
              <pre className="code-block text-xs leading-relaxed mb-6 overflow-x-auto">
                <code className="text-retro-text/90">{usageCode}</code>
              </pre>

              <div className="p-6 rounded-xl border border-retro-border bg-retro-surface">
                <p className="font-mono text-xs text-retro-muted mb-4">Live Preview:</p>
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

/* ──────────────────── PARALLAX SHOWCASE (preserved) ──────────────────── */
function ParallaxShowcase() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-retro-border/30 bg-retro-surface/20 relative overflow-hidden">
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
            Multi-layer 3D icons with mouse rotation and click interactions — particles, layer explosions, color shifts.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 min-w-0">
            <h3 className="font-pixel text-[10px] sm:text-[11px] shrink-0 text-retro-gold">3D Parallax Pack</h3>
            <span className="font-mono text-[10px] text-retro-muted/60 shrink-0">
              {ParallaxPack.length} interactive icons
            </span>
            <div className="flex-1 border-t border-retro-border/20 min-w-[12px]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {ParallaxPack.slice(0, 10).map((icon) => (
              <motion.div
                key={icon.name}
                whileHover={{ scale: 1.05 }}
                className="relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg border border-retro-gold/20 bg-retro-surface/30 hover:bg-retro-card transition-colors group"
              >
                <ParallaxPxlKitIcon
                  icon={icon}
                  size={56}
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
      </div>
    </section>
  );
}

/* ──────────────────── ICON SHOWCASE (preserved, slim) ──────────────────── */
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
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-gold mb-2 sm:mb-3">
            {TOTAL_ICON_COUNT}+ HAND-CRAFTED PIXEL ART SVG ICONS
          </h2>
          <p className="text-retro-muted font-mono text-xs sm:text-sm max-w-lg mx-auto px-2">
            Every icon is a 16×16 pixel masterpiece across 7 themed packs — tree-shake the rest away.
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
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5 min-w-0">
                <h3 className={`font-pixel text-[10px] sm:text-[11px] shrink-0 ${color}`}>{pack.name}</h3>
                <span className="font-mono text-[9px] sm:text-[10px] text-retro-muted/60 shrink-0">
                  {pack.icons.length} icons
                </span>
                <div className="flex-1 border-t border-retro-border/20 min-w-[12px]" />
                <span className="hidden sm:block font-mono text-[10px] text-retro-muted/40 truncate">
                  @pxlkit/{pack.id}
                </span>
              </div>

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

                {pack.icons.length > limit && (
                  <Link
                    href="/icons"
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

/* ──────────────────── TOAST SECTION (preserved) ──────────────────── */
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
          <h2 className="font-pixel text-sm sm:text-base md:text-lg text-retro-purple mb-2 sm:mb-3">DROP A TOAST IN ONE LINE</h2>
          <p className="text-retro-muted max-w-lg mx-auto text-xs sm:text-sm px-2">
            One useToast() hook for success, error, warning, info — animated icons, stacking, and 6 positions handled.
            No extra dependency to pin or wire to Sentry.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {TOAST_DEMOS.map((d) => (
            <motion.div key={d.tone} whileHover={{ scale: 1.04, y: -2 }} className="group">
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
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
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

/* ──────────────────── AI SECTION (preserved) ──────────────────── */
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

{
  "name": "icon-name",
  "size": 16,
  "category": "your-category",
  "grid": [
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
    "................"
  ],
  "palette": { "A": "#1E40AF", "B": "#3B82F6", "C": "#60A5FA", "D": "#FFFFFF" },
  "tags": ["example", "orb"]
}`;

  const animatedPrompt = `Generate an animated pixel art icon with frames[].

{
  "name": "pulse-dot",
  "size": 16,
  "palette": { "A": "#FF4500", "B": "#FF8C00", "C": "#FFD700" },
  "frames": [
    { "grid": [ "...", "...", "..." ] }
  ],
  "frameDuration": 200,
  "loop": true
}`;

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
            DESCRIBE THE ICON — GET THE CODE
          </h2>
          <p className="text-retro-muted max-w-xl mx-auto text-xs sm:text-sm px-2">
            The grid format reads like ASCII art with a legend, so any LLM can author one. Copy the prompt, paste the
            output, preview before you commit.
          </p>
          <div className="mt-4 inline-flex justify-center">
            <PixelSegmented
              label=""
              value={mode}
              onChange={(v) => setMode(v as 'static' | 'animated')}
              tone={mode === 'animated' ? 'purple' : 'green'}
              options={[
                { value: 'static', label: 'Static Icon' },
                { value: 'animated', label: 'Animated Icon' },
              ]}
            />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="font-mono text-sm text-retro-green mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${mode === 'static' ? 'bg-retro-green' : 'bg-retro-purple'}`} />
              {mode === 'static' ? 'Static' : 'Animated'} Prompt Template
            </h3>
            <pre className="code-block text-xs leading-relaxed h-[400px] overflow-y-auto">
              <code className="text-retro-muted">{activePrompt}</code>
            </pre>
            <div className="mt-3">
              <PixelButton
                tone={mode === 'static' ? 'green' : 'purple'}
                size="sm"
                onClick={() => navigator.clipboard?.writeText(activePrompt)}
              >
                Copy Prompt
              </PixelButton>
            </div>
          </div>

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

/* ──────────────────── PRICING (preserved) ──────────────────── */
function PricingPreview() {
  const router = useRouter();

  const plans = [
    {
      name: 'Community',
      price: 'Free',
      suffix: 'perfect for: side projects, OSS, prototypes',
      color: 'green' as const,
      features: [`${TOTAL_ICON_COUNT}+ pixel art icons`, '7 thematic packs', `${UI_COMPONENTS_COUNT}+ React components`, 'All section templates', 'Asset attribution required'],
    },
    {
      name: 'Indie',
      price: '$9.50',
      originalPrice: '$19',
      suffix: 'perfect for: solo dev shipping one paid product',
      color: 'gold' as const,
      popular: true,
      features: ['No attribution needed', '1 commercial project', 'Lifetime updates included', 'All current icon packs'],
    },
    {
      name: 'Team',
      price: '$24.50',
      originalPrice: '$49',
      suffix: 'perfect for: agencies and teams shipping many products',
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
            ONE-TIME LICENSE. NO SUBSCRIPTION.
          </h2>
          <p className="text-retro-muted max-w-lg mx-auto text-xs sm:text-sm px-2">
            Code is MIT, icon packs are free with attribution. Shipping a client product and need to drop the credit?{' '}
            <span className="text-retro-gold font-bold">Grab a lifetime asset license at 50% off.</span>
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
                whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 320, damping: 24 } }}
                className={`relative rounded-xl border ${tc.border} ${tc.bg} p-5 transition-colors ${
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

/* ──────────────────── FAQ (preserved) ──────────────────── */
function FAQSection() {
  const faqs = [
    {
      q: 'Is Pxlkit really free?',
      a: 'Yes. The code packages (UI kit, core, parallax) are MIT-licensed and completely free. The icon packs are free with a small attribution link. Paid licenses only remove the icon/asset attribution requirement.',
    },
    {
      q: 'What templates are included?',
      a: 'Pxlkit ships 8 section categories — hero, header, footer, CTA, pricing, testimonials, FAQ, and features — with 3 design variants each. Plus 6 complete page templates: full landing, portfolio, admin dashboards, changelog, docs site, and e-commerce.',
    },
    {
      q: 'What React components does the UI kit include?',
      a: `The UI kit provides ${UI_COMPONENTS_COUNT}+ production-ready components: buttons, inputs, textareas, selects, checkboxes, switches, cards, modals, tables, badges, tooltips, toasts, code blocks, sidebars, command palettes, and more. All are TypeScript-first, Tailwind-powered, and fully themed.`,
    },
    {
      q: 'Does Pxlkit work with Next.js?',
      a: 'Yes. Pxlkit is built for React with TypeScript and integrates seamlessly with Next.js, Vite, Create React App, Remix, and any React setup.',
    },
    {
      q: 'Will it slow down my app?',
      a: 'No. Every icon and component is tree-shakeable — your final bundle only includes the code you actually import. Icons are pure SVG with zero runtime dependencies.',
    },
    {
      q: 'Can I use Pxlkit in a commercial product?',
      a: 'Absolutely. MIT code packages can be used commercially without attribution. If you ship the icon packs and want to remove attribution there too, grab an Indie ($9.50) or Team ($24.50) asset license.',
    },
    {
      q: 'How many icons are included?',
      a: `${TOTAL_ICON_COUNT}+ hand-crafted 16×16 SVG icons across 7 themed packs.`,
    },
    {
      q: 'How do I create custom icons?',
      a: 'Three ways: use the visual builder on our website, let AI generate them with our prompt templates, or hand-code the simple grid + palette JSON format directly.',
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
            BEFORE YOU INSTALL — THE COMMON QUESTIONS
          </h2>
          <p className="text-retro-muted text-xs sm:text-sm px-2">
            License terms, framework fit, bundle impact, and how the icon licensing actually works.
          </p>
        </motion.div>

        <PixelAccordion
          items={faqs.map((faq, i) => ({
            id: `faq-${i}`,
            title: faq.q,
            content: (
              <p className="text-retro-muted text-xs sm:text-sm leading-relaxed">
                {faq.a}
              </p>
            ),
          }))}
        />
      </div>
    </section>
  );
}

/* ──────────────────── VOXEL COMING SOON (preserved) ──────────────────── */
function VoxelComingSoon() {
  return (
    <section className="relative py-10 sm:py-14 px-4 sm:px-6 border-t border-retro-border/20 overflow-hidden">
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
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-5 sm:mt-6">
          <PixelBadge tone="purple">React Three Fiber</PixelBadge>
          <PixelBadge tone="green">Procedural Worlds</PixelBadge>
          <PixelBadge tone="gold">9+ Biomes</PixelBadge>
          <PixelBadge tone="cyan">MIT License</PixelBadge>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── CTA (Ola 1 PixelContainer + PixelSectionHeader + PixelCluster) ──────────────────── */
function LandingCta() {
  const router = useRouter();

  return (
    <section className="relative border-t border-retro-border/30 overflow-hidden">
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
      <PixelParallaxLayer
        speed={0.08}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
      >
        <div className="w-full h-full bg-retro-green/5 rounded-full blur-[120px]" />
      </PixelParallaxLayer>

      <PixelContainer as="div" maxWidth="lg" padding="lg" className="relative">
        <PixelSectionHeader
          eyebrow="Your next project deserves it"
          title="Spend the week on the product, not the design system."
          description="One install, one provider, and the boring 80% is done — accessibility, surface, theming, icons, templates. MIT code, lifetime asset licenses if you need them, and zero subscription."
          align="center"
          titleTone="green"
          size="lg"
          spacing="loose"
        />

        <div className="mt-6 sm:mt-8 flex flex-col items-center gap-5">
          <div className="rounded-lg border border-retro-border bg-retro-bg/80 px-4 py-2 font-mono text-[11px] sm:text-xs text-retro-muted">
            <span className="text-retro-green mr-2">$</span>
            npm i @pxlkit/core @pxlkit/ui-kit
          </div>

          <PixelCluster gap={3} justify="center">
            <PixelButton tone="green" onClick={() => router.push('/docs')}>
              Get started — it&apos;s free
            </PixelButton>
            <PixelButton tone="gold" variant="ghost" onClick={() => router.push('/pricing')}>
              View pricing
            </PixelButton>
            <PixelButton
              tone="neutral"
              variant="ghost"
              onClick={() =>
                window.open('https://github.com/joangeldelarosa/pxlkit', '_blank', 'noopener,noreferrer')
              }
            >
              Star on GitHub
            </PixelButton>
          </PixelCluster>
        </div>
      </PixelContainer>
    </section>
  );
}

