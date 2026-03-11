import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { AnimatedPxlKitProps, AnimationTrigger, PxlKitData } from '../types';
import { PxlKitIcon } from './PxlKitIcon';

/**
 * Resolves the effective trigger for an animated icon.
 * Priority: prop `trigger` > `icon.trigger` > legacy `icon.loop` fallback.
 */
function resolveTrigger(
  propTrigger: AnimationTrigger | undefined,
  iconTrigger: AnimationTrigger | undefined,
  iconLoop: boolean,
): AnimationTrigger {
  if (propTrigger) return propTrigger;
  if (iconTrigger) return iconTrigger;
  return iconLoop ? 'loop' : 'once';
}

/** Clamp a number between min and max. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compute the effective frame duration (ms) from props.
 * Priority: `fps` prop → `speed` prop → `icon.frameDuration`.
 */
function resolveFrameDuration(
  baseDuration: number,
  speed?: number,
  fps?: number,
): number {
  if (fps !== undefined) {
    const clampedFps = clamp(fps, 1, 60);
    return Math.round(1000 / clampedFps);
  }
  if (speed !== undefined) {
    const clampedSpeed = clamp(speed, 0.1, 10);
    return Math.round(baseDuration / clampedSpeed);
  }
  return baseDuration;
}

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
  colorful = true,
  color,
  playing: playingProp,
  trigger: triggerProp,
  speed,
  fps,
  className = '',
  style,
  'aria-label': ariaLabel,
}: AnimatedPxlKitProps) {
  const trigger = resolveTrigger(triggerProp, icon.trigger, icon.loop);
  const frameCount = icon.frames.length;
  const effectiveDuration = resolveFrameDuration(icon.frameDuration, speed, fps);

  const [frameIndex, setFrameIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = backward
  const [isHovering, setIsHovering] = useState(false);
  const [hasAppeared, setHasAppeared] = useState(false);
  const [playedOnce, setPlayedOnce] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Determine if animation should be running ──
  const shouldPlay = (() => {
    // Explicit playing prop overrides trigger logic (backward compat)
    if (playingProp !== undefined) return playingProp;
    if (frameCount <= 1) return false;

    switch (trigger) {
      case 'loop':
      case 'ping-pong':
        return true;
      case 'once':
        return !playedOnce;
      case 'hover':
        return isHovering;
      case 'appear':
        return hasAppeared && !playedOnce;
      default:
        return true;
    }
  })();

  // ── Frame cycling ──
  useEffect(() => {
    if (!shouldPlay || frameCount <= 1) return;

    const timer = window.setInterval(() => {
      setFrameIndex((prev) => {
        if (trigger === 'ping-pong') {
          const next = prev + direction;
          if (next >= frameCount) {
            setDirection(-1);
            return prev - 1 >= 0 ? prev - 1 : prev;
          }
          if (next < 0) {
            setDirection(1);
            return prev + 1 < frameCount ? prev + 1 : prev;
          }
          return next;
        }

        // Forward-only modes
        const next = prev + 1;
        if (next >= frameCount) {
          if (trigger === 'loop' || (trigger === 'hover' && isHovering)) {
            return 0;
          }
          // 'once' / 'appear' — stop at last frame
          setPlayedOnce(true);
          return prev;
        }
        return next;
      });
    }, effectiveDuration);

    return () => window.clearInterval(timer);
  }, [shouldPlay, frameCount, effectiveDuration, trigger, isHovering, direction]);

  // ── Reset on hover start (for trigger === 'hover') ──
  useEffect(() => {
    if (trigger === 'hover' && isHovering) {
      setFrameIndex(0);
      setDirection(1);
      setPlayedOnce(false);
    }
  }, [trigger, isHovering]);

  // ── IntersectionObserver for trigger === 'appear' ──
  useEffect(() => {
    if (trigger !== 'appear' || hasAppeared) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAppeared(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [trigger, hasAppeared]);

  // ── Reset frame index when icon changes ──
  useEffect(() => {
    setFrameIndex(0);
    setDirection(1);
    setPlayedOnce(false);
    setHasAppeared(false);
  }, [icon.name]);

  // ── Build static PxlKitData for current frame ──
  const safeIndex = Math.max(0, Math.min(frameIndex, frameCount - 1));
  const currentFrame = icon.frames[safeIndex];
  const mergedPalette = currentFrame.palette
    ? { ...icon.palette, ...currentFrame.palette }
    : icon.palette;

  const frameIcon: PxlKitData = {
    name: icon.name,
    size: icon.size,
    category: icon.category,
    grid: currentFrame.grid,
    palette: mergedPalette,
    tags: icon.tags,
  };

  // ── Hover handlers ──
  const onMouseEnter = useCallback(() => {
    if (trigger === 'hover') setIsHovering(true);
  }, [trigger]);

  const onMouseLeave = useCallback(() => {
    if (trigger === 'hover') {
      setIsHovering(false);
      setFrameIndex(0);
      setDirection(1);
    }
  }, [trigger]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{ display: 'inline-flex', ...style }}
    >
      <PxlKitIcon
        icon={frameIcon}
        size={size}
        colorful={colorful}
        color={color}
        aria-label={ariaLabel || icon.name}
      />
    </div>
  );
}
