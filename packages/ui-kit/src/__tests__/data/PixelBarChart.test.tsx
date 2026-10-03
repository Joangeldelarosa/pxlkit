import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelBarChart } from '../../data/PixelBarChart';

/* Extracted from __tests__/data/PixelChartPrimitives.test.tsx into the
   mirrored per-component file. */

const sampleData = [
  { x: 0, y: 10 },
  { x: 1, y: 30 },
  { x: 2, y: 20 },
  { x: 3, y: 50 },
  { x: 4, y: 40 },
];

describe('PixelBarChart', () => {
  it('renders one rect per data point', () => {
    const { container } = render(
      <PixelBarChart data={sampleData} aria-label="Sales by week" />,
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(sampleData.length);
  });

  it('exposes role=img with the provided aria-label', () => {
    const { getByRole } = render(
      <PixelBarChart data={sampleData} aria-label="Sales by week" />,
    );
    const svg = getByRole('img', { name: 'Sales by week' });
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('bordered pairs the border width with a border color', () => {
    const { container } = render(
      <PixelBarChart data={sampleData} bordered aria-label="bordered" />,
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class') ?? '').toContain('border-retro-border');
  });

  it('tone="cyan" applies cyan fill to bars', () => {
    const { container } = render(
      <PixelBarChart data={sampleData} tone="cyan" aria-label="cyan" />,
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('class') ?? '').toMatch(/retro-cyan/);
  });

  it('pixel surface uses shapeRendering=crispEdges', () => {
    const { container } = render(
      <PixelBarChart data={sampleData} surface="pixel" aria-label="pixel" />,
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('shape-rendering')).toBe('crispEdges');
  });

  it('leaves the slot of a value that is not finite empty, without a bar or a label', () => {
    const { container } = render(
      <PixelBarChart
        data={[
          { x: 'a', y: 4 },
          { x: 'b', y: Number.NaN },
          { x: 'c', y: 2 },
          { x: 'd', y: Infinity },
        ]}
        size="sm"
        showValues
      />,
    );
    const bars = Array.from(container.querySelectorAll('rect'), (rect) =>
      ['x', 'y', 'width', 'height'].map((name) => rect.getAttribute(name)),
    );
    expect(bars).toEqual([
      ['4', '14', '36.5', '36'],
      ['81', '32', '36.5', '18'],
    ]);
    expect(Array.from(container.querySelectorAll('text'), (text) => text.textContent)).toEqual(['4', '2']);
    expect(container.querySelector('svg')!.getAttribute('aria-label')).toBe('bar chart with 2 points, range 2 to 4');
  });
});
