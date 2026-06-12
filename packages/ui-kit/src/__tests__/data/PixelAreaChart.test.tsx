import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelAreaChart } from '../../data/PixelAreaChart';

/* Extracted from __tests__/data/PixelChartPrimitives.test.tsx into the
   mirrored per-component file. */

const sampleData = [
  { x: 0, y: 10 },
  { x: 1, y: 30 },
  { x: 2, y: 20 },
  { x: 3, y: 50 },
  { x: 4, y: 40 },
];

describe('PixelAreaChart', () => {
  it('renders a filled polygon', () => {
    const { container } = render(
      <PixelAreaChart data={sampleData} aria-label="Revenue area" />,
    );
    const polygon = container.querySelector('polygon');
    expect(polygon).not.toBeNull();
    const points = polygon!.getAttribute('points') ?? '';
    // closing polygon: N data points + 2 baseline corners
    const pairs = points.trim().split(/\s+/).filter(Boolean);
    expect(pairs.length).toBe(sampleData.length + 2);
  });

  it('exposes role=img with the provided aria-label', () => {
    const { getByRole } = render(
      <PixelAreaChart data={sampleData} aria-label="Revenue area" />,
    );
    const svg = getByRole('img', { name: 'Revenue area' });
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('tone="cyan" applies cyan stroke and fill', () => {
    const { container } = render(
      <PixelAreaChart data={sampleData} tone="cyan" aria-label="cyan" />,
    );
    const polygon = container.querySelector('polygon');
    expect(polygon?.getAttribute('class') ?? '').toMatch(/retro-cyan/);
  });
});
