/**
 * PixelInputGroup joining its slot's controls, its role and its dev warning.
 */
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelInputGroup } from '../../index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PixelInputGroup', () => {
  it('joins every element of its slot, with a divider except after the last, and drops text', () => {
    const wrapper = mount(PixelInputGroup, {
      props: { ariaLabel: 'Search' },
      slots: { default: () => [h('input', { class: 'mine' }), 'stray text', h('button', 'Go')] },
    });
    const [input, button] = [wrapper.find('input'), wrapper.find('button')];
    expect(input.classes()).toEqual(expect.arrayContaining(['mine', 'border-0', 'rounded-none', 'border-r']));
    expect(button.classes()).toContain('border-0');
    expect(button.classes()).not.toContain('border-r');
    expect(wrapper.text()).toBe('Go');
  });

  it('moves the missing divider to the new last control', async () => {
    const third = ref(true);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelInputGroup, { ariaLabel: 'Parts' }, () => [h('input'), h('input'), third.value ? h('input') : null]),
      }),
    );
    expect(wrapper.findAll('input')[1]!.classes()).toContain('border-r');
    third.value = false;
    await nextTick();
    expect(wrapper.findAll('input')[1]!.classes()).not.toContain('border-r');
  });

  it('is a named group only when it has a name, unless given a role', () => {
    const named = mount(PixelInputGroup, { props: { ariaLabel: 'Website' }, slots: { default: () => h('input') } });
    expect(named.attributes('role')).toBe('group');
    expect(named.attributes('aria-label')).toBe('Website');
    const labelled = mount(PixelInputGroup, { props: { ariaLabelledby: 'title' }, slots: { default: () => h('input') } });
    expect(labelled.attributes('role')).toBe('group');
    const unnamed = mount(PixelInputGroup, { slots: { default: () => h('input') } });
    expect(unnamed.attributes('role')).toBeUndefined();
    const toolbar = mount(PixelInputGroup, { props: { role: 'toolbar' }, slots: { default: () => h('input') } });
    expect(toolbar.attributes('role')).toBe('toolbar');
  });

  it('warns about several controls without a name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mount(PixelInputGroup, { slots: { default: () => [h('input'), h('input')] } });
    expect(warn.mock.calls.flat().join(' ')).toContain('[PixelInputGroup] missing aria-label');
    warn.mockClear();
    mount(PixelInputGroup, { props: { ariaLabel: 'Pair' }, slots: { default: () => [h('input'), h('input')] } });
    expect(warn).not.toHaveBeenCalled();
  });

  it('passes extra attributes to the shell', () => {
    const wrapper = mount(PixelInputGroup, {
      props: { size: 'lg', surface: 'linear', ariaLabel: 'x' },
      attrs: { 'data-testid': 'group', class: 'mine' },
      slots: { default: () => h('input') },
    });
    expect(wrapper.attributes('data-testid')).toBe('group');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['mine', 'h-12', 'rounded-md']));
  });
});
