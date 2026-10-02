/**
 * SSR hydration (Nuxt, Vite SSR): the client must adopt the server markup of
 * every component node for node, without a mismatch warning, and only then
 * start playback, the parallax loop and the toast countdown.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createSSRApp, h, nextTick, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { getAnimationFrame, renderIconDataUri } from '@pxlkit/core/vanilla';
import { AnimatedPxlKitIcon, ParallaxPxlKitIcon, PixelToast, PxlKitIcon } from '../index';
import { testAnimatedIcon, testIcon, testParallaxIcon } from './fixtures';

const page = {
  render: () =>
    h('main', [
      h(PxlKitIcon, { icon: testIcon, size: 48, appearance: 'tinted', color: '#FF5500', ariaLabel: 'Trophy' }),
      h(AnimatedPxlKitIcon, { id: 'animated', icon: testAnimatedIcon, size: 40, trigger: 'loop' }),
      h(ParallaxPxlKitIcon, { id: 'parallax', icon: testParallaxIcon, size: 80, layerGap: 20 }),
      h(PixelToast, { visible: true, title: 'Saved!', message: 'All good', icon: testIcon, duration: 5000 }),
      h(PixelToast, { visible: false, title: 'Hidden' }),
    ]),
};

describe('Vue SSR hydration', () => {
  let app: App | undefined;

  afterEach(() => {
    app?.unmount();
    app = undefined;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('adopts the server-rendered markup and starts the browser-only behaviour', async () => {
    const container = document.createElement('div');
    container.innerHTML = await renderToString(createSSRApp(page));
    document.body.append(container);
    const serverNodes = Array.from(container.querySelectorAll('*'));
    expect(serverNodes.length).toBeGreaterThan(20);

    // Simulated time from the hydration on: playback advances a frame when the
    // clock does, however busy the machine is.
    vi.useFakeTimers();
    const warnings = vi.spyOn(console, 'warn');
    const errors = vi.spyOn(console, 'error');
    const timeouts = vi.spyOn(globalThis, 'setTimeout');
    app = createSSRApp(page);
    app.mount(container);

    expect(warnings).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    // Hydration reuses every server node instead of re-rendering the page.
    expect(serverNodes.filter((node) => !node.isConnected)).toEqual([]);

    // Browser-only behaviour runs on the adopted nodes.
    const layers = Array.from(container.querySelector('#parallax')!.firstElementChild!.children) as HTMLElement[];
    expect(layers.map((layer) => layer.style.transform)).toEqual(['translateZ(0px)', 'translateZ(0px)', 'translateZ(0px)']);
    expect(timeouts.mock.calls.some(([, delay]) => delay === 5000)).toBe(true);

    const img = container.querySelector('#animated img')!;
    expect(img.getAttribute('src')).toBe(renderIconDataUri(getAnimationFrame(testAnimatedIcon, 0)));
    vi.advanceTimersByTime(testAnimatedIcon.frameDuration);
    await nextTick();
    expect(img.getAttribute('src')).toBe(renderIconDataUri(getAnimationFrame(testAnimatedIcon, 1)));
  });
});
