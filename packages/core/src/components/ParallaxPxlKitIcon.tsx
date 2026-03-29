import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ParallaxPxlKitProps } from '../types';
import { PxlKitIcon } from './PxlKitIcon';
import { AnimatedPxlKitIcon } from './AnimatedPxlKitIcon';

/**
 * Returns `true` when the icon data contains animation frames.
 */
function hasFrames(
  icon: import('../types').PxlKitData | import('../types').AnimatedPxlKitData,
): icon is import('../types').AnimatedPxlKitData {
  return 'frames' in icon;
}

/** Clamp a value between min and max. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Simple seeded random for deterministic particle colors. */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Extract palette colors from all layers for particle generation. */
function extractColors(icon: import('../types').ParallaxPxlKitData): string[] {
  const colors = new Set<string>();
  for (const layer of icon.layers) {
    const pal = hasFrames(layer.icon) ? layer.icon.palette : layer.icon.palette;
    for (const c of Object.values(pal)) colors.add(c);
  }
  return Array.from(colors);
}

/** A single pixel particle. */
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;   // 0..1 remaining
  size: number;
  z: number;       // layer depth for 3D placement
}

/**
 * Renders a multi-layer pixel art icon with true CSS 3D parallax
 * and interactive click effects.
 *
 * **3D Rendering:**
 * - CSS `perspective` + `preserve-3d` + per-layer `translateZ`
 * - Page-wide mouse tracking for `rotateX`/`rotateY` scene rotation
 * - Peel-apart intro animation on mount
 * - Soft depth shadows between layers
 *
 * **Click Interactions (when `interactive` is true):**
 * - Layers explode apart (increased Z separation)
 * - Random rotation jolt
 * - Pixel particles burst from the icon center
 * - Toggled `active` state with color hue-shift
 * - Smooth spring-back animation
 *
 * Mouse tracking is **page-wide** — the icon reacts to cursor movement
 * across the entire viewport.
 *
 * @example
 * ```tsx
 * <ParallaxPxlKitIcon
 *   icon={CoolEmoji}
 *   size={128}
 *   strength={20}
 *   interactive
 *   onActivate={(active) => console.log('active:', active)}
 * />
 * ```
 */
export function ParallaxPxlKitIcon({
  icon,
  size = 64,
  strength = 18,
  colorful = true,
  smoothing = 0.06,
  perspective: perspectiveProp,
  layerGap: layerGapProp,
  shadow = true,
  interactive = true,
  onActivate,
  className = '',
  style,
  'aria-label': ariaLabel,
}: ParallaxPxlKitProps) {
  // Derive sensible defaults — dramatic 3D
  const perspective = perspectiveProp ?? Math.max(200, size * 2.5);
  const layerGap = layerGapProp ?? Math.max(12, size * 0.2);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  // Current & target rotation (degrees)
  const rotRef = useRef({ x: 0, y: 0 });
  const targetRotRef = useRef({ x: 0, y: 0 });

  // Intro animation progress (0 = flat, 1 = fully spread)
  const [introProgress, setIntroProgress] = useState(0);
  const introRef = useRef(0);
  const introStartRef = useRef(0);

  // Click interaction state
  const [active, setActive] = useState(false);
  const clickBurstRef = useRef(0); // 0..1, decays back
  const clickJoltRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const nextParticleId = useRef(0);
  const paletteColors = useRef(extractColors(icon));

  // Max tilt angle — dramatic range
  const maxTilt = clamp(strength * 2, 4, 45);

  // Handle click
  const handleClick = useCallback(() => {
    if (!interactive) return;
    const newActive = !active;
    setActive(newActive);
    onActivate?.(newActive);

    // Burst layers apart
    clickBurstRef.current = 1;

    // Random rotation jolt
    clickJoltRef.current = {
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 30,
    };

    // Spawn pixel particles
    const colors = paletteColors.current;
    const particleCount = Math.max(6, Math.floor(size / 8));
    const half = size / 2;
    for (let p = 0; p < particleCount; p++) {
      const angle = (Math.PI * 2 * p) / particleCount + (Math.random() - 0.5) * 0.8;
      const speed = 1 + Math.random() * 3;
      particlesRef.current.push({
        id: nextParticleId.current++,
        x: half,
        y: half,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)] || '#FFD700',
        life: 1,
        size: Math.max(2, size / 16),
        z: (Math.random() - 0.5) * layerGap * 2,
      });
    }
  }, [active, interactive, onActivate, size, layerGap]);

  useEffect(() => {
    paletteColors.current = extractColors(icon);
  }, [icon]);

  useEffect(() => {
    const container = containerRef.current;
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (!container || !scene) return;

    rotRef.current = { x: 0, y: 0 };
    targetRotRef.current = { x: 0, y: 0 };
    introRef.current = 0;
    introStartRef.current = performance.now();

    function handleMouse(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const radius = Math.max(window.innerWidth, window.innerHeight) * 0.5;
      const nx = clamp((e.clientX - cx) / radius, -1, 1);
      const ny = clamp((e.clientY - cy) / radius, -1, 1);
      targetRotRef.current = {
        x: -ny * maxTilt,
        y: nx * maxTilt,
      };
    }

    const INTRO_DURATION = 700;

    function animate(now: number) {
      // Intro ease-out
      const elapsed = now - introStartRef.current;
      const t = clamp(elapsed / INTRO_DURATION, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      introRef.current = eased;
      if (t < 1) {
        setIntroProgress(eased);
      } else {
        setIntroProgress(1);
      }

      // Decay click burst
      if (clickBurstRef.current > 0.01) {
        clickBurstRef.current *= 0.92;
      } else {
        clickBurstRef.current = 0;
      }

      // Decay click jolt
      clickJoltRef.current.x *= 0.9;
      clickJoltRef.current.y *= 0.9;

      // Smooth lerp rotation + jolt
      const rot = rotRef.current;
      const tgt = targetRotRef.current;
      rot.x += (tgt.x + clickJoltRef.current.x - rot.x) * smoothing;
      rot.y += (tgt.y + clickJoltRef.current.y - rot.y) * smoothing;

      if (scene) {
        scene.style.transform =
          `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;
      }

      // Update particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Draw particles on canvas
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, size, size);
          for (const p of particles) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(
              Math.round(p.x - p.size / 2),
              Math.round(p.y - p.size / 2),
              p.size,
              p.size,
            );
          }
          ctx.globalAlpha = 1;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', handleMouse);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(rafRef.current);
    };
  }, [icon, size, strength, smoothing, maxTilt]);

  const layerCount = icon.layers.length;
  const midIndex = (layerCount - 1) / 2;

  // Click burst multiplier for Z spread
  const burstMultiplier = 1 + clickBurstRef.current * 1.8;

  // Hue rotation on active state
  const activeFilter = active ? 'hue-rotate(30deg) saturate(1.3)' : '';

  return (
    <div
      ref={containerRef}
      className={className}
      onClick={interactive ? handleClick : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        perspective: perspective,
        cursor: interactive ? 'pointer' : undefined,
        ...style,
      }}
      role="img"
      aria-label={ariaLabel || icon.name}
    >
      {/* 3D scene — rotates as a whole */}
      <div
        ref={sceneRef}
        style={{
          position: 'relative',
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          transition: active ? 'filter 0.3s ease' : 'filter 0.6s ease',
          filter: activeFilter || undefined,
        }}
      >
        {icon.layers.map((layer, i) => {
          const zNorm = i - midIndex;
          const zFinal = zNorm * layerGap * burstMultiplier;
          const zCurrent = zFinal * introProgress;

          const shadowStyle: React.CSSProperties = {};
          if (shadow && i > 0) {
            const shadowDepth = Math.abs(zNorm) * 3;
            const shadowBlur = Math.max(4, layerGap * 0.6);
            shadowStyle.filter =
              `drop-shadow(0px ${shadowDepth}px ${shadowBlur}px rgba(0,0,0,0.3))`;
          }

          return (
            <div
              key={`${icon.name}-layer-${i}`}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translateZ(${zCurrent}px)`,
                willChange: 'transform',
                pointerEvents: 'none',
                ...shadowStyle,
              }}
            >
              {hasFrames(layer.icon) ? (
                <AnimatedPxlKitIcon
                  icon={layer.icon}
                  size={size}
                  colorful={colorful}
                />
              ) : (
                <PxlKitIcon
                  icon={layer.icon}
                  size={size}
                  colorful={colorful}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Particle canvas overlay */}
      {interactive && (
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            imageRendering: 'pixelated',
          }}
        />
      )}
    </div>
  );
}
