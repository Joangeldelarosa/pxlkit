import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { PixelParallaxLayer } from '../../parallax/PixelParallaxLayer';

describe('PixelParallaxLayer', () => {
  let rafCallbacks: FrameRequestCallback[];
  let cancelSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rafCallbacks = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    cancelSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Run the most recently queued animation frame. */
  function runFrame() {
    const cb = rafCallbacks[rafCallbacks.length - 1];
    act(() => { cb(performance.now()); });
  }

  it('renders children with the will-change-transform class', () => {
    const { container, getByText } = render(
      <PixelParallaxLayer>
        <span>bg layer</span>
      </PixelParallaxLayer>,
    );
    expect(getByText('bg layer')).toBeTruthy();
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('will-change-transform');
  });

  it('translates along Y proportionally to speed on each frame', () => {
    const { container } = render(<PixelParallaxLayer speed={0.5}>x</PixelParallaxLayer>);
    const el = container.firstElementChild as HTMLElement;
    runFrame();
    // jsdom: rect = 0, scrollY = 0 → delta = (innerHeight / 2) * speed
    const expected = (window.innerHeight / 2) * 0.5;
    expect(el.style.transform).toBe(`translate3d(0, ${expected}px, 0)`);
  });

  it('axis="x" translates along X instead', () => {
    const { container } = render(
      <PixelParallaxLayer speed={1} axis="x">x</PixelParallaxLayer>,
    );
    const el = container.firstElementChild as HTMLElement;
    runFrame();
    const expected = window.innerHeight / 2;
    expect(el.style.transform).toBe(`translate3d(${expected}px, 0, 0)`);
  });

  it('axis="both" translates along both axes', () => {
    const { container } = render(
      <PixelParallaxLayer speed={1} axis="both">x</PixelParallaxLayer>,
    );
    const el = container.firstElementChild as HTMLElement;
    runFrame();
    const expected = window.innerHeight / 2;
    expect(el.style.transform).toBe(`translate3d(${expected}px, ${expected}px, 0)`);
  });

  it('negative speed reverses the translation direction', () => {
    const { container } = render(<PixelParallaxLayer speed={-0.5}>x</PixelParallaxLayer>);
    const el = container.firstElementChild as HTMLElement;
    runFrame();
    const expected = (window.innerHeight / 2) * -0.5;
    expect(el.style.transform).toBe(`translate3d(0, ${expected}px, 0)`);
  });

  it('cancels the animation frame loop on unmount', () => {
    const { unmount } = render(<PixelParallaxLayer>x</PixelParallaxLayer>);
    unmount();
    expect(cancelSpy).toHaveBeenCalled();
  });
});
