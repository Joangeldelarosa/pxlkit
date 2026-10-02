/**
 * PixelAvatarGroup beyond the parity examples: the group role, and a row that
 * follows its slot content and `max`.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelAvatar, PixelAvatarGroup } from '../../index';

const avatars = (names: string[]) => names.map((name) => h(PixelAvatar, { key: name, name }));
const overflowTile = (wrapper: ReturnType<typeof mount>) => wrapper.find('.sr-only').element.parentElement;

describe('PixelAvatarGroup', () => {
  it('is a group only when named', () => {
    const unnamed = mount(PixelAvatarGroup, { slots: { default: () => avatars(['Ana']) } });
    expect(unnamed.attributes('role')).toBeUndefined();
    const labelled = mount(PixelAvatarGroup, {
      attrs: { 'aria-labelledby': 'team', class: 'mt-2' },
      slots: { default: () => avatars(['Ana']) },
    });
    expect(labelled.attributes('role')).toBe('group');
    expect(labelled.classes()).toEqual(expect.arrayContaining(['mt-2', 'inline-flex']));
  });

  it('recounts the "+N" tile as avatars and max change', async () => {
    const names = ref(['Ana', 'Bob', 'Cy']);
    const max = ref(3);
    const wrapper = mount(
      defineComponent({
        render: () => h(PixelAvatarGroup, { max: max.value }, () => avatars(names.value)),
      }),
    );
    expect(wrapper.find('.sr-only').exists()).toBe(false);
    names.value = [...names.value, 'Dee'];
    await nextTick();
    expect(wrapper.find('.sr-only').text()).toBe('2 more users');
    expect(overflowTile(wrapper)!.querySelector('[aria-hidden="true"]')!.textContent).toBe('+2');
    expect(wrapper.findAll('[data-shape]')).toHaveLength(2);
    max.value = 1;
    await nextTick();
    expect(wrapper.find('.sr-only').text()).toBe('4 more users');
    expect(overflowTile(wrapper)!.hasAttribute('aria-label')).toBe(false);
    expect(wrapper.findAll('[data-shape]')).toHaveLength(0);
  });

  it('ignores text between the avatars', () => {
    const wrapper = mount(PixelAvatarGroup, { props: { max: 2 }, slots: { default: () => ['  ', ...avatars(['Ana', 'Bob'])] } });
    expect(wrapper.findAll('[data-shape]')).toHaveLength(2);
    expect(wrapper.text()).toBe('AB');
  });
});
