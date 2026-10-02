import { describe, expect, it } from 'vitest';
import { slideInStyle } from '../../../index';

const timing = { duration: 350, delay: 0, distance: 10, repeat: 1, easing: 'ease', fillMode: 'both' } as const;

describe('slide-in recipes', () => {
  it('slides in from the edge it is given', () => {
    expect(slideInStyle({ ...timing, from: 'down' })).toEqual({
      animation: 'pxl-slide-down 350ms ease 0ms 1 both',
      '--pxl-slide-distance': '10px',
    });
    expect(slideInStyle({ ...timing, from: 'up' }).animation).toBe('pxl-slide-up 350ms ease 0ms 1 both');
    expect(slideInStyle({ ...timing, from: 'right' }).animation).toBe('pxl-slide-right 350ms ease 0ms 1 both');
    const left = slideInStyle({
      from: 'left',
      duration: 500,
      delay: 100,
      distance: 20,
      repeat: 'infinite',
      easing: 'linear',
      fillMode: 'none',
    });
    expect(left).toEqual({ animation: 'pxl-slide-left 500ms linear 100ms infinite none', '--pxl-slide-distance': '20px' });
  });
});
