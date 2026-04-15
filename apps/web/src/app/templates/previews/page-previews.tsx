'use client';

import { useState } from 'react';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Grid, Check, Settings, Search, Pencil, Home, Download, Copy } from '@pxlkit/ui';
import {
  SparkleStar, FireSword, CoinSpin, FloatingGem,
  Trophy, Shield, Lightning, Star, Sword, Crown, Heart, Gem, MagicWand,
} from '@pxlkit/gamification';
import { User, Globe, Eye, Community, ChatBubble, Message } from '@pxlkit/social';
import { Bell, CheckCircle, Mail, Send, Sparkles } from '@pxlkit/feedback';
import { GlowPulse } from '@pxlkit/effects';
import { Clock } from '@pxlkit/ui';
import {
  PixelButton,
  PixelBadge,
  PixelChip,
  PixelFadeIn,
  PixelStatCard,
  PixelAvatar,
  PixelProgress,
  PixelAlert,
  PixelDivider,
  PixelBounce,
  PixelFloat,
  PixelZoomIn,
  PixelTooltip,
  PixelModal,
  PixelBreadcrumb,
  PixelInput,
  PixelSegmented,
  PixelCard,
} from '@pxlkit/ui-kit';

/* ── SaaS Landing ────────────────────────────────────────────────────────── */
export function PageSaasPreview() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-retro-border shrink-0">
        <div className="flex items-center gap-2.5">
          <PxlKitIcon icon={Grid} size={20} className="text-retro-green" />
          <span className="font-pixel text-sm">SaaSKit</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 font-mono text-sm text-retro-muted">
          <span className="cursor-pointer hover:text-retro-green transition-colors">Features</span>
          <span className="cursor-pointer hover:text-retro-green transition-colors">Pricing</span>
          <span className="cursor-pointer hover:text-retro-green transition-colors">Docs</span>
        </nav>
        <PixelButton tone="green" size="sm">Sign Up</PixelButton>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 sm:py-28 flex-1">
        <PixelFadeIn>
          <PixelBadge tone="green">Open Source</PixelBadge>
          <h1 className="font-pixel text-2xl sm:text-4xl text-retro-text leading-loose mt-6 mb-4">
            Build your SaaS faster
          </h1>
          <p className="text-retro-muted font-mono text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
            Ship your SaaS in days, not months. Production-ready retro components
            for modern web applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <PixelButton
              tone="green"
              size="lg"
              iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
            >
              Get Started Free
            </PixelButton>
            <PixelButton tone="neutral" size="lg" variant="ghost">
              View Docs
            </PixelButton>
          </div>
        </PixelFadeIn>
      </section>

      {/* Trust bar */}
      <section className="px-6 py-8 border-t border-retro-border bg-retro-surface/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-xs text-retro-muted mb-4">Trusted by teams at</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {['Vercel', 'Stripe', 'Supabase', 'Railway', 'Planetscale'].map((name) => (
              <span key={name} className="font-pixel text-sm text-retro-muted/60">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="px-6 py-14 border-t border-retro-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-pixel text-xl text-retro-text text-center mb-10">
            Why developers love it
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Trophy, label: '226+ Icons', desc: 'Handcrafted pixel-art icons', tone: 'gold', tip: 'Every icon hand-drawn at 32x32' },
              { icon: Shield, label: 'Accessible', desc: 'ARIA-ready by default', tone: 'cyan', tip: 'WCAG 2.1 AA compliant' },
              { icon: Lightning, label: 'Fast', desc: 'Tree-shakeable & tiny', tone: 'green', tip: 'Average 0.4kb per component' },
            ].map((f, idx) => (
              <PixelFadeIn key={f.label} delay={idx * 120}>
                <PixelTooltip content={f.tip}>
                  <div className="rounded-xl border border-retro-border bg-retro-surface/30 p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <PxlKitIcon icon={f.icon} size={36} colorful />
                    </div>
                    <p className="font-pixel text-sm text-retro-text mb-2">{f.label}</p>
                    <p className="font-mono text-sm text-retro-muted">{f.desc}</p>
                  </div>
                </PixelTooltip>
              </PixelFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing strip */}
      <section className="px-6 py-14 border-t border-retro-border bg-retro-surface/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-pixel text-xl text-retro-text mb-8">Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                name: 'Free', price: '$0', tone: 'neutral' as const,
                features: ['5 components', 'Community support', 'MIT license'],
              },
              {
                name: 'Pro', price: '$19', tone: 'green' as const,
                features: ['All components', 'Priority support', 'Figma file', 'Updates for 1yr'],
              },
              {
                name: 'Team', price: '$49', tone: 'cyan' as const,
                features: ['Everything in Pro', 'Team license (10)', 'Custom themes', 'Slack channel'],
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-xl border p-5 text-center ${
                  p.tone === 'neutral'
                    ? 'border-retro-border bg-retro-surface/30'
                    : p.tone === 'green'
                    ? 'border-retro-green/30 bg-retro-green/5'
                    : 'border-retro-cyan/30 bg-retro-cyan/5'
                }`}
              >
                <p className="font-pixel text-xs text-retro-text mb-2">{p.name}</p>
                <p className="font-pixel text-2xl text-retro-text mb-3">
                  {p.price}
                  <span className="font-mono text-xs text-retro-muted">/mo</span>
                </p>
                <ul className="space-y-1.5 mb-4 text-left">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-1.5 font-mono text-xs text-retro-muted">
                      <PxlKitIcon icon={Check} size={10} colorful />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <PixelButton tone={p.tone} size="sm" className="w-full justify-center">
                  Choose
                </PixelButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials strip */}
      <section className="px-6 py-14 border-t border-retro-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-pixel text-lg text-retro-text text-center mb-8">What people say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { quote: 'Cut our dev time in half. The retro aesthetic is a hit with users.', author: 'Alex K.', role: 'CTO, PixelStartup' },
              { quote: 'Best component library for anyone wanting a unique UI. Highly recommend.', author: 'Maria S.', role: 'Lead Dev, RetroApps' },
              { quote: 'Accessible out of the box. Our audit passed first try thanks to PxlKit.', author: 'Jordan L.', role: 'Engineer, A11yFirst' },
            ].map((t) => (
              <div key={t.author} className="rounded-xl border border-retro-border bg-retro-surface/20 p-5">
                <p className="font-mono text-sm text-retro-muted leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <PixelAvatar name={t.author} size="sm" tone="green" />
                  <div>
                    <p className="font-pixel text-xs text-retro-text">{t.author}</p>
                    <p className="font-mono text-xs text-retro-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-6 py-14 border-t border-retro-border bg-retro-green/5">
        <div className="max-w-md mx-auto text-center">
          <PxlKitIcon icon={Mail} size={28} colorful />
          <h3 className="font-pixel text-base text-retro-text mt-4 mb-2">Stay in the loop</h3>
          <p className="font-mono text-sm text-retro-muted mb-5">Get updates on new components and releases.</p>
          <div className="flex gap-2">
            <PixelInput placeholder="you@email.com" size="sm" tone="green" />
            <PixelButton tone="green" size="sm" iconRight={<PxlKitIcon icon={Send} size={12} />}>Subscribe</PixelButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-retro-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PxlKitIcon icon={Grid} size={16} className="text-retro-green" />
            <span className="font-pixel text-xs">SaaSKit</span>
          </div>
          <span className="font-mono text-sm text-retro-muted/50">&copy; 2026 SaaSKit</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Portfolio ───────────────────────────────────────────────────────────── */
export function PagePortfolioPreview() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const projects = [
    { name: 'PixelShop', desc: 'E-commerce with retro aesthetic', tag: 'Next.js', details: 'A full-featured online store with pixel-art UI, cart system, Stripe checkout, and admin dashboard.' },
    { name: 'RetroBoard', desc: 'Project management tool', tag: 'React', details: 'Kanban board with drag-and-drop, real-time collaboration, and retro-styled components.' },
    { name: 'VoxelWorld', desc: '3D voxel game engine', tag: 'Three.js', details: 'Browser-based voxel engine with procedural terrain, lighting, and multiplayer support.' },
    { name: 'PixelCraft', desc: 'Icon editor & builder', tag: 'Canvas API', details: 'Draw, animate, and export pixel-art icons. Supports layers, onion skinning, and sprite sheets.' },
  ];

  const currentProject = projects.find((p) => p.name === selectedProject);

  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-retro-border shrink-0">
        <span className="font-pixel text-sm">jane.dev</span>
        <nav className="hidden sm:flex items-center gap-6 font-mono text-sm text-retro-muted">
          <span className="cursor-pointer hover:text-retro-cyan transition-colors">Work</span>
          <span className="cursor-pointer hover:text-retro-cyan transition-colors">About</span>
          <span className="cursor-pointer hover:text-retro-cyan transition-colors">Contact</span>
        </nav>
        <div className="flex items-center gap-2">
          <PixelBadge tone="green">Available for hire</PixelBadge>
          <PixelButton tone="cyan" size="sm">Hire me</PixelButton>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20 sm:py-24">
        <PixelAvatar name="Jane Dev" size="lg" tone="cyan" />
        <h1 className="font-pixel text-2xl sm:text-3xl text-retro-text leading-loose mt-6 mb-3">
          Hi, I&apos;m Jane
        </h1>
        <p className="text-retro-muted font-mono text-sm sm:text-base mb-8 max-w-md leading-relaxed">
          Full-stack developer & pixel artist. I build fast, accessible, and
          delightful web experiences.
        </p>
        <div className="flex gap-3">
          <PixelButton
            tone="cyan"
            size="md"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
          >
            View Projects
          </PixelButton>
          <PixelButton tone="neutral" size="md" variant="ghost">
            Download CV
          </PixelButton>
        </div>
      </section>

      {/* Tech skills */}
      <section className="px-6 py-10 border-t border-retro-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-pixel text-lg text-retro-text mb-5">Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'React', tone: 'cyan' as const },
              { label: 'TypeScript', tone: 'cyan' as const },
              { label: 'Next.js', tone: 'green' as const },
              { label: 'Tailwind', tone: 'cyan' as const },
              { label: 'Node.js', tone: 'green' as const },
              { label: 'PostgreSQL', tone: 'purple' as const },
              { label: 'GraphQL', tone: 'purple' as const },
              { label: 'Docker', tone: 'cyan' as const },
              { label: 'AWS', tone: 'gold' as const },
              { label: 'Figma', tone: 'purple' as const },
            ].map((s) => (
              <PixelChip key={s.label} label={s.label} tone={s.tone} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-10 border-t border-retro-border bg-retro-surface/10">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-5">
          <PixelStatCard label="Projects" value="40+" tone="cyan" />
          <PixelStatCard label="Years Exp" value="8" tone="green" />
          <PixelStatCard label="Clients" value="25+" tone="gold" />
        </div>
      </section>

      {/* Projects grid */}
      <section className="px-6 py-14 border-t border-retro-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-pixel text-xl text-retro-text mb-8">Selected work</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {projects.map((p) => (
              <PixelZoomIn key={p.name}>
                <div
                  className="group rounded-xl border border-retro-border bg-retro-surface/20 p-5 hover:border-retro-cyan/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedProject(p.name)}
                >
                  <div className="h-28 bg-retro-surface/40 rounded-lg mb-4 flex items-center justify-center">
                    <PxlKitIcon icon={Eye} size={20} colorful />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-pixel text-sm text-retro-text mb-1">{p.name}</p>
                      <p className="font-mono text-sm text-retro-muted">{p.desc}</p>
                    </div>
                    <PixelBadge tone="cyan">{p.tag}</PixelBadge>
                  </div>
                </div>
              </PixelZoomIn>
            ))}
          </div>
        </div>
      </section>

      {/* Project detail modal */}
      <PixelModal
        open={!!selectedProject}
        title={currentProject?.name ?? ''}
        onClose={() => setSelectedProject(null)}
      >
        {currentProject && (
          <div className="space-y-3">
            <PixelBadge tone="cyan">{currentProject.tag}</PixelBadge>
            <p className="font-mono text-sm text-retro-muted leading-relaxed">{currentProject.details}</p>
            <div className="flex gap-2 pt-2">
              <PixelButton tone="cyan" size="sm" iconRight={<PxlKitIcon icon={Globe} size={12} />}>Live Demo</PixelButton>
              <PixelButton tone="neutral" size="sm" variant="ghost">Source Code</PixelButton>
            </div>
          </div>
        )}
      </PixelModal>

      {/* Contact Me */}
      <section className="px-6 py-14 border-t border-retro-border bg-retro-cyan/5">
        <div className="max-w-md mx-auto text-center">
          <PxlKitIcon icon={ChatBubble} size={28} colorful />
          <h2 className="font-pixel text-lg text-retro-text mt-4 mb-2">Contact Me</h2>
          <p className="font-mono text-sm text-retro-muted mb-5">Have a project in mind? Let&apos;s talk.</p>
          <div className="space-y-3">
            <PixelInput placeholder="Your name" size="sm" tone="cyan" />
            <PixelInput placeholder="you@email.com" size="sm" tone="cyan" />
            <PixelInput placeholder="Tell me about your project..." size="sm" tone="cyan" />
            <PixelButton tone="cyan" size="sm" className="w-full justify-center" iconRight={<PxlKitIcon icon={Send} size={12} />}>Send Message</PixelButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-retro-border mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-mono text-sm text-retro-muted/50 inline-flex items-center gap-1">Made with <PxlKitIcon icon={Heart} size={12} colorful /> and pixels</span>
          <div className="flex items-center gap-3">
            <PixelTooltip content="GitHub">
              <span className="cursor-pointer"><PxlKitIcon icon={Globe} size={16} colorful /></span>
            </PixelTooltip>
            <PixelTooltip content="Community">
              <span className="cursor-pointer"><PxlKitIcon icon={Community} size={16} colorful /></span>
            </PixelTooltip>
            <PixelTooltip content="Email">
              <span className="cursor-pointer"><PxlKitIcon icon={Mail} size={16} colorful /></span>
            </PixelTooltip>
            <PixelTooltip content="Messages">
              <span className="cursor-pointer"><PxlKitIcon icon={Message} size={16} colorful /></span>
            </PixelTooltip>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Indie Game Landing ──────────────────────────────────────────────────── */
export function PageIndieGamePreview() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [charClass, setCharClass] = useState('warrior');

  const players = [
    { rank: 1, name: 'Hero_42', score: '9,800', level: 58, wins: 342, playtime: '620h' },
    { rank: 2, name: 'PixelKing', score: '8,200', level: 52, wins: 290, playtime: '510h' },
    { rank: 3, name: 'RetroBot', score: '7,100', level: 47, wins: 245, playtime: '430h' },
    { rank: 4, name: 'ShadowX', score: '6,400', level: 43, wins: 198, playtime: '380h' },
    { rank: 5, name: 'GemLord', score: '5,900', level: 40, wins: 175, playtime: '340h' },
  ];

  const currentPlayer = players.find((p) => p.name === selectedPlayer);

  const classStats: Record<string, { hp: number; atk: number; def: number; spd: number }> = {
    warrior: { hp: 90, atk: 75, def: 85, spd: 40 },
    mage: { hp: 50, atk: 95, def: 35, spd: 60 },
    rogue: { hp: 60, atk: 70, def: 45, spd: 95 },
  };

  const stats = classStats[charClass] ?? classStats.warrior;

  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-retro-gold/20 shrink-0">
        <span className="font-pixel text-sm text-retro-gold inline-flex items-center gap-1.5">
          <PxlKitIcon icon={Sword} size={16} colorful /> PixelQuest
        </span>
        <nav className="hidden sm:flex items-center gap-6 font-mono text-sm text-retro-muted">
          <span className="cursor-pointer hover:text-retro-gold transition-colors">Story</span>
          <span className="cursor-pointer hover:text-retro-gold transition-colors">Screenshots</span>
          <span className="cursor-pointer hover:text-retro-gold transition-colors">Leaderboard</span>
        </nav>
        <PixelButton tone="gold" size="sm">Play Now</PixelButton>
      </header>

      {/* Hero with floating icons */}
      <section className="relative flex flex-col items-center text-center px-6 py-20 sm:py-24 bg-retro-gold/5 border-b border-retro-gold/20 overflow-hidden">
        <div className="absolute top-8 left-[15%]">
          <PixelFloat duration={2600}><AnimatedPxlKitIcon icon={SparkleStar} size={28} colorful /></PixelFloat>
        </div>
        <div className="absolute top-16 right-[12%]">
          <PixelFloat duration={3200} distance={8}><AnimatedPxlKitIcon icon={FireSword} size={24} colorful /></PixelFloat>
        </div>
        <div className="absolute bottom-12 left-[20%]">
          <PixelFloat duration={2800} distance={5}><AnimatedPxlKitIcon icon={FloatingGem} size={22} colorful /></PixelFloat>
        </div>
        <div className="absolute bottom-16 right-[18%]">
          <PixelFloat duration={3000}><AnimatedPxlKitIcon icon={CoinSpin} size={22} colorful /></PixelFloat>
        </div>

        <PixelBounce>
          <AnimatedPxlKitIcon icon={SparkleStar} size={56} colorful />
        </PixelBounce>
        <h1 className="font-pixel text-2xl sm:text-4xl text-retro-gold leading-loose mt-6 mb-4">
          PixelQuest
        </h1>
        <p className="text-retro-muted font-mono text-sm sm:text-base mb-8 max-w-md leading-relaxed">
          An epic retro adventure awaits. Explore procedurally generated worlds,
          battle pixel monsters, and conquer ancient dungeons.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PixelButton
            tone="gold"
            size="lg"
            iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}
          >
            Download Free
          </PixelButton>
          <PixelButton tone="neutral" size="lg" variant="ghost">
            Watch Trailer
          </PixelButton>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-14 border-b border-retro-border">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6">
          <PixelStatCard label="Players" value="42k+" tone="gold" />
          <PixelStatCard label="Worlds" value="1,000+" tone="green" />
          <PixelStatCard label="Rating" value="4.9/5" tone="cyan" />
        </div>
      </section>

      {/* Game Features */}
      <section className="px-6 py-14 border-b border-retro-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-pixel text-xl text-retro-text text-center mb-8">Game Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { icon: Sword, label: 'Epic Combat', desc: 'Real-time pixel battles', tone: 'red' as const },
              { icon: Shield, label: 'Strong Armor', desc: 'Craft & upgrade gear', tone: 'cyan' as const },
              { icon: Gem, label: 'Rare Loot', desc: 'Legendary item drops', tone: 'purple' as const },
              { icon: MagicWand, label: 'Magic Spells', desc: '50+ spells to master', tone: 'gold' as const },
            ].map((f) => (
              <PixelCard key={f.label} title={f.label} icon={<PxlKitIcon icon={f.icon} size={24} colorful />}>
                <p className="font-mono text-xs text-retro-muted">{f.desc}</p>
              </PixelCard>
            ))}
          </div>
        </div>
      </section>

      {/* Classes */}
      <section className="px-6 py-14 border-b border-retro-border bg-retro-surface/10">
        <div className="max-w-md mx-auto">
          <h2 className="font-pixel text-xl text-retro-text text-center mb-6">Choose Your Class</h2>
          <PixelSegmented
            label="Character Class"
            options={[
              { label: 'Warrior', value: 'warrior' },
              { label: 'Mage', value: 'mage' },
              { label: 'Rogue', value: 'rogue' },
            ]}
            value={charClass}
            onChange={setCharClass}
            tone="gold"
          />
          <div className="mt-6 space-y-3">
            <PixelProgress value={stats.hp} tone="red" label="HP" />
            <PixelProgress value={stats.atk} tone="gold" label="ATK" />
            <PixelProgress value={stats.def} tone="cyan" label="DEF" />
            <PixelProgress value={stats.spd} tone="green" label="SPD" />
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="px-6 py-14 border-b border-retro-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-pixel text-xl text-retro-text text-center mb-8">Screenshots</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['Dungeon', 'Forest', 'Castle', 'Boss Fight'].map((label) => (
              <PixelTooltip key={label} content={`${label} - Click to enlarge`}>
                <div className="rounded-xl border border-retro-gold/20 bg-retro-surface/30 h-24 flex items-center justify-center cursor-pointer hover:border-retro-gold/50 transition-colors">
                  <span className="font-pixel text-xs text-retro-muted/50">{label}</span>
                </div>
              </PixelTooltip>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="px-6 py-14">
        <div className="max-w-md mx-auto">
          <h2 className="font-pixel text-xl text-retro-text text-center mb-8">
            Top Players
          </h2>
          <div className="rounded-xl border border-retro-border overflow-hidden">
            {players.map((row, i) => (
              <div
                key={row.name}
                className={`flex items-center justify-between px-5 py-3 font-mono text-sm cursor-pointer hover:bg-retro-gold/10 transition-colors ${
                  i < players.length - 1 ? 'border-b border-retro-border/30' : ''
                } ${row.rank === 1 ? 'bg-retro-gold/5' : ''}`}
                onClick={() => setSelectedPlayer(row.name)}
              >
                <span className={row.rank === 1 ? 'text-retro-gold font-bold' : 'text-retro-muted'}>
                  <span className="inline-flex items-center gap-1.5">
                    {row.rank <= 3 && <PxlKitIcon icon={row.rank === 1 ? Crown : row.rank === 2 ? Trophy : Star} size={12} colorful />}
                    #{row.rank} {row.name}
                  </span>
                </span>
                <span className="text-retro-muted">{row.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Player stats modal */}
      <PixelModal
        open={!!selectedPlayer}
        title={currentPlayer?.name ?? ''}
        onClose={() => setSelectedPlayer(null)}
      >
        {currentPlayer && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PxlKitIcon icon={Crown} size={16} colorful />
              <span className="font-pixel text-sm text-retro-gold">Rank #{currentPlayer.rank}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-retro-surface/20">
                <p className="font-pixel text-lg text-retro-text">{currentPlayer.score}</p>
                <p className="font-mono text-xs text-retro-muted">Score</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-retro-surface/20">
                <p className="font-pixel text-lg text-retro-text">Lv.{currentPlayer.level}</p>
                <p className="font-mono text-xs text-retro-muted">Level</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-retro-surface/20">
                <p className="font-pixel text-lg text-retro-text">{currentPlayer.wins}</p>
                <p className="font-mono text-xs text-retro-muted">Wins</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-retro-surface/20">
                <p className="font-pixel text-lg text-retro-text">{currentPlayer.playtime}</p>
                <p className="font-mono text-xs text-retro-muted">Playtime</p>
              </div>
            </div>
          </div>
        )}
      </PixelModal>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-retro-gold/20 mt-auto">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <span className="font-mono text-sm text-retro-muted/50">&copy; 2026 PixelQuest Studio</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Admin Dashboard ─────────────────────────────────────────────────────── */
export function PageDashboardPreview() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [activityModal, setActivityModal] = useState<string | null>(null);

  const sidebarItems = [
    { label: 'Dashboard', icon: Home },
    { label: 'Users', icon: User },
    { label: 'Analytics', icon: Lightning },
    { label: 'Settings', icon: Settings },
    { label: 'Notifications', icon: Bell },
    { label: 'Search', icon: Search },
  ];

  const activities = [
    { user: 'Alice', action: 'signed up', time: '2m ago', tag: 'signup', tagTone: 'green' as const },
    { user: 'Bob', action: 'placed order #1042', time: '15m ago', tag: 'order', tagTone: 'cyan' as const },
    { user: 'Carol', action: 'upgraded to Pro', time: '1h ago', tag: 'upgrade', tagTone: 'gold' as const },
    { user: 'Dave', action: 'submitted a ticket', time: '2h ago', tag: 'support', tagTone: 'red' as const },
    { user: 'Eve', action: 'changed password', time: '3h ago', tag: 'security', tagTone: 'purple' as const },
    { user: 'Frank', action: 'placed order #1043', time: '4h ago', tag: 'order', tagTone: 'cyan' as const },
  ];

  const currentActivity = activities.find((a) => a.user === activityModal);

  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-retro-border shrink-0">
        <div className="flex items-center gap-2.5">
          <PxlKitIcon icon={Grid} size={18} className="text-retro-green" />
          <span className="font-pixel text-sm">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <PixelTooltip content="3 unread notifications">
            <span className="relative cursor-pointer">
              <PxlKitIcon icon={Bell} size={18} colorful />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-retro-red rounded-full border-2 border-retro-bg" />
            </span>
          </PixelTooltip>
          <PixelAvatar name="Admin User" size="sm" tone="green" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 border-r border-retro-border py-4 px-3 flex flex-col gap-1 shrink-0">
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer font-mono text-sm transition-colors ${
                activeNav === item.label
                  ? 'bg-retro-green/10 text-retro-green'
                  : 'text-retro-muted hover:bg-retro-surface/40 hover:text-retro-text'
              }`}
              onClick={() => setActiveNav(item.label)}
            >
              <PxlKitIcon icon={item.icon} size={14} colorful />
              <span>{item.label}</span>
            </div>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <PixelBreadcrumb items={[{ label: 'Home' }, { label: activeNav }]} />

          <h2 className="font-pixel text-base text-retro-text mt-4 mb-6">{activeNav}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <PixelTooltip content="Total registered users across all plans">
              <div><PixelStatCard label="Total Users" value="1,284" tone="green" trend="+12% this week" /></div>
            </PixelTooltip>
            <PixelTooltip content="Monthly recurring revenue">
              <div><PixelStatCard label="Revenue" value="$4,820" tone="cyan" trend="+8% this month" /></div>
            </PixelTooltip>
            <PixelTooltip content="Orders processed today">
              <div><PixelStatCard label="Orders" value="320" tone="gold" trend="+5% today" /></div>
            </PixelTooltip>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { icon: User, label: 'Add User', tone: 'green' as const },
              { icon: Download, label: 'Export', tone: 'cyan' as const },
              { icon: Copy, label: 'Duplicate', tone: 'neutral' as const },
              { icon: Search, label: 'Search', tone: 'neutral' as const },
            ].map((a) => (
              <PixelButton key={a.label} tone={a.tone} size="sm" variant="ghost" iconRight={<PxlKitIcon icon={a.icon} size={12} colorful />}>
                {a.label}
              </PixelButton>
            ))}
          </div>

          <PixelAlert
            tone="green"
            title="System Status"
            message="All services are operational. Last check: 2 min ago."
          />

          {/* Chart area */}
          <div className="mt-5">
            <PixelDivider label="Weekly Traffic" tone="neutral" />
            <div className="mt-4 flex items-end gap-2 h-28">
              {[
                { day: 'Mon', val: 45, tone: 'green' as const },
                { day: 'Tue', val: 62, tone: 'green' as const },
                { day: 'Wed', val: 38, tone: 'cyan' as const },
                { day: 'Thu', val: 78, tone: 'green' as const },
                { day: 'Fri', val: 55, tone: 'cyan' as const },
                { day: 'Sat', val: 30, tone: 'neutral' as const },
                { day: 'Sun', val: 25, tone: 'neutral' as const },
              ].map((bar) => (
                <PixelTooltip key={bar.day} content={`${bar.day}: ${bar.val}% capacity`}>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full rounded-t" style={{ height: `${bar.val}%` }}>
                      <PixelProgress value={100} tone={bar.tone} />
                    </div>
                    <span className="font-mono text-xs text-retro-muted">{bar.day}</span>
                  </div>
                </PixelTooltip>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <PixelProgress value={72} tone="green" label="Storage used" />
            <PixelProgress value={45} tone="cyan" label="API quota" />
            <PixelProgress value={88} tone="gold" label="Monthly bandwidth" />
          </div>

          <div className="mt-6">
            <PixelDivider label="Recent Activity" tone="neutral" />
            <div className="mt-4 space-y-2">
              {activities.map((e) => (
                <div
                  key={`${e.user}-${e.time}`}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-retro-surface/20 font-mono text-sm cursor-pointer hover:bg-retro-surface/40 transition-colors"
                  onClick={() => setActivityModal(e.user)}
                >
                  <span className="text-retro-text flex items-center gap-2">
                    <span className="text-retro-green">{e.user}</span> {e.action}
                    <PixelChip label={e.tag} tone={e.tagTone} />
                  </span>
                  <span className="text-retro-muted text-xs">{e.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Activity detail modal */}
      <PixelModal
        open={!!activityModal}
        title="Activity Detail"
        onClose={() => setActivityModal(null)}
      >
        {currentActivity && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PixelAvatar name={currentActivity.user} size="sm" tone="green" />
              <span className="font-pixel text-sm text-retro-text">{currentActivity.user}</span>
              <PixelChip label={currentActivity.tag} tone={currentActivity.tagTone} />
            </div>
            <p className="font-mono text-sm text-retro-muted">
              {currentActivity.user} {currentActivity.action}
            </p>
            <p className="font-mono text-xs text-retro-muted/60">{currentActivity.time}</p>
          </div>
        )}
      </PixelModal>
    </div>
  );
}

/* ── Blog ────────────────────────────────────────────────────────────────── */
export function PageBlogPreview() {
  const allTags = ['All', 'CSS', 'React', 'Tailwind', 'TypeScript', 'Animation', 'Next.js'];
  const [activeTag, setActiveTag] = useState('All');

  const posts = [
    { title: 'CSS Tips for Pixel Art', tag: 'CSS', mins: 3, author: 'Alice', date: 'Apr 20' },
    { title: 'React Hooks Deep Dive', tag: 'React', mins: 7, author: 'Bob', date: 'Apr 18' },
    { title: 'Tailwind Best Practices', tag: 'Tailwind', mins: 5, author: 'Carol', date: 'Apr 16' },
    { title: 'TypeScript Generics 101', tag: 'TypeScript', mins: 8, author: 'Dave', date: 'Apr 14' },
    { title: 'Animation with Framer', tag: 'Animation', mins: 4, author: 'Eve', date: 'Apr 12' },
    { title: 'Next.js App Router Guide', tag: 'Next.js', mins: 10, author: 'Frank', date: 'Apr 10' },
  ];

  const filteredPosts = activeTag === 'All' ? posts : posts.filter((p) => p.tag === activeTag);

  const popularTags = ['React', 'TypeScript', 'CSS', 'Next.js', 'Tailwind'];
  const recentPosts = posts.slice(0, 3);

  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col">
      {/* Reading progress */}
      <div className="h-1 bg-retro-border sticky top-0 z-10">
        <div className="h-full bg-retro-green w-[35%] transition-all" />
      </div>

      {/* Nav */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-retro-border shrink-0">
        <span className="font-pixel text-sm inline-flex items-center gap-1.5">
          <PxlKitIcon icon={Pencil} size={14} colorful /> DevBlog
        </span>
        <nav className="hidden sm:flex items-center gap-6 font-mono text-sm text-retro-muted">
          <span className="cursor-pointer hover:text-retro-green transition-colors">Posts</span>
          <span className="cursor-pointer hover:text-retro-green transition-colors">Tags</span>
          <span className="cursor-pointer hover:text-retro-green transition-colors">About</span>
        </nav>
        <PixelButton tone="green" size="sm">Subscribe</PixelButton>
      </header>

      {/* Featured post */}
      <section className="px-6 py-14 border-b border-retro-border">
        <div className="max-w-4xl mx-auto">
          <div className="h-44 bg-retro-surface/30 rounded-xl mb-6 flex items-center justify-center border border-retro-border">
            <PxlKitIcon icon={Pencil} size={36} colorful />
          </div>
          <PixelBadge tone="gold">Featured</PixelBadge>
          <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mt-4 mb-3">
            Building Retro UIs in 2026
          </h2>
          <p className="text-retro-muted font-mono text-sm sm:text-base mb-5 max-w-2xl leading-relaxed">
            How pixel-art aesthetics changed modern web design — and why developers are
            embracing the retro revolution for production applications.
          </p>
          <div className="flex items-center gap-4 text-sm text-retro-muted">
            <div className="flex items-center gap-2">
              <PixelAvatar name="Admin" size="sm" tone="green" />
              <span className="font-mono">Admin</span>
            </div>
            <span className="font-mono inline-flex items-center gap-1">
              <PxlKitIcon icon={Clock} size={12} colorful /> 5 min read
            </span>
            <span className="font-mono">Apr 15, 2026</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <PxlKitIcon key={i} icon={Star} size={12} colorful />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tag filter */}
      <section className="px-6 py-4 border-b border-retro-border bg-retro-surface/10">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <span key={tag} onClick={() => setActiveTag(tag)} className="cursor-pointer">
              <PixelChip
                label={tag}
                tone={activeTag === tag ? 'green' : 'neutral'}
              />
            </span>
          ))}
        </div>
      </section>

      {/* Content area with sidebar */}
      <section className="px-6 py-14">
        <div className="max-w-5xl mx-auto flex gap-8">
          {/* Post grid */}
          <div className="flex-1">
            <h3 className="font-pixel text-base text-retro-text mb-6">
              {activeTag === 'All' ? 'Latest posts' : `Posts tagged: ${activeTag}`}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredPosts.map((p) => (
                <div
                  key={p.title}
                  className="rounded-xl border border-retro-border bg-retro-surface/20 p-4 hover:border-retro-green/30 transition-colors cursor-pointer"
                >
                  <div className="h-20 bg-retro-surface/40 rounded-lg mb-3 flex items-center justify-center">
                    <PxlKitIcon icon={Pencil} size={16} colorful />
                  </div>
                  <PixelChip label={p.tag} tone="green" />
                  <p className="font-pixel text-xs text-retro-text mt-2 mb-1">{p.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <PixelAvatar name={p.author} size="sm" tone="cyan" />
                      <span className="font-mono text-xs text-retro-muted">{p.author}</span>
                    </div>
                    <span className="text-retro-muted font-mono text-xs inline-flex items-center gap-1">
                      <PxlKitIcon icon={Clock} size={10} colorful /> {p.mins}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="space-y-6">
              <div>
                <h4 className="font-pixel text-xs text-retro-text mb-3">Popular Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {popularTags.map((tag) => (
                    <span key={tag} onClick={() => setActiveTag(tag)} className="cursor-pointer">
                      <PixelChip label={tag} tone={activeTag === tag ? 'green' : 'neutral'} />
                    </span>
                  ))}
                </div>
              </div>
              <PixelDivider tone="neutral" />
              <div>
                <h4 className="font-pixel text-xs text-retro-text mb-3">Recent Posts</h4>
                <div className="space-y-2">
                  {recentPosts.map((rp) => (
                    <div key={rp.title} className="cursor-pointer hover:bg-retro-surface/20 p-2 rounded-lg transition-colors">
                      <p className="font-pixel text-xs text-retro-text">{rp.title}</p>
                      <p className="font-mono text-xs text-retro-muted">{rp.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-6 py-14 border-t border-retro-border bg-retro-green/5">
        <div className="max-w-md mx-auto text-center">
          <PxlKitIcon icon={Mail} size={28} colorful />
          <h3 className="font-pixel text-base text-retro-text mt-4 mb-2">Subscribe to DevBlog</h3>
          <p className="font-mono text-sm text-retro-muted mb-5">Weekly articles on frontend, design, and pixel art.</p>
          <div className="flex gap-2">
            <PixelInput placeholder="you@email.com" size="sm" tone="green" />
            <PixelButton tone="green" size="sm" iconRight={<PxlKitIcon icon={Send} size={12} />}>Subscribe</PixelButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-retro-border mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-pixel text-xs inline-flex items-center gap-1.5">
            <PxlKitIcon icon={Pencil} size={12} colorful /> DevBlog
          </span>
          <span className="font-mono text-sm text-retro-muted/50">&copy; 2026 DevBlog</span>
        </div>
      </footer>
    </div>
  );
}
