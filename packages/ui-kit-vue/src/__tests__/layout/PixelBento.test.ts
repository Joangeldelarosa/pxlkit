/**
 * PixelBento beyond the parity examples: its column marker, prop changes and
 * the row height a consumer style can override.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelBento } from '../../index';

describe('PixelBento', () => {
  it('marks its column count and follows prop changes', async () => {
    const wrapper = mount(PixelBento, { attrs: { id: 'bento', class: 'own' } });
    expect(wrapper.attributes('data-columns')).toBe('3');
    expect(wrapper.attributes('id')).toBe('bento');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['own', 'grid', 'lg:grid-cols-3', 'gap-4']));
    await wrapper.setProps({ columns: 6, gap: 2 });
    expect(wrapper.attributes('data-columns')).toBe('6');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['grid-cols-2', 'lg:grid-cols-6', 'gap-2']));
  });

  it('sizes its rows unless the consumer style says otherwise', () => {
    expect((mount(PixelBento).element as HTMLElement).style.gridAutoRows).toBe('minmax(160px, 1fr)');
    const styled = mount(PixelBento, { attrs: { style: 'grid-auto-rows: 120px' } });
    expect((styled.element as HTMLElement).style.gridAutoRows).toBe('120px');
  });
});
