/**
 * <pxl-fade-in>: a focus-triggered fade compared with React's, its timing
 * inputs, the (complete) output and the block box its host makes. The
 * manifest examples are covered against React by the parity suite.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { PixelFadeIn } from '../../public-api';
import { compareWithReact, reactAnimation } from './reference';

describe('PixelFadeIn', () => {
  it('fades in while focus is inside, as in React', async () => {
    const ReactFadeIn = reactAnimation('PixelFadeIn');
    const ReactHost = () =>
      createElement(
        ReactFadeIn,
        { trigger: 'focus', duration: 300 },
        createElement('button', { type: 'button', id: 'first' }, 'First'),
        createElement('button', { type: 'button', id: 'second' }, 'Second'),
      );
    @Component({
      imports: [PixelFadeIn],
      template: `
        <pxl-fade-in trigger="focus" [duration]="300">
          <button type="button" id="first">First</button>
          <button type="button" id="second">Second</button>
        </pxl-fade-in>
      `,
    })
    class AngularHost {}
    const { react, angular } = await compareWithReact({ react: ReactHost, angular: AngularHost }, [
      { action: 'focus', target: '#first' },
      { action: 'focus', target: '#second' },
      { action: 'blur', target: '#second' },
    ]);
    expect(angular).toEqual(react);
    expect(angular.map((state) => state.includes('pxl-fade-in 300ms'))).toEqual([false, true, true, false]);
  });

  it('fades with its timing, emits (complete) at the end of the fade, and is a block box', async () => {
    @Component({
      imports: [PixelFadeIn],
      template: `
        <pxl-fade-in [duration]="600" [delay]="200" easing="ease-out" fillMode="forwards" (complete)="completed = completed + 1">
          x
        </pxl-fade-in>
      `,
    })
    class Host {
      completed = 0;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const fade = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('pxl-fade-in')!;
    expect(fade.style.animation).toBe('pxl-fade-in 600ms ease-out 200ms 1 forwards');
    fade.dispatchEvent(new Event('animationend', { bubbles: true }));
    expect(fixture.componentInstance.completed).toBe(1);
    const rules = Array.from(document.querySelectorAll('style'), (style) => style.textContent).join('\n');
    expect(rules).toContain('@layer base { pxl-fade-in { display: block; } }');
  });
});
