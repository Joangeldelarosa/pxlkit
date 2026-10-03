/**
 * PixelCarousel on a mocked Embla, as the React kit's tests do: jsdom has no
 * layout, and lacks the observers the real one needs. Covers the options it
 * hands over, the controls and keys that drive it, the state it reports
 * back, the `api` event, re-initialising, and the first slide it keeps where
 * Embla cannot run.
 */
import { REDUCED_MOTION_QUERY } from '@pxlkit/ui-kit-core';
import type { EmblaPluginType } from 'embla-carousel';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelCarousel, PixelCarouselItem } from '../../index';
import { installMatchMedia } from '../match-media';

const embla = vi.hoisted(() => {
  type Handler = () => void;
  function fake(root: HTMLElement) {
    const handlers = new Map<string, Set<Handler>>();
    const snaps = [0, 0.5, 1];
    let selected = 0;
    const emit = (event: string) => handlers.get(event)?.forEach((handler) => handler());
    const select = (index: number) => {
      selected = Math.max(0, Math.min(snaps.length - 1, index));
      emit('select');
    };
    return {
      root,
      scrollSnapList: () => snaps,
      selectedScrollSnap: () => selected,
      canScrollPrev: () => selected > 0,
      canScrollNext: () => selected < snaps.length - 1,
      scrollPrev: vi.fn(() => select(selected - 1)),
      scrollNext: vi.fn(() => select(selected + 1)),
      scrollTo: vi.fn((index: number) => select(index)),
      reInit: vi.fn((..._options: unknown[]) => emit('reInit')),
      destroy: vi.fn(),
      on: (event: string, handler: Handler) => {
        if (!handlers.has(event)) handlers.set(event, new Set());
        handlers.get(event)!.add(handler);
      },
      off: (event: string, handler: Handler) => handlers.get(event)?.delete(handler),
      listeners: (event: string) => handlers.get(event)?.size ?? 0,
    };
  }
  const instances: Array<ReturnType<typeof fake>> = [];
  const create = vi.fn((root: HTMLElement, ..._options: unknown[]) => {
    const instance = fake(root);
    instances.push(instance);
    return instance;
  });
  return { create, instances };
});

vi.mock('embla-carousel', () => ({ default: embla.create }));

enableAutoUnmount(afterEach);

afterEach(() => {
  embla.create.mockClear();
  embla.instances.length = 0;
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, 'matchMedia');
});

/** What Embla needs from the browser, which jsdom lacks. */
function allowEmbla({ reducedMotion = false } = {}) {
  vi.stubGlobal('IntersectionObserver', class {});
  vi.stubGlobal('ResizeObserver', class {});
  installMatchMedia((query) => reducedMotion && query === REDUCED_MOTION_QUERY);
}

function plugin(delay: number): EmblaPluginType {
  const options = { active: true, delay };
  return { name: 'autoplay', options, init() {}, destroy() {} };
}
const slides = () => ['One', 'Two', 'Three'].map((label) => h(PixelCarouselItem, { key: label }, () => label));
const button = (wrapper: ReturnType<typeof mount>, label: string) => wrapper.get(`button[aria-label="${label}"]`);

describe('PixelCarousel', () => {
  it('runs Embla on its viewport with the kit defaults, the axis of its orientation and its plugins', () => {
    allowEmbla();
    const plugins = [plugin(4000)];
    const wrapper = mount(PixelCarousel, {
      props: { orientation: 'vertical', opts: { dragFree: true }, plugins },
      slots: { default: slides },
    });
    const [root, options, given] = embla.create.mock.calls[0]! as unknown as [HTMLElement, object, unknown[]];
    expect(root).toBe(wrapper.get('[id$="-viewport"]').element);
    expect(options).toEqual({ loop: false, align: 'start', slidesToScroll: 1, dragFree: true, axis: 'y', duration: 25 });
    expect(given).toEqual(plugins);
  });

  it('scrolls without animation for a reader who prefers reduced motion', () => {
    allowEmbla({ reducedMotion: true });
    mount(PixelCarousel, { slots: { default: slides } });
    expect(embla.create.mock.calls[0]![1]).toMatchObject({ axis: 'x', duration: 0 });
  });

  it('scrolls from its arrows, dots and arrow keys, and shows where it is', async () => {
    allowEmbla();
    const wrapper = mount(PixelCarousel, { props: { showDots: true }, attrs: { 'aria-label': 'Featured' }, slots: { default: slides } });
    await nextTick();
    const api = embla.instances[0]!;
    const status = wrapper.get('[role="status"]');
    expect(button(wrapper, 'Previous slide').attributes('disabled')).toBeDefined();
    expect(button(wrapper, 'Next slide').attributes('disabled')).toBeUndefined();

    await button(wrapper, 'Next slide').trigger('click');
    expect(api.scrollNext).toHaveBeenCalledTimes(1);
    expect(status.text()).toBe('Slide 2 of 3');
    expect(button(wrapper, 'Go to slide 2').attributes('aria-current')).toBe('true');
    expect(button(wrapper, 'Previous slide').attributes('disabled')).toBeUndefined();

    await button(wrapper, 'Go to slide 3').trigger('click');
    expect(api.scrollTo).toHaveBeenCalledWith(2);
    expect(button(wrapper, 'Next slide').attributes('disabled')).toBeDefined();

    await wrapper.trigger('keydown', { key: 'ArrowLeft' });
    expect(api.scrollPrev).toHaveBeenCalledTimes(1);
    expect(status.text()).toBe('Slide 2 of 3');
    await wrapper.trigger('keydown', { key: 'ArrowDown' });
    await button(wrapper, 'Previous slide').trigger('click');
    expect(api.scrollPrev).toHaveBeenCalledTimes(2);
    expect(api.scrollNext).toHaveBeenCalledTimes(1);
  });

  it('takes the up and down arrows when vertical, and prevents their scrolling of the page', async () => {
    allowEmbla();
    const wrapper = mount(PixelCarousel, { props: { orientation: 'vertical' }, slots: { default: slides } });
    const down = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    wrapper.element.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    expect(embla.instances[0]!.scrollNext).toHaveBeenCalledTimes(1);
    const right = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    wrapper.element.dispatchEvent(right);
    expect(right.defaultPrevented).toBe(false);
  });

  it('hands out its Embla API, then undefined and a destroyed Embla once unmounted', async () => {
    allowEmbla();
    const handed: unknown[] = [];
    const wrapper = mount(PixelCarousel, { attrs: { onApi: (api: unknown) => handed.push(api) }, slots: { default: slides } });
    await nextTick();
    const api = embla.instances[0]!;
    expect(handed).toEqual([api]);
    expect(api.listeners('select')).toBe(1);
    wrapper.unmount();
    expect(api.destroy).toHaveBeenCalledTimes(1);
    expect(handed).toEqual([api, undefined]);
  });

  it('re-initialises Embla when its options or plugins change in content, not when a parent rebuilds them', async () => {
    allowEmbla();
    const loop = ref(false);
    const tick = ref(0);
    const plugins = ref([plugin(4000)]);
    const wrapper = mount(
      defineComponent({
        // A new options object, and a new plugin list, on every render.
        render: () =>
          h(PixelCarousel, { opts: { loop: loop.value }, plugins: [...plugins.value], 'data-tick': tick.value }, slides),
      }),
    );
    const api = embla.instances[0]!;
    tick.value++;
    await wrapper.vm.$nextTick();
    expect(api.reInit).not.toHaveBeenCalled();
    loop.value = true;
    await wrapper.vm.$nextTick();
    expect(api.reInit).toHaveBeenCalledTimes(1);
    expect(api.reInit.mock.calls[0]![0]).toMatchObject({ loop: true });
    plugins.value = [plugin(2000)];
    await wrapper.vm.$nextTick();
    expect(api.reInit).toHaveBeenCalledTimes(2);
    expect(embla.create).toHaveBeenCalledTimes(1);
  });

  it('stays on its first slide where Embla cannot run, the arrows enabled only when looping', async () => {
    const wrapper = mount(PixelCarousel, { props: { showDots: true }, slots: { default: slides } });
    expect(embla.create).not.toHaveBeenCalled();
    expect(wrapper.emitted('api')).toBeUndefined();
    expect(wrapper.get('[role="status"]').text()).toBe('Slide 1 of 3');
    expect(wrapper.findAll('button[aria-label^="Go to slide"]')).toHaveLength(3);
    expect(button(wrapper, 'Next slide').attributes('disabled')).toBeDefined();
    await wrapper.setProps({ opts: { loop: true } });
    expect(button(wrapper, 'Next slide').attributes('disabled')).toBeUndefined();
  });

  it('names its slides by position, through wrappers of their own, and leaves an own label alone', () => {
    const Wrapped = defineComponent({ setup: (_, { slots }) => () => h('div', { class: 'wrapper' }, h(PixelCarouselItem, slots.default)) });
    const wrapper = mount(PixelCarousel, {
      slots: {
        default: () => [
          h(PixelCarouselItem, () => 'One'),
          h(Wrapped, () => 'Two'),
          h(PixelCarouselItem, { 'aria-label': 'The last one' }, () => 'Three'),
        ],
      },
    });
    expect(wrapper.findAll('[aria-roledescription="slide"]').map((slide) => slide.attributes('aria-label'))).toEqual([
      'Slide 1 of 3',
      'Slide 2 of 3',
      'The last one',
    ]);
    expect(mount(PixelCarouselItem).attributes('aria-label')).toBeUndefined();
  });
});
