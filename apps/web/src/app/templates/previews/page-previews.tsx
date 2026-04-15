'use client';

import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Grid, Check } from '@pxlkit/ui';
import { SparkleStar, Trophy, Shield, Lightning } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelCard,
  PixelBadge,
  PixelFadeIn,
  PixelStatCard,
  PixelAvatar,
  PixelProgress,
  PixelAlert,
  PixelDivider,
  PixelBounce,
} from '@pxlkit/ui-kit';

/* ── SaaS Landing Preview ─────────────────────────────────────────────── */
export function PageSaasPreview() {
  return (
    <div className="bg-retro-bg text-retro-text font-mono text-[9px]">
      {/* Nav */}
      <header className="flex items-center justify-between px-3 py-2 border-b border-retro-border">
        <div className="flex items-center gap-1.5">
          <PxlKitIcon icon={Grid} size={14} className="text-retro-green" />
          <span className="font-pixel text-[9px]">SaaSKit</span>
        </div>
        <div className="flex gap-2 text-[8px] text-retro-muted">
          <span>Features</span><span>Pricing</span><span>Docs</span>
        </div>
        <PixelButton tone="green" size="sm">Sign Up</PixelButton>
      </header>
      {/* Hero */}
      <div className="py-8 text-center px-3">
        <PixelBadge tone="green">Open Source</PixelBadge>
        <h1 className="font-pixel text-sm text-retro-text mt-2 mb-1">Build faster with SaaSKit</h1>
        <p className="text-retro-muted text-[8px] mb-3 max-w-[200px] mx-auto">Ship your SaaS in days, not months.</p>
        <PixelButton tone="green" size="sm">Get Started <PxlKitIcon icon={ArrowRight} size={10} className="ml-1" /></PixelButton>
      </div>
      {/* Features */}
      <div className="grid grid-cols-3 gap-2 px-3 pb-4">
        {[
          { icon: Trophy, label: 'Icons' },
          { icon: Shield, label: 'Secure' },
          { icon: Lightning, label: 'Fast' },
        ].map((f) => (
          <div key={f.label} className="border border-retro-border rounded p-2 text-center">
            <PxlKitIcon icon={f.icon} size={16} colorful />
            <p className="text-[8px] mt-1">{f.label}</p>
          </div>
        ))}
      </div>
      {/* Footer */}
      <footer className="border-t border-retro-border px-3 py-2 text-[8px] text-retro-muted text-center">
        © 2026 SaaSKit
      </footer>
    </div>
  );
}

/* ── Portfolio Preview ────────────────────────────────────────────────── */
export function PagePortfolioPreview() {
  return (
    <div className="bg-retro-bg text-retro-text font-mono text-[9px]">
      <header className="flex items-center justify-between px-3 py-2 border-b border-retro-border">
        <span className="font-pixel text-[9px]">Jane.dev</span>
        <div className="flex gap-2 text-[8px] text-retro-muted">
          <span>Work</span><span>About</span><span>Contact</span>
        </div>
      </header>
      <div className="py-8 text-center px-3">
        <PixelAvatar name="Jane" size="md" />
        <h1 className="font-pixel text-sm mt-2 mb-1">Hi, I&apos;m Jane 👋</h1>
        <p className="text-retro-muted text-[8px] mb-3">Full-stack developer & pixel artist</p>
        <PixelButton tone="cyan" size="sm">View Projects</PixelButton>
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 pb-4">
        {['Project A', 'Project B', 'Project C', 'Project D'].map((p) => (
          <div key={p} className="border border-retro-border rounded p-2">
            <div className="h-8 bg-retro-surface/40 rounded mb-1" />
            <p className="text-[8px] font-pixel">{p}</p>
          </div>
        ))}
      </div>
      <footer className="border-t border-retro-border px-3 py-2 text-[8px] text-retro-muted text-center">
        Made with ♥ and pixels
      </footer>
    </div>
  );
}

/* ── Indie Game Landing Preview ───────────────────────────────────────── */
export function PageIndieGamePreview() {
  return (
    <div className="bg-retro-bg text-retro-text font-mono text-[9px]">
      <header className="flex items-center justify-between px-3 py-2 border-b border-retro-border">
        <span className="font-pixel text-[9px] text-retro-gold">⚔️ PixelQuest</span>
        <PixelButton tone="gold" size="sm">Play Now</PixelButton>
      </header>
      <div className="py-8 text-center px-3 bg-retro-gold/5">
        <PixelBounce>
          <AnimatedPxlKitIcon icon={SparkleStar} size={32} colorful />
        </PixelBounce>
        <h1 className="font-pixel text-sm text-retro-gold mt-2 mb-1">PixelQuest</h1>
        <p className="text-retro-muted text-[8px] mb-3">An epic retro adventure awaits</p>
        <PixelButton tone="gold" size="sm">Download Free</PixelButton>
      </div>
      <div className="px-3 py-3">
        <p className="font-pixel text-[8px] text-retro-muted mb-1">Leaderboard</p>
        <div className="border border-retro-border rounded">
          {['Hero_42 — 9,800', 'PixelKing — 8,200', 'RetroBot — 7,100'].map((row, i) => (
            <div key={i} className={`px-2 py-1 text-[8px] ${i < 2 ? 'border-b border-retro-border/30' : ''}`}>
              #{i + 1} {row}
            </div>
          ))}
        </div>
      </div>
      <footer className="border-t border-retro-border px-3 py-2 text-[8px] text-retro-muted text-center">
        © 2026 PixelQuest Studio
      </footer>
    </div>
  );
}

/* ── Admin Dashboard Preview ──────────────────────────────────────────── */
export function PageDashboardPreview() {
  return (
    <div className="bg-retro-bg text-retro-text font-mono text-[9px] flex">
      {/* Sidebar */}
      <aside className="w-16 border-r border-retro-border py-2 px-1 flex flex-col gap-1">
        <div className="text-center">
          <PxlKitIcon icon={Grid} size={14} className="text-retro-green mx-auto" />
        </div>
        <PixelDivider tone="neutral" />
        {['📊', '👤', '⚙️'].map((e) => (
          <div key={e} className="text-center text-sm py-1 cursor-pointer hover:bg-retro-surface/40 rounded">{e}</div>
        ))}
      </aside>
      {/* Content */}
      <div className="flex-1 p-3">
        <h2 className="font-pixel text-[9px] mb-2">Dashboard</h2>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <PixelStatCard label="Users" value="1.2k" tone="green" />
          <PixelStatCard label="Revenue" value="$4.8k" tone="cyan" />
          <PixelStatCard label="Orders" value="320" tone="gold" />
        </div>
        <PixelAlert tone="green" title="System Status" message="All services operational" />
        <div className="mt-2">
          <PixelProgress value={72} tone="green" />
        </div>
      </div>
    </div>
  );
}

/* ── Blog Preview ─────────────────────────────────────────────────────── */
export function PageBlogPreview() {
  return (
    <div className="bg-retro-bg text-retro-text font-mono text-[9px]">
      <header className="flex items-center justify-between px-3 py-2 border-b border-retro-border">
        <span className="font-pixel text-[9px]">📝 DevBlog</span>
        <div className="flex gap-2 text-[8px] text-retro-muted">
          <span>Posts</span><span>Tags</span><span>About</span>
        </div>
      </header>
      {/* Featured post */}
      <div className="px-3 py-4 border-b border-retro-border">
        <PixelBadge tone="gold">Featured</PixelBadge>
        <h2 className="font-pixel text-xs mt-1 mb-0.5">Building Retro UIs in 2026</h2>
        <p className="text-retro-muted text-[8px] mb-2">How pixel-art aesthetics changed modern web design.</p>
        <div className="flex items-center gap-1.5 text-[8px] text-retro-muted">
          <PixelAvatar name="Admin" size="sm" />
          <span>Admin</span>
          <span>·</span>
          <span>5 min read</span>
        </div>
      </div>
      {/* Post grid */}
      <div className="grid grid-cols-2 gap-2 p-3">
        {['CSS Tips', 'React Hooks'].map((p) => (
          <div key={p} className="border border-retro-border rounded p-2">
            <div className="h-6 bg-retro-surface/40 rounded mb-1" />
            <p className="font-pixel text-[8px]">{p}</p>
            <p className="text-retro-muted text-[7px]">3 min read</p>
          </div>
        ))}
      </div>
      <footer className="border-t border-retro-border px-3 py-2 text-[8px] text-retro-muted text-center">
        © 2026 DevBlog
      </footer>
    </div>
  );
}
