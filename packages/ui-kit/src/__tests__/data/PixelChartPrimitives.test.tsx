import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  PixelSparkline,
  PixelBarChart,
  PixelAreaChart,
} from '../../data/PixelChartPrimitives';

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
