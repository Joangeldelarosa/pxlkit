/**
 * PixelCollapsible beyond the parity examples: the body mounts only while
 * open, ids stay unique per instance, and the frame.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, onMounted } from 'vue';
import { PixelCollapsible } from '../../index';

describe('PixelCollapsible', () => {
  it('mounts its body only while open', async () => {
    let mounts = 0;
    const Body = defineComponent({
      setup() {
        onMounted(() => mounts++);
        return () => h('p', 'body');
      },
    });
    const wrapper = mount(PixelCollapsible, { props: { label: 'Details' }, slots: { default: () => h(Body) } });
    const trigger = wrapper.find('button');
    expect(mounts).toBe(0);
    await trigger.trigger('click');
    await trigger.trigger('click');
    await trigger.trigger('click');
    expect(mounts).toBe(2);
    expect(wrapper.find(`#${trigger.attributes('aria-controls')}`).text()).toBe('body');
  });

  it('wires every instance to its own body', async () => {
    const wrapper = mount(() => [
      h(PixelCollapsible, { label: 'One', defaultOpen: true }, () => 'first'),
      h(PixelCollapsible, { label: 'Two', defaultOpen: true }, () => 'second'),
    ]);
    const [one, two] = wrapper.findAll('button');
    expect(one!.attributes('aria-controls')).not.toBe(two!.attributes('aria-controls'));
    for (const [trigger, text] of [[one!, 'first'], [two!, 'second']] as const) {
      const body = wrapper.find(`#${trigger.attributes('aria-controls')}`);
      expect(body.text()).toBe(text);
      expect(body.attributes('aria-labelledby')).toBe(trigger.attributes('id'));
    }
  });

  it('frames itself when bordered', () => {
    const wrapper = mount(PixelCollapsible, { props: { label: 'Details', bordered: true, surface: 'linear' } });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['border', 'rounded-md', 'border-retro-border']));
    expect(wrapper.find('button').classes()).toContain('font-sans');
  });
});
