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

  it('moves a pixel button on hover and press without a drop shadow, which its cut corners would clip', () => {
    const press = { solid: 'pxl-nudge-active', soft: 'pxl-nudge-active', outline: 'active:scale-[0.97]' } as const;
    for (const [variant, pressed] of Object.entries(press) as Array<[keyof typeof press, string]>) {
      const classes = mount(PixelButton, { props: { variant } }).classes();
      expect(classes).toEqual(expect.arrayContaining(['pxl-corner-sm', 'pxl-nudge-hover', pressed]));
      for (const shadow of ['pxl-shadow', 'pxl-shadow-hover', 'pxl-shadow-active']) expect(classes).not.toContain(shadow);
    }
  });

  it('keeps the linear shadows', () => {
    const classes = mount(PixelButton, { props: { surface: 'linear', variant: 'soft' } }).classes();
    expect(classes).toEqual(expect.arrayContaining(['shadow-sm', 'hover:shadow-md', 'active:shadow-sm']));
  });

  it('drops shadows and press feedback when disabled', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const enabled = mount(PixelButton, { props: { surface, variant: 'soft' } });
      const disabled = mount(PixelButton, { props: { surface, variant: 'soft', disabled: true } });
      expect(enabled.classes()).toContain(surface === 'pixel' ? 'pxl-nudge-active' : 'shadow-sm');
      for (const name of ['pxl-shadow', 'pxl-shadow-active', 'pxl-nudge-hover', 'pxl-nudge-active', 'shadow-sm', 'hover:shadow-md', 'active:shadow-sm']) {
        expect(disabled.classes()).not.toContain(name);
      }
    }
  });

  it('rings keyboard focus, keeping an outline for forced-colors mode, which drops the ring', () => {
    const classes = mount(PixelButton, { props: { surface: 'linear' }, slots: { default: () => 'Go' } }).classes();
    expect(classes).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:outline-hidden']));
    expect(classes.filter((c) => c.endsWith('outline-none'))).toEqual([]);
  });
});
