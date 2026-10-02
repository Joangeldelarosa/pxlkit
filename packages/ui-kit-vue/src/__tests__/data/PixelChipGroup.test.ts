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
});
