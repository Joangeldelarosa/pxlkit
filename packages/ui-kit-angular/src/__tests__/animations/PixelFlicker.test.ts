/**
 * <pxl-flicker>: a controlled trigger compared with React's, and the
 * (complete) output of each hovered run. The manifest examples are covered
 * against React by the parity suite.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Fragment, createElement, useState } from 'react';
import { PixelFlicker } from '../../public-api';
import { compareWithReact, reactAnimation } from './reference';

describe('PixelFlicker', () => {
  it('plays while a controlled trigger is on, as in React', async () => {
    const ReactFlicker = reactAnimation('PixelFlicker');
    function ReactHost() {
      const [on, setOn] = useState(false);
      return createElement(
        Fragment,
        null,
        createElement(ReactFlicker, { trigger: on }, createElement('span', null, 'NEON')),
        createElement('button', { type: 'button', onClick: () => setOn((value) => !value) }, 'Toggle'),
      );
    }
    @Component({
      imports: [PixelFlicker],
      template: `
        <pxl-flicker [trigger]="on()"><span>NEON</span></pxl-flicker>
        <button type="button" (click)="on.set(!on())">Toggle</button>
      `,
    })
    class AngularHost {
      readonly on = signal(false);
    }
    const { react, angular } = await compareWithReact({ react: ReactHost, angular: AngularHost }, [
      { action: 'click', target: 'button' },
      { action: 'click', target: 'button' },
      { action: 'click', target: 'button' },
    ]);
    expect(angular).toEqual(react);
    expect(angular.map((state) => state.includes('pxl-flicker'))).toEqual([false, true, false, true]);
  });

  it('emits (complete) at the end of each hovered run', async () => {
    @Component({
      imports: [PixelFlicker],
      template: `<pxl-flicker trigger="hover" [repeat]="1" (complete)="completed = completed + 1">x</pxl-flicker>`,
    })
    class Host {
      completed = 0;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const flicker = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('pxl-flicker')!;
    for (const _run of [1, 2]) {
      flicker.dispatchEvent(new MouseEvent('mouseenter'));
      await fixture.whenStable();
      expect(flicker.style.animation).toBe('pxl-flicker 2200ms steps(1) 0ms 1 both');
      flicker.dispatchEvent(new Event('animationend', { bubbles: true }));
      flicker.dispatchEvent(new MouseEvent('mouseleave'));
      await fixture.whenStable();
      expect(flicker.style.animation).toBe('');
    }
    expect(fixture.componentInstance.completed).toBe(2);
  });
});
