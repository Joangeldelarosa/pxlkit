/**
 * PixelContainer beyond the parity examples: any host element, the inner
 * column it derives from `padding`, unset inputs and surface inheritance.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelContainer, PxlKitSurfaceProvider, type ContainerPadding } from '../../public-api';

describe('PixelContainer', () => {
  it('puts the band on its element and the content in a centred column', async () => {
    @Component({
      imports: [PixelContainer],
      template: '<footer pxlContainer class="own"><p id="body">Body</p></footer>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const footer = fixture.nativeElement.querySelector('footer') as HTMLElement;
    expect(Array.from(footer.classList)).toEqual(expect.arrayContaining(['own', 'w-full', 'py-16']));
    const column = footer.firstElementChild as HTMLElement;
    expect(Array.from(column.classList)).toEqual(expect.arrayContaining(['mx-auto', 'max-w-5xl', 'lg:px-8']));
    expect(column.querySelector('#body')?.textContent).toBe('Body');
  });

  it('splits padding into the column gutter and the band rhythm, following changes', async () => {
    @Component({
      imports: [PixelContainer],
      template: '<div pxlContainer [padding]="padding()" [maxWidth]="undefined"></div>',
    })
    class Host {
      readonly padding = signal<ContainerPadding | undefined>({ x: 'sm', y: 'none' });
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const band = fixture.nativeElement.querySelector('div') as HTMLElement;
    const column = band.firstElementChild as HTMLElement;
    expect(band.classList.contains('py-0')).toBe(true);
    expect(column.classList.contains('px-3')).toBe(true);
    expect(column.classList.contains('max-w-5xl')).toBe(true);
    fixture.componentInstance.padding.set('xl');
    await fixture.whenStable();
    expect(band.classList.contains('py-20')).toBe(true);
    expect(column.classList.contains('lg:px-8')).toBe(true);
    fixture.componentInstance.padding.set(undefined);
    await fixture.whenStable();
    expect(band.classList.contains('py-16')).toBe(true);
  });

  it('hands its surface down to the column', async () => {
    @Component({
      imports: [PixelContainer, PxlKitSurfaceProvider],
      template: '<ng-container pxlKitSurface="linear"><section pxlContainer></section></ng-container>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const band = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(band.classList.contains('duration-200')).toBe(true);
    expect(band.firstElementChild!.classList.contains('duration-200')).toBe(true);
  });
});
