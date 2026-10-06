import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createSSRApp, h, nextTick } from 'vue';
import { renderToString } from 'vue/server-renderer';
import type { ParallaxPxlKitData } from '@pxlkit/core/vanilla';
import { ParallaxPxlKitIcon } from '../index';
import { testAnimatedIcon, testParallaxIcon } from './fixtures';

/**
 * Vue applies `filter` through its `-webkit-filter` alias (see `autoPrefix` in
 * @vue/runtime-dom), which every browser maps onto `filter`; jsdom stores the
 * two separately, so read whichever one was set.
 */
const filterOf = (element: HTMLElement) =>
  element.style.filter || element.style.getPropertyValue('-webkit-filter');

const scene = (wrapper: VueWrapper) => wrapper.element.children[0] as HTMLElement;
const layers = (wrapper: VueWrapper) => Array.from(scene(wrapper).children) as HTMLElement[];
const layerTransforms = (wrapper: VueWrapper) => layers(wrapper).map((layer) => layer.style.transform);

describe('ParallaxPxlKitIcon (Vue) — structure', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a role="img" container labelled with the icon name', () => {
    const wrapper = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon } });
    expect(wrapper.element.tagName).toBe('DIV');
    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('test-parallax');
    const custom = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon }, attrs: { 'aria-label': 'My 3D Icon' } });
    expect(custom.attributes('aria-label')).toBe('My 3D Icon');
    expect(custom.attributes('aria-hidden')).toBeUndefined();
  });

  it('decorative hides the container and empties the alt of every layer', () => {
    const icon: ParallaxPxlKitData = {
      ...testParallaxIcon,
      layers: [...testParallaxIcon.layers, { icon: testAnimatedIcon, depth: 1 }],
    };
    const wrapper = mount(ParallaxPxlKitIcon, { props: { icon, decorative: true }, attrs: { 'aria-label': 'My 3D Icon' } });
    expect(wrapper.attributes('aria-hidden')).toBe('true');
    expect(wrapper.attributes('role')).toBeUndefined();
    expect(wrapper.attributes('aria-label')).toBeUndefined();
    expect(wrapper.attributes('decorative')).toBeUndefined();
    expect(wrapper.findAll('img').map((img) => img.attributes('alt'))).toEqual(['', '', '', '']);
  });

  it('sizes the container and derives perspective from the size', () => {
    const root = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon, size: 100 } }).element as HTMLElement;
    expect(root.style.width).toBe('100px');
    expect(root.style.height).toBe('100px');
    expect(root.style.perspective).toBe('250px');
    const explicit = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon, perspective: 500 } }).element as HTMLElement;
    expect(explicit.style.perspective).toBe('500px');
    const fallback = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon } }).element as HTMLElement;
    expect(fallback.style.width).toBe('64px');
  });

  it('lets class and style fall through to the container', () => {
    const root = mount(ParallaxPxlKitIcon, {
      props: { icon: testParallaxIcon },
      attrs: { class: 'my-parallax', style: 'opacity: 0.7' },
    }).element as HTMLElement;
    expect(root.classList.contains('my-parallax')).toBe(true);
    expect(root.style.opacity).toBe('0.7');
  });

  it('renders a preserve-3d scene with one inert layer per icon layer', () => {
    const wrapper = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon } });
    expect(scene(wrapper).style.transformStyle).toBe('preserve-3d');
    expect(layers(wrapper)).toHaveLength(3);
    for (const layer of layers(wrapper)) {
      expect(layer.style.pointerEvents).toBe('none');
      expect(layer.style.willChange).toBe('transform');
    }
    expect(wrapper.findAll('img')).toHaveLength(3);
  });

  it('renders animated layers with AnimatedPxlKitIcon', () => {
    const icon: ParallaxPxlKitData = {
      ...testParallaxIcon,
      layers: [{ icon: testAnimatedIcon, depth: 1 }, testParallaxIcon.layers[1]],
    };
    const wrapper = mount(ParallaxPxlKitIcon, { props: { icon } });
    expect(layers(wrapper)[0]!.firstElementChild!.tagName).toBe('DIV'); // animated wrapper
    expect(wrapper.findAll('img')).toHaveLength(2);
  });

  it('casts depth shadows on every layer but the back one, unless disabled', () => {
    const withShadow = layers(mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon } }));
    expect(filterOf(withShadow[0]!)).toBe('');
    expect(filterOf(withShadow[1]!)).toContain('drop-shadow');
    const without = layers(mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon, shadow: false } }));
    expect(filterOf(without[1]!)).toBe('');
  });

  it('applies the resting stack depth on mount', () => {
    expect(layerTransforms(mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon } }))).toEqual([
      'translateZ(0px)',
      'translateZ(0px)',
      'translateZ(0px)',
    ]);
  });

  it('renders a size×size particle canvas only when interactive', () => {
    const interactive = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon, size: 96 } });
    const canvas = interactive.find('canvas');
    expect(canvas.attributes('width')).toBe('96');
    expect((interactive.element as HTMLElement).style.cursor).toBe('pointer');
    const inert = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon, interactive: false } });
    expect(inert.find('canvas').exists()).toBe(false);
    expect((inert.element as HTMLElement).style.cursor).toBe('');
  });

  it('server-renders the static structure', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(ParallaxPxlKitIcon, { icon: testParallaxIcon }) }));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="test-parallax"');
    expect((html.match(/<img /g) ?? []).length).toBe(3);
    expect(html).toContain('<canvas');
    const decorative = document.createElement('div');
    decorative.innerHTML = await renderToString(
      createSSRApp({ render: () => h(ParallaxPxlKitIcon, { icon: testParallaxIcon, decorative: true }) }),
    );
    const root = decorative.firstElementChild!;
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.hasAttribute('role')).toBe(false);
    expect(root.hasAttribute('aria-label')).toBe(false);
    expect(Array.from(root.querySelectorAll('img'), (img) => img.getAttribute('alt'))).toEqual(['', '', '']);
  });
});

describe('ParallaxPxlKitIcon (Vue) — motion', () => {
  let now = 0;
  let frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    // jsdom has no canvas: hand the particle renderer a context that draws nothing.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      (() => ({ clearRect() {}, fillRect() {}, globalAlpha: 1, fillStyle: '' })) as unknown as HTMLCanvasElement['getContext'],
    );
    now = 0;
    frames = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
      frames = [];
    });
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function step(count: number): void {
    for (let i = 0; i < count; i++) {
      now += 16;
      for (const cb of frames.splice(0)) cb(now);
    }
  }

  const resting = ['translateZ(-20px)', 'translateZ(0px)', 'translateZ(20px)'];

  it('peels apart, explodes on click and springs back — re-renders never reset the depth', async () => {
    const wrapper = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon, layerGap: 20 } });
    step(60);
    expect(layerTransforms(wrapper)).toEqual(resting);

    await wrapper.trigger('click'); // re-renders the scene (active hue-shift)
    step(1);
    expect(Number(/-?[\d.]+/.exec(layerTransforms(wrapper)[0]!)![0])).toBeLessThan(-40);

    await wrapper.setProps({ shadow: false }); // another re-render mid-burst
    step(200);
    expect(layerTransforms(wrapper)).toEqual(resting);
  });

  it('toggles the active hue-shift and emits activate', async () => {
    const wrapper = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon } });
    await wrapper.trigger('click');
    expect(filterOf(scene(wrapper))).toBe('hue-rotate(30deg) saturate(1.3)');
    await wrapper.trigger('click');
    expect(filterOf(scene(wrapper))).toBe('');
    expect(wrapper.emitted('activate')).toEqual([[true], [false]]);
  });

  it('ignores clicks when not interactive', async () => {
    const wrapper = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon, interactive: false } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('activate')).toBeUndefined();
  });

  it('applies a new layer gap without replaying the intro', async () => {
    const wrapper = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon, layerGap: 20 } });
    step(60);
    await wrapper.setProps({ layerGap: 10 });
    step(1);
    expect(layerTransforms(wrapper)[0]).toBe('translateZ(-10px)');
  });

  it('swaps the particle canvas when interactive toggles', async () => {
    const wrapper = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon } });
    await wrapper.setProps({ interactive: false });
    expect(wrapper.find('canvas').exists()).toBe(false);
    await wrapper.trigger('click');
    expect(() => step(3)).not.toThrow();
    await wrapper.setProps({ interactive: true });
    await nextTick();
    expect(wrapper.find('canvas').exists()).toBe(true);
  });

  it('stops the animation loop when unmounted', () => {
    const wrapper = mount(ParallaxPxlKitIcon, { props: { icon: testParallaxIcon } });
    wrapper.unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    expect(frames).toHaveLength(0);
  });
});
