import { describe, expect, it } from 'vitest';
import { shakeStyle } from '../../../index';

describe('shake recipes', () => {
  it('shakes over the distance it is given', () => {
    expect(shakeStyle({ duration: 450, distance: 2, repeat: 1, easing: 'linear' })).toEqual({
      animation: 'pxl-shake 450ms linear 0ms 1 both',
      '--pxl-shake-distance': '2px',
    });
    expect(shakeStyle({ duration: 300, distance: 6, repeat: 'infinite', easing: 'ease' })).toEqual({
      animation: 'pxl-shake 300ms ease 0ms infinite both',
      '--pxl-shake-distance': '6px',
    });
  });
});
