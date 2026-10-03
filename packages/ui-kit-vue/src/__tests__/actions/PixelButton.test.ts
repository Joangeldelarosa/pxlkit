/**
 * PixelButton behaviour beyond the parity examples: the loading width pin,
 * asChild fallbacks and attribute / listener fall-through.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import { PixelButton } from '../../index';

describe('PixelButton', () => {
  it('pins its width while loading and releases it afterwards', async () => {
    const wrapper = mount(PixelButton, { slots: { default: () => 'Save' }, attachTo: document.body });
    vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue({ width: 120 } as DOMRect);
    await wrapper.setProps({ loading: true });
    await nextTick();
    expect((wrapper.element as HTMLElement).style.minWidth).toBe('120px');
    expect(wrapper.find('[data-testid="pxl-button-spinner"]').exists()).toBe(true);
    expect(wrapper.attributes('disabled')).toBeDefined();
    await wrapper.setProps({ loading: false });
    await nextTick();
    expect((wrapper.element as HTMLElement).style.minWidth).toBe('');
    expect(wrapper.attributes('disabled')).toBeUndefined();
  });

  it('passes attributes and listeners through to the button', async () => {
    const onClick = vi.fn();
    const wrapper = mount(PixelButton, { attrs: { type: 'submit', 'aria-label': 'Go', onClick } });
    expect(wrapper.attributes('type')).toBe('submit');
    expect(wrapper.attributes('aria-label')).toBe('Go');
    await wrapper.trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('styles and wires its single child in asChild mode', async () => {
    const onClick = vi.fn();
    const wrapper = mount(PixelButton, {
      props: { asChild: true, tone: 'cyan' },
      attrs: { onClick, id: 'link' },
      slots: { default: () => h('a', { href: '/docs', class: 'own' }, 'Docs') },
    });
    const anchor = wrapper.find('a');
    expect(anchor.attributes('id')).toBe('link');
    expect(anchor.classes()).toEqual(expect.arrayContaining(['own', 'text-retro-cyan', 'inline-flex']));
    await anchor.trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('falls back to a button when asChild has no single element child', () => {
    const wrapper = mount(PixelButton, { props: { asChild: true }, slots: { default: () => 'Plain text' } });
    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.text()).toBe('Plain text');
  });

  it('drops shadows and press feedback when disabled', () => {
    const enabled = mount(PixelButton, { props: { variant: 'soft' } });
    const disabled = mount(PixelButton, { props: { variant: 'soft', disabled: true } });
    expect(enabled.classes()).toContain('pxl-shadow');
    expect(disabled.classes()).not.toContain('pxl-shadow');
    expect(disabled.classes()).not.toContain('pxl-shadow-active');
  });

  it('rings keyboard focus, keeping an outline for forced-colors mode, which drops the ring', () => {
    const classes = mount(PixelButton, { props: { surface: 'linear' }, slots: { default: () => 'Go' } }).classes();
    expect(classes).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:outline-hidden']));
    expect(classes.filter((c) => c.endsWith('outline-none'))).toEqual([]);
  });
});
