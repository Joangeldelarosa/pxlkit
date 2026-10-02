/**
 * <pxl-glitch>: reduced motion compared with React, the layers its marked
 * content renders in (and unmarked content, projected once), and the
 * (complete) output of the content's own layer. The manifest examples are
 * covered against React by the parity suite.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { PixelGlitch, PixelGlitchContent } from '../../public-api';
import { compareWithReact, reactAnimation } from './reference';

const animationEnd = () => new Event('animationend', { bubbles: true });

async function render<T>(Host: new () => T) {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return { fixture, glitch: (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('pxl-glitch')! };
}

describe('PixelGlitch', () => {
  it('shows the content alone and still while the user prefers reduced motion, as in React', async () => {
    const ReactGlitch = reactAnimation('PixelGlitch');
    const ReactHost = () => createElement(ReactGlitch, { intensity: 6 }, createElement('b', null, 'GLITCH'));
    @Component({
      imports: [PixelGlitch, PixelGlitchContent],
      template: `<pxl-glitch [intensity]="6"><b *pxlGlitchContent>GLITCH</b></pxl-glitch>`,
    })
    class AngularHost {}
    const { react, angular } = await compareWithReact(
      { react: ReactHost, angular: AngularHost },
      [
        { action: 'reduced-motion', reduce: false },
        { action: 'reduced-motion', reduce: true },
      ],
      { reducedMotion: true },
    );
    expect(angular).toEqual(react);
    expect(angular.map((state) => state.match(/GLITCH/g)!.length)).toEqual([1, 3, 1]);
  });

  it('repeats its marked content in the two ghost layers, hidden from assistive technology, while it plays', async () => {
    @Component({
      imports: [PixelGlitch, PixelGlitchContent],
      template: `<pxl-glitch [trigger]="on()"><b *pxlGlitchContent>{{ word() }}</b></pxl-glitch>`,
    })
    class Host {
      readonly on = signal(false);
      readonly word = signal('GLITCH');
    }
    const { fixture, glitch } = await render(Host);
    expect(glitch.querySelectorAll('b')).toHaveLength(1);
    fixture.componentInstance.on.set(true);
    fixture.componentInstance.word.set('ONLINE');
    await fixture.whenStable();
    expect(Array.from(glitch.querySelectorAll('b'), (word) => word.textContent)).toEqual(['ONLINE', 'ONLINE', 'ONLINE']);
    expect(Array.from(glitch.querySelectorAll<HTMLElement>('[aria-hidden="true"]'), (layer) => layer.style.animation)).toEqual([
      'pxl-glitch-r 3000ms steps(1) infinite',
      'pxl-glitch-c 3000ms steps(1) infinite',
    ]);
  });

  it('projects unmarked content once, in the layer that glitches', async () => {
    @Component({ imports: [PixelGlitch], template: `<pxl-glitch><b>GLITCH</b></pxl-glitch>` })
    class Host {}
    const { glitch } = await render(Host);
    expect(glitch.querySelectorAll('b')).toHaveLength(1);
    expect(glitch.children).toHaveLength(1);
    expect((glitch.firstElementChild as HTMLElement).style.animation).toBe('pxl-glitch 3000ms steps(1) infinite');
  });

  it("emits (complete) when the content's own layer ends its animation", async () => {
    @Component({
      imports: [PixelGlitch, PixelGlitchContent],
      template: `<pxl-glitch (complete)="completed = completed + 1"><b *pxlGlitchContent>GLITCH</b></pxl-glitch>`,
    })
    class Host {
      completed = 0;
    }
    const { fixture, glitch } = await render(Host);
    const [red, , main] = Array.from(glitch.children);
    glitch.dispatchEvent(animationEnd());
    red!.dispatchEvent(animationEnd());
    main!.firstElementChild!.dispatchEvent(animationEnd());
    expect(fixture.componentInstance.completed).toBe(0);
    main!.dispatchEvent(animationEnd());
    expect(fixture.componentInstance.completed).toBe(1);
  });
});
