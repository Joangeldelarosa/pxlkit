/**
 * PixelCenter beyond the parity examples: any host element, the deprecated
 * `text` alias, unset inputs, surface inheritance and the cleared legacy
 * `align` attribute.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelCenter, PxlKitSurfaceProvider, type CenterAlign } from '../../public-api';

describe('PixelCenter', () => {
  it('styles its own element, keeps the element classes and drops the legacy align attribute', async () => {
    @Component({
      imports: [PixelCenter],
      template: '<main pxlCenter class="own" align="right" maxWidth="prose">Body</main>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(Array.from(main.classList)).toEqual(
      expect.arrayContaining(['own', 'block', 'mx-auto', 'max-w-prose', 'text-right']),
    );
    expect(main.hasAttribute('align')).toBe(false);
  });

  it('prefers align over the deprecated text alias and falls back to its defaults', async () => {
    @Component({
      imports: [PixelCenter],
      template: '<div pxlCenter [align]="align()" text="center" [maxWidth]="undefined" [gutter]="undefined"></div>',
    })
    class Host {
      readonly align = signal<CenterAlign | undefined>('left');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const div = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(div.classList.contains('text-left')).toBe(true);
    expect(div.classList.contains('max-w-[1600px]')).toBe(true);
    expect(div.classList.contains('lg:px-8')).toBe(true);
    fixture.componentInstance.align.set(undefined);
    await fixture.whenStable();
    expect(div.classList.contains('text-left')).toBe(false);
    expect(div.classList.contains('text-center')).toBe(true);
  });

  it('takes its surface from the nearest provider', async () => {
    @Component({
      imports: [PixelCenter, PxlKitSurfaceProvider],
      template: '<ng-container pxlKitSurface="linear"><div pxlCenter bordered inline></div></ng-container>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const div = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(Array.from(div.classList)).toEqual(expect.arrayContaining(['inline-block', 'border', 'rounded-md']));
    expect(div.classList.contains('border-2')).toBe(false);
  });
});
