/**
 * PixelBarChart beyond the parity examples: its accessible name, a series
 * that changes, its value labels and the attributes it passes on.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelBarChart } from '../../index';

const data = [
  { x: 'a', y: 4 },
  { x: 'b', y: -4 },
];

describe('PixelBarChart', () => {
  it('is an image named by a summary of its series, or by its own aria-label', async () => {
    const wrapper = mount(PixelBarChart, { props: { data } });
    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('bar chart with 2 points, range -4 to 4');
    await wrapper.setProps({ ariaLabel: 'Sales by week' });
    expect(wrapper.attributes('aria-label')).toBe('Sales by week');
  });

  it('draws a bar per point and labels them on demand, following its series', async () => {
    const wrapper = mount(PixelBarChart, { props: { data, size: 'sm', showValues: true, orientation: 'horizontal' } });
    expect(wrapper.findAll('rect').map((rect) => [rect.attributes('x'), rect.attributes('width')])).toEqual([
      ['4', '152'],
      ['4', '2'],
    ]);
    expect(wrapper.findAll('text').map((text) => [text.text(), text.attributes('text-anchor')])).toEqual([
      ['4', 'start'],
      ['-4', 'start'],
    ]);
    await wrapper.setProps({ data: [...data, { x: 'c', y: 0 }], showValues: false });
    expect(wrapper.findAll('rect')).toHaveLength(3);
    expect(wrapper.find('text').exists()).toBe(false);
  });

  it('rounds its bars on the linear surface and passes attributes on', () => {
    const wrapper = mount(PixelBarChart, { props: { data, surface: 'linear' }, attrs: { class: 'w-full', 'data-testid': 'bars' } });
    expect(wrapper.find('rect').attributes('rx')).toBe('2');
    expect(wrapper.attributes('shape-rendering')).toBe('geometricPrecision');
    expect(wrapper.attributes('data-testid')).toBe('bars');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['h-auto', 'w-full']));
  });

  it('leaves the slot of a value that is not finite empty, without a bar or a label', () => {
    const gappy = [
      { x: 'a', y: 4 },
      { x: 'b', y: Number.NaN },
      { x: 'c', y: 2 },
      { x: 'd', y: Infinity },
    ];
    const wrapper = mount(PixelBarChart, { props: { data: gappy, size: 'sm', showValues: true } });
    expect(wrapper.findAll('rect').map((rect) => ['x', 'y', 'width', 'height'].map((name) => rect.attributes(name)))).toEqual([
      ['4', '14', '36.5', '36'],
      ['81', '32', '36.5', '18'],
    ]);
    expect(wrapper.findAll('text').map((text) => text.text())).toEqual(['4', '2']);
    expect(wrapper.attributes('aria-label')).toBe('bar chart with 2 points, range 2 to 4');
  });
});
