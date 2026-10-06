/**
 * <pxl-shake>: shaking on demand — a controlled trigger reset by (complete) —
 * compared with React, and a `repeat` written as an attribute. The manifest
 * examples are covered against React by the parity suite.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Fragment, createElement, useState } from 'react';
import { PixelShake } from '../../public-api';
import { WRAPPER, compareWithReact, reactAnimation } from './reference';

describe('PixelShake', () => {
  it('shakes once per invalid submit, its owner resetting the trigger on (complete), as in React', async () => {
    const ReactShake = reactAnimation('PixelShake');
    function ReactHost() {
      const [invalid, setInvalid] = useState(false);
      return createElement(
        Fragment,
        null,
        createElement(
          ReactShake,
          { trigger: invalid, distance: 6, onComplete: () => setInvalid(false) },
          createElement('span', null, 'Wrong password'),
        ),
        createElement('button', { type: 'button', onClick: () => setInvalid(true) }, 'Submit'),
      );
    }
    @Component({
      imports: [PixelShake],
      template: `
        <pxl-shake [trigger]="invalid()" [distance]="6" (complete)="invalid.set(false)"><span>Wrong password</span></pxl-shake>
        <button type="button" (click)="invalid.set(true)">Submit</button>
      `,
    })
    class AngularHost {
      readonly invalid = signal(false);
    }
    const { react, angular } = await compareWithReact({ react: ReactHost, angular: AngularHost }, [
      { action: 'click', target: 'button' },
      { action: 'animationend', target: WRAPPER },
      { action: 'click', target: 'button' },
    ]);
    expect(angular).toEqual(react);
    expect(angular.map((state) => state.includes('pxl-shake 450ms linear 0ms 1 both'))).toEqual([false, true, false, true]);
  });

  it("reads a repeat count written as an attribute, and 'infinite'", async () => {
    @Component({
      imports: [PixelShake],
      template: `<pxl-shake repeat="3">x</pxl-shake><pxl-shake repeat="infinite">y</pxl-shake>`,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [counted, endless] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('pxl-shake'));
    expect(counted!.style.animation).toBe('pxl-shake 450ms linear 0ms 3 both');
    expect(endless!.style.animation).toBe('pxl-shake 450ms linear 0ms infinite both');
  });
});
