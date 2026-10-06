/**
 * PixelChipGroup v-model, one-way and uncontrolled selection, and the
 * content it leaves unwrapped.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { PixelChip, PixelChipGroup } from '../../index';

const chips = () => [h(PixelChip, { value: 'a', label: 'Alpha' }), h(PixelChip, { value: 'b', label: 'Bravo' })];

describe('PixelChipGroup', () => {
  it('updates a v-model binding', async () => {
    const selection = ref<string[]>(['a']);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(
            PixelChipGroup,
            { multiple: true, modelValue: selection.value, 'onUpdate:modelValue': (next: string[]) => (selection.value = next) },
            chips,
          ),
      }),
    );
    await wrapper.findAll('[role="checkbox"]')[1]!.trigger('click');
    expect(selection.value).toEqual(['a', 'b']);
    expect(wrapper.findAll('[aria-checked="true"]')).toHaveLength(2);
  });

  it('stays as its parent says while controlled one-way', async () => {
    const wrapper = mount(PixelChipGroup, { props: { modelValue: ['a'] }, slots: { default: chips } });
    await wrapper.findAll('[role="radio"]')[1]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[['b']]]);
    expect(wrapper.find('[aria-checked="true"]').attributes('data-value')).toBe('a');
  });

  it('keeps its own selection while uncontrolled', async () => {
    const wrapper = mount(PixelChipGroup, { props: { defaultValue: ['b'] }, slots: { default: chips } });
    const [alpha, bravo] = wrapper.findAll('[role="radio"]');
    expect(bravo!.attributes('tabindex')).toBe('0');
    expect(alpha!.attributes('tabindex')).toBe('-1');
    await alpha!.trigger('keydown', { key: 'Enter' });
    expect(alpha!.attributes('aria-checked')).toBe('true');
    expect(alpha!.attributes('tabindex')).toBe('0');
    expect(wrapper.emitted('update:modelValue')).toEqual([[['a']]]);
  });

  it('wraps only the chips with a value, and is a group only when named for multiple selection', () => {
    const wrapper = mount(PixelChipGroup, {
      props: { multiple: true },
      slots: { default: () => [h(PixelChip, { value: 'a', label: 'Alpha' }), h('span', { class: 'note' }, 'note')] },
    });
    expect(wrapper.attributes('role')).toBeUndefined();
    expect(wrapper.findAll('button')).toHaveLength(1);
    expect(wrapper.find('.note').element.parentElement).toBe(wrapper.element);
    expect(mount(PixelChipGroup, { slots: { default: chips } }).attributes('role')).toBe('radiogroup');
    expect(mount(PixelChipGroup, { props: { multiple: true }, attrs: { 'aria-label': 'Tags' } }).attributes('role')).toBe('group');
  });

  // Regression: on the linear surface the selection ring and the focus ring
  // were the same; on the pixel surface the cut corners clipped the selection
  // ring, the only mark of a selected chip.
  it('marks the selected chip apart from keyboard focus on both surfaces', () => {
    const items = (surface: 'pixel' | 'linear') =>
      mount(PixelChipGroup, { props: { modelValue: ['a'], surface }, slots: { default: chips } })
        .findAll('[role="radio"]')
        .map((item) => item.classes());
    const [pixelSelected, pixelOther] = items('pixel');
    // Pixel: a frame inside the selected chip, which the cut corners leave
    // whole; focus lights up the chip's edge from a layer over the chip.
    expect(pixelSelected).toEqual(expect.arrayContaining(['pxl-corner-sm', '*:outline-2', '*:-outline-offset-4', '*:outline-retro-cyan/60']));
    expect(pixelSelected!.filter((c) => c.includes('ring'))).toEqual([]);
    expect(pixelOther!.filter((c) => c.startsWith('*:'))).toEqual([]);
    for (const chip of [pixelSelected!, pixelOther!]) expect(chip).toContain('focus-visible:after:pxl-focus-inset');
    // Linear: the selection ring hugs the chip; the focus ring stands off it.
    const [linearSelected, linearOther] = items('linear');
    expect(linearSelected).toEqual(expect.arrayContaining(['ring-2', 'ring-retro-cyan/60', 'focus-visible:ring-offset-2']));
    expect(linearOther).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:ring-offset-2']));
    expect(linearOther).not.toContain('ring-2');
  });
});
