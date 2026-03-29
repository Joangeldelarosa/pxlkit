import React, { useEffect, useRef, useCallback } from 'react';
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

/**
 * Renders a multi-layer pixel art icon with mouse-tracking parallax.
 *
 * Each layer in the icon is rendered as a separate SVG and positioned
 * absolutely within a shared container.  As the user moves their mouse,
 * each layer translates by `depth × strength` pixels, creating a 3D
 * parallax effect.
 *
 * - Layers with `depth > 0` move *with* the mouse (background feel).
 * - Layers with `depth < 0` move *opposite* to the mouse (foreground pop).
 * - Layers with `depth === 0` remain stationary (anchor).
 *
 * The component uses `requestAnimationFrame` for smooth frame-rate-adaptive
 * updates and a configurable lerp `smoothing` factor for fluid motion.
 *
 * @example
 * ```tsx
 * import { ParallaxPxlKitIcon } from '@pxlkit/core';
 * import { CoolEmoji } from './icons/cool-emoji';
 *
 * <ParallaxPxlKitIcon icon={CoolEmoji} size={128} strength={12} />
 * ```
 */
export function ParallaxPxlKitIcon({
  icon,
  size = 64,
  strength = 8,
  colorful = true,
  smoothing = 0.08,
  className = '',
  style,
  'aria-label': ariaLabel,
}: ParallaxPxlKitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef<{ x: number; y: number }[]>(
    icon.layers.map(() => ({ x: 0, y: 0 })),
  );
  const targetRef = useRef<{ x: number; y: number }[]>(
    icon.layers.map(() => ({ x: 0, y: 0 })),
  );
  const rafRef = useRef(0);

  const setLayerRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      layerRefs.current[index] = el;
    },
    [],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Reset refs when layers change
    posRef.current = icon.layers.map(() => ({ x: 0, y: 0 }));
    targetRef.current = icon.layers.map(() => ({ x: 0, y: 0 }));

    function handleMouse(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      // Normalize mouse position to -1..1 relative to container center
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      icon.layers.forEach((layer, i) => {
        targetRef.current[i] = {
          x: nx * strength * layer.depth,
          y: ny * strength * layer.depth,
        };
      });
    }

    function handleMouseLeave() {
      // Smoothly return to center when mouse leaves
      icon.layers.forEach((_, i) => {
        targetRef.current[i] = { x: 0, y: 0 };
      });
    }

    function animate() {
      const layers = layerRefs.current;
      icon.layers.forEach((layer, i) => {
        const pos = posRef.current[i];
        const tgt = targetRef.current[i];
        pos.x += (tgt.x - pos.x) * smoothing;
        pos.y += (tgt.y - pos.y) * smoothing;

        const layerEl = layers[i];
        if (layerEl) {
          const ox = (layer.offsetX ?? 0) * (size / icon.size);
          const oy = (layer.offsetY ?? 0) * (size / icon.size);
          layerEl.style.transform = `translate3d(${pos.x + ox}px, ${pos.y + oy}px, 0)`;
        }
      });
      rafRef.current = requestAnimationFrame(animate);
    }

    el.addEventListener('mousemove', handleMouse);
    el.addEventListener('mouseleave', handleMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      el.removeEventListener('mousemove', handleMouse);
      el.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [icon, size, strength, smoothing]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      role="img"
      aria-label={ariaLabel || icon.name}
    >
      {icon.layers.map((layer, i) => (
        <div
          key={`${icon.name}-layer-${i}`}
          ref={setLayerRef(i)}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            willChange: 'transform',
            pointerEvents: 'none',
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
      ))}
    </div>
  );
}
