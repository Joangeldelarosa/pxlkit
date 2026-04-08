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
import { ParallaxPack, GhostFriend } from '@pxlkit/parallax';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { HeroCollage, TOTAL_ICON_COUNT } from '../components/HeroCollage';
import { useToast } from '../components/ToastProvider';
import type { ToastTone } from '../components/ToastProvider';
import { CoolEmoji } from '../data/cool-emoji';
import {
  PixelBadge,
  PixelButton,
  PixelCard,
  PixelCodeInline,
  PixelDivider,
  PixelSection,
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
      <VoxelComingSoon />
      <FeaturesSection />
      <ParallaxShowcase />
      <IconShowcase />
      <ToastSection />
      <HowItWorks />
      <AISection />
      <PricingPreview />
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
                <PixelBadge tone="red">NEW: 3D Parallax</PixelBadge>
                <PixelBadge tone="purple">🔮 SOON: Voxel Worlds</PixelBadge>
              </div>

              {/* ── GhostFriend parallax hero icon ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex justify-center py-2"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-retro-purple/10 blur-[60px] pointer-events-none" />
                  <ParallaxPxlKitIcon
                    icon={GhostFriend}
                    size={140}
                    strength={22}
                    layerGap={28}
                    interactive
                    colorful
                  />
                  <p className="mt-2 text-center font-mono text-[9px] text-retro-muted/60">
                    Move mouse to rotate · Click to interact
                  </p>
                </div>
              </motion.div>

              <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl text-retro-green leading-relaxed text-glow">
                BUILD RETRO INTERFACES FAST
              </h1>

              <p className="text-base sm:text-lg text-retro-muted max-w-2xl mx-auto">
                Components, pixel icons, toasts, animations, and{' '}
                <span className="text-retro-gold font-bold">3D parallax icons</span> with one consistent API.
                Now featuring interactive multi-layer pixel art with real CSS 3D perspective and mouse tracking.
              </p>

              <p className="text-sm text-retro-muted/80 font-mono">
                <PixelCodeInline>{UI_COMPONENTS_COUNT} components</PixelCodeInline>{' '}
                <PixelCodeInline tone="green">{TOTAL_ICON_COUNT}+ icons</PixelCodeInline>{' '}
                <PixelCodeInline tone="purple">7 packs</PixelCodeInline>{' '}
                <PixelCodeInline tone="gold">React + SVG + 3D</PixelCodeInline>
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
                npm i @pxlkit/core @pxlkit/ui @pxlkit/parallax
              </div>

              <PixelDivider label="Packs" tone="neutral" />
              <div className="flex flex-wrap justify-center gap-2">
                <PixelBadge tone="gold">gamification ({GamificationPack.icons.length})</PixelBadge>
                <PixelBadge tone="cyan">feedback ({FeedbackPack.icons.length})</PixelBadge>
                <PixelBadge tone="red">social ({SocialPack.icons.length})</PixelBadge>
                <PixelBadge tone="purple">weather ({WeatherPack.icons.length})</PixelBadge>
                <PixelBadge tone="neutral">ui ({UiPack.icons.length})</PixelBadge>
                <PixelBadge tone="green">effects ({EffectsPack.icons.length})</PixelBadge>
                <PixelBadge tone="gold">parallax ({ParallaxPack.length})</PixelBadge>
              </div>
            </div>
          </PixelSection>
        </motion.div>
        </PixelParallaxLayer>
      </div>
    </section>
  );
}

/* ──────────────────── VOXEL COMING SOON ──────────────────── */

const VOXEL_CAPABILITIES: { icon: string; title: string; desc: string }[] = [
  { icon: '🌍', title: 'Voxel Worlds', desc: 'Build floating islands, caves, biomes, and entire worlds from voxel blocks with procedural terrain.' },
  { icon: '🤖', title: '3D Characters', desc: 'Design and animate voxel characters, NPCs, and creatures with per-voxel control.' },
  { icon: '⛰️', title: 'Terrain Engine', desc: 'Heightmap-based terrain with grass, dirt, stone layers, water systems, and biome blending.' },
  { icon: '🎮', title: 'Interactive Scenes', desc: 'Orbit controls, real-time lighting, physics-ready, and full React Three Fiber integration.' },
];

function VoxelComingSoon() {
  return (
    <section className="relative py-20 px-4 border-t border-retro-border/20 overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-retro-purple/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-retro-green/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-retro-gold/3 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-5"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-retro-green opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-retro-green" />
            </span>
            <PixelBadge tone="green">COMING SOON</PixelBadge>
          </motion.div>

          <h2 className="font-pixel text-xl sm:text-2xl text-retro-purple mb-2 text-glow">
            @pxlkit/voxel
          </h2>
          <p className="font-pixel text-sm sm:text-base text-retro-gold mb-4">
            From Pixels to Worlds.
          </p>
          <p className="text-retro-muted max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            A new dimension is loading. Craft immersive{' '}
            <span className="text-retro-green font-bold">voxel worlds</span>,
            sculpt <span className="text-retro-purple font-bold">3D characters</span>,
            generate <span className="text-retro-gold font-bold">dynamic terrains</span>{' '}
            with water and biomes, and bring pixel art to life in full three dimensions.
            The same retro aesthetic you love — now in 3D.
          </p>
        </motion.div>

        {/* ── 3D Preview with Tabs ── */}
        <motion.div
          className="relative mx-auto max-w-4xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="relative rounded-xl border border-retro-border/40 overflow-hidden bg-[#0d1117]/80 backdrop-blur-sm">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-retro-green/60 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-retro-green/60 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-retro-purple/60 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-retro-purple/60 rounded-br-xl" />

            {/* Scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
              }}
            />

            {/* Canvas — tabs are inside the VoxelPreview component */}
            <div className="w-full aspect-[16/10] min-h-[320px] sm:min-h-[440px]">
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

            {/* Bottom label */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 pointer-events-none">
              <span className="bg-retro-bg/80 backdrop-blur-sm border border-retro-border/40 rounded px-3 py-1 font-mono text-[10px] text-retro-muted/70">
                🎮 Drag to orbit · Switch tabs to explore
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Capability Cards ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {VOXEL_CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              className="rounded-lg border border-retro-border/30 bg-retro-bg/40 backdrop-blur-sm p-4 text-center hover:border-retro-green/40 transition-colors duration-200"
            >
              <div className="text-2xl mb-2">{cap.icon}</div>
              <h4 className="font-pixel text-[11px] text-retro-green mb-1">{cap.title}</h4>
              <p className="text-retro-muted/70 text-[11px] leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Feature pills ── */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mt-8"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <PixelBadge tone="purple">Voxel Engine</PixelBadge>
          <PixelBadge tone="green">React Three Fiber</PixelBadge>
          <PixelBadge tone="gold">Terrain Generation</PixelBadge>
          <PixelBadge tone="cyan">3D Characters</PixelBadge>
          <PixelBadge tone="red">Interactive Scenes</PixelBadge>
          <PixelBadge tone="purple">Procedural Worlds</PixelBadge>
        </motion.div>

        {/* ── Install hint ── */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="inline-block rounded-lg border border-retro-border/30 bg-retro-bg/60 px-4 py-2 font-mono text-xs text-retro-muted/70">
            <span className="text-retro-green mr-2">$</span>
            npm i @pxlkit/voxel @react-three/fiber three{' '}
            <span className="text-retro-muted/40 ml-2">← coming soon</span>
          </div>
        </motion.div>
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

/* ──────────────────── PARALLAX 3D ICONS (NEW) ──────────────────── */
function ParallaxShowcase() {
  return (
    <section className="py-20 px-4 border-t border-retro-border/30 bg-retro-surface/20 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-retro-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <PixelBadge tone="gold">NEW</PixelBadge>
            <PixelBadge tone="purple">Interactive 3D</PixelBadge>
            <PixelBadge tone="green">{ParallaxPack.length} Icons</PixelBadge>
          </div>
          <h2 className="font-pixel text-lg text-retro-gold mb-3">
            3D PARALLAX ICON PACK
          </h2>
          <p className="text-retro-muted max-w-2xl mx-auto text-sm">
            Animated multi-layer pixel art with real CSS 3D perspective.
            Each layer floats at a different Z-depth. Move your mouse anywhere
            to rotate —<span className="text-retro-gold font-bold"> click any icon</span> to
            trigger particle bursts, layer explosions, and color shifts.
          </p>
        </motion.div>

        {/* Hero icon — large CoolEmoji demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="relative p-10 rounded-2xl border border-retro-gold/20 bg-retro-bg/60 backdrop-blur-sm">
            <div className="absolute inset-0 rounded-2xl border border-retro-gold/10 animate-pulse pointer-events-none" />
            <ParallaxPxlKitIcon
              icon={CoolEmoji}
              size={180}
              strength={20}
              layerGap={30}
              interactive
              colorful
            />
            <p className="mt-5 text-center font-mono text-[10px] text-retro-muted">
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
          <div className="flex items-center gap-2 sm:gap-3 mb-5 min-w-0">
            <h3 className="font-pixel text-[11px] shrink-0 text-retro-gold">3D Parallax Pack</h3>
            <span className="font-mono text-[10px] text-retro-muted/60 shrink-0">
              {ParallaxPack.length} interactive icons
            </span>
            <div className="flex-1 border-t border-retro-border/20 min-w-[12px]" />
            <span className="hidden sm:block font-mono text-[10px] text-retro-muted/40 truncate">animated · 3-layer · click-reactive</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {ParallaxPack.map((icon) => (
              <motion.div
                key={icon.name}
                whileHover={{ scale: 1.05 }}
                className="relative flex flex-col items-center gap-2 p-4 rounded-lg border border-retro-gold/20 bg-retro-surface/30 hover:bg-retro-card transition-colors group"
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-10">
          {[
            { label: 'True 3D Depth', desc: 'CSS perspective + preserve-3d + per-layer translateZ', color: 'text-retro-gold' },
            { label: 'Page-Wide Tracking', desc: 'Mouse rotation works across the entire viewport', color: 'text-retro-cyan' },
            { label: 'Click Interactions', desc: 'Particle bursts, layer explosions, color shifts on click', color: 'text-retro-green' },
            { label: 'Animated Layers', desc: 'Frame-based animation per layer — glints, pulses, sparkles', color: 'text-retro-purple' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-lg border border-retro-border/20 bg-retro-surface/20">
              <h4 className={`font-pixel text-[10px] ${item.color} mb-1`}>{item.label}</h4>
              <p className="text-retro-muted text-[10px] leading-relaxed">{item.desc}</p>
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

/* ──────────────────── PRICING PREVIEW ──────────────────── */
function PricingPreview() {
  const router = useRouter();

  const plans = [
    {
      name: 'Community',
      price: 'Free',
      suffix: 'forever',
      color: 'green' as const,
      features: ['204+ pixel art icons', '6 thematic packs', 'React UI kit', 'Attribution required'],
    },
    {
      name: 'Indie',
      price: '$9.50',
      originalPrice: '$19',
      suffix: 'one-time · 1 project',
      color: 'gold' as const,
      popular: true,
      features: ['No attribution', '1 commercial project', 'Lifetime license', 'All current packs'],
    },
    {
      name: 'Team',
      price: '$24.50',
      originalPrice: '$49',
      suffix: 'one-time · unlimited',
      color: 'cyan' as const,
      features: ['Unlimited projects', 'All future packs', 'Priority support', 'Sponsor logo'],
    },
  ];

  const toneColors = {
    green: { border: 'border-retro-green/30', text: 'text-retro-green', bg: 'bg-retro-green/5' },
    gold: { border: 'border-retro-gold/30', text: 'text-retro-gold', bg: 'bg-retro-gold/5' },
    cyan: { border: 'border-retro-cyan/30', text: 'text-retro-cyan', bg: 'bg-retro-cyan/5' },
  };

  return (
    <section className="py-20 px-4 border-t border-retro-border/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <PixelBadge tone="red">50% OFF</PixelBadge>
            <PixelBadge tone="gold">Launch Special</PixelBadge>
          </div>
          <h2 className="font-pixel text-lg text-retro-green mb-3">
            SIMPLE PRICING
          </h2>
          <p className="text-retro-muted max-w-lg mx-auto text-sm">
            Free for everyone with attribution. Remove it with a one-time payment.
            All licenses are <span className="text-retro-gold">50% off</span> during launch.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
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


