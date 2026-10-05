import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { renderIconDataUri } from '@pxlkit/core/vanilla';
import { PxlKitIcon } from '../index';
import { testIcon, testIconWithAlpha } from './fixtures';

function decodeSvg(img: Element): string {
  const src = img.getAttribute('src') ?? '';
  expect(src).toMatch(/^data:image\/svg\+xml,/);
  return decodeURIComponent(src.replace(/^data:image\/svg\+xml,/, ''));
}

function svgOf(img: Element): SVGSVGElement {
  const host = document.createElement('div');
  host.innerHTML = decodeSvg(img);
  return host.querySelector('svg') as SVGSVGElement;
}

describe('PxlKitIcon (Vue)', () => {
  it('renders a bare <img> backed by the engine data URI', () => {
    const wrapper = mount(PxlKitIcon, { props: { icon: testIcon } });
    expect(wrapper.element.tagName).toBe('IMG');
    expect(wrapper.attributes('src')).toBe(renderIconDataUri(testIcon));
  });

  it('encodes the native grid with crisp edges', () => {
    const svg = svgOf(mount(PxlKitIcon, { props: { icon: testIcon } }).element);
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${testIcon.size} ${testIcon.size}`);
    expect(svg.getAttribute('shape-rendering')).toBe('crispEdges');
  });

  it('uses the icon name as alt text, overridable with aria-label', () => {
    expect(mount(PxlKitIcon, { props: { icon: testIcon } }).attributes('alt')).toBe('test-icon');
    const labelled = mount(PxlKitIcon, { props: { icon: testIcon }, attrs: { 'aria-label': 'Custom Label' } });
    expect(labelled.attributes('alt')).toBe('Custom Label');
    // `aria-label` is consumed as a prop, not duplicated onto the <img>.
    expect(labelled.attributes('aria-label')).toBeUndefined();
  });

  it('reads an empty aria-label as no label: the icon name stays the alt', () => {
    expect(mount(PxlKitIcon, { props: { icon: testIcon }, attrs: { 'aria-label': '' } }).attributes('alt')).toBe('test-icon');
  });

  it('decorative renders an empty alt and wins over aria-label', () => {
    const decorative = mount(PxlKitIcon, { props: { icon: testIcon, decorative: true }, attrs: { 'aria-label': 'Save' } });
    expect(decorative.attributes('alt')).toBe('');
    expect(decorative.attributes('aria-label')).toBeUndefined();
    expect(decorative.attributes('decorative')).toBeUndefined();
    // A bare `decorative` attribute in a template turns it on.
    expect(mount(PxlKitIcon, { props: { icon: testIcon }, attrs: { decorative: '' } }).attributes('alt')).toBe('');
    const labelled = mount(PxlKitIcon, { props: { icon: testIcon, decorative: false }, attrs: { 'aria-label': 'Save' } });
    expect(labelled.attributes('alt')).toBe('Save');
  });

  it('sizes the image (default 32)', () => {
    const icon = mount(PxlKitIcon, { props: { icon: testIcon } });
    expect(icon.attributes('width')).toBe('32');
    expect(icon.attributes('height')).toBe('32');
    const big = mount(PxlKitIcon, { props: { icon: testIcon, size: 64 } });
    expect(big.attributes('width')).toBe('64');
    expect(big.attributes('height')).toBe('64');
  });

  it('keeps nearest-neighbour scaling and the inline layout contract', () => {
    const img = mount(PxlKitIcon, { props: { icon: testIcon } }).element as HTMLImageElement;
    expect(img.style.imageRendering).toBe('pixelated');
    expect(img.style.display).toBe('inline-block');
    expect(img.style.verticalAlign).toBe('middle');
    expect(img.style.flexShrink).toBe('0');
    expect(img.getAttribute('draggable')).toBe('false');
  });

  it('lets class, style and other attributes fall through to the <img>', () => {
    const img = mount(PxlKitIcon, {
      props: { icon: testIcon },
      attrs: { class: 'my-class', style: 'border: 1px solid red; display: block', 'data-testid': 'trophy' },
    }).element as HTMLImageElement;
    expect(img.classList.contains('my-class')).toBe(true);
    expect(img.style.border).toBe('1px solid red');
    expect(img.style.display).toBe('block'); // consumer style wins
    expect(img.style.imageRendering).toBe('pixelated');
    expect(img.dataset.testid).toBe('trophy');
  });

  it('palette mode keeps the artwork colours', () => {
    const fills = Array.from(svgOf(mount(PxlKitIcon, { props: { icon: testIcon } }).element).querySelectorAll('rect')).map((r) => r.getAttribute('fill'));
    expect(fills).toContain('#FF0000');
  });

  it('solid mode flattens every pixel to the colour', () => {
    const svg = svgOf(mount(PxlKitIcon, { props: { icon: testIcon, appearance: 'solid', color: '#FF5500' } }).element);
    for (const rect of Array.from(svg.querySelectorAll('rect'))) {
      expect(rect.getAttribute('fill')).toBe('#FF5500');
    }
  });

  it('tinted mode embeds the tint filter', () => {
    const decoded = decodeSvg(mount(PxlKitIcon, { props: { icon: testIcon, appearance: 'tinted', color: '#00FF00' } }).element);
    expect(decoded).toContain('flood-color="#00FF00"');
    expect(decoded).toContain('mode="color"');
  });

  it('keeps per-pixel opacity', () => {
    expect(decodeSvg(mount(PxlKitIcon, { props: { icon: testIconWithAlpha } }).element)).toContain('fill-opacity="0.502"');
  });

  it('re-renders when its props change', async () => {
    const wrapper = mount(PxlKitIcon, { props: { icon: testIcon } });
    await wrapper.setProps({ appearance: 'solid', color: '#123456' });
    expect(wrapper.attributes('src')).toBe(renderIconDataUri(testIcon, { appearance: 'solid', color: '#123456' }));
    await wrapper.setProps({ icon: testIconWithAlpha });
    expect(wrapper.attributes('alt')).toBe('alpha-test');
  });

  it('server-renders the same <img>', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(PxlKitIcon, { icon: testIcon, size: 24 }) }));
    expect(html).toMatch(/^<img /);
    expect(html).toContain(`src="${renderIconDataUri(testIcon)}"`);
    expect(html).toContain('width="24"');
    expect(html).toContain('alt="test-icon"');
    expect(html).toContain('draggable="false"');
    expect(html).toContain('image-rendering:pixelated');
    // Vue writes an empty attribute bare (`alt`), which parses as `alt=""`.
    const decorative = document.createElement('div');
    decorative.innerHTML = await renderToString(createSSRApp({ render: () => h(PxlKitIcon, { icon: testIcon, decorative: true }) }));
    expect(decorative.querySelector('img')!.getAttribute('alt')).toBe('');
  });
});
