import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  autosizeTextarea,
  focusRing,
  inputBase,
  surfaceClasses,
  textareaClasses,
  toneMap,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];

function textarea(contentHeight: number, style: { lineHeight: string; padding: string }): HTMLTextAreaElement {
  const element = document.createElement('textarea');
  Object.defineProperty(element, 'scrollHeight', { configurable: true, get: () => contentHeight });
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    lineHeight: style.lineHeight,
    paddingTop: style.padding,
    paddingBottom: style.padding,
  } as CSSStyleDeclaration);
  return element;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('textarea recipes', () => {
  it('composes the textarea from the base, surface and tone', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      expect(textareaClasses(surface, { tone: 'green', invalid: false, autosize: false })).toBe(
        `${inputBase} ${s.font} ${s.border} ${s.radius} ${s.transition} ${focusRing} ${toneMap.green.ring} min-h-24 px-3 py-2 text-sm border-retro-border-strong`,
      );
    }
  });

  it('drops the minimum height and the resize handle while auto-growing, and marks errors', () => {
    const classes = textareaClasses('pixel', { tone: 'neutral', invalid: true, autosize: true }).split(' ');
    expect(classes).toEqual(expect.arrayContaining(['resize-none', 'border-retro-red/60']));
    expect(classes).not.toContain('min-h-24');
  });
});

describe('autosizeTextarea', () => {
  it('fits the content between the minimum rows and no cap', () => {
    const element = textarea(100, { lineHeight: '20px', padding: '8px' });
    autosizeTextarea(element, 2, undefined);
    expect(element.style.height).toBe('100px');
    expect(element.style.overflowY).toBe('hidden');
  });

  it('never goes below the minimum rows', () => {
    const element = textarea(10, { lineHeight: '20px', padding: '8px' });
    autosizeTextarea(element, 2, undefined);
    // 2 rows of 20px plus 8px of padding on each side.
    expect(element.style.height).toBe('56px');
  });

  it('stops at the maximum rows and scrolls past them', () => {
    const element = textarea(200, { lineHeight: '20px', padding: '8px' });
    autosizeTextarea(element, 2, 3);
    expect(element.style.height).toBe('76px');
    expect(element.style.overflowY).toBe('auto');
  });

  it('assumes 20px lines when the line height cannot be read', () => {
    const element = textarea(0, { lineHeight: 'normal', padding: '0px' });
    autosizeTextarea(element, 3, 5);
    expect(element.style.height).toBe('60px');
    expect(element.style.overflowY).toBe('hidden');
  });
});
