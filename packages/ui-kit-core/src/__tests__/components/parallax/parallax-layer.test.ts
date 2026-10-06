import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { followScroll, parallaxLayerClasses, parallaxLayerOffset, parallaxLayerTransform } from '../../../index';

describe('parallax layer', () => {
  it('composites the layer on its own', () => {
    expect(parallaxLayerClasses).toBe('will-change-transform');
  });

  it('moves the layer by its distance from the viewport centre times the speed', () => {
    // Centre at 100 + 400 + 50 = 550 in the page; the viewport's at 400 + 300 = 700.
    expect(parallaxLayerOffset({ top: 100, height: 100 }, 400, 600, 0.5)).toBe(75);
    expect(parallaxLayerOffset({ top: 100, height: 100 }, 400, 600, -1)).toBe(-150);
    expect(parallaxLayerOffset({ top: 250, height: 100 }, 0, 600, 3)).toBe(0);
  });

  it('translates along the axis', () => {
    expect(parallaxLayerTransform('y', 12.5)).toBe('translate3d(0, 12.5px, 0)');
    expect(parallaxLayerTransform('x', -3)).toBe('translate3d(-3px, 0, 0)');
    expect(parallaxLayerTransform('both', 7)).toBe('translate3d(7px, 7px, 0)');
  });

  describe('following the scroll', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    });
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('re-places the element on every animation frame until stopped', () => {
      const element = document.createElement('div');
      let top = 0;
      vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() => ({ top, height: 0 }) as DOMRect);
      const stop = followScroll(element, { speed: 0.5, axis: 'y' });
      expect(element.style.transform).toBe('');
      vi.advanceTimersToNextFrame();
      expect(element.style.transform).toBe(`translate3d(0, ${(window.innerHeight / 2) * 0.5}px, 0)`);
      top = window.innerHeight / 2 + 40;
      vi.advanceTimersToNextFrame();
      expect(element.style.transform).toBe('translate3d(0, -20px, 0)');
      stop();
      top = 0;
      vi.advanceTimersByTime(100);
      expect(element.style.transform).toBe('translate3d(0, -20px, 0)');
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
