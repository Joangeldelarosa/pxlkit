import { describe, expect, it } from 'vitest';
import { floatStyle } from '../../../index';

describe('float recipes', () => {
  it('floats over the distance it is given', () => {
    expect(floatStyle({ duration: 2200, distance: 6, repeat: 'infinite', easing: 'ease-in-out' })).toEqual({
      animation: 'pxl-float 2200ms ease-in-out 0ms infinite both',
      '--pxl-float-distance': '6px',
    });
    expect(floatStyle({ duration: 2800, distance: 14, repeat: 3, easing: 'linear' })).toEqual({
      animation: 'pxl-float 2800ms linear 0ms 3 both',
      '--pxl-float-distance': '14px',
    });
  });
});
