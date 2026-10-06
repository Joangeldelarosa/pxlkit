import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import type { AnimatedPxlKitProps } from './types';
import {
  animatedIconWrapperStyle,
  createAnimatedIconPlayer,
  getAnimationFrame,
} from '../engine/animation';
import { resolveIconLabel } from '../engine/icon';
import { PxlKitIcon } from './PxlKitIcon';
import { resolveColorProps } from './_internal/resolveColorProps';
import { useIsomorphicLayoutEffect } from './_internal/useIsomorphicLayoutEffect';

/**
 * Renders an animated pixel art icon by cycling through frames.
 *
 * Supports five trigger modes:
 * - **loop**      — plays continuously (default for `loop: true`)
 * - **once**      — plays one pass then stops on the last frame
 * - **hover**     — animates only while the user hovers
 * - **appear**    — plays once when the element first enters the viewport
 * - **ping-pong** — loops continuously, alternating forward/backward
 *
 * Supports speed/fps control:
 * - **speed** — multiplier (2 = double speed, 0.5 = half speed)
 * - **fps**   — override frame rate (takes priority over speed)
 *
 * Playback is driven by the framework-agnostic player
 * (`createAnimatedIconPlayer` in `@pxlkit/core/vanilla`), shared with
 * `@pxlkit/vue` and `@pxlkit/angular`. Looping icons pause while off-screen.
 *
 * @example
 * ```tsx
 * import { AnimatedPxlKitIcon } from '@pxlkit/core';
 * import { FireSword } from '@pxlkit/gamification';
 *
 * // Loop forever (default)
 * <AnimatedPxlKitIcon icon={FireSword} size={48} />
 *
 * // Play only on hover
 * <AnimatedPxlKitIcon icon={FireSword} size={48} trigger="hover" />
 *
 * // Ping-pong (back and forth)
 * <AnimatedPxlKitIcon icon={FireSword} trigger="ping-pong" />
 *
 * // 2x speed
 * <AnimatedPxlKitIcon icon={FireSword} speed={2} />
 *
 * // Fixed 12 FPS
 * <AnimatedPxlKitIcon icon={FireSword} fps={12} />
 *
 * // Play once when it scrolls into view
 * <AnimatedPxlKitIcon icon={FireSword} trigger="appear" />
 *
 * // Manual playing control (legacy)
 * <AnimatedPxlKitIcon icon={FireSword} playing={false} />
 * ```
 */
export function AnimatedPxlKitIcon({
  icon,
  size = 32,
  appearance: appearanceProp,
  color: colorProp,
  playing,
  trigger,
  speed,
  fps,
  className = '',
  style,
  'aria-label': ariaLabel,
  decorative = false,
  // Deprecated legacy props — resolved into `appearance` below.
  colorful,
  solid,
  tint,
}: AnimatedPxlKitProps) {
  const { appearance, color } = resolveColorProps({
    appearance: appearanceProp,
    color: colorProp,
    colorful,
    solid,
    tint,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [player] = useState(() => createAnimatedIconPlayer({ icon, playing, trigger, speed, fps }));
  const frameIndex = useSyncExternalStore(
    player.subscribe,
    player.getFrameIndex,
    player.getFrameIndex,
  );

  // Before paint, so switching icons never shows a stale frame.
  useIsomorphicLayoutEffect(() => {
    player.update({ icon, playing, trigger, speed, fps });
  }, [player, icon, playing, trigger, speed, fps]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    player.connect(element);
    return () => player.disconnect();
  }, [player]);

  const frameIcon = useMemo(() => getAnimationFrame(icon, frameIndex), [icon, frameIndex]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={player.hoverStart}
      onMouseLeave={player.hoverEnd}
      className={className}
      style={{ ...(animatedIconWrapperStyle(size) as CSSProperties), ...style }}
    >
      <PxlKitIcon
        icon={frameIcon}
        size={size}
        appearance={appearance}
        color={color}
        aria-label={resolveIconLabel(icon, { label: ariaLabel })}
        decorative={decorative}
      />
    </div>
  );
}
