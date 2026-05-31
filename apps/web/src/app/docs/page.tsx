'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, GamificationPack } from '@pxlkit/gamification';
import { CheckCircle, FeedbackPack } from '@pxlkit/feedback';
import { Heart, SocialPack } from '@pxlkit/social';
import { Sun, WeatherPack } from '@pxlkit/weather';
import { EffectsPack } from '@pxlkit/effects';
import { UiPack, Pencil } from '@pxlkit/ui';
import { FireSword } from '@pxlkit/gamification';
import { Menu } from '@pxlkit/ui';
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon, ParallaxPxlKitIcon } from '@pxlkit/core';
import type { IconPack, AnyIcon } from '@pxlkit/core';
import { ParallaxPack, GhostFriend, CoolEmoji } from '@pxlkit/parallax';
import { PixelTextLink, PxlKitButton, UI_KIT_COMPONENTS } from '@pxlkit/ui-kit';

/* ─── Dynamic pack registry ─── */
const ALL_PACKS: { pack: IconPack; previewIcon: AnyIcon; accent: string }[] = [
  { pack: GamificationPack, previewIcon: Trophy,      accent: 'text-retro-gold' },
  { pack: FeedbackPack,     previewIcon: CheckCircle,  accent: 'text-retro-green' },
  { pack: SocialPack,       previewIcon: Heart,        accent: 'text-retro-pink' },
  { pack: WeatherPack,      previewIcon: Sun,          accent: 'text-retro-cyan' },
  { pack: UiPack,           previewIcon: Pencil,       accent: 'text-retro-text' },
  { pack: EffectsPack,      previewIcon: EffectsPack.icons[0], accent: 'text-retro-purple' },
];

/* Parallax pack is a flat ParallaxPxlKitData[] (different shape than IconPack),
 * but it counts toward the total and appears in the install command. */
const TOTAL_ICONS = ALL_PACKS.reduce((n, p) => n + p.pack.icons.length, 0) + ParallaxPack.length;
const TOTAL_PACKS = ALL_PACKS.length + 1; // +1 for parallax
const UI_COMPONENTS_COUNT = UI_KIT_COMPONENTS.length;

const ALL_PACK_IDS = [...ALL_PACKS.map((p) => p.pack.id), 'parallax'];
const INSTALL_CMD = `npm install @pxlkit/core ${ALL_PACK_IDS.map((id) => `@pxlkit/${id}`).join(' ')}`;

const sections = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'available-packs', label: 'Available Packs' },
  { id: 'icon-format', label: 'Icon Format' },
  { id: 'opacity', label: 'Opacity / Alpha' },
  { id: 'react-component', label: 'React Component' },
  { id: 'animated-icons', label: 'Animated Icons' },
  { id: 'parallax-icons', label: 'Parallax 3D Icons' },
  { id: 'toast-notifications', label: 'Toast Notifications' },
  { id: 'svg-generation', label: 'SVG Generation' },
  { id: 'ai-generation', label: 'AI Generation' },
  { id: 'ui-kit', label: 'UI Kit Components' },
  { id: 'contributing', label: 'Contributing' },
  { id: 'creating-packs', label: 'Creating Packs' },
];

/* ─── Sidebar nav content (shared between desktop & mobile) ─── */
function DocsSidebarContent({
  activeId,
  onNavigate,
}: {
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className="space-y-1">
      {sections.map((s) => {
        const isActive = activeId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onNavigate(s.id)}
            className={`block w-full text-left px-3 py-1.5 font-mono text-xs rounded transition-colors ${
              isActive
                ? 'text-retro-cyan bg-retro-cyan/10 shadow-[inset_2px_0_0_rgb(var(--retro-cyan))]'
                : 'text-retro-muted hover:text-retro-cyan hover:bg-retro-cyan/5'
            }`}
          >
            {s.label}
          </button>
        );
      })}
      <div className="border-t border-retro-border/30 pt-3 mt-3 px-3">
        <p className="font-mono text-[10px] text-retro-muted/50">
          {sections.length} sections · {TOTAL_ICONS} icons · {TOTAL_PACKS} packs
        </p>
      </div>
    </nav>
  );
}

export default function DocsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('getting-started');
  const [showBackToTop, setShowBackToTop] = useState(false);

  /* ── Scroll spy ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id && sections.some((s) => s.id === id)) setActiveSection(id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );
    document.querySelectorAll('section[id]').forEach((el) => observer.observe(el));
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
        tone="cyan"
        size="lg"
        className="fixed bottom-6 right-6 z-50 border-retro-cyan/40 bg-retro-bg/95 backdrop-blur-sm shadow-lg lg:hidden"
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
        className={`fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-retro-border/60 bg-retro-bg/95 backdrop-blur-sm text-retro-muted hover:text-retro-cyan hover:border-retro-cyan/40 shadow-lg transition-all ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
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
            <span className="font-pixel text-[10px] text-retro-cyan">DOCUMENTATION</span>
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
          <DocsSidebarContent activeId={activeSection} onNavigate={scrollTo} />
        </aside>
      </div>

      {/* ════════════════ MAIN LAYOUT ════════════════ */}
      <div className="relative">
        {/* ────────────────── Desktop sidebar (fixed) ────────────────── */}
        <aside className="hidden lg:block fixed top-16 left-0 bottom-0 w-56 z-30 border-r border-retro-border/40 bg-retro-bg/95 backdrop-blur-sm">
          <div className="h-full overflow-y-auto overscroll-contain p-5 pb-16 scrollbar-thin">
            <p className="mb-4 font-pixel text-[10px] text-retro-cyan">DOCUMENTATION</p>
            <DocsSidebarContent activeId={activeSection} onNavigate={scrollTo} />
          </div>
        </aside>

        {/* ────────────────── Content area ────────────────── */}
        <main className="min-h-screen lg:ml-56">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 py-8 pb-24 space-y-16">

          <div className="text-center pt-8 mb-4">
            <h1 className="font-pixel text-xl text-retro-cyan mb-3">DOCUMENTATION</h1>
            <p className="text-retro-muted font-mono text-sm">
              Three steps to your first rendered component. Then dig into icons, animation, and the rest of the kit.
            </p>
            <p className="font-mono text-[10px] text-retro-muted/50 mt-2">
              Install · Wrap with provider · Use components
            </p>
          </div>

          {/* Getting Started */}
          <Section id="getting-started" title="Getting Started">
            <P>
              <strong className="text-retro-green">Step 1 — Install.</strong> One command pulls{' '}
              <Code>@pxlkit/core</Code> and whichever icon packs you actually need. Pure SVG, no font loading,
              tree-shakeable — every pack is its own npm module under the <Code>@pxlkit</Code> scope.
            </P>
            <CodeBlock title="npm install @pxlkit/core + icon packs">{INSTALL_CMD}</CodeBlock>
            <P>
              <strong className="text-retro-green">Step 2 — Wrap with the provider</strong>{' '}
              (only needed for the UI Kit). Mount <Code>{'<PxlKitSurfaceProvider>'}</Code> once at the root of your
              app to set the default surface — &quot;pixel&quot; for the retro 8-bit aesthetic, &quot;linear&quot; for
              a flat modern one. Every UI Kit component reads from it, and any component can override locally with
              its own <Code>surface</Code> prop.
            </P>
            <CodeBlock title="app/layout.tsx — wrap once at the root">{`import { PxlKitSurfaceProvider } from '@pxlkit/ui-kit';
import '@pxlkit/ui-kit/styles.css';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PxlKitSurfaceProvider surface="pixel">
          {children}
        </PxlKitSurfaceProvider>
      </body>
    </html>
  );
}`}</CodeBlock>
            <P>
              <strong className="text-retro-green">Step 3 — Use components.</strong> Import any icon and any UI Kit
              primitive and render. Icons accept <Code>palette</Code> (default), <Code>tinted</Code>, and{' '}
              <Code>solid</Code> appearance modes — same prop, three looks.
            </P>
            <CodeBlock title="Render an icon">{`import { PxlKitIcon } from '@pxlkit/core';
import { Trophy } from '@pxlkit/gamification';
import { CheckCircle } from '@pxlkit/feedback';
import { Heart } from '@pxlkit/social';
import { Sun } from '@pxlkit/weather';

function App() {
  return (
    <div>
      {/* Palette colors (default) — uses the icon's original palette */}
      <PxlKitIcon icon={Trophy} size={32} />

      {/* Solid mode — every pixel flattened to one color */}
      <PxlKitIcon icon={CheckCircle} size={32} appearance="solid" color="#00FF88" />

      {/* Tinted mode — palette + colour overlay, preserves luminance */}
      <PxlKitIcon icon={Heart} size={48} appearance="tinted" color="#FF0000" />
    </div>
  );
}`}</CodeBlock>
            <div className="flex items-end gap-4 p-4 bg-retro-surface rounded-lg border border-retro-border/30 mt-4">
              <div className="text-center">
                <PxlKitIcon icon={Trophy} size={32} />
                <span className="block font-mono text-[9px] text-retro-muted mt-1">gamification</span>
              </div>
              <div className="text-center">
                <PxlKitIcon icon={CheckCircle} size={32} />
                <span className="block font-mono text-[9px] text-retro-muted mt-1">feedback</span>
              </div>
              <div className="text-center">
                <PxlKitIcon icon={Heart} size={32} />
                <span className="block font-mono text-[9px] text-retro-muted mt-1">social</span>
              </div>
              <div className="text-center">
                <PxlKitIcon icon={Sun} size={32} />
                <span className="block font-mono text-[9px] text-retro-muted mt-1">weather</span>
              </div>
              <div className="text-center">
                <PxlKitIcon icon={Trophy} size={32} appearance="solid" color="#00FF88" />
                <span className="block font-mono text-[9px] text-retro-muted mt-1">solid</span>
              </div>
              <div className="text-center">
                <PxlKitIcon icon={Heart} size={48} appearance="tinted" color="#FFD700" />
                <span className="block font-mono text-[9px] text-retro-muted mt-1">tinted</span>
              </div>
            </div>
          </Section>

          {/* Available Packs */}
          <Section id="available-packs" title="Available Packs">
            <P>
              Pxlkit ships with {TOTAL_PACKS} icon packs ({ALL_PACKS.length} standard 16×16 packs plus the 3D parallax pack documented below).
              Each standard pack can contain both static and animated icons. Install only the ones you need &mdash; they&apos;re fully tree-shakeable.
            </P>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ALL_PACKS.map(({ pack, previewIcon, accent }) => {
                const animated = isAnimatedIcon(previewIcon);
                return (
                  <div key={pack.id} className="p-4 bg-retro-surface rounded-lg border border-retro-border/30 flex items-start gap-3">
                    <div className={accent}>
                      {animated ? (
                        <AnimatedPxlKitIcon icon={previewIcon} size={32} />
                      ) : (
                        <PxlKitIcon icon={previewIcon} size={32} />
                      )}
                    </div>
                    <div>
                      <p className="font-pixel text-[9px] text-retro-text mb-1">
                        @pxlkit/{pack.id}
                        {pack.icons.some(isAnimatedIcon) && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-[8px] bg-retro-gold/10 text-retro-gold border border-retro-gold/30 rounded">
                            +ANIMATED
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-retro-muted leading-relaxed">{pack.description}</p>
                      <p className="font-mono text-[10px] text-retro-muted/50 mt-1">{pack.icons.length} icons</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <CodeBlock title="Install a single pack">{`npm install @pxlkit/core @pxlkit/social`}</CodeBlock>
          </Section>

          {/* Icon Format */}
          <Section id="icon-format" title="Icon Format">
            <P>
              Icons are defined using a simple, human-readable format: a grid of characters
              where each character maps to a color via a palette. The <Code>.</Code> character
              is always transparent.
            </P>
            <P>
              This format is designed to be easy to read, write by hand, and generate with AI.
              Each row is a string of exactly N characters (where N matches the grid size).
            </P>
            <CodeBlock title="PxlKitData Type">{`type GridSize = 8 | 16 | 24 | 32 | 48 | 64;

interface PxlKitData {
  name: string;        // kebab-case identifier
  size: GridSize;      // grid dimensions (NxN)
  category: string;    // pack/category name
  grid: string[];      // N rows of N characters each
  palette: Record<string, string>;  // char → hex color (#RGB / #RRGGBB / #RRGGBBAA)
  tags: string[];      // searchable tags
  author?: string;     // attribution
}`}</CodeBlock>
            <CodeBlock title="Example Icon Definition">{`export const Trophy: PxlKitData = {
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
    'Y': '#FFF44F',  // Yellow
    'D': '#B8860B',  // Dark gold
    'B': '#8B4513',  // Brown
    'W': '#FFFFFF',  // White
  },
  tags: ['trophy', 'achievement'],
};`}</CodeBlock>
            <P>
              <strong className="text-retro-green">Key insight:</strong> This same format
              can be output by an AI model. The grid is essentially ASCII art with a legend.
              You can ask ChatGPT, Claude, or any LLM to generate it.
            </P>
          </Section>

          {/* Opacity / Alpha */}
          <Section id="opacity" title="Opacity / Alpha">
            <P>
              Each palette color supports per-pixel opacity via the <Code>#RRGGBBAA</Code> format.
              The last two hex digits represent the alpha channel (00 = fully transparent, FF = fully opaque).
            </P>
            <CodeBlock title="Palette with Opacity">{`palette: {
  'A': '#FF000080',  // Red at 50% opacity
  'B': '#00FF00CC',  // Green at 80% opacity
  'C': '#0000FF',    // Blue at 100% (default)
  'D': '#FFD70040',  // Gold at 25% opacity
}`}</CodeBlock>
            <P>
              Supported hex formats:
            </P>
            <ul className="space-y-1 text-sm text-retro-muted ml-4 list-disc list-outside mb-4">
              <li><Code>#RGB</Code> — shorthand (expanded to #RRGGBB, fully opaque)</li>
              <li><Code>#RRGGBB</Code> — standard 6-digit hex (fully opaque)</li>
              <li><Code>#RRGGBBAA</Code> — 8-digit hex with alpha channel</li>
            </ul>
            <P>
              The <Code>{'<PxlKitIcon />'}</Code> component, SVG utilities, and Builder UI all
              handle opacity automatically. When generating SVG, pixels with opacity {'<'} 1 get a
              {' '}<Code>fill-opacity</Code> attribute.
            </P>
            <CodeBlock title="Utility Functions">{`import { parseHexColor, encodeHexColor } from '@pxlkit/core';

// Parse: extract color and opacity from hex string
const { color, opacity } = parseHexColor('#FF000080');
// color = '#FF0000', opacity = 0.502

// Encode: combine color and opacity back to hex
const hex = encodeHexColor('#FF0000', 0.5);
// hex = '#FF000080'

// If opacity is 1 (or omitted), returns 6-digit hex
const solid = encodeHexColor('#FF0000');
// solid = '#FF0000'`}</CodeBlock>
          </Section>

          {/* React Component */}
          <Section id="react-component" title="React Component">
            <P>
              The <Code>{'<PxlKitIcon />'}</Code> component renders pixel art as an{' '}
              <Code>{'<img>'}</Code> element whose <Code>src</Code> is an inline SVG
              document encoded as a data URI (MIME <Code>image/svg+xml</Code>). The
              source format stays SVG end-to-end — vector, hi-DPI sharp, exportable —
              but the wrapping <Code>{'<img>'}</Code> lets us use{' '}
              <Code>image-rendering: pixelated</Code>, the only browser-honoured
              directive that guarantees true nearest-neighbour scaling for pixel art
              at any size from 8 px to 512 px.
            </P>
            <CodeBlock title="IconAppearance Type">{`type IconAppearance =
  | 'palette'   // (default) original artwork colours
  | 'tinted'    // palette + colour overlay (preserves luminance & detail)
  | 'solid';    // every pixel flattened to a single colour`}</CodeBlock>
            <CodeBlock title="PxlKitProps">{`interface PxlKitProps {
  icon: PxlKitData;            // Icon data (required)
  size?: number;               // Visual size in px (default: 32)
  appearance?: IconAppearance; // Colour mode (default: 'palette')
  color?: string;              // Tint hue / flat colour for 'tinted' & 'solid'
  className?: string;          // CSS class names (applied to the <img>)
  'aria-label'?: string;       // Accessibility label (becomes <img alt>)
  style?: React.CSSProperties; // Inline styles (merged onto the <img>)

  /** @deprecated since v1.3 — use \`appearance="palette" | "solid"\` instead. */
  colorful?: boolean;
  /** @deprecated since v1.3 — use \`appearance="solid"\` instead. */
  solid?: boolean;
  /** @deprecated since v1.3 — use \`appearance="tinted" color="..."\` instead. */
  tint?: string;
}`}</CodeBlock>
            <CodeBlock title="Colour modes in action">{`// Default — original artwork palette
<PxlKitIcon icon={Trophy} size={32} />

// Tinted — keep the palette luminance, shift the hue
<PxlKitIcon icon={Trophy} size={32} appearance="tinted" color="#00FF88" />

// Solid — every pixel becomes one colour
<PxlKitIcon icon={Trophy} size={32} appearance="solid" color="#FF0000" />`}</CodeBlock>
            <div className="rounded-lg border border-retro-border/30 bg-retro-surface p-4 mt-2">
              <p className="font-pixel text-[9px] text-retro-gold mb-3">MIGRATION FROM v1.2.x</p>
              <ul className="space-y-1.5 text-xs font-mono text-retro-muted">
                <li>
                  <Code>{'<PxlKitIcon icon={X} colorful />'}</Code> → omit the prop
                  (<Code>palette</Code> is the default)
                </li>
                <li>
                  <Code>{'<PxlKitIcon icon={X} />'}</Code> (legacy mono){' '}
                  → <Code>{'<PxlKitIcon icon={X} appearance="solid" />'}</Code>
                </li>
                <li>
                  <Code>{'<PxlKitIcon icon={X} color="#FF0000" />'}</Code>{' '}
                  → <Code>{'<PxlKitIcon icon={X} appearance="solid" color="#FF0000" />'}</Code>
                </li>
                <li>
                  <Code>{'<PxlKitIcon icon={X} tint="#FF0000" />'}</Code>{' '}
                  → <Code>{'<PxlKitIcon icon={X} appearance="tinted" color="#FF0000" />'}</Code>
                </li>
              </ul>
              <p className="text-[10px] text-retro-muted/70 mt-3">
                The deprecated <Code>colorful</Code> / <Code>solid</Code> /{' '}
                <Code>tint</Code> aliases silently resolve to the new{' '}
                <Code>appearance</Code> axis at runtime so existing code keeps working.
                TypeScript marks them as <Code>@deprecated</Code>; plan to migrate before v2.
              </p>
            </div>
          </Section>

          {/* Animated Icons */}
          <Section id="animated-icons" title="Animated Icons">
            <P>
              Animated icons extend the pixel art format with frame-based playback.
              Each frame shares a base palette and can optionally override individual colors.
              Playback behavior is controlled by the <Code>trigger</Code> prop.
            </P>
            <CodeBlock title="AnimatedPxlKitData Type">{`interface AnimatedPxlKitData {
  name: string;
  size: GridSize;                      // 8 | 16 | 24 | 32 | 48 | 64
  category: string;
  palette: Record<string, string>;    // shared base palette across all frames
  frames: AnimationFrame[];            // array of frames (in display order)
  frameDuration: number;               // ms per frame (e.g. 150)
  loop: boolean;                       // @deprecated — use trigger instead
  trigger?: AnimationTrigger;          // controls playback behavior
  tags: string[];
  author?: string;
}

interface AnimationFrame {
  grid: string[];                      // same grid format as PxlKitData
  palette?: Record<string, string>;    // optional per-frame palette overrides
}

type AnimationTrigger = 'loop' | 'once' | 'hover' | 'appear' | 'ping-pong';`}</CodeBlock>
            <CodeBlock title="AnimatedPxlKitIcon Props">{`interface AnimatedPxlKitProps {
  icon: AnimatedPxlKitData;
  size?: number;               // size in px (default: 32)
  appearance?: IconAppearance; // colour mode (default: 'palette')
  color?: string;              // tint / solid colour
  trigger?: AnimationTrigger;  // override icon.trigger
  speed?: number;              // multiplier: 2 = 2× faster, 0.5 = half (0.1–10)
  fps?: number;                // fixed FPS — takes priority over speed (1–60)
  playing?: boolean;           // manual play/pause override
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;

  /** @deprecated since v1.3 — use \`appearance\` instead. */
  colorful?: boolean;
  /** @deprecated since v1.3 — use \`appearance="solid"\` instead. */
  solid?: boolean;
  /** @deprecated since v1.3 — use \`appearance="tinted" color="..."\` instead. */
  tint?: string;
}`}</CodeBlock>
            <CodeBlock title="Basic Usage">{`import { AnimatedPxlKitIcon } from '@pxlkit/core';
import { FireSword } from '@pxlkit/gamification';

// Loop forever in palette mode (default)
<AnimatedPxlKitIcon icon={FireSword} size={48} />

// Solid colour loop — flatten every pixel to one colour
<AnimatedPxlKitIcon icon={FireSword} size={32} appearance="solid" color="#00FF88" />

// Tinted loop — keep luminance, shift hue
<AnimatedPxlKitIcon icon={FireSword} size={32} appearance="tinted" color="#FF00AA" />`}</CodeBlock>
            <CodeBlock title="Trigger Modes">{`// 'loop'      — plays continuously (default)
<AnimatedPxlKitIcon icon={FireSword} trigger="loop" />

// 'once'      — plays one time, stops on last frame
<AnimatedPxlKitIcon icon={FireSword} trigger="once" />

// 'hover'     — plays only while the user hovers
<AnimatedPxlKitIcon icon={FireSword} trigger="hover" />

// 'appear'    — plays once when it enters the viewport
<AnimatedPxlKitIcon icon={FireSword} trigger="appear" />

// 'ping-pong' — loops forward then backward alternating
<AnimatedPxlKitIcon icon={FireSword} trigger="ping-pong" />`}</CodeBlock>
            <CodeBlock title="Speed & FPS Control">{`// 2× speed — double frame rate
<AnimatedPxlKitIcon icon={FireSword} speed={2} />

// Half speed
<AnimatedPxlKitIcon icon={FireSword} speed={0.5} />

// Fixed FPS — takes priority over speed and icon.frameDuration
<AnimatedPxlKitIcon icon={FireSword} fps={6} />

// Paused manually
<AnimatedPxlKitIcon icon={FireSword} playing={false} />`}</CodeBlock>
            <CodeBlock title="Export as Animated SVG">{`import { generateAnimatedSvg } from '@pxlkit/core';
import { FireSword } from '@pxlkit/gamification';

// Colorful animated SVG with CSS keyframe animation (default)
const svg = generateAnimatedSvg(FireSword);

// Monochrome animated SVG
// (note: generateAnimatedSvg is a utility — its options use the legacy
//  colorful/monoColor shape; the React component uses the new appearance API)
const monoSvg = generateAnimatedSvg(FireSword, {
  colorful: false,
  monoColor: '#00FF88',
});`}</CodeBlock>
            <div className="flex items-end gap-6 p-4 bg-retro-surface rounded-lg border border-retro-gold/30 mt-4">
              <div className="text-center">
                <AnimatedPxlKitIcon icon={FireSword} size={48} />
                <p className="font-mono text-[9px] text-retro-muted mt-1">loop</p>
              </div>
              <div className="text-center">
                <AnimatedPxlKitIcon icon={FireSword} size={48} trigger="hover" />
                <p className="font-mono text-[9px] text-retro-muted mt-1">hover</p>
              </div>
              <div className="text-center">
                <AnimatedPxlKitIcon icon={FireSword} size={48} trigger="ping-pong" />
                <p className="font-mono text-[9px] text-retro-muted mt-1">ping-pong</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-pixel text-[9px] text-retro-gold mb-1">LIVE PREVIEW</p>
                <p className="font-mono text-[10px] text-retro-muted">FireSword &mdash; 4 frames &middot; 150ms</p>
                <p className="font-mono text-[10px] text-retro-muted/50 mt-0.5">hover center icon to trigger it</p>
              </div>
            </div>
          </Section>

          {/* Parallax 3D Icons */}
          <Section id="parallax-icons" title="Parallax 3D Icons">
            <P>
              The <Code>@pxlkit/parallax</Code> pack introduces <strong className="text-retro-gold">multi-layer 3D parallax pixel icons</strong> —
              interactive depth-based icons where each layer floats at a different Z-depth. Mouse movement across the
              viewport rotates the entire scene, creating a true 3D effect. Click interactions trigger particle bursts,
              layer explosions, and color shifts.
            </P>
            <CodeBlock title="Install">{`npm install @pxlkit/core @pxlkit/parallax`}</CodeBlock>
            <CodeBlock title="Basic Usage">{`import { ParallaxPxlKitIcon } from '@pxlkit/core';
import { GhostFriend, CoolEmoji } from '@pxlkit/parallax';

// Basic 3D parallax icon (palette is the default — every layer keeps its colours)
<ParallaxPxlKitIcon icon={GhostFriend} size={64} />

// Large interactive icon with custom strength + a tint applied to every layer
<ParallaxPxlKitIcon
  icon={CoolEmoji}
  size={128}
  strength={20}
  interactive
  appearance="tinted"
  color="#FFD700"
/>`}</CodeBlock>

            <P>
              <strong className="text-retro-gold">How it works:</strong> Each parallax icon is composed
              of multiple animated layers stacked at different Z-depths using CSS <Code>perspective</Code>{' '}
              + <Code>preserve-3d</Code> + per-layer <Code>translateZ</Code>. The component tracks mouse
              position across the entire viewport and applies <Code>rotateX</Code>/<Code>rotateY</Code>{' '}
              transforms to the scene with smooth lerp interpolation.
            </P>

            <CodeBlock title="ParallaxPxlKitData Type">{`interface ParallaxPxlKitData {
  name: string;              // kebab-case identifier
  size: GridSize;            // grid dimensions (e.g. 16)
  category: string;          // always 'parallax'
  layers: ParallaxLayer[];   // ordered back→front (first = deepest)
  tags: string[];            // searchable tags
  author?: string;
}

interface ParallaxLayer {
  icon: AnimatedPxlKitData;  // each layer is an animated icon
  depth: number;             // Z-depth: positive = far, negative = near
  // depth: 3.0  → far background (shadow, trail)
  // depth: 0    → center baseline (body)
  // depth: -2.0 → near foreground (face details, blush)
}`}</CodeBlock>

            <CodeBlock title="ParallaxPxlKitIcon Props">{`interface ParallaxPxlKitProps {
  icon: ParallaxPxlKitData;    // The parallax icon data (required)
  size?: number;               // Container size in px (default: 64)
  strength?: number;           // Mouse reaction intensity (default: 18)
  appearance?: IconAppearance; // Colour mode applied to every layer (default: 'palette')
  color?: string;              // Tint / solid colour applied to every layer
  smoothing?: number;          // Lerp factor 0–1 (default: 0.06)
  perspective?: number;        // CSS perspective in px (default: max(200, size×2.5))
  layerGap?: number;           // Z spacing between layers (default: max(12, size×0.2))
  shadow?: boolean;            // Depth shadow between layers (default: true)
  interactive?: boolean;       // Click effects enabled (default: true)
  onActivate?: (active: boolean) => void;  // Click toggle callback
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;

  /** @deprecated since v1.3 — use \`appearance\` instead. */
  colorful?: boolean;
  /** @deprecated since v1.3 — use \`appearance="solid"\` instead. */
  solid?: boolean;
  /** @deprecated since v1.3 — use \`appearance="tinted" color="..."\` instead. */
  tint?: string;
}`}</CodeBlock>

            <P>
              <strong className="text-retro-cyan">Key features:</strong>
            </P>
            <ul className="space-y-2 text-sm text-retro-muted ml-4 list-disc list-outside mb-4">
              <li><strong className="text-retro-text">True 3D Depth</strong> — CSS perspective + preserve-3d + per-layer translateZ for real depth</li>
              <li><strong className="text-retro-text">Page-Wide Tracking</strong> — Mouse rotation works across the entire viewport, not just the icon</li>
              <li><strong className="text-retro-text">Click Interactions</strong> — Particle bursts, layer explosions, random rotation jolt, color hue-shift on click</li>
              <li><strong className="text-retro-text">Animated Layers</strong> — Each layer is a full <Code>AnimatedPxlKitData</Code> with frame-based animation (e.g., blinking eyes, flickering shadows)</li>
              <li><strong className="text-retro-text">Peel-Apart Intro</strong> — Layers spread out in a dramatic animation on mount</li>
              <li><strong className="text-retro-text">Depth Shadows</strong> — Soft CSS shadows between layers for visual depth</li>
            </ul>

            <CodeBlock title="Example: GhostFriend Layers">{`// GhostFriend has 5 animated layers at different depths:
const GhostFriend: ParallaxPxlKitData = {
  name: 'ghost-friend',
  size: 16,
  category: 'parallax',
  layers: [
    { icon: GhostShadow, depth: 3.0 },   // far background shadow
    { icon: GhostTrail,  depth: 1.5 },   // wispy trail behind
    { icon: GhostBody,   depth: 0 },     // main body (center)
    { icon: GhostFace,   depth: -1.0 },  // eyes + mouth (closer)
    { icon: GhostBlush,  depth: -2.0 },  // blush cheeks (nearest)
  ],
  tags: ['ghost', 'cute', 'friendly', '3d', 'parallax'],
};`}</CodeBlock>

            <CodeBlock title={`Available Icons (${ParallaxPack.length})`}>{`import { ParallaxPack } from '@pxlkit/parallax';
import {
  CoolEmoji,     // Sunglasses emoji with sparkle layers
  PixelHeart,    // Beating heart with glow + particles
  RetroTV,       // CRT monitor with scan lines
  PixelRocket,   // Rocket ship with exhaust + stars
  GhostFriend,   // Cute ghost with blush + trail
  NeonSkull,     // Glowing skull with neon effects
  MagicOrb,      // Floating orb with energy rings
  PixelCrown,    // Crown with sparkles
  RetroJoystick, // Gamepad with button highlights
  CyberEye,      // Cyberpunk eye with scan effects
} from '@pxlkit/parallax';`}</CodeBlock>

            <div className="flex flex-wrap items-end gap-6 p-4 bg-retro-surface rounded-lg border border-retro-gold/30 mt-4">
              <div className="text-center">
                <ParallaxPxlKitIcon icon={GhostFriend} size={72} strength={16} interactive />
                <p className="font-mono text-[9px] text-retro-muted mt-2">GhostFriend</p>
              </div>
              <div className="text-center">
                <ParallaxPxlKitIcon icon={CoolEmoji} size={72} strength={16} interactive />
                <p className="font-mono text-[9px] text-retro-muted mt-2">CoolEmoji</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-pixel text-[9px] text-retro-gold mb-1">LIVE 3D PREVIEW</p>
                <p className="font-mono text-[10px] text-retro-muted">{ParallaxPack.length} parallax icons</p>
                <p className="font-mono text-[10px] text-retro-muted/50 mt-0.5">move mouse to rotate · click to interact</p>
              </div>
            </div>

            <div className="p-4 bg-retro-surface rounded-lg border border-retro-gold/20 mt-4">
              <p className="font-pixel text-[8px] text-retro-gold mb-2">UI KIT PARALLAX COMPONENTS</p>
              <P>
                The UI Kit also includes scroll-based and cursor-tracking parallax wrapper components:
                <Code>PixelParallaxLayer</Code> (scroll-based), <Code>PixelParallaxGroup</Code> (clipped container),
                and <Code>PixelMouseParallax</Code> (cursor-tracking). See the{' '}
                <PixelTextLink href="/ui-kit#pixel-parallax-layer">UI Kit Parallax docs</PixelTextLink>{' '}
                for details.
              </P>
            </div>
          </Section>

          {/* Toast Notifications */}
          <Section id="toast-notifications" title="Toast Notifications">
            <P>
              Toast notifications come in two layers — both documented in the UI Kit:
            </P>
            <ul className="space-y-2 text-sm text-retro-muted ml-4 list-disc list-outside mb-3">
              <li>
                <PixelTextLink href="/ui-kit#pixel-toast">/ui-kit#pixel-toast</PixelTextLink>{' '}
                — the low-level <Code>{'<PixelToast>'}</Code> component shipped from{' '}
                <Code>@pxlkit/core</Code>: 15 props for visibility, title/message, icon,
                position, duration, colours, close button.
              </li>
              <li>
                <PixelTextLink href="/ui-kit#use-toast">/ui-kit#use-toast</PixelTextLink>{' '}
                — the <Code>{'<ToastProvider>'}</Code> + <Code>useToast()</Code> hook pattern
                that stacks multiple toasts, handles timers, and exposes{' '}
                <Code>success</Code> / <Code>error</Code> / <Code>info</Code> / <Code>warning</Code>{' '}
                shortcuts. Use this in app code.
              </li>
            </ul>
            <CodeBlock title="Quick Usage">{`import { useToast } from '@/components/ToastProvider';
import { PixelButton } from '@pxlkit/ui-kit';
import { CheckCircle } from '@pxlkit/feedback';

function App() {
  const { success } = useToast();

  return (
    <PixelButton tone="green"
      onClick={() => success('SAVED', 'Your changes have been saved', CheckCircle)}
    >
      Show Toast
    </PixelButton>
  );
}`}</CodeBlock>
            <P>
              Available tones: <Code>success</Code>, <Code>error</Code>, <Code>warning</Code>,{' '}
              <Code>info</Code>. Each tone has default colors and icons, but you can override them
              with any Pxlkit icon — including animated ones.
            </P>
            <div className="p-4 bg-retro-surface rounded-lg border border-retro-cyan/20 mt-4">
              <p className="font-pixel text-[8px] text-retro-cyan mb-2">DETAILED UI KIT DOCS</p>
              <p className="text-xs text-retro-muted">
                Open the dedicated UI Kit section for interactive controls and full prop details:
              </p>
              <PixelTextLink
                href="/ui-kit#pixel-toast"
                className="inline-block mt-3 px-4 py-2 font-mono text-xs border border-retro-cyan/40 rounded hover:bg-retro-cyan/10 transition-colors no-underline"
              >
                Open PixelToast Docs →
              </PixelTextLink>
            </div>
          </Section>

          {/* SVG Generation */}
          <Section id="svg-generation" title="SVG Generation">
            <P>
              You can generate standalone SVG files from icon data using the utility functions:
            </P>
            <CodeBlock title="Generate SVG">{`import { gridToSvg } from '@pxlkit/core';
import { Trophy } from '@pxlkit/gamification';

// Colorful SVG string
const colorSvg = gridToSvg(Trophy, { mode: 'colorful' });

// Monochrome SVG
const monoSvg = gridToSvg(Trophy, {
  mode: 'monochrome',
  monoColor: '#333333',
});

// With XML declaration (for standalone files)
const fileSvg = gridToSvg(Trophy, {
  mode: 'colorful',
  xmlDeclaration: true,
});`}</CodeBlock>
            <CodeBlock title="Pixel ↔ grid ↔ SVG conversion">{`import {
  gridToPixels,     // PxlKitData            → Array<{ x, y, color, opacity? }>
  pixelsToGrid,     // pixels + size + palette → { grid, palette }
  pixelsToSvg,      // pixels + size + SvgOptions → SVG string
  svgToDataUri,     // SVG string → "data:image/svg+xml,..."
  svgToBase64,      // SVG string → "data:image/svg+xml;base64,..."
} from '@pxlkit/core';`}</CodeBlock>
            <CodeBlock title="Validation & parsing">{`import {
  validateIconData,  // (icon) => string[]   — array of error messages (empty = valid)
  isValidIconData,   // (icon) => boolean    — shorthand
  parseIconCode,     // (code: string) => PxlKitData | null    — strict
  parseAnyIconCode,  // (code: string) => AnyIcon | null       — handles Pxl / Animated / Parallax
  generateIconCode,  // (icon) => string     — PxlKitData → TS source
  isAnimatedIcon,    // (icon) => icon is AnimatedPxlKitData   — type guard
  isParallaxIcon,    // (icon) => icon is ParallaxPxlKitData   — type guard
} from '@pxlkit/core';`}</CodeBlock>
            <CodeBlock title="Animated SVG export">{`import {
  generateAnimatedSvg,    // (icon, { colorful?, monoColor?, pixelSize?, xmlDeclaration? }) => string
  animatedToFrameIcons,   // (icon) => Array<{ icon: PxlKitData; duration: number }>
} from '@pxlkit/core';

// Drive your own raf/canvas loop from animatedToFrameIcons():
const frames = animatedToFrameIcons(FireSword);
frames.forEach(({ icon, duration }) => {
  // icon is a static PxlKitData snapshot of the frame
  // duration is the ms to display it before advancing
});`}</CodeBlock>
            <CodeBlock title="Colour utilities">{`import {
  parseHexColor,            // ('#RRGGBBAA') => { color: string; opacity: number }
  encodeHexColor,           // (hex, opacity?) => string                — inverse of parseHexColor
  adjustBrightness,         // (hex, amount: -1..1) => string           — lighten/darken
  hexToRgb,                 // ('#RRGGBB') => { r, g, b }
  rgbToHex,                 // (r, g, b) => '#RRGGBB'
  getPerceivedBrightness,   // ('#RRGGBB') => number (0..255 luma)      — useful for picking dark/light text
  RETRO_PALETTES,           // Record<name, string[]>                   — the curated retro palettes used across the site
} from '@pxlkit/core';

// Pick a readable text colour automatically:
const luma = getPerceivedBrightness(bgHex);
const textColor = luma > 140 ? '#000' : '#fff';`}</CodeBlock>
          </Section>

          {/* AI Generation */}
          <Section id="ai-generation" title="AI Generation">
            <P>
              The grid format was specifically designed to work well with AI code generation.
              Here&apos;s a prompt template you can use with any LLM:
            </P>
            <CodeBlock title="AI Prompt Template">{`Generate a 16x16 pixel art icon in this JSON format:

{
  "name": "icon-name-here",
  "size": 16,
  "category": "your-category",
  "grid": [
    "................",
    // 16 rows, each with exactly 16 characters
    // "." = transparent pixel
    // Letters map to colors via palette
  ],
  "palette": {
    "A": "#HEX001",
    "B": "#HEX002"
  },
  "tags": ["tag1", "tag2"]
}

Rules:
- Grid: exactly 16 rows of 16 chars
- "." is always transparent
- Use 3-6 colors max for clean pixel art
- Each non-"." character must have a palette entry

Create a [YOUR DESCRIPTION] icon.`}</CodeBlock>
            <P>
              After the AI generates the code, you can paste it into the
              {' '}<PixelTextLink href="/builder">Builder</PixelTextLink>{' '}
              to preview it, or use <Code>parseIconCode()</Code> programmatically:
            </P>
            <CodeBlock title="Parse AI Output">{`import { parseIconCode, validateIconData } from '@pxlkit/core';

const aiOutput = \`{ "name": "fire", ... }\`;
const icon = parseIconCode(aiOutput);

if (icon) {
  const errors = validateIconData(icon);
  if (errors.length === 0) {
    // Valid icon! Use it or save it
    console.log('Icon parsed successfully:', icon.name);
  }
}`}</CodeBlock>
          </Section>

          {/* UI Kit Components */}
          <Section id="ui-kit" title="UI Kit Components">
            <P>
              Pxlkit includes a full React + TypeScript component library with{' '}
              <Code>{UI_COMPONENTS_COUNT} production-ready components</Code>: buttons, inputs, cards,
              selects, modals, toasts, tables, badges, avatars, skeletons, layout primitives, and animation wrappers.
            </P>
            <CodeBlock title="UI Kit Route">{`/ui-kit#getting-started`}</CodeBlock>
            <CodeBlock title="Install UI Kit">{`npm install @pxlkit/core @pxlkit/ui-kit tailwindcss`}</CodeBlock>
            <CodeBlock title="CSS Setup (Tailwind v4)">{`/* Add this to your global stylesheet (e.g., globals.css or index.css) */
@import "tailwindcss";
@import "@pxlkit/ui-kit/styles.css";

/* Tell Tailwind to scan the package for its utility classes */
@source "../node_modules/@pxlkit/ui-kit";`}</CodeBlock>
            <CodeBlock title="Import Components">{`import { PixelButton, PixelCard, PixelInput, PixelSelect } from '@pxlkit/ui-kit';
import { PxlKitIcon } from '@pxlkit/core';
import { Trophy } from '@pxlkit/gamification';

<PixelButton tone="green" iconLeft={<PxlKitIcon icon={Trophy} size={16} />}>
  Create Quest
</PixelButton>`}</CodeBlock>
            <P>
              The UI Kit page includes live previews, props tables, and copy-ready code examples
              for each element. Use the sidebar to browse everything by category, including
              <Code>PixelToast</Code> and animation utilities.
            </P>
            <a
              href="/ui-kit"
              className="inline-block mt-2 px-4 py-2 font-mono text-xs text-retro-cyan border border-retro-cyan/40 rounded hover:bg-retro-cyan/10 transition-colors"
            >
              Open Full UI Kit Documentation →
            </a>
          </Section>

          {/* Contributing */}
          <Section id="contributing" title="Contributing">
            <P>
              Pxlkit is community-driven, with MIT code packages and source-available asset packs. Here&apos;s how you can contribute:
            </P>
            <ul className="space-y-2 text-sm text-retro-muted ml-4 list-disc list-outside">
              <li>
                <strong className="text-retro-text">Add icons to existing packs</strong> —
                Create new icons using the Builder, copy the TypeScript code, and submit a PR
              </li>
              <li>
                <strong className="text-retro-text">Create new icon packs</strong> —
                See the section below for the pack structure
              </li>
              <li>
                <strong className="text-retro-text">Improve the Builder</strong> —
                Add new tools, improve UX, fix bugs
              </li>
              <li>
                <strong className="text-retro-text">Improve core utilities</strong> —
                Optimize SVG generation, add new export formats
              </li>
              <li>
                <strong className="text-retro-text">Documentation</strong> —
                Fix typos, add examples, improve guides
              </li>
            </ul>
            <div className="p-4 bg-retro-surface rounded-lg border border-retro-green/20 mt-4">
              <p className="font-pixel text-[8px] text-retro-green mb-2">NAMING CONVENTIONS</p>
              <ul className="text-xs font-mono text-retro-muted space-y-1">
                <li>Icon names: <Code>kebab-case</Code> (e.g., fire-sword)</li>
                <li>Export names: <Code>PascalCase</Code> (e.g., FireSword)</li>
                <li>Pack names: <Code>kebab-case</Code> (e.g., fantasy-rpg)</li>
                <li>Tags: lowercase, comma-separated</li>
                <li>Colors: uppercase hex with # (e.g., #FF0000)</li>
                <li>Maximum 6 colors per icon for clarity</li>
              </ul>
            </div>
          </Section>

          {/* Creating Packs */}
          <Section id="creating-packs" title="Creating Packs">
            <P>
              A pack is a separate npm package under <Code>@pxlkit/</Code>. Here&apos;s
              the structure:
            </P>
            <CodeBlock title="Pack Structure">{`packages/your-pack/
├── src/
│   ├── icons/
│   │   ├── icon-one.ts      # Individual icon files
│   │   ├── icon-two.ts
│   │   └── icon-three.ts
│   └── index.ts             # Export all icons + IconPack
├── package.json
├── tsconfig.json
└── tsup.config.ts`}</CodeBlock>
            <CodeBlock title="Pack index.ts">{`import type { IconPack } from '@pxlkit/core';
import { IconOne } from './icons/icon-one';
import { IconTwo } from './icons/icon-two';

export { IconOne } from './icons/icon-one';
export { IconTwo } from './icons/icon-two';

export const YourPack: IconPack = {
  id: 'your-pack',
  name: 'Your Pack Name',
  description: 'A collection of ... icons',
  icons: [IconOne, IconTwo],
  version: '0.1.0',
  author: 'your-name',
};`}</CodeBlock>
            <P>
              After creating your pack, add it to the monorepo workspaces, register it in the
              web app&apos;s icon registry, and submit a pull request.
            </P>
          </Section>
          </div>
        </main>
      </div>
    </>
  );
}

// ────────────────────────────────────────
// Reusable doc components
// ────────────────────────────────────────
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-pixel text-sm text-retro-gold mb-6 pb-2 border-b border-retro-border/30">
        {title}
      </h2>
      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-retro-muted leading-relaxed">{children}</p>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 bg-retro-surface border border-retro-border/30 rounded font-mono text-xs text-retro-cyan">
      {children}
    </code>
  );
}

function CodeBlock({
  title,
  children,
}: {
  title?: string;
  children: string;
}) {
  return (
    <div className="mb-4">
      {title && (
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-retro-green/50" />
          <span className="font-mono text-[10px] text-retro-muted">{title}</span>
        </div>
      )}
      <pre className="code-block text-xs leading-relaxed">
        <code className="text-retro-text/80">{children}</code>
      </pre>
    </div>
  );
}
