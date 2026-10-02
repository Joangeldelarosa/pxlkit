import { describe, expect, it } from 'vitest';
import { rotateStyle } from '../../../index';

describe('rotate recipes', () => {
  it('turns in the direction it is given, set after the shorthand', () => {
    const style = rotateStyle({ duration: 2400, repeat: 'infinite', direction: 'reverse', easing: 'linear' });
    expect(style).toEqual({ animation: 'pxl-rotate 2400ms linear 0ms infinite both', animationDirection: 'reverse' });
    expect(Object.keys(style)).toEqual(['animation', 'animationDirection']);
    expect(rotateStyle({ duration: 900, repeat: 1, direction: 'normal', easing: 'ease' })).toEqual({
      animation: 'pxl-rotate 900ms ease 0ms 1 both',
      animationDirection: 'normal',
    });
  });
});
