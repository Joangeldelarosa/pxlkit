/**
 * PixelTwoColumn beyond the parity examples: its slots, the rendered element,
 * attribute fall-through and swapping the columns.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelTwoColumn } from '../../index';

describe('PixelTwoColumn', () => {
  it('fills each column from its slot on the element it is given', () => {
    const wrapper = mount(PixelTwoColumn, {
      props: { as: 'section', ratio: '30/70', stackBelow: 'sm', align: 'end' },
      attrs: { 'aria-label': 'Split', class: 'own' },
      slots: { left: () => h('nav', 'Menu'), right: () => h('article', 'Body') },
    });
    expect(wrapper.element.tagName).toBe('SECTION');
    expect(wrapper.attributes('aria-label')).toBe('Split');
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['own', 'grid', 'grid-cols-1', 'sm:grid-cols-[3fr_7fr]', 'gap-6', 'items-end']),
    );
    const [left, right] = Array.from((wrapper.element as HTMLElement).children);
    expect(left!.querySelector('nav')?.textContent).toBe('Menu');
    expect(right!.querySelector('article')?.textContent).toBe('Body');
  });

  it('swaps the columns on screen, keeping their order in the document', async () => {
    const wrapper = mount(PixelTwoColumn, { slots: { left: () => 'L', right: () => 'R' } });
    const columns = () => Array.from((wrapper.element as HTMLElement).children) as HTMLElement[];
    expect(columns().map((column) => column.className)).toEqual(['', '']);
    await wrapper.setProps({ reverse: true });
    expect(columns().map((column) => [column.textContent, column.className])).toEqual([
      ['L', 'order-2'],
      ['R', 'order-1'],
    ]);
  });
});
