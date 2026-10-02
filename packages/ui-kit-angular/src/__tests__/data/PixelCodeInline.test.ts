/**
 * code[pxlCodeInline]: the surface of the nearest provider and unset inputs.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelCodeInline, PxlKitSurfaceProvider } from '../../public-api';

describe('PixelCodeInline', () => {
  it('takes the surface of the nearest provider unless it sets its own', async () => {
    @Component({
      imports: [PixelCodeInline, PxlKitSurfaceProvider],
      template: `
        <ng-container pxlKitSurface="linear">
          <code pxlCodeInline>inherited</code>
          <code pxlCodeInline surface="pixel">own</code>
        </ng-container>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [inherited, own] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('code'));
    expect(inherited!.className).toContain('rounded-md');
    expect(own!.className).toContain('pxl-corner-sm');
  });

  it('falls back to cyan for an unset tone', async () => {
    @Component({ imports: [PixelCodeInline], template: '<code pxlCodeInline [tone]="undefined">x</code>' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('code')!.className).toContain('text-retro-cyan');
  });
});
