import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { PixelMouseParallax } from '../../parallax/PixelMouseParallax';
import { mockMatchMedia, type MatchMediaController } from '../animations/matchmedia-mock';

describe('PixelMouseParallax', () => {
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    rafCallbacks = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    // jsdom rects are all zeros — give the fallback parent (document.body)
    // a real box so cursor normalisation produces finite values.
    vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100, x: 0, y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Run the most recently queued animation frame. */
  function runFrame() {
    const cb = rafCallbacks[rafCallbacks.length - 1];
    act(() => { cb(performance.now()); });
  }

  function parseTranslate(el: HTMLElement): { x: number; y: number } {
    const m = /translate3d\((-?[\d.]+)px, (-?[\d.]+)px, 0\)/.exec(el.style.transform);
    expect(m, `transform should be a translate3d: "${el.style.transform}"`).toBeTruthy();
    return { x: Number(m![1]), y: Number(m![2]) };
  }

  it('renders children with the will-change-transform class', () => {
    const { container, getByText } = render(
      <PixelMouseParallax>
        <span>follow me</span>
      </PixelMouseParallax>,
    );
    expect(getByText('follow me')).toBeTruthy();
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('will-change-transform');
  });

  it('moves towards the cursor after a mousemove (lerped per frame)', () => {
    const { container } = render(<PixelMouseParallax strength={20}>x</PixelMouseParallax>);
    const el = container.firstElementChild as HTMLElement;

    // Bottom-right corner of the 200x100 parent box → normalized (1, 1).
    fireEvent.mouseMove(window, { clientX: 200, clientY: 100 });
    runFrame();

    const { x, y } = parseTranslate(el);
    // First lerp step: 0 + (20 - 0) * 0.08 = 1.6 towards the target.
    expect(x).toBeCloseTo(1.6, 5);
    expect(y).toBeCloseTo(1.6, 5);
  });

  it('keeps approaching the target on subsequent frames', () => {
    const { container } = render(<PixelMouseParallax strength={20}>x</PixelMouseParallax>);
    const el = container.firstElementChild as HTMLElement;

    fireEvent.mouseMove(window, { clientX: 200, clientY: 100 });
    runFrame();
    const first = parseTranslate(el).x;
    runFrame();
    const second = parseTranslate(el).x;
    expect(second).toBeGreaterThan(first);
    expect(second).toBeLessThanOrEqual(20);
  });

  it('invert moves away from the cursor instead', () => {
    const { container } = render(
      <PixelMouseParallax strength={20} invert>x</PixelMouseParallax>,
    );
    const el = container.firstElementChild as HTMLElement;

    fireEvent.mouseMove(window, { clientX: 200, clientY: 100 });
    runFrame();

    const { x, y } = parseTranslate(el);
    expect(x).toBeLessThan(0);
    expect(y).toBeLessThan(0);
  });

  it('removes the mousemove listener and cancels the loop on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<PixelMouseParallax>x</PixelMouseParallax>);
    unmount();
    const removed = removeSpy.mock.calls.map((c) => c[0]);
    expect(removed).toContain('mousemove');
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});

/* ─── Regression: the layer kept following the cursor for users who prefer
   reduced motion, which the parallax group's manifest says its children
   respect. ───────────────────────────────────────────────────────────── */

describe('PixelMouseParallax — reduced motion', () => {
  let media: MatchMediaController | undefined;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100, x: 0, y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  });

  afterEach(() => {
    media?.restore();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('holds still while the user prefers reduced motion', () => {
    media = mockMatchMedia(true);
    const added = vi.spyOn(window, 'addEventListener');
    const { container } = render(<PixelMouseParallax strength={20}>x</PixelMouseParallax>);
    fireEvent.mouseMove(window, { clientX: 200, clientY: 100 });
    act(() => { vi.advanceTimersByTime(100); });
    expect((container.firstElementChild as HTMLElement).style.transform).toBe('');
    expect(added.mock.calls.map((call) => call[0])).not.toContain('mousemove');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops following the cursor when the preference turns on, and picks up where it was when it turns off', () => {
    media = mockMatchMedia(false);
    const { container } = render(<PixelMouseParallax strength={20}>x</PixelMouseParallax>);
    const el = container.firstElementChild as HTMLElement;
    fireEvent.mouseMove(window, { clientX: 200, clientY: 100 });
    act(() => { vi.advanceTimersToNextFrame(); });
    expect(el.style.transform).toBe('translate3d(1.6px, 1.6px, 0)');

    act(() => media!.setMatches(true));
    fireEvent.mouseMove(window, { clientX: 0, clientY: 0 });
    act(() => { vi.advanceTimersByTime(100); });
    expect(el.style.transform).toBe('translate3d(1.6px, 1.6px, 0)');
    expect(vi.getTimerCount()).toBe(0);

    act(() => media!.setMatches(false));
    act(() => { vi.advanceTimersToNextFrame(); });
    const next = 1.6 + (20 - 1.6) * 0.08;
    expect(el.style.transform).toBe(`translate3d(${next}px, ${next}px, 0)`);
  });
});
