/**
 * <pxl-bounce>: the (complete) output, a click-triggered run compared with
 * React's, the restart of a playing run and the host's classes. The
 * manifest examples are covered against React by the parity suite.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { Fragment, createElement, useState } from 'react';
import { PixelBounce } from '../../public-api';
import { WRAPPER, compareWithReact, outputOf, reactAnimation } from './reference';

const animationEnd = () => new Event('animationend', { bubbles: true });

async function render<T>(Host: new () => T) {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return { fixture, bounce: (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('pxl-bounce')! };
}

describe('PixelBounce', () => {
  it('runs on each click and completes once per run, as in React', async () => {
    const ReactBounce = reactAnimation('PixelBounce');
    function ReactHost() {
      const [completed, setCompleted] = useState(0);
      return createElement(
        Fragment,
        null,
        createElement(
          ReactBounce,
          { trigger: 'click', repeat: 1, onComplete: () => setCompleted((count) => count + 1) },
          createElement('span', null, 'Bounce'),
        ),
        createElement('output', null, completed),
      );
    }
    @Component({
      imports: [PixelBounce],
      template: `
        <pxl-bounce trigger="click" [repeat]="1" (complete)="completed.set(completed() + 1)"><span>Bounce</span></pxl-bounce>
        <output>{{ completed() }}</output>
      `,
    })
    class AngularHost {
      readonly completed = signal(0);
    }
    const { react, angular } = await compareWithReact({ react: ReactHost, angular: AngularHost }, [
      { action: 'click', target: WRAPPER },
      { action: 'animationend', target: `${WRAPPER} span` },
      { action: 'animationend', target: WRAPPER },
      { action: 'click', target: WRAPPER },
      { action: 'click', target: WRAPPER },
      { action: 'animationend', target: WRAPPER },
    ]);
    expect(angular).toEqual(react);
    expect(angular.map(outputOf)).toEqual(['0', '0', '0', '1', '1', '1', '2']);
  });

  it('emits (complete) for its own animation only', async () => {
    @Component({
      imports: [PixelBounce],
      template: `<pxl-bounce [repeat]="1" (complete)="completed = completed + 1"><span>x</span></pxl-bounce>`,
    })
    class Host {
      completed = 0;
    }
    const { fixture, bounce } = await render(Host);
    bounce.querySelector('span')!.dispatchEvent(animationEnd());
    expect(fixture.componentInstance.completed).toBe(0);
    bounce.dispatchEvent(animationEnd());
    expect(fixture.componentInstance.completed).toBe(1);
  });

  it('starts a playing click-triggered run over on a click', async () => {
    @Component({ imports: [PixelBounce], template: `<pxl-bounce trigger="click">x</pxl-bounce>` })
    class Host {}
    const { fixture, bounce } = await render(Host);
    const animation = { cancel: vi.fn(), play: vi.fn() };
    const getAnimations = vi.fn(() => [animation]);
    Object.assign(bounce, { getAnimations });
    bounce.click();
    await fixture.whenStable();
    expect(getAnimations).not.toHaveBeenCalled();
    expect(bounce.style.animation).toContain('pxl-bounce');
    bounce.click();
    await fixture.whenStable();
    expect(getAnimations).toHaveBeenCalledWith({ subtree: true });
    expect(animation.cancel).toHaveBeenCalledOnce();
    expect(animation.play).toHaveBeenCalledOnce();
  });

  it('bounces to its height and keeps the classes set on the host', async () => {
    @Component({
      imports: [PixelBounce],
      template: `<pxl-bounce class="custom" repeat="3" [height]="16">x</pxl-bounce>`,
    })
    class Host {}
    const { bounce } = await render(Host);
    expect([...bounce.classList].sort()).toEqual(['custom', 'inline-block']);
    expect(bounce.style.animation).toBe('pxl-bounce 800ms ease 0ms 3 both');
    expect(bounce.style.getPropertyValue('--pxl-bounce-height')).toBe('16px');
  });
});
