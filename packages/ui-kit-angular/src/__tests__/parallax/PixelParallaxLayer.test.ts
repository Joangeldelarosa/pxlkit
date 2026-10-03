/**
 * <pxl-parallax-layer>: following the scroll, compared with React's — along
 * each axis, at a negative speed, through a change of inputs — reduced
 * motion, which holds it still, and the loop it stops when destroyed. The
 * manifest examples are covered against React by the parity suite; zone.js
 * applications by the zone suite.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { createElement, useState } from 'react';
import { PixelParallaxLayer, type ParallaxAxis } from '../../public-api';
import { compareWithReact, reactParallax, transformIn } from './reference';

const ReactParallaxLayer = reactParallax('PixelParallaxLayer');

@Component({
  imports: [PixelParallaxLayer],
  template: `<pxl-parallax-layer [speed]="0.5">Layer</pxl-parallax-layer>`,
})
class Plain {}

describe('PixelParallaxLayer', () => {
  it('follows the scroll on every frame, as in React', async () => {
    const ReactHost = () => createElement(ReactParallaxLayer, { speed: 0.5 }, 'Layer');
    const { react, angular } = await compareWithReact({ react: ReactHost, angular: Plain }, [
      { action: 'wait', ms: 16 },
      { action: 'scroll', y: 200 },
      { action: 'wait', ms: 16 },
      { action: 'scroll', y: 600 },
      { action: 'wait', ms: 16 },
    ]);
    expect(angular).toEqual(react);
    // The layer's centre is 200 px down the page, the viewport's 384 px below the scroll.
    expect(angular.map(transformIn)).toEqual([
      '',
      'translate3d(0, 92px, 0)',
      'translate3d(0, 92px, 0)',
      'translate3d(0, 192px, 0)',
      'translate3d(0, 192px, 0)',
      'translate3d(0, 392px, 0)',
    ]);
  });

  it('moves along each axis and the other way at a negative speed, a change applying on the next frame, as in React', async () => {
    const ReactHost = () => {
      const [axis, setAxis] = useState<ParallaxAxis>('x');
      const [speed, setSpeed] = useState(1);
      return createElement(
        'div',
        null,
        createElement('button', { type: 'button', id: 'both', onClick: () => setAxis('both') }, 'Both'),
        createElement('button', { type: 'button', id: 'reverse', onClick: () => setSpeed(-0.3) }, 'Reverse'),
        createElement(ReactParallaxLayer, { axis, speed }, 'Layer'),
      );
    };
    @Component({
      imports: [PixelParallaxLayer],
      template: `
        <div>
          <button type="button" id="both" (click)="axis.set('both')">Both</button>
          <button type="button" id="reverse" (click)="speed.set(-0.3)">Reverse</button>
          <pxl-parallax-layer [axis]="axis()" [speed]="speed()">Layer</pxl-parallax-layer>
        </div>
      `,
    })
    class Host {
      readonly axis = signal<ParallaxAxis>('x');
      readonly speed = signal(1);
    }
    const { react, angular } = await compareWithReact({ react: ReactHost, angular: Host }, [
      { action: 'wait', ms: 16 },
      { action: 'click', target: '#both' },
      { action: 'wait', ms: 16 },
      { action: 'click', target: '#reverse' },
      { action: 'scroll', y: 100 },
      { action: 'wait', ms: 16 },
    ]);
    expect(angular).toEqual(react);
    expect(transformIn(angular[1]!)).toBe('translate3d(184px, 0, 0)');
    expect(transformIn(angular[3]!)).toBe('translate3d(184px, 184px, 0)');
    expect(transformIn(angular[6]!)).toBe(`translate3d(${284 * -0.3}px, ${284 * -0.3}px, 0)`);
  });

  it('holds still while the user prefers reduced motion, as in React, and follows the preference as it changes', async () => {
    const ReactHost = () => createElement(ReactParallaxLayer, { speed: 0.5 }, 'Layer');
    const { react, angular } = await compareWithReact(
      { react: ReactHost, angular: Plain },
      [
        { action: 'wait', ms: 48 },
        { action: 'reduced-motion', reduce: false },
        { action: 'wait', ms: 16 },
        { action: 'reduced-motion', reduce: true },
        { action: 'scroll', y: 200 },
        { action: 'wait', ms: 48 },
      ],
      { reducedMotion: true },
    );
    expect(angular).toEqual(react);
    expect(angular.map(transformIn)).toEqual([
      '',
      '',
      '',
      'translate3d(0, 92px, 0)',
      'translate3d(0, 92px, 0)',
      'translate3d(0, 92px, 0)',
      'translate3d(0, 92px, 0)',
    ]);
  });

  it('falls back to its defaults for unset inputs, and stops its frame loop when it is destroyed', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    try {
      @Component({
        imports: [PixelParallaxLayer],
        template: `<pxl-parallax-layer [speed]="undefined" [axis]="undefined">Layer</pxl-parallax-layer>`,
      })
      class Host {}
      const fixture = TestBed.createComponent(Host);
      await fixture.whenStable();
      expect(vi.getTimerCount()).toBe(1);
      vi.advanceTimersToNextFrame();
      const layer = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('pxl-parallax-layer')!;
      expect(layer.style.transform).toBe(`translate3d(0, ${(window.innerHeight / 2) * 0.5}px, 0)`);
      fixture.destroy();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
