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
import { PixelBadge, PixelButton, PixelCard, PixelChip, PixelChipGroup, PixelIconFrame, PxlKitButton, PixelInput, PixelSlider } from '@pxlkit/ui-kit';
import { FrameworkCode } from '@/components/FrameworkCode';
import { iconExportName, iconUsage } from '@/lib/icon-usage';
// The parallax pack is a plain array of icons, with no pack object to carry its version.
import parallaxPackage from '../../../../../packages/parallax/package.json';

// ─── Registry ───────────────────────────────
const ALL_PACKS: IconPack[] = [GamificationPack, FeedbackPack, SocialPack, WeatherPack, UiPack, EffectsPack];
const TOTAL_COUNT = ALL_PACKS.reduce((s, p) => s + p.icons.length, 0);

// ─── Helpers ────────────────────────────────────
const LIGHT_SWATCH = 'bg-white border-gray-200';

// ─── Page ───────────────────────────────────
export default function IconsPage() {
  const router = useRouter();
  const [selectedIcon, setSelectedIcon] = useState<PxlKitData | AnimatedPxlKitData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePack, setActivePack] = useState<string | null>(null);
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
        <h1 className="font-pixel text-xl text-retro-gold mb-3">PIXEL ART ICONS</h1>
        <p className="text-retro-muted font-mono text-sm">
          {TOTAL_COUNT + ParallaxPack.length} pixel-art icons in {ALL_PACKS.length + 1} packs for React (and, new in 2.2,
          Vue and Angular). Click any icon for its code and SVG.
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-retro-muted/80 font-mono text-xs leading-relaxed">
          Each icon is a 16×16 grid, static or animated, in a themed pack you install from npm and render with{' '}
          <span className="text-retro-cyan">PxlKitIcon</span> from @pxlkit/core — or @pxlkit/vue and @pxlkit/angular.
          Copy the code, download the SVG or open it in the builder. Free with attribution; an Indie or Team license
          removes it.
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
        <PixelChipGroup
          value={[activePack ?? 'all']}
          onChange={(next) => {
            const v = next[0];
            setActivePack(!v || v === 'all' ? null : v);
          }}
          aria-label="Filter icons by pack"
          className="w-full justify-center"
        >
          <PixelChip
            value="all"
            label={`All (${TOTAL_COUNT + ParallaxPack.length})`}
            size="sm"
            tone={!activePack ? 'green' : 'neutral'}
            variant={!activePack ? 'soft' : 'outline'}
          />
          {ALL_PACKS.map((pack) => (
            <PixelChip
              key={pack.id}
              value={pack.id}
              label={`${pack.name} (${pack.icons.length})`}
              size="sm"
              tone={activePack === pack.id ? 'cyan' : 'neutral'}
              variant={activePack === pack.id ? 'soft' : 'outline'}
            />
          ))}
          <PixelChip
            value="parallax"
            label={`3D Parallax (${ParallaxPack.length})`}
            size="sm"
            tone={activePack === 'parallax' ? 'gold' : 'neutral'}
            variant={activePack === 'parallax' ? 'soft' : 'outline'}
          />
        </PixelChipGroup>

        {(query || activePack) && (
          <p className="text-center font-mono text-xs text-retro-muted/70">
            {grandTotal} icon{grandTotal !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* ─── Packs ─── */}
      {filteredPacks.map((pack) => (
        <section key={pack.id} className="mb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
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
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <h2 className="font-pixel text-sm text-retro-gold">3D Parallax Pack</h2>
            <PixelBadge tone="gold" size="sm">
              NEW · INTERACTIVE
            </PixelBadge>
            <span className="text-retro-muted/50 font-mono text-xs">
              {ParallaxPack.length} icon{ParallaxPack.length !== 1 ? 's' : ''}
            </span>
            <span className="text-retro-muted/30 font-mono text-xs">v{parallaxPackage.version}</span>
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
                className="group"
              >
                <PixelCard tone="gold" className="h-full">
                  <div className="flex flex-col items-center gap-2">
                    <ParallaxPxlKitIcon
                      icon={icon}
                      size={64}
                      strength={16}
                      interactive
                      colorful
                    />
                    <span className="font-mono text-[10px] text-retro-muted truncate w-full text-center group-hover:text-retro-gold transition-colors">
                      {icon.name}
                    </span>
                    <span className="font-mono text-[10px] text-retro-gold/50">
                      {icon.layers.length} layers
                    </span>
                  </div>
                </PixelCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg border border-retro-gold/15 bg-retro-surface/20">
            <p className="font-mono text-[10px] text-retro-muted">
              <span className="text-retro-gold">npm i @pxlkit/parallax</span>
              {' · '}
              Uses <span className="text-retro-cyan">ParallaxPxlKitIcon</span> from @pxlkit/core, @pxlkit/vue or{' '}
              @pxlkit/angular (<span className="text-retro-cyan">{'<pxl-parallax-icon>'}</span>)
              {' · '}
              <a href="/docs#parallax-icons" className="inline-flex min-h-6 items-center text-retro-gold hover:underline">View docs →</a>
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
                      <PixelIconFrame
                        size={80}
                        icon={
                          <AnimatedPxlKitIcon
                            icon={selectedIcon}
                            size={56}
                            colorful
                            trigger={animTrigger}
                            speed={animSpeed}
                            playing={animPlaying}
                          />
                        }
                      />
                      <div className={`p-3 rounded-xl border ${LIGHT_SWATCH}`}>
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
                      <PixelIconFrame
                        size={80}
                        icon={<PxlKitIcon icon={selectedIcon} size={56} colorful />}
                      />
                      <div className={`p-3 rounded-xl border ${LIGHT_SWATCH}`}>
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
                          className={`h-auto px-1.5 py-0.5 text-[10px] ${
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
                        className="h-auto px-2 py-0.5 text-[10px]"
                      >
                        {animPlaying ? 'Pause' : 'Play'}
                      </PixelButton>
                      <span className="font-mono text-[10px] text-retro-muted">
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

                  {/* The code, in the framework the reader picked */}
                  <div className="mb-3">
                    <FrameworkCode title="Code" {...iconUsage(selectedIcon)} />
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
                          iconExportName(selectedIcon.name),
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
