import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { glitchClasses, glitchCopiesStyle, glitchMainClasses, glitchStyles } from '../../../index';

const theme = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../../../styles.css'), 'utf8');

/** The declarations of the rule for `selector` in the stylesheet's `@supports` block for the copies. */
function copiesRule(selector: string): string | undefined {
  const start = theme.indexOf('@supports (content: "" / "") {');
  const block = theme.slice(theme.indexOf('{', start) + 1);
  for (const [, selectors, declarations] of block.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (selectors!.trim().replace(/\s+/g, ' ') === selector) return declarations!.trim().replace(/\s+/g, ' ');
  }
  return undefined;
}

describe('glitch recipes', () => {
  it('lays the ghost layers over the content in a positioned wrapper', () => {
    expect(glitchClasses).toEqual({
      root: 'relative inline-block overflow-visible',
      ghost: 'pointer-events-none absolute inset-0',
      copies: 'pxl-glitch-copies',
    });
  });

  it("gives a label's drawn copies the shift and the loop length the ghost layers get", () => {
    expect(glitchCopiesStyle({ duration: 3000, intensity: 4 })).toEqual({ '--pxl-glitch-x': '4px', '--pxl-glitch-duration': '3000ms' });
    expect(glitchCopiesStyle({ duration: 2000, intensity: 8 })).toEqual({ '--pxl-glitch-x': '8px', '--pxl-glitch-duration': '2000ms' });
  });

  it("draws a label's copies in the stylesheet as the ghost layers look, under the text and without alternative text", () => {
    const { red, cyan } = glitchStyles({ duration: 3000, intensity: 4 });
    expect(copiesRule('.pxl-glitch-copies')).toBe('isolation: isolate;');
    expect(copiesRule('.pxl-glitch-copies::before, .pxl-glitch-copies::after')).toBe(
      'content: attr(data-text) / ""; position: absolute; inset: 0; z-index: -1; overflow: hidden; pointer-events: none;',
    );
    expect(copiesRule('.pxl-glitch-copies::before')).toBe(
      `filter: ${red.filter}; animation: pxl-glitch-r var(--pxl-glitch-duration, 3000ms) steps(1) infinite;`,
    );
    expect(copiesRule('.pxl-glitch-copies::after')).toBe(
      `filter: ${cyan.filter}; animation: pxl-glitch-c var(--pxl-glitch-duration, 3000ms) steps(1) infinite;`,
    );
  });

  it("keeps the content's layer a block when the glitch is a span, so the keyframes move it", () => {
    expect(glitchMainClasses('div')).toBeUndefined();
    expect(glitchMainClasses('span')).toBe('block');
  });

  it('splits the colours of the ghost layers and shifts every layer by the intensity', () => {
    expect(glitchStyles({ duration: 3000, intensity: 4 })).toEqual({
      red: {
        animation: 'pxl-glitch-r 3000ms steps(1) infinite',
        '--pxl-glitch-x': '4px',
        filter: 'saturate(0) sepia(1) hue-rotate(-20deg) brightness(1.3)',
        overflow: 'hidden',
      },
      cyan: {
        animation: 'pxl-glitch-c 3000ms steps(1) infinite',
        '--pxl-glitch-x': '4px',
        filter: 'saturate(0) sepia(1) hue-rotate(150deg) brightness(1.1)',
        overflow: 'hidden',
      },
      main: { animation: 'pxl-glitch 3000ms steps(1) infinite', '--pxl-glitch-x': '4px' },
    });
    expect(glitchStyles({ duration: 2000, intensity: 8 }).main).toEqual({
      animation: 'pxl-glitch 2000ms steps(1) infinite',
      '--pxl-glitch-x': '8px',
    });
  });
});
