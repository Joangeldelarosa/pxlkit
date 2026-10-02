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
