import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PixelSkeleton } from '../../feedback/PixelSkeleton';

describe('PixelSkeleton — accessibility', () => {
  it('exposes role="status" with the default "Loading" label', () => {
    render(<PixelSkeleton />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('ariaLabel overrides the accessible name', () => {
    render(<PixelSkeleton ariaLabel="Loading avatar" />);
    expect(screen.getByRole('status', { name: 'Loading avatar' })).toBeInTheDocument();
  });
});

describe('PixelSkeleton — sizing', () => {
  it('applies width/height as inline styles (default height 1rem)', () => {
    render(<PixelSkeleton width="12rem" />);
    const el = screen.getByRole('status');
    expect(el.style.width).toBe('12rem');
    expect(el.style.height).toBe('1rem');
  });

  it('merges a caller style object with the size props', () => {
    render(<PixelSkeleton width="50%" style={{ opacity: 0.5 }} />);
    const el = screen.getByRole('status');
    expect(el.style.width).toBe('50%');
    expect(el.style.opacity).toBe('0.5');
  });
});

describe('PixelSkeleton — shape per surface', () => {
  it('default pixel surface uses the staircase corner + pulse', () => {
    render(<PixelSkeleton />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('pxl-corner-sm');
    expect(el.className).toContain('animate-pulse');
  });

  it('rounded on pixel surface clips to a subtle 2px radius', () => {
    render(<PixelSkeleton rounded />);
    expect(screen.getByRole('status').className).toContain('rounded-[2px]');
  });

  it('rounded on linear surface becomes a full pill/circle', () => {
    render(<PixelSkeleton rounded surface="linear" />);
    expect(screen.getByRole('status').className).toContain('rounded-full');
  });
});

describe('PixelSkeleton — DOM pass-through', () => {
  it('forwards className and data-* attributes', () => {
    render(<PixelSkeleton className="custom-cls" data-testid="skel" />);
    const el = screen.getByTestId('skel');
    expect(el.className).toContain('custom-cls');
    expect(el.getAttribute('role')).toBe('status');
  });
});
