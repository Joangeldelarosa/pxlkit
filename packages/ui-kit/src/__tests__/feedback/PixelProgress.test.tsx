import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PixelProgress } from '../../feedback/PixelProgress';

describe('PixelProgress — ARIA contract', () => {
  it('exposes role="progressbar" with valuenow/min/max', () => {
    render(<PixelProgress value={42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('42');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });

  it('defaults the accessible name to "Progress" when no label is given', () => {
    render(<PixelProgress value={10} />);
    expect(screen.getByRole('progressbar', { name: 'Progress' })).toBeInTheDocument();
  });

  it('uses the label as the accessible name when provided', () => {
    render(<PixelProgress value={10} label="HP" />);
    expect(screen.getByRole('progressbar', { name: 'HP' })).toBeInTheDocument();
  });

  it('clamps value into the 0-100 range', () => {
    const { rerender } = render(<PixelProgress value={150} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
    rerender(<PixelProgress value={-20} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
  });

  it('indeterminate drops aria-valuenow and sets aria-busy', () => {
    render(<PixelProgress value={50} indeterminate />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBeNull();
    expect(bar.getAttribute('aria-busy')).toBe('true');
  });
});

describe('PixelProgress — label row + showValue', () => {
  it('shows label text and the numeric percentage by default', () => {
    render(<PixelProgress value={75} label="XP" />);
    expect(screen.getByText('XP')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('hides the percentage when showValue={false}', () => {
    render(<PixelProgress value={75} label="XP" showValue={false} />);
    expect(screen.queryByText('75%')).toBeNull();
  });

  it('hides the percentage while indeterminate', () => {
    render(<PixelProgress value={75} label="XP" indeterminate />);
    expect(screen.queryByText('75%')).toBeNull();
  });
});

describe('PixelProgress — pixel surface (segmented HP bar)', () => {
  it('renders 10 segment blocks inside the progressbar', () => {
    render(<PixelProgress value={50} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.children.length).toBe(10);
  });

  it('fills segments proportionally to the value with the tone fill', () => {
    render(<PixelProgress value={50} tone="green" />);
    const segments = Array.from(screen.getByRole('progressbar').children) as HTMLElement[];
    const filled = segments.filter((s) => s.className.includes('bg-retro-green') && !s.className.includes('opacity-50'));
    expect(filled.length).toBe(5);
  });
});

describe('PixelProgress — linear surface (smooth bar)', () => {
  it('renders an inner fill div whose width tracks the value', () => {
    render(<PixelProgress value={60} surface="linear" />);
    const bar = screen.getByRole('progressbar');
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('60%');
  });

  it('indeterminate stretches the fill to 100% with pulse animation', () => {
    render(<PixelProgress value={10} surface="linear" indeterminate />);
    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('100%');
    expect(fill.className).toContain('animate-pulse');
  });
});
