'use client';

import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon, parseAnyIconCode } from '@pxlkit/core';
import type { PxlKitData, AnimatedPxlKitData, AnyIcon } from '@pxlkit/core';
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { HeroCollage, TOTAL_ICON_COUNT } from '../components/HeroCollage';
import { useToast } from '../components/ToastProvider';
import type { ToastTone } from '../components/ToastProvider';
import {
  PixelBadge,
  PixelButton,
  PixelCard,
  PixelCodeInline,
  PixelDivider,
  PixelSection,
  PixelTextarea,
  PixelParallaxLayer,
  PixelParallaxGroup,
  PixelMouseParallax,
  UI_KIT_COMPONENTS,
} from '@pxlkit/ui-kit';

const UI_COMPONENTS_COUNT = UI_KIT_COMPONENTS.length;

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
      <FeaturesSection />
      <IconShowcase />
      <ToastSection />
      <HowItWorks />
      <AISection />
      <CTASection />
    </div>
  );
}

/* ──────────────────── HERO ──────────────────── */
function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '85vh' }}>
      {/* ── Interactive icon collage background with scroll parallax ── */}
      <PixelParallaxLayer speed={0.15} className="absolute inset-0">
        <HeroCollage />
      </PixelParallaxLayer>

      {/* ── Radial glow with mouse parallax ── */}
      <PixelMouseParallax strength={30} invert>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-retro-green/8 rounded-full blur-[150px] pointer-events-none" />
      </PixelMouseParallax>

      {/* ── Content overlay ── */}
      <div className="relative z-10 flex items-center justify-center px-4 py-12 pointer-events-none" style={{ minHeight: '85vh' }}>
        <PixelParallaxLayer speed={-0.05}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl pointer-events-auto"
          >
          <PixelSection title="Pxlkit" subtitle="Open-source retro React UI kit + icon library">
            <div className="space-y-6 text-center">
              <div className="flex flex-wrap justify-center gap-2">
                <PixelBadge tone="green">v0.1.0</PixelBadge>
                <PixelBadge tone="cyan">Open Source</PixelBadge>
                <PixelBadge tone="gold">{UI_COMPONENTS_COUNT} Components</PixelBadge>
                <PixelBadge tone="purple">{TOTAL_ICON_COUNT}+ Icons</PixelBadge>
              </div>

              <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl text-retro-green leading-relaxed text-glow">
                BUILD RETRO INTERFACES FAST
              </h1>

              <p className="text-base sm:text-lg text-retro-muted max-w-2xl mx-auto">
                Components, pixel icons, toasts, and animations with one consistent API.
                Everything matches the same visual language and TypeScript-first DX.
              </p>

              <p className="text-sm text-retro-muted/80 font-mono">
                <PixelCodeInline>{UI_COMPONENTS_COUNT} components</PixelCodeInline>{' '}
                <PixelCodeInline tone="green">{TOTAL_ICON_COUNT}+ icons</PixelCodeInline>{' '}
                <PixelCodeInline tone="purple">6 packs</PixelCodeInline>{' '}
                <PixelCodeInline tone="gold">React + SVG</PixelCodeInline>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <PixelButton tone="green" iconRight={<PxlKitIcon icon={ArrowRight} size={14} />} onClick={() => router.push('/ui-kit')}>
                  Explore UI Kit
                </PixelButton>
                <PixelButton tone="cyan" variant="ghost" iconRight={<PxlKitIcon icon={ArrowRight} size={14} />} onClick={() => router.push('/icons')}>
                  Browse Icons
                </PixelButton>
                <PixelButton tone="purple" variant="ghost" iconRight={<PxlKitIcon icon={ArrowRight} size={14} />} onClick={() => router.push('/docs')}>
                  Read Docs
                </PixelButton>
              </div>

              <div className="rounded-lg border border-retro-border bg-retro-bg/80 px-4 py-3 font-mono text-xs text-retro-muted overflow-x-auto">
                <span className="text-retro-green mr-2">$</span>
                npm i @pxlkit/core @pxlkit/ui @pxlkit/gamification
              </div>

              <PixelDivider label="Packs" tone="neutral" />
              <div className="flex flex-wrap justify-center gap-2">
                <PixelBadge tone="gold">gamification ({GamificationPack.icons.length})</PixelBadge>
                <PixelBadge tone="cyan">feedback ({FeedbackPack.icons.length})</PixelBadge>
                <PixelBadge tone="red">social ({SocialPack.icons.length})</PixelBadge>
                <PixelBadge tone="purple">weather ({WeatherPack.icons.length})</PixelBadge>
                <PixelBadge tone="neutral">ui ({UiPack.icons.length})</PixelBadge>
                <PixelBadge tone="green">effects ({EffectsPack.icons.length})</PixelBadge>
              </div>
            </div>
          </PixelSection>
        </motion.div>
        </PixelParallaxLayer>
      </div>
    </section>
  );
}

/* ──────────────────── FEATURES ──────────────────── */
const FEATURES: { icon: PxlKitData | AnyIcon; title: string; description: string; color: string; animated?: boolean }[] = [
  {
    icon: Package,
    title: 'React UI Kit',
    description:
      `${UI_COMPONENTS_COUNT} production-ready components: buttons, inputs, cards, modals, toasts, tables, selects, and more. Fully typed.`,
    color: 'text-retro-green',
  },
  {
    icon: Lightning,
    title: 'Pixel Perfect Icons',
    description:
      `${TOTAL_ICON_COUNT}+ hand-crafted 16×16 SVG icons across 6 thematic packs. Tree-shakeable — bundle only what you use.`,
    color: 'text-retro-gold',
  },
  {
    icon: FireSword,
    title: 'Animated Icons',
    description:
      'Frame-based animations with loop, ping-pong, hover trigger, and speed control. Fire swords, sparkles, and more.',
    color: 'text-retro-red',
    animated: true,
  },
  {
    icon: Bell,
    title: 'Toast Notifications',
    description:
      'Built-in retro notification system with animated icons, progress bars, 6 positions, and smooth stacking.',
    color: 'text-retro-purple',
  },
  {
    icon: Palette,
    title: 'Visual Builder',
    description:
      'Paint-style pixel editor with retro palettes, tools, undo/redo, and live code preview. Design in the browser.',
    color: 'text-retro-pink',
  },
  {
    icon: Robot,
    title: 'AI-Friendly Format',
    description:
      'Simple grids + color palettes. Perfect for LLM icon generation with ChatGPT, Claude, or any AI model.',
    color: 'text-retro-cyan',
  },
];

function FeaturesSection() {
  return (
    <section className="py-20 px-4 border-t border-retro-border/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <PixelParallaxLayer speed={-0.03}>
            <h2 className="font-pixel text-lg text-retro-green mb-3">EVERYTHING YOU NEED</h2>
            <p className="text-retro-muted max-w-lg mx-auto text-sm">
              A complete React UI kit with pixel art icons, animated components, toast notifications, and a visual builder — all open source.
            </p>
          </PixelParallaxLayer>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
    <section className="py-20 px-4 border-t border-retro-border/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-lg text-retro-gold mb-3">ICON PACKS</h2>
          <p className="text-retro-muted font-mono text-sm max-w-lg mx-auto">
            {TOTAL_ICON_COUNT} hand-crafted icons across 6 themed packs — including animated effects.
          </p>
        </motion.div>

        <div className="space-y-12">
          {SHOWCASE_PACKS.map(({ pack, color, borderColor, limit }) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
            >
              {/* Pack header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-5 min-w-0">
                <h3 className={`font-pixel text-[11px] shrink-0 ${color}`}>{pack.name}</h3>
                <span className="font-mono text-[10px] text-retro-muted/60 shrink-0">
                  {pack.icons.length} icons
                </span>
                <div className="flex-1 border-t border-retro-border/20 min-w-[12px]" />
                <span className="hidden sm:block font-mono text-[10px] text-retro-muted/40 truncate">@pxlkit/{pack.id}</span>
              </div>

              {/* Icons grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
                {pack.icons.slice(0, limit).map((icon) => {
                  const animated = isAnimatedIcon(icon);
                  return (
                    <div
                      key={icon.name}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border ${borderColor} bg-retro-surface/30 hover:bg-retro-card transition-colors group cursor-pointer`}
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
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border border-dashed ${borderColor} hover:bg-retro-surface/50 transition-colors`}
                  >
                    <span className={`font-pixel text-xs ${color}`}>+{pack.icons.length - limit}</span>
                    <span className="font-mono text-[9px] text-retro-muted">more</span>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
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
    <section className="py-20 px-4 border-t border-retro-border/30 bg-retro-surface/20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-lg text-retro-purple mb-3">PIXEL TOASTS</h2>
          <p className="text-retro-muted max-w-lg mx-auto text-sm">
            Retro-styled notifications with pixel art icons, animated progress bars,
            configurable positions, and smooth stacking. Click to try them live.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
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
    <section className="py-20 px-4 border-t border-retro-border/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-lg text-retro-cyan mb-3">
            HOW IT WORKS
          </h2>
          <p className="text-retro-muted max-w-xl mx-auto">
            Icons are defined as simple character grids. Each character maps to a
            color. That&apos;s it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
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
    <section className="py-20 px-4 border-t border-retro-border/30 bg-retro-surface/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-pixel text-lg text-retro-purple mb-3">
            AI GENERATION
          </h2>
          <p className="text-retro-muted max-w-xl mx-auto">
            The grid format is designed to be generated by AI. Copy the prompt
            template, ask any LLM, and paste the result here.
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

        <div className="grid md:grid-cols-2 gap-8">
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

/* ──────────────────── CTA ──────────────────── */
function CTASection() {
  const router = useRouter();

  return (
    <section className="relative py-20 px-4 border-t border-retro-border/30 overflow-hidden">
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
            <h2 className="font-pixel text-lg text-retro-green mb-4">
              START BUILDING TODAY
            </h2>
            <p className="text-retro-muted mb-8 max-w-md mx-auto">
              Pxlkit is free and open source. Use the UI kit and icons in your products,
              contribute icons, or help grow the component library.
            </p>
          </PixelParallaxLayer>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PixelButton tone="green" onClick={() => router.push('/ui-kit')}>
              Explore UI Kit
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


