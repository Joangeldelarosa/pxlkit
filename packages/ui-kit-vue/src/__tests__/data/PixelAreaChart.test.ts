/**
 * PixelAreaChart beyond the parity examples: its accessible name, a series
 * that changes, smoothing on each surface and the attributes it passes on.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelAreaChart } from '../../index';

const data = [
  { x: 0, y: 10 },
  { x: 1, y: 30 },
];

describe('PixelAreaChart', () => {
  it('is an image named by a summary of its series, or by its own aria-label', async () => {
    const wrapper = mount(PixelAreaChart, { props: { data } });
    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('area chart with 2 points, range 10 to 30');
    await wrapper.setProps({ ariaLabel: 'Revenue area' });
    expect(wrapper.attributes('aria-label')).toBe('Revenue area');
  });

  it('draws nothing without data, and the closed area once it has some', async () => {
    const wrapper = mount(PixelAreaChart, { props: { data: [] } });
    expect(wrapper.find('polygon').exists()).toBe(false);
    expect(wrapper.attributes('aria-label')).toBe('area chart, no data');
    await wrapper.setProps({ data });
    expect(wrapper.find('polygon').attributes('points')).toBe('2.00,56.00 2.00,56.00 238.00,4.00 238.00,56.00');
  });

  it('rounds its joins only when smooth on the linear surface, and passes attributes on', async () => {
    const wrapper = mount(PixelAreaChart, { props: { data, smooth: true }, attrs: { class: 'w-full', id: 'revenue' } });
    expect(wrapper.attributes('data-smooth')).toBe('true');
    expect(wrapper.find('polygon').attributes('stroke-linejoin')).toBe('miter');
    await wrapper.setProps({ surface: 'linear' });
    expect(wrapper.find('polygon').attributes('stroke-linejoin')).toBe('round');
    expect(wrapper.attributes('id')).toBe('revenue');
    expect(wrapper.classes()).toContain('w-full');
    await wrapper.setProps({ smooth: false, tone: 'gold' });
    expect(wrapper.attributes('data-smooth')).toBeUndefined();
    expect(wrapper.attributes('data-tone-glow')).toBe('shadow-[0_0_24px_-8px_rgba(234,179,8,0.45)]');
  });

  it('leaves out values that are not finite: they draw nothing and the summary skips them', async () => {
    const gappy = [
      { x: 0, y: 10 },
      { x: 1, y: Number.NaN },
      { x: 2, y: 30 },
      { x: 3, y: -Infinity },
    ];
    const wrapper = mount(PixelAreaChart, { props: { data: gappy } });
    expect(wrapper.find('polygon').attributes('points')).toBe('2.00,56.00 2.00,56.00 159.33,4.00 159.33,56.00');
    expect(wrapper.attributes('aria-label')).toBe('area chart with 2 points, range 10 to 30');
    await wrapper.setProps({ data: [{ x: 0, y: Infinity }] });
    expect(wrapper.find('polygon').exists()).toBe(false);
    expect(wrapper.attributes('aria-label')).toBe('area chart, no data');
  });
});
