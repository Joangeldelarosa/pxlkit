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
});
