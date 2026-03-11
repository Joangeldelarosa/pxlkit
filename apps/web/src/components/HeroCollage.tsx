'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from '@pxlkit/core';
import type { PxlKitData, AnimatedPxlKitData, AnyIcon } from '@pxlkit/core';
import { GamificationPack } from '@pxlkit/gamification';
import { FeedbackPack } from '@pxlkit/feedback';
import { SocialPack } from '@pxlkit/social';
import { WeatherPack } from '@pxlkit/weather';
import { EffectsPack } from '@pxlkit/effects';
import { UiPack } from '@pxlkit/ui';

/* ── Gather ALL icons ── */
const ALL_ICONS: AnyIcon[] = [
  ...GamificationPack.icons,
  ...FeedbackPack.icons,
  ...SocialPack.icons,
  ...WeatherPack.icons,
  ...UiPack.icons,
  ...EffectsPack.icons,
];

const TOTAL_ICON_COUNT = ALL_ICONS.length;

/* ── Types ── */
interface FloatingIcon {
  id: number;
  icon: PxlKitData | AnimatedPxlKitData;
  isAnimated: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  scale: number;
  /** spring constant — how strongly it returns home */
  spring: number;
  /** damping */
  damping: number;
}

/* ── Helpers ── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ── Constants ── */
const ICON_COUNT = 50; // how many icons float around
const REPULSE_RADIUS = 130; // px
const REPULSE_STRENGTH = 12;
const RETURN_SPRING = 0.02;
const DAMPING = 0.92;

/* ══════════════════════════════════════════════════
 *  HeroCollage — Interactive floating icon field
 * ══════════════════════════════════════════════════ */
export function HeroCollage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<FloatingIcon[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number>(0);
  const [, forceRender] = useState(0);
  const initializedRef = useRef(false);

  /* ── Build the icon pool once ── */
  const iconPool = useMemo(() => {
    const combined = ALL_ICONS.map((icon) => ({
      icon,
      isAnimated: isAnimatedIcon(icon),
    }));
    const shuffled = shuffle(combined);
    // Repeat to fill ICON_COUNT
    const pool: typeof combined = [];
    while (pool.length < ICON_COUNT) {
      pool.push(...shuffled);
    }
    return pool.slice(0, ICON_COUNT);
  }, []);

  /* ── Initialize positions ── */
  const initIcons = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();

    const icons: FloatingIcon[] = iconPool.map((item, i) => {
      const sizes = [28, 32, 36, 40, 44, 48];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const pad = size;
      const x = pad + Math.random() * (width - pad * 2);
      const y = pad + Math.random() * (height - pad * 2);
      return {
        id: i,
        icon: item.icon,
        isAnimated: item.isAnimated,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        baseX: x,
        baseY: y,
        size,
        rotation: Math.random() * 30 - 15,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        opacity: 0.35 + Math.random() * 0.45,
        scale: 1,
        spring: RETURN_SPRING + Math.random() * 0.01,
        damping: DAMPING + Math.random() * 0.03,
      };
    });

    iconsRef.current = icons;
  }, [iconPool]);

  /* ── Physics loop ── */
  const tick = useCallback(function tickFunc() {
    const icons = iconsRef.current;
    const mouse = mouseRef.current;
    const el = containerRef.current;
    if (!el || icons.length === 0) {
      rafRef.current = requestAnimationFrame(tickFunc);
      return;
    }

    const { width, height } = el.getBoundingClientRect();

    for (const icon of icons) {
      // Mouse repulsion
      if (mouse.active) {
        const dx = icon.x - mouse.x;
        const dy = icon.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPULSE_RADIUS && dist > 0) {
          const force = (1 - dist / REPULSE_RADIUS) * REPULSE_STRENGTH;
          icon.vx += (dx / dist) * force;
          icon.vy += (dy / dist) * force;
          // scale up when close to cursor
          icon.scale = lerp(icon.scale, 1.25, 0.1);
          icon.opacity = Math.min(1, icon.opacity + 0.02);
        } else {
          icon.scale = lerp(icon.scale, 1, 0.05);
        }
      } else {
        icon.scale = lerp(icon.scale, 1, 0.05);
      }

      // Spring back to base position
      const dx = icon.baseX - icon.x;
      const dy = icon.baseY - icon.y;
      icon.vx += dx * icon.spring;
      icon.vy += dy * icon.spring;

      // Apply damping
      icon.vx *= icon.damping;
      icon.vy *= icon.damping;

      // Integrate
      icon.x += icon.vx;
      icon.y += icon.vy;

      // Soft bounds
      const pad = icon.size / 2;
      if (icon.x < pad) { icon.x = pad; icon.vx *= -0.5; }
      if (icon.x > width - pad) { icon.x = width - pad; icon.vx *= -0.5; }
      if (icon.y < pad) { icon.y = pad; icon.vy *= -0.5; }
      if (icon.y > height - pad) { icon.y = height - pad; icon.vy *= -0.5; }

      // Rotation drift
      icon.rotation += icon.rotationSpeed + icon.vx * 0.3;
    }

    forceRender((n) => n + 1);
    rafRef.current = requestAnimationFrame(tickFunc);
  }, []);

  /* ── Mouse tracking (relative to container) ── */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  /* ── Lifecycle ── */
  useEffect(() => {
    if (!initializedRef.current) {
      initIcons();
      initializedRef.current = true;
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [initIcons, tick]);

  // Re-layout on resize
  useEffect(() => {
    const onResize = () => {
      initializedRef.current = false;
      initIcons();
      initializedRef.current = true;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [initIcons]);

  const icons = iconsRef.current;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 overflow-hidden pointer-events-auto"
      style={{ cursor: 'crosshair' }}
    >
      {icons.map((fi) => {
        const isAnim = fi.isAnimated;
        return (
          <div
            key={fi.id}
            className="absolute will-change-transform"
            style={{
              left: fi.x - fi.size / 2,
              top: fi.y - fi.size / 2,
              width: fi.size,
              height: fi.size,
              opacity: fi.opacity,
              transform: `scale(${fi.scale}) rotate(${fi.rotation}deg)`,
              transition: 'opacity 0.3s ease',
              filter: fi.scale > 1.1 ? `drop-shadow(0 0 8px rgba(var(--retro-green), 0.5))` : 'none',
            }}
          >
            {isAnim ? (
              <AnimatedPxlKitIcon
                icon={fi.icon as AnimatedPxlKitData}
                size={fi.size}
                colorful
              />
            ) : (
              <PxlKitIcon
                icon={fi.icon as PxlKitData}
                size={fi.size}
                colorful
              />
            )}
          </div>
        );
      })}

      {/* Radial gradient vignette on edges */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-retro-bg via-transparent to-retro-bg" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-retro-bg via-transparent to-retro-bg opacity-60" />
    </div>
  );
}

/* ── Animated counter ── */
export function IconCounter() {
  const [count, setCount] = useState(0);
  const targetRef = useRef(TOTAL_ICON_COUNT);

  useEffect(() => {
    const duration = 2000; // ms
    const start = performance.now();
    const target = targetRef.current;
    let raf: number;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span className="tabular-nums font-pixel">{count}</span>
  );
}

export { TOTAL_ICON_COUNT };
