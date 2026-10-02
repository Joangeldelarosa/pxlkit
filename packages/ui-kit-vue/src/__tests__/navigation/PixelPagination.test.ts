/**
 * PixelPagination beyond the parity examples: `v-model:page` in both
 * directions, and a page passed one way stays the parent's.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelPagination } from '../../index';

const current = (wrapper: ReturnType<typeof mount>) => wrapper.find('[aria-current="page"]').text();

describe('PixelPagination', () => {
  it('binds the page with v-model:page in both directions', async () => {
    const page = ref(3);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(PixelPagination, { page: page.value, total: 12, 'onUpdate:page': (next: number) => (page.value = next) }),
      }),
    );
    await wrapper.find('button[aria-label="Next"]').trigger('click');
    expect(page.value).toBe(4);
    expect(current(wrapper)).toBe('4');
    page.value = 12;
    await nextTick();
    expect(current(wrapper)).toBe('12');
    expect(wrapper.find('button[aria-label="Next"]').attributes('disabled')).toBeDefined();
  });

  it('reports the picked page but shows the page it is given', async () => {
    const wrapper = mount(PixelPagination, { props: { page: 1, total: 10 } });
    await wrapper.findAll('button')[2]!.trigger('click');
    expect(wrapper.emitted('update:page')).toEqual([[2]]);
    expect(current(wrapper)).toBe('1');
  });

  it('names the landmark and its steps', async () => {
    const wrapper = mount(PixelPagination, { props: { page: 2, total: 3 } });
    expect(wrapper.element.tagName).toBe('NAV');
    expect(wrapper.attributes('aria-label')).toBe('Pagination');
    await wrapper.setProps({ ariaLabel: 'Páginas', prevLabel: 'Anterior', nextLabel: 'Siguiente' });
    expect(wrapper.attributes('aria-label')).toBe('Páginas');
    expect(wrapper.find('button[aria-label="Anterior"]').text()).toBe('Anterior');
    expect(wrapper.find('button[aria-label="Siguiente"]').text()).toBe('Siguiente');
  });
});
