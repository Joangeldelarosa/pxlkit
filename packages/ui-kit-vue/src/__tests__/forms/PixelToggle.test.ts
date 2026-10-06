/**
 * PixelToggle standalone (v-model:pressed, uncontrolled, attributes) and
 * inside a toggle group, through the context the group provides.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { computed, defineComponent, h, ref } from 'vue';
import { PixelToggle } from '../../index';
import { PIXEL_TOGGLE_GROUP, type PixelToggleGroupContext } from '../../forms/_internal/toggle-group-context';

function groupStub(type: 'single' | 'multiple', pressed: string[]) {
  const focused = ref<string | null>('b');
  const context: PixelToggleGroupContext = {
    type: computed(() => type),
    size: computed(() => 'sm'),
    variant: computed(() => 'outline'),
    surface: computed(() => 'linear'),
    rovingFocus: computed(() => true),
    focusedValue: focused,
    isPressed: (value) => pressed.includes(value),
    toggle: vi.fn(),
    registerItem: vi.fn(),
    unregisterItem: vi.fn(),
    onItemKeydown: vi.fn(),
  };
  return context;
}

describe('PixelToggle', () => {
  it('updates a v-model:pressed binding', async () => {
    const on = ref(false);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelToggle, { value: 'bold', pressed: on.value, 'onUpdate:pressed': (v: boolean) => (on.value = v) }, () => 'B'),
      }),
    );
    await wrapper.find('button').trigger('click');
    expect(on.value).toBe(true);
    expect(wrapper.find('button').attributes('aria-pressed')).toBe('true');
    expect(wrapper.find('button').attributes('data-state')).toBe('on');
  });

  it('keeps its own state while uncontrolled, and none while disabled', async () => {
    const wrapper = mount(PixelToggle, { props: { value: 'italic' }, slots: { default: 'I' } });
    await wrapper.trigger('click');
    expect(wrapper.attributes('aria-pressed')).toBe('true');
    expect(wrapper.emitted('update:pressed')).toEqual([[true]]);
    const disabled = mount(PixelToggle, { props: { value: 'code', disabled: true } });
    await disabled.trigger('click');
    expect(disabled.emitted('update:pressed')).toBeUndefined();
    expect(disabled.attributes('aria-pressed')).toBe('false');
  });

  it('is a type=button by default and passes attributes and listeners through', async () => {
    const onClick = vi.fn();
    const wrapper = mount(PixelToggle, {
      props: { value: 'x' },
      attrs: { class: 'mine', 'data-testid': 'tg', tabindex: 3, onClick },
      slots: { default: 'X' },
    });
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.attributes('data-pxl-toggle-value')).toBe('x');
    expect(wrapper.attributes('value')).toBeUndefined();
    expect(wrapper.attributes('tabindex')).toBe('3');
    expect(wrapper.classes()).toContain('mine');
    await wrapper.trigger('click');
    expect(onClick).toHaveBeenCalledOnce();
    expect(mount(PixelToggle, { props: { value: 'x' }, attrs: { type: 'submit' } }).attributes('type')).toBe('submit');
  });

  it('is a radio of a single-select group, which owns its state, size, variant, surface and focus', async () => {
    const group = groupStub('single', ['a']);
    const wrapper = mount(
      defineComponent({
        render: () => [h(PixelToggle, { value: 'a' }, () => 'A'), h(PixelToggle, { value: 'b' }, () => 'B')],
      }),
      { global: { provide: { [PIXEL_TOGGLE_GROUP as symbol]: group } } },
    );
    const [a, b] = wrapper.findAll('button');
    expect(a!.attributes()).toMatchObject({ role: 'radio', 'aria-checked': 'true', tabindex: '-1' });
    expect(a!.attributes('aria-pressed')).toBeUndefined();
    expect(b!.attributes()).toMatchObject({ role: 'radio', 'aria-checked': 'false', tabindex: '0' });
    expect(a!.classes()).toEqual(expect.arrayContaining(['h-8', 'rounded-md']));
    expect(b!.classes()).toContain('bg-transparent');
    expect(group.registerItem).toHaveBeenCalledWith('a', a!.element);
    await b!.trigger('click');
    expect(group.toggle).toHaveBeenCalledWith('b');
    await b!.trigger('keydown', { key: 'ArrowLeft' });
    expect(group.onItemKeydown).toHaveBeenCalledWith(expect.objectContaining({ key: 'ArrowLeft' }), 'b');
    wrapper.unmount();
    expect(group.unregisterItem).toHaveBeenCalledWith('b');
  });

  it('stays a pressed button in a multiple-select group', () => {
    const wrapper = mount(PixelToggle, {
      props: { value: 'b' },
      global: { provide: { [PIXEL_TOGGLE_GROUP as symbol]: groupStub('multiple', ['b']) } },
    });
    expect(wrapper.attributes('role')).toBeUndefined();
    expect(wrapper.attributes('aria-pressed')).toBe('true');
  });
});
