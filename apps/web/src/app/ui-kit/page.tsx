'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import {
  PixelAccordion,
  PixelAlert,
  PixelAvatar,
  PixelBadge,
  PixelBounce,
  PixelBreadcrumb,
  PixelButton,
  PixelCard,
  PixelCheckbox,
  PixelChip,
  PixelCollapsible,
  PixelCodeInline,
  PixelColorSwatch,
  PixelDivider,
  PixelDropdown,
  PixelEmptyState,
  PixelFadeIn,
  PixelFloat,
  PixelGlitch,
  PxlKitButton,
  PixelInput,
  PixelKbd,
  PixelModal,
  PixelPagination,
  PixelPasswordInput,
  PixelProgress,
  PixelPulse,
  PixelRadioGroup,
  PixelRotate,
  PixelSection,
  PixelShake,
  PixelSegmented,
  PixelSelect,
  PixelSkeleton,
  PixelSlideIn,
  PixelSlider,
  PixelSplitButton,
  PixelStatCard,
  PixelSwitch,
  PixelTable,
  PixelTextLink,
  PixelTabs,
  PixelTextarea,
  PixelTooltip,
  PixelTypewriter,
  PixelZoomIn,
  PixelFlicker,
  PixelParallaxLayer,
  PixelParallaxGroup,
  PixelMouseParallax,
  UI_KIT_COMPONENTS,
} from '@pxlkit/ui-kit';
import {
  Package, Search, Check, Grid, Edit, Robot, Copy, Gear, Menu, Home, ArrowRight, SparkleSmall, Clock, Lock,
} from '@pxlkit/ui';
import { Trophy, Lightning, FireSword, Crown, Sword, Shield, Coin, Star } from '@pxlkit/gamification';
import { Bell, CheckCircle, WarningTriangle, InfoCircle } from '@pxlkit/feedback';
import { Heart, Message, Smile, ThumbsUp } from '@pxlkit/social';
import { CodeBlock } from '../../components/CodeBlock';
import { useToast, type ToastPosition, type ToastTone } from '../../components/ToastProvider';

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════════════════════════════ */

type PropDef = { name: string; type: string; default: string; description: string };
const UI_COMPONENTS_COUNT = UI_KIT_COMPONENTS.length;

const CATEGORIES = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'getting-started', name: 'Getting Started' },
      { id: 'design-tokens', name: 'Design Tokens' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { id: 'pixel-button', name: 'PixelButton' },
      { id: 'pxlkit-button', name: 'PxlKitButton' },
      { id: 'pixel-split-button', name: 'PixelSplitButton' },
    ],
  },
  {
    id: 'inputs',
    label: 'Inputs',
    items: [
      { id: 'pixel-input', name: 'PixelInput' },
      { id: 'pixel-password-input', name: 'PixelPasswordInput' },
      { id: 'pixel-textarea', name: 'PixelTextarea' },
      { id: 'pixel-select', name: 'PixelSelect' },
      { id: 'pixel-checkbox', name: 'PixelCheckbox' },
      { id: 'pixel-radio-group', name: 'PixelRadioGroup' },
      { id: 'pixel-switch', name: 'PixelSwitch' },
      { id: 'pixel-slider', name: 'PixelSlider' },
      { id: 'pixel-segmented', name: 'PixelSegmented' },
    ],
  },
  {
    id: 'data-display',
    label: 'Data Display',
    items: [
      { id: 'pixel-card', name: 'PixelCard' },
      { id: 'pixel-stat-card', name: 'PixelStatCard' },
      { id: 'pixel-table', name: 'PixelTable' },
      { id: 'pixel-avatar', name: 'PixelAvatar' },
      { id: 'pixel-badge', name: 'PixelBadge' },
      { id: 'pixel-chip', name: 'PixelChip' },
      { id: 'pixel-text-link', name: 'PixelTextLink' },
      { id: 'pixel-code-inline', name: 'PixelCodeInline' },
      { id: 'pixel-kbd', name: 'PixelKbd' },
      { id: 'pixel-color-swatch', name: 'PixelColorSwatch' },
    ],
  },
  {
    id: 'feedback',
    label: 'Feedback',
    items: [
      { id: 'pixel-alert', name: 'PixelAlert' },
      { id: 'pixel-progress', name: 'PixelProgress' },
      { id: 'pixel-skeleton', name: 'PixelSkeleton' },
      { id: 'pixel-empty-state', name: 'PixelEmptyState' },
      { id: 'pixel-toast', name: 'PixelToast' },
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    items: [
      { id: 'pixel-tabs', name: 'PixelTabs' },
      { id: 'pixel-accordion', name: 'PixelAccordion' },
      { id: 'pixel-collapsible', name: 'PixelCollapsible' },
      { id: 'pixel-breadcrumb', name: 'PixelBreadcrumb' },
      { id: 'pixel-pagination', name: 'PixelPagination' },
    ],
  },
  {
    id: 'overlay',
    label: 'Overlay',
    items: [
      { id: 'pixel-modal', name: 'PixelModal' },
      { id: 'pixel-tooltip', name: 'PixelTooltip' },
      { id: 'pixel-dropdown', name: 'PixelDropdown' },
    ],
  },
  {
    id: 'layout',
    label: 'Layout',
    items: [
      { id: 'pixel-section', name: 'PixelSection' },
      { id: 'pixel-divider', name: 'PixelDivider' },
    ],
  },
  {
    id: 'primitives',
    label: 'Primitives',
    items: [
      { id: 'pixel-bare-button', name: 'PixelBareButton' },
      { id: 'pixel-bare-input', name: 'PixelBareInput' },
      { id: 'pixel-bare-textarea', name: 'PixelBareTextarea' },
    ],
  },
  {
    id: 'animations',
    label: 'Animations',
    items: [
      { id: 'pixel-fade-in', name: 'PixelFadeIn' },
      { id: 'pixel-slide-in', name: 'PixelSlideIn' },
      { id: 'pixel-pulse', name: 'PixelPulse' },
      { id: 'pixel-bounce', name: 'PixelBounce' },
      { id: 'pixel-float', name: 'PixelFloat' },
      { id: 'pixel-shake', name: 'PixelShake' },
      { id: 'pixel-rotate', name: 'PixelRotate' },
      { id: 'pixel-zoom-in', name: 'PixelZoomIn' },
      { id: 'pixel-flicker', name: 'PixelFlicker' },
      { id: 'pixel-typewriter', name: 'PixelTypewriter' },
      { id: 'pixel-glitch', name: 'PixelGlitch' },
    ],
  },
  {
    id: 'parallax',
    label: 'Parallax',
    items: [
      { id: 'pixel-parallax-layer', name: 'PixelParallaxLayer' },
      { id: 'pixel-parallax-group', name: 'PixelParallaxGroup' },
      { id: 'pixel-mouse-parallax', name: 'PixelMouseParallax' },
    ],
  },
];

const ALL_SECTION_IDS = CATEGORIES.flatMap((c) => c.items.map((i) => i.id));

/* ═══════════════════════════════════════════════════════════════════════════════
   INTERNAL: Cross-link helper
   ═══════════════════════════════════════════════════════════════════════════════ */

function CompLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <PixelTextLink
      onClick={() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
      className="decoration-retro-cyan/40"
    >
      {children}
    </PixelTextLink>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   INTERNAL: PropsTable
   ═══════════════════════════════════════════════════════════════════════════════ */

function PropsTable({ data }: { data: PropDef[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-retro-border/40">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-retro-border bg-retro-surface/40">
            <th className="whitespace-nowrap px-3 py-2.5 font-mono font-semibold text-retro-muted">Prop</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono font-semibold text-retro-muted">Type</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono font-semibold text-retro-muted">Default</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono font-semibold text-retro-muted">Description</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.name} className="border-b border-retro-border/20">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-retro-cyan">{p.name}</td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-retro-purple">{p.type}</td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-retro-gold">{p.default || '—'}</td>
              <td className="px-3 py-2 text-retro-muted">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   INTERNAL: DocSection
   ═══════════════════════════════════════════════════════════════════════════════ */

function DocSection({
  id,
  title,
  description,
  props,
  code,
  children,
}: {
  id: string;
  title: string;
  description: React.ReactNode;
  props?: PropDef[];
  code?: string;
  children: React.ReactNode;
}) {
  return (
    <section data-section={id} id={id} className="scroll-mt-20 space-y-4 pt-10 first:pt-0">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="font-pixel text-xs text-retro-green">{title.toUpperCase()}</h2>
          <PixelBadge tone="neutral">{title.replace('Pixel', '').toLowerCase()}</PixelBadge>
        </div>
        <div className="mt-2 text-sm text-retro-muted max-w-2xl">{description}</div>
      </div>

      {/* Live preview */}
      <div className="rounded-lg border border-retro-border/40 bg-retro-surface/20 p-4 sm:p-6">
        {children}
      </div>

      {/* Props table */}
      {props && props.length > 0 && (
        <PixelCollapsible label={`Props reference (${props.length})`}>
          <div>
            <PropsTable data={props} />
          </div>
        </PixelCollapsible>
      )}

      {/* Code example */}
      {code && <CodeBlock code={code} language="tsx" />}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   INTERNAL: AnimationReplay — wrapper for animation demos with a replay button
   ═══════════════════════════════════════════════════════════════════════════════ */

function AnimationReplay({
  id,
  title,
  description,
  props,
  code,
  children,
}: {
  id: string;
  title: string;
  description: React.ReactNode;
  props?: PropDef[];
  code?: string;
  children: (key: number) => React.ReactNode;
}) {
  const [tick, setTick] = useState(0);
  return (
    <section data-section={id} id={id} className="scroll-mt-20 space-y-4 pt-10">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="font-pixel text-xs text-retro-purple">{title.toUpperCase()}</h2>
          <PixelBadge tone="purple">{title.replace('Pixel', '').toLowerCase()}</PixelBadge>
        </div>
        <div className="mt-2 text-sm text-retro-muted max-w-2xl">{description}</div>
      </div>

      {/* Live preview */}
      <div className="rounded-lg border border-retro-border/40 bg-retro-surface/20 p-4 sm:p-6">
        <div className="mb-3 flex justify-end">
          <PixelButton
            onClick={() => setTick((n) => n + 1)}
            tone="purple"
            size="sm"
            variant="ghost"
            className="h-auto px-2.5 py-1 text-[10px]"
            iconLeft={
              <svg viewBox="0 0 8 8" className="h-2.5 w-2.5" shapeRendering="crispEdges" fill="currentColor">
                <rect x="5" y="1" width="1" height="1"/><rect x="6" y="2" width="1" height="2"/>
                <rect x="5" y="4" width="1" height="1"/><rect x="1" y="1" width="3" height="1"/>
                <rect x="1" y="2" width="1" height="2"/><rect x="1" y="4" width="3" height="1"/>
                <rect x="3" y="5" width="1" height="1"/><rect x="4" y="6" width="2" height="1"/>
                <rect x="6" y="5" width="1" height="1"/>
              </svg>
            }
          >
            Replay
          </PixelButton>
        </div>
        {children(tick)}
      </div>

      {/* Props table */}
      {props && props.length > 0 && (
        <PixelCollapsible label={`Props reference (${props.length})`} tone="purple">
          <div>
            <PropsTable data={props} />
          </div>
        </PixelCollapsible>
      )}

      {/* Code example */}
      {code && <CodeBlock code={code} language="tsx" />}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   INTERNAL: Sidebar
   ═══════════════════════════════════════════════════════════════════════════════ */

function SidebarContent({
  activeId,
  searchQuery,
  onSearchChange,
  onNavigate,
}: {
  activeId: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: (id: string) => void;
}) {
  const filtered = searchQuery
    ? CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase())),
      })).filter((cat) => cat.items.length > 0)
    : CATEGORIES;

  return (
    <nav className="space-y-4">
      {/* Search */}
      <PixelInput
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search components..."
        icon={<PxlKitIcon icon={Search} size={14} />}
        size="sm"
      />

      {/* Categories */}
      {filtered.map((cat) => (
        <div key={cat.id}>
          <div className="mb-1.5 flex items-center justify-between px-2">
            <h4 className="font-pixel text-[9px] uppercase tracking-wider text-retro-muted">{cat.label}</h4>
            <span className="font-mono text-[9px] text-retro-muted/50">{cat.items.length}</span>
          </div>
          <ul className="space-y-0.5">
            {cat.items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <PixelButton
                    onClick={() => onNavigate(item.id)}
                    size="sm"
                    tone={isActive ? 'green' : 'neutral'}
                    variant="ghost"
                    className={`w-full justify-start px-2.5 py-1.5 text-left text-xs ${
                      isActive
                        ? 'bg-retro-green/10 text-retro-green shadow-[inset_2px_0_0_rgb(var(--retro-green))]'
                        : 'text-retro-muted hover:bg-retro-surface/50 hover:text-retro-text'
                    }`}
                    iconLeft={<span className={`inline-block h-1 w-1 rounded-full transition-colors ${isActive ? 'bg-retro-green' : 'bg-retro-border'}`} />}
                  >
                    {item.name}
                  </PixelButton>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Total count */}
      <div className="border-t border-retro-border/30 pt-3 px-2">
        <p className="font-mono text-[10px] text-retro-muted/50">
          {UI_COMPONENTS_COUNT} components + toast docs
        </p>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function UIKitPage() {
  /* ── Demo state ── */
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('react');
  const [switched, setSwitched] = useState(true);
  const [slider, setSlider] = useState(66);
  const [paginationPage, setPaginationPage] = useState(2);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [selectVal, setSelectVal] = useState('ui');
  const [segmented, setSegmented] = useState('comfortable');
  const [progress, setProgress] = useState(72);
  const [toastTone, setToastTone] = useState<ToastTone>('success');
  const [toastPosition, setToastPosition] = useState<ToastPosition>('top-right');
  const [toastDuration, setToastDuration] = useState(2500);
  const { toast, success, error, info, warning } = useToast();

  /* ── Sidebar state ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');
  const [showBackToTop, setShowBackToTop] = useState(false);

  /* ── Scroll spy ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section');
            if (id) setActiveSection(id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );
    document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Back to top visibility ── */
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSidebarOpen(false);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* ────────────────── Mobile FAB (menu) ────────────────── */}
      <PxlKitButton
        label="Open navigation"
        tone="green"
        size="lg"
        className="fixed bottom-6 right-6 z-50 border-retro-green/40 bg-retro-bg/95 backdrop-blur-sm shadow-lg lg:hidden"
        icon={<PxlKitIcon icon={Menu} size={18} />}
        onClick={() => setSidebarOpen(true)}
      />

      {/* ────────────────── Back to top ────────────────── */}
      <PxlKitButton
        aria-label="Scroll to top"
        label="Scroll to top"
        onClick={scrollToTop}
        tone="neutral"
        size="md"
        icon={
          <svg viewBox="0 0 8 8" className="h-3.5 w-3.5" shapeRendering="crispEdges" fill="currentColor">
            <rect x="3" y="1" width="2" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="5" y="2" width="1" height="1" />
            <rect x="1" y="3" width="1" height="1" />
            <rect x="6" y="3" width="1" height="1" />
            <rect x="3" y="3" width="2" height="4" />
          </svg>
        }
        className={`fixed bottom-6 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-retro-border/60 bg-retro-bg/95 backdrop-blur-sm text-retro-muted hover:text-retro-green hover:border-retro-green/40 shadow-lg transition-all ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        } left-6 lg:left-[calc(16rem+1.5rem)]`}
      />

      {/* ────────────────── Mobile sidebar overlay ────────────────── */}
      <div
        className={`fixed inset-0 z-50 transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 overflow-y-auto border-r border-retro-border bg-retro-bg p-5 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-5 flex items-center justify-between">
            <span className="font-pixel text-[10px] text-retro-green">COMPONENTS</span>
            <PxlKitButton
              label="Close"
              tone="neutral"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              icon={
                <svg viewBox="0 0 8 8" className="h-3 w-3" shapeRendering="crispEdges" fill="currentColor">
                  <rect x="1" y="1" width="1" height="1" /><rect x="2" y="2" width="1" height="1" />
                  <rect x="5" y="2" width="1" height="1" /><rect x="6" y="1" width="1" height="1" />
                  <rect x="3" y="3" width="2" height="2" />
                  <rect x="1" y="6" width="1" height="1" /><rect x="2" y="5" width="1" height="1" />
                  <rect x="5" y="5" width="1" height="1" /><rect x="6" y="6" width="1" height="1" />
                </svg>
              }
            />
          </div>
          <SidebarContent activeId={activeSection} searchQuery={searchQuery} onSearchChange={setSearchQuery} onNavigate={scrollTo} />
        </aside>
      </div>

      {/* ════════════════ MAIN LAYOUT ════════════════ */}
      <div className="relative">
        {/* ────────────────── Desktop sidebar (fixed) ────────────────── */}
        <aside className="hidden lg:block fixed top-16 left-0 bottom-0 w-64 z-30 border-r border-retro-border/40 bg-retro-bg/95 backdrop-blur-sm">
          <div className="h-full overflow-y-auto overscroll-contain p-5 pb-16 scrollbar-thin">
            <p className="mb-4 font-pixel text-[10px] text-retro-green">COMPONENTS</p>
            <SidebarContent activeId={activeSection} searchQuery={searchQuery} onSearchChange={setSearchQuery} onNavigate={scrollTo} />
          </div>
        </aside>

        {/* ────────────────── Content area ────────────────── */}
        <main className="min-h-screen lg:ml-64">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 py-8 pb-24">

            {/* ══════════════════ HERO ══════════════════ */}
            <header>
              <PixelBreadcrumb items={[{ label: 'Home', href: '/' }, { label: 'UI Kit', active: true }]} />
              <h1 className="mt-4 font-pixel text-base text-retro-green sm:text-lg leading-relaxed">PXLKIT UI KIT</h1>
              <p className="mt-3 max-w-2xl text-sm text-retro-muted leading-relaxed">
                A full-featured, fully custom React component library built with TypeScript, Tailwind CSS, and Pxlkit pixel-art icons.
                Every element is hand-crafted without native browser UI components — designed for retro-futuristic interfaces that work
                flawlessly across all devices. Use the sidebar to navigate all {UI_COMPONENTS_COUNT} components and PixelToast docs.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <PixelBadge tone="green">{UI_COMPONENTS_COUNT} components</PixelBadge>
                <PixelBadge tone="cyan">icon-ready</PixelBadge>
                <PixelBadge tone="gold">typescript-first</PixelBadge>
                <PixelBadge tone="purple">a11y baseline</PixelBadge>
                <PixelBadge tone="red">zero dependencies</PixelBadge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <PixelStatCard label="Components" value={String(UI_COMPONENTS_COUNT)} icon={<PxlKitIcon icon={Grid} size={16} />} tone="green" />
                <PixelStatCard label="Icon Packs" value="6" icon={<PxlKitIcon icon={Package} size={16} />} tone="cyan" />
                <PixelStatCard label="Design Tokens" value="6 tones" icon={<PxlKitIcon icon={SparkleSmall} size={16} />} tone="gold" />
                <PixelStatCard label="Fully Custom" value="100%" icon={<PxlKitIcon icon={Check} size={16} />} tone="purple" />
              </div>
            </header>

            <PixelDivider label="Documentation" tone="green" spacing="lg" />

            {/* ══════════════════ GETTING STARTED ══════════════════ */}
            <section data-section="getting-started" id="getting-started" className="scroll-mt-20 space-y-4">
              <h2 className="font-pixel text-xs text-retro-green">GETTING STARTED</h2>
              <p className="text-sm text-retro-muted">
                Import components from the UI Kit module and pair them with any icon from the Pxlkit icon packs.
                All components share a common API surface with <CompLink id="design-tokens"><PixelCodeInline>tone</PixelCodeInline></CompLink>, <PixelCodeInline>size</PixelCodeInline>,
                and icon props for consistent theming. See <CompLink id="pixel-button">PixelButton</CompLink>, <CompLink id="pixel-input">PixelInput</CompLink>, and <CompLink id="pixel-select">PixelSelect</CompLink> for examples.
              </p>
              <CodeBlock
                code={`// 1. Setup your Tailwind CSS file (e.g., index.css)
// @import "tailwindcss";
// @import "@pxlkit/ui-kit/styles.css";
// @source "../node_modules/@pxlkit/ui-kit";

// 2. Import components in your React app
import { PixelButton, PixelCard, PixelInput } from '@pxlkit/ui-kit';
import { PxlKitIcon } from '@pxlkit/core';
import { Trophy } from '@pxlkit/gamification';
import { Search } from '@pxlkit/ui';

// Button with icon
<PixelButton tone="green" iconLeft={<PxlKitIcon icon={Trophy} size={16} />}>
  Create Quest
</PixelButton>

// Input with icon
<PixelInput
  label="Search"
  icon={<PxlKitIcon icon={Search} size={16} />}
  placeholder="Find icons..."
/>`}
                language="tsx"
                title="Quick Start"
              />

              <div className="rounded-lg border border-retro-border/30 bg-retro-surface/30 p-4">
                <h3 className="mb-3 font-mono text-xs font-semibold text-retro-text">Common API Surface</h3>
                <PropsTable data={[
                  { name: 'tone', type: '"green" | "cyan" | "gold" | "red" | "purple" | "neutral"', default: 'varies', description: 'Color scheme — shared across all components' },
                  { name: 'size', type: '"sm" | "md" | "lg"', default: '"md"', description: 'Controls height, padding, and font size' },
                  { name: 'iconLeft / iconRight', type: 'ReactNode', default: '—', description: 'Slot for icons before/after label (see buttons)' },
                  { name: 'label', type: 'string', default: '—', description: 'Accessible label for inputs and controls' },
                ]} />
              </div>
            </section>

            {/* ══════════════════ DESIGN TOKENS ══════════════════ */}
            <section data-section="design-tokens" id="design-tokens" className="scroll-mt-20 space-y-4 pt-10">
              <h2 className="font-pixel text-xs text-retro-green">DESIGN TOKENS</h2>
              <p className="text-sm text-retro-muted">
                All components use CSS custom properties for theming. Override these variables to customize the entire kit.
                Dark and light themes are built in via the <PixelCodeInline>.dark</PixelCodeInline> class.
                Colors are applied through the <PixelCodeInline>tone</PixelCodeInline> prop on components like{' '}
                <CompLink id="pixel-button">PixelButton</CompLink>, <CompLink id="pixel-alert">PixelAlert</CompLink>, and <CompLink id="pixel-progress">PixelProgress</CompLink>.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-retro-border/30 bg-retro-surface/30 p-4 space-y-3">
                  <h3 className="font-mono text-xs font-semibold text-retro-text">Colors</h3>
                  <div className="space-y-2.5">
                    <PixelColorSwatch name="Green" cssVar="--retro-green" />
                    <PixelColorSwatch name="Cyan" cssVar="--retro-cyan" />
                    <PixelColorSwatch name="Gold" cssVar="--retro-gold" />
                    <PixelColorSwatch name="Red" cssVar="--retro-red" />
                    <PixelColorSwatch name="Purple" cssVar="--retro-purple" />
                  </div>
                </div>
                <div className="rounded-lg border border-retro-border/30 bg-retro-surface/30 p-4 space-y-3">
                  <h3 className="font-mono text-xs font-semibold text-retro-text">Typography</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-pixel text-[10px] text-retro-green">Press Start 2P</p>
                      <p className="text-xs font-mono text-retro-muted">Titles &amp; accents — font-pixel</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm text-retro-cyan">JetBrains Mono</p>
                      <p className="text-xs font-mono text-retro-muted">Code &amp; UI labels — font-mono</p>
                    </div>
                    <div>
                      <p className="font-body text-sm text-retro-text">Inter</p>
                      <p className="text-xs font-mono text-retro-muted">Body text — font-body</p>
                    </div>
                  </div>
                  <PixelDivider />
                  <div className="space-y-2">
                    <h3 className="font-mono text-xs font-semibold text-retro-text">Surfaces</h3>
                    <PixelColorSwatch name="Background" cssVar="--retro-bg" />
                    <PixelColorSwatch name="Surface" cssVar="--retro-surface" />
                    <PixelColorSwatch name="Card" cssVar="--retro-card" />
                    <PixelColorSwatch name="Border" cssVar="--retro-border" />
                  </div>
                </div>
              </div>
            </section>

            <PixelDivider label="Actions" tone="cyan" spacing="lg" />

            {/* ══════════════════ PIXELBUTTON ══════════════════ */}
            <DocSection
              id="pixel-button"
              title="PixelButton"
              description={<>Versatile button with multiple tones, sizes, icon slots, loading spinner, and ghost variant. Supports all native button attributes. Combine with <CompLink id="pxlkit-button">PxlKitButton</CompLink> for icon-only actions or <CompLink id="pixel-split-button">PixelSplitButton</CompLink> for split actions.</>}
              props={[
                { name: 'tone', type: 'Tone', default: '"green"', description: 'Color variant' },
                { name: 'size', type: 'Size', default: '"md"', description: 'Button size' },
                { name: 'variant', type: '"solid" | "ghost"', default: '"solid"', description: 'Visual style' },
                { name: 'iconLeft', type: 'ReactNode', default: '—', description: 'Icon before label' },
                { name: 'iconRight', type: 'ReactNode', default: '—', description: 'Icon after label' },
                { name: 'loading', type: 'boolean', default: 'false', description: 'Shows spinner, disables button' },
              ]}
              code={`<PixelButton tone="green" iconLeft={<PxlKitIcon icon={Trophy} size={16} />}>
  Primary Action
</PixelButton>

<PixelButton tone="cyan" variant="ghost">
  Ghost Button
</PixelButton>

<PixelButton tone="red" loading>
  Processing...
</PixelButton>`}
            >
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-[10px] font-pixel text-retro-muted">TONES</p>
                  <div className="flex flex-wrap gap-2">
                    <PixelButton tone="green" iconLeft={<PxlKitIcon icon={Trophy} size={16} />}>Green</PixelButton>
                    <PixelButton tone="cyan" iconLeft={<PxlKitIcon icon={Edit} size={16} />}>Cyan</PixelButton>
                    <PixelButton tone="gold" iconLeft={<PxlKitIcon icon={Star} size={16} />}>Gold</PixelButton>
                    <PixelButton tone="red" iconLeft={<PxlKitIcon icon={Shield} size={16} />}>Red</PixelButton>
                    <PixelButton tone="purple" iconLeft={<PxlKitIcon icon={Crown} size={16} />}>Purple</PixelButton>
                    <PixelButton tone="neutral" iconLeft={<PxlKitIcon icon={Gear} size={16} />}>Neutral</PixelButton>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-pixel text-retro-muted">SIZES</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <PixelButton tone="green" size="sm">Small</PixelButton>
                    <PixelButton tone="green" size="md">Medium</PixelButton>
                    <PixelButton tone="green" size="lg">Large</PixelButton>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-pixel text-retro-muted">VARIANTS &amp; STATES</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <PixelButton tone="cyan" variant="ghost">Ghost</PixelButton>
                    <PixelButton tone="gold" loading>Loading</PixelButton>
                    <PixelButton tone="neutral" disabled>Disabled</PixelButton>
                    <PixelButton tone="green" iconRight={<PxlKitIcon icon={ArrowRight} size={14} />}>With Icon</PixelButton>
                  </div>
                </div>
              </div>
            </DocSection>

            {/* ══════════════════ PxlKitBUTTON ══════════════════ */}
            <DocSection
              id="pxlkit-button"
              title="PxlKitButton"
              description={<>Square icon-only button with accessible label via aria-label and title. Ideal for toolbar actions. For labeled buttons, see <CompLink id="pixel-button">PixelButton</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Accessible label (required)' },
                { name: 'icon', type: 'ReactNode', default: '—', description: 'Icon element (required)' },
                { name: 'tone', type: 'Tone', default: '"cyan"', description: 'Color variant' },
                { name: 'size', type: 'Size', default: '"md"', description: 'Button size' },
              ]}
              code={`<PxlKitButton label="Edit" icon={<PxlKitIcon icon={Edit} size={16} />} tone="cyan" />
<PxlKitButton label="Copy" icon={<PxlKitIcon icon={Copy} size={16} />} tone="green" />`}
            >
              <div className="flex flex-wrap gap-2">
                <PxlKitButton label="Edit" icon={<PxlKitIcon icon={Edit} size={16} />} tone="cyan" />
                <PxlKitButton label="Copy" icon={<PxlKitIcon icon={Copy} size={16} />} tone="green" />
                <PxlKitButton label="Search" icon={<PxlKitIcon icon={Search} size={16} />} tone="gold" />
                <PxlKitButton label="Settings" icon={<PxlKitIcon icon={Gear} size={16} />} tone="neutral" />
                <PxlKitButton label="AI" icon={<PxlKitIcon icon={Robot} size={16} />} tone="purple" />
                <PxlKitButton label="Small" icon={<PxlKitIcon icon={Check} size={14} />} tone="green" size="sm" />
                <PxlKitButton label="Large" icon={<PxlKitIcon icon={Trophy} size={20} />} tone="gold" size="lg" />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELSPLITBUTTON ══════════════════ */}
            <DocSection
              id="pixel-split-button"
              title="PixelSplitButton"
              description={<>A compound button with a primary action and a <CompLink id="pixel-dropdown">dropdown</CompLink> for secondary options. Dropdown closes on click-outside. Powered by the same <PixelCodeInline>tone</PixelCodeInline> system as <CompLink id="pixel-button">PixelButton</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Primary button label' },
                { name: 'options', type: 'Option[]', default: '—', description: 'Dropdown options' },
                { name: 'tone', type: 'Tone', default: '"purple"', description: 'Color variant' },
                { name: 'onPrimary', type: '() => void', default: '—', description: 'Primary action handler' },
                { name: 'onSelect', type: '(value: string) => void', default: '—', description: 'Dropdown selection handler' },
              ]}
              code={`<PixelSplitButton
  label="Deploy"
  tone="purple"
  options={[
    { value: 'preview', label: 'Preview' },
    { value: 'production', label: 'Production' },
  ]}
  onSelect={(v) => console.log(v)}
/>`}
            >
              <div className="flex flex-wrap gap-3">
                <PixelSplitButton
                  label="Deploy"
                  tone="purple"
                  options={[{ value: 'preview', label: 'Preview' }, { value: 'production', label: 'Production' }]}
                />
                <PixelSplitButton
                  label="Export"
                  tone="green"
                  options={[{ value: 'svg', label: 'SVG' }, { value: 'png', label: 'PNG' }, { value: 'json', label: 'JSON' }]}
                />
              </div>
            </DocSection>

            <PixelDivider label="Inputs" tone="cyan" spacing="lg" />

            {/* ══════════════════ PIXELINPUT ══════════════════ */}
            <DocSection
              id="pixel-input"
              title="PixelInput"
              description={<>Text input with optional label, hint, error message, icon slot, and tone-based focus ring. Supports all native input attributes. For passwords, see <CompLink id="pixel-password-input">PixelPasswordInput</CompLink>. For multi-line, see <CompLink id="pixel-textarea">PixelTextarea</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Field label' },
                { name: 'hint', type: 'string', default: '—', description: 'Helper text below input' },
                { name: 'error', type: 'string', default: '—', description: 'Error message (overrides hint)' },
                { name: 'icon', type: 'ReactNode', default: '—', description: 'Icon in left slot' },
                { name: 'tone', type: 'Tone', default: '"neutral"', description: 'Focus ring color' },
                { name: 'size', type: 'Size', default: '"md"', description: 'Input height' },
              ]}
              code={`<PixelInput
  label="Search"
  icon={<PxlKitIcon icon={Search} size={16} />}
  placeholder="Find components..."
  tone="cyan"
/>

<PixelInput label="Email" error="Invalid email address" />`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <PixelInput
                  label="Search"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Find components..."
                  icon={<PxlKitIcon icon={Search} size={16} />}
                  tone="cyan"
                />
                <PixelInput label="Email" placeholder="info@pxlkit.xyz" hint="We will never share your email" />
                <PixelInput label="With error" defaultValue="invalid" error="This field is required" />
                <PixelInput label="Disabled" placeholder="Not editable" disabled />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELPASSWORDINPUT ══════════════════ */}
            <DocSection
              id="pixel-password-input"
              title="PixelPasswordInput"
              description={<>Password field with a custom show/hide toggle button. No native browser password reveal UI. Extends the same field shell as <CompLink id="pixel-input">PixelInput</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Field label' },
                { name: 'hint', type: 'string', default: '—', description: 'Helper text' },
                { name: 'tone', type: 'Tone', default: '"neutral"', description: 'Focus ring color' },
                { name: 'size', type: 'Size', default: '"md"', description: 'Input height' },
              ]}
              code={`<PixelPasswordInput label="Password" placeholder="Enter your password" />`}
            >
              <div className="max-w-sm">
                <PixelPasswordInput label="API Key" placeholder="pk_live_..." hint="Keep this secret" />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELTEXTAREA ══════════════════ */}
            <DocSection
              id="pixel-textarea"
              title="PixelTextarea"
              description={<>Multi-line text input with label, hint, and error support. Uses the same <PixelCodeInline>FieldShell</PixelCodeInline> wrapper as <CompLink id="pixel-input">PixelInput</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Field label' },
                { name: 'hint', type: 'string', default: '—', description: 'Helper text' },
                { name: 'error', type: 'string', default: '—', description: 'Error message' },
                { name: 'tone', type: 'Tone', default: '"neutral"', description: 'Focus ring color' },
              ]}
              code={`<PixelTextarea label="Bio" placeholder="Tell us about yourself..." />`}
            >
              <div className="max-w-lg">
                <PixelTextarea label="Description" placeholder="Describe the component style you want..." hint="Markdown supported" />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELSELECT ══════════════════ */}
            <DocSection
              id="pixel-select"
              title="PixelSelect"
              description={<>Fully custom dropdown select — no native {'<select>'} element. Features keyboard navigation (Arrow keys, Enter, Escape), click-outside close, and check mark indicator. For a simpler toggle, see <CompLink id="pixel-segmented">PixelSegmented</CompLink>. For action menus, see <CompLink id="pixel-dropdown">PixelDropdown</CompLink>.</>}
              props={[
                { name: 'options', type: 'Option[]', default: '—', description: 'Array of { value, label }' },
                { name: 'value', type: 'string', default: '—', description: 'Controlled value' },
                { name: 'defaultValue', type: 'string', default: '—', description: 'Uncontrolled initial value' },
                { name: 'onChange', type: '(v: string) => void', default: '—', description: 'Change handler' },
                { name: 'placeholder', type: 'string', default: '"Select..."', description: 'Placeholder text' },
                { name: 'label', type: 'string', default: '—', description: 'Field label' },
                { name: 'size', type: 'Size', default: '"md"', description: 'Input height' },
                { name: 'tone', type: 'Tone', default: '"neutral"', description: 'Focus ring color' },
              ]}
              code={`<PixelSelect
  label="Icon Pack"
  value={pack}
  onChange={setPack}
  options={[
    { value: 'ui', label: 'UI' },
    { value: 'gamification', label: 'Gamification' },
    { value: 'social', label: 'Social' },
  ]}
/>`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <PixelSelect
                  label="Icon Pack"
                  value={selectVal}
                  onChange={setSelectVal}
                  options={[
                    { value: 'ui', label: 'UI', icon: <PxlKitIcon icon={Grid} size={14} /> },
                    { value: 'gamification', label: 'Gamification', icon: <PxlKitIcon icon={Trophy} size={14} colorful /> },
                    { value: 'social', label: 'Social', icon: <PxlKitIcon icon={Heart} size={14} colorful /> },
                    { value: 'feedback', label: 'Feedback', icon: <PxlKitIcon icon={Bell} size={14} colorful /> },
                    { value: 'effects', label: 'Effects', icon: <PxlKitIcon icon={SparkleSmall} size={14} /> },
                    { value: 'weather', label: 'Weather', icon: <PxlKitIcon icon={Star} size={14} colorful /> },
                  ]}
                />
                <PixelSelect
                  label="Priority"
                  defaultValue="medium"
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'critical', label: 'Critical' },
                  ]}
                />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELCHECKBOX ══════════════════ */}
            <DocSection
              id="pixel-checkbox"
              title="PixelCheckbox"
              description={<>Custom checkbox with a pixel-art check mark SVG — no native checkbox visible. Fully accessible with role=&apos;checkbox&apos; and keyboard support. For toggling, also see <CompLink id="pixel-switch">PixelSwitch</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Checkbox label (required)' },
                { name: 'checked', type: 'boolean', default: '—', description: 'Controlled checked state' },
                { name: 'onChange', type: '(v: boolean) => void', default: '—', description: 'Change handler' },
                { name: 'tone', type: 'Tone', default: '"green"', description: 'Check mark color' },
                { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction' },
              ]}
              code={`<PixelCheckbox
  label="Enable animations"
  checked={enabled}
  onChange={setEnabled}
  tone="green"
/>`}
            >
              <div className="space-y-2">
                <PixelCheckbox label="Enable icon animations" checked={checked} onChange={setChecked} />
                <PixelCheckbox label="Use colorful mode" checked={!checked} onChange={(v) => setChecked(!v)} tone="cyan" />
                <PixelCheckbox label="Disabled option" checked={false} onChange={() => {}} disabled />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELRADIOGROUP ══════════════════ */}
            <DocSection
              id="pixel-radio-group"
              title="PixelRadioGroup"
              description={<>Fully custom radio group with pixel-art dot indicators. Built with role=&apos;radiogroup&apos; and role=&apos;radio&apos; for accessibility. For a more compact variant, see <CompLink id="pixel-segmented">PixelSegmented</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Group label' },
                { name: 'value', type: 'string', default: '—', description: 'Current selected value' },
                { name: 'options', type: 'Option[]', default: '—', description: 'Radio options' },
                { name: 'onChange', type: '(v: string) => void', default: '—', description: 'Selection handler' },
                { name: 'tone', type: 'Tone', default: '"cyan"', description: 'Active indicator color' },
              ]}
              code={`<PixelRadioGroup
  label="Framework"
  value={framework}
  onChange={setFramework}
  options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
  ]}
/>`}
            >
              <PixelRadioGroup
                label="Framework"
                value={radio}
                onChange={setRadio}
                options={[
                  { value: 'react', label: 'React' },
                  { value: 'vue', label: 'Vue' },
                  { value: 'svelte', label: 'Svelte' },
                ]}
              />
            </DocSection>

            {/* ══════════════════ PIXELSWITCH ══════════════════ */}
            <DocSection
              id="pixel-switch"
              title="PixelSwitch"
              description={<>Toggle switch with smooth transition animation. Uses role=&apos;switch&apos; with aria-checked for screen readers. For binary choices with a label, also consider <CompLink id="pixel-checkbox">PixelCheckbox</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Switch label' },
                { name: 'checked', type: 'boolean', default: '—', description: 'On/off state' },
                { name: 'onChange', type: '(v: boolean) => void', default: '—', description: 'Toggle handler' },
                { name: 'tone', type: 'Tone', default: '"green"', description: 'Active color' },
              ]}
              code={`<PixelSwitch label="Auto refresh" checked={on} onChange={setOn} />`}
            >
              <div className="space-y-3">
                <PixelSwitch label="Auto refresh" checked={switched} onChange={setSwitched} />
                <PixelSwitch label="Dark mode" checked={!switched} onChange={(v) => setSwitched(!v)} tone="cyan" />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELSLIDER ══════════════════ */}
            <DocSection
              id="pixel-slider"
              title="PixelSlider"
              description={<>Fully custom range slider — no native {'<input type="range">'}. Supports pointer events for mouse and touch, keyboard arrows, and pointer capture for smooth dragging. View the current value in real-time via <CompLink id="pixel-progress">PixelProgress</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Display label' },
                { name: 'value', type: 'number', default: '—', description: 'Current value' },
                { name: 'onChange', type: '(v: number) => void', default: '—', description: 'Value change handler' },
                { name: 'min', type: 'number', default: '0', description: 'Minimum value' },
                { name: 'max', type: 'number', default: '100', description: 'Maximum value' },
                { name: 'step', type: 'number', default: '1', description: 'Step increment' },
                { name: 'tone', type: 'Tone', default: '"cyan"', description: 'Track and thumb color' },
              ]}
              code={`<PixelSlider label="Volume" value={vol} onChange={setVol} min={0} max={100} />
<PixelSlider label="Opacity" value={opacity} onChange={setOpacity} tone="gold" />`}
            >
              <div className="max-w-md space-y-4">
                <PixelSlider label="Animation speed" value={slider} onChange={setSlider} />
                <PixelSlider label="Progress" value={progress} onChange={setProgress} tone="green" />
                <PixelSlider label="Gold range" value={45} onChange={() => {}} tone="gold" min={0} max={200} />
                <PixelSlider label="Fine step" value={slider} onChange={setSlider} tone="purple" step={5} />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELSEGMENTED ══════════════════ */}
            <DocSection
              id="pixel-segmented"
              title="PixelSegmented"
              description={<>Segmented control for toggling between a set of predefined options. Great for view modes and filters. For more choices, see <CompLink id="pixel-select">PixelSelect</CompLink> or <CompLink id="pixel-radio-group">PixelRadioGroup</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Group label' },
                { name: 'value', type: 'string', default: '—', description: 'Current value' },
                { name: 'options', type: 'Option[]', default: '—', description: 'Segment options' },
                { name: 'onChange', type: '(v: string) => void', default: '—', description: 'Selection handler' },
                { name: 'tone', type: 'Tone', default: '"green"', description: 'Active segment color' },
              ]}
              code={`<PixelSegmented
  label="Density"
  value={density}
  onChange={setDensity}
  options={[
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
  ]}
/>`}
            >
              <PixelSegmented
                label="Layout density"
                value={segmented}
                onChange={setSegmented}
                options={[
                  { value: 'compact', label: 'Compact' },
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'spacious', label: 'Spacious' },
                ]}
              />
            </DocSection>

            <PixelDivider label="Data Display" tone="gold" spacing="lg" />

            {/* ══════════════════ PIXELCARD ══════════════════ */}
            <DocSection
              id="pixel-card"
              title="PixelCard"
              description={<>Content card with icon header, body, and optional footer. Subtle hover border effect. Use with <CompLink id="pixel-button">PixelButton</CompLink> in the footer for card actions. For metric cards, see <CompLink id="pixel-stat-card">PixelStatCard</CompLink>.</>}
              props={[
                { name: 'title', type: 'string', default: '—', description: 'Card heading' },
                { name: 'icon', type: 'ReactNode', default: '—', description: 'Header icon' },
                { name: 'footer', type: 'ReactNode', default: '—', description: 'Footer section' },
              ]}
              code={`<PixelCard
  title="Gamification"
  icon={<PxlKitIcon icon={Trophy} size={16} />}
  footer={<PixelButton tone="gold" size="sm">Use Pack</PixelButton>}
>
  RPG icons, rewards, and game UI elements.
</PixelCard>`}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <PixelCard
                  title="Gamification Pack"
                  icon={<PxlKitIcon icon={Trophy} size={16} colorful />}
                  footer={<PixelButton tone="gold" size="sm" iconLeft={<PxlKitIcon icon={Lightning} size={14} />}>Use Pack</PixelButton>}
                >
                  RPG icons, progress bars, rewards, and game UI elements ready to use.
                </PixelCard>
                <PixelCard
                  title="Social Pack"
                  icon={<PxlKitIcon icon={Heart} size={16} colorful />}
                  footer={<PixelButton tone="cyan" size="sm" iconLeft={<PxlKitIcon icon={Message} size={14} />}>Preview</PixelButton>}
                >
                  Emotions, interactions, and communication elements for modern apps.
                </PixelCard>
              </div>
            </DocSection>

            {/* ══════════════════ PIXELSTATCARD ══════════════════ */}
            <DocSection
              id="pixel-stat-card"
              title="PixelStatCard"
              description={<>Compact metric card for dashboards. Displays a value with label, icon, and optional trend indicator. For content cards, see <CompLink id="pixel-card">PixelCard</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Stat label' },
                { name: 'value', type: 'string', default: '—', description: 'Display value' },
                { name: 'icon', type: 'ReactNode', default: '—', description: 'Stat icon' },
                { name: 'tone', type: 'Tone', default: '"gold"', description: 'Card accent color' },
                { name: 'trend', type: 'string', default: '—', description: 'Trend text' },
              ]}
              code={`<PixelStatCard label="Downloads" value="12.4k" tone="green" trend="+15% this week" />`}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <PixelStatCard label="Total Icons" value="204" icon={<PxlKitIcon icon={Package} size={16} />} tone="green" trend="+12 new" />
                <PixelStatCard label="Components" value={String(UI_KIT_COMPONENTS.length)} icon={<PxlKitIcon icon={Grid} size={16} />} tone="cyan" trend="100% typed" />
                <PixelStatCard label="Downloads" value="8.2k" icon={<PxlKitIcon icon={Coin} size={16} colorful />} tone="gold" trend="+24%" />
                <PixelStatCard label="Stars" value="1.4k" icon={<PxlKitIcon icon={Star} size={16} colorful />} tone="purple" trend="trending" />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELTABLE ══════════════════ */}
            <DocSection
              id="pixel-table"
              title="PixelTable"
              description={<>Data table with striped rows, hover highlight, and horizontal scroll on small screens. Accepts ReactNode cell values for rich content like <CompLink id="pixel-badge">PixelBadge</CompLink>.</>}
              props={[
                { name: 'columns', type: 'Array<{ key, header, className? }>', default: '—', description: 'Column definitions' },
                { name: 'data', type: 'Array<Record<string, ReactNode>>', default: '—', description: 'Row data keyed by column key' },
                { name: 'striped', type: 'boolean', default: 'true', description: 'Alternating row backgrounds' },
              ]}
              code={`<PixelTable
  columns={[
    { key: 'name', header: 'Component' },
    { key: 'category', header: 'Category' },
    { key: 'status', header: 'Status' },
  ]}
  data={[
    { name: 'PixelButton', category: 'Actions', status: <PixelBadge tone="green">Stable</PixelBadge> },
    { name: 'PixelTable', category: 'Data', status: <PixelBadge tone="gold">New</PixelBadge> },
  ]}
/>`}
            >
              <PixelTable
                columns={[
                  { key: 'name', header: 'Component' },
                  { key: 'category', header: 'Category' },
                  { key: 'status', header: 'Status' },
                ]}
                data={[
                  { name: 'PixelButton', category: 'Actions', status: <PixelBadge tone="green">Stable</PixelBadge> },
                  { name: 'PixelSelect', category: 'Inputs', status: <PixelBadge tone="green">Stable</PixelBadge> },
                  { name: 'PixelTable', category: 'Data Display', status: <PixelBadge tone="gold">New</PixelBadge> },
                  { name: 'PixelAvatar', category: 'Data Display', status: <PixelBadge tone="gold">New</PixelBadge> },
                  { name: 'PixelSkeleton', category: 'Feedback', status: <PixelBadge tone="gold">New</PixelBadge> },
                ]}
              />
            </DocSection>

            {/* ══════════════════ PIXELAVATAR ══════════════════ */}
            <DocSection
              id="pixel-avatar"
              title="PixelAvatar"
              description={<>Avatar component that renders initials fallback when no image is provided. Pixel-art aesthetic with <CompLink id="design-tokens">tone</CompLink> border.</>}
              props={[
                { name: 'name', type: 'string', default: '—', description: 'User name (used for initials)' },
                { name: 'src', type: 'string', default: '—', description: 'Image URL' },
                { name: 'size', type: 'Size', default: '"md"', description: 'Avatar size' },
                { name: 'tone', type: 'Tone', default: '"green"', description: 'Border/background tone' },
              ]}
              code={`<PixelAvatar name="Joangel De La Rosa" tone="green" />
<PixelAvatar name="AI Bot" tone="purple" size="lg" />`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <PixelAvatar name="Joangel De La Rosa" tone="green" size="sm" />
                <PixelAvatar name="AI Bot" tone="purple" />
                <PixelAvatar name="Pxlkit" tone="cyan" size="lg" />
                <PixelAvatar name="Red Team" tone="red" />
                <PixelAvatar name="Gold User" tone="gold" />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELBADGE ══════════════════ */}
            <DocSection
              id="pixel-badge"
              title="PixelBadge"
              description={<>Read-only status indicator with tone variants. Use inside <CompLink id="pixel-table">PixelTable</CompLink> cells, <CompLink id="pixel-card">PixelCard</CompLink> headers, or alongside any text for contextual labels.</>}
              props={[
                { name: 'children', type: 'ReactNode', default: '—', description: 'Badge content' },
                { name: 'tone', type: 'Tone', default: '"green"', description: 'Color variant' },
              ]}
              code={`<PixelBadge tone="green">Stable</PixelBadge>
<PixelBadge tone="gold">Beta</PixelBadge>
<PixelBadge tone="red">Deprecated</PixelBadge>`}
            >
              <div className="flex flex-wrap gap-2">
                <PixelBadge tone="green">Stable</PixelBadge>
                <PixelBadge tone="gold">Beta</PixelBadge>
                <PixelBadge tone="red">Deprecated</PixelBadge>
                <PixelBadge tone="cyan">v2.0</PixelBadge>
                <PixelBadge tone="purple">Experimental</PixelBadge>
                <PixelBadge tone="neutral">Archived</PixelBadge>
              </div>
            </DocSection>

            {/* ══════════════════ PIXELCHIP ══════════════════ */}
            <DocSection
              id="pixel-chip"
              title="PixelChip"
              description={<>Interactive tag with optional remove button. Use for filter selections, tag lists, or removable labels. For static labels, see <CompLink id="pixel-badge">PixelBadge</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Chip text content' },
                { name: 'tone', type: 'Tone', default: '"cyan"', description: 'Color variant' },
                { name: 'onRemove', type: '() => void', default: '—', description: 'Shows remove button when provided' },
              ]}
              code={`<PixelChip label="react" tone="cyan" />
<PixelChip label="removable" tone="gold" onRemove={() => {}} />`}
            >
              <div className="flex flex-wrap gap-2">
                <PixelChip tone="cyan" label="react" />
                <PixelChip tone="purple" label="typescript" />
                <PixelChip tone="green" label="tailwind" />
                <PixelChip tone="gold" label="removable" onRemove={() => {}} />
                <PixelChip tone="red" label="deprecated" onRemove={() => {}} />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELTEXTLINK ══════════════════ */}
            <DocSection
              id="pixel-text-link"
              title="PixelTextLink"
              description={<>Tone-aware inline text link. Renders as <PixelCodeInline>{'<a>'}</PixelCodeInline> when <PixelCodeInline>href</PixelCodeInline> is provided, otherwise as <PixelCodeInline>{'<button>'}</PixelCodeInline>. Supports all anchor and button attributes via spread props.</>}
              props={[
                { name: 'children', type: 'ReactNode', default: '—', description: 'Link content' },
                { name: 'href', type: 'string', default: '—', description: 'URL (renders <a>); omit for <button>' },
                { name: 'tone', type: 'Tone', default: '"cyan"', description: 'Text color variant' },
                { name: 'className', type: 'string', default: '—', description: 'Additional CSS classes' },
              ]}
              code={`<PixelTextLink href="/docs" tone="cyan">Documentation</PixelTextLink>
<PixelTextLink tone="gold" onClick={() => alert('clicked')}>Action Link</PixelTextLink>`}
            >
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <PixelTextLink href="/docs" tone="cyan">Documentation</PixelTextLink>
                <PixelTextLink href="/pricing" tone="gold">Pricing</PixelTextLink>
                <PixelTextLink href="/ui-kit" tone="green">UI Kit</PixelTextLink>
                <PixelTextLink tone="purple" onClick={() => {}}>Button mode</PixelTextLink>
                <PixelTextLink tone="red" onClick={() => {}}>Danger link</PixelTextLink>
              </div>
            </DocSection>

            {/* ══════════════════ PIXELCODEINLINE ══════════════════ */}
            <DocSection
              id="pixel-code-inline"
              title="PixelCodeInline"
              description={<>Inline code highlight with monospace font and tone border. Use inside paragraphs, descriptions, and props documentation to reference code tokens.</>}
              props={[
                { name: 'children', type: 'ReactNode', default: '—', description: 'Code text' },
                { name: 'tone', type: 'Tone', default: '"cyan"', description: 'Color variant' },
              ]}
              code={`<PixelCodeInline tone="cyan">useState</PixelCodeInline>
<PixelCodeInline tone="purple">PxlKitIcon</PixelCodeInline>`}
            >
              <p className="text-sm text-retro-muted">
                Use <PixelCodeInline tone="cyan">useState</PixelCodeInline> for local state,{' '}
                <PixelCodeInline tone="purple">PxlKitIcon</PixelCodeInline> for icons,{' '}
                <PixelCodeInline tone="green">green</PixelCodeInline>{' '}
                <PixelCodeInline tone="gold">gold</PixelCodeInline>{' '}
                <PixelCodeInline tone="red">red</PixelCodeInline>{' '}
                <PixelCodeInline tone="neutral">neutral</PixelCodeInline>
              </p>
            </DocSection>

            {/* ══════════════════ PIXELKBD ══════════════════ */}
            <DocSection
              id="pixel-kbd"
              title="PixelKbd"
              description={<>Keyboard shortcut indicator rendered as a styled key cap. Combine multiple instances for multi-key shortcuts. Pairs well with <CompLink id="pixel-tooltip">PixelTooltip</CompLink> for shortcut hints.</>}
              props={[
                { name: 'children', type: 'ReactNode', default: '—', description: 'Key label' },
              ]}
              code={`<PixelKbd>Ctrl</PixelKbd> + <PixelKbd>K</PixelKbd>
<PixelKbd>⌘</PixelKbd> + <PixelKbd>Shift</PixelKbd> + <PixelKbd>P</PixelKbd>`}
            >
              <div className="flex flex-wrap items-center gap-1 text-sm text-retro-muted">
                <PixelKbd>Ctrl</PixelKbd><span>+</span><PixelKbd>K</PixelKbd>
                <span className="mx-3">·</span>
                <PixelKbd>⌘</PixelKbd><span>+</span><PixelKbd>Shift</PixelKbd><span>+</span><PixelKbd>P</PixelKbd>
                <span className="mx-3">·</span>
                <PixelKbd>Esc</PixelKbd>
                <span className="mx-3">·</span>
                <PixelKbd>Tab</PixelKbd>
                <span className="mx-3">·</span>
                <PixelKbd>Enter</PixelKbd>
              </div>
            </DocSection>

            {/* ══════════════════ PIXELCOLORSWATCH ══════════════════ */}
            <DocSection
              id="pixel-color-swatch"
              title="PixelColorSwatch"
              description={<>Color swatch preview for <CompLink id="design-tokens">design tokens</CompLink>. Renders a color box with name and CSS variable reference. Use in theme documentation or settings panels.</>}
              props={[
                { name: 'name', type: 'string', default: '—', description: 'Display name of the color' },
                { name: 'cssVar', type: 'string', default: '—', description: 'CSS custom property name' },
              ]}
              code={`<PixelColorSwatch name="Green" cssVar="--retro-green" />
<PixelColorSwatch name="Cyan" cssVar="--retro-cyan" />`}
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <PixelColorSwatch name="Green" cssVar="--retro-green" />
                <PixelColorSwatch name="Cyan" cssVar="--retro-cyan" />
                <PixelColorSwatch name="Gold" cssVar="--retro-gold" />
                <PixelColorSwatch name="Red" cssVar="--retro-red" />
                <PixelColorSwatch name="Purple" cssVar="--retro-purple" />
              </div>
            </DocSection>

            <PixelDivider label="Feedback" tone="red" spacing="lg" />

            {/* ══════════════════ PIXELALERT ══════════════════ */}
            <DocSection
              id="pixel-alert"
              title="PixelAlert"
              description={<>Alert banner with title, message, optional icon, and action slot. Supports all <CompLink id="design-tokens">tone</CompLink> variants for different severity levels. Pair with <CompLink id="pixel-button">PixelButton</CompLink> in the action slot.</>}
              props={[
                { name: 'title', type: 'string', default: '—', description: 'Alert heading' },
                { name: 'message', type: 'string', default: '—', description: 'Alert body text' },
                { name: 'tone', type: 'Tone', default: '"red"', description: 'Severity color' },
                { name: 'icon', type: 'ReactNode', default: '—', description: 'Leading icon' },
                { name: 'action', type: 'ReactNode', default: '—', description: 'Action slot (button)' },
              ]}
              code={`<PixelAlert
  tone="green"
  icon={<PxlKitIcon icon={CheckCircle} size={16} />}
  title="Build Success"
  message="Package compiled successfully."
  action={<PixelButton tone="green" size="sm">View Logs</PixelButton>}
/>`}
            >
              <div className="space-y-3">
                <PixelAlert
                  tone="green"
                  icon={<PxlKitIcon icon={CheckCircle} size={16} />}
                  title="Build Success"
                  message="Package compiled and DTS types generated."
                  action={<PixelButton tone="green" size="sm" iconLeft={<PxlKitIcon icon={Check} size={14} />}>View Logs</PixelButton>}
                />
                <PixelAlert
                  tone="gold"
                  icon={<PxlKitIcon icon={WarningTriangle} size={16} />}
                  title="Warning"
                  message="Some components still need visual fine-tuning review."
                />
                <PixelAlert
                  tone="red"
                  icon={<PxlKitIcon icon={Bell} size={16} />}
                  title="Breaking Change"
                  message="PixelSelect API changed from native to custom dropdown in v2.0."
                />
                <PixelAlert
                  tone="cyan"
                  icon={<PxlKitIcon icon={InfoCircle} size={16} />}
                  title="Tip"
                  message="Use the tone prop to match your alert to the appropriate severity level."
                />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELPROGRESS ══════════════════ */}
            <DocSection
              id="pixel-progress"
              title="PixelProgress"
              description={<>Determinate progress bar with optional label and value display. Smooth animated transitions. Works great alongside <CompLink id="pixel-slider">PixelSlider</CompLink> to show computed progress.</>}
              props={[
                { name: 'value', type: 'number', default: '—', description: 'Progress 0-100' },
                { name: 'tone', type: 'Tone', default: '"green"', description: 'Bar color' },
                { name: 'label', type: 'string', default: '—', description: 'Label text' },
                { name: 'showValue', type: 'boolean', default: 'true', description: 'Show percentage' },
              ]}
              code={`<PixelProgress value={72} tone="green" label="Upload Progress" />`}
            >
              <div className="max-w-md space-y-4">
                <PixelProgress value={progress} tone="green" label="Build progress" />
                <PixelProgress value={slider} tone="cyan" label="Animation speed" />
                <PixelProgress value={45} tone="gold" label="Storage used" />
                <PixelProgress value={90} tone="red" label="CPU load" />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELSKELETON ══════════════════ */}
            <DocSection
              id="pixel-skeleton"
              title="PixelSkeleton"
              description={<>Loading placeholder with pulse animation. Use to indicate content is being fetched. Great for placeholder state in <CompLink id="pixel-card">PixelCard</CompLink> layouts.</>}
              props={[
                { name: 'width', type: 'string', default: '—', description: 'CSS width' },
                { name: 'height', type: 'string', default: '"1rem"', description: 'CSS height' },
                { name: 'rounded', type: 'boolean', default: 'false', description: 'Pill shape' },
              ]}
              code={`<PixelSkeleton width="200px" height="1rem" />
<PixelSkeleton width="40px" height="40px" rounded />`}
            >
              <div className="flex items-start gap-3">
                <PixelSkeleton width="40px" height="40px" rounded />
                <div className="flex-1 space-y-2">
                  <PixelSkeleton width="60%" height="0.75rem" />
                  <PixelSkeleton width="100%" height="0.75rem" />
                  <PixelSkeleton width="80%" height="0.75rem" />
                </div>
              </div>
            </DocSection>

            {/* ══════════════════ PIXELEMPTYSTATE ══════════════════ */}
            <DocSection
              id="pixel-empty-state"
              title="PixelEmptyState"
              description={<>Placeholder for empty lists, search results, or zero-data views. Supports icon, description, and <CompLink id="pixel-button">action button</CompLink>.</>}
              props={[
                { name: 'title', type: 'string', default: '—', description: 'Heading text' },
                { name: 'description', type: 'string', default: '—', description: 'Body text' },
                { name: 'icon', type: 'ReactNode', default: '—', description: 'Decorative icon' },
                { name: 'action', type: 'ReactNode', default: '—', description: 'Action button' },
              ]}
              code={`<PixelEmptyState
  title="No results"
  description="Try adjusting your search or filters."
  icon={<PxlKitIcon icon={Search} size={20} />}
  action={<PixelButton tone="green">Reset Filters</PixelButton>}
/>`}
            >
              <PixelEmptyState
                title="No results found"
                description="Adjust your filters or create a new custom component for this kit."
                icon={<PxlKitIcon icon={SparkleSmall} size={20} />}
                action={<PixelButton tone="green" iconLeft={<PxlKitIcon icon={Check} size={14} />}>Create Component</PixelButton>}
              />
            </DocSection>

            {/* ══════════════════ PIXELTOAST ══════════════════ */}
            <DocSection
              id="pixel-toast"
              title="PixelToast"
              description={<>Toast notifications are part of the UI Kit via <PixelCodeInline>ToastProvider</PixelCodeInline> + <PixelCodeInline>useToast()</PixelCodeInline>. Supports tones, positions, custom icons (static or animated), duration, and dismiss controls. The old <PixelCodeInline>/toast</PixelCodeInline> route now redirects here.</>}
              props={[
                { name: 'toast(options)', type: '({ title, message?, tone?, icon?, animatedIcon?, duration?, position? }) => string', default: '—', description: 'Generic toast creator' },
                { name: 'success/error/info/warning', type: '(title, message?, icon?) => string', default: '—', description: 'Tone shortcuts' },
                { name: 'dismiss(id)', type: '(id: string) => void', default: '—', description: 'Dismiss one toast by id' },
                { name: 'dismissAll()', type: '() => void', default: '—', description: 'Clear all active toasts' },
              ]}
              code={`import { useToast } from '@/components/ToastProvider';
import { CheckCircle, WarningTriangle } from '@pxlkit/feedback';
import { FireSword } from '@pxlkit/gamification';

function SaveButton() {
  const { toast, success, warning } = useToast();

  return (
    <>
      <PixelButton
        onClick={() => success('SAVED', 'Changes synced to server', CheckCircle)}
      >
        Save
      </PixelButton>

      <PixelButton
        onClick={() =>
          toast({
            tone: 'warning',
            title: 'LOW HEALTH',
            message: 'Use a potion now',
            position: 'bottom-right',
            duration: 3500,
            animatedIcon: FireSword,
          })
        }
      >
        Show Warning Toast
      </PixelButton>
    </>
  );
}`}
            >
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <PixelSelect
                    label="Tone"
                    value={toastTone}
                    onChange={(v) => setToastTone(v as ToastTone)}
                    options={[
                      { value: 'success', label: 'Success', icon: <PxlKitIcon icon={CheckCircle} size={14} /> },
                      { value: 'error', label: 'Error', icon: <PxlKitIcon icon={WarningTriangle} size={14} /> },
                      { value: 'info', label: 'Info', icon: <PxlKitIcon icon={InfoCircle} size={14} /> },
                      { value: 'warning', label: 'Warning', icon: <PxlKitIcon icon={Bell} size={14} /> },
                    ]}
                  />
                  <PixelSelect
                    label="Position"
                    value={toastPosition}
                    onChange={(v) => setToastPosition(v as ToastPosition)}
                    options={[
                      { value: 'top-right', label: 'Top Right' },
                      { value: 'top-left', label: 'Top Left' },
                      { value: 'bottom-right', label: 'Bottom Right' },
                      { value: 'bottom-left', label: 'Bottom Left' },
                      { value: 'top-center', label: 'Top Center' },
                      { value: 'bottom-center', label: 'Bottom Center' },
                    ]}
                  />
                  <div className="max-w-sm">
                    <PixelSlider
                      label="Duration (ms)"
                      min={1000}
                      max={6000}
                      step={250}
                      value={toastDuration}
                      onChange={setToastDuration}
                      tone="gold"
                      showMinMax
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <PixelButton
                    tone="green"
                    iconLeft={<PxlKitIcon icon={CheckCircle} size={14} />}
                    onClick={() => {
                      if (toastTone === 'success') {
                        success('SAVED', 'Your changes were saved correctly', CheckCircle);
                        return;
                      }
                      if (toastTone === 'error') {
                        error('ERROR', 'Could not save changes', WarningTriangle);
                        return;
                      }
                      if (toastTone === 'info') {
                        info('SYNC', 'Fetching latest updates from server', InfoCircle);
                        return;
                      }
                      warning('WARNING', 'Action requires confirmation', Bell);
                    }}
                  >
                    Quick Toast
                  </PixelButton>

                  <PixelButton
                    tone="purple"
                    iconLeft={<AnimatedPxlKitIcon icon={FireSword} size={14} />}
                    onClick={() => {
                      toast({
                        tone: toastTone,
                        title: 'PIXEL EVENT',
                        message: `Tone: ${toastTone} · Position: ${toastPosition} · Duration: ${toastDuration}ms`,
                        position: toastPosition,
                        duration: toastDuration,
                        animatedIcon: FireSword,
                      });
                    }}
                  >
                    Animated Toast
                  </PixelButton>
                </div>

                <p className="text-xs text-retro-muted">
                  Detailed integration docs are also available in <a className="text-retro-cyan hover:underline" href="/docs#toast-notifications">/docs#toast-notifications</a>.
                </p>
              </div>
            </DocSection>

            <PixelDivider label="Navigation" tone="purple" spacing="lg" />

            {/* ══════════════════ PIXELTABS ══════════════════ */}
            <DocSection
              id="pixel-tabs"
              title="PixelTabs"
              description={<>Tab navigation with optional icon support per tab. Uses proper ARIA tablist and tabpanel roles. For collapsible panels, see <CompLink id="pixel-accordion">PixelAccordion</CompLink>.</>}
              props={[
                { name: 'items', type: 'TabItem[]', default: '—', description: '{ id, label, icon?, content }' },
                { name: 'defaultTab', type: 'string', default: 'first', description: 'Initially active tab ID' },
              ]}
              code={`<PixelTabs items={[
  { id: 'overview', label: 'Overview', content: '...' },
  { id: 'api', label: 'API', content: '...' },
  { id: 'tokens', label: 'Tokens', content: '...' },
]} />`}
            >
              <PixelTabs
                items={[
                  { id: 'overview', label: 'Overview', icon: <PxlKitIcon icon={Home} size={14} />, content: 'Quick start guide and component summary for the Pxlkit UI Kit.' },
                  { id: 'api', label: 'API', icon: <PxlKitIcon icon={Edit} size={14} />, content: 'All components expose typed props with Tone, Size, and icon slots as common patterns.' },
                  { id: 'tokens', label: 'Tokens', icon: <PxlKitIcon icon={SparkleSmall} size={14} />, content: 'CSS custom properties like --retro-green, --retro-bg control theming globally.' },
                ]}
              />
            </DocSection>

            {/* ══════════════════ PIXELACCORDION ══════════════════ */}
            <DocSection
              id="pixel-accordion"
              title="PixelAccordion"
              description={<>Collapsible content sections with pixel-art chevron indicator. Supports single or multiple open panels. For tabbed navigation, see <CompLink id="pixel-tabs">PixelTabs</CompLink>.</>}
              props={[
                { name: 'items', type: 'AccordionItem[]', default: '—', description: '{ id, title, content }' },
                { name: 'allowMultiple', type: 'boolean', default: 'false', description: 'Allow multiple open panels' },
              ]}
              code={`<PixelAccordion items={[
  { id: '1', title: 'How to use icons', content: '...' },
  { id: '2', title: 'Custom themes', content: '...' },
]} />`}
            >
              <PixelAccordion
                items={[
                  { id: '1', title: 'How to use icons with components', content: 'Pass any PxlKitIcon or AnimatedPxlKitIcon as a ReactNode through iconLeft, iconRight, or icon props. All Pxlkit icon packs are supported.' },
                  { id: '2', title: 'Custom themes and design tokens', content: 'Override CSS custom properties like --retro-green, --retro-bg in your stylesheet or inline. The .dark class toggles between light and dark themes automatically.' },
                  { id: '3', title: 'Accessibility considerations', content: 'All inputs have proper labels, focus-visible states, and ARIA attributes. Interactive elements use semantic roles (checkbox, radio, switch, slider) for screen reader compatibility.' },
                ]}
              />
            </DocSection>

            {/* ══════════════════ PIXELCOLLAPSIBLE ══════════════════ */}
            <DocSection
              id="pixel-collapsible"
              title="PixelCollapsible"
              description={<>Simple toggle panel with chevron indicator. Use for optional detail sections, prop references, or progressive disclosure. For multi-panel groups, see <CompLink id="pixel-accordion">PixelAccordion</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Toggle button label' },
                { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Start expanded' },
                { name: 'tone', type: 'Tone', default: '"neutral"', description: 'Button tone' },
              ]}
              code={`<PixelCollapsible label="Show details">
  <p>Hidden content revealed on toggle.</p>
</PixelCollapsible>

<PixelCollapsible label="Open by default" defaultOpen tone="green">
  <p>Visible from the start.</p>
</PixelCollapsible>`}
            >
              <div className="space-y-3">
                <PixelCollapsible label="Click to reveal">
                  <p className="text-sm text-retro-muted">This content was hidden until you clicked the toggle above.</p>
                </PixelCollapsible>
                <PixelCollapsible label="Open by default" defaultOpen tone="green">
                  <p className="text-sm text-retro-muted">This panel starts expanded. Click the label to collapse it.</p>
                </PixelCollapsible>
                <PixelCollapsible label="Purple tone" tone="purple">
                  <div className="flex gap-2">
                    <PixelBadge tone="purple">Detail A</PixelBadge>
                    <PixelBadge tone="cyan">Detail B</PixelBadge>
                  </div>
                </PixelCollapsible>
              </div>
            </DocSection>

            {/* ══════════════════ PIXELBREADCRUMB ══════════════════ */}
            <DocSection
              id="pixel-breadcrumb"
              title="PixelBreadcrumb"
              description={<>Navigation breadcrumb with pixel-art chevron separators. Items can be links, buttons, or plain text. Used at the top of this page and in <CompLink id="pixel-modal">modal</CompLink> headers.</>}
              props={[
                { name: 'items', type: 'Array<{ label, href?, onClick?, active? }>', default: '—', description: 'Breadcrumb items' },
              ]}
              code={`<PixelBreadcrumb items={[
  { label: 'Home', href: '/' },
  { label: 'Docs', href: '/docs' },
  { label: 'UI Kit', active: true },
]} />`}
            >
              <div className="space-y-3">
                <PixelBreadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Docs', href: '/docs' }, { label: 'UI Kit', active: true }]} />
                <PixelBreadcrumb items={[{ label: 'Dashboard' }, { label: 'Settings' }, { label: 'Appearance', active: true }]} />
              </div>
            </DocSection>

            {/* ══════════════════ PIXELPAGINATION ══════════════════ */}
            <DocSection
              id="pixel-pagination"
              title="PixelPagination"
              description={<>Page navigation with prev/next buttons and numbered pages. Disables prev/next at boundaries. Pairs well with <CompLink id="pixel-table">PixelTable</CompLink> for paginated data.</>}
              props={[
                { name: 'page', type: 'number', default: '—', description: 'Current page' },
                { name: 'total', type: 'number', default: '—', description: 'Total pages' },
                { name: 'onChange', type: '(page: number) => void', default: '—', description: 'Page change handler' },
              ]}
              code={`<PixelPagination page={page} total={5} onChange={setPage} />`}
            >
              <PixelPagination page={paginationPage} total={5} onChange={setPaginationPage} />
            </DocSection>

            <PixelDivider label="Overlay" tone="purple" spacing="lg" />

            {/* ══════════════════ PIXELMODAL ══════════════════ */}
            <DocSection
              id="pixel-modal"
              title="PixelModal"
              description={<>Modal dialog with backdrop blur, Escape key close, backdrop click close, and body scroll lock. Rendered with proper ARIA dialog attributes. Great with <CompLink id="pixel-button">PixelButton</CompLink> for confirm/cancel actions.</>}
              props={[
                { name: 'open', type: 'boolean', default: '—', description: 'Visibility state' },
                { name: 'title', type: 'string', default: '—', description: 'Modal heading' },
                { name: 'onClose', type: '() => void', default: '—', description: 'Close handler' },
                { name: 'size', type: '"sm" | "md" | "lg"', default: '"md"', description: 'Max width' },
              ]}
              code={`const [open, setOpen] = useState(false);

<PixelButton onClick={() => setOpen(true)}>Open Modal</PixelButton>

<PixelModal open={open} title="Confirm Action" onClose={() => setOpen(false)}>
  <p>Are you sure you want to proceed?</p>
  <PixelButton tone="green" onClick={() => setOpen(false)}>Confirm</PixelButton>
</PixelModal>`}
            >
              <PixelButton tone="purple" iconLeft={<PxlKitIcon icon={Bell} size={16} />} onClick={() => setModalOpen(true)}>
                Open Modal Demo
              </PixelButton>
            </DocSection>

            {/* ══════════════════ PIXELTOOLTIP ══════════════════ */}
            <DocSection
              id="pixel-tooltip"
              title="PixelTooltip"
              description={<>Informational tooltip that appears on hover and focus. Supports four positions. Wrap any element — works perfectly with <CompLink id="pxlkit-button">PxlKitButton</CompLink>.</>}
              props={[
                { name: 'content', type: 'string', default: '—', description: 'Tooltip text' },
                { name: 'position', type: '"top" | "bottom" | "left" | "right"', default: '"top"', description: 'Tooltip placement' },
              ]}
              code={`<PixelTooltip content="Edit this item" position="top">
  <PxlKitButton label="Edit" icon={<PxlKitIcon icon={Edit} size={16} />} />
</PixelTooltip>`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <PixelTooltip content="Top tooltip" position="top">
                  <span><PxlKitButton label="Top" icon={<PxlKitIcon icon={ArrowRight} size={14} className="rotate-[-90deg]" />} tone="green" /></span>
                </PixelTooltip>
                <PixelTooltip content="Bottom tooltip" position="bottom">
                  <span><PxlKitButton label="Bottom" icon={<PxlKitIcon icon={ArrowRight} size={14} className="rotate-90" />} tone="cyan" /></span>
                </PixelTooltip>
                <PixelTooltip content="Left tooltip" position="left">
                  <span><PxlKitButton label="Left" icon={<PxlKitIcon icon={ArrowRight} size={14} className="rotate-180" />} tone="gold" /></span>
                </PixelTooltip>
                <PixelTooltip content="Right tooltip" position="right">
                  <span><PxlKitButton label="Right" icon={<PxlKitIcon icon={ArrowRight} size={14} />} tone="purple" /></span>
                </PixelTooltip>
              </div>
            </DocSection>

            {/* ══════════════════ PIXELDROPDOWN ══════════════════ */}
            <DocSection
              id="pixel-dropdown"
              title="PixelDropdown"
              description={<>Action menu dropdown with click-outside close. Ideal for contextual actions and quick navigation. For form selection, see <CompLink id="pixel-select">PixelSelect</CompLink>. For split actions, see <CompLink id="pixel-split-button">PixelSplitButton</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Trigger button label' },
                { name: 'items', type: 'Option[]', default: '—', description: 'Menu items' },
                { name: 'onSelect', type: '(v: string) => void', default: '—', description: 'Selection handler' },
                { name: 'tone', type: 'Tone', default: '"neutral"', description: 'Trigger button tone' },
              ]}
              code={`<PixelDropdown
  label="Actions"
  items={[
    { value: 'copy', label: 'Copy snippet' },
    { value: 'preview', label: 'Open preview' },
    { value: 'delete', label: 'Delete item' },
  ]}
  onSelect={(v) => console.log(v)}
/>`}
            >
              <div className="flex flex-wrap gap-3">
                <PixelDropdown
                  label="Quick Actions"
                  items={[
                    { value: 'copy', label: 'Copy snippet' },
                    { value: 'preview', label: 'Open preview' },
                    { value: 'publish', label: 'Publish update' },
                  ]}
                  onSelect={() => {}}
                />
                <PixelDropdown
                  label="Export As"
                  tone="green"
                  items={[
                    { value: 'svg', label: 'SVG File' },
                    { value: 'png', label: 'PNG Image' },
                    { value: 'react', label: 'React Component' },
                  ]}
                  onSelect={() => {}}
                />
              </div>
            </DocSection>

            <PixelDivider label="Layout" tone="neutral" spacing="lg" />

            {/* ══════════════════ PIXELSECTION ══════════════════ */}
            <DocSection
              id="pixel-section"
              title="PixelSection"
              description={<>Content section wrapper with title and optional subtitle. Provides consistent spacing and border styling. Used internally to group components on this page. Combine with <CompLink id="pixel-divider">PixelDivider</CompLink> for visual separation.</>}
              props={[
                { name: 'title', type: 'string', default: '—', description: 'Section heading' },
                { name: 'subtitle', type: 'string', default: '—', description: 'Description text' },
              ]}
              code={`<PixelSection title="Actions" subtitle="Interactive button components.">
  {children}
</PixelSection>`}
            >
              <PixelSection title="Example Section" subtitle="This is a wrapped content area with border and padding.">
                <div className="flex gap-2">
                  <PixelButton tone="green" size="sm">Action A</PixelButton>
                  <PixelButton tone="cyan" size="sm">Action B</PixelButton>
                </div>
              </PixelSection>
            </DocSection>

            {/* ══════════════════ PIXELDIVIDER ══════════════════ */}
            <DocSection
              id="pixel-divider"
              title="PixelDivider"
              description={<>Horizontal divider with optional centered label. Great for separating content sections. Used throughout this page between categories. Pair with <CompLink id="pixel-section">PixelSection</CompLink>.</>}
              props={[
                { name: 'label', type: 'string', default: '—', description: 'Center label text' },
                { name: 'tone', type: 'Tone', default: '"neutral"', description: 'Label color' },
              ]}
              code={`<PixelDivider />
<PixelDivider label="Section" tone="green" />`}
            >
              <div className="space-y-4">
                <PixelDivider />
                <PixelDivider label="Section Break" tone="green" />
                <PixelDivider label="Actions" tone="cyan" />
                <PixelDivider label="Inputs" tone="gold" />
              </div>
            </DocSection>

            <PixelDivider label="Primitives" tone="neutral" spacing="lg" />

            {/* ══════════════════ PIXELBAREBUTTON ══════════════════ */}
            <DocSection
              id="pixel-bare-button"
              title="PixelBareButton"
              description={<>Unstyled <PixelCodeInline>{'<button>'}</PixelCodeInline> wrapper with <PixelCodeInline>forwardRef</PixelCodeInline> support and <PixelCodeInline>type=&quot;button&quot;</PixelCodeInline> default. Use as the base for custom styled buttons. Accepts all native button attributes.</>}
              props={[
                { name: '...props', type: 'ButtonHTMLAttributes', default: '—', description: 'All native <button> attributes' },
                { name: 'ref', type: 'Ref<HTMLButtonElement>', default: '—', description: 'Forwarded ref' },
              ]}
              code={`<PixelBareButton onClick={() => alert('click')} className="px-3 py-1 bg-retro-green/20 rounded">
  Custom Button
</PixelBareButton>`}
            >
              <p className="text-sm text-retro-muted">
                Renders an unstyled <PixelCodeInline>{'<button type="button">'}</PixelCodeInline> element. Apply your own classes to build custom interactions without inheriting Pxlkit button styles.
              </p>
            </DocSection>

            {/* ══════════════════ PIXELBAREINPUT ══════════════════ */}
            <DocSection
              id="pixel-bare-input"
              title="PixelBareInput"
              description={<>Unstyled <PixelCodeInline>{'<input>'}</PixelCodeInline> wrapper with <PixelCodeInline>forwardRef</PixelCodeInline> support. Use as the base for custom text fields or form controls. Accepts all native input attributes.</>}
              props={[
                { name: '...props', type: 'InputHTMLAttributes', default: '—', description: 'All native <input> attributes' },
                { name: 'ref', type: 'Ref<HTMLInputElement>', default: '—', description: 'Forwarded ref' },
              ]}
              code={`<PixelBareInput type="text" placeholder="Unstyled input..." className="border px-2 py-1" />`}
            >
              <p className="text-sm text-retro-muted">
                Renders an unstyled <PixelCodeInline>{'<input>'}</PixelCodeInline> element. For styled text fields with labels, hints, and errors, use <CompLink id="pixel-input">PixelInput</CompLink>.
              </p>
            </DocSection>

            {/* ══════════════════ PIXELBARETEXTAREA ══════════════════ */}
            <DocSection
              id="pixel-bare-textarea"
              title="PixelBareTextarea"
              description={<>Unstyled <PixelCodeInline>{'<textarea>'}</PixelCodeInline> wrapper with <PixelCodeInline>forwardRef</PixelCodeInline> support. Use for custom multi-line inputs. Accepts all native textarea attributes.</>}
              props={[
                { name: '...props', type: 'TextareaHTMLAttributes', default: '—', description: 'All native <textarea> attributes' },
                { name: 'ref', type: 'Ref<HTMLTextAreaElement>', default: '—', description: 'Forwarded ref' },
              ]}
              code={`<PixelBareTextarea rows={3} placeholder="Unstyled textarea..." className="border px-2 py-1 w-full" />`}
            >
              <p className="text-sm text-retro-muted">
                Renders an unstyled <PixelCodeInline>{'<textarea>'}</PixelCodeInline> element. For styled multi-line input with labels and errors, use <CompLink id="pixel-textarea">PixelTextarea</CompLink>.
              </p>
            </DocSection>

            <PixelDivider label="Animations" tone="purple" spacing="lg" />

            {/* ── Trigger Modes introduction ── */}
            <section className="scroll-mt-20 space-y-4 pt-10">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-pixel text-xs text-retro-purple">TRIGGER MODES</h2>
                  <PixelBadge tone="purple">all animations</PixelBadge>
                </div>
                <p className="mt-2 text-sm text-retro-muted max-w-2xl">
                  Every animation component accepts a <PixelCodeInline>trigger</PixelCodeInline> prop that controls <em>when</em> it plays. The default <PixelCodeInline>&quot;mount&quot;</PixelCodeInline> mode preserves backward compatibility — the animation fires on render.
                </p>
              </div>

              <div className="rounded-lg border border-retro-border/40 bg-retro-surface/20 p-4 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <PixelBadge tone="green">mount</PixelBadge>
                    <p className="text-xs text-retro-muted">Plays immediately on render (default).</p>
                  </div>
                  <div className="space-y-1">
                    <PixelBadge tone="cyan">hover</PixelBadge>
                    <p className="text-xs text-retro-muted">Plays while the pointer is over the element.</p>
                  </div>
                  <div className="space-y-1">
                    <PixelBadge tone="gold">click</PixelBadge>
                    <p className="text-xs text-retro-muted">Plays once per click. Re-click to replay.</p>
                  </div>
                  <div className="space-y-1">
                    <PixelBadge tone="purple">focus</PixelBadge>
                    <p className="text-xs text-retro-muted">Plays while the element has focus-within.</p>
                  </div>
                  <div className="space-y-1">
                    <PixelBadge tone="red">inView</PixelBadge>
                    <p className="text-xs text-retro-muted">Plays when scrolled into the viewport (IntersectionObserver).</p>
                  </div>
                  <div className="space-y-1">
                    <PixelBadge tone="neutral">boolean</PixelBadge>
                    <p className="text-xs text-retro-muted">Controlled mode — <PixelCodeInline>true</PixelCodeInline> = playing, <PixelCodeInline>false</PixelCodeInline> = idle.</p>
                  </div>
                </div>
              </div>

              <CodeBlock code={`// Plays on hover
<PixelBounce trigger="hover">
  <PxlKitIcon icon={Star} size={20} colorful />
</PixelBounce>

// Plays once per click
<PixelShake trigger="click" repeat={2}>
  <PixelBadge tone="red">Error</PixelBadge>
</PixelShake>

// Controlled by parent state
const [active, setActive] = useState(false);
<PixelPulse trigger={active}>
  <PixelBadge tone="green">Live</PixelBadge>
</PixelPulse>

// Fade in when scrolled into view
<PixelFadeIn trigger="inView" duration={600}>
  <PixelCard title="Hello">Visible!</PixelCard>
</PixelFadeIn>

// Callback when animation completes
<PixelFadeIn trigger="click" onComplete={() => console.log('done!')}>
  <p>Click me</p>
</PixelFadeIn>`} language="tsx" />

              {/* Live trigger demos */}
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col items-center gap-2 rounded-lg border border-retro-border/30 bg-retro-bg/40 p-4">
                  <p className="font-pixel text-[9px] text-retro-muted">HOVER</p>
                  <PixelBounce trigger="hover" height={10}>
                    <PxlKitIcon icon={Star} size={24} colorful />
                  </PixelBounce>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-lg border border-retro-border/30 bg-retro-bg/40 p-4">
                  <p className="font-pixel text-[9px] text-retro-muted">CLICK</p>
                  <PixelShake trigger="click" repeat={3} distance={3}>
                    <PixelBadge tone="red">Shake me</PixelBadge>
                  </PixelShake>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-lg border border-retro-border/30 bg-retro-bg/40 p-4">
                  <p className="font-pixel text-[9px] text-retro-muted">HOVER</p>
                  <PixelRotate trigger="hover" duration={1200}>
                    <PxlKitIcon icon={Gear} size={24} colorful />
                  </PixelRotate>
                </div>
              </div>
            </section>

            {/* ══════════════════ PIXELFADEIN ══════════════════ */}
            <AnimationReplay
              id="pixel-fade-in"
              title="PixelFadeIn"
              description={
                <>Fades in children on mount. Use <PixelCodeInline>trigger</PixelCodeInline> to control when it fires — e.g. <PixelCodeInline>&quot;inView&quot;</PixelCodeInline> for scroll-triggered reveals. Combines well with <CompLink id="pixel-slide-in">PixelSlideIn</CompLink> for staggered entrances.</>
              }
              code={`<PixelFadeIn duration={400} delay={0} easing="ease-out">
  <PixelCard title="Hello World">Faded in!</PixelCard>
</PixelFadeIn>

// Scroll-triggered fade
<PixelFadeIn trigger="inView" duration={600}>
  <p>I appear when scrolled into view</p>
</PixelFadeIn>`}
              props={[
                { name: 'duration', type: 'number', default: '400', description: 'Animation duration in ms' },
                { name: 'delay', type: 'number', default: '0', description: 'Delay before animation starts (ms)' },
                { name: 'repeat', type: 'number | "infinite"', default: '1', description: 'Repeat count or infinite loop' },
                { name: 'easing', type: 'string', default: '"ease"', description: 'CSS easing function' },
                { name: 'fillMode', type: '"none" | "forwards" | "backwards" | "both"', default: '"both"', description: 'How styles apply before/after animation' },
                { name: 'className', type: 'string', default: '—', description: 'Extra class names on wrapper div' },
                { name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' },
                { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when animation cycle finishes' },
              ]}
            >
              {(key) => (
                <PixelFadeIn key={key} duration={500}>
                  <PixelCard title="Faded In" icon={<PxlKitIcon icon={SparkleSmall} size={16} />}>
                    This card fades in from opacity 0. Click replay to restart.
                  </PixelCard>
                </PixelFadeIn>
              )}
            </AnimationReplay>

            {/* ══════════════════ PIXELSLIDEIN ══════════════════ */}
            <AnimationReplay
              id="pixel-slide-in"
              title="PixelSlideIn"
              description={
                <>Slides in children from a direction with a fade. You can fine tune travel using <PixelCodeInline>distance</PixelCodeInline> and pacing using <PixelCodeInline>easing</PixelCodeInline>. Complements <CompLink id="pixel-fade-in">PixelFadeIn</CompLink>.</>
              }
              code={`<PixelSlideIn from="down" duration={350} distance={14} easing="ease-out">
  <PixelButton tone="green">Slid In</PixelButton>
</PixelSlideIn>

// Staggered list
{items.map((item, i) => (
  <PixelSlideIn key={item} from="right" delay={i * 80}>
    <PixelCard title={item} />
  </PixelSlideIn>
))}`}
              props={[
                { name: 'from', type: '"up" | "down" | "left" | "right"', default: '"down"', description: 'Direction to slide in from' },
                { name: 'duration', type: 'number', default: '350', description: 'Animation duration in ms' },
                { name: 'delay', type: 'number', default: '0', description: 'Delay before animation (ms)' },
                { name: 'distance', type: 'number', default: '10', description: 'Slide distance in px' },
                { name: 'repeat', type: 'number | "infinite"', default: '1', description: 'Repeat count or infinite loop' },
                { name: 'easing', type: 'string', default: '"ease"', description: 'CSS easing function' },
                { name: 'fillMode', type: '"none" | "forwards" | "backwards" | "both"', default: '"both"', description: 'How styles apply before/after animation' },
                { name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' },
                { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when animation cycle finishes' },
              ]}
            >
              {(key) => (
                <div className="flex flex-wrap gap-2">
                  {(['down', 'up', 'left', 'right'] as const).map((dir, i) => (
                    <PixelSlideIn key={`${key}-${dir}`} from={dir} duration={350} delay={i * 80}>
                      <PixelBadge tone="cyan">{dir === 'down' ? 'v DOWN' : dir === 'up' ? '^ UP' : dir === 'left' ? '< LEFT' : '> RIGHT'}</PixelBadge>
                    </PixelSlideIn>
                  ))}
                </div>
              )}
            </AnimationReplay>

            {/* ══════════════════ PIXELPULSE ══════════════════ */}
            <AnimationReplay
              id="pixel-pulse"
              title="PixelPulse"
              description=<>Continuously pulses opacity and scale to draw attention. Ideal for notifications, loading states, or status indicators. Disable by removing the component when not needed.</>
              code={`<PixelPulse duration={2000}>
  <PixelBadge tone="red">Live</PixelBadge>
</PixelPulse>`}
              props={[
                { name: 'duration', type: 'number', default: '2000', description: 'Pulse cycle duration in ms' },
                { name: 'repeat', type: 'number | "infinite"', default: '"infinite"', description: 'Loop count for pulse cycles' },
                { name: 'easing', type: 'string', default: '"ease-in-out"', description: 'CSS easing function' },
                { name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' },
                { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when animation cycle finishes' },
              ]}
            >
              {() => (
                <div className="flex flex-wrap items-center gap-3">
                  <PixelPulse><PixelBadge tone="red">Live</PixelBadge></PixelPulse>
                  <PixelPulse duration={1500}><PixelBadge tone="green">Online</PixelBadge></PixelPulse>
                  <PixelPulse duration={3000}><PixelStatCard label="CPU" value="87%" tone="gold" /></PixelPulse>
                </div>
              )}
            </AnimationReplay>

            {/* ══════════════════ PIXELBOUNCE ══════════════════ */}
            <AnimationReplay
              id="pixel-bounce"
              title="PixelBounce"
              description=<>Applies a pixel-art vertical bounce to any element. Great for icons, badges, and call-to-actions. Control bounce speed with <PixelCodeInline>duration</PixelCodeInline> and stop it with <PixelCodeInline>repeat=1</PixelCodeInline>.</>
              code={`<PixelBounce duration={800}>
  <PxlKitIcon icon={Trophy} size={24} colorful />
</PixelBounce>

// Finite bounce
<PixelBounce duration={600} repeat={3}>
  <PixelBadge tone="gold">+100 XP</PixelBadge>
</PixelBounce>`}
              props={[
                { name: 'duration', type: 'number', default: '800', description: 'Bounce cycle duration in ms' },
                { name: 'repeat', type: 'number | "infinite"', default: '"infinite"', description: 'Number of bounces or infinite' },
                { name: 'height', type: 'number', default: '8', description: 'Bounce height in px' },
                { name: 'easing', type: 'string', default: '"ease"', description: 'CSS easing function' },
                { name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' },
                { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when animation cycle finishes' },
              ]}
            >
              {(key) => (
                <div className="flex flex-wrap items-center gap-4">
                  <PixelBounce key={key} duration={800}>
                    <PxlKitIcon icon={Trophy} size={24} colorful />
                  </PixelBounce>
                  <PixelBounce key={`${key}-b`} duration={600} repeat={3}>
                    <PixelBadge tone="gold">+100 XP</PixelBadge>
                  </PixelBounce>
                  <PixelBounce key={`${key}-c`} duration={1200}>
                    <PxlKitIcon icon={Crown} size={24} colorful />
                  </PixelBounce>
                </div>
              )}
            </AnimationReplay>

            {/* ══════════════════ PIXELFLOAT ══════════════════ */}
            <AnimationReplay
              id="pixel-float"
              title="PixelFloat"
              description={<>Creates a smooth hovering motion for icons, badges, and decorative cards. Use it as a soft ambient animation and combine with <CompLink id="pixel-pulse">PixelPulse</CompLink> for status signals.</>}
              code={`<PixelFloat distance={8} duration={2400}>
  <PxlKitIcon icon={Star} size={20} colorful />
</PixelFloat>`}
              props={[
                { name: 'duration', type: 'number', default: '2200', description: 'Float cycle duration in ms' },
                { name: 'distance', type: 'number', default: '6', description: 'Vertical travel distance in px' },
                { name: 'repeat', type: 'number | "infinite"', default: '"infinite"', description: 'Loop count for the motion' },
                { name: 'easing', type: 'string', default: '"ease-in-out"', description: 'CSS easing function' },
                { name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' },
                { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when animation cycle finishes' },
              ]}
            >
              {(key) => (
                <div className="flex flex-wrap items-center gap-4">
                  <PixelFloat key={key}><PxlKitIcon icon={Star} size={20} colorful /></PixelFloat>
                  <PixelFloat key={`${key}-b`} distance={10} duration={2800}><PixelBadge tone="cyan">Hover</PixelBadge></PixelFloat>
                  <PixelFloat key={`${key}-c`} distance={4} duration={1800}><PxlKitIcon icon={Heart} size={20} colorful /></PixelFloat>
                </div>
              )}
            </AnimationReplay>

            {/* ══════════════════ PIXELSHAKE ══════════════════ */}
            <AnimationReplay
              id="pixel-shake"
              title="PixelShake"
              description={<>Adds a quick horizontal shake for validation errors or critical alerts. Keep <PixelCodeInline>repeat</PixelCodeInline> low to avoid visual fatigue. Often paired with <CompLink id="pixel-alert">PixelAlert</CompLink>.</>}
              code={`<PixelShake duration={450} repeat={2} distance={3}>
  <PixelBadge tone="red">Invalid Input</PixelBadge>
</PixelShake>`}
              props={[
                { name: 'duration', type: 'number', default: '450', description: 'Single shake cycle duration in ms' },
                { name: 'distance', type: 'number', default: '2', description: 'Horizontal shake distance in px' },
                { name: 'repeat', type: 'number | "infinite"', default: '1', description: 'How many cycles to run' },
                { name: 'easing', type: 'string', default: '"linear"', description: 'CSS easing function' },
                { name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' },
                { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when animation cycle finishes' },
              ]}
            >
              {(key) => (
                <div className="flex flex-wrap items-center gap-3">
                  <PixelShake key={key} repeat={2}><PixelBadge tone="red">Invalid</PixelBadge></PixelShake>
                  <PixelShake key={`${key}-b`} repeat={3} distance={3}><PxlKitIcon icon={WarningTriangle} size={20} colorful /></PixelShake>
                  <PixelShake key={`${key}-c`} duration={650} repeat={2}><PixelBadge tone="gold">Low HP</PixelBadge></PixelShake>
                </div>
              )}
            </AnimationReplay>

            {/* ══════════════════ PIXELROTATE ══════════════════ */}
            <AnimationReplay
              id="pixel-rotate"
              title="PixelRotate"
              description={<>Rotates children continuously or in finite loops. Use <PixelCodeInline>direction</PixelCodeInline> to reverse or alternate spin behavior for loading indicators and decorative accents.</>}
              code={`<PixelRotate duration={1800} direction="normal" repeat="infinite">
  <PxlKitIcon icon={Gear} size={22} colorful />
</PixelRotate>`}
              props={[
                { name: 'duration', type: 'number', default: '1800', description: 'One full rotation duration in ms' },
                { name: 'repeat', type: 'number | "infinite"', default: '"infinite"', description: 'Rotation loop count' },
                { name: 'direction', type: '"normal" | "reverse" | "alternate" | "alternate-reverse"', default: '"normal"', description: 'Animation direction mode' },
                { name: 'easing', type: 'string', default: '"linear"', description: 'CSS easing function' },
                { name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' },
                { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when animation cycle finishes' },
              ]}
            >
              {(key) => (
                <div className="flex flex-wrap items-center gap-4">
                  <PixelRotate key={key}><PxlKitIcon icon={Gear} size={22} colorful /></PixelRotate>
                  <PixelRotate key={`${key}-b`} direction="reverse" duration={1400}><PxlKitIcon icon={Lightning} size={22} colorful /></PixelRotate>
                  <PixelRotate key={`${key}-c`} repeat={2} direction="alternate"><PixelBadge tone="purple">Sync</PixelBadge></PixelRotate>
                </div>
              )}
            </AnimationReplay>

            {/* ══════════════════ PIXELZOOMIN ══════════════════ */}
            <AnimationReplay
              id="pixel-zoom-in"
              title="PixelZoomIn"
              description={<>Scales and fades elements into view for punchy entrances. Works great for cards, badges, and modal content. Combine with <CompLink id="pixel-fade-in">PixelFadeIn</CompLink> for polished appear transitions.</>}
              code={`<PixelZoomIn duration={320} startScale={0.9}>
  <PixelCard title="Quick Reveal">Zoomed entrance</PixelCard>
</PixelZoomIn>`}
              props={[
                { name: 'duration', type: 'number', default: '320', description: 'Animation duration in ms' },
                { name: 'delay', type: 'number', default: '0', description: 'Delay before animation starts (ms)' },
                { name: 'startScale', type: 'number', default: '0.92', description: 'Starting scale value' },
                { name: 'repeat', type: 'number | "infinite"', default: '1', description: 'Repeat count or infinite loop' },
                { name: 'easing', type: 'string', default: '"cubic-bezier(.2,.9,.2,1)"', description: 'CSS easing function' },
                { name: 'fillMode', type: '"none" | "forwards" | "backwards" | "both"', default: '"both"', description: 'How styles apply before/after animation' },
                { name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' },
                { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when animation cycle finishes' },
              ]}
            >
              {(key) => (
                <div className="grid gap-3 sm:grid-cols-3">
                  <PixelZoomIn key={key}>
                    <PixelCard title="Pack Ready" icon={<PxlKitIcon icon={Package} size={16} />}>UI pack bundled</PixelCard>
                  </PixelZoomIn>
                  <PixelZoomIn key={`${key}-b`} delay={80} startScale={0.88}>
                    <PixelBadge tone="gold">New Anim</PixelBadge>
                  </PixelZoomIn>
                  <PixelZoomIn key={`${key}-c`} delay={140}>
                    <PixelButton tone="green">Launch</PixelButton>
                  </PixelZoomIn>
                </div>
              )}
            </AnimationReplay>

            {/* ══════════════════ PIXELFLICKER ══════════════════ */}
            <AnimationReplay
              id="pixel-flicker"
              title="PixelFlicker"
              description={<>Creates a retro monitor/electric flicker effect. Ideal for alert labels, neon headings, and ambient status text. Pair with <CompLink id="pixel-glitch">PixelGlitch</CompLink> for cyberpunk-style UI accents.</>}
              code={`<PixelFlicker duration={2200}>
  <p className="font-pixel text-retro-cyan">SIGNAL LOCKED</p>
</PixelFlicker>`}
              props={[
                { name: 'duration', type: 'number', default: '2200', description: 'Flicker cycle duration in ms' },
                { name: 'repeat', type: 'number | "infinite"', default: '"infinite"', description: 'Loop count for the effect' },
                { name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' },
                { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when animation cycle finishes' },
              ]}
            >
              {(key) => (
                <div className="flex flex-wrap items-center gap-4">
                  <PixelFlicker key={key}><p className="font-pixel text-xs text-retro-cyan">SIGNAL LOCKED</p></PixelFlicker>
                  <PixelFlicker key={`${key}-b`} duration={1500}><PixelBadge tone="purple">NEON</PixelBadge></PixelFlicker>
                  <PixelFlicker key={`${key}-c`} duration={2800}><PxlKitIcon icon={Lightning} size={22} colorful /></PixelFlicker>
                </div>
              )}
            </AnimationReplay>

            {/* ══════════════════ PIXELTYPEWRITER ══════════════════ */}
            <AnimationReplay
              id="pixel-typewriter"
              title="PixelTypewriter"
              description=<>Reveals text character by character at a configurable speed. Supports a blinking cursor and start delay. Inherits the <CompLink id="design-tokens">tone</CompLink> system for color theming.</>
              code={`<PixelTypewriter text="Hello, World!" speed={60} tone="green" />
<PixelTypewriter text="// loading system..." speed={40} delay={800} tone="cyan" cursor />`}
              props={[
                { name: 'text', type: 'string', default: '—', description: 'Text to animate (required)' },
                { name: 'speed', type: 'number', default: '60', description: 'Milliseconds per character' },
                { name: 'delay', type: 'number', default: '0', description: 'Delay before typing starts (ms)' },
                { name: 'cursor', type: 'boolean', default: 'true', description: 'Show blinking cursor while typing' },
                { name: 'tone', type: 'Tone', default: '"green"', description: 'Text color tone' },
                { name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' },
                { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when typing finishes' },
              ]}
            >
              {(key) => (
                <div className="space-y-2 rounded-md border border-retro-border/30 bg-retro-bg/50 p-3">
                  <div className="font-mono text-sm">
                    <PixelTypewriter key={key} text="> Initializing Pxlkit UI Kit..." speed={45} tone="green" />
                  </div>
                  <div className="font-mono text-sm">
                    <PixelTypewriter key={`${key}-b`} text={"> Loading " + UI_COMPONENTS_COUNT + " components..."} speed={45} delay={1500} tone="cyan" />
                  </div>
                  <div className="font-mono text-sm">
                    <PixelTypewriter key={`${key}-c`} text="> System ready." speed={60} delay={3200} tone="gold" />
                  </div>
                </div>
              )}
            </AnimationReplay>

            {/* ══════════════════ PIXELGLITCH ══════════════════ */}
            <AnimationReplay
              id="pixel-glitch"
              title="PixelGlitch"
              description=<>Cyberpunk-style scanline glitch with RGB channel split. Three rendered layers shift independently — two ghost layers offset in opposite directions create chromatic aberration. Control with <PixelCodeInline>trigger</PixelCodeInline>, tune speed and intensity.</>
              code={`<PixelGlitch trigger="hover" duration={3000} intensity={4}>
  <h1 className="font-pixel text-retro-green">SYSTEM ERROR</h1>
</PixelGlitch>`}
              props={[
                { name: 'duration', type: 'number', default: '3000', description: 'Full glitch cycle duration in ms' },
                { name: 'intensity', type: 'number', default: '4', description: 'Horizontal channel-split offset in px' },
                { name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' },
                { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when animation cycle finishes' },
              ]}
            >
              {() => (
                <div className="flex flex-wrap items-end gap-8 rounded-md border border-retro-border/30 bg-retro-bg/60 px-6 py-4">
                  <div className="text-center">
                    <PixelGlitch duration={2500} intensity={4}>
                      <p className="font-pixel text-sm text-retro-red">ERROR</p>
                    </PixelGlitch>
                    <p className="mt-2 font-mono text-[9px] text-retro-muted">2500ms / 4px</p>
                  </div>
                  <div className="text-center">
                    <PixelGlitch duration={1800} intensity={5}>
                      <p className="font-pixel text-sm text-retro-cyan">CORRUPT</p>
                    </PixelGlitch>
                    <p className="mt-2 font-mono text-[9px] text-retro-muted">1800ms / 5px</p>
                  </div>
                  <div className="text-center">
                    <PixelGlitch duration={3500} intensity={3}>
                      <PixelBadge tone="purple">GLITCH</PixelBadge>
                    </PixelGlitch>
                    <p className="mt-2 font-mono text-[9px] text-retro-muted">badge / 3px</p>
                  </div>
                  <div className="text-center">
                    <PixelGlitch duration={2200} intensity={6}>
                      <p className="font-pixel text-base text-retro-gold">PXLKIT</p>
                    </PixelGlitch>
                    <p className="mt-2 font-mono text-[9px] text-retro-muted">2200ms / 6px</p>
                  </div>
                </div>
              )}
            </AnimationReplay>

            <PixelDivider label="Parallax" tone="gold" spacing="lg" />

            {/* ══════════════════ PIXELPARALLAXLAYER ══════════════════ */}
            <DocSection
              id="pixel-parallax-layer"
              title="PixelParallaxLayer"
              description={<>Scroll-based parallax layer. Translates children along Y (or X) proportionally to scroll position. Use <PixelCodeInline>speed</PixelCodeInline> to control the multiplier — 0 = static, 0.5 = half speed (far background), negative = reverse direction. GPU-composited via <PixelCodeInline>translate3d</PixelCodeInline>. Wrap inside <CompLink id="pixel-parallax-group">PixelParallaxGroup</CompLink> for clipped layouts.</>}
              props={[
                { name: 'speed', type: 'number', default: '0.5', description: 'Parallax multiplier. 0 = no movement, 1 = full scroll speed, negative = reverse.' },
                { name: 'axis', type: '"x" | "y" | "both"', default: '"y"', description: 'Which axis to translate on.' },
                { name: 'className', type: 'string', default: '—', description: 'Extra class names on wrapper div.' },
                { name: 'style', type: 'CSSProperties', default: '—', description: 'Inline styles on wrapper div.' },
              ]}
              code={`<PixelParallaxGroup className="h-[400px]">
  {/* Slow background layer */}
  <PixelParallaxLayer speed={0.3} className="absolute inset-0">
    <img src="/bg-stars.png" className="w-full h-full object-cover" />
  </PixelParallaxLayer>

  {/* Foreground content */}
  <PixelParallaxLayer speed={-0.1}>
    <PixelCard title="Floating Card">I move slightly opposite to scroll</PixelCard>
  </PixelParallaxLayer>
</PixelParallaxGroup>`}
            >
              <div className="space-y-3">
                <p className="text-sm text-retro-muted">Scroll the page to see the parallax effect on these layers:</p>
                <div className="relative h-48 rounded-lg overflow-hidden border border-retro-border/30 bg-retro-bg/50">
                  <PixelParallaxLayer speed={0.15} className="absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="grid grid-cols-8 gap-4">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <PxlKitIcon key={i} icon={Star} size={20} colorful />
                      ))}
                    </div>
                  </PixelParallaxLayer>
                  <PixelParallaxLayer speed={-0.08} className="absolute inset-0 flex items-center justify-center">
                    <PixelBadge tone="gold">speed: -0.08 (floats up)</PixelBadge>
                  </PixelParallaxLayer>
                </div>
              </div>
            </DocSection>

            {/* ══════════════════ PIXELPARALLAXGROUP ══════════════════ */}
            <DocSection
              id="pixel-parallax-group"
              title="PixelParallaxGroup"
              description={<>Container that establishes a clipped viewport area for parallax layers. Applies <PixelCodeInline>overflow: hidden</PixelCodeInline> and <PixelCodeInline>position: relative</PixelCodeInline> automatically. Wrap <CompLink id="pixel-parallax-layer">PixelParallaxLayer</CompLink> and <CompLink id="pixel-mouse-parallax">PixelMouseParallax</CompLink> elements inside.</>}
              props={[
                { name: 'as', type: '"div" | "section" | "header" | "main"', default: '"div"', description: 'HTML tag to render.' },
                { name: 'className', type: 'string', default: '—', description: 'Extra class names.' },
                { name: 'style', type: 'CSSProperties', default: '—', description: 'Inline styles.' },
              ]}
              code={`<PixelParallaxGroup as="section" className="h-[600px] bg-retro-bg">
  <PixelParallaxLayer speed={0.2}>
    {/* Background */}
  </PixelParallaxLayer>
  <PixelMouseParallax strength={15}>
    {/* Foreground that follows cursor */}
  </PixelMouseParallax>
</PixelParallaxGroup>`}
            >
              <PixelParallaxGroup className="h-40 rounded-lg border border-retro-border/30 bg-retro-bg/50">
                <PixelParallaxLayer speed={0.12} className="absolute inset-0 flex items-center justify-center opacity-15">
                  <div className="font-pixel text-[80px] text-retro-green/20 select-none">BG</div>
                </PixelParallaxLayer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <PixelBadge tone="green">Clipped parallax group</PixelBadge>
                </div>
              </PixelParallaxGroup>
            </DocSection>

            {/* ══════════════════ PIXELMOUSEPARALLAX ══════════════════ */}
            <DocSection
              id="pixel-mouse-parallax"
              title="PixelMouseParallax"
              description={<>Cursor-tracking parallax. Translates children based on mouse position relative to the nearest parent container. Use <PixelCodeInline>strength</PixelCodeInline> to control max travel distance in px. Set <PixelCodeInline>invert</PixelCodeInline> to move away from cursor. Perfect for floating elements, hero backgrounds, and interactive depth effects.</>}
              props={[
                { name: 'strength', type: 'number', default: '20', description: 'Max travel distance in px.' },
                { name: 'invert', type: 'boolean', default: 'false', description: 'If true, moves away from cursor instead of towards.' },
                { name: 'className', type: 'string', default: '—', description: 'Extra class names.' },
                { name: 'style', type: 'CSSProperties', default: '—', description: 'Inline styles.' },
              ]}
              code={`{/* Follows cursor */}
<PixelMouseParallax strength={15}>
  <PxlKitIcon icon={Star} size={32} colorful />
</PixelMouseParallax>

{/* Moves away from cursor (depth feel) */}
<PixelMouseParallax strength={25} invert>
  <PixelBadge tone="cyan">Background layer</PixelBadge>
</PixelMouseParallax>`}
            >
              <div className="space-y-3">
                <p className="text-sm text-retro-muted">Move your mouse over this area:</p>
                <div className="relative h-48 rounded-lg border border-retro-border/30 bg-retro-bg/50 flex items-center justify-center gap-8">
                  <PixelMouseParallax strength={12}>
                    <div className="text-center">
                      <PxlKitIcon icon={Trophy} size={36} colorful />
                      <p className="font-mono text-[9px] text-retro-muted mt-1">follows (12px)</p>
                    </div>
                  </PixelMouseParallax>
                  <PixelMouseParallax strength={25} invert>
                    <div className="text-center">
                      <PxlKitIcon icon={Crown} size={36} colorful />
                      <p className="font-mono text-[9px] text-retro-muted mt-1">inverted (25px)</p>
                    </div>
                  </PixelMouseParallax>
                  <PixelMouseParallax strength={8}>
                    <div className="text-center">
                      <PxlKitIcon icon={Star} size={36} colorful />
                      <p className="font-mono text-[9px] text-retro-muted mt-1">subtle (8px)</p>
                    </div>
                  </PixelMouseParallax>
                </div>
              </div>
            </DocSection>

            {/* ══════════════════ COMPONENT INVENTORY ══════════════════ */}
            <section className="pt-10">
              <PixelDivider label="Full Inventory" tone="green" spacing="lg" />
              <div className="mt-6 rounded-xl border border-retro-border/40 bg-retro-card/40 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-pixel text-[10px] text-retro-green">ALL COMPONENTS ({UI_KIT_COMPONENTS.length}) + PIXELTOAST DOCS</h3>
                  <PixelBadge tone="green">v2.0</PixelBadge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {UI_KIT_COMPONENTS.map((name) => {
                    const sectionId = `pixel-${name.replace('Pixel', '').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}`;
                    const matchedId = ALL_SECTION_IDS.find((sid) => sid === sectionId);
                    if (matchedId) {
                      return (
                        <PixelButton
                          key={name}
                          onClick={() => {
                            const el = document.getElementById(matchedId);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          size="sm"
                          tone="cyan"
                          variant="ghost"
                          className="h-auto p-0 transition-colors hover:opacity-80"
                        >
                          <PixelBadge tone="cyan">{name}</PixelBadge>
                        </PixelButton>
                      );
                    }
                    return <PixelBadge key={name} tone="neutral">{name}</PixelBadge>;
                  })}
                  <PixelButton
                    onClick={() => {
                      const el = document.getElementById('pixel-toast');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    size="sm"
                    tone="purple"
                    variant="ghost"
                    className="h-auto p-0 transition-colors hover:opacity-80"
                  >
                    <PixelBadge tone="purple">PixelToast</PixelBadge>
                  </PixelButton>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* ────────────────── Modal (rendered at root level) ────────────────── */}
      <PixelModal open={modalOpen} title="Kit Modal" onClose={() => setModalOpen(false)}>
        <p className="mb-4 text-sm text-retro-muted">
          Fully reusable modal with Escape key close, backdrop click, and body scroll lock.
          Supports <PixelCodeInline>sm</PixelCodeInline>, <PixelCodeInline>md</PixelCodeInline>, and <PixelCodeInline>lg</PixelCodeInline> sizes.
        </p>
        <div className="flex gap-2">
          <PixelButton tone="green" size="sm" iconLeft={<AnimatedPxlKitIcon icon={FireSword} size={14} />} onClick={() => setModalOpen(false)}>
            Confirm
          </PixelButton>
          <PixelButton tone="neutral" size="sm" onClick={() => setModalOpen(false)}>
            Cancel
          </PixelButton>
        </div>
      </PixelModal>
    </>
  );
}

