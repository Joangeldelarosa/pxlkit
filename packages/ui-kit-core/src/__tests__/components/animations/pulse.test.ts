import { describe, expect, it } from 'vitest';
import { pulseStyle } from '../../../index';

describe('pulse recipes', () => {
  it('pulses with the timing it is given', () => {
    expect(pulseStyle({ duration: 2000, repeat: 'infinite', easing: 'ease-in-out' })).toEqual({
      animation: 'pxl-pulse 2000ms ease-in-out 0ms infinite both',
    });
    expect(pulseStyle({ duration: 1000, repeat: 1, easing: 'ease' })).toEqual({
      animation: 'pxl-pulse 1000ms ease 0ms 1 both',
    });
  });
});
