/**
 * PixelSparkline beyond the parity examples: its accessible name, a series
 * that changes, the surface it inherits and the attributes it passes on.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelSparkline, PxlKitSurfaceProvider } from '../../index';

const data = [
  { x: 0, y: 10 },
  { x: 1, y: 30 },
  { x: 2, y: 20 },
];

describe('PixelSparkline', () => {
  it('is an image named by a summary of its series, or by its own aria-label', async () => {
    const wrapper = mount(PixelSparkline, { props: { data } });
    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('sparkline with 3 points, range 10 to 30');
    await wrapper.setProps({ ariaLabel: 'Weekly revenue' });
    expect(wrapper.attributes('aria-label')).toBe('Weekly revenue');
    // A label bound to nothing keeps the summary, as React's `aria-label={undefined}` does.
    await wrapper.setProps({ ariaLabel: undefined });
    expect(wrapper.attributes('aria-label')).toBe('sparkline with 3 points, range 10 to 30');
  });

  it('redraws when its series changes, with an area once asked and two points exist', async () => {
    const wrapper = mount(PixelSparkline, { props: { data: [{ x: 0, y: 1 }], showArea: true } });
    expect(wrapper.find('polyline').attributes('points')).toBe('2.00,56.00');
    expect(wrapper.find('polygon').exists()).toBe(false);
    await wrapper.setProps({ data, size: 'sm' });
    expect(wrapper.attributes('viewBox')).toBe('0 0 120 32');
    expect(wrapper.find('polyline').attributes('points')).toBe('2.00,28.00 60.00,4.00 118.00,16.00');
    expect(wrapper.find('polygon').attributes('points')).toBe('2.00,28.00 2.00,28.00 60.00,4.00 118.00,16.00 118.00,28.00');
  });

  it("takes its provider's surface and passes attributes and classes to the svg", () => {
    const wrapper = mount(() =>
      h(PxlKitSurfaceProvider, { surface: 'linear' }, () =>
        h(PixelSparkline, { data, class: 'w-full', 'data-testid': 'trend', bordered: true }),
      ),
    );
    const svg = wrapper.get('[data-testid="trend"]');
    expect(svg.attributes('shape-rendering')).toBe('geometricPrecision');
    expect(svg.classes()).toEqual(expect.arrayContaining(['overflow-visible', 'border', 'rounded-md', 'w-full']));
    expect(svg.find('polyline').attributes('stroke-linecap')).toBe('round');
  });
});
