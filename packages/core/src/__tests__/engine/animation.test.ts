import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  animatedIconWrapperStyle,
  createAnimatedIconPlayer,
  getAnimationFrame,
  resolveAnimationTrigger,
  resolveFrameDuration,
  type AnimatedIconPlayer,
} from '../../engine/animation';
import type { AnimatedPxlKitData } from '../../types';
import { testAnimatedIcon } from '../fixtures';

/** A 3-frame icon so ping-pong has a real middle frame. */
const threeFrames: AnimatedPxlKitData = {
  ...testAnimatedIcon,
  name: 'three-frames',
  frames: [testAnimatedIcon.frames[0], testAnimatedIcon.frames[1], testAnimatedIcon.frames[0]],
  frameDuration: 100,
};

describe('resolveAnimationTrigger', () => {
  it('prefers the override, then icon.trigger, then the legacy loop flag', () => {
    expect(resolveAnimationTrigger({ trigger: 'once', loop: true }, 'hover')).toBe('hover');
    expect(resolveAnimationTrigger({ trigger: 'ping-pong', loop: false })).toBe('ping-pong');
    expect(resolveAnimationTrigger({ loop: true })).toBe('loop');
    expect(resolveAnimationTrigger({ loop: false })).toBe('once');
  });
});

describe('resolveFrameDuration', () => {
  it('uses the base duration by default', () => {
    expect(resolveFrameDuration(150)).toBe(150);
    expect(resolveFrameDuration(150, {})).toBe(150);
  });

  it('divides the base duration by the clamped speed', () => {
    expect(resolveFrameDuration(200, { speed: 2 })).toBe(100);
    expect(resolveFrameDuration(200, { speed: 0.5 })).toBe(400);
    expect(resolveFrameDuration(200, { speed: 100 })).toBe(20); // clamped to 10
    expect(resolveFrameDuration(200, { speed: 0 })).toBe(2000); // clamped to 0.1
  });

  it('lets fps win over speed, clamped to 1–60', () => {
    expect(resolveFrameDuration(200, { fps: 10, speed: 2 })).toBe(100);
    expect(resolveFrameDuration(200, { fps: 500 })).toBe(17);
    expect(resolveFrameDuration(200, { fps: 0 })).toBe(1000);
  });

  it('ignores NaN instead of producing a runaway interval', () => {
    expect(resolveFrameDuration(200, { fps: Number.NaN })).toBe(200);
    expect(resolveFrameDuration(200, { speed: Number.NaN })).toBe(200);
    expect(resolveFrameDuration(200, { fps: Number.NaN, speed: 4 })).toBe(50);
  });
});

describe('getAnimationFrame', () => {
  const paletteIcon: AnimatedPxlKitData = {
    ...testAnimatedIcon,
    frames: [{ grid: testAnimatedIcon.frames[0].grid, palette: { A: '#00FF00' } }, testAnimatedIcon.frames[1]],
  };

  it('merges per-frame palette overrides over the base palette', () => {
    expect(getAnimationFrame(paletteIcon, 0).palette).toEqual({ A: '#00FF00', B: '#00FF00' });
    expect(getAnimationFrame(paletteIcon, 1).palette).toBe(paletteIcon.palette);
  });

  it('builds a static icon carrying the animated icon metadata', () => {
    const frame = getAnimationFrame(testAnimatedIcon, 1);
    expect(frame).toEqual({
      name: 'test-animated',
      size: 8,
      category: 'test',
      grid: testAnimatedIcon.frames[1].grid,
      palette: testAnimatedIcon.palette,
      tags: testAnimatedIcon.tags,
    });
  });

  it('clamps out-of-range indices and survives an icon without frames', () => {
    expect(getAnimationFrame(testAnimatedIcon, 99).grid).toBe(testAnimatedIcon.frames[1].grid);
    expect(getAnimationFrame(testAnimatedIcon, -3).grid).toBe(testAnimatedIcon.frames[0].grid);
    expect(getAnimationFrame({ ...testAnimatedIcon, frames: [] }, 0).grid).toEqual([]);
  });
});

describe('animatedIconWrapperStyle', () => {
  it('is an exact, unit-explicit size×size box', () => {
    expect(animatedIconWrapperStyle(48)).toEqual({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      verticalAlign: 'middle',
      flexShrink: '0',
      width: '48px',
      height: '48px',
      lineHeight: '0',
    });
  });
});

describe('createAnimatedIconPlayer', () => {
  let element: HTMLElement;
  let player: AnimatedIconPlayer;

  beforeEach(() => {
    vi.useFakeTimers();
    element = document.createElement('div');
  });

  afterEach(() => {
    player?.disconnect();
    vi.useRealTimers();
  });

  /** Frame indices observed over `ticks` frame durations. */
  function record(p: AnimatedIconPlayer, ticks: number, duration: number): number[] {
    const seen: number[] = [p.getFrameIndex()];
    for (let i = 0; i < ticks; i++) {
      vi.advanceTimersByTime(duration);
      seen.push(p.getFrameIndex());
    }
    return seen;
  }

  it('is side-effect free until connected', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'loop' });
    expect(player.isPlaying()).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(player.getFrameIndex()).toBe(0);
  });

  it('loops through the frames forever', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'loop' });
    player.connect(element);
    expect(player.isPlaying()).toBe(true);
    expect(record(player, 7, 100)).toEqual([0, 1, 2, 0, 1, 2, 0, 1]);
  });

  it('plays once, holds the last frame and stops the clock', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'once' });
    player.connect(element);
    expect(record(player, 5, 100)).toEqual([0, 1, 2, 2, 2, 2]);
    expect(player.isPlaying()).toBe(false);
  });

  it('ping-pongs back and forth', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'ping-pong' });
    player.connect(element);
    expect(record(player, 8, 100)).toEqual([0, 1, 2, 1, 0, 1, 2, 1, 0]);
  });

  it('falls back to the legacy loop flag', () => {
    player = createAnimatedIconPlayer({ icon: { ...threeFrames, loop: false } });
    player.connect(element);
    expect(record(player, 4, 100)).toEqual([0, 1, 2, 2, 2]);
  });

  it('only plays while hovered, restarting from frame 0', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'hover' });
    player.connect(element);
    expect(record(player, 3, 100)).toEqual([0, 0, 0, 0]);

    player.hoverStart();
    expect(record(player, 4, 100)).toEqual([0, 1, 2, 0, 1]);

    player.hoverEnd();
    expect(player.getFrameIndex()).toBe(0);
    expect(player.isPlaying()).toBe(false);
  });

  it('gives frame 0 a full duration when hover restarts a running clock', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'hover', playing: true });
    player.connect(element);
    vi.advanceTimersByTime(150); // mid-way through frame 1
    expect(player.getFrameIndex()).toBe(1);
    player.hoverStart();
    expect(player.getFrameIndex()).toBe(0);
    vi.advanceTimersByTime(60); // the old clock would have ticked at 200 ms
    expect(player.getFrameIndex()).toBe(0);
    vi.advanceTimersByTime(40);
    expect(player.getFrameIndex()).toBe(1);
  });

  it('ignores hover events for other triggers and repeated hover starts', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'once' });
    player.connect(element);
    vi.advanceTimersByTime(100);
    player.hoverStart();
    player.hoverEnd();
    expect(player.getFrameIndex()).toBe(1);

    const hover = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'hover' });
    hover.connect(element);
    hover.hoverStart();
    vi.advanceTimersByTime(100);
    hover.hoverStart(); // already hovering: no rewind
    expect(hover.getFrameIndex()).toBe(1);
    hover.disconnect();
  });

  it('honours an explicit playing override in both directions', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'loop', playing: false });
    player.connect(element);
    expect(record(player, 3, 100)).toEqual([0, 0, 0, 0]);

    player.update({ icon: threeFrames, trigger: 'hover', playing: true });
    expect(record(player, 2, 100)).toEqual([0, 1, 2]);
  });

  it('never runs a clock for a single-frame icon', () => {
    player = createAnimatedIconPlayer({
      icon: { ...testAnimatedIcon, frames: [testAnimatedIcon.frames[0]] },
      playing: true,
    });
    player.connect(element);
    expect(player.isPlaying()).toBe(false);
  });

  it('re-times the clock when speed or fps change', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'loop' });
    player.connect(element);
    player.update({ icon: threeFrames, trigger: 'loop', speed: 2 });
    expect(record(player, 2, 50)).toEqual([0, 1, 2]);
    player.update({ icon: threeFrames, trigger: 'loop', fps: 4 });
    vi.advanceTimersByTime(249);
    expect(player.getFrameIndex()).toBe(2);
    vi.advanceTimersByTime(1);
    expect(player.getFrameIndex()).toBe(0);
  });

  it('restarts from frame 0 when the icon name changes', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'once' });
    player.connect(element);
    vi.advanceTimersByTime(1000);
    expect(player.getFrameIndex()).toBe(2);
    expect(player.isPlaying()).toBe(false);

    player.update({ icon: { ...threeFrames, name: 'other' }, trigger: 'once' });
    expect(player.getFrameIndex()).toBe(0);
    expect(player.isPlaying()).toBe(true);

    // Same name → same animation, nothing restarts.
    vi.advanceTimersByTime(100);
    player.update({ icon: { ...threeFrames, name: 'other' }, trigger: 'once' });
    expect(player.getFrameIndex()).toBe(1);
  });

  it('notifies subscribers only when the displayed frame changes', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'once' });
    const listener = vi.fn();
    const unsubscribe = player.subscribe(listener);
    player.connect(element);
    vi.advanceTimersByTime(500); // 0 → 1 → 2, then holds
    expect(listener).toHaveBeenCalledTimes(2);

    // A same-name icon with fewer frames moves the clamp: that is a change too.
    player.update({ icon: { ...threeFrames, frames: threeFrames.frames.slice(0, 2) }, trigger: 'once' });
    expect(player.getFrameIndex()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    player.update({ icon: { ...threeFrames, name: 'reset' }, trigger: 'once' });
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('stops on disconnect and resumes on reconnect without losing its frame', () => {
    player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'loop' });
    player.connect(element);
    vi.advanceTimersByTime(100);
    player.disconnect();
    expect(player.isPlaying()).toBe(false);
    vi.advanceTimersByTime(500);
    expect(player.getFrameIndex()).toBe(1);

    player.connect(element);
    player.connect(element); // idempotent
    vi.advanceTimersByTime(100);
    expect(player.getFrameIndex()).toBe(2);

    const other = document.createElement('span');
    player.connect(other); // moving to another element reconnects cleanly
    expect(player.isPlaying()).toBe(true);
  });

  describe('with IntersectionObserver', () => {
    type Entry = { target: Element; isIntersecting: boolean };
    let observers: Array<{ callback: (entries: Entry[]) => void; options?: IntersectionObserverInit; targets: Element[]; disconnected: boolean }>;

    beforeEach(() => {
      observers = [];
      (globalThis as Record<string, unknown>).IntersectionObserver = class {
        record: (typeof observers)[number];
        constructor(callback: (entries: Entry[]) => void, options?: IntersectionObserverInit) {
          this.record = { callback, options, targets: [], disconnected: false };
          observers.push(this.record);
        }
        observe(target: Element) {
          this.record.targets.push(target);
        }
        unobserve() {}
        disconnect() {
          this.record.disconnected = true;
        }
      };
    });

    afterEach(() => {
      player?.disconnect();
      delete (globalThis as Record<string, unknown>).IntersectionObserver;
    });

    const appearObserver = () => observers.find((o) => o.options?.threshold === 0.3);
    const visibilityObserver = () => observers.find((o) => o.options?.rootMargin === '100px 0px');

    it("plays an 'appear' icon once, the first time it is 30% visible", () => {
      player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'appear' });
      player.connect(element);
      expect(record(player, 2, 100)).toEqual([0, 0, 0]);

      appearObserver()!.callback([{ target: element, isIntersecting: false }]);
      expect(player.isPlaying()).toBe(false);

      appearObserver()!.callback([{ target: element, isIntersecting: true }]);
      expect(appearObserver()!.disconnected).toBe(true);
      expect(record(player, 4, 100)).toEqual([0, 1, 2, 2, 2]);
      expect(player.isPlaying()).toBe(false);
    });

    it('pauses while off-screen and resumes when visible again', () => {
      player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'loop' });
      player.connect(element);
      const shared = visibilityObserver()!;
      expect(shared.targets).toContain(element);

      shared.callback([{ target: element, isIntersecting: false }]);
      expect(record(player, 3, 100)).toEqual([0, 0, 0, 0]);

      shared.callback([{ target: element, isIntersecting: true }]);
      expect(record(player, 2, 100)).toEqual([0, 1, 2]);
    });

    it('creates no appear observer for other triggers', () => {
      player = createAnimatedIconPlayer({ icon: threeFrames, trigger: 'loop' });
      player.connect(element);
      expect(appearObserver()).toBeUndefined();

      player.update({ icon: threeFrames, trigger: 'appear' });
      expect(appearObserver()).toBeDefined();
      player.update({ icon: threeFrames, trigger: 'loop' });
      expect(appearObserver()!.disconnected).toBe(true);
    });
  });
});
