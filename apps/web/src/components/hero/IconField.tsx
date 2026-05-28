'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PxlKitIcon,
  AnimatedPxlKitIcon,
  isAnimatedIcon,
  type PxlKitData,
  type AnimatedPxlKitData,
} from '@pxlkit/core';
import { useMouse } from './mouseContext';
import { ALL_ICONS, shuffle } from './iconPool';
import { useReducedMotion } from './useReducedMotion';

export type Layer = {
  z: number;
  share: number;
  scale: number;
  blur: number;
  opacity: number;
  parallaxFactor: number;
};

export const LAYERS: Layer[] = [
  { z: -200, share: 0.34, scale: 0.55, blur: 2, opacity: 0.35, parallaxFactor: 8 },
  { z: -50, share: 0.42, scale: 0.85, blur: 0.5, opacity: 0.7, parallaxFactor: 18 },
  { z: 50, share: 0.24, scale: 1.1, blur: 0, opacity: 1.0, parallaxFactor: 30 },
];

type FloatingIcon = {
  id: number;
  layerIdx: 0 | 1 | 2;
  icon: PxlKitData | AnimatedPxlKitData;
  isAnimated: boolean;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
  bornAt: number;
  diesAt: number | null;
  spring: number;
  damping: number;
  /** Direction icon flies as the user scrolls past the hero (radians, 0..2π). */
  explodeAngle: number;
  /** Distance multiplier for scroll-explosion (1.0 = near, 2.5 = far). */
  explodeMagnitude: number;
  /** Scale-on-scroll factor (negative = shrink, positive = zoom in). */
  explodeZoomFactor: number;
};

const SIZES_FAR = [22, 26, 30];
const SIZES_MID = [28, 32, 36, 40];
const SIZES_NEAR = [40, 48, 56, 64];

function sizesFor(li: 0 | 1 | 2): number[] {
  return li === 0 ? SIZES_FAR : li === 2 ? SIZES_NEAR : SIZES_MID;
}

function buildIcons(density: number, width: number, height: number): FloatingIcon[] {
  const pool = shuffle(ALL_ICONS);
  const icons: FloatingIcon[] = [];
  let id = 0;
  for (let li = 0; li < LAYERS.length; li++) {
    const layer = LAYERS[li];
    const count = Math.round(density * layer.share);
    for (let i = 0; i < count; i++) {
      const ic = pool[id % pool.length];
      const x = Math.random() * width;
      const y = Math.random() * height;
      const sizes = sizesFor(li as 0 | 1 | 2);
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      icons.push({
        id,
        layerIdx: li as 0 | 1 | 2,
        icon: ic,
        isAnimated: isAnimatedIcon(ic),
        baseX: x,
        baseY: y,
        x,
        y,
        vx: 0,
        vy: 0,
        rotation: (Math.random() - 0.5) * 30,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
        size,
        opacity: layer.opacity,
        bornAt: Date.now(),
        diesAt: null,
        spring: 0.02,
        damping: 0.92,
        explodeAngle: Math.random() * Math.PI * 2,
        explodeMagnitude: 1 + Math.random() * 1.5,
        explodeZoomFactor: -0.5 + Math.random() * 3.5,
      });
      id += 1;
    }
  }
  return icons;
}

const REPULSE_RADIUS_BASE = 130;
const REPULSE_STRENGTH_BASE = 14;
const RAF_IDLE_TIMEOUT = 6000;
export const SPAWN_INTERVAL = 2500;
export const FADE_MS = 1000;

/**
 * Marks one random "alive" (diesAt === null) icon to die in FADE_MS, if
 * SPAWN_INTERVAL has elapsed since the last spawn. Pure function for testing.
 */
export function spawnTick(
  icons: { id: number; opacity: number; diesAt: number | null; bornAt: number }[],
  state: { lastSpawnAt: number },
  now: number,
): void {
  if (now - state.lastSpawnAt < SPAWN_INTERVAL) return;
  const candidates = icons.filter((i) => i.diesAt === null);
  if (candidates.length === 0) return;
  const victim = candidates[Math.floor(Math.random() * candidates.length)];
  victim.diesAt = now + FADE_MS;
  state.lastSpawnAt = now;
}

import { pickRandom } from './iconPool';

/**
 * Updates opacity per-icon based on fade-in/fade-out age, and replaces icons
 * whose diesAt has passed with a fresh icon at a new random base position.
 */
export function respawnTick(
  icons: FloatingIcon[],
  width: number,
  height: number,
  now: number,
): void {
  for (const ic of icons) {
    if (ic.diesAt && now >= ic.diesAt) {
      const fresh = pickRandom();
      ic.icon = fresh.icon;
      ic.isAnimated = fresh.isAnimated;
      ic.baseX = Math.random() * width;
      ic.baseY = Math.random() * height;
      ic.x = ic.baseX;
      ic.y = ic.baseY;
      ic.vx = 0;
      ic.vy = 0;
      ic.rotation = (Math.random() - 0.5) * 30;
      ic.bornAt = now;
      ic.diesAt = null;
    }
    const layer = LAYERS[ic.layerIdx];
    const ageIn = Math.min(1, (now - ic.bornAt) / FADE_MS);
    const ageOut = ic.diesAt ? Math.max(0, 1 - (ic.diesAt - now) / FADE_MS) : 0;
    ic.opacity = Math.max(0, layer.opacity * ageIn * (1 - ageOut));
  }
}

export function IconField({
  density = 48,
  freeze = false,
}: {
  density?: number;
  freeze?: boolean;
}) {
  const { mouseRef, active, containerRef } = useMouse();
  const reduced = useReducedMotion();
  const effectiveFreeze = freeze || reduced;
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const iconsRef = useRef<FloatingIcon[]>([]);
  const rafRef = useRef<number>(0);
  const idleSinceRef = useRef<number>(Date.now());
  const rootElRef = useRef<HTMLDivElement | null>(null);
  const spawnStateRef = useRef<{ lastSpawnAt: number }>({ lastSpawnAt: Date.now() });
  /** Scroll-explosion progress, 0 = hero in view, 1+ = scrolled past. */
  const scrollProgressRef = useRef<number>(0);
  /** Ref-stored loop kick — scroll listener uses this to wake a paused RAF. */
  const wakeRef = useRef<() => void>(() => {});
  /** Cached element lists and id→icon map — rebuilt only when icons change. */
  const iconElsRef = useRef<HTMLElement[]>([]);
  const layerElsRef = useRef<HTMLElement[]>([]);
  const iconByIdRef = useRef<Map<number, FloatingIcon>>(new Map());

  // Measure scope (the MouseProvider wrapper, which wraps the <section>)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  // Build icons when size is known
  const initialIcons = useMemo(() => {
    if (!size) return [];
    return buildIcons(density, size.w, size.h);
  }, [density, size]);

  useEffect(() => {
    iconsRef.current = [...initialIcons];
    // Rebuild lookup map (id is stable per FloatingIcon instance).
    iconByIdRef.current = new Map(iconsRef.current.map((ic) => [ic.id, ic]));
    // Cache DOM element lists — they only change when initialIcons rebuilds.
    if (rootElRef.current) {
      iconElsRef.current = Array.from(
        rootElRef.current.querySelectorAll<HTMLElement>('[data-fi-id]'),
      );
      layerElsRef.current = Array.from(
        rootElRef.current.querySelectorAll<HTMLElement>('[data-layer]'),
      );
    }
  }, [initialIcons]);

  // Physics loop
  useEffect(() => {
    if (!size || effectiveFreeze) return;
    let cancelled = false;

    const loop = () => {
      if (cancelled) return;
      const now = Date.now();
      const arr = iconsRef.current;
      const w = size.w;
      const h = size.h;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mAbsX = (mx + 1) * 0.5 * w;
      const mAbsY = (my + 1) * 0.5 * h;

      let anyMoving = false;
      for (const ic of arr) {
        const layer = LAYERS[ic.layerIdx];
        if (active) {
          const dx = ic.x - mAbsX;
          const dy = ic.y - mAbsY;
          const dist = Math.hypot(dx, dy);
          const radius = REPULSE_RADIUS_BASE * (layer.parallaxFactor / 30);
          const strength = REPULSE_STRENGTH_BASE * (layer.parallaxFactor / 30);
          if (dist < radius && dist > 0) {
            const force = (1 - dist / radius) * strength;
            ic.vx += (dx / dist) * force;
            ic.vy += (dy / dist) * force;
          }
        }
        ic.vx += (ic.baseX - ic.x) * ic.spring;
        ic.vy += (ic.baseY - ic.y) * ic.spring;
        ic.vx *= ic.damping;
        ic.vy *= ic.damping;
        ic.x += ic.vx;
        ic.y += ic.vy;
        ic.rotation += ic.rotationSpeed + ic.vx * 0.3;
        if (Math.abs(ic.vx) > 0.05 || Math.abs(ic.vy) > 0.05) anyMoving = true;
      }

      const sp = scrollProgressRef.current;
      if (active || anyMoving || sp > 0.001) idleSinceRef.current = now;

      // Spawn-trickle + fade-in/out + respawn (skip while scrolled past
      // the hero — no point re-seeding icons the user can't see)
      if (sp < 0.5) {
        spawnTick(arr, spawnStateRef.current, now);
        respawnTick(arr, w, h, now);
      }

      // Per-layer parallax wrapper transforms (cached list — no DOM queries per frame)
      const layerEls = layerElsRef.current;
      for (let li = 0; li < layerEls.length; li++) {
        const el = layerEls[li];
        const layer = LAYERS[li];
        if (!layer) continue;
        const px = mouseRef.current.x * layer.parallaxFactor;
        const py = mouseRef.current.y * layer.parallaxFactor;
        el.style.transform = `translate3d(${px}px, ${py}px, ${layer.z}px)`;
      }

      // Per-icon position / rotation / opacity — adds scroll-explosion
      // displacement, zoom and fade-out on top of physics state.
      const EXPLODE_DIST = 900; // px at sp=1
      const iconEls = iconElsRef.current;
      const iconById = iconByIdRef.current;
      for (let i = 0; i < iconEls.length; i++) {
        const el = iconEls[i];
        const id = Number(el.dataset.fiId);
        const ic = iconById.get(id);
        if (!ic) continue;

        let drawX = ic.x;
        let drawY = ic.y;
        const layer = LAYERS[ic.layerIdx];
        let scale = layer.scale;
        let opacity = ic.opacity;

        if (sp > 0) {
          drawX += Math.cos(ic.explodeAngle) * ic.explodeMagnitude * EXPLODE_DIST * sp;
          drawY += Math.sin(ic.explodeAngle) * ic.explodeMagnitude * EXPLODE_DIST * sp;
          scale = scale * Math.max(0.05, 1 + ic.explodeZoomFactor * sp);
          opacity = opacity * Math.max(0, 1 - sp * 1.1);
        }

        const style = el.style;
        style.left = `${drawX - ic.size / 2}px`;
        style.top = `${drawY - ic.size / 2}px`;
        style.transform = `scale(${scale}) rotate(${ic.rotation}deg)`;
        style.opacity = `${opacity}`;
      }

      if (now - idleSinceRef.current < RAF_IDLE_TIMEOUT) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        rafRef.current = 0;
      }
    };

    // expose a wake-up the scroll listener can call when RAF is paused
    wakeRef.current = () => {
      if (cancelled || rafRef.current) return;
      idleSinceRef.current = Date.now();
      rafRef.current = requestAnimationFrame(loop);
    };

    idleSinceRef.current = Date.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      wakeRef.current = () => {};
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [size, active, mouseRef, effectiveFreeze]);

  // Scroll listener — updates scrollProgressRef and wakes the RAF if paused.
  // Passive listener so it never blocks scrolling.
  useEffect(() => {
    if (effectiveFreeze) {
      scrollProgressRef.current = 0;
      return;
    }
    const compute = () => {
      const heroH = window.innerHeight * 0.9; // matches min-h-[90vh]
      const p = Math.min(1.5, Math.max(0, window.scrollY / heroH));
      scrollProgressRef.current = p;
      if (p > 0.001) wakeRef.current();
    };
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    return () => window.removeEventListener('scroll', compute);
  }, [effectiveFreeze]);

  if (!size) return null;

  return (
    <div
      ref={rootElRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
    >
      {LAYERS.map((layer, li) => (
        <div
          key={li}
          data-layer={li}
          className="absolute inset-0"
          style={{
            transform: `translateZ(${layer.z}px)`,
            transformStyle: 'preserve-3d',
            filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
          }}
        >
          {initialIcons
            .filter((i) => i.layerIdx === li)
            .map((fi) => (
              <div
                key={fi.id}
                data-fi-id={fi.id}
                className="absolute will-change-transform"
                style={{
                  left: fi.x - fi.size / 2,
                  top: fi.y - fi.size / 2,
                  width: fi.size,
                  height: fi.size,
                  opacity: fi.opacity,
                  transform: `scale(${layer.scale}) rotate(${fi.rotation}deg)`,
                }}
              >
                {fi.isAnimated ? (
                  <AnimatedPxlKitIcon icon={fi.icon as AnimatedPxlKitData} size={fi.size} colorful />
                ) : (
                  <PxlKitIcon icon={fi.icon as PxlKitData} size={fi.size} colorful />
                )}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
