/**
 * PixelDivider beyond the parity examples: switching between the bare rule
 * and the labelled separator, and class fall-through onto either.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelDivider } from '../../index';

describe('PixelDivider', () => {
  it('becomes a labelled separator when given a label, and a bare rule again without one', async () => {
    const wrapper = mount(PixelDivider, { attrs: { class: 'my-8' } });
    expect(wrapper.element.tagName).toBe('HR');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['my-8', 'border-dotted']));
    await wrapper.setProps({ label: 'Settings', tone: 'red' });
    const separator = wrapper.find('[role="separator"]');
    expect(separator.element).toBe(wrapper.element);
    expect(separator.attributes()).toMatchObject({ 'aria-orientation': 'horizontal', 'aria-label': 'Settings' });
    expect(separator.classes()).toContain('my-8');
    expect(wrapper.findAll('hr[aria-hidden="true"]')).toHaveLength(2);
    expect(wrapper.find('span').classes()).toContain('text-retro-red');
    await wrapper.setProps({ label: '' });
    expect(wrapper.element.tagName).toBe('HR');
  });

  it('frames the label with hidden diamonds only on the pixel surface', async () => {
    const wrapper = mount(PixelDivider, { props: { label: 'Loot' } });
    const ornaments = () => wrapper.findAll('span[aria-hidden="true"]');
    expect(ornaments().map((ornament) => ornament.text())).toEqual(['◆', '◆']);
    await wrapper.setProps({ surface: 'linear' });
    expect(ornaments()).toHaveLength(0);
    expect(wrapper.find('hr').classes()).not.toContain('border-dotted');
  });
});

describe('PixelDivider — label letter spacing', () => {
  it('spaces the label wide on linear too, where the display face is tight', () => {
    const tracking = (classes: string[]) => classes.filter((name) => name.startsWith('tracking-'));
    const label = mount(PixelDivider, { props: { surface: 'linear', label: 'Section' } }).get('[role="separator"] > span');
    expect(tracking(label.classes())).toEqual(['tracking-wider']);
  });
});
