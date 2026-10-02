/**
 * PixelEqualHeightGrid beyond the parity examples: which slot nodes become
 * items, the grid inputs it passes on, and items added later.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelEqualHeightGrid } from '../../index';

const ITEM = ['grid', 'grid-rows-[auto_1fr_auto]'];

describe('PixelEqualHeightGrid', () => {
  it('lays out elements and components as items and leaves text alone', () => {
    const Card = defineComponent({ setup: (_, { slots }) => () => h('article', { class: 'card' }, slots.default?.()) });
    const wrapper = mount(PixelEqualHeightGrid, {
      slots: { default: () => [h('div', { class: 'own' }, 'A'), h(Card, () => 'B'), 'loose text'] },
    });
    const [div, article] = Array.from(wrapper.element.children) as HTMLElement[];
    expect(Array.from(div!.classList)).toEqual(expect.arrayContaining(['own', ...ITEM]));
    expect(Array.from(article!.classList)).toEqual(expect.arrayContaining(['card', ...ITEM]));
    expect(wrapper.text()).toContain('loose text');
  });

  it('passes the grid inputs on, always stretching rows unless aligned to the top', async () => {
    const wrapper = mount(PixelEqualHeightGrid, {
      props: { as: 'ul', cols: 4, gap: 6 },
      attrs: { 'aria-label': 'Plans', class: 'own' },
    });
    expect(wrapper.element.tagName).toBe('UL');
    expect(wrapper.attributes('aria-label')).toBe('Plans');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['own', 'grid', 'grid-cols-4', 'gap-6', 'items-stretch']));
    expect(wrapper.classes()).not.toContain('items-start');
    await wrapper.setProps({ rowAlign: 'top' });
    expect(wrapper.classes()).toContain('items-start');
  });

  it('lays out items added later', async () => {
    const plans = ref(['Free']);
    const wrapper = mount(() =>
      h(PixelEqualHeightGrid, null, () => plans.value.map((plan) => h('div', { key: plan }, plan))),
    );
    plans.value = ['Free', 'Pro'];
    await nextTick();
    const items = wrapper.findAll('.grid > div');
    expect(items).toHaveLength(2);
    for (const item of items) expect(item.classes()).toEqual(expect.arrayContaining(ITEM));
  });
});
