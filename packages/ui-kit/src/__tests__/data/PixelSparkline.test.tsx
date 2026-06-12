import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelSparkline } from '../../data/PixelSparkline';

/* Extracted from __tests__/data/PixelChartPrimitives.test.tsx into the
   mirrored per-component file. */

const sampleData = [
  { x: 0, y: 10 },
  { x: 1, y: 30 },
  { x: 2, y: 20 },
  { x: 3, y: 50 },
  { x: 4, y: 40 },
];

describe('PixelSparkline', () => {
  it('renders a polyline with N points', () => {
    const { container } = render(
      <PixelSparkline data={sampleData} aria-label="Revenue sparkline" />,
    );
    const polyline = container.querySelector('polyline');
    expect(polyline).not.toBeNull();
    const points = polyline!.getAttribute('points') ?? '';
    // N points → N "x,y" pairs separated by whitespace
    const pairs = points.trim().split(/\s+/).filter(Boolean);
    expect(pairs.length).toBe(sampleData.length);
  });

  it('exposes role=img with the provided aria-label', () => {
    const { getByRole } = render(
      <PixelSparkline data={sampleData} aria-label="Weekly revenue trend" />,
    );
    const svg = getByRole('img', { name: 'Weekly revenue trend' });
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('tone="cyan" tints the stroke with the cyan token', () => {
    const { container } = render(
      <PixelSparkline data={sampleData} tone="cyan" aria-label="cyan" />,
    );
    const polyline = container.querySelector('polyline');
    expect(polyline?.getAttribute('class') ?? '').toMatch(/retro-cyan/);
  });

  it('falls back to a default aria-label when none provided', () => {
    const { container } = render(<PixelSparkline data={sampleData} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBeTruthy();
  });
});
