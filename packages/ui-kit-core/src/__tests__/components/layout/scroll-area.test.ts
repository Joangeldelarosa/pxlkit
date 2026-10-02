import { describe, expect, it } from 'vitest';
import {
  scrollAreaClasses,
  scrollAreaNameWarning,
  scrollAreaStyle,
  scrollAreaVariantClasses,
  surfaceClasses,
} from '../../../index';

describe('scroll area recipes', () => {
  it('pairs each scrollbar mode with its overflow', () => {
    expect(scrollAreaVariantClasses).toEqual({
      auto: 'pxl-scroll-auto overflow-auto',
      always: 'pxl-scroll-always overflow-scroll',
      scroll: 'pxl-scroll-scroll overflow-scroll',
      hover: 'pxl-scroll-hover overflow-auto',
    });
  });

  it('styles a focusable region on each surface, with the surface border on request', () => {
    const base = 'relative outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/40';
    const pixel = surfaceClasses('pixel');
    const linear = surfaceClasses('linear');
    expect(scrollAreaClasses('pixel', { variant: 'auto' })).toBe(
      `${base} pxl-scroll-auto overflow-auto ${pixel.font} pxl-scroll-pixel`,
    );
    expect(scrollAreaClasses('linear', { variant: 'hover', bordered: true })).toBe(
      `${base} pxl-scroll-hover overflow-auto ${linear.border} ${linear.radius} border-retro-border ${linear.font} pxl-scroll-linear`,
    );
  });

  it('sets only the inline declarations asked for', () => {
    expect(scrollAreaStyle({})).toEqual({});
    expect(scrollAreaStyle({ maxHeight: 160 })).toEqual({ maxHeight: '160px' });
    expect(scrollAreaStyle({ maxHeight: '50vh', scrollbarSize: 10, offsetScrollbars: true })).toEqual({
      maxHeight: '50vh',
      '--pxl-scrollbar-size': '10px',
      scrollbarGutter: 'stable',
    });
    expect(Object.keys(scrollAreaStyle({ offsetScrollbars: true, scrollbarSize: 0, maxHeight: 0 }))).toEqual([
      'maxHeight',
      '--pxl-scrollbar-size',
      'scrollbarGutter',
    ]);
  });

  it('warns about a focusable region without an accessible name', () => {
    expect(scrollAreaNameWarning({})).toBe(
      '[PixelScrollArea] missing aria-label / aria-labelledby on a focusable scroll region. ' +
        "Provide one so keyboard + screen-reader users know what they're scrolling.",
    );
    expect(scrollAreaNameWarning({ label: 'Log' })).toBeNull();
    expect(scrollAreaNameWarning({ labelledBy: 'log-title' })).toBeNull();
    expect(scrollAreaNameWarning({ tabIndex: -1 })).toBeNull();
    expect(scrollAreaNameWarning({ label: '', tabIndex: undefined })).not.toBeNull();
  });
});
