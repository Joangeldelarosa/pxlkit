/**
 * Cross-framework parity: the Angular components must render what the React
 * components in @pxlkit/core render — on mount, after every input change and
 * frame by frame while animating. Both sides run on the same engine, so any
 * difference here is an adapter bug.
 *
 * An Angular component host stands in for the root element React renders
 * (see `canonicalDom`). PxlKitIcon is the one structural exception — React
 * renders a bare `<img>`, Angular a `<pxl-icon>` box around the same `<img>` —
 * so it is compared image by image and box by box.
 */
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { createElement, act, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  AnimatedPxlKitIcon as ReactAnimated,
  ParallaxPxlKitIcon as ReactParallax,
  PixelToast as ReactToast,
  PxlKitIcon as ReactIcon,
} from '@pxlkit/core';
import {
  AnimatedPxlKitIcon,
  ParallaxPxlKitIcon,
  PixelToast,
  PxlKitIcon,
  type AnimatedPxlKitData,
  type AnimationTrigger,
  type IconAppearance,
  type ParallaxPxlKitData,
  type PixelToastPosition,
  type PxlKitData,
} from '@pxlkit/angular';
import { canonicalDom } from './dom';
import { installAnimationFrames, installCanvas } from './harness';
import { testAnimatedIcon, testIcon, testIconWithAlpha, testParallaxIcon } from './fixtures';

interface IconProps {
  icon: PxlKitData;
  size?: number;
  appearance?: IconAppearance;
  color?: string;
  ariaLabel?: string;
  decorative?: boolean;
}

interface AnimatedProps extends Omit<IconProps, 'icon'> {
  icon: AnimatedPxlKitData;
  playing?: boolean;
  trigger?: AnimationTrigger;
  speed?: number;
  fps?: number;
}

interface ParallaxProps extends Omit<IconProps, 'icon'> {
  icon: ParallaxPxlKitData;
  strength?: number;
  smoothing?: number;
  perspective?: number;
  layerGap?: number;
  shadow?: boolean;
  interactive?: boolean;
}

interface ToastProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: PxlKitData;
  colorfulIcon?: boolean;
  iconSize?: number;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  accentColor?: string;
  position?: PixelToastPosition;
  duration?: number;
  showClose?: boolean;
}

@Component({
  imports: [PxlKitIcon],
  template: `<pxl-icon
    [icon]="p().icon"
    [size]="p().size"
    [appearance]="p().appearance"
    [color]="p().color"
    [ariaLabel]="p().ariaLabel"
    [decorative]="p().decorative"
  />`,
})
class IconHost {
  readonly p = signal<IconProps>({ icon: testIcon });
}

@Component({
  imports: [AnimatedPxlKitIcon],
  template: `<pxl-animated-icon
    [icon]="p().icon"
    [size]="p().size"
    [appearance]="p().appearance"
    [color]="p().color"
    [playing]="p().playing"
    [trigger]="p().trigger"
    [speed]="p().speed"
    [fps]="p().fps"
    [ariaLabel]="p().ariaLabel"
    [decorative]="p().decorative"
  />`,
})
class AnimatedHost {
  readonly p = signal<AnimatedProps>({ icon: testAnimatedIcon });
}

@Component({
  imports: [ParallaxPxlKitIcon],
  template: `<pxl-parallax-icon
    [icon]="p().icon"
    [size]="p().size"
    [strength]="p().strength"
    [appearance]="p().appearance"
    [color]="p().color"
    [smoothing]="p().smoothing"
    [perspective]="p().perspective"
    [layerGap]="p().layerGap"
    [shadow]="p().shadow"
    [interactive]="p().interactive"
    [ariaLabel]="p().ariaLabel"
    [decorative]="p().decorative"
  />`,
})
class ParallaxHost {
  readonly p = signal<ParallaxProps>({ icon: testParallaxIcon });
}

@Component({
  imports: [PixelToast],
  template: `<pxl-toast
    [visible]="p().visible"
    [title]="p().title"
    [message]="p().message"
    [icon]="p().icon"
    [colorfulIcon]="p().colorfulIcon"
    [iconSize]="p().iconSize"
    [bgColor]="p().bgColor"
    [borderColor]="p().borderColor"
    [textColor]="p().textColor"
    [accentColor]="p().accentColor"
    [position]="p().position"
    [duration]="p().duration"
    [showClose]="p().showClose"
  />`,
})
class ToastHost {
  readonly p = signal<ToastProps>({ visible: true, title: 'T' });
}

type Host<P> = { readonly p: { set(value: P): void } };

/** Angular takes `ariaLabel` as an input; React takes the `aria-label` attribute name. */
function toReactProps(props: object): Record<string, unknown> {
  const { ariaLabel, ...rest } = props as { ariaLabel?: string };
  return ariaLabel === undefined ? rest : { ...rest, 'aria-label': ariaLabel };
}

const appearances: IconAppearance[] = ['palette', 'tinted', 'solid'];
const animatedIcon3: AnimatedPxlKitData = {
  ...testAnimatedIcon,
  name: 'three-frames',
  frames: [
    testAnimatedIcon.frames[0],
    testAnimatedIcon.frames[1],
    { grid: ['A.......', ...testAnimatedIcon.frames[0].grid.slice(1)], palette: { A: '#123456' } },
  ],
};

describe('React ↔ Angular parity', () => {
  let roots: Root[] = [];

  beforeAll(() => {
    (globalThis as Record<string, unknown>)['IS_REACT_ACT_ENVIRONMENT'] = true;
  });

  afterEach(() => {
    act(() => roots.forEach((root) => root.unmount()));
    roots = [];
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function mountReact(component: ComponentType<never>, props: object) {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    roots.push(root);
    const render = (next: object) => act(() => root.render(createElement(component, toReactProps(next) as never)));
    render(props);
    return { container, render };
  }

  function mountAngular<P, H extends Host<P>>(host: new () => H, props: P) {
    const fixture: ComponentFixture<H> = TestBed.createComponent(host);
    const render = (next: P) => {
      fixture.componentInstance.p.set(next);
      fixture.detectChanges();
    };
    render(props);
    return { fixture, container: fixture.nativeElement as HTMLElement, render };
  }

  /** Renders `variants` in turn on both sides, comparing after each. */
  function expectSameDom<P extends object>(
    reactComponent: ComponentType<never>,
    angularHost: new () => Host<P>,
    variants: P[],
  ): void {
    const react = mountReact(reactComponent, variants[0]!);
    const angular = mountAngular(angularHost, variants[0]!);
    for (const props of variants) {
      react.render(props);
      angular.render(props);
      expect(canonicalDom(angular.container), JSON.stringify(props)).toBe(canonicalDom(react.container));
    }
  }

  it('PxlKitIcon renders the same image in the same box', () => {
    const variants: IconProps[] = [];
    for (const icon of [testIcon, testIconWithAlpha]) {
      for (const appearance of appearances) for (const color of [undefined, '#FF5500']) {
        for (const size of [16, 32, 50]) for (const ariaLabel of [undefined, 'Label']) {
          for (const decorative of [undefined, true]) variants.push({ icon, appearance, color, size, ariaLabel, decorative });
        }
      }
    }
    variants.push({ icon: testIcon }); // every input back to its default

    const react = mountReact(ReactIcon, variants[0]!);
    const angular = mountAngular(IconHost, variants[0]!);
    for (const props of variants) {
      react.render(props);
      angular.render(props);
      const reactImg = react.container.querySelector('img')!;
      const box = angular.container.querySelector('pxl-icon') as HTMLElement;
      const img = box.querySelector('img')!;
      for (const attribute of ['src', 'alt', 'width', 'height', 'draggable']) {
        expect(img.getAttribute(attribute), attribute).toBe(reactImg.getAttribute(attribute));
      }
      for (const property of ['display', 'vertical-align', 'flex-shrink']) {
        expect(box.style.getPropertyValue(property), property).toBe(reactImg.style.getPropertyValue(property));
      }
      expect(box.style.width).toBe(`${reactImg.getAttribute('width')}px`);
      expect(box.style.height).toBe(`${reactImg.getAttribute('height')}px`);
      expect(img.style.imageRendering).toBe(reactImg.style.imageRendering);
    }
  });

  it('AnimatedPxlKitIcon renders the same markup for every input', () => {
    const triggers: Array<AnimationTrigger | undefined> = [undefined, 'loop', 'once', 'hover', 'appear', 'ping-pong'];
    const variants: AnimatedProps[] = [];
    for (const trigger of triggers) for (const appearance of appearances) for (const size of [24, 48]) {
      variants.push({ icon: animatedIcon3, trigger, appearance, color: '#ABCDEF', size, ariaLabel: size === 24 ? 'Anim' : undefined });
    }
    variants.push({ icon: testAnimatedIcon, playing: false });
    variants.push({ icon: animatedIcon3, ariaLabel: 'Anim', decorative: true });
    variants.push({ icon: animatedIcon3, ariaLabel: 'Anim', decorative: false });
    expectSameDom(ReactAnimated, AnimatedHost, variants);
  });

  it('AnimatedPxlKitIcon plays the same frames at the same times for every trigger', async () => {
    const triggers: AnimationTrigger[] = ['loop', 'once', 'hover', 'ping-pong'];
    for (const trigger of triggers) {
      for (const timing of [{}, { speed: 2 }, { fps: 12 }]) {
        vi.useFakeTimers();
        const props: AnimatedProps = { icon: animatedIcon3, trigger, ...timing };
        const react = mountReact(ReactAnimated, props);
        const angular = mountAngular(AnimatedHost, props);
        for (let tick = 0; tick < 30; tick++) {
          if (tick === 3) {
            act(() => react.container.firstElementChild!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
            angular.container.firstElementChild!.dispatchEvent(new MouseEvent('mouseenter'));
          }
          if (tick === 20) {
            act(() => react.container.firstElementChild!.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })));
            angular.container.firstElementChild!.dispatchEvent(new MouseEvent('mouseleave'));
          }
          // Async: microtasks run between timers, as in a browser event loop.
          await act(() => vi.advanceTimersByTimeAsync(37));
          angular.fixture.detectChanges();
          const label = `${trigger} ${JSON.stringify(timing)} tick ${tick}`;
          expect(canonicalDom(angular.container), label).toBe(canonicalDom(react.container));
        }
        act(() => roots.forEach((root) => root.unmount()));
        roots = [];
        angular.fixture.destroy();
        vi.useRealTimers();
      }
    }
  });

  it('ParallaxPxlKitIcon renders the same 3D stack for every input', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const icon = { ...testParallaxIcon, layers: [...testParallaxIcon.layers, { icon: testAnimatedIcon, depth: 1 }] };
    const variants: ParallaxProps[] = [];
    for (const size of [32, 64, 100]) for (const shadow of [true, false]) for (const interactive of [true, false]) {
      for (const extra of [{}, { perspective: 500, layerGap: 7 }, { appearance: 'solid' as const, color: '#F00' }]) {
        variants.push({ icon, size, shadow, interactive, ...extra });
      }
    }
    variants.push({ icon: testParallaxIcon, ariaLabel: 'Label' });
    variants.push({ icon, ariaLabel: 'Label', decorative: true });
    variants.push({ icon, size: 32, interactive: false, decorative: true });
    variants.push({ icon, ariaLabel: 'Label', decorative: false });
    expectSameDom(ReactParallax, ParallaxHost, variants);
  });

  it('ParallaxPxlKitIcon settles on the same 3D stack and active state', () => {
    const frames = installAnimationFrames();
    installCanvas();
    // The click jolt and particles are random; pin them so both sides match.
    vi.spyOn(Math, 'random').mockReturnValue(0.25);
    const step = (count: number) => act(() => frames.step(count));

    const props: ParallaxProps = { icon: testParallaxIcon, size: 80, layerGap: 20 };
    const react = mountReact(ReactParallax, props);
    const angular = mountAngular(ParallaxHost, props);
    const sync = () => angular.fixture.detectChanges();
    const same = () => expect(canonicalDom(angular.container)).toBe(canonicalDom(react.container));
    same();

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 900, clientY: 40 }));
    step(60);
    sync();
    same();

    act(() => (react.container.firstElementChild as HTMLElement).click());
    (angular.container.firstElementChild as HTMLElement).click();
    sync();
    step(5); // mid-burst
    sync();
    same();
    step(200); // burst decayed on both sides
    sync();
    same();
  });

  it('renders decorative icons the same way: empty alts and a hidden parallax container', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const parallax = { ...testParallaxIcon, layers: [...testParallaxIcon.layers, { icon: testAnimatedIcon, depth: 1 }] };

    const icon: IconProps = { icon: testIcon, ariaLabel: 'Label', decorative: true };
    const reactImg = mountReact(ReactIcon, icon).container.querySelector('img')!;
    const img = mountAngular(IconHost, icon).container.querySelector('pxl-icon img')!;
    expect(reactImg.getAttribute('alt')).toBe('');
    expect(img.getAttribute('alt')).toBe('');

    const animated: AnimatedProps = { icon: animatedIcon3, ariaLabel: 'Label', decorative: true };
    const reactAnimated = mountReact(ReactAnimated, animated).container;
    expect(canonicalDom(mountAngular(AnimatedHost, animated).container)).toBe(canonicalDom(reactAnimated));
    expect(reactAnimated.querySelector('img')!.getAttribute('alt')).toBe('');

    const stack: ParallaxProps = { icon: parallax, ariaLabel: 'Label', decorative: true };
    const reactParallax = mountReact(ReactParallax, stack).container;
    expect(canonicalDom(mountAngular(ParallaxHost, stack).container)).toBe(canonicalDom(reactParallax));
    expect(reactParallax.firstElementChild!.getAttribute('aria-hidden')).toBe('true');
    expect(Array.from(reactParallax.querySelectorAll('img'), (layer) => layer.getAttribute('alt'))).toEqual(['', '', '', '']);
  });

  it('PixelToast renders the same markup for every input', () => {
    const variants: ToastProps[] = [
      { visible: true, title: 'T' },
      { visible: true, title: 'T', message: 'M', icon: testIcon },
      { visible: true, title: 'T', icon: testIcon, colorfulIcon: false, iconSize: 40, accentColor: '#ff0000' },
      {
        visible: true,
        title: 'T',
        showClose: false,
        position: 'bottom-left',
        bgColor: '#000',
        borderColor: '#111',
        textColor: '#222',
      },
      { visible: true, title: 'T', position: 'top-left' },
      { visible: true, title: 'T', position: 'bottom-right' },
      { visible: true, title: 'Back to the defaults' },
    ];
    expectSameDom(ReactToast, ToastHost, variants);
  });

  it('PixelToast renders nothing while hidden', () => {
    const react = mountReact(ReactToast, { visible: false, title: 'T' });
    const angular = mountAngular(ToastHost, { visible: false, title: 'T' });
    expect(react.container.childNodes).toHaveLength(0);
    const host = angular.container.querySelector('pxl-toast') as HTMLElement;
    expect(host.childElementCount).toBe(0);
    expect(host.style.display).toBe('none');
  });
});
