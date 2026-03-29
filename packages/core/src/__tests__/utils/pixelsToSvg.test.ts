import { describe, it, expect } from 'vitest';
import { pixelsToSvg } from '../../utils/pixelsToSvg';
import type { Pixel } from '../../types';

const redPixel: Pixel = { x: 0, y: 0, color: '#FF0000' };
const greenPixel: Pixel = { x: 1, y: 0, color: '#00FF00' };
const bluePixel: Pixel = { x: 2, y: 0, color: '#0000FF' };

describe('pixelsToSvg', () => {
  it('returns SVG with no rects for empty pixel array', () => {
    const svg = pixelsToSvg([], 8, { mode: 'colorful' });
    expect(svg).toContain('<svg');
    expect(svg).not.toContain('<rect');
  });

  it('returns SVG with one rect for single pixel', () => {
    const svg = pixelsToSvg([redPixel], 8, { mode: 'colorful' });
    const rectCount = (svg.match(/<rect/g) || []).length;
    expect(rectCount).toBe(1);
  });

  it('uses pixel color as fill in colorful mode', () => {
    const svg = pixelsToSvg([redPixel], 8, { mode: 'colorful' });
    expect(svg).toContain('fill="#FF0000"');
  });

  it('uses currentColor in monochrome mode by default', () => {
    const svg = pixelsToSvg([redPixel], 8, { mode: 'monochrome' });
    expect(svg).toContain('fill="currentColor"');
    expect(svg).not.toContain('fill="#FF0000"');
  });

  it('uses custom monoColor in monochrome mode', () => {
    const svg = pixelsToSvg([redPixel], 8, {
      mode: 'monochrome',
      monoColor: '#333333',
    });
    expect(svg).toContain('fill="#333333"');
  });

  it('merges consecutive same-color pixels into wider rect', () => {
    const pixels: Pixel[] = [
      { x: 0, y: 0, color: '#FF0000' },
      { x: 1, y: 0, color: '#FF0000' },
      { x: 2, y: 0, color: '#FF0000' },
    ];
    const svg = pixelsToSvg(pixels, 8, { mode: 'colorful' });
    const rectCount = (svg.match(/<rect/g) || []).length;
    // Should be merged into 1 rect with width=3
    expect(rectCount).toBe(1);
    expect(svg).toContain('width="3"');
  });

  it('does not merge consecutive different-color pixels', () => {
    const pixels = [redPixel, greenPixel, bluePixel];
    const svg = pixelsToSvg(pixels, 8, { mode: 'colorful' });
    const rectCount = (svg.match(/<rect/g) || []).length;
    expect(rectCount).toBe(3);
  });

  it('adds fill-opacity attribute for pixels with opacity < 1', () => {
    const pixel: Pixel = { x: 0, y: 0, color: '#FF0000', opacity: 0.5 };
    const svg = pixelsToSvg([pixel], 8, { mode: 'colorful' });
    expect(svg).toContain('fill-opacity="0.5"');
  });

  it('does not add fill-opacity for pixels with opacity 1', () => {
    const pixel: Pixel = { x: 0, y: 0, color: '#FF0000' };
    const svg = pixelsToSvg([pixel], 8, { mode: 'colorful' });
    expect(svg).not.toContain('fill-opacity');
  });

  it('multiplies coordinates by pixelSize', () => {
    const pixel: Pixel = { x: 1, y: 2, color: '#FF0000' };
    const svg = pixelsToSvg([pixel], 8, {
      mode: 'colorful',
      pixelSize: 2,
    });
    expect(svg).toContain('x="2"');
    expect(svg).toContain('y="4"');
  });

  it('includes XML declaration when xmlDeclaration is true', () => {
    const svg = pixelsToSvg([redPixel], 8, {
      mode: 'colorful',
      xmlDeclaration: true,
    });
    expect(svg).toMatch(/^<\?xml/);
  });

  it('does not include XML declaration by default', () => {
    const svg = pixelsToSvg([redPixel], 8, { mode: 'colorful' });
    expect(svg).not.toMatch(/^<\?xml/);
  });

  it('contains shape-rendering="crispEdges"', () => {
    const svg = pixelsToSvg([redPixel], 8, { mode: 'colorful' });
    expect(svg).toContain('shape-rendering="crispEdges"');
  });

  it('contains xmlns attribute', () => {
    const svg = pixelsToSvg([redPixel], 8, { mode: 'colorful' });
    expect(svg).toContain('xmlns');
  });

  it('does not merge pixels with same color but different opacity', () => {
    const pixels: Pixel[] = [
      { x: 0, y: 0, color: '#FF0000', opacity: 0.5 },
      { x: 1, y: 0, color: '#FF0000', opacity: 1 },
    ];
    const svg = pixelsToSvg(pixels, 8, { mode: 'colorful' });
    const rectCount = (svg.match(/<rect/g) || []).length;
    expect(rectCount).toBe(2);
  });
});
