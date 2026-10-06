import { describe, expect, it } from 'vitest';
import { bounceStyle } from '../../../index';

describe('bounce recipes', () => {
  it('bounces to the height it is given', () => {
    expect(bounceStyle({ duration: 800, repeat: 'infinite', height: 8, easing: 'ease' })).toEqual({
      animation: 'pxl-bounce 800ms ease 0ms infinite both',
      '--pxl-bounce-height': '8px',
    });
    expect(bounceStyle({ duration: 1000, repeat: 2, height: 16, easing: 'linear' })).toEqual({
      animation: 'pxl-bounce 1000ms linear 0ms 2 both',
      '--pxl-bounce-height': '16px',
    });
  });
});
