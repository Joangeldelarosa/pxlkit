/**
 * Server rendering with @angular/platform-server in a plain Node environment
 * — no DOM globals, as on a real server. The components must render their
 * complete markup, identical to React's `renderToStaticMarkup`, without
 * touching browser APIs or scheduling timers, intervals or animation frames.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, type BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import {
  AnimatedPxlKitIcon as ReactAnimated,
  ParallaxPxlKitIcon as ReactParallax,
  PixelToast as ReactToast,
  PxlKitIcon as ReactIcon,
} from '@pxlkit/core';
import { canonicalHtml } from '../dom';
import { SSR_DOCUMENT, SsrApp, ssrProps } from './app';

const parser = new JSDOM('').window.document;

function reactMarkup(component: ComponentType<never>, props: object): string {
  const { ariaLabel, ...rest } = props as { ariaLabel?: string };
  const reactProps = ariaLabel === undefined ? rest : { ...rest, 'aria-label': ariaLabel };
  return renderToStaticMarkup(createElement(component, reactProps as never));
}

describe('@pxlkit/angular server rendering', () => {
  let page: Document;
  const timeouts: number[] = [];
  let intervals = 0;

  beforeAll(async () => {
    expect(typeof window).toBe('undefined');
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const html = await renderApplication(
      (context: BootstrapContext) =>
        bootstrapApplication(
          SsrApp,
          { providers: [provideServerRendering(), provideZonelessChangeDetection()] },
          context,
        ),
      { document: SSR_DOCUMENT, url: 'http://localhost/', allowedHosts: ['localhost'] },
    );
    timeouts.push(...setTimeoutSpy.mock.calls.map(([, delay]) => Number(delay ?? 0)));
    intervals = setIntervalSpy.mock.calls.length;
    vi.restoreAllMocks();
    page = new JSDOM(html).window.document;
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const section = (id: string) => page.getElementById(id)!;

  it('starts no playback clock and no toast countdown', () => {
    expect(intervals).toBe(0);
    expect(timeouts.filter((delay) => delay >= ssrProps.toast.duration)).toEqual([]);
  });

  it('renders PxlKitIcon with the same image as React', () => {
    const reference = parser.createElement('div');
    reference.innerHTML = reactMarkup(ReactIcon, ssrProps.icon);
    const reactImg = reference.querySelector('img')!;
    const box = section('icon').querySelector('pxl-icon') as HTMLElement;
    const img = box.querySelector('img')!;
    for (const attribute of ['src', 'alt', 'width', 'height', 'draggable']) {
      expect(img.getAttribute(attribute), attribute).toBe(reactImg.getAttribute(attribute));
    }
    expect(box.style.width).toBe('48px');
    expect(box.style.display).toBe('inline-block');
    expect(img.style.imageRendering).toBe('pixelated');
  });

  it('renders AnimatedPxlKitIcon like React, on its first frame', () => {
    expect(canonicalHtml(section('animated').innerHTML, parser)).toBe(
      canonicalHtml(reactMarkup(ReactAnimated, ssrProps.animated), parser),
    );
  });

  it('renders ParallaxPxlKitIcon like React, as a flat stack', () => {
    expect(canonicalHtml(section('parallax').innerHTML, parser)).toBe(
      canonicalHtml(reactMarkup(ReactParallax, ssrProps.parallax), parser),
    );
  });

  it('renders a visible PixelToast like React', () => {
    expect(canonicalHtml(section('toast').innerHTML, parser)).toBe(
      canonicalHtml(reactMarkup(ReactToast, ssrProps.toast), parser),
    );
  });

  it('renders decorative icons like React: an empty alt and a hidden parallax container', () => {
    const reference = parser.createElement('div');
    reference.innerHTML = reactMarkup(ReactIcon, ssrProps.decorativeIcon);
    const img = section('decorative').querySelector('pxl-icon img')!;
    expect(img.getAttribute('alt')).toBe(reference.querySelector('img')!.getAttribute('alt'));
    expect(img.getAttribute('alt')).toBe('');
    const parallax = section('decorative').querySelector('pxl-parallax-icon')!;
    expect(parallax.getAttribute('aria-hidden')).toBe('true');
    expect(canonicalHtml(parallax.outerHTML, parser)).toBe(
      canonicalHtml(reactMarkup(ReactParallax, ssrProps.decorativeParallax), parser),
    );
  });

  it('renders static attribute inputs', () => {
    const attributes = section('attributes');
    const animated = attributes.querySelector('pxl-animated-icon') as HTMLElement;
    expect(animated.style.width).toBe('24px');
    expect(animated.querySelector('img')!.getAttribute('width')).toBe('24');
    const toast = attributes.querySelector('pxl-toast') as HTMLElement;
    expect(toast.textContent).toContain('Static title');
    expect(toast.querySelector('button')).toBeNull();
    expect(toast.hasAttribute('title')).toBe(false); // no native tooltip on the toast
  });

  it('renders a hidden PixelToast as an empty, hidden host', () => {
    const host = section('hidden-toast').querySelector('pxl-toast') as HTMLElement;
    expect(host.childElementCount).toBe(0);
    expect(host.style.display).toBe('none');
    expect(reactMarkup(ReactToast, { visible: false, title: 'Hidden' })).toBe('');
  });
});
