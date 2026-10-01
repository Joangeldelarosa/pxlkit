import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { ParallaxPxlKitProps } from './types';
import { isAnimatedIcon } from '../guards';
import { resolveIconLabel } from '../engine/icon';
import {
  PARALLAX_CANVAS_STYLE,
  createParallaxController,
  parallaxContainerStyle,
  parallaxLayerStyle,
  parallaxSceneStyle,
  resolveParallaxGeometry,
} from '../engine/parallax';
import { PxlKitIcon } from './PxlKitIcon';
import { AnimatedPxlKitIcon } from './AnimatedPxlKitIcon';
import { resolveColorProps } from './_internal/resolveColorProps';
import { useIsomorphicLayoutEffect } from './_internal/useIsomorphicLayoutEffect';

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
 * The motion runs in the framework-agnostic controller
 * (`createParallaxController` in `@pxlkit/core/vanilla`, shared with
 * `@pxlkit/vue` and `@pxlkit/angular`), which writes the per-frame
 * transforms straight to the DOM — React does not re-render while it animates.
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
  appearance: appearanceProp,
  color: colorProp,
  smoothing = 0.06,
  perspective: perspectiveProp,
  layerGap: layerGapProp,
  shadow = true,
  interactive = true,
  onActivate,
  className = '',
  style,
  'aria-label': ariaLabel,
  // Deprecated legacy props — resolved into `appearance` below.
  colorful,
  solid,
  tint,
}: ParallaxPxlKitProps) {
  const { appearance, color } = resolveColorProps({
    appearance: appearanceProp,
    color: colorProp,
    colorful,
    solid,
    tint,
  });
  const { perspective, layerGap } = resolveParallaxGeometry(size, {
    perspective: perspectiveProp,
    layerGap: layerGapProp,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controller] = useState(() =>
    createParallaxController({ icon, size, strength, smoothing, layerGap }),
  );
  const [active, setActive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    controller.update({ icon, size, strength, smoothing, layerGap });
  }, [controller, icon, size, strength, smoothing, layerGap]);

  useEffect(() => {
    const container = containerRef.current;
    const scene = sceneRef.current;
    if (!container || !scene) return;
    controller.connect({ container, scene, canvas: canvasRef.current });
    return () => controller.disconnect();
  }, [controller]);

  // The particle canvas only exists while `interactive` is on.
  useEffect(() => {
    controller.setCanvas(canvasRef.current);
  }, [controller, interactive]);

  const handleClick = useCallback(() => {
    const next = !active;
    setActive(next);
    onActivate?.(next);
    controller.burst();
  }, [active, onActivate, controller]);

  const layerCount = icon.layers.length;

  return (
    <div
      ref={containerRef}
      className={className}
      onClick={interactive ? handleClick : undefined}
      style={{
        ...(parallaxContainerStyle({ size, perspective, interactive }) as CSSProperties),
        ...style,
      }}
      role="img"
      aria-label={resolveIconLabel(icon, ariaLabel)}
    >
      {/* 3D scene — rotates as a whole */}
      <div ref={sceneRef} style={parallaxSceneStyle({ size, active }) as CSSProperties}>
        {icon.layers.map((layer, index) => (
          <div
            key={`${icon.name}-layer-${index}`}
            style={parallaxLayerStyle({ index, layerCount, layerGap, shadow }) as CSSProperties}
          >
            {isAnimatedIcon(layer.icon) ? (
              <AnimatedPxlKitIcon icon={layer.icon} size={size} appearance={appearance} color={color} />
            ) : (
              <PxlKitIcon icon={layer.icon} size={size} appearance={appearance} color={color} />
            )}
          </div>
        ))}
      </div>

      {/* Particle canvas overlay */}
      {interactive && (
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={PARALLAX_CANVAS_STYLE as CSSProperties}
        />
      )}
    </div>
  );
}
