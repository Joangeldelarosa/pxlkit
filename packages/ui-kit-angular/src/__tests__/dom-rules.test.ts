/**
 * The Angular DOM rules the parity suite reads renderings with, where a rule
 * is more than a host tag: `@pxlkit/angular`'s `<pxl-icon>` box, read as the
 * bare `<img>` React's PxlKitIcon renders.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { substitute } from './dom-rules';

function icon(boxStyle: string, attributes = ''): HTMLElement {
  document.body.innerHTML = `<pxl-icon ${attributes} style="${boxStyle}"><img src="data:," alt="Trophy" width="16" height="16" draggable="false" style="display: block; width: 100%; height: 100%; image-rendering: pixelated;"></pxl-icon>`;
  return document.querySelector('pxl-icon')!;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('substitute', () => {
  const box = 'display: inline-block; vertical-align: middle; flex-shrink: 0; width: 16px; height: 16px;';

  it('reads a <pxl-icon> box as the image React renders: its attributes, the box layout, image-rendering', () => {
    const image = substitute(icon(box, 'class="ml-1" aria-hidden="true" size="16"')) as HTMLElement;
    expect(image.tagName).toBe('IMG');
    expect(['src', 'alt', 'width', 'height', 'draggable', 'class', 'aria-hidden'].map((name) => image.getAttribute(name))).toEqual(
      ['data:,', 'Trophy', '16', '16', 'false', 'ml-1', 'true'],
    );
    // An input's static attribute is no attribute of React's image.
    expect(image.hasAttribute('size')).toBe(false);
    expect(image.getAttribute('style')).toBe(
      'display: inline-block; vertical-align: middle; flex-shrink: 0; image-rendering: pixelated;',
    );
  });

  it("keeps a box size the image's width and height do not give, so a difference shows", () => {
    const image = substitute(
      icon('display: inline-block; vertical-align: middle; flex-shrink: 0; width: 20px; height: 16px;'),
    ) as HTMLElement;
    expect(image.style.width).toBe('20px');
    expect(image.style.height).toBe('');
  });

  it('leaves every other element, and a box without its one image, as rendered', () => {
    document.body.innerHTML = '<span><img alt=""></span><pxl-icon><img alt=""><img alt=""></pxl-icon><pxl-icon><b></b></pxl-icon>';
    for (const element of Array.from(document.body.querySelectorAll('span, pxl-icon'))) {
      expect(substitute(element)).toBeUndefined();
    }
  });
});
