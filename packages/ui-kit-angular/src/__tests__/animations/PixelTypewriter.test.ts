/**
 * <pxl-typewriter>: the typing and its (complete) output, the text the
 * screen reader gets, reduced motion, the in-view trigger without
 * IntersectionObserver, and click and changing triggers compared with
 * React. The manifest examples are covered against React by the parity
 * suite.
 */
import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Fragment, createElement, useState } from 'react';
import { PixelTypewriter, type AnimationTrigger } from '../../public-api';
import { installMatchMedia } from '../match-media';
import { WRAPPER, compareWithReact, reactAnimation, textIn } from './reference';

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(window, 'matchMedia');
});

@Component({
  imports: [PixelTypewriter],
  template: `
    <pxl-typewriter
      [label]="label()"
      [text]="text()"
      [speed]="10"
      [cursor]="cursor()"
      [tone]="'cyan'"
      [trigger]="trigger()"
      (complete)="completed = completed + 1"
    />
  `,
})
class Host {
  readonly label = signal<string | undefined>('HELLO');
  readonly text = signal<string | undefined>(undefined);
  readonly cursor = signal(true);
  readonly trigger = signal<AnimationTrigger>('mount');
  completed = 0;
}

async function render(setup: (host: Host) => void = () => {}) {
  const fixture = TestBed.createComponent(Host);
  setup(fixture.componentInstance);
  await settle(fixture);
  const writer = (fixture.nativeElement as HTMLElement).querySelector('pxl-typewriter')!;
  return {
    fixture,
    host: fixture.componentInstance,
    writer,
    typed: () => writer.querySelector('[aria-hidden="true"]')!.textContent,
    spoken: () => writer.querySelector('.sr-only')!.textContent,
  };
}

async function settle(fixture: ComponentFixture<unknown>) {
  await fixture.whenStable();
  await new Promise((done) => setTimeout(done, 0));
  await fixture.whenStable();
}

/** Runs the typing's intervals due within `ms`. */
async function type(fixture: ComponentFixture<unknown>, ms: number) {
  vi.advanceTimersByTime(ms);
  await settle(fixture);
}

/** What a recorded state shows typed: the text and caret of the visual layer. */
const typedIn = (state: string) =>
  textIn(state, (element) => element.attributes.some(([name, value]) => name === 'aria-hidden' && value === 'true'));

describe('PixelTypewriter', () => {
  // The typing's intervals are fake, so it types only as far as each test
  // runs them, however long a render takes; timeouts stay real for the
  // zoneless scheduler.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  });

  it('types one character at a time, then drops the caret and emits (complete) once', async () => {
    const { fixture, host, typed, spoken } = await render();
    expect(typed()).toBe('▌');
    expect(spoken()).toBe('HELLO');
    await type(fixture, 30);
    expect(typed()).toBe('HEL▌');
    await type(fixture, 20);
    expect(typed()).toBe('HELLO');
    await type(fixture, 500);
    expect(host.completed).toBe(1);
  });

  it('types its label rather than the deprecated text, in its tone, without a caret if asked', async () => {
    const { fixture, host, writer, typed, spoken } = await render((host) => {
      host.label.set('NEW');
      host.text.set('OLD');
      host.cursor.set(false);
    });
    await type(fixture, 10);
    expect(typed()).toBe('N');
    await type(fixture, 20);
    expect(typed()).toBe('NEW');
    expect(spoken()).toBe('NEW');
    expect([...writer.classList]).toEqual(['font-mono', 'text-retro-cyan']);
    host.label.set(undefined);
    await settle(fixture);
    expect(spoken()).toBe('OLD');
  });

  it('shows the whole text at once under reduced motion, completing once', async () => {
    installMatchMedia((query) => query === '(prefers-reduced-motion: reduce)');
    const { fixture, host, typed } = await render();
    expect(typed()).toBe('HELLO');
    host.label.set('AGAIN');
    await type(fixture, 500);
    expect(typed()).toBe('AGAIN');
    expect(host.completed).toBe(1);
  });

  it('types at once in view where IntersectionObserver is missing', async () => {
    const { fixture, typed } = await render((host) => host.trigger.set('inView'));
    expect(typed()).toBe('▌');
    await type(fixture, 50);
    expect(typed()).toBe('HELLO');
  });
});

describe('PixelTypewriter, compared with React', () => {
  it('types on a click and clears once the run ends', async () => {
    const ReactTypewriter = reactAnimation('PixelTypewriter');
    const ReactHost = () => createElement(ReactTypewriter, { label: 'GO', trigger: 'click' });
    @Component({ imports: [PixelTypewriter], template: `<pxl-typewriter label="GO" trigger="click" />` })
    class AngularHost {}
    const { react, angular } = await compareWithReact(
      { react: ReactHost, angular: AngularHost },
      [
        { action: 'click', target: WRAPPER },
        { action: 'wait', ms: 90 },
        { action: 'wait', ms: 60 },
      ],
    );
    expect(angular).toEqual(react);
    expect(angular.map(typedIn)).toEqual(['', '▌', 'G▌', '']);
  });

  it('starts over when its trigger changes', async () => {
    const ReactTypewriter = reactAnimation('PixelTypewriter');
    function ReactHost() {
      const [trigger, setTrigger] = useState<boolean | 'mount'>(true);
      return createElement(
        Fragment,
        null,
        createElement(ReactTypewriter, { label: 'GO', trigger }),
        createElement('button', { type: 'button', onClick: () => setTrigger('mount') }, 'Switch'),
      );
    }
    @Component({
      imports: [PixelTypewriter],
      template: `
        <pxl-typewriter label="GO" [trigger]="trigger()" />
        <button type="button" (click)="trigger.set('mount')">Switch</button>
      `,
    })
    class AngularHost {
      readonly trigger = signal<boolean | 'mount'>(true);
    }
    const { react, angular } = await compareWithReact(
      { react: ReactHost, angular: AngularHost },
      [
        { action: 'wait', ms: 150 },
        { action: 'click', target: 'button' },
        { action: 'wait', ms: 90 },
      ],
    );
    expect(angular).toEqual(react);
    expect(angular.map(typedIn)).toEqual(['▌', 'GO', '▌', 'G▌']);
  });
});
