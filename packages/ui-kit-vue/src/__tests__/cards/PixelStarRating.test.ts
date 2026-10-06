/**
 * PixelStarRating beyond the parity examples: v-model, the controlled and
 * uncontrolled ratings, the glyph slots and what a read-only rating ignores.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { PixelStarRating } from '../../index';

const stars = 'button[data-pxl-star]';
const pressed = (wrapper: ReturnType<typeof mount>) => wrapper.findAll(stars).map((star) => star.attributes('aria-pressed'));

describe('PixelStarRating', () => {
  it('updates a v-model binding from the star clicked', async () => {
    const rating = ref(2);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelStarRating, { interactive: true, modelValue: rating.value, 'onUpdate:modelValue': (v: number) => (rating.value = v) }),
      }),
    );
    await wrapper.findAll(stars)[3]!.trigger('click');
    expect(rating.value).toBe(4);
    expect(pressed(wrapper)).toEqual(['true', 'true', 'true', 'true', 'false']);
    expect(wrapper.find('[role="group"]').attributes('aria-label')).toBe('Rating, 4 of 5');
    rating.value = 1;
    await wrapper.vm.$nextTick();
    expect(pressed(wrapper)).toEqual(['true', 'false', 'false', 'false', 'false']);
  });

  it('stays as its parent says while controlled one-way, and keeps its own rating while uncontrolled', async () => {
    const controlled = mount(PixelStarRating, { props: { interactive: true, modelValue: 2 } });
    await controlled.findAll(stars)[4]!.trigger('click');
    expect(controlled.emitted('update:modelValue')).toEqual([[5]]);
    expect(pressed(controlled).filter((value) => value === 'true')).toHaveLength(2);

    const uncontrolled = mount(PixelStarRating, { props: { interactive: true, defaultValue: 1, max: 3 } });
    expect(pressed(uncontrolled)).toEqual(['true', 'false', 'false']);
    await uncontrolled.findAll(stars)[2]!.trigger('click');
    expect(pressed(uncontrolled)).toEqual(['true', 'true', 'true']);
    expect(uncontrolled.emitted('update:modelValue')).toEqual([[3]]);
  });

  it('is a single image when read-only: no buttons, nothing to click', async () => {
    const wrapper = mount(PixelStarRating, { props: { modelValue: 3.6, showCount: true } });
    expect(wrapper.attributes()).toMatchObject({ role: 'img', 'aria-label': '4 out of 5' });
    expect(wrapper.find('button').exists()).toBe(false);
    await wrapper.findAll('[data-pxl-star]')[0]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.text()).toBe('4/5');
  });

  it('draws the filled and the empty stars with its glyph slots, given the size and tone', () => {
    const wrapper = mount(PixelStarRating, {
      props: { modelValue: 2, max: 3, size: 'lg', tone: 'green' },
      slots: {
        'star-icon': ({ filled, size, tone }: { filled: boolean; size: number; tone: string }) =>
          h('b', `${filled}-${size}-${tone}`),
        'empty-star-icon': ({ filled, size }: { filled: boolean; size: number }) => h('i', `${filled}-${size}`),
      },
    });
    expect(wrapper.findAll('[data-pxl-star]').map((star) => star.text())).toEqual(['true-24-green', 'true-24-green', 'false-24']);
    expect(wrapper.find('img').exists()).toBe(false);
  });

  it('keeps the Star icon for the empty stars with a filled glyph only, and passes attributes on', () => {
    const wrapper = mount(PixelStarRating, {
      props: { modelValue: 1, max: 2 },
      attrs: { 'aria-label': 'Product rating', id: 'stars' },
      slots: { 'star-icon': () => h('b', '♥') },
    });
    const [filled, empty] = wrapper.findAll('[data-pxl-star]');
    expect(filled!.text()).toBe('♥');
    expect(empty!.find('span.opacity-40 > img').attributes('alt')).toBe('star');
    expect(wrapper.attributes()).toMatchObject({ 'aria-label': 'Product rating', id: 'stars' });
  });
});
