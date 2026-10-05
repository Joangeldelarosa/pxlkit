/**
 * kbd[pxlKbd]: the surface of the nearest provider.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelKbd, PxlKitSurfaceProvider } from '../../public-api';

describe('PixelKbd', () => {
  it('takes the surface of the nearest provider', async () => {
    @Component({
      imports: [PixelKbd, PxlKitSurfaceProvider],
      template: '<ng-container pxlKitSurface="linear"><kbd pxlKbd>K</kbd></ng-container>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('kbd')!.className).toContain(
      'shadow-[0_1px_0_0_rgba(0,0,0,0.15)]',
    );
  });
});

describe('PixelKbd — keycap depth', () => {
  it('gives the pixel keycap a deeper bottom edge, where a shadow would be clipped, and the linear one a drop shadow', async () => {
    @Component({ imports: [PixelKbd], template: '<kbd pxlKbd data-testid="pixel">K</kbd><kbd pxlKbd data-testid="linear" surface="linear">K</kbd>' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const classes = (id: string) => Array.from((fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${id}"]`)!.classList);
    expect(classes('pixel')).toEqual(expect.arrayContaining(['border-b-4', 'border-b-retro-border-strong']));
    expect(classes('pixel').filter((name) => name.startsWith('shadow-'))).toEqual([]);
    expect(classes('linear')).toContain('shadow-[0_1px_0_0_rgba(0,0,0,0.15)]');
    expect(classes('linear')).not.toContain('border-b-4');
  });
});
