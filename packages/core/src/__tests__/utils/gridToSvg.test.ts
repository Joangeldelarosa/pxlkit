import { describe, it, expect } from 'vitest';
import { gridToSvg } from '../../utils/gridToSvg';
import { testIcon } from '../fixtures';

describe('gridToSvg', () => {
  it('returns a valid SVG string', () => {
    const svg = gridToSvg(testIcon);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('colorful mode uses pixel colors', () => {
    const svg = gridToSvg(testIcon, { mode: 'colorful' });
    expect(svg).toContain('fill="#FF0000"');
    expect(svg).toContain('fill="#00FF00"');
  });

  it('monochrome mode uses currentColor', () => {
    const svg = gridToSvg(testIcon, { mode: 'monochrome' });
    expect(svg).toContain('fill="currentColor"');
    expect(svg).not.toContain('fill="#FF0000"');
  });

  it('includes correct viewBox based on icon size', () => {
    const svg = gridToSvg(testIcon);
    expect(svg).toContain(`viewBox="0 0 ${testIcon.size} ${testIcon.size}"`);
  });

  it('contains shape-rendering="crispEdges"', () => {
    const svg = gridToSvg(testIcon);
    expect(svg).toContain('shape-rendering="crispEdges"');
  });

  it('returns an SVG with no rects for all-transparent icon', () => {
    const emptyIcon = {
      name: 'empty',
      size: 8 as const,
      category: 'test',
      grid: Array(8).fill('........'),
      palette: {},
      tags: [],
    };
    const svg = gridToSvg(emptyIcon, { mode: 'colorful' });
    expect(svg).not.toContain('<rect');
  });
});
