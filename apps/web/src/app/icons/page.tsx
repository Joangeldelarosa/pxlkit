'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PxlKitIcon, AnimatedPxlKitIcon, gridToSvg, generateAnimatedSvg, isAnimatedIcon, ParallaxPxlKitIcon } from '@pxlkit/core';
import type { PxlKitData, IconPack, AnimatedPxlKitData, AnimationTrigger } from '@pxlkit/core';
import { GamificationPack } from '@pxlkit/gamification';
import { FeedbackPack, Bell, CheckCircle, XCircle } from '@pxlkit/feedback';
import { SocialPack } from '@pxlkit/social';
import { WeatherPack } from '@pxlkit/weather';
import { EffectsPack } from '@pxlkit/effects';
import { Close, UiPack } from '@pxlkit/ui';
import { ParallaxPack } from '@pxlkit/parallax';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';
import type { ToastTone } from '@/components/ToastProvider';
import { PixelButton, PxlKitButton, PixelInput, PixelSlider } from '@pxlkit/ui-kit';

// ─── Registry ───────────────────────────────
const ALL_PACKS: IconPack[] = [GamificationPack, FeedbackPack, SocialPack, WeatherPack, UiPack, EffectsPack];
const TOTAL_COUNT = ALL_PACKS.reduce((s, p) => s + p.icons.length, 0);

// ─── Helpers ────────────────────────────────────
function toPascal(name: string): string {
  return name
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

// ─── Page ───────────────────────────────────
export default function IconsPage() {
  const router = useRouter();
  const [selectedIcon, setSelectedIcon] = useState<PxlKitData | AnimatedPxlKitData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePack, setActivePack] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [animTrigger, setAnimTrigger] = useState<AnimationTrigger>('loop');
  const [animSpeed, setAnimSpeed] = useState(1);
  const [animPlaying, setAnimPlaying] = useState(true);
  const { toast } = useToast();

  // Escape to close detail panel
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedIcon(null);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Reset anim controls when icon changes
  useEffect(() => {
    if (selectedIcon && isAnimatedIcon(selectedIcon)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimTrigger(selectedIcon.trigger ?? 'loop');
      setAnimSpeed(1);
      setAnimPlaying(true);
    }
  }, [selectedIcon]);

  // ─── Derived ──────────────────────────────
  const query = searchQuery.toLowerCase().trim();

  const filteredPacks = useMemo(() => {
    return ALL_PACKS
      .filter((pack) => !activePack || pack.id === activePack)
      .map((pack) => ({
        ...pack,
        icons: pack.icons.filter(
          (icon) =>
            !query ||
            icon.name.includes(query) ||
            icon.tags.some((tag) => tag.includes(query)) ||
            pack.name.toLowerCase().includes(query)
        ),
      }))
      .filter((pack) => pack.icons.length > 0);
  }, [query, activePack]);

  const totalIcons = filteredPacks.reduce((sum, p) => sum + p.icons.length, 0);

  const grandTotal = totalIcons;

  // ─── Toast helper ─────────────────────────
  const showToast = useCallback(
    (tone: ToastTone, title: string, message: string, icon?: PxlKitData | AnimatedPxlKitData) => {
      const fallbackIcon =
        tone === 'success' ? CheckCircle : tone === 'error' ? XCircle : Bell;
      const resolvedIcon = icon ?? fallbackIcon;
      if (isAnimatedIcon(resolvedIcon)) {
        toast({ tone, title, message, animatedIcon: resolvedIcon, duration: 2500, position: 'top-right' });
      } else {
        toast({ tone, title, message, icon: resolvedIcon, duration: 2500, position: 'top-right' });
      }
    },
    [toast]
  );

  // ─── Copy helper ──────────────────────────
  async function copyToClipboard(text: string, field: string, icon?: PxlKitData) {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      showToast('success', 'COPIED', `${field} copied to clipboard`, icon);
    } catch {
      showToast('error', 'COPY FAILED', 'Could not copy to clipboard', icon);
    }
  }

  // ─── SVG download ─────────────────────────
  function downloadSvg(icon: PxlKitData, mode: 'colorful' | 'monochrome') {
    const svg = gridToSvg(icon, { mode, xmlDeclaration: true });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${icon.name}-${mode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadAnimSvg(icon: AnimatedPxlKitData) {
    const svg = generateAnimatedSvg(icon);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${icon.name}-animated.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ─── Header ─── */}
      <div className="text-center mb-8">
        <h1 className="font-pixel text-xl text-retro-gold mb-3">ICON GALLERY</h1>
        <p className="text-retro-muted font-mono text-sm">
          {TOTAL_COUNT + ParallaxPack.length} pixel art icons in {ALL_PACKS.length + 1} packs — click any icon for details
        </p>
      </div>

      {/* ─── Search + Pack Filter ─── */}
      <div className="max-w-2xl mx-auto mb-12 space-y-4">
        <div className="relative">
          <PixelInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search icons by name or tag..."
            tone="green"
            className="pl-10"
            icon={
              <svg className="w-4 h-4 text-retro-muted" viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges">
                <rect x="5" y="1" width="5" height="1" />
                <rect x="3" y="2" width="2" height="1" />
                <rect x="10" y="2" width="2" height="1" />
                <rect x="2" y="3" width="1" height="3" />
                <rect x="12" y="3" width="1" height="3" />
                <rect x="2" y="6" width="1" height="3" />
                <rect x="12" y="6" width="1" height="1" />
                <rect x="3" y="9" width="2" height="1" />
                <rect x="10" y="7" width="2" height="1" />
                <rect x="5" y="10" width="5" height="1" />
                <rect x="11" y="8" width="1" height="1" />
                <rect x="12" y="9" width="1" height="1" />
                <rect x="13" y="10" width="1" height="1" />
                <rect x="14" y="11" width="1" height="1" />
              </svg>
            }
          />
          {searchQuery && (
            <PxlKitButton
              label="Clear search"
              icon={<PxlKitIcon icon={Close} size={12} />}
              tone="red"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2"
            />
          )}
        </div>

        {/* Pack filter chips */}
        <div className="flex flex-wrap justify-center gap-2">
          <PixelButton
            onClick={() => setActivePack(null)}
            size="sm"
            variant="ghost"
            tone={!activePack ? 'green' : 'neutral'}
            className={`rounded-full ${
              !activePack
                ? 'border-retro-green/50 bg-retro-green/10 text-retro-green'
                : 'border-retro-border/40 text-retro-muted hover:text-retro-text hover:border-retro-border'
            }`}
          >
            All ({TOTAL_COUNT})
          </PixelButton>
          {ALL_PACKS.map((pack) => (
            <PixelButton
              key={pack.id}
              onClick={() => setActivePack(activePack === pack.id ? null : pack.id)}
              size="sm"
              variant="ghost"
              tone={activePack === pack.id ? 'cyan' : 'neutral'}
              className={`rounded-full ${
                activePack === pack.id
                  ? 'border-retro-cyan/50 bg-retro-cyan/10 text-retro-cyan'
                  : 'border-retro-border/40 text-retro-muted hover:text-retro-text hover:border-retro-border'
              }`}
            >
              {pack.name} ({pack.icons.length})
            </PixelButton>
          ))}
          <PixelButton
            onClick={() => setActivePack(activePack === 'parallax' ? null : 'parallax')}
            size="sm"
            variant="ghost"
            tone={activePack === 'parallax' ? 'cyan' : 'neutral'}
            className={`rounded-full ${
              activePack === 'parallax'
                ? 'border-retro-gold/50 bg-retro-gold/10 text-retro-gold'
                : 'border-retro-border/40 text-retro-muted hover:text-retro-text hover:border-retro-border'
            }`}
          >
            3D Parallax ({ParallaxPack.length})
          </PixelButton>
        </div>

        {(query || activePack) && (
          <p className="text-center font-mono text-xs text-retro-muted/70">
            {grandTotal} icon{grandTotal !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* ─── Packs ─── */}
      {filteredPacks.map((pack) => (
        <section key={pack.id} className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-pixel text-sm text-retro-cyan">{pack.name}</h2>
            <span className="text-retro-muted/50 font-mono text-xs">
              {pack.icons.length} icon{pack.icons.length !== 1 ? 's' : ''}
            </span>
            <span className="text-retro-muted/30 font-mono text-xs">v{pack.version}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2.5">
            {pack.icons.map((icon) => {
              const animated = isAnimatedIcon(icon);
              return (
                <motion.button
                  key={icon.name}
                  onClick={() => setSelectedIcon(icon)}
                  className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-colors theme-transition ${
                    selectedIcon?.name === icon.name
                      ? animated ? 'border-retro-gold bg-retro-gold/5' : 'border-retro-green bg-retro-green/5'
                      : 'border-retro-border/30 bg-retro-surface/30 hover:bg-retro-card hover:border-retro-border'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {animated ? (
                    <AnimatedPxlKitIcon icon={icon} size={32} colorful />
                  ) : (
                    <PxlKitIcon icon={icon} size={32} colorful />
                  )}
                  <span className="font-mono text-[10px] text-retro-muted truncate w-full text-center">
                    {icon.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>
      ))}

      {/* ─── Parallax 3D Pack ─── */}
      {(!activePack || activePack === 'parallax') && (!query || 'parallax'.includes(query) || '3d parallax'.includes(query) || ParallaxPack.some(
        (icon) => icon.name.includes(query) || icon.tags.some((tag) => tag.includes(query))
      )) && (
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-pixel text-sm text-retro-gold">3D Parallax Pack</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-mono bg-retro-gold/10 text-retro-gold border border-retro-gold/30 rounded">
              NEW · INTERACTIVE
            </span>
            <span className="text-retro-muted/50 font-mono text-xs">
              {ParallaxPack.length} icon{ParallaxPack.length !== 1 ? 's' : ''}
            </span>
            <span className="text-retro-muted/30 font-mono text-xs">v1.2.0</span>
          </div>

          <p className="text-sm text-retro-muted mb-6 max-w-2xl">
            Multi-layer 3D parallax icons with interactive mouse tracking and click effects.
            Move your mouse to rotate — click any icon to trigger particle bursts and layer explosions.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {ParallaxPack.filter(
              (icon) => !query || icon.name.includes(query) || icon.tags.some((tag) => tag.includes(query))
            ).map((icon) => (
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
                <span className="font-mono text-[8px] text-retro-gold/50">
                  {icon.layers.length} layers
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg border border-retro-gold/15 bg-retro-surface/20">
            <p className="font-mono text-[10px] text-retro-muted">
              <span className="text-retro-gold">npm i @pxlkit/core @pxlkit/parallax</span>
              {' · '}
              Uses <span className="text-retro-cyan">ParallaxPxlKitIcon</span> from @pxlkit/core
              {' · '}
              <a href="/docs#parallax-icons" className="text-retro-gold hover:underline">View docs →</a>
            </p>
          </div>
        </section>
      )}

      {filteredPacks.length === 0 && (!query || !('parallax'.includes(query) || '3d parallax'.includes(query) || ParallaxPack.some(
        (icon) => icon.name.includes(query) || icon.tags.some((tag) => tag.includes(query))
      ))) && (
        <div className="text-center py-20 text-retro-muted">
          <p className="font-pixel text-sm mb-2">No icons found</p>
          <p className="font-mono text-xs">Try a different search term</p>
        </div>
      )}

      {/* Bottom spacer so content doesn't hide behind the detail panel */}
      {selectedIcon && <div className="h-64" />}

      {/* ─── Detail Panel (fixed bottom) ─── */}
      <AnimatePresence>
        {selectedIcon && (
          <motion.div
            key="detail-panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-retro-bg/95 backdrop-blur-sm border-t-2 border-retro-green/30 shadow-2xl theme-transition"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 max-h-[80vh] sm:max-h-none overflow-y-auto sm:overflow-visible">
              {/* Close button — top-right on mobile */}
              <PxlKitButton
                label="Close detail panel"
                onClick={() => setSelectedIcon(null)}
                tone="neutral"
                size="sm"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10"
                icon={
                  <svg viewBox="0 0 8 8" className="w-4 h-4" shapeRendering="crispEdges" fill="currentColor">
                    <rect x="1" y="0" width="1" height="1" />
                    <rect x="6" y="0" width="1" height="1" />
                    <rect x="2" y="1" width="1" height="1" />
                    <rect x="5" y="1" width="1" height="1" />
                    <rect x="3" y="2" width="2" height="2" />
                    <rect x="2" y="5" width="1" height="1" />
                    <rect x="5" y="5" width="1" height="1" />
                    <rect x="1" y="6" width="1" height="1" />
                    <rect x="6" y="6" width="1" height="1" />
                  </svg>
                }
              />

              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                {/* ── Preview column ── */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 shrink-0">
                  {isAnimatedIcon(selectedIcon) ? (
                    <>
                      <div className="p-3 bg-retro-surface rounded-xl border border-retro-border">
                        <AnimatedPxlKitIcon
                          icon={selectedIcon}
                          size={56}
                          colorful
                          trigger={animTrigger}
                          speed={animSpeed}
                          playing={animPlaying}
                        />
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-gray-200">
                        <AnimatedPxlKitIcon
                          icon={selectedIcon}
                          size={56}
                          colorful
                          trigger={animTrigger}
                          speed={animSpeed}
                          playing={animPlaying}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-retro-surface rounded-xl border border-retro-border">
                        <PxlKitIcon icon={selectedIcon} size={56} colorful />
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-gray-200">
                        <PxlKitIcon icon={selectedIcon} size={56} colorful />
                      </div>
                      <div className="hidden sm:flex flex-col gap-2">
                        <PxlKitIcon icon={selectedIcon} size={16} colorful />
                        <PxlKitIcon icon={selectedIcon} size={24} colorful />
                        <PxlKitIcon icon={selectedIcon} size={32} colorful />
                      </div>
                      <div className="hidden sm:flex flex-col gap-2 text-retro-green">
                        <PxlKitIcon icon={selectedIcon} size={16} />
                        <PxlKitIcon icon={selectedIcon} size={24} />
                        <PxlKitIcon icon={selectedIcon} size={32} />
                      </div>
                    </>
                  )}
                </div>

                {/* ── Animation Controls (shown below previews on mobile) ── */}
                {isAnimatedIcon(selectedIcon) && (
                  <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[160px] sm:shrink-0">
                    {/* Trigger selector */}
                    <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                      {(['loop', 'once', 'hover', 'appear', 'ping-pong'] as AnimationTrigger[]).map((t) => (
                        <PixelButton
                          key={t}
                          onClick={() => { setAnimTrigger(t); setAnimPlaying(true); }}
                          size="sm"
                          variant="ghost"
                          tone={animTrigger === t ? 'gold' : 'neutral'}
                          className={`h-auto px-1.5 py-0.5 text-[9px] ${
                            animTrigger === t
                              ? 'border-retro-gold/60 bg-retro-gold/15 text-retro-gold'
                              : 'border-retro-border/40 text-retro-muted hover:text-retro-text hover:border-retro-border'
                          }`}
                        >
                          {t}
                        </PixelButton>
                      ))}
                    </div>
                    {/* Speed slider */}
                    <div className="w-full max-w-56">
                      <PixelSlider
                        label="Speed"
                        min={0.25}
                        max={4}
                        step={0.25}
                        value={animSpeed}
                        onChange={setAnimSpeed}
                        tone="gold"
                      />
                    </div>
                    {/* Play/pause + info */}
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <PixelButton
                        onClick={() => setAnimPlaying((p) => !p)}
                        size="sm"
                        variant="ghost"
                        tone="green"
                        className="h-auto px-2 py-0.5 text-[9px]"
                      >
                        {animPlaying ? 'Pause' : 'Play'}
                      </PixelButton>
                      <span className="font-mono text-[9px] text-retro-muted">
                        {selectedIcon.frames.length}f · {Math.round(1000 / (selectedIcon.frameDuration / animSpeed))} FPS
                      </span>
                    </div>
                  </div>
                )}

                {/* ── Info & Code column ── */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                    <h3 className="font-pixel text-xs sm:text-sm text-retro-green">
                      {selectedIcon.name}
                    </h3>
                    <span className="font-mono text-[10px] sm:text-xs text-retro-muted px-2 py-0.5 bg-retro-surface rounded">
                      {selectedIcon.size}x{selectedIcon.size}
                    </span>
                    <span className="font-mono text-[10px] sm:text-xs text-retro-muted px-2 py-0.5 bg-retro-surface rounded">
                      {selectedIcon.category}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedIcon.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-mono text-retro-muted bg-retro-surface rounded border border-retro-border/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Code snippets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-retro-muted">
                          Import
                        </span>
                        <PixelButton
                          onClick={() => {
                            const pascal = toPascal(selectedIcon.name);
                            copyToClipboard(
                              `import { ${pascal} } from '@pxlkit/${selectedIcon.category}';`,
                              'import',
                              isAnimatedIcon(selectedIcon) ? undefined : selectedIcon
                            );
                          }}
                          size="sm"
                          tone="green"
                          variant="ghost"
                          className="h-auto px-1.5 py-0 text-[10px]"
                        >
                          {copiedField === 'import' ? 'Copied!' : 'Copy'}
                        </PixelButton>
                      </div>
                      <code className="block p-2 bg-retro-bg border border-retro-border rounded text-[10px] font-mono text-retro-text/80 truncate">
                        {`import { ${toPascal(selectedIcon.name)} } from '@pxlkit/${selectedIcon.category}';`}
                      </code>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-retro-muted">
                          Usage
                        </span>
                        <PixelButton
                          onClick={() => {
                            const pascal = toPascal(selectedIcon.name);
                            const comp = isAnimatedIcon(selectedIcon) ? 'AnimatedPxlKitIcon' : 'PxlKitIcon';
                            copyToClipboard(
                              `<${comp} icon={${pascal}} size={32} colorful />`,
                              'usage',
                              isAnimatedIcon(selectedIcon) ? undefined : selectedIcon
                            );
                          }}
                          size="sm"
                          tone="green"
                          variant="ghost"
                          className="h-auto px-1.5 py-0 text-[10px]"
                        >
                          {copiedField === 'usage' ? 'Copied!' : 'Copy'}
                        </PixelButton>
                      </div>
                      <code className="block p-2 bg-retro-bg border border-retro-border rounded text-[10px] font-mono text-retro-text/80 truncate">
                        {`<${isAnimatedIcon(selectedIcon) ? 'AnimatedPxlKitIcon' : 'PxlKitIcon'} icon={${toPascal(selectedIcon.name)}} size={32} colorful />`}
                      </code>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {isAnimatedIcon(selectedIcon) ? (
                      <PixelButton
                        onClick={() => downloadAnimSvg(selectedIcon)}
                        size="sm"
                        tone="gold"
                        variant="ghost"
                        className="text-[10px]"
                      >
                        Animated SVG
                      </PixelButton>
                    ) : (
                      <>
                        <PixelButton
                          onClick={() => downloadSvg(selectedIcon, 'colorful')}
                          size="sm"
                          tone="green"
                          variant="ghost"
                          className="text-[10px]"
                        >
                          SVG Color
                        </PixelButton>
                        <PixelButton
                          onClick={() => downloadSvg(selectedIcon, 'monochrome')}
                          size="sm"
                          tone="cyan"
                          variant="ghost"
                          className="text-[10px]"
                        >
                          SVG Mono
                        </PixelButton>
                      </>
                    )}
                    <PixelButton
                      onClick={() =>
                        showToast(
                          'info',
                          toPascal(selectedIcon.name),
                          `Toast preview with ${selectedIcon.name} icon`,
                          selectedIcon
                        )
                      }
                      size="sm"
                      tone="gold"
                      variant="ghost"
                      className="text-[10px]"
                    >
                      Test Toast
                    </PixelButton>
                    <PixelButton
                      onClick={() => {
                        try {
                          localStorage.setItem('pxlkit-builder-incoming', JSON.stringify(selectedIcon));
                        } catch {}
                        router.push('/builder');
                      }}
                      size="sm"
                      tone="purple"
                      variant="ghost"
                      className="text-[10px]"
                    >
                      Edit in Builder
                    </PixelButton>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
