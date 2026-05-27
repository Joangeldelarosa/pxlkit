import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GridOverlay } from './GridOverlay';

describe('GridOverlay', () => {
  it('draws 2*(gridSize+1) lines for an N x N grid', () => {
    const { container } = render(<GridOverlay gridSize={16} renderPx={64} color="#fff" />);
    expect(container.querySelectorAll('line')).toHaveLength(2 * 17);
  });

  it('sizes the svg to renderPx and scales with grid size', () => {
    const { container } = render(<GridOverlay gridSize={8} renderPx={128} color="#fff" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('128');
    expect(container.querySelectorAll('line')).toHaveLength(2 * 9);
  });

  it('renders no lines for an invalid grid size', () => {
    const { container } = render(<GridOverlay gridSize={0} renderPx={64} color="#fff" />);
    expect(container.querySelectorAll('line')).toHaveLength(0);
  });
});
