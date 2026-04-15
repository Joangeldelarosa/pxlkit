'use client';

import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Grid, Check, Settings, Search, Pencil } from '@pxlkit/ui';
import { SparkleStar, Trophy, Shield, Lightning, Star, Sword, Crown, Heart } from '@pxlkit/gamification';
import { User, Globe } from '@pxlkit/social';
import { Bell } from '@pxlkit/feedback';
import {
  PixelButton,
  PixelBadge,
  PixelFadeIn,
  PixelStatCard,
  PixelAvatar,
  PixelProgress,
  PixelAlert,
  PixelDivider,
  PixelBounce,
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

      {/* Features strip */}
      <section className="px-6 py-14 border-t border-retro-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-pixel text-xl text-retro-text text-center mb-10">
            Why developers love it
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Trophy, label: '226+ Icons', desc: 'Handcrafted pixel-art icons', tone: 'gold' },
              { icon: Shield, label: 'Accessible', desc: 'ARIA-ready by default', tone: 'cyan' },
              { icon: Lightning, label: 'Fast', desc: 'Tree-shakeable & tiny', tone: 'green' },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-xl border border-retro-border bg-retro-surface/30 p-6 text-center"
              >
                <div className="flex justify-center mb-4">
                  <PxlKitIcon icon={f.icon} size={36} colorful />
                </div>
                <p className="font-pixel text-sm text-retro-text mb-2">{f.label}</p>
                <p className="font-mono text-sm text-retro-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing strip */}
      <section className="px-6 py-14 border-t border-retro-border bg-retro-surface/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-pixel text-xl text-retro-text mb-8">Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Free', price: '$0', tone: 'neutral' as const },
              { name: 'Pro', price: '$19', tone: 'green' as const },
              { name: 'Team', price: '$49', tone: 'cyan' as const },
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
                <PixelButton tone={p.tone} size="sm" className="w-full justify-center">
                  Choose
                </PixelButton>
              </div>
            ))}
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
          <span className="font-mono text-sm text-retro-muted/50">© 2026 SaaSKit</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Portfolio ───────────────────────────────────────────────────────────── */
export function PagePortfolioPreview() {
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
        <PixelButton tone="cyan" size="sm">Hire me</PixelButton>
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

      {/* Projects grid */}
      <section className="px-6 py-14 border-t border-retro-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-pixel text-xl text-retro-text mb-8">Selected work</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { name: 'PixelShop', desc: 'E-commerce with retro aesthetic', tag: 'Next.js' },
              { name: 'RetroBoard', desc: 'Project management tool', tag: 'React' },
              { name: 'VoxelWorld', desc: '3D voxel game engine', tag: 'Three.js' },
              { name: 'PixelCraft', desc: 'Icon editor & builder', tag: 'Canvas API' },
            ].map((p) => (
              <div
                key={p.name}
                className="group rounded-xl border border-retro-border bg-retro-surface/20 p-5 hover:border-retro-cyan/40 transition-colors cursor-pointer"
              >
                <div className="h-28 bg-retro-surface/40 rounded-lg mb-4 flex items-center justify-center">
                  <span className="font-pixel text-xs text-retro-muted/40">Preview</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-pixel text-sm text-retro-text mb-1">{p.name}</p>
                    <p className="font-mono text-sm text-retro-muted">{p.desc}</p>
                  </div>
                  <PixelBadge tone="cyan">{p.tag}</PixelBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-retro-border mt-auto">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <span className="font-mono text-sm text-retro-muted/50 inline-flex items-center gap-1">Made with <PxlKitIcon icon={Heart} size={12} colorful /> and pixels</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Indie Game Landing ──────────────────────────────────────────────────── */
export function PageIndieGamePreview() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-retro-gold/20 shrink-0">
        <span className="font-pixel text-sm text-retro-gold inline-flex items-center gap-1.5"><PxlKitIcon icon={Sword} size={16} colorful /> PixelQuest</span>
        <nav className="hidden sm:flex items-center gap-6 font-mono text-sm text-retro-muted">
          <span className="cursor-pointer hover:text-retro-gold transition-colors">Story</span>
          <span className="cursor-pointer hover:text-retro-gold transition-colors">Screenshots</span>
          <span className="cursor-pointer hover:text-retro-gold transition-colors">Leaderboard</span>
        </nav>
        <PixelButton tone="gold" size="sm">Play Now</PixelButton>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20 sm:py-24 bg-retro-gold/5 border-b border-retro-gold/20">
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
          <PixelStatCard label="Worlds" value="∞" tone="green" />
          <PixelStatCard label="Rating" value="4.9★" tone="cyan" />
        </div>
      </section>

      {/* Leaderboard */}
      <section className="px-6 py-14">
        <div className="max-w-md mx-auto">
          <h2 className="font-pixel text-xl text-retro-text text-center mb-8">
            Top Players
          </h2>
          <div className="rounded-xl border border-retro-border overflow-hidden">
            {[
              { rank: 1, name: 'Hero_42', score: '9,800', tone: 'gold' },
              { rank: 2, name: 'PixelKing', score: '8,200', tone: 'neutral' },
              { rank: 3, name: 'RetroBot', score: '7,100', tone: 'neutral' },
            ].map((row, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-5 py-3 font-mono text-sm ${
                  i < 2 ? 'border-b border-retro-border/30' : ''
                } ${row.tone === 'gold' ? 'bg-retro-gold/5' : ''}`}
              >
                <span
                  className={
                    row.tone === 'gold' ? 'text-retro-gold font-bold' : 'text-retro-muted'
                  }
                >
                  #{row.rank} {row.name}
                </span>
                <span className="text-retro-muted">{row.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-retro-gold/20 mt-auto">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <span className="font-mono text-sm text-retro-muted/50">© 2026 PixelQuest Studio</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Admin Dashboard ─────────────────────────────────────────────────────── */
export function PageDashboardPreview() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-retro-border shrink-0">
        <div className="flex items-center gap-2.5">
          <PxlKitIcon icon={Grid} size={18} className="text-retro-green" />
          <span className="font-pixel text-sm">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <PixelAvatar name="Admin User" size="sm" tone="green" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 border-r border-retro-border py-4 px-3 flex flex-col gap-1 shrink-0">
          {[
            { label: 'Dashboard', icon: Grid, active: true },
            { label: 'Users', icon: User, active: false },
            { label: 'Analytics', icon: Lightning, active: false },
            { label: 'Settings', icon: Settings, active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer font-mono text-sm transition-colors ${
                item.active
                  ? 'bg-retro-green/10 text-retro-green'
                  : 'text-retro-muted hover:bg-retro-surface/40 hover:text-retro-text'
              }`}
            >
              <PxlKitIcon icon={item.icon} size={14} colorful />
              <span>{item.label}</span>
            </div>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="font-pixel text-base text-retro-text mb-6">Dashboard</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <PixelStatCard label="Total Users" value="1,284" tone="green" trend="+12% this week" />
            <PixelStatCard label="Revenue" value="$4,820" tone="cyan" trend="+8% this month" />
            <PixelStatCard label="Orders" value="320" tone="gold" trend="+5% today" />
          </div>

          <PixelAlert
            tone="green"
            title="System Status"
            message="All services are operational. Last check: 2 min ago."
          />

          <div className="mt-5 space-y-4">
            <PixelProgress value={72} tone="green" label="Storage used" />
            <PixelProgress value={45} tone="cyan" label="API quota" />
            <PixelProgress value={88} tone="gold" label="Monthly bandwidth" />
          </div>

          <div className="mt-6">
            <PixelDivider label="Recent Activity" tone="neutral" />
            <div className="mt-4 space-y-2">
              {[
                { user: 'Alice', action: 'signed up', time: '2m ago' },
                { user: 'Bob', action: 'placed order #1042', time: '15m ago' },
                { user: 'Carol', action: 'upgraded to Pro', time: '1h ago' },
              ].map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-retro-surface/20 font-mono text-sm"
                >
                  <span className="text-retro-text">
                    <span className="text-retro-green">{e.user}</span> {e.action}
                  </span>
                  <span className="text-retro-muted text-xs">{e.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Blog ────────────────────────────────────────────────────────────────── */
export function PageBlogPreview() {
  return (
    <div className="bg-retro-bg text-retro-text min-h-screen flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-retro-border shrink-0">
        <span className="font-pixel text-sm inline-flex items-center gap-1.5"><PxlKitIcon icon={Pencil} size={14} colorful /> DevBlog</span>
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
            <span className="font-mono">5 min read</span>
            <span className="font-mono">Apr 15, 2026</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <PxlKitIcon key={i} icon={Star} size={12} className="text-retro-gold" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Post grid */}
      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-pixel text-base text-retro-text mb-6">Latest posts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'CSS Tips for Pixel Art', tag: 'CSS', mins: 3 },
              { title: 'React Hooks Deep Dive', tag: 'React', mins: 7 },
              { title: 'Tailwind Best Practices', tag: 'Tailwind', mins: 5 },
              { title: 'TypeScript Generics 101', tag: 'TypeScript', mins: 8 },
              { title: 'Animation with Framer', tag: 'Animation', mins: 4 },
              { title: 'Next.js App Router Guide', tag: 'Next.js', mins: 10 },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-retro-border bg-retro-surface/20 p-4 hover:border-retro-green/30 transition-colors cursor-pointer"
              >
                <div className="h-20 bg-retro-surface/40 rounded-lg mb-3 flex items-center justify-center">
                  <span className="font-pixel text-xs text-retro-muted/30">Preview</span>
                </div>
                <PixelBadge tone="green">{p.tag}</PixelBadge>
                <p className="font-pixel text-xs text-retro-text mt-2 mb-1">{p.title}</p>
                <p className="text-retro-muted font-mono text-xs">{p.mins} min read</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-retro-border mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-pixel text-xs inline-flex items-center gap-1.5"><PxlKitIcon icon={Pencil} size={12} colorful /> DevBlog</span>
          <span className="font-mono text-sm text-retro-muted/50">© 2026 DevBlog</span>
        </div>
      </footer>
    </div>
  );
}
