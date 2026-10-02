/**
 * <pxl-slide-in>: a click-triggered slide compared with React's, and its
 * edge and distance. The manifest examples are covered against React by the
 * parity suite.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { PixelSlideIn } from '../../public-api';
import { WRAPPER, compareWithReact, reactAnimation } from './reference';

describe('PixelSlideIn', () => {
  it('slides in on a click, waits for the next one once the run ends, as in React', async () => {
    const ReactSlideIn = reactAnimation('PixelSlideIn');
    const ReactHost = () => createElement(ReactSlideIn, { trigger: 'click', from: 'up' }, createElement('p', null, 'Slide'));
    @Component({
      imports: [PixelSlideIn],
      template: `<pxl-slide-in trigger="click" from="up"><p>Slide</p></pxl-slide-in>`,
    })
    class AngularHost {}
    const { react, angular } = await compareWithReact({ react: ReactHost, angular: AngularHost }, [
      { action: 'click', target: WRAPPER },
      { action: 'animationend', target: WRAPPER },
      { action: 'click', target: `${WRAPPER} p` },
    ]);
    expect(angular).toEqual(react);
    expect(angular.map((state) => state.includes('pxl-slide-up 350ms ease 0ms 1 both'))).toEqual([false, true, false, true]);
  });

  it('slides from its edge over its distance', async () => {
    @Component({
      imports: [PixelSlideIn],
      template: `<pxl-slide-in from="left" [distance]="20" [delay]="100">x</pxl-slide-in>`,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const style = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('pxl-slide-in')!.style;
    expect(style.animation).toBe('pxl-slide-left 350ms ease 100ms 1 both');
    expect(style.getPropertyValue('--pxl-slide-distance')).toBe('20px');
  });
});
