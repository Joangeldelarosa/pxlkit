import { describe, expect, it } from 'vitest';
import { zoomInStyle } from '../../../index';

describe('zoom-in recipes', () => {
  it('zooms in from the scale it is given', () => {
    const defaults = { duration: 320, delay: 0, startScale: 0.92, repeat: 1, easing: 'cubic-bezier(.2,.9,.2,1)' } as const;
    expect(zoomInStyle({ ...defaults, fillMode: 'both' })).toEqual({
      animation: 'pxl-zoom-in 320ms cubic-bezier(.2,.9,.2,1) 0ms 1 both',
      '--pxl-zoom-start': '0.92',
    });
    expect(
      zoomInStyle({ duration: 500, delay: 50, startScale: 0.6, repeat: 'infinite', easing: 'ease', fillMode: 'backwards' }),
    ).toEqual({ animation: 'pxl-zoom-in 500ms ease 50ms infinite backwards', '--pxl-zoom-start': '0.6' });
  });
});
