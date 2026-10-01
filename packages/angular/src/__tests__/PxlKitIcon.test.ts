import { describe, it, expect } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PxlKitIcon, renderIconDataUri, type IconAppearance, type PxlKitData } from '@pxlkit/angular';
import { decodeSvg, svgOf } from './harness';
import { testIcon, testIconWithAlpha } from './fixtures';

@Component({
  imports: [PxlKitIcon],
  template: `<pxl-icon
    [icon]="icon()"
    [size]="size()"
    [appearance]="appearance()"
    [color]="color()"
    [ariaLabel]="ariaLabel()"
  />`,
})
class IconHost {
  readonly icon = signal<PxlKitData>(testIcon);
  readonly size = signal<number | undefined>(undefined);
  readonly appearance = signal<IconAppearance | undefined>(undefined);
  readonly color = signal<string | undefined>(undefined);
  readonly ariaLabel = signal<string | undefined>(undefined);
}

@Component({
  imports: [PxlKitIcon],
  template: `<pxl-icon
    [icon]="icon"
    size="48"
    class="my-class"
    style="border: 1px solid red; display: block"
    data-testid="trophy"
  />`,
})
class AttributeHost {
  readonly icon = testIcon;
}

function render(setup: (host: IconHost) => void = () => {}) {
  const fixture = TestBed.createComponent(IconHost);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  const host = fixture.nativeElement.querySelector('pxl-icon') as HTMLElement;
  const img = host.querySelector('img') as HTMLImageElement;
  return { fixture, host, img };
}

describe('PxlKitIcon (Angular)', () => {
  it('renders a <pxl-icon> box around an <img> backed by the engine data URI', () => {
    const { host, img } = render();
    expect(host.children).toHaveLength(1);
    expect(img.getAttribute('src')).toBe(renderIconDataUri(testIcon));
  });

  it('encodes the native grid with crisp edges', () => {
    const svg = svgOf(render().img);
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${testIcon.size} ${testIcon.size}`);
    expect(svg.getAttribute('shape-rendering')).toBe('crispEdges');
  });

  it('uses the icon name as alt text, overridable with ariaLabel', () => {
    expect(render().img.getAttribute('alt')).toBe('test-icon');
    const { host, img } = render((h) => h.ariaLabel.set('Custom Label'));
    expect(img.getAttribute('alt')).toBe('Custom Label');
    // The label names the image; it is not duplicated onto the host.
    expect(host.hasAttribute('aria-label')).toBe(false);
  });

  it('sizes the box and the image (default 32)', () => {
    const byDefault = render();
    expect(byDefault.host.style.width).toBe('32px');
    expect(byDefault.host.style.height).toBe('32px');
    expect(byDefault.img.getAttribute('width')).toBe('32');
    expect(byDefault.img.getAttribute('height')).toBe('32');
    const big = render((h) => h.size.set(64));
    expect(big.host.style.width).toBe('64px');
    expect(big.img.getAttribute('height')).toBe('64');
  });

  it('keeps nearest-neighbour scaling and the inline layout contract', () => {
    const { host, img } = render();
    expect(host.style.display).toBe('inline-block');
    expect(host.style.verticalAlign).toBe('middle');
    expect(host.style.flexShrink).toBe('0');
    expect(img.style.display).toBe('block');
    expect(img.style.width).toBe('100%');
    expect(img.style.height).toBe('100%');
    expect(img.style.imageRendering).toBe('pixelated');
    expect(img.getAttribute('draggable')).toBe('false');
  });

  it('accepts attribute values and merges class, style and attributes into the box', () => {
    const fixture = TestBed.createComponent(AttributeHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('pxl-icon') as HTMLElement;
    expect(host.style.width).toBe('48px');
    expect(host.querySelector('img')!.getAttribute('width')).toBe('48');
    expect(host.classList.contains('my-class')).toBe(true);
    expect(host.style.border).toBe('1px solid red');
    expect(host.style.display).toBe('block'); // consumer style wins
    expect(host.style.verticalAlign).toBe('middle');
    expect(host.dataset['testid']).toBe('trophy');
  });

  it('palette mode keeps the artwork colours', () => {
    const fills = Array.from(svgOf(render().img).querySelectorAll('rect')).map((r) => r.getAttribute('fill'));
    expect(fills).toContain('#FF0000');
  });

  it('solid mode flattens every pixel to the colour', () => {
    const svg = svgOf(render((h) => {
      h.appearance.set('solid');
      h.color.set('#FF5500');
    }).img);
    for (const rect of Array.from(svg.querySelectorAll('rect'))) {
      expect(rect.getAttribute('fill')).toBe('#FF5500');
    }
  });

  it('tinted mode embeds the tint filter', () => {
    const decoded = decodeSvg(render((h) => {
      h.appearance.set('tinted');
      h.color.set('#00FF00');
    }).img);
    expect(decoded).toContain('flood-color="#00FF00"');
    expect(decoded).toContain('mode="color"');
  });

  it('keeps per-pixel opacity', () => {
    expect(decodeSvg(render((h) => h.icon.set(testIconWithAlpha)).img)).toContain('fill-opacity="0.502"');
  });

  it('re-renders when its inputs change', async () => {
    const { fixture, img } = render();
    fixture.componentInstance.appearance.set('solid');
    fixture.componentInstance.color.set('#123456');
    await fixture.whenStable();
    const solid = renderIconDataUri(testIcon, { appearance: 'solid', color: '#123456' });
    expect(img.getAttribute('src')).toBe(solid);
    fixture.componentInstance.icon.set(testIconWithAlpha);
    await fixture.whenStable();
    expect(img.getAttribute('alt')).toBe('alpha-test');
  });

  it('falls back to the defaults for inputs bound to undefined', async () => {
    const { fixture, host, img } = render((h) => {
      h.size.set(50);
      h.appearance.set('solid');
    });
    fixture.componentInstance.size.set(undefined);
    fixture.componentInstance.appearance.set(undefined);
    await fixture.whenStable();
    expect(host.style.width).toBe('32px');
    expect(img.getAttribute('src')).toBe(renderIconDataUri(testIcon));
  });
});
