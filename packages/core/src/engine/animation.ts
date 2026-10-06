import type { AnimatedPxlKitData, AnimationTrigger, PxlKitData } from '../types';
import { observeVisibility } from '../utils/visibilityObserver';
import { clamp, px, type StyleMap } from './style';

/** Playback controls shared by every animated-icon adapter. */
export interface AnimationPlaybackOptions {
  /**
   * Overrides the icon's trigger. Falls back to `icon.trigger`, then to the
   * legacy `icon.loop` flag (`true` → `'loop'`, `false` → `'once'`).
   */
  trigger?: AnimationTrigger;
  /**
   * Explicit play/pause override. When set it wins over the trigger logic;
   * leave it unset to let the trigger drive playback.
   */
  playing?: boolean;
  /** Playback speed multiplier, clamped to 0.1–10 (`2` = twice as fast). */
  speed?: number;
  /** Fixed frame rate, clamped to 1–60. Takes priority over `speed`. */
  fps?: number;
}

/** Options of {@link createAnimatedIconPlayer}. */
export interface AnimatedIconPlayerOptions extends AnimationPlaybackOptions {
  /** The animated icon to play. */
  icon: AnimatedPxlKitData;
}

/**
 * Framework-agnostic playback state machine behind every animated icon.
 *
 * It owns the frame clock, the hover / appear / visibility logic and every
 * browser resource involved (interval, `IntersectionObserver`s); an adapter
 * only renders {@link getAnimationFrame} for {@link AnimatedIconPlayer.getFrameIndex}
 * and forwards its lifecycle:
 *
 * ```ts
 * const player = createAnimatedIconPlayer({ icon });
 * const stop = player.subscribe(() => render(player.getFrameIndex()));
 * player.connect(element);              // on mount (browser only)
 * player.update({ icon, speed: 2 });    // when inputs change
 * player.disconnect(); stop();          // on unmount
 * ```
 */
export interface AnimatedIconPlayer {
  /** Index of the frame to display, always within the icon's bounds. */
  getFrameIndex(): number;
  /** Whether the frame clock is currently running. */
  isPlaying(): boolean;
  /**
   * Registers a listener called whenever the frame index changes.
   * Returns the unsubscribe function.
   */
  subscribe(listener: () => void): () => void;
  /**
   * Replaces the options. Switching to an icon with a different `name`
   * restarts playback from the first frame.
   */
  update(options: AnimatedIconPlayerOptions): void;
  /**
   * Attaches the player to its rendered element and starts the clock when
   * the trigger allows it. The element is observed so the clock pauses while
   * it is off-screen (and, for `'appear'`, so playback starts on first view).
   */
  connect(element: Element): void;
  /** Stops the clock and releases every observer. The state is kept. */
  disconnect(): void;
  /** Pointer entered the icon — starts `'hover'` playback from frame 0. */
  hoverStart(): void;
  /** Pointer left the icon — stops `'hover'` playback and rewinds to frame 0. */
  hoverEnd(): void;
}

/** Share of the icon that must be visible before an `'appear'` icon plays. */
const APPEAR_THRESHOLD = 0.3;

/**
 * Resolves the effective trigger. Priority: explicit override →
 * `icon.trigger` → legacy `icon.loop` (`true` → `'loop'`, else `'once'`).
 */
export function resolveAnimationTrigger(
  icon: Pick<AnimatedPxlKitData, 'trigger' | 'loop'>,
  override?: AnimationTrigger,
): AnimationTrigger {
  if (override) return override;
  if (icon.trigger) return icon.trigger;
  return icon.loop ? 'loop' : 'once';
}

/**
 * Effective frame duration in milliseconds. Priority: `fps` (clamped to
 * 1–60) → `speed` (clamped to 0.1–10, divides the base duration) → the
 * icon's own `frameDuration`. `NaN` values are ignored.
 */
export function resolveFrameDuration(
  baseDuration: number,
  options: Pick<AnimationPlaybackOptions, 'speed' | 'fps'> = {},
): number {
  const { speed, fps } = options;
  if (fps !== undefined && !Number.isNaN(fps)) {
    return Math.round(1000 / clamp(fps, 1, 60));
  }
  if (speed !== undefined && !Number.isNaN(speed)) {
    return Math.round(baseDuration / clamp(speed, 0.1, 10));
  }
  return baseDuration;
}

/**
 * The static icon for one frame of an animated icon: the frame's grid with
 * its palette overrides merged over the base palette. Out-of-range indices
 * are clamped, so any index is safe to pass.
 */
export function getAnimationFrame(icon: AnimatedPxlKitData, frameIndex: number): PxlKitData {
  const frame = icon.frames[clamp(frameIndex, 0, Math.max(0, icon.frames.length - 1))];
  return {
    name: icon.name,
    size: icon.size,
    category: icon.category,
    grid: frame ? frame.grid : [],
    palette: frame?.palette ? { ...icon.palette, ...frame.palette } : icon.palette,
    tags: icon.tags,
  };
}

/**
 * Inline style of the animated-icon wrapper: an exact `size`×`size`
 * inline-flex box that centres the frame, sits on the text middle line and
 * never collapses inside cramped flex rows.
 */
export function animatedIconWrapperStyle(size: number): StyleMap {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    flexShrink: '0',
    width: px(size),
    height: px(size),
    lineHeight: '0',
  };
}

/** Creates an {@link AnimatedIconPlayer}. Side-effect free until `connect()`. */
export function createAnimatedIconPlayer(initial: AnimatedIconPlayerOptions): AnimatedIconPlayer {
  let options: AnimatedIconPlayerOptions = { ...initial };
  let frame = 0;
  let direction: 1 | -1 = 1;
  let hovering = false;
  let appeared = false;
  let playedOnce = false;
  let visible = true;
  let element: Element | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  let timerDuration = 0;
  let stopVisibility: (() => void) | undefined;
  let appearObserver: IntersectionObserver | undefined;
  const listeners = new Set<() => void>();

  const frameCount = (): number => options.icon.frames.length;
  const trigger = (): AnimationTrigger => resolveAnimationTrigger(options.icon, options.trigger);

  function getFrameIndex(): number {
    return clamp(frame, 0, Math.max(0, frameCount() - 1));
  }

  /** Notifies listeners when the displayed frame differs from `before`. */
  function commit(before: number): void {
    if (getFrameIndex() === before) return;
    for (const listener of [...listeners]) listener();
  }

  function setFrame(next: number): void {
    const before = getFrameIndex();
    frame = next;
    commit(before);
  }

  /** Whether the trigger state wants the clock running (frame count aside). */
  function shouldPlay(): boolean {
    if (!visible) return false;
    if (options.playing !== undefined) return options.playing;
    switch (trigger()) {
      case 'once':
        return !playedOnce;
      case 'hover':
        return hovering;
      case 'appear':
        return appeared && !playedOnce;
      default:
        // 'loop' and 'ping-pong' play continuously.
        return true;
    }
  }

  function tick(): void {
    const count = frameCount();
    if (trigger() === 'ping-pong') {
      const next = frame + direction;
      if (next >= count) {
        direction = -1;
        setFrame(frame - 1 >= 0 ? frame - 1 : frame);
      } else if (next < 0) {
        direction = 1;
        setFrame(frame + 1 < count ? frame + 1 : frame);
      } else {
        setFrame(next);
      }
    } else if (frame + 1 < count) {
      setFrame(frame + 1);
    } else if (trigger() === 'loop' || (trigger() === 'hover' && hovering)) {
      setFrame(0);
    } else {
      // 'once' / 'appear' — hold the last frame and stop the clock.
      playedOnce = true;
    }
    syncClock();
  }

  function stopClock(): void {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  }

  /**
   * Starts, stops or re-times the frame clock to match the current state.
   * `restart` re-phases a running clock so the frame on screen gets a full
   * frame duration — used when playback restarts (hover start / end) or the
   * trigger or frame count changes.
   */
  function syncClock(restart = false): void {
    if (element === null || frameCount() <= 1 || !shouldPlay()) {
      stopClock();
      return;
    }
    const duration = resolveFrameDuration(options.icon.frameDuration, options);
    if (timer !== undefined && duration === timerDuration && !restart) return;
    stopClock();
    timerDuration = duration;
    timer = setInterval(tick, duration);
  }

  function stopAppearObserver(): void {
    appearObserver?.disconnect();
    appearObserver = undefined;
  }

  function syncAppearObserver(): void {
    if (element === null || trigger() !== 'appear' || appeared) {
      stopAppearObserver();
      return;
    }
    // Without IntersectionObserver (SSR-like environments) an 'appear' icon
    // never reports entering the viewport and keeps its first frame.
    if (appearObserver || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        appeared = true;
        stopAppearObserver();
        syncClock();
      },
      { threshold: APPEAR_THRESHOLD },
    );
    observer.observe(element);
    appearObserver = observer;
  }

  function update(next: AnimatedIconPlayerOptions): void {
    const before = getFrameIndex();
    const previousName = options.icon.name;
    const previousTrigger = trigger();
    const previousCount = frameCount();
    options = { ...next };
    if (next.icon.name !== previousName) {
      frame = 0;
      direction = 1;
      playedOnce = false;
      appeared = false;
    }
    // Also covers a same-name icon with fewer frames moving the clamp.
    commit(before);
    syncAppearObserver();
    syncClock(trigger() !== previousTrigger || frameCount() !== previousCount);
  }

  function disconnect(): void {
    stopClock();
    stopVisibility?.();
    stopVisibility = undefined;
    stopAppearObserver();
    element = null;
  }

  function connect(el: Element): void {
    if (element === el) return;
    if (element !== null) disconnect();
    element = el;
    visible = true;
    stopVisibility = observeVisibility(el, (isVisible) => {
      if (isVisible === visible) return;
      visible = isVisible;
      syncClock();
    });
    syncAppearObserver();
    syncClock();
  }

  function hoverStart(): void {
    if (trigger() !== 'hover' || hovering) return;
    hovering = true;
    direction = 1;
    playedOnce = false;
    setFrame(0);
    syncClock(true);
  }

  function hoverEnd(): void {
    if (trigger() !== 'hover') return;
    hovering = false;
    direction = 1;
    setFrame(0);
    syncClock(true);
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return {
    getFrameIndex,
    isPlaying: () => timer !== undefined,
    subscribe,
    update,
    connect,
    disconnect,
    hoverStart,
    hoverEnd,
  };
}
