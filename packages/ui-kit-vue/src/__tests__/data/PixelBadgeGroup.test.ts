/**
 * PixelBadgeGroup beyond the parity examples: the group role, and the
 * overflow popover following the slot content and `max`.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelBadge, PixelBadgeGroup } from '../../index';

const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};

const badges = (tags: string[]) => tags.map((tag) => h(PixelBadge, { key: tag }, () => tag));
const panel = () => document.querySelector<HTMLElement>('[role="dialog"]');

// An open popover keeps page-wide listeners until it unmounts.
enableAutoUnmount(afterEach);

describe('PixelBadgeGroup', () => {
  it('is a group only when named', () => {
    const unnamed = mount(PixelBadgeGroup, { slots: { default: () => badges(['a']) } });
    expect(unnamed.attributes('role')).toBeUndefined();
    const named = mount(PixelBadgeGroup, { attrs: { 'aria-labelledby': 'tags' }, slots: { default: () => badges(['a']) } });
    expect(named.attributes('role')).toBe('group');
  });

  it('opens the badges beyond max in a popover from the "+N" button', async () => {
    const wrapper = mount(PixelBadgeGroup, {
      props: { max: 2, surface: 'linear' },
      slots: { default: () => badges(['a', 'b', 'c']) },
      attachTo: document.body,
    });
    const trigger = wrapper.find('button');
    expect(trigger.attributes('aria-label')).toBe('Show 2 more');
    expect(trigger.attributes('aria-haspopup')).toBe('dialog');
    expect(wrapper.text()).toBe('a+2');

    await trigger.trigger('click');
    await settle();
    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(panel()!.textContent).toBe('bc');
    expect(panel()!.className).toContain('rounded-xl');
    // The button names the popover, and controls it while it is open.
    expect(panel()!.getAttribute('aria-labelledby')).toBe(trigger.attributes('id'));
    expect(trigger.attributes('aria-controls')).toBe(panel()!.id);
    await trigger.trigger('click');
    await settle();
    expect(trigger.attributes('aria-controls')).toBeUndefined();
  });

  it('recounts the overflow as badges and max change', async () => {
    const tags = ref(['a', 'b']);
    const max = ref(2);
    const wrapper = mount(defineComponent({ render: () => h(PixelBadgeGroup, { max: max.value }, () => badges(tags.value)) }));
    expect(wrapper.find('button').exists()).toBe(false);
    tags.value = ['a', 'b', 'c', 'd'];
    await nextTick();
    expect(wrapper.find('button').text()).toBe('+3');
    max.value = 4;
    await nextTick();
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.text()).toBe('abcd');
  });
});
