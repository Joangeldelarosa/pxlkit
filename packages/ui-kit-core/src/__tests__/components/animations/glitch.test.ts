import { describe, expect, it } from 'vitest';
import { glitchClasses, glitchStyles } from '../../../index';

describe('glitch recipes', () => {
  it('lays the ghost layers over the content in a positioned wrapper', () => {
    expect(glitchClasses).toEqual({
      root: 'relative inline-block overflow-visible',
      ghost: 'pointer-events-none absolute inset-0',
    });
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
