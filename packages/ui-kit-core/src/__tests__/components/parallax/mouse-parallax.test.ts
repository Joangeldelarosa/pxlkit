import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MOUSE_PARALLAX_EASING,
  createMouseParallaxMotion,
  mouseParallaxClasses,
  mouseParallaxTarget,
  mouseParallaxTransform,
} from '../../../index';

const box = { left: 100, top: 50, width: 200, height: 100 };

describe('mouse parallax', () => {
  it('composites the layer on its own and eases it by 8 % of the way per frame', () => {
    expect(mouseParallaxClasses).toBe('will-change-transform');
    expect(MOUSE_PARALLAX_EASING).toBe(0.08);
  });

  it('pulls the layer towards the cursor across the box, up to the strength, or away when inverted', () => {
    expect(mouseParallaxTarget({ clientX: 300, clientY: 150 }, box, { strength: 20, invert: false })).toEqual({ x: 20, y: 20 });
    expect(mouseParallaxTarget({ clientX: 100, clientY: 50 }, box, { strength: 20, invert: false })).toEqual({ x: -20, y: -20 });
    expect(mouseParallaxTarget({ clientX: 200, clientY: 100 }, box, { strength: 20, invert: false })).toEqual({ x: 0, y: 0 });
    expect(mouseParallaxTarget({ clientX: 250, clientY: 75 }, box, { strength: 30, invert: true })).toEqual({ x: -15, y: 15 });
  });

  it('translates the layer to its offset', () => {
    expect(mouseParallaxTransform({ x: 1.6, y: -0.5 })).toBe('translate3d(1.6px, -0.5px, 0)');
  });

  describe('following the mouse', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    });
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
      document.body.innerHTML = '';
    });

    const move = (clientX: number, clientY: number) =>
      window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));

    it('eases towards the cursor, measured in the nearest relative box, on every frame until stopped', () => {
      const frame = document.createElement('div');
      frame.className = 'relative h-64';
      const layer = document.createElement('div');
      frame.append(layer);
      document.body.append(frame);
      vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue(box as DOMRect);

      const stop = createMouseParallaxMotion(layer).follow({ strength: 20, invert: false });
      vi.advanceTimersToNextFrame();
      expect(layer.style.transform).toBe('translate3d(0px, 0px, 0)');
      move(300, 150);
      vi.advanceTimersToNextFrame();
      expect(layer.style.transform).toBe('translate3d(1.6px, 1.6px, 0)');
      vi.advanceTimersToNextFrame();
      const second = 1.6 + (20 - 1.6) * 0.08;
      expect(layer.style.transform).toBe(`translate3d(${second}px, ${second}px, 0)`);

      stop();
      move(100, 50);
      vi.advanceTimersByTime(100);
      expect(layer.style.transform).toBe(`translate3d(${second}px, ${second}px, 0)`);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('measures the cursor across the page without a relative box, and carries its state over to the next follow', () => {
      const layer = document.createElement('div');
      document.body.append(layer);
      vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue(box as DOMRect);
      const motion = createMouseParallaxMotion(layer);

      let stop = motion.follow({ strength: 20, invert: true });
      move(300, 150);
      vi.advanceTimersToNextFrame();
      expect(layer.style.transform).toBe('translate3d(-1.6px, -1.6px, 0)');
      stop();

      // A new follow picks up where the layer is and where it was heading.
      stop = motion.follow({ strength: 10, invert: false });
      vi.advanceTimersToNextFrame();
      const next = -1.6 + (-20 - -1.6) * 0.08;
      expect(layer.style.transform).toBe(`translate3d(${next}px, ${next}px, 0)`);
      stop();
    });
  });
});
