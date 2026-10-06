/**
 * PixelScrollArea beyond the parity examples: its focusable region defaults
 * and their overrides, the inline style it derives from its inputs, and the
 * development warning for an unnamed region.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelScrollArea, PxlKitSurfaceProvider } from '../../public-api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PixelScrollArea', () => {
  it('is a focusable region whose role and tabindex the element can replace', async () => {
    @Component({
      imports: [PixelScrollArea],
      template: `
        <pxl-scroll-area id="region" aria-label="Log"></pxl-scroll-area>
        <pxl-scroll-area id="log" aria-label="Log" role="log" tabindex="-1"></pxl-scroll-area>
        <pxl-scroll-area id="bound" aria-label="Log" [attr.tabindex]="tabIndex()"></pxl-scroll-area>
      `,
    })
    class Host {
      readonly tabIndex = signal(-1);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const attributes = (id: string) => {
      const element = fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
      return [element.getAttribute('role'), element.getAttribute('tabindex')];
    };
    expect(attributes('region')).toEqual(['region', '0']);
    expect(attributes('log')).toEqual(['log', '-1']);
    expect(attributes('bound')).toEqual(['region', '-1']);
  });

  it('derives its inline style and scrollbar marker from its inputs, next to the element style', async () => {
    @Component({
      imports: [PixelScrollArea],
      template: `
        <pxl-scroll-area
          aria-label="Log"
          style="width: 20rem"
          scrollbarSize="6"
          type="scroll"
          [maxHeight]="maxHeight()"
          [offsetScrollbars]="offset()"
          [variant]="variant()"
        ></pxl-scroll-area>
      `,
    })
    class Host {
      readonly maxHeight = signal<string | number>('50vh');
      readonly offset = signal(true);
      readonly variant = signal<'hover' | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const region = fixture.nativeElement.querySelector('pxl-scroll-area') as HTMLElement;
    const { style } = region;
    expect([style.maxHeight, style.getPropertyValue('--pxl-scrollbar-size'), style.scrollbarGutter, style.width]).toEqual([
      '50vh',
      '6px',
      'stable',
      '20rem',
    ]);
    expect(region.getAttribute('data-scrollbar')).toBe('scroll');
    fixture.componentInstance.maxHeight.set(200);
    fixture.componentInstance.offset.set(false);
    fixture.componentInstance.variant.set('hover');
    await fixture.whenStable();
    expect(style.maxHeight).toBe('200px');
    expect(style.scrollbarGutter).toBe('');
    expect(region.getAttribute('data-scrollbar')).toBe('hover');
  });

  it('marks the surface of the nearest provider', async () => {
    @Component({
      imports: [PixelScrollArea, PxlKitSurfaceProvider],
      template: '<ng-container pxlKitSurface="linear"><pxl-scroll-area aria-label="Log" bordered></pxl-scroll-area></ng-container>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const region = fixture.nativeElement.querySelector('pxl-scroll-area') as HTMLElement;
    expect(region.getAttribute('data-surface')).toBe('linear');
    expect(Array.from(region.classList)).toEqual(expect.arrayContaining(['pxl-scroll-linear', 'border', 'rounded-md']));
  });

  it('warns in development about a focusable region without an accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    @Component({
      imports: [PixelScrollArea],
      template: `
        <pxl-scroll-area></pxl-scroll-area>
        <pxl-scroll-area [attr.aria-labelledby]="'log-title'"></pxl-scroll-area>
        <pxl-scroll-area tabindex="-1"></pxl-scroll-area>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain('[PixelScrollArea] missing aria-label / aria-labelledby');
  });
});
