/**
 * PixelRibbon beyond the parity examples: tilts set inline, the consumer's
 * own style and attributes on the ribbon.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelRibbon } from '../../index';

describe('PixelRibbon', () => {
  it('rotates by a Tailwind step, or inline for a tilt without one', async () => {
    const wrapper = mount(PixelRibbon, { props: { position: 'corner-tl' }, slots: { default: () => 'Hot' } });
    expect(wrapper.classes()).toContain('-rotate-12');
    expect(wrapper.attributes('style')).toBeUndefined();
    await wrapper.setProps({ tilt: 7 });
    expect(wrapper.classes().some((name) => name.includes('rotate'))).toBe(false);
    expect((wrapper.element as HTMLElement).style.transform).toBe('rotate(7deg)');
    await wrapper.setProps({ tilt: 0 });
    expect((wrapper.element as HTMLElement).style.transform).toBe('');
  });

  it('lets the consumer style and attributes win on the ribbon', () => {
    const wrapper = mount(PixelRibbon, {
      props: { tilt: 7 },
      attrs: { role: 'status', id: 'promo', style: { transform: 'none' } },
      slots: { default: () => 'Sale' },
    });
    expect(wrapper.attributes()).toMatchObject({ role: 'status', id: 'promo' });
    expect((wrapper.element as HTMLElement).style.transform).toBe('none');
    expect(wrapper.text()).toBe('Sale');
  });
});
