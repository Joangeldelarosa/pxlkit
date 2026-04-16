import type { FullPageTemplate } from '../types';

/* ─────────────────────────────────────────────────────────────────────────
   1. SaaS Landing Page
   ───────────────────────────────────────────────────────────────────────── */
const saasLanding = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { useState } from 'react';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Check, Package, CloudSync } from '@pxlkit/ui';
import { ShieldCheck, Sparkles, Bell } from '@pxlkit/feedback';
import { SparkleStar, Trophy, Coin } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelCard,
  PixelStatCard,
  PixelBadge,
  PixelAccordion,
  PixelFadeIn,
  PixelSlideIn,
  PixelTypewriter,
  PixelSection,
  PixelDivider,
} from '@pxlkit/ui-kit';

const FEATURES = [
  { icon: Package, title: 'Modular', desc: 'Install only what you need.' },
  { icon: ShieldCheck, title: 'Type-safe', desc: 'Strict TypeScript across all packages.' },
  { icon: CloudSync, title: 'Always fresh', desc: 'Regular releases with new icons and components.' },
];

const PLANS = [
  { name: 'Free', price: '$0', features: ['5 projects', 'Core components', 'Community support'], tone: 'neutral' as const },
  { name: 'Pro', price: '$12/mo', features: ['Unlimited projects', 'All components', 'Priority support', 'Custom themes'], tone: 'green' as const, popular: true },
  { name: 'Team', price: '$39/mo', features: ['Everything in Pro', '5 team seats', 'SLA'], tone: 'cyan' as const },
];

const FAQ = [
  { question: 'Is it free?', answer: 'Yes, MIT licensed and free for personal and commercial use.' },
  { question: 'Next.js compatible?', answer: 'Fully compatible with Next.js App Router and Pages Router.' },
  { question: 'TypeScript support?', answer: 'Full strict TypeScript support across all packages.' },
];

export default function SaasLandingPage() {
  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      {/* Hero */}
      <PixelSection className="py-24 text-center px-4">
        <PixelFadeIn>
          <PixelBadge tone="green" className="mb-6 inline-flex items-center gap-2">
            <PxlKitIcon icon={Sparkles} size={12} />
            v1.0 — Now open source
          </PixelBadge>
          <h1 className="font-pixel text-2xl sm:text-4xl leading-loose mb-4">
            <PixelTypewriter text="Ship retro UIs faster" speed={55} />
          </h1>
          <p className="text-retro-muted font-mono text-sm max-w-lg mx-auto mb-8">
            The complete pixel-art React ecosystem. Components, icons, animations, and 3D effects — all open source.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <PixelButton tone="green" size="lg">
              Get Started Free <PxlKitIcon icon={ArrowRight} size={14} className="ml-2" />
            </PixelButton>
            <PixelButton tone="neutral" size="lg" variant="outline">Browse Docs</PixelButton>
          </div>
        </PixelFadeIn>
        <PixelFadeIn delay={300} className="mt-12 flex justify-center gap-8">
          <PixelStatCard label="Stars" value="4.2k" icon={<PxlKitIcon icon={Trophy} size={16} colorful />} compact />
          <PixelStatCard label="Downloads" value="18k/mo" icon={<PxlKitIcon icon={Coin} size={16} colorful />} compact />
          <PixelStatCard label="Icons" value="226+" icon={<AnimatedPxlKitIcon icon={SparkleStar} size={16} colorful />} compact />
        </PixelFadeIn>
      </PixelSection>

      <PixelDivider tone="neutral" />

      {/* Features */}
      <PixelSection className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-pixel text-xl text-center leading-loose mb-12">Everything you need</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <PixelFadeIn key={f.title} delay={i * 100}>
                <PixelCard className="p-6">
                  <PxlKitIcon icon={f.icon} size={24} colorful />
                  <h3 className="font-pixel text-xs mt-4 mb-2 leading-relaxed">{f.title}</h3>
                  <p className="text-retro-muted font-mono text-xs">{f.desc}</p>
                </PixelCard>
              </PixelFadeIn>
            ))}
          </div>
        </div>
      </PixelSection>

      <PixelDivider tone="neutral" />

      {/* Pricing */}
      <PixelSection className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-pixel text-xl text-center leading-loose mb-12">Simple pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <PixelFadeIn key={plan.name} delay={i * 100}>
                <PixelCard className={\`p-6 h-full flex flex-col \${plan.popular ? 'border-retro-green/40 bg-retro-green/5' : ''}\`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-xs">{plan.name}</span>
                    {plan.popular && <PixelBadge tone="green">Popular</PixelBadge>}
                  </div>
                  <div className="font-pixel text-xl mb-4">{plan.price}</div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 font-mono text-xs">
                        <PxlKitIcon icon={Check} size={12} className="text-retro-green" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <PixelButton tone={plan.tone} size="md" variant={plan.popular ? 'solid' : 'outline'} className="w-full justify-center">
                    Get {plan.name}
                  </PixelButton>
                </PixelCard>
              </PixelFadeIn>
            ))}
          </div>
        </div>
      </PixelSection>

      <PixelDivider tone="neutral" />

      {/* FAQ */}
      <PixelSection className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-pixel text-xl text-center leading-loose mb-10">FAQ</h2>
          <PixelAccordion items={FAQ} />
        </div>
      </PixelSection>

      {/* Final CTA */}
      <PixelSection className="py-20 px-4 bg-retro-green/5 border-t border-retro-green/20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-pixel text-xl leading-loose mb-4">Ready to ship?</h2>
          <p className="text-retro-muted font-mono text-sm mb-6">Free forever. Open source. No credit card required.</p>
          <PixelButton tone="green" size="lg">
            Start Building <PxlKitIcon icon={ArrowRight} size={14} className="ml-2" />
          </PixelButton>
        </div>
      </PixelSection>
    </div>
  );
}
`;

/* ─────────────────────────────────────────────────────────────────────────
   2. Developer Portfolio
   ───────────────────────────────────────────────────────────────────────── */
const devPortfolio = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { ParallaxPxlKitIcon, PxlKitIcon } from '@pxlkit/core';
import { ArrowRight, ExternalLink, AtSign } from '@pxlkit/ui';
import { Globe } from '@pxlkit/social';
import { PixelRocket, CoolEmoji, MagicOrb } from '@pxlkit/parallax';
import {
  PixelButton,
  PixelCard,
  PixelBadge,
  PixelProgress,
  PixelInput,
  PixelTextarea,
  PixelFadeIn,
  PixelMouseParallax,
  PixelParallaxGroup,
  PixelParallaxLayer,
  PixelSection,
  PixelDivider,
} from '@pxlkit/ui-kit';

const PROJECTS = [
  { title: 'PixelCraft', desc: 'Procedural voxel world generator.', tags: ['React', 'Three.js', 'WebGL'], tone: 'green' as const },
  { title: 'RetroSync', desc: 'Real-time retro UI collaboration tool.', tags: ['Next.js', 'WebSocket'], tone: 'cyan' as const },
  { title: 'BitVault', desc: 'Pixel-art themed password manager.', tags: ['Electron', 'TypeScript'], tone: 'gold' as const },
];

const SKILLS = [
  { name: 'TypeScript', level: 92 },
  { name: 'React / Next.js', level: 95 },
  { name: 'Tailwind CSS', level: 88 },
  { name: 'Three.js', level: 72 },
  { name: 'Node.js', level: 80 },
];

export default function DeveloperPortfolio() {
  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      {/* Hero with parallax */}
      <PixelSection className="relative min-h-screen flex items-center px-4 overflow-hidden">
        <PixelMouseParallax className="absolute inset-0 pointer-events-none">
          <PixelParallaxGroup>
            <PixelParallaxLayer depth={0.2} className="absolute top-20 left-10">
              <ParallaxPxlKitIcon icon={PixelRocket} size={64} />
            </PixelParallaxLayer>
            <PixelParallaxLayer depth={0.35} className="absolute top-28 right-16">
              <ParallaxPxlKitIcon icon={MagicOrb} size={56} />
            </PixelParallaxLayer>
            <PixelParallaxLayer depth={0.15} className="absolute bottom-24 right-20">
              <ParallaxPxlKitIcon icon={CoolEmoji} size={48} />
            </PixelParallaxLayer>
          </PixelParallaxGroup>
        </PixelMouseParallax>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <PixelFadeIn>
            <PixelBadge tone="cyan" className="mb-4">Available for work</PixelBadge>
            <h1 className="font-pixel text-2xl sm:text-4xl leading-loose mb-4">
              Hi, I&apos;m <span className="text-retro-green">Alex</span>
            </h1>
            <p className="text-retro-muted font-mono text-sm max-w-md mb-8">
              Full-stack developer building beautiful, performant web apps. Passionate about
              pixel art, game dev, and open source.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <PixelButton tone="green" size="lg">
                View Projects <PxlKitIcon icon={ArrowRight} size={14} className="ml-2" />
              </PixelButton>
              <PixelButton tone="neutral" size="lg" variant="outline">
                Download CV
              </PixelButton>
            </div>
          </PixelFadeIn>
        </div>
      </PixelSection>

      <PixelDivider tone="neutral" />

      {/* Projects */}
      <PixelSection className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-pixel text-xl leading-loose mb-10">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROJECTS.map((p, i) => (
              <PixelFadeIn key={p.title} delay={i * 100}>
                <PixelCard className="p-6 h-full flex flex-col">
                  <h3 className="font-pixel text-xs mb-2 leading-relaxed">{p.title}</h3>
                  <p className="text-retro-muted font-mono text-xs mb-4 flex-1">{p.desc}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {p.tags.map((t) => <PixelBadge key={t} tone={p.tone} className="text-[9px]">{t}</PixelBadge>)}
                  </div>
                  <PixelButton tone={p.tone} size="sm" variant="outline">
                    View <PxlKitIcon icon={ExternalLink} size={12} className="ml-1" />
                  </PixelButton>
                </PixelCard>
              </PixelFadeIn>
            ))}
          </div>
        </div>
      </PixelSection>

      <PixelDivider tone="neutral" />

      {/* Skills */}
      <PixelSection className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-pixel text-xl leading-loose mb-10">Skills</h2>
          <div className="space-y-4">
            {SKILLS.map((s, i) => (
              <PixelFadeIn key={s.name} delay={i * 60}>
                <PixelProgress value={s.level} label={s.name} tone="green" />
              </PixelFadeIn>
            ))}
          </div>
        </div>
      </PixelSection>

      <PixelDivider tone="neutral" />

      {/* Contact */}
      <PixelSection className="py-20 px-4">
        <div className="max-w-xl mx-auto">
          <h2 className="font-pixel text-xl leading-loose mb-3 text-center">Get in touch</h2>
          <p className="text-retro-muted font-mono text-sm text-center mb-8">Available for freelance and full-time roles.</p>
          <PixelCard className="p-6 space-y-4">
            <PixelInput label="Name" placeholder="Your name" />
            <PixelInput label="Email" placeholder="your@email.com" type="email" />
            <PixelTextarea label="Message" placeholder="Tell me about your project..." rows={4} />
            <PixelButton tone="green" size="md" className="w-full justify-center">
              Send Message <PxlKitIcon icon={AtSign} size={14} className="ml-2" />
            </PixelButton>
          </PixelCard>
        </div>
      </PixelSection>
    </div>
  );
}
`;

/* ─────────────────────────────────────────────────────────────────────────
   3. Indie Game Landing Page
   ───────────────────────────────────────────────────────────────────────── */
const indieGame = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Download } from '@pxlkit/ui';
import { Trophy, Sword, Coin, Crown, FireSword, SparkleStar, CoinSpin, FloatingSkull } from '@pxlkit/gamification';
import { ExplosionBurst, GlowPulse } from '@pxlkit/effects';
import {
  PixelButton,
  PixelCard,
  PixelStatCard,
  PixelBadge,
  PixelTable,
  PixelFadeIn,
  PixelBounce,
  PixelFloat,
  PixelGlitch,
  PixelSection,
} from '@pxlkit/ui-kit';

const LEADERBOARD = [
  { rank: 1, player: 'PixelKnight', score: 98400, level: 42 },
  { rank: 2, player: 'VoxelMage', score: 87200, level: 39 },
  { rank: 3, player: 'BitRogue', score: 75600, level: 37 },
  { rank: 4, player: 'NeonArcher', score: 64100, level: 35 },
  { rank: 5, player: 'CryptoWitch', score: 58300, level: 33 },
];

const FEATURES = [
  { icon: Sword, title: 'Roguelike Combat', desc: 'Procedurally generated dungeons with turn-based pixel combat.' },
  { icon: Crown, title: 'Boss Battles', desc: '12 unique bosses, each with a hand-crafted attack pattern.' },
  { icon: Coin, title: 'Deep Loot System', desc: '500+ unique items, weapons, and spells to discover.' },
];

export default function IndieGameLanding() {
  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      {/* Hero */}
      <PixelSection className="py-24 text-center px-4 bg-retro-purple/5">
        <PixelFadeIn>
          <div className="flex justify-center gap-4 mb-8">
            <PixelFloat>
              <AnimatedPxlKitIcon icon={FireSword} size={64} colorful />
            </PixelFloat>
            <PixelBounce>
              <AnimatedPxlKitIcon icon={FloatingSkull} size={48} colorful />
            </PixelBounce>
          </div>
          <PixelBadge tone="red" className="mb-4">Now in Early Access</PixelBadge>
          <PixelGlitch active>
            <h1 className="font-pixel text-2xl sm:text-4xl leading-loose mb-4">
              DUNGEON<br />
              <span className="text-retro-red">CRAWLER X</span>
            </h1>
          </PixelGlitch>
          <p className="text-retro-muted font-mono text-sm max-w-md mx-auto mb-8">
            A hardcore retro roguelike with procedural dungeons, brutal boss fights,
            and hundreds of items to collect.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <PixelButton tone="red" size="lg">
              Play Now — Free
              <PxlKitIcon icon={ArrowRight} size={14} className="ml-2" />
            </PixelButton>
            <PixelButton tone="neutral" size="lg" variant="outline">
              Download Demo
              <PxlKitIcon icon={Download} size={14} className="ml-2" />
            </PixelButton>
          </div>
        </PixelFadeIn>

        <PixelFadeIn delay={200} className="mt-12 flex justify-center gap-6 flex-wrap">
          <PixelStatCard label="Players" value="24k+" icon={<PxlKitIcon icon={Trophy} size={16} colorful />} compact />
          <PixelStatCard label="Items" value="500+" icon={<PxlKitIcon icon={Coin} size={16} colorful />} compact />
          <PixelStatCard label="Dungeons" value="∞" icon={<AnimatedPxlKitIcon icon={SparkleStar} size={16} colorful />} compact />
        </PixelFadeIn>
      </PixelSection>

      {/* Features */}
      <PixelSection className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-pixel text-xl text-center leading-loose mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <PixelFadeIn key={f.title} delay={i * 100}>
                <PixelCard className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <PxlKitIcon icon={f.icon} size={32} colorful />
                  </div>
                  <h3 className="font-pixel text-xs mb-2 leading-relaxed">{f.title}</h3>
                  <p className="text-retro-muted font-mono text-xs">{f.desc}</p>
                </PixelCard>
              </PixelFadeIn>
            ))}
          </div>
        </div>
      </PixelSection>

      {/* Leaderboard */}
      <PixelSection className="py-20 px-4 bg-retro-surface/20">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-pixel text-xl text-center leading-loose mb-10">
            <AnimatedPxlKitIcon icon={CoinSpin} size={24} colorful className="inline mr-3" />
            Leaderboard
          </h2>
          <PixelTable
            columns={[
              { key: 'rank', label: '#', width: '60px' },
              { key: 'player', label: 'Player' },
              { key: 'score', label: 'Score' },
              { key: 'level', label: 'Level', width: '80px' },
            ]}
            rows={LEADERBOARD}
          />
        </div>
      </PixelSection>

      {/* Download CTA */}
      <PixelSection className="py-20 px-4 text-center bg-retro-red/5 border-t border-retro-red/20">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-center gap-3 mb-6">
            <AnimatedPxlKitIcon icon={ExplosionBurst} size={40} colorful />
            <AnimatedPxlKitIcon icon={GlowPulse} size={40} colorful />
          </div>
          <h2 className="font-pixel text-xl leading-loose mb-4">Ready to explore?</h2>
          <p className="text-retro-muted font-mono text-sm mb-6">Free to play. Cross-platform. No ads.</p>
          <PixelButton tone="red" size="lg">
            Download Free <PxlKitIcon icon={Download} size={14} className="ml-2" />
          </PixelButton>
        </div>
      </PixelSection>
    </div>
  );
}
`;

/* ─────────────────────────────────────────────────────────────────────────
   4. Admin Dashboard
   ───────────────────────────────────────────────────────────────────────── */
const adminDashboard = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { useState } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Home, Settings, Grid, List, Search, Bell, Upload } from '@pxlkit/ui';
import { CheckCircle, WarningTriangle, InfoCircle } from '@pxlkit/feedback';
import {
  PixelButton,
  PixelCard,
  PixelStatCard,
  PixelTable,
  PixelAlert,
  PixelProgress,
  PixelBadge,
  PixelInput,
  PixelSection,
} from '@pxlkit/ui-kit';

const STATS = [
  { label: 'Total Users', value: '12,480', delta: '+8%', icon: Home, tone: 'green' as const },
  { label: 'Revenue', value: '$48,200', delta: '+12%', icon: Upload, tone: 'cyan' as const },
  { label: 'Active Projects', value: '234', delta: '-3%', icon: Grid, tone: 'gold' as const },
  { label: 'Support Tickets', value: '18', delta: '-22%', icon: Bell, tone: 'red' as const },
];

const RECENT_USERS = [
  { name: 'Alex Rivera', email: 'alex@example.com', plan: 'Pro', status: 'Active' },
  { name: 'Sam Chen', email: 'sam@example.com', plan: 'Free', status: 'Active' },
  { name: 'Morgan Blake', email: 'morgan@example.com', plan: 'Team', status: 'Pending' },
  { name: 'Jordan Lee', email: 'jordan@example.com', plan: 'Pro', status: 'Inactive' },
];

const SIDEBAR_ITEMS = [
  { icon: Home, label: 'Dashboard', active: true },
  { icon: Grid, label: 'Projects', active: false },
  { icon: List, label: 'Users', active: false },
  { icon: Bell, label: 'Notifications', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

export default function AdminDashboard() {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-retro-bg flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-retro-border/50 bg-retro-surface/30 p-4">
        <div className="font-pixel text-[10px] text-retro-green mb-8">ADMIN PANEL</div>
        <nav className="space-y-1 flex-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.label}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-mono rounded transition-all \${
                item.active
                  ? 'text-retro-green bg-retro-green/10'
                  : 'text-retro-muted hover:text-retro-text hover:bg-retro-surface'
              }\`}
            >
              <PxlKitIcon icon={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="pt-4 border-t border-retro-border/30">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-mono text-retro-muted hover:text-retro-text rounded transition-all">
            <PxlKitIcon icon={Settings} size={16} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-retro-border/50 bg-retro-bg/90 backdrop-blur-md px-6 h-14 flex items-center justify-between">
          <PixelInput
            size="sm"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
            prefix={<PxlKitIcon icon={Search} size={14} className="text-retro-muted" />}
          />
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-retro-muted hover:text-retro-text border border-retro-border/50 rounded transition-all">
              <PxlKitIcon icon={Bell} size={16} />
              <PixelBadge tone="red" className="absolute -top-1 -right-1 text-[8px] px-1">3</PixelBadge>
            </button>
            <PixelButton tone="green" size="sm">+ New Project</PixelButton>
          </div>
        </header>

        <PixelSection className="p-6 space-y-6">
          {/* Alerts */}
          <PixelAlert tone="info" icon={<PxlKitIcon icon={InfoCircle} size={16} />}>
            System maintenance scheduled for Sunday 02:00–04:00 UTC.
          </PixelAlert>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <PixelStatCard
                key={s.label}
                label={s.label}
                value={s.value}
                delta={s.delta}
                icon={<PxlKitIcon icon={s.icon} size={18} colorful />}
              />
            ))}
          </div>

          {/* Usage stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PixelCard className="p-4">
              <h3 className="font-pixel text-xs mb-4 leading-relaxed">Resource Usage</h3>
              <div className="space-y-3">
                <PixelProgress value={72} label="CPU" tone="green" />
                <PixelProgress value={48} label="Memory" tone="cyan" />
                <PixelProgress value={61} label="Storage" tone="gold" />
                <PixelProgress value={23} label="Bandwidth" tone="purple" />
              </div>
            </PixelCard>
            <PixelCard className="p-4">
              <h3 className="font-pixel text-xs mb-4 leading-relaxed">Plan Distribution</h3>
              <div className="space-y-3">
                <PixelProgress value={55} label="Free (55%)" tone="neutral" />
                <PixelProgress value={32} label="Pro (32%)" tone="green" />
                <PixelProgress value={13} label="Team (13%)" tone="cyan" />
              </div>
            </PixelCard>
          </div>

          {/* Recent users table */}
          <PixelCard className="p-4">
            <h3 className="font-pixel text-xs mb-4 leading-relaxed">Recent Users</h3>
            <PixelTable
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'plan', label: 'Plan', width: '100px' },
                { key: 'status', label: 'Status', width: '100px' },
              ]}
              rows={RECENT_USERS.map((u) => ({
                ...u,
                status: (
                  <PixelBadge
                    tone={u.status === 'Active' ? 'green' : u.status === 'Pending' ? 'gold' : 'neutral'}
                    className="text-[9px]"
                  >
                    {u.status}
                  </PixelBadge>
                ),
              }))}
            />
          </PixelCard>
        </PixelSection>
      </main>
    </div>
  );
}
`;

/* ─────────────────────────────────────────────────────────────────────────
   5. Blog / Content Site
   ───────────────────────────────────────────────────────────────────────── */
const blogSite = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import Link from 'next/link';
import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Search, Calendar } from '@pxlkit/ui';
import { Heart, Eye, Comment, Globe, AtSign } from '@pxlkit/social';
import { Mail } from '@pxlkit/feedback';
import {
  PixelButton,
  PixelCard,
  PixelBadge,
  PixelAvatar,
  PixelInput,
  PixelFadeIn,
  PixelSection,
  PixelDivider,
} from '@pxlkit/ui-kit';

const FEATURED = {
  title: 'Building Pixel-Art UIs in 2025: The Complete Guide',
  excerpt: 'Everything you need to know about creating retro pixel-art web interfaces using React, Tailwind CSS, and the Pxlkit ecosystem.',
  author: 'Alex Rivers',
  initials: 'AR',
  date: 'Apr 12, 2025',
  tag: 'Tutorial',
  readTime: '8 min read',
  likes: 142,
  views: 3200,
};

const POSTS = [
  {
    title: 'Getting Started with @pxlkit/gamification',
    excerpt: 'Add trophies, swords, coins, and 50+ game icons to your project in minutes.',
    author: 'Sam Chen',
    initials: 'SC',
    date: 'Apr 8, 2025',
    tag: 'Icons',
    readTime: '4 min read',
    tone: 'gold' as const,
  },
  {
    title: 'PixelParallax: Mouse-Tracking 3D Icons',
    excerpt: 'Use ParallaxPxlKitIcon and PixelMouseParallax to add depth to your landing page.',
    author: 'Morgan Blake',
    initials: 'MB',
    date: 'Apr 3, 2025',
    tag: '3D',
    readTime: '6 min read',
    tone: 'purple' as const,
  },
  {
    title: 'Dark Mode with Pxlkit Design Tokens',
    excerpt: 'How the retro-* CSS variable system makes theme switching effortless.',
    author: 'Jordan Lee',
    initials: 'JL',
    date: 'Mar 28, 2025',
    tag: 'Styling',
    readTime: '5 min read',
    tone: 'cyan' as const,
  },
];

export default function BlogSite() {
  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-retro-border/50 bg-retro-bg/90 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="font-pixel text-[10px] text-retro-green">PIXELBLOG</Link>
          <div className="hidden md:flex items-center gap-1">
            {['Articles', 'Tutorials', 'Changelog', 'About'].map((l) => (
              <Link key={l} href="#" className="px-4 py-2 text-sm font-mono text-retro-muted hover:text-retro-text hover:bg-retro-surface rounded transition-all">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-retro-muted hover:text-retro-text border border-retro-border/50 rounded transition-all" aria-label="Search">
              <PxlKitIcon icon={Search} size={16} />
            </button>
            <PixelButton tone="green" size="sm">Subscribe</PixelButton>
          </div>
        </nav>
      </header>

      {/* Featured post */}
      <PixelSection className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <PixelFadeIn>
            <PixelCard className="p-8 bg-retro-green/5 border-retro-green/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <PixelBadge tone="green">{FEATURED.tag}</PixelBadge>
                    <span className="text-retro-muted font-mono text-xs">{FEATURED.readTime}</span>
                  </div>
                  <h1 className="font-pixel text-base sm:text-xl leading-loose mb-4">{FEATURED.title}</h1>
                  <p className="text-retro-muted font-mono text-sm leading-relaxed mb-6">{FEATURED.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PixelAvatar initials={FEATURED.initials} size="sm" />
                      <div>
                        <div className="font-mono text-xs text-retro-text">{FEATURED.author}</div>
                        <div className="flex items-center gap-1 font-mono text-[10px] text-retro-muted">
                          <PxlKitIcon icon={Calendar} size={10} />
                          {FEATURED.date}
                        </div>
                      </div>
                    </div>
                    <PixelButton tone="green" size="sm">
                      Read More <PxlKitIcon icon={ArrowRight} size={12} className="ml-1" />
                    </PixelButton>
                  </div>
                </div>
                <div className="hidden lg:flex items-center justify-center gap-4 text-retro-muted font-mono text-xs">
                  <span className="flex items-center gap-1.5">
                    <PxlKitIcon icon={Heart} size={14} colorful /> {FEATURED.likes}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <PxlKitIcon icon={Eye} size={14} /> {FEATURED.views}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <PxlKitIcon icon={Comment} size={14} /> 24
                  </span>
                </div>
              </div>
            </PixelCard>
          </PixelFadeIn>
        </div>
      </PixelSection>

      <PixelDivider tone="neutral" />

      {/* Post grid */}
      <PixelSection className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-pixel text-base leading-loose mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POSTS.map((p, i) => (
              <PixelFadeIn key={p.title} delay={i * 100}>
                <PixelCard className="p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <PixelBadge tone={p.tone} className="text-[9px]">{p.tag}</PixelBadge>
                    <span className="text-retro-muted font-mono text-[10px]">{p.readTime}</span>
                  </div>
                  <h3 className="font-pixel text-[10px] leading-relaxed mb-2">{p.title}</h3>
                  <p className="text-retro-muted font-mono text-xs leading-relaxed flex-1 mb-4">{p.excerpt}</p>
                  <div className="flex items-center gap-2 pt-3 border-t border-retro-border/40">
                    <PixelAvatar initials={p.initials} size="xs" />
                    <div>
                      <div className="font-mono text-[10px] text-retro-text">{p.author}</div>
                      <div className="font-mono text-[9px] text-retro-muted">{p.date}</div>
                    </div>
                  </div>
                </PixelCard>
              </PixelFadeIn>
            ))}
          </div>
        </div>
      </PixelSection>

      <PixelDivider tone="neutral" />

      {/* Newsletter */}
      <PixelSection className="py-16 px-4 bg-retro-surface/20">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="font-pixel text-base leading-loose mb-3">Stay in the loop</h2>
          <p className="text-retro-muted font-mono text-sm mb-6">
            Get the latest articles and Pxlkit updates delivered to your inbox.
          </p>
          <div className="flex gap-2">
            <PixelInput placeholder="your@email.com" className="flex-1" aria-label="Email for newsletter" />
            <PixelButton tone="green" size="md">
              <PxlKitIcon icon={Mail} size={16} />
            </PixelButton>
          </div>
        </div>
      </PixelSection>

      {/* Footer */}
      <footer className="border-t border-retro-border/50 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-retro-muted">
          <span className="font-pixel text-[9px] text-retro-green">PIXELBLOG</span>
          <span>© {new Date().getFullYear()} PixelBlog. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-retro-cyan transition-colors">
              <PxlKitIcon icon={AtSign} size={16} />
            </a>
            <a href="https://myblog.com" target="_blank" rel="noopener noreferrer" className="hover:text-retro-green transition-colors">
              <PxlKitIcon icon={Globe} size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
`;

export const FULL_PAGE_TEMPLATES: FullPageTemplate[] = [
  {
    id: 'page-saas-landing',
    name: 'SaaS Landing Page',
    description: 'Complete SaaS landing composing 8 rich sections: dropdown header, centered hero, icon-grid features, testimonial cards, pricing cards, FAQ accordion, CTA banner, and multi-column footer — all with micro-interactions, tooltips, and animations.',
    icon: '🚀',
    installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/feedback @pxlkit/gamification',
    code: saasLanding,
  },
  {
    id: 'page-portfolio',
    name: 'Portfolio / Agency',
    description: 'Creative portfolio built from 7 sections: centered-logo header, parallax hero with floating icons, bento features grid, large-quote testimonial, split CTA, two-column FAQ, and CTA footer — immersive parallax effects throughout.',
    icon: '🧑‍💻',
    installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/social @pxlkit/parallax',
    code: devPortfolio,
  },
  {
    id: 'page-indie-game',
    name: 'Indie Game / Product Launch',
    description: 'High-energy product launch with 7 sections: simple header, split hero, alternating features, testimonial slider, toggle pricing, card CTA, and minimal footer — bold visuals and gamification icons.',
    icon: '🎮',
    installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/gamification @pxlkit/effects',
    code: indieGame,
  },
  {
    id: 'page-admin-dashboard',
    name: 'Enterprise / SaaS App',
    description: 'Enterprise-grade page with 6 sections: dropdown header, bento features, comparison pricing table, tabbed FAQ, CTA banner, and multi-column footer — data-rich layout with interactive tables and tabs.',
    icon: '📊',
    installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/feedback',
    code: adminDashboard,
  },
  {
    id: 'page-blog',
    name: 'Blog / Content Site',
    description: 'Content-first blog with 7 sections: simple header, centered hero, alternating features, testimonial cards, FAQ accordion, split CTA, and CTA footer — clean typography with engaging micro-interactions.',
    icon: '📝',
    installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/social @pxlkit/feedback',
    code: blogSite,
  },
];
