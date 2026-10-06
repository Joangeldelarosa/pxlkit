/**
 * PixelTimeline beyond the parity examples: entries wrapped in components of
 * their own, a changing active entry and entry list, and the bullet slot.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelTimeline, PixelTimelineItem } from '../../index';

const states = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('li').map((li) => li.attributes('data-pxl-state'));

describe('PixelTimeline', () => {
  it('places entries wrapped in components of their own', () => {
    const Step = defineComponent({
      props: { label: { type: String, required: true } },
      setup: (props) => () => h(PixelTimelineItem, { label: props.label }),
    });
    const wrapper = mount(PixelTimeline, {
      props: { active: 1 },
      slots: { default: () => ['One', 'Two', 'Three'].map((label) => h(Step, { label })) },
    });
    expect(states(wrapper)).toEqual(['past', 'active', 'upcoming']);
    expect(wrapper.findAll('li')[1]!.attributes('aria-current')).toBe('step');
    expect(wrapper.findAll('[data-pxl-connector]')).toHaveLength(2);
  });

  it('follows the active entry and the entry list', async () => {
    const active = ref<number | undefined>(undefined);
    const labels = ref(['One', 'Two']);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelTimeline, { active: active.value }, () => labels.value.map((label) => h(PixelTimelineItem, { key: label, label }))),
      }),
    );
    expect(states(wrapper)).toEqual(['upcoming', 'upcoming']);
    active.value = 1;
    labels.value = [...labels.value, 'Three'];
    await nextTick();
    expect(states(wrapper)).toEqual(['past', 'active', 'upcoming']);
    const lis = wrapper.findAll('li');
    expect(lis[1]!.find('[data-pxl-connector]').exists()).toBe(true);
    expect(lis[2]!.find('[data-pxl-connector]').exists()).toBe(false);
  });

  it('renders the bullet slot and keeps the deprecated title out of the DOM', () => {
    const wrapper = mount(PixelTimeline, {
      slots: { default: () => h(PixelTimelineItem, { title: 'Shipped' }, { bullet: () => h('i', { class: 'dot' }) }) },
    });
    expect(wrapper.find('[data-pxl-bullet] .dot').exists()).toBe(true);
    expect(wrapper.find('li').attributes('title')).toBeUndefined();
    expect(wrapper.find('li').text()).toContain('Shipped');
    expect(wrapper.find('li > div > div:nth-child(2)').exists()).toBe(false);
  });

  it('needs a timeline around its entries', () => {
    expect(() => mount(PixelTimelineItem, { props: { label: 'Alone' } })).toThrow(
      'PixelTimelineItem must be used inside a PixelTimeline',
    );
  });
});
