import { describe, it, expect } from 'vitest';
import {
  ICON_IMAGE_STYLE,
  renderIconDataUri,
  renderIconSvg,
  resolveIconLabel,
} from '../../engine/icon';
import type { PxlKitData } from '../../types';
import { testIcon, testIconWithAlpha } from '../fixtures';

function parse(svg: string): SVGSVGElement {
  const host = document.createElement('div');
  host.innerHTML = svg;
  return host.querySelector('svg') as SVGSVGElement;
}

const fills = (svg: string) =>
  Array.from(parse(svg).querySelectorAll('rect')).map((r) => r.getAttribute('fill'));

describe('renderIconSvg', () => {
  it('draws the native grid with crisp edges', () => {
    const svg = parse(renderIconSvg(testIcon));
    expect(svg.getAttribute('viewBox')).toBe('0 0 8 8');
    expect(svg.getAttribute('shape-rendering')).toBe('crispEdges');
    expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
  });

  it('merges same-colour runs on a row into one rect', () => {
    // Row 1 is ".RR..GG." → one 2-wide red rect and one 2-wide green rect.
    const rects = Array.from(parse(renderIconSvg(testIcon)).querySelectorAll('rect[y="1"]'));
    expect(rects.map((r) => [r.getAttribute('x'), r.getAttribute('width'), r.getAttribute('fill')])).toEqual([
      ['1', '2', '#FF0000'],
      ['5', '2', '#00FF00'],
    ]);
  });

  it('palette mode (default) keeps the artwork colours', () => {
    expect(new Set(fills(renderIconSvg(testIcon)))).toEqual(
      new Set(['#FF0000', '#00FF00', '#0000FF', '#FFFF00']),
    );
    expect(renderIconSvg(testIcon, { appearance: 'palette' })).toBe(renderIconSvg(testIcon));
  });

  it('solid mode flattens every pixel and merges across colours', () => {
    const svg = renderIconSvg(testIcon, { appearance: 'solid', color: '#123456' });
    expect(new Set(fills(svg))).toEqual(new Set(['#123456']));
    // Same-row runs of different colours now merge only where contiguous.
    expect(parse(svg).querySelectorAll('rect[y="1"]')).toHaveLength(2);
  });

  it('solid and tinted fall back to white without a colour (an <img> has no currentColor)', () => {
    expect(new Set(fills(renderIconSvg(testIcon, { appearance: 'solid' })))).toEqual(new Set(['#FFFFFF']));
    expect(renderIconSvg(testIcon, { appearance: 'solid', color: '' })).toBe(
      renderIconSvg(testIcon, { appearance: 'solid' }),
    );
    expect(renderIconSvg(testIcon, { appearance: 'tinted' })).toContain('flood-color="#FFFFFF"');
  });

  it('tinted mode wraps the palette in a hue-shifting filter', () => {
    const svg = renderIconSvg(testIcon, { appearance: 'tinted', color: '#00FF00' });
    const doc = parse(svg);
    const filter = doc.querySelector('filter#pxk-tint');
    expect(filter).not.toBeNull();
    expect(doc.querySelector('feFlood')?.getAttribute('flood-color')).toBe('#00FF00');
    expect(doc.querySelector('feComposite')?.getAttribute('operator')).toBe('in');
    const blend = doc.querySelector('feBlend');
    expect(blend?.getAttribute('mode')).toBe('color');
    // The flat tint is the TOP layer so luminance comes from the artwork.
    expect(blend?.getAttribute('in')).toBe('tinted');
    expect(blend?.getAttribute('in2')).toBe('SourceGraphic');
    expect(doc.querySelector('g')?.getAttribute('filter')).toBe('url(#pxk-tint)');
    // Palette colours are kept underneath the filter.
    expect(fills(svg)).toContain('#FF0000');
  });

  it('emits fill-opacity only for translucent pixels', () => {
    const translucent = parse(renderIconSvg(testIconWithAlpha)).querySelector('rect');
    expect(translucent?.getAttribute('fill-opacity')).toBe('0.502');
    expect(translucent?.getAttribute('fill')).toBe('#FF0000');
    expect(renderIconSvg(testIcon)).not.toContain('fill-opacity');
  });

  it('never merges pixels of different opacity', () => {
    const icon: PxlKitData = {
      ...testIcon,
      grid: ['AB......', ...testIcon.grid.slice(1)],
      palette: { ...testIcon.palette, A: '#FF0000', B: '#FF000080' },
    };
    const row0 = parse(renderIconSvg(icon, { appearance: 'solid', color: '#000' })).querySelectorAll('rect[y="0"]');
    expect(row0).toHaveLength(2);
  });

  it('escapes attribute values so a malformed colour cannot break the markup', () => {
    const svg = renderIconSvg(testIcon, { appearance: 'solid', color: 'red" onload="x' });
    expect(svg).toContain('fill="red&quot; onload=&quot;x"');
    expect(parse(svg).querySelector('rect')?.getAttribute('onload')).toBeNull();
    expect(renderIconSvg(testIcon, { appearance: 'tinted', color: '<b>&' })).toContain(
      'flood-color="&lt;b>&amp;"',
    );
  });

  it('renders an empty, valid document for an empty grid', () => {
    const empty: PxlKitData = { ...testIcon, grid: [], palette: {} };
    expect(renderIconSvg(empty)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges"></svg>',
    );
  });
});

describe('renderIconDataUri', () => {
  it('URI-encodes the exact SVG document', () => {
    const uri = renderIconDataUri(testIcon, { appearance: 'tinted', color: '#ABCDEF' });
    expect(uri.startsWith('data:image/svg+xml,')).toBe(true);
    expect(decodeURIComponent(uri.slice('data:image/svg+xml,'.length))).toBe(
      renderIconSvg(testIcon, { appearance: 'tinted', color: '#ABCDEF' }),
    );
    expect(uri).not.toMatch(/[<>"#\s]/);
  });
});

describe('resolveIconLabel', () => {
  it('prefers the explicit label and falls back to the icon name', () => {
    expect(resolveIconLabel(testIcon, 'Trophy')).toBe('Trophy');
    expect(resolveIconLabel(testIcon)).toBe('test-icon');
    expect(resolveIconLabel(testIcon, '')).toBe('test-icon');
  });
});

describe('ICON_IMAGE_STYLE', () => {
  it('is a frozen, unit-explicit style map', () => {
    expect(ICON_IMAGE_STYLE).toEqual({
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: '0',
      imageRendering: 'pixelated',
    });
    expect(Object.isFrozen(ICON_IMAGE_STYLE)).toBe(true);
  });
});
