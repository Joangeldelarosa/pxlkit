/**
 * PixelToggleGroup: v-model in single and multiple mode, uncontrolled use,
 * the row's role and name, and the tab stop the toggles share.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelToggle, PixelToggleGroup } from '../../index';

const toggles = (values: string[]) => () => values.map((value) => h(PixelToggle, { value }, () => value.toUpperCase()));

describe('PixelToggleGroup', () => {
  it('binds a single value with v-model, both ways', async () => {
    const value = ref('a');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(
            PixelToggleGroup,
            { modelValue: value.value, 'onUpdate:modelValue': (next: string | string[]) => (value.value = next as string) },
            toggles(['a', 'b']),
          ),
      }),
    );
    const [a, b] = wrapper.findAll('button');
    await b!.trigger('click');
    expect(value.value).toBe('b');
    expect(b!.attributes('aria-checked')).toBe('true');
    expect(a!.attributes('aria-checked')).toBe('false');
    // Pressing the pressed toggle unsets the value.
    await b!.trigger('click');
    expect(value.value).toBe('');
    value.value = 'a';
    await nextTick();
    expect(a!.attributes('aria-checked')).toBe('true');
  });

  it('binds the pressed values with v-model in multiple mode', async () => {
    const value = ref(['bold']);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(
            PixelToggleGroup,
            {
              type: 'multiple',
              modelValue: value.value,
              'onUpdate:modelValue': (next: string | string[]) => (value.value = next as string[]),
            },
            toggles(['bold', 'italic']),
          ),
      }),
    );
    const [bold, italic] = wrapper.findAll('button');
    expect(bold!.attributes()).toMatchObject({ 'aria-pressed': 'true', 'data-state': 'on' });
    expect(bold!.attributes('role')).toBeUndefined();
    await italic!.trigger('click');
    expect(value.value).toEqual(['bold', 'italic']);
    await bold!.trigger('click');
    expect(value.value).toEqual(['italic']);
    value.value = [];
    await nextTick();
    expect(italic!.attributes('aria-pressed')).toBe('false');
  });

  it('keeps its own value while uncontrolled, from default-value or empty', async () => {
    const single = mount(PixelToggleGroup, { props: { defaultValue: 'b' }, slots: { default: toggles(['a', 'b']) } });
    const [a] = single.findAll('button');
    expect(single.findAll('[aria-checked="true"]').map((button) => button.text())).toEqual(['B']);
    await a!.trigger('click');
    expect(single.emitted('update:modelValue')).toEqual([['a']]);
    expect(a!.attributes('aria-checked')).toBe('true');

    const multiple = mount(PixelToggleGroup, { props: { type: 'multiple' }, slots: { default: toggles(['a', 'b']) } });
    expect(multiple.findAll('[aria-pressed="true"]')).toHaveLength(0);
    await multiple.findAll('button')[1]!.trigger('click');
    expect(multiple.emitted('update:modelValue')).toEqual([[['b']]]);
  });

  it('is a radiogroup in single mode, and a group in multiple mode only with a name', () => {
    expect(mount(PixelToggleGroup).attributes('role')).toBe('radiogroup');
    expect(mount(PixelToggleGroup, { props: { type: 'multiple' } }).attributes('role')).toBeUndefined();
    const labelled = mount(PixelToggleGroup, { props: { type: 'multiple', ariaLabelledby: 'caption' } });
    expect(labelled.attributes()).toMatchObject({ role: 'group', 'aria-labelledby': 'caption' });
    const named = mount(PixelToggleGroup, {
      props: { type: 'multiple', ariaLabel: 'Formatting' },
      attrs: { class: 'mine', 'data-testid': 'row' },
    });
    expect(named.attributes()).toMatchObject({ role: 'group', 'aria-label': 'Formatting', 'data-testid': 'row' });
    expect(named.classes()).toEqual(['inline-flex', 'items-center', 'gap-1', 'mine']);
  });

  it('gives its size, variant and surface to the toggles', () => {
    const wrapper = mount(PixelToggleGroup, {
      props: { size: 'lg', variant: 'ghost', surface: 'linear', defaultValue: 'b' },
      slots: { default: toggles(['a', 'b']) },
    });
    const [a] = wrapper.findAll('button');
    expect(a!.classes()).toEqual(expect.arrayContaining(['h-12', 'border-transparent', 'rounded-md', 'font-sans']));
  });

  it('hands the tab stop to the first toggle left when the one holding it goes', async () => {
    const shown = ref(['a', 'b', 'c']);
    const wrapper = mount(
      defineComponent({
        render: () => h(PixelToggleGroup, { rovingFocus: true }, () => shown.value.map((value) => h(PixelToggle, { key: value, value }, () => value))),
      }),
      { attachTo: document.body },
    );
    const tabStops = () => wrapper.findAll('button').map((button) => `${button.text()}:${button.attributes('tabindex')}`);
    // The toggles register once mounted, which seeds the tab stop.
    expect(tabStops()).toEqual(['a:-1', 'b:-1', 'c:-1']);
    await nextTick();
    expect(tabStops()).toEqual(['a:0', 'b:-1', 'c:-1']);
    (wrapper.findAll('button')[0]!.element as HTMLElement).focus();
    await wrapper.findAll('button')[0]!.trigger('keydown', { key: 'End' });
    expect(tabStops()).toEqual(['a:-1', 'b:-1', 'c:0']);
    expect(document.activeElement).toBe(wrapper.findAll('button')[2]!.element);
    shown.value = ['a', 'b'];
    await nextTick();
    expect(tabStops()).toEqual(['a:0', 'b:-1']);
    wrapper.unmount();
  });

  it('leaves the toggles in the tab order without roving focus, while the arrows still move focus', async () => {
    const wrapper = mount(PixelToggleGroup, { slots: { default: toggles(['a', 'b']) }, attachTo: document.body });
    const [a, b] = wrapper.findAll('button');
    expect(a!.attributes('tabindex')).toBeUndefined();
    (a!.element as HTMLElement).focus();
    await a!.trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(b!.element);
    expect(b!.attributes('tabindex')).toBeUndefined();
    wrapper.unmount();
  });
});
