import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PxlKitIcon } from '../../components/PxlKitIcon';
import { testIcon } from '../fixtures';

/**
 * PxlKitIcon renders directly as `<img src="data:image/svg+xml,...">` with
 * NO wrapper element. The image's `src` data URI contains the full SVG
 * markup — decoding it lets us assert on viewBox, rects, shape-rendering,
 * etc. Accessibility uses `alt` (the native img mechanism) which RTL
 * surfaces as both `getByRole('img')` and `getByAltText(...)`.
 */

function getImg(container: HTMLElement): HTMLImageElement {
  const img = container.querySelector('img');
  expect(img).not.toBeNull();
  return img as HTMLImageElement;
}

function decodeSvgFromImg(img: HTMLImageElement): string {
  const src = img.getAttribute('src') || '';
  expect(src).toMatch(/^data:image\/svg\+xml,/);
  return decodeURIComponent(src.replace(/^data:image\/svg\+xml,/, ''));
}

function parseSvg(svgMarkup: string): SVGSVGElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = svgMarkup;
  const svg = wrapper.querySelector('svg');
  expect(svg).not.toBeNull();
  return svg as SVGSVGElement;
}

describe('PxlKitIcon', () => {
  it('renders an <img> backed by an SVG data URI', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} />);
    const img = getImg(container);
    expect(img.getAttribute('src')).toMatch(/^data:image\/svg\+xml,/);
  });

  it('encoded SVG has correct viewBox based on icon size', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} />);
    const svg = parseSvg(decodeSvgFromImg(getImg(container)));
    expect(svg.getAttribute('viewBox')).toBe(
      `0 0 ${testIcon.size} ${testIcon.size}`
    );
  });

  it('exposes role="img" via the native <img> element', () => {
    render(<PxlKitIcon icon={testIcon} />);
    expect(screen.getByRole('img')).toBeTruthy();
  });

  it('uses icon name as default alt text', () => {
    render(<PxlKitIcon icon={testIcon} />);
    expect(screen.getByAltText(testIcon.name)).toBeTruthy();
  });

  it('custom aria-label overrides default alt', () => {
    render(<PxlKitIcon icon={testIcon} aria-label="Custom Label" />);
    expect(screen.getByAltText('Custom Label')).toBeTruthy();
  });

  it('applies className prop to the <img>', () => {
    const { container } = render(
      <PxlKitIcon icon={testIcon} className="my-class" />
    );
    const img = getImg(container);
    expect(img.classList.contains('my-class')).toBe(true);
  });

  it('applies style prop to the <img>', () => {
    const { container } = render(
      <PxlKitIcon icon={testIcon} style={{ border: '1px solid red' }} />
    );
    const img = getImg(container);
    expect(img.style.border).toBe('1px solid red');
  });

  it('sets width and height on the <img> from size prop', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} size={64} />);
    const img = getImg(container);
    expect(img.getAttribute('width')).toBe('64');
    expect(img.getAttribute('height')).toBe('64');
  });

  it('uses default size of 32', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} />);
    const img = getImg(container);
    expect(img.getAttribute('width')).toBe('32');
    expect(img.getAttribute('height')).toBe('32');
  });

  it('palette mode (default) uses original colors from the icon palette', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} />);
    const svg = parseSvg(decodeSvgFromImg(getImg(container)));
    const rects = svg.querySelectorAll('rect');
    const fills = Array.from(rects).map((r) => r.getAttribute('fill'));
    expect(fills.some((f) => f === '#FF0000')).toBe(true);
  });

  it('legacy `colorful` prop still renders palette colors (backward compat)', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} colorful />);
    const svg = parseSvg(decodeSvgFromImg(getImg(container)));
    const rects = svg.querySelectorAll('rect');
    const fills = Array.from(rects).map((r) => r.getAttribute('fill'));
    expect(fills).toContain('#FF0000');
  });

  it('solid appearance with custom color flattens every pixel to that color', () => {
    const { container } = render(
      <PxlKitIcon icon={testIcon} appearance="solid" color="#FF5500" />
    );
    const svg = parseSvg(decodeSvgFromImg(getImg(container)));
    const rects = svg.querySelectorAll('rect');
    rects.forEach((rect) => {
      expect(rect.getAttribute('fill')).toBe('#FF5500');
    });
  });

  it('legacy `color` + `colorful={false}` falls back to solid mode (backward compat)', () => {
    const { container } = render(
      <PxlKitIcon icon={testIcon} colorful={false} color="#FF5500" />
    );
    const svg = parseSvg(decodeSvgFromImg(getImg(container)));
    const rects = svg.querySelectorAll('rect');
    rects.forEach((rect) => {
      expect(rect.getAttribute('fill')).toBe('#FF5500');
    });
  });

  it('encoded SVG keeps shape-rendering="crispEdges"', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} />);
    const svg = parseSvg(decodeSvgFromImg(getImg(container)));
    expect(svg.getAttribute('shape-rendering')).toBe('crispEdges');
  });

  it('uses image-rendering: pixelated for nearest-neighbour scaling', () => {
    const { container } = render(<PxlKitIcon icon={testIcon} />);
    const img = getImg(container);
    expect(img.style.imageRendering).toBe('pixelated');
  });

  it('appearance="tinted" embeds a tint filter in the encoded SVG', () => {
    const { container } = render(
      <PxlKitIcon icon={testIcon} appearance="tinted" color="#00FF00" />
    );
    const decoded = decodeSvgFromImg(getImg(container));
    // Filter is composed of feFlood + feComposite + feBlend mode="color".
    expect(decoded).toContain('<filter');
    expect(decoded).toContain('feFlood');
    expect(decoded).toContain('flood-color="#00FF00"');
    expect(decoded).toContain('feBlend');
    expect(decoded).toContain('mode="color"');
  });
});
