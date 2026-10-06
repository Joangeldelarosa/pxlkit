import { describe, expect, it } from 'vitest';
import { flickerStyle } from '../../../index';

describe('flicker recipes', () => {
  it('flickers in steps', () => {
    expect(flickerStyle({ duration: 2200, repeat: 'infinite' })).toEqual({
      animation: 'pxl-flicker 2200ms steps(1) 0ms infinite both',
    });
    expect(flickerStyle({ duration: 900, repeat: 1 })).toEqual({ animation: 'pxl-flicker 900ms steps(1) 0ms 1 both' });
  });
});
