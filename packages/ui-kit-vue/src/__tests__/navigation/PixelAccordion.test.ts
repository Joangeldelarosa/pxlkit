/**
 * PixelAccordion beyond the parity examples: panel content as text, a VNode
 * or a render function, the wiring between headers and panels, and the
 * first-render state that later props do not reset.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelAccordion, type AccordionItem } from '../../index';

const ITEMS: AccordionItem[] = [
  { id: 'text', title: 'Text', content: 'Plain text' },
  { id: 'vnode', title: 'VNode', content: h('strong', 'A VNode') },
  { id: 'render', title: 'Render', content: () => h('em', 'Rendered') },
];

describe('PixelAccordion', () => {
  it('renders panel content given as text, a VNode or a render function', async () => {
    const wrapper = mount(PixelAccordion, { props: { items: ITEMS, allowMultiple: true } });
    const headers = wrapper.findAll('button');
    await headers[1]!.trigger('click');
    await headers[2]!.trigger('click');
    expect(wrapper.text()).toContain('Plain text');
    expect(wrapper.find('strong').text()).toBe('A VNode');
    expect(wrapper.find('em').text()).toBe('Rendered');
  });

  it('wires each header to its panel, which takes no name', () => {
    const wrapper = mount(PixelAccordion, { props: { items: ITEMS } });
    const header = wrapper.find('button');
    const panel = wrapper.find(`#${header.attributes('aria-controls')}`);
    expect(panel.text()).toBe('Plain text');
    expect(panel.attributes('aria-labelledby')).toBeUndefined();
  });

  it('reads the items open on first render once, and follows allow-multiple as it changes', async () => {
    const wrapper = mount(PixelAccordion, { props: { items: ITEMS, collapsedByDefault: true } });
    await wrapper.setProps({ collapsedByDefault: false });
    expect(wrapper.findAll('[aria-expanded="true"]')).toHaveLength(0);
    await wrapper.setProps({ allowMultiple: true });
    const headers = wrapper.findAll('button');
    await headers[0]!.trigger('click');
    await headers[2]!.trigger('click');
    expect(wrapper.findAll('[aria-expanded="true"]')).toHaveLength(2);
  });

  it("lights up a focused header inside its item on the pixel surface, whose cut corners clip a ring, and rings it on the linear one", () => {
    const headers = (surface: 'pixel' | 'linear') =>
      mount(PixelAccordion, { props: { items: ITEMS, surface } }).findAll('button').map((header) => header.classes());
    for (const pixel of headers('pixel')) {
      expect(pixel).toContain('focus-visible:pxl-focus-inset');
      expect(pixel.filter((c) => c.includes('ring'))).toEqual([]);
    }
    for (const linear of headers('linear')) expect(linear).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:ring-retro-cyan/30']));
  });
});
