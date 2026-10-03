/**
 * PixelIconFrame beyond the parity examples: the pulse and reduced motion,
 * the accent's content and corner, and attributes.
 */
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h, nextTick } from 'vue';
import { PixelIconFrame } from '../../index';
import { installMatchMedia } from '../match-media';

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('PixelIconFrame', () => {
  it('pulses when animated until the user asks for reduced motion', async () => {
    const lists = installMatchMedia(() => false);
    const wrapper = mount(PixelIconFrame, { props: { animated: true }, slots: { icon: () => 'i' } });
    await nextTick();
    expect(wrapper.classes()).toContain('animate-pulse');
    for (const list of lists) list.fire(true);
    await nextTick();
    expect(wrapper.classes()).not.toContain('animate-pulse');
  });

  it('never pulses when reduced motion is already on, nor when not animated', async () => {
    installMatchMedia((query) => query === '(prefers-reduced-motion: reduce)');
    const reduced = mount(PixelIconFrame, { props: { animated: true } });
    await nextTick();
    expect(reduced.classes()).not.toContain('animate-pulse');
    expect(mount(PixelIconFrame).classes()).not.toContain('animate-pulse');
  });

  it('hides the icon and the accent from assistive technology, the accent in its corner', () => {
    const wrapper = mount(PixelIconFrame, {
      props: { shape: 'circle', accent: { icon: h('b', '!'), position: 'bottom-right' } },
      attrs: { 'data-testid': 'frame' },
      slots: { icon: () => h('i', 'icon') },
    });
    const [icon, accent] = wrapper.findAll('span');
    expect(icon!.attributes('aria-hidden')).toBe('true');
    expect(icon!.find('i').text()).toBe('icon');
    expect(accent!.attributes('aria-hidden')).toBe('true');
    expect(accent!.text()).toBe('!');
    expect(accent!.classes()).toEqual(expect.arrayContaining(['bottom-0', 'right-0', 'rounded-full']));
    expect(wrapper.attributes('data-testid')).toBe('frame');
  });

  it('takes text as the accent, in the top right corner by default', () => {
    const wrapper = mount(PixelIconFrame, { props: { accent: { icon: '3' } } });
    const accent = wrapper.findAll('span')[1]!;
    expect(accent.text()).toBe('3');
    expect(accent.classes()).toEqual(expect.arrayContaining(['top-0', 'right-0']));
  });
});
