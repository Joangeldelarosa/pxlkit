/**
 * Cross-framework parity: the Vue components must render exactly what the
 * React components in @pxlkit/core render — server-side, on mount, and frame
 * by frame while animating. Both sides run on the same engine, so any
 * difference here is an adapter bug.
 */
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { createElement, act, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  AnimatedPxlKitIcon as ReactAnimated,
  ParallaxPxlKitIcon as ReactParallax,
  PixelToast as ReactToast,
  PxlKitIcon as ReactIcon,
} from '@pxlkit/core';
import { createApp, createSSRApp, h, nextTick, type App, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import type { AnimatedPxlKitData, AnimationTrigger, IconAppearance } from '@pxlkit/core/vanilla';
import { AnimatedPxlKitIcon, ParallaxPxlKitIcon, PixelToast, PxlKitIcon } from '../index';
import { canonicalDom, canonicalHtml } from './dom';
import { testAnimatedIcon, testIcon, testIconWithAlpha, testParallaxIcon } from './fixtures';

type Props = Record<string, unknown>;

/** Vue takes `ariaLabel` as a prop; React takes the `aria-label` attribute name. */
function toReactProps(props: Props): Props {
  const { ariaLabel, ...rest } = props;
  return ariaLabel === undefined ? rest : { ...rest, 'aria-label': ariaLabel };
}

async function vueSsr(component: Component, props: Props): Promise<string> {
  return canonicalHtml(await renderToString(createSSRApp({ render: () => h(component, props) })));
}

function reactSsr(component: ComponentType<never>, props: Props): string {
  return canonicalHtml(renderToStaticMarkup(createElement(component, toReactProps(props) as never)));
}

const appearances: IconAppearance[] = ['palette', 'tinted', 'solid'];
const colors = [undefined, '#FF5500'];
const animatedIcon3: AnimatedPxlKitData = {
  ...testAnimatedIcon,
  name: 'three-frames',
  frames: [
    testAnimatedIcon.frames[0],
    testAnimatedIcon.frames[1],
    { grid: ['A.......', ...testAnimatedIcon.frames[0].grid.slice(1)], palette: { A: '#123456' } },
  ],
};

describe('React ↔ Vue parity — server rendering', () => {
  it('PxlKitIcon', async () => {
    for (const icon of [testIcon, testIconWithAlpha]) {
      for (const appearance of appearances) for (const color of colors) for (const size of [16, 32, 50]) {
        for (const ariaLabel of [undefined, 'Label']) for (const decorative of [undefined, true]) {
          const props = { icon, appearance, color, size, ariaLabel, decorative };
          expect(await vueSsr(PxlKitIcon, props)).toBe(reactSsr(ReactIcon, props));
        }
      }
    }
  });

  it('AnimatedPxlKitIcon', async () => {
    const triggers: Array<AnimationTrigger | undefined> = [undefined, 'loop', 'once', 'hover', 'appear', 'ping-pong'];
    for (const trigger of triggers) for (const appearance of appearances) for (const size of [24, 48]) {
      const props = { icon: animatedIcon3, trigger, appearance, color: '#ABCDEF', size, ariaLabel: size === 24 ? 'Anim' : undefined };
      expect(await vueSsr(AnimatedPxlKitIcon, props)).toBe(reactSsr(ReactAnimated, props));
    }
    for (const decorative of [false, true]) {
      const props = { icon: animatedIcon3, ariaLabel: 'Anim', decorative };
      expect(await vueSsr(AnimatedPxlKitIcon, props)).toBe(reactSsr(ReactAnimated, props));
    }
  });

  it('ParallaxPxlKitIcon', async () => {
    const icon = { ...testParallaxIcon, layers: [...testParallaxIcon.layers, { icon: testAnimatedIcon, depth: 1 }] };
    for (const size of [32, 64, 100]) for (const shadow of [true, false]) for (const interactive of [true, false]) {
      for (const extra of [
        {},
        { perspective: 500, layerGap: 7 },
        { appearance: 'solid' as const, color: '#F00' },
        { decorative: true, ariaLabel: 'Label' },
      ]) {
        const props = { icon, size, shadow, interactive, ...extra };
        expect(await vueSsr(ParallaxPxlKitIcon, props)).toBe(reactSsr(ReactParallax, props));
      }
    }
  });

  it('PixelToast', async () => {
    const variants: Props[] = [
      { visible: false, title: 'T' },
      { visible: true, title: 'T' },
      { visible: true, title: 'T', message: 'M', icon: testIcon },
      { visible: true, title: 'T', icon: testIcon, colorfulIcon: false, iconSize: 40, accentColor: '#ff0000' },
      { visible: true, title: 'T', showClose: false, position: 'bottom-left', bgColor: '#000', borderColor: '#111', textColor: '#222' },
      { visible: true, title: 'T', position: 'top-left' },
      { visible: true, title: 'T', position: 'bottom-right' },
    ];
    for (const props of variants) {
      expect(await vueSsr(PixelToast, props)).toBe(reactSsr(ReactToast, props));
    }
  });
});

describe('React ↔ Vue parity — client rendering', () => {
  let roots: Root[] = [];
  let apps: App[] = [];

  beforeAll(() => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    act(() => roots.forEach((root) => root.unmount()));
    roots = [];
    apps.forEach((app) => app.unmount());
    apps = [];
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function mountReact(component: ComponentType<never>, props: Props): HTMLElement {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    roots.push(root);
    act(() => root.render(createElement(component, toReactProps(props) as never)));
    return host;
  }

  function mountVue(component: Component, props: Props): HTMLElement {
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp({ render: () => h(component, props) });
    apps.push(app);
    app.mount(host);
    return host;
  }

  it('decorative icons mount with the same markup: empty alts and a hidden parallax container', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const parallax = { ...testParallaxIcon, layers: [...testParallaxIcon.layers, { icon: testAnimatedIcon, depth: 1 }] };
    const decorative = { decorative: true, ariaLabel: 'Label' };
    const cases: Array<[ComponentType<never>, Component, Props, string | null]> = [
      [ReactIcon, PxlKitIcon, { icon: testIcon, ...decorative }, null],
      [ReactAnimated, AnimatedPxlKitIcon, { icon: animatedIcon3, ...decorative }, null],
      [ReactParallax, ParallaxPxlKitIcon, { icon: parallax, ...decorative }, 'true'],
    ];
    for (const [reactComponent, vueComponent, props, hidden] of cases) {
      const reactHost = mountReact(reactComponent, props);
      expect(canonicalDom(mountVue(vueComponent, props))).toBe(canonicalDom(reactHost));
      // React's rendering is decorative, so the comparison is not vacuous.
      const alts = Array.from(reactHost.querySelectorAll('img'), (img) => img.getAttribute('alt'));
      expect(alts.length).toBeGreaterThan(0);
      expect(alts.filter((alt) => alt !== '')).toEqual([]);
      expect(reactHost.firstElementChild!.getAttribute('aria-hidden')).toBe(hidden);
    }
  });

  it('AnimatedPxlKitIcon plays the same frames at the same times for every trigger', async () => {
    const triggers: AnimationTrigger[] = ['loop', 'once', 'hover', 'ping-pong'];
    for (const trigger of triggers) {
      for (const timing of [{}, { speed: 2 }, { fps: 12 }]) {
        vi.useFakeTimers();
        const props = { icon: animatedIcon3, trigger, ...timing };
        const reactHost = mountReact(ReactAnimated, props);
        const vueHost = mountVue(AnimatedPxlKitIcon, props);
        for (let tick = 0; tick < 30; tick++) {
          if (tick === 3) {
            act(() => reactHost.firstElementChild!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
            vueHost.firstElementChild!.dispatchEvent(new MouseEvent('mouseenter'));
          }
          act(() => vi.advanceTimersByTime(37));
          await nextTick();
          expect(canonicalDom(vueHost), `${trigger} ${JSON.stringify(timing)} tick ${tick}`).toBe(canonicalDom(reactHost));
        }
        act(() => roots.forEach((root) => root.unmount()));
        roots = [];
        apps.forEach((app) => app.unmount());
        apps = [];
        vi.useRealTimers();
      }
    }
  });

  it('ParallaxPxlKitIcon settles on the same 3D stack and active state', async () => {
    let now = 0;
    let frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    // jsdom has no canvas: hand the particle renderer a context that draws nothing.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      (() => ({ clearRect() {}, fillRect() {}, globalAlpha: 1, fillStyle: '' })) as unknown as HTMLCanvasElement['getContext'],
    );
    // The click jolt and particles are random; pin them so both sides match.
    vi.spyOn(Math, 'random').mockReturnValue(0.25);
    const step = (count: number) => {
      for (let i = 0; i < count; i++) {
        now += 16;
        const due = frames;
        frames = [];
        act(() => due.forEach((cb) => cb(now)));
      }
    };

    const props = { icon: testParallaxIcon, size: 80, layerGap: 20 };
    const reactHost = mountReact(ReactParallax, props);
    const vueHost = mountVue(ParallaxPxlKitIcon, props);
    expect(canonicalDom(vueHost)).toBe(canonicalDom(reactHost));

    step(60);
    const sceneTransform = (host: HTMLElement) => (host.firstElementChild!.firstElementChild as HTMLElement).style.transform;
    expect(canonicalDom(vueHost)).toBe(canonicalDom(reactHost));
    expect(sceneTransform(vueHost)).toBe(sceneTransform(reactHost));

    act(() => (reactHost.firstElementChild as HTMLElement).click());
    (vueHost.firstElementChild as HTMLElement).click();
    await nextTick();
    step(200); // burst decayed on both sides
    expect(canonicalDom(vueHost)).toBe(canonicalDom(reactHost));
  });
});
