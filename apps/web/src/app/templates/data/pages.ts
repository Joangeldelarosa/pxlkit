import type { FullPageTemplate } from '../types';

/* ─────────────────────────────────────────────────────────────────────────
   1. SaaS Landing Page
   ───────────────────────────────────────────────────────────────────────── */
const saasLanding = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Package, CloudSync } from '@pxlkit/ui';
import { ShieldCheck, Sparkles } from '@pxlkit/feedback';
import { SparkleStar, Trophy, Coin } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelFeatureCard,
  PixelPricingCard,
  PixelStatCard,
  PixelBadge,
  PixelAccordion,
  PixelFadeIn,
  PixelTypewriter,
  PixelDivider,
  PixelContainer,
  PixelSectionHeader,
  PixelStack,
  PixelCluster,
  PixelEqualHeightGrid,
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
  { id: 'free', title: 'Is it free?', content: 'Yes, MIT licensed and free for personal and commercial use.' },
  { id: 'nextjs', title: 'Next.js compatible?', content: 'Fully compatible with Next.js App Router and Pages Router.' },
  { id: 'typescript', title: 'TypeScript support?', content: 'Full strict TypeScript support across all packages.' },
];

export default function SaasLandingPage() {
  return (
    <div className="min-h-screen bg-retro-bg text-retro-text">
      {/* Hero */}
      <PixelContainer as="section" maxWidth="xl" padding="xl" className="text-center">
        <PixelFadeIn>
          <PixelStack gap={4} align="center">
            <PixelBadge tone="green" iconLeft={<PxlKitIcon icon={Sparkles} size={12} />}>
              v1.0 — Now open source
            </PixelBadge>
            <h1 className="font-pixel text-2xl sm:text-4xl leading-loose">
              <PixelTypewriter label="Ship retro UIs faster" speed={55} />
            </h1>
            <p className="text-retro-muted font-mono text-sm max-w-lg mx-auto">
              The complete pixel-art React ecosystem. Components, icons, animations, and 3D effects — all open source.
            </p>
            <PixelCluster gap={3} justify="center">
              <PixelButton tone="green" size="lg" iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}>
                Get Started Free
              </PixelButton>
              <PixelButton tone="neutral" size="lg" variant="outline">Browse Docs</PixelButton>
            </PixelCluster>
          </PixelStack>
        </PixelFadeIn>
        <PixelFadeIn delay={300} className="mt-12">
          <PixelCluster gap={4} justify="center">
            <PixelStatCard label="Stars" value="4.2k" size="sm" icon={<PxlKitIcon icon={Trophy} size={16} colorful />} />
            <PixelStatCard label="Downloads" value="18k/mo" size="sm" icon={<PxlKitIcon icon={Coin} size={16} colorful />} />
            <PixelStatCard label="Icons" value="226+" size="sm" icon={<AnimatedPxlKitIcon icon={SparkleStar} size={16} colorful />} />
          </PixelCluster>
        </PixelFadeIn>
      </PixelContainer>

      <PixelDivider tone="neutral" />

      {/* Features */}
      <PixelContainer as="section" maxWidth="2xl" padding="lg" aria-labelledby="saas-features-title">
        <PixelSectionHeader
          id="saas-features-title"
          align="center"
          size="md"
          title="Everything you need"
        />
        <div className="mt-10">
          <PixelEqualHeightGrid cols={{ base: 1, md: 3 }} gap={6}>
            {FEATURES.map((f, i) => (
              <PixelFadeIn key={f.title} delay={i * 100} className="h-full">
                <PixelFeatureCard
                  className="h-full"
                  icon={<PxlKitIcon icon={f.icon} size={24} colorful />}
                  title={f.title}
                  description={f.desc}
                  descriptionLines={2}
                />
              </PixelFadeIn>
            ))}
          </PixelEqualHeightGrid>
        </div>
      </PixelContainer>

      <PixelDivider tone="neutral" />

      {/* Pricing */}
      <PixelContainer as="section" maxWidth="2xl" padding="lg" aria-labelledby="saas-pricing-title">
        <PixelSectionHeader
          id="saas-pricing-title"
          align="center"
          size="md"
          title="Simple pricing"
        />
        <div className="mt-10">
          <PixelEqualHeightGrid cols={{ base: 1, md: 3 }} gap={6}>
            {PLANS.map((plan, i) => (
              <PixelFadeIn key={plan.name} delay={i * 100} className="h-full">
                <PixelPricingCard
                  className="h-full"
                  tone={plan.tone}
                  highlight={'popular' in plan && plan.popular}
                  popular={'popular' in plan && plan.popular ? { label: 'Popular', tone: 'green' } : undefined}
                  name={plan.name}
                  descriptionLines="none"
                  price={{ amount: plan.price }}
                  features={plan.features.map((label) => ({ label }))}
                  cta={
                    <PixelButton
                      tone={plan.tone}
                      size="md"
                      variant={'popular' in plan && plan.popular ? 'solid' : 'outline'}
                      className="w-full justify-center"
                    >
                      Get {plan.name}
                    </PixelButton>
                  }
                />
              </PixelFadeIn>
            ))}
          </PixelEqualHeightGrid>
        </div>
      </PixelContainer>

      <PixelDivider tone="neutral" />

      {/* FAQ */}
      <PixelContainer as="section" maxWidth="md" padding="lg" aria-labelledby="saas-faq-title">
        <PixelSectionHeader id="saas-faq-title" align="center" size="md" title="FAQ" />
        <div className="mt-10">
          <PixelAccordion items={FAQ} />
        </div>
      </PixelContainer>

      {/* Final CTA */}
      <PixelContainer
        as="section"
        maxWidth="sm"
        padding="lg"
        className="bg-retro-green/5 border-t border-retro-green/20"
      >
        <PixelStack gap={4} align="center" className="text-center">
          <h2 className="font-pixel text-xl leading-loose">Ready to ship?</h2>
          <p className="text-retro-muted font-mono text-sm">Free forever. Open source. No credit card required.</p>
          <PixelButton tone="green" size="lg" iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}>
            Start Building
          </PixelButton>
        </PixelStack>
      </PixelContainer>
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
import { ArrowRight, ExternalLink } from '@pxlkit/ui';
import { AtSign } from '@pxlkit/social';
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
  PixelDivider,
  PixelContainer,
  PixelSectionHeader,
  PixelGrid,
  PixelStack,
  PixelCluster,
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
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <PixelMouseParallax strength={14} className="absolute top-20 left-10">
            <ParallaxPxlKitIcon icon={PixelRocket} size={64} />
          </PixelMouseParallax>
          <PixelMouseParallax strength={24} className="absolute top-28 right-16">
            <ParallaxPxlKitIcon icon={MagicOrb} size={56} />
          </PixelMouseParallax>
          <PixelMouseParallax strength={10} className="absolute bottom-24 right-20">
            <ParallaxPxlKitIcon icon={CoolEmoji} size={48} />
          </PixelMouseParallax>
        </div>
        <PixelContainer as="div" maxWidth="3xl" padding="lg" className="relative z-10">
          <PixelFadeIn>
            <PixelStack gap={4} align="start">
              <PixelBadge tone="cyan">Available for work</PixelBadge>
              <h1 className="font-pixel text-2xl sm:text-4xl leading-loose">
                Hi, I&apos;m <span className="text-retro-green">Alex</span>
              </h1>
              <p className="text-retro-muted font-mono text-sm max-w-md">
                Full-stack developer building beautiful, performant web apps. Passionate about
                pixel art, game dev, and open source.
              </p>
              <PixelCluster gap={3}>
                <PixelButton tone="green" size="lg" iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}>
                  View Projects
                </PixelButton>
                <PixelButton tone="neutral" size="lg" variant="outline">
                  Download CV
                </PixelButton>
              </PixelCluster>
            </PixelStack>
          </PixelFadeIn>
        </PixelContainer>
      </section>

      <PixelDivider tone="neutral" />

      {/* Projects */}
      <PixelContainer as="section" maxWidth="2xl" padding="lg" aria-labelledby="projects-title">
        <PixelSectionHeader id="projects-title" size="md" title="Projects" />
        <div className="mt-10">
          <PixelGrid cols={{ base: 1, md: 3 }} gap={6}>
            {PROJECTS.map((p, i) => (
              <PixelFadeIn key={p.title} delay={i * 100}>
                <PixelCard
                  className="h-full"
                  title={p.title}
                  description={p.desc}
                  descriptionLines={2}
                  footer={
                    <PixelButton
                      tone={p.tone}
                      size="sm"
                      variant="outline"
                      iconRight={<PxlKitIcon icon={ExternalLink} size={12} />}
                    >
                      View
                    </PixelButton>
                  }
                >
                  <PixelCluster gap={1}>
                    {p.tags.map((t) => (
                      <PixelBadge key={t} tone={p.tone} size="sm">{t}</PixelBadge>
                    ))}
                  </PixelCluster>
                </PixelCard>
              </PixelFadeIn>
            ))}
          </PixelGrid>
        </div>
      </PixelContainer>

      <PixelDivider tone="neutral" />

      {/* Skills */}
      <PixelContainer as="section" maxWidth="sm" padding="lg" aria-labelledby="skills-title">
        <PixelSectionHeader id="skills-title" size="md" title="Skills" />
        <PixelStack gap={4} className="mt-10">
          {SKILLS.map((s, i) => (
            <PixelFadeIn key={s.name} delay={i * 60}>
              <PixelProgress value={s.level} label={s.name} tone="green" />
            </PixelFadeIn>
          ))}
        </PixelStack>
      </PixelContainer>

      <PixelDivider tone="neutral" />

      {/* Contact */}
      <PixelContainer as="section" maxWidth="sm" padding="lg" aria-labelledby="contact-title">
        <PixelSectionHeader
          id="contact-title"
          align="center"
          size="md"
          title="Get in touch"
          description="Available for freelance and full-time roles."
        />
        <PixelCard padding="lg" className="mt-8">
          <PixelStack gap={4}>
            <PixelInput label="Name" placeholder="Your name" />
            <PixelInput label="Email" placeholder="your@email.com" type="email" />
            <PixelTextarea label="Message" placeholder="Tell me about your project..." rows={4} />
            <PixelButton
              tone="green"
              size="md"
              className="w-full justify-center"
              iconRight={<PxlKitIcon icon={AtSign} size={14} />}
            >
              Send Message
            </PixelButton>
          </PixelStack>
        </PixelCard>
      </PixelContainer>
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
  PixelContainer,
  PixelSectionHeader,
  PixelStack,
  PixelCluster,
  PixelGrid,
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
      <PixelContainer as="section" maxWidth="xl" padding="xl" className="bg-retro-purple/5 text-center">
        <PixelFadeIn>
          <PixelStack gap={4} align="center">
            <PixelCluster gap={4} justify="center">
              <PixelFloat>
                <AnimatedPxlKitIcon icon={FireSword} size={64} colorful />
              </PixelFloat>
              <PixelBounce>
                <AnimatedPxlKitIcon icon={FloatingSkull} size={48} colorful />
              </PixelBounce>
            </PixelCluster>
            <PixelBadge tone="red">Now in Early Access</PixelBadge>
            <PixelGlitch>
              <h1 className="font-pixel text-2xl sm:text-4xl leading-loose">
                DUNGEON<br />
                <span className="text-retro-red">CRAWLER X</span>
              </h1>
            </PixelGlitch>
            <p className="text-retro-muted font-mono text-sm max-w-md mx-auto">
              A hardcore retro roguelike with procedural dungeons, brutal boss fights,
              and hundreds of items to collect.
            </p>
            <PixelCluster gap={3} justify="center">
              <PixelButton tone="red" size="lg" iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}>
                Play Now — Free
              </PixelButton>
              <PixelButton tone="neutral" size="lg" variant="outline" iconRight={<PxlKitIcon icon={Download} size={14} />}>
                Download Demo
              </PixelButton>
            </PixelCluster>
          </PixelStack>
        </PixelFadeIn>

        <PixelFadeIn delay={200} className="mt-12">
          <PixelCluster gap={4} justify="center">
            <PixelStatCard label="Players" value="24k+" size="sm" icon={<PxlKitIcon icon={Trophy} size={16} colorful />} />
            <PixelStatCard label="Items" value="500+" size="sm" icon={<PxlKitIcon icon={Coin} size={16} colorful />} />
            <PixelStatCard label="Dungeons" value="∞" size="sm" icon={<AnimatedPxlKitIcon icon={SparkleStar} size={16} colorful />} />
          </PixelCluster>
        </PixelFadeIn>
      </PixelContainer>

      {/* Features */}
      <PixelContainer as="section" maxWidth="2xl" padding="lg" aria-labelledby="game-features-title">
        <PixelSectionHeader id="game-features-title" align="center" size="md" title="Features" />
        <div className="mt-10">
          <PixelGrid cols={{ base: 1, md: 3 }} gap={6}>
            {FEATURES.map((f, i) => (
              <PixelFadeIn key={f.title} delay={i * 100}>
                <PixelCard padding="lg" className="h-full text-center">
                  <div className="flex justify-center mb-4">
                    <PxlKitIcon icon={f.icon} size={32} colorful />
                  </div>
                  <h3 className="font-pixel text-xs mb-2 leading-relaxed">{f.title}</h3>
                  <p className="text-retro-muted font-mono text-xs">{f.desc}</p>
                </PixelCard>
              </PixelFadeIn>
            ))}
          </PixelGrid>
        </div>
      </PixelContainer>

      {/* Leaderboard */}
      <PixelContainer as="section" maxWidth="sm" padding="lg" className="bg-retro-surface/20">
        <h2 className="font-pixel text-xl text-center leading-loose mb-10">
          <AnimatedPxlKitIcon icon={CoinSpin} size={24} colorful className="inline mr-3" />
          Leaderboard
        </h2>
        <PixelTable
          columns={[
            { key: 'rank', header: '#', width: '60px' },
            { key: 'player', header: 'Player' },
            { key: 'score', header: 'Score' },
            { key: 'level', header: 'Level', width: '80px' },
          ]}
          data={LEADERBOARD}
        />
      </PixelContainer>

      {/* Download CTA */}
      <PixelContainer
        as="section"
        maxWidth="sm"
        padding="lg"
        className="text-center bg-retro-red/5 border-t border-retro-red/20"
      >
        <PixelStack gap={4} align="center">
          <PixelCluster gap={3} justify="center">
            <AnimatedPxlKitIcon icon={ExplosionBurst} size={40} colorful />
            <AnimatedPxlKitIcon icon={GlowPulse} size={40} colorful />
          </PixelCluster>
          <h2 className="font-pixel text-xl leading-loose">Ready to explore?</h2>
          <p className="text-retro-muted font-mono text-sm">Free to play. Cross-platform. No ads.</p>
          <PixelButton tone="red" size="lg" iconRight={<PxlKitIcon icon={Download} size={14} />}>
            Download Free
          </PixelButton>
        </PixelStack>
      </PixelContainer>
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
import { Home, Settings, Grid, List, Search, Upload } from '@pxlkit/ui';
import { Bell, InfoCircle } from '@pxlkit/feedback';
import {
  PixelButton,
  PixelCard,
  PixelStatCard,
  PixelTable,
  PixelAlert,
  PixelProgress,
  PixelBadge,
  PixelInput,
  PixelStack,
  PixelGrid,
} from '@pxlkit/ui-kit';

const STATS = [
  { label: 'Total Users', value: '12,480', trend: '+8%', icon: Home, tone: 'green' as const },
  { label: 'Revenue', value: '$48,200', trend: '+12%', icon: Upload, tone: 'cyan' as const },
  { label: 'Active Projects', value: '234', trend: '-3%', icon: Grid, tone: 'gold' as const },
  { label: 'Support Tickets', value: '18', trend: '-22%', icon: Bell, tone: 'red' as const },
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
          <div className="w-64">
            <PixelInput
              size="sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<PxlKitIcon icon={Search} size={14} className="text-retro-muted" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-retro-muted hover:text-retro-text border border-retro-border/50 rounded transition-all" aria-label="Notifications">
              <PxlKitIcon icon={Bell} size={16} />
              <PixelBadge tone="red" size="sm" className="absolute -top-1 -right-1 px-1">3</PixelBadge>
            </button>
            <PixelButton tone="green" size="sm">+ New Project</PixelButton>
          </div>
        </header>

        <PixelStack as="section" gap={6} className="p-6">
          {/* Alerts */}
          <PixelAlert
            tone="cyan"
            icon={<PxlKitIcon icon={InfoCircle} size={16} />}
            message="System maintenance scheduled for Sunday 02:00–04:00 UTC."
          />

          {/* Stat cards */}
          <PixelGrid cols={{ base: 2, lg: 4 }} gap={4}>
            {STATS.map((s) => (
              <PixelStatCard
                key={s.label}
                label={s.label}
                value={s.value}
                trend={s.trend}
                tone={s.tone}
                icon={<PxlKitIcon icon={s.icon} size={18} colorful />}
              />
            ))}
          </PixelGrid>

          {/* Usage stats */}
          <PixelGrid cols={{ base: 1, md: 2 }} gap={4}>
            <PixelCard title="Resource Usage">
              <PixelStack gap={3}>
                <PixelProgress value={72} label="CPU" tone="green" />
                <PixelProgress value={48} label="Memory" tone="cyan" />
                <PixelProgress value={61} label="Storage" tone="gold" />
                <PixelProgress value={23} label="Bandwidth" tone="purple" />
              </PixelStack>
            </PixelCard>
            <PixelCard title="Plan Distribution">
              <PixelStack gap={3}>
                <PixelProgress value={55} label="Free (55%)" tone="neutral" />
                <PixelProgress value={32} label="Pro (32%)" tone="green" />
                <PixelProgress value={13} label="Team (13%)" tone="cyan" />
              </PixelStack>
            </PixelCard>
          </PixelGrid>

          {/* Recent users table */}
          <PixelCard title="Recent Users">
            <PixelTable
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'email', header: 'Email' },
                { key: 'plan', header: 'Plan', width: '100px' },
                { key: 'status', header: 'Status', width: '100px' },
              ]}
              data={RECENT_USERS.map((u) => ({
                ...u,
                status: (
                  <PixelBadge
                    tone={u.status === 'Active' ? 'green' : u.status === 'Pending' ? 'gold' : 'neutral'}
                    size="sm"
                  >
                    {u.status}
                  </PixelBadge>
                ),
              }))}
            />
          </PixelCard>
        </PixelStack>
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
  PixelDivider,
  PixelContainer,
  PixelCenter,
  PixelSectionHeader,
  PixelStack,
  PixelGrid,
  PixelTwoColumn,
} from '@pxlkit/ui-kit';

const FEATURED = {
  title: 'Building Pixel-Art UIs in 2025: The Complete Guide',
  excerpt: 'Everything you need to know about creating retro pixel-art web interfaces using React, Tailwind CSS, and the Pxlkit ecosystem.',
  author: 'Alex Rivers',
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
    date: 'Apr 8, 2025',
    tag: 'Icons',
    readTime: '4 min read',
    tone: 'gold' as const,
  },
  {
    title: 'PixelParallax: Mouse-Tracking 3D Icons',
    excerpt: 'Use ParallaxPxlKitIcon and PixelMouseParallax to add depth to your landing page.',
    author: 'Morgan Blake',
    date: 'Apr 3, 2025',
    tag: '3D',
    readTime: '6 min read',
    tone: 'purple' as const,
  },
  {
    title: 'Dark Mode with Pxlkit Design Tokens',
    excerpt: 'How the retro-* CSS variable system makes theme switching effortless.',
    author: 'Jordan Lee',
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
        <PixelCenter as="nav" maxWidth="3xl" gutter="lg" aria-label="Main">
          <div className="h-14 flex items-center justify-between">
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
          </div>
        </PixelCenter>
      </header>

      {/* Featured post */}
      <PixelContainer as="section" maxWidth="3xl" padding="md">
        <PixelFadeIn>
          <PixelCard tone="green" padding="lg">
            <PixelTwoColumn
              ratio="50/50"
              gap={8}
              stackBelow="lg"
              align="center"
              left={
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <PixelBadge tone="green">{FEATURED.tag}</PixelBadge>
                    <span className="text-retro-muted font-mono text-xs">{FEATURED.readTime}</span>
                  </div>
                  <h1 className="font-pixel text-base sm:text-xl leading-loose mb-4">{FEATURED.title}</h1>
                  <p className="text-retro-muted font-mono text-sm leading-relaxed mb-6">{FEATURED.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PixelAvatar name={FEATURED.author} size="sm" />
                      <div>
                        <div className="font-mono text-xs text-retro-text">{FEATURED.author}</div>
                        <div className="flex items-center gap-1 font-mono text-[10px] text-retro-muted">
                          <PxlKitIcon icon={Calendar} size={10} />
                          {FEATURED.date}
                        </div>
                      </div>
                    </div>
                    <PixelButton tone="green" size="sm" iconRight={<PxlKitIcon icon={ArrowRight} size={12} />}>
                      Read More
                    </PixelButton>
                  </div>
                </div>
              }
              right={
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
              }
            />
          </PixelCard>
        </PixelFadeIn>
      </PixelContainer>

      <PixelDivider tone="neutral" />

      {/* Post grid */}
      <PixelContainer as="section" maxWidth="3xl" padding="md" aria-labelledby="latest-title">
        <PixelSectionHeader id="latest-title" size="sm" title="Latest Articles" />
        <div className="mt-8">
          <PixelGrid cols={{ base: 1, md: 3 }} gap={6}>
            {POSTS.map((p, i) => (
              <PixelFadeIn key={p.title} delay={i * 100}>
                <PixelCard padding="lg" className="h-full">
                  <div className="flex h-full flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <PixelBadge tone={p.tone} size="sm">{p.tag}</PixelBadge>
                      <span className="text-retro-muted font-mono text-[10px]">{p.readTime}</span>
                    </div>
                    <h3 className="font-pixel text-[10px] leading-relaxed mb-2">{p.title}</h3>
                    <p className="text-retro-muted font-mono text-xs leading-relaxed flex-1 mb-4">{p.excerpt}</p>
                    <div className="flex items-center gap-2 pt-3 border-t border-retro-border/40">
                      <PixelAvatar name={p.author} size="xs" />
                      <div>
                        <div className="font-mono text-[10px] text-retro-text">{p.author}</div>
                        <div className="font-mono text-[9px] text-retro-muted">{p.date}</div>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              </PixelFadeIn>
            ))}
          </PixelGrid>
        </div>
      </PixelContainer>

      <PixelDivider tone="neutral" />

      {/* Newsletter */}
      <PixelContainer as="section" maxWidth="sm" padding="lg" className="bg-retro-surface/20">
        <PixelStack gap={3} align="center" className="text-center">
          <h2 className="font-pixel text-base leading-loose">Stay in the loop</h2>
          <p className="text-retro-muted font-mono text-sm">
            Get the latest articles and Pxlkit updates delivered to your inbox.
          </p>
          <div className="flex w-full gap-2">
            <div className="flex-1">
              <PixelInput placeholder="your@email.com" aria-label="Email for newsletter" />
            </div>
            <PixelButton tone="green" size="md" aria-label="Subscribe">
              <PxlKitIcon icon={Mail} size={16} />
            </PixelButton>
          </div>
        </PixelStack>
      </PixelContainer>

      {/* Footer */}
      <footer className="border-t border-retro-border/50">
        <PixelCenter as="div" maxWidth="3xl" gutter="lg" className="py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-retro-muted">
            <span className="font-pixel text-[9px] text-retro-green">PIXELBLOG</span>
            <span>© {new Date().getFullYear()} PixelBlog. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-retro-cyan transition-colors" aria-label="Twitter">
                <PxlKitIcon icon={AtSign} size={16} />
              </a>
              <a href="https://myblog.com" target="_blank" rel="noopener noreferrer" className="hover:text-retro-green transition-colors" aria-label="Website">
                <PxlKitIcon icon={Globe} size={16} />
              </a>
            </div>
          </div>
        </PixelCenter>
      </footer>
    </div>
  );
}
`;

/* ─────────────────────────────────────────────────────────────────────────
   6. Docs Site (placeholder — full template lives at /templates/docs)
   ───────────────────────────────────────────────────────────────────────── */
const docsSite = `\
// Full source for the docs template lives at:
// apps/web/src/components/templates/docs-template.tsx
// The route /templates/docs renders <PixelDocsTemplate /> end-to-end.
// Lift the component into your repo, theme it, swap the copy, ship.

import { PixelDocsTemplate } from '@pxlkit/ui-kit/templates';

export default function DocsPage() {
  return <PixelDocsTemplate />;
}
`;

/* ─────────────────────────────────────────────────────────────────────────
   7. Shop / Storefront (placeholder — full template lives at /templates/ecommerce)
   ───────────────────────────────────────────────────────────────────────── */
const shopStorefront = `\
// Full source for the storefront template lives at:
// apps/web/src/components/templates/ecommerce-template.tsx
// The route /templates/ecommerce renders <PixelEcommerceTemplate /> end-to-end.
// Lift the component into your repo, wire it to your products + cart, ship.

import { PixelEcommerceTemplate } from '@pxlkit/ui-kit/templates';

export default function ShopPage() {
  return <PixelEcommerceTemplate />;
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
    category: 'marketing',
    fullPageHref: '/templates/landing-full',
  },
  {
    id: 'page-portfolio',
    name: 'Portfolio / Agency',
    description: 'Creative portfolio built from 7 sections: centered-logo header, parallax hero with floating icons, bento features grid, large-quote testimonial, split CTA, two-column FAQ, and CTA footer — immersive parallax effects throughout.',
    icon: '🧑‍💻',
    installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/social @pxlkit/parallax',
    code: devPortfolio,
    category: 'portfolio',
    fullPageHref: '/templates/portfolio',
  },
  {
    id: 'page-indie-game',
    name: 'Indie Game / Product Launch',
    description: 'High-energy product launch with 7 sections: simple header, split hero, alternating features, testimonial slider, toggle pricing, card CTA, and minimal footer — bold visuals and gamification icons.',
    icon: '🎮',
    installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/gamification @pxlkit/effects',
    code: indieGame,
    category: 'product',
  },
  {
    id: 'page-admin-dashboard',
    name: 'Enterprise / SaaS App',
    description: 'Enterprise-grade page with 6 sections: dropdown header, bento features, comparison pricing table, tabbed FAQ, CTA banner, and multi-column footer — data-rich layout with interactive tables and tabs.',
    icon: '📊',
    installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/feedback',
    code: adminDashboard,
    category: 'app',
    fullPageHref: '/templates/dashboards',
  },
  {
    id: 'page-blog',
    name: 'Blog / Content Site',
    description: 'Content-first blog with 7 sections: simple header, centered hero, alternating features, testimonial cards, FAQ accordion, split CTA, and CTA footer — clean typography with engaging micro-interactions.',
    icon: '📝',
    installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui @pxlkit/social @pxlkit/feedback',
    code: blogSite,
    category: 'content',
  },
  {
    id: 'page-docs',
    name: 'Docs Site',
    description: 'Reference-style docs shell with sidebar navigation, content area, and TOC — perfect for API references, technical handbooks, and knowledge bases.',
    icon: '📚',
    installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui',
    code: docsSite,
    category: 'content',
    fullPageHref: '/templates/docs',
  },
  {
    id: 'page-ecommerce',
    name: 'Shop / Storefront',
    description: 'Storefront with product grid, filters, cart sheet, and checkout flow — ready to wire to your products and a payments provider.',
    icon: '🛒',
    installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/ui',
    code: shopStorefront,
    category: 'shop',
    fullPageHref: '/templates/ecommerce',
  },
];
