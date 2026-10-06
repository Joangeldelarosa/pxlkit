import { describe, expect, it } from 'vitest';
import { fadeInStyle } from '../../../index';

describe('fade-in recipes', () => {
  it('fades in with the timing, delay and fill mode it is given', () => {
    expect(fadeInStyle({ duration: 400, delay: 0, repeat: 1, easing: 'ease', fillMode: 'both' })).toEqual({
      animation: 'pxl-fade-in 400ms ease 0ms 1 both',
    });
    expect(
      fadeInStyle({ duration: 600, delay: 200, repeat: 'infinite', easing: 'ease-out', fillMode: 'forwards' }),
    ).toEqual({ animation: 'pxl-fade-in 600ms ease-out 200ms infinite forwards' });
  });
});
