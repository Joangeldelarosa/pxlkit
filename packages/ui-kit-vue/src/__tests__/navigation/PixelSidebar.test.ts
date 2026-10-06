/**
 * PixelSidebar beyond the parity examples: `v-model:collapsed` in both
 * directions, the uncontrolled default (read once), item handlers, icons,
 * and the attributes that fall through to the landmark.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelSidebar, type PixelSidebarSectionProps } from '../../index';

const SECTIONS: PixelSidebarSectionProps[] = [{ label: 'Main', items: [{ id: 'home', label: 'Home' }] }];
const toggleOf = (wrapper: ReturnType<typeof mount>) => wrapper.find('button[aria-expanded]');

describe('PixelSidebar', () => {
  it('binds the collapsed state with v-model:collapsed in both directions', async () => {
    const collapsed = ref(false);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(PixelSidebar, {
            collapsible: true,
            sections: SECTIONS,
            collapsed: collapsed.value,
            'onUpdate:collapsed': (next: boolean) => (collapsed.value = next),
          }),
      }),
    );
    await toggleOf(wrapper).trigger('click');
    expect(collapsed.value).toBe(true);
    expect(toggleOf(wrapper).attributes('aria-label')).toBe('Expand sidebar');
    collapsed.value = false;
    await nextTick();
    expect(toggleOf(wrapper).attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('h3').text()).toBe('Main');
  });

  it('reads default-collapsed once while uncontrolled, and reports each toggle', async () => {
    const wrapper = mount(PixelSidebar, { props: { collapsible: true, defaultCollapsed: true, sections: SECTIONS } });
    expect(wrapper.classes()).toContain('w-14');
    expect(wrapper.find('li button').attributes('aria-label')).toBe('Home');
    await wrapper.setProps({ defaultCollapsed: false });
    expect(wrapper.classes()).toContain('w-14');
    await toggleOf(wrapper).trigger('click');
    expect(wrapper.classes()).toContain('w-56');
    expect(wrapper.emitted('update:collapsed')).toEqual([[false]]);
  });

  it('runs onSelect for button items, not for links', async () => {
    const onButton = vi.fn();
    const onLink = vi.fn();
    const wrapper = mount(PixelSidebar, {
      props: {
        sections: [
          {
            items: [
              { id: 'button', label: 'Button', onSelect: onButton },
              { id: 'link', label: 'Link', href: '#link', onSelect: onLink },
            ],
          },
        ],
      },
    });
    await wrapper.find('li button').trigger('click');
    await wrapper.find('li a').trigger('click');
    expect(onButton).toHaveBeenCalledTimes(1);
    expect(onLink).not.toHaveBeenCalled();
  });

  it('renders item icons hidden from assistive technology', () => {
    const wrapper = mount(PixelSidebar, {
      props: { sections: [{ items: [{ id: 'home', label: 'Home', icon: () => h('i', 'H') }] }] },
    });
    expect(wrapper.find('[aria-hidden="true"] > i').text()).toBe('H');
  });

  it('lets attributes rename the landmark and add classes', () => {
    const wrapper = mount(PixelSidebar, { props: { sections: SECTIONS }, attrs: { 'aria-label': 'Docs', class: 'h-96' } });
    expect(wrapper.attributes('aria-label')).toBe('Docs');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['h-96', 'w-56']));
  });
});

describe('PixelSidebar — section titles', () => {
  it('spaces a section title wide on linear too, where the display face is tight', () => {
    const tracking = (classes: string[]) => classes.filter((name) => name.startsWith('tracking-'));
    expect(tracking(mount(PixelSidebar, { props: { surface: 'linear', sections: SECTIONS } }).get('h3').classes())).toEqual(['tracking-wider']);
  });
});
