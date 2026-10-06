/**
 * <pxl-mouse-parallax>: following the mouse, compared with React's —
 * towards the cursor across its group, away from it across the page, through
 * a change of inputs — reduced motion, which holds it still, and the loop and
 * listener it stops when destroyed. The manifest examples are covered against
 * React by the parity suite; zone.js applications by the zone suite.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { createElement, useState } from 'react';
import { PixelMouseParallax } from '../../public-api';
import { compareWithReact, reactParallax, transformIn } from './reference';

const ReactMouseParallax = reactParallax('PixelMouseParallax');

@Component({
  imports: [PixelMouseParallax],
  template: `<pxl-mouse-parallax [strength]="20">Layer</pxl-mouse-parallax>`,
})
class Plain {}

describe('PixelMouseParallax', () => {
  it('eases towards the cursor across its group on every frame, as in React', async () => {
    const ReactHost = () =>
      createElement('div', { className: 'relative' }, createElement(ReactMouseParallax, { strength: 20 }, 'Layer'));
    @Component({
      imports: [PixelMouseParallax],
      template: `<div class="relative"><pxl-mouse-parallax [strength]="20">Layer</pxl-mouse-parallax></div>`,
    })
    class Host {}
    const { react, angular } = await compareWithReact({ react: ReactHost, angular: Host }, [
      { action: 'wait', ms: 16 },
      { action: 'mousemove', clientX: 300, clientY: 150 },
      { action: 'wait', ms: 16 },
      { action: 'wait', ms: 16 },
      { action: 'wait', ms: 2000 },
      { action: 'mousemove', clientX: 0, clientY: 100 },
      { action: 'wait', ms: 48 },
    ]);
    expect(angular).toEqual(react);
    expect(transformIn(angular[0]!)).toBe('');
    expect(transformIn(angular[1]!)).toBe('translate3d(0px, 0px, 0)');
    // Half way right and half way up the group: 10 px right and 10 px up, 8 % at a time.
    expect(transformIn(angular[3]!)).toBe('translate3d(0.8px, -0.8px, 0)');
    expect(transformIn(angular[5]!)).toMatch(/^translate3d\(9\.99\d*px, -9\.99\d*px, 0\)$/);
    expect(transformIn(angular[7]!)).not.toBe(transformIn(angular[5]!));
  });

  it('flees the cursor across the page when inverted, and keeps easing from where it is when its strength changes, as in React', async () => {
    const ReactHost = () => {
      const [strength, setStrength] = useState(20);
      return createElement(
        'div',
        null,
        createElement('button', { type: 'button', onClick: () => setStrength(40) }, 'Stronger'),
        createElement(ReactMouseParallax, { strength, invert: true }, 'Layer'),
      );
    };
    @Component({
      imports: [PixelMouseParallax],
      template: `
        <div>
          <button type="button" (click)="strength.set(40)">Stronger</button>
          <pxl-mouse-parallax [strength]="strength()" invert>Layer</pxl-mouse-parallax>
        </div>
      `,
    })
    class Host {
      readonly strength = signal(20);
    }
    const { react, angular } = await compareWithReact({ react: ReactHost, angular: Host }, [
      { action: 'mousemove', clientX: 300, clientY: 150 },
      { action: 'wait', ms: 16 },
      { action: 'wait', ms: 16 },
      { action: 'click', target: 'button' },
      { action: 'wait', ms: 16 },
      { action: 'mousemove', clientX: 300, clientY: 150 },
      { action: 'wait', ms: 32 },
    ]);
    expect(angular).toEqual(react);
    expect(transformIn(angular[2]!)).toBe('translate3d(-0.8px, 0.8px, 0)');
    const [before, after] = [angular[3]!, angular[5]!].map((state) =>
      Number(/^translate3d\((-?[\d.]+)px/.exec(transformIn(state))![1]),
    );
    expect(after).toBeLessThan(before!);
    expect(after).toBeGreaterThan(-10);
  });

  it('holds still while the user prefers reduced motion, as in React, and follows the preference as it changes', async () => {
    const ReactHost = () => createElement(ReactMouseParallax, { strength: 20 }, 'Layer');
    const { react, angular } = await compareWithReact(
      { react: ReactHost, angular: Plain },
      [
        { action: 'mousemove', clientX: 300, clientY: 150 },
        { action: 'wait', ms: 48 },
        { action: 'reduced-motion', reduce: false },
        { action: 'wait', ms: 16 },
        { action: 'mousemove', clientX: 300, clientY: 150 },
        { action: 'wait', ms: 16 },
        { action: 'reduced-motion', reduce: true },
        { action: 'mousemove', clientX: 0, clientY: 100 },
        { action: 'wait', ms: 48 },
      ],
      { reducedMotion: true },
    );
    expect(angular).toEqual(react);
    expect(transformIn(angular[2]!)).toBe('');
    expect(transformIn(angular[4]!)).toBe('translate3d(0px, 0px, 0)');
    expect(transformIn(angular[6]!)).toBe('translate3d(0.8px, -0.8px, 0)');
    expect(transformIn(angular[9]!)).toBe('translate3d(0.8px, -0.8px, 0)');
  });

  it('stops its frame loop and mouse listener when it is destroyed', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    const removed = vi.spyOn(window, 'removeEventListener');
    try {
      const fixture = TestBed.createComponent(Plain);
      await fixture.whenStable();
      expect(vi.getTimerCount()).toBe(1);
      fixture.destroy();
      expect(vi.getTimerCount()).toBe(0);
      expect(removed.mock.calls.map(([type]) => type)).toContain('mousemove');
    } finally {
      removed.mockRestore();
      vi.useRealTimers();
    }
  });
});
