/**
 * <pxl-pulse>: a hover-triggered pulse with its completions compared with
 * React's. The manifest examples are covered against React by the parity
 * suite.
 */
import { Component, signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { Fragment, createElement, useState } from 'react';
import { PixelPulse } from '../../public-api';
import { WRAPPER, compareWithReact, outputOf, reactAnimation } from './reference';

describe('PixelPulse', () => {
  it('pulses while hovered and completes each finite run, as in React', async () => {
    const ReactPulse = reactAnimation('PixelPulse');
    function ReactHost() {
      const [completed, setCompleted] = useState(0);
      return createElement(
        Fragment,
        null,
        createElement(
          ReactPulse,
          { trigger: 'hover', repeat: 2, easing: 'linear', onComplete: () => setCompleted((count) => count + 1) },
          createElement('span', null, 'Pulse'),
        ),
        createElement('output', null, completed),
      );
    }
    @Component({
      imports: [PixelPulse],
      template: `
        <pxl-pulse trigger="hover" [repeat]="2" easing="linear" (complete)="completed.set(completed() + 1)">
          <span>Pulse</span>
        </pxl-pulse>
        <output>{{ completed() }}</output>
      `,
    })
    class AngularHost {
      readonly completed = signal(0);
    }
    const { react, angular } = await compareWithReact({ react: ReactHost, angular: AngularHost }, [
      { action: 'hover', target: WRAPPER },
      { action: 'animationend', target: WRAPPER },
      { action: 'unhover', target: WRAPPER },
      { action: 'hover', target: WRAPPER },
      { action: 'animationend', target: WRAPPER },
    ]);
    expect(angular).toEqual(react);
    expect(angular.map(outputOf)).toEqual(['0', '0', '1', '1', '1', '2']);
    expect(angular[1]).toContain('pxl-pulse 2000ms linear 0ms 2 both');
  });
});
