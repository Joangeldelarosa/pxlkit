/**
 * PixelFloat: the in-view trigger, with and without IntersectionObserver.
 * The manifest examples are covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { PixelFloat } from '../../index';

enableAutoUnmount(afterEach);

afterEach(() => {
  vi.unstubAllGlobals();
});

const playing = (element: Element) => (element as HTMLElement).style.animation !== '';

describe('PixelFloat', () => {
  it('floats while in view, and stops observing once it leaves the inView mode', async () => {
    let report: IntersectionObserverCallback = () => {};
    const observer = { observe: vi.fn(), disconnect: vi.fn() };
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
        expect(options).toEqual({ threshold: 0.15 });
        report = callback;
        return observer;
      }),
    );
    const wrapper = mount(PixelFloat, { props: { trigger: 'inView', distance: 14 }, attachTo: document.body });
    await nextTick();
    expect(observer.observe).toHaveBeenCalledWith(wrapper.element);
    expect(playing(wrapper.element)).toBe(false);
    report([{ isIntersecting: true } as IntersectionObserverEntry], observer as unknown as IntersectionObserver);
    await nextTick();
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--pxl-float-distance')).toBe('14px');
    report([{ isIntersecting: false } as IntersectionObserverEntry], observer as unknown as IntersectionObserver);
    await nextTick();
    expect(playing(wrapper.element)).toBe(false);
    await wrapper.setProps({ trigger: 'mount' });
    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(playing(wrapper.element)).toBe(true);
  });

  it('floats at once where IntersectionObserver is missing', async () => {
    expect(typeof IntersectionObserver).toBe('undefined');
    const wrapper = mount(PixelFloat, { props: { trigger: 'inView' } });
    await nextTick();
    await nextTick();
    expect((wrapper.element as HTMLElement).style.animation).toBe('pxl-float 2200ms ease-in-out 0ms infinite both');
  });
});
