import React, { useEffect, useRef, useState } from 'react';
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

/**
 * Renders a multi-layer pixel art icon with true CSS 3D parallax.
 *
 * The component creates a real 3D scene using CSS `perspective`.  Each layer
 * is placed at a different `translateZ` depth so they are physically separated
 * in 3D space.  As the user moves their mouse, the whole scene rotates via
 * `rotateX` / `rotateY`, revealing the depth separation between layers.
 *
 * **How it works:**
 * 1. The outer container sets `perspective` (camera distance).
 * 2. An inner "scene" div preserves 3D children (`transform-style: preserve-3d`).
 * 3. The scene rotates based on normalized mouse position (smooth lerp).
 * 4. Each layer lives at `translateZ(depth × layerGap)` — front layers have
 *    positive Z (closer), back layers have negative Z (farther).
 * 5. Optional soft `box-shadow` on each layer enhances depth perception.
 * 6. On mount, layers animate from `translateZ(0)` to their final depths
 *    (a "peel-apart" intro effect).
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
  perspective: perspectiveProp,
  layerGap: layerGapProp,
  shadow = true,
  className = '',
  style,
  'aria-label': ariaLabel,
}: ParallaxPxlKitProps) {
  // Derive sensible defaults from size
  const perspective = perspectiveProp ?? size * 4;
  const layerGap = layerGapProp ?? Math.max(8, size * 0.12);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  // Current & target rotation (degrees)
  const rotRef = useRef({ x: 0, y: 0 });
  const targetRotRef = useRef({ x: 0, y: 0 });

  // Intro animation progress (0 = flat, 1 = fully spread)
  const [introProgress, setIntroProgress] = useState(0);
  const introRef = useRef(0); // 0..1
  const introStartRef = useRef(0);

  // Max tilt angle in degrees — derived from strength
  const maxTilt = clamp(strength * 1.5, 2, 35);

  useEffect(() => {
    const container = containerRef.current;
    const scene = sceneRef.current;
    if (!container || !scene) return;

    rotRef.current = { x: 0, y: 0 };
    targetRotRef.current = { x: 0, y: 0 };
    introRef.current = 0;
    introStartRef.current = performance.now();

    function handleMouse(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      // Normalize to -1..1
      const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      // rotateY follows horizontal mouse, rotateX follows vertical (inverted)
      targetRotRef.current = {
        x: -ny * maxTilt,
        y: nx * maxTilt,
      };
    }

    function handleMouseLeave() {
      targetRotRef.current = { x: 0, y: 0 };
    }

    const INTRO_DURATION = 600; // ms

    function animate(now: number) {
      // Intro ease-out
      const elapsed = now - introStartRef.current;
      const t = clamp(elapsed / INTRO_DURATION, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      introRef.current = eased;
      if (t < 1) {
        setIntroProgress(eased);
      } else {
        setIntroProgress(1);
      }

      // Smooth lerp rotation
      const rot = rotRef.current;
      const tgt = targetRotRef.current;
      rot.x += (tgt.x - rot.x) * smoothing;
      rot.y += (tgt.y - rot.y) * smoothing;

      // Apply rotation to the scene
      if (scene) {
        scene.style.transform =
          `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    container.addEventListener('mousemove', handleMouse);
    container.addEventListener('mouseleave', handleMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener('mousemove', handleMouse);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [icon, size, strength, smoothing, maxTilt]);

  // Compute Z position for each layer.
  // Layers are ordered back-to-front.  We distribute them so the middle
  // layer is at Z=0, back layers at negative Z, front at positive Z.
  const layerCount = icon.layers.length;
  const midIndex = (layerCount - 1) / 2;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        perspective: perspective,
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
        }}
      >
        {icon.layers.map((layer, i) => {
          // Z offset: first layer (back) is negative, last (front) is positive
          const zNorm = i - midIndex; // e.g. for 3 layers: -1, 0, 1
          const zFinal = zNorm * layerGap;
          const zCurrent = zFinal * introProgress;

          // Soft shadow: layers closer to viewer cast shadow on layers behind.
          // Shadow intensity and offset based on distance from back.
          const shadowStyle: React.CSSProperties = {};
          if (shadow && i > 0) {
            const shadowDepth = Math.abs(zNorm) * 2;
            const shadowBlur = Math.max(3, layerGap * 0.5);
            shadowStyle.filter =
              `drop-shadow(0px ${shadowDepth}px ${shadowBlur}px rgba(0,0,0,0.25))`;
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
    </div>
  );
}
