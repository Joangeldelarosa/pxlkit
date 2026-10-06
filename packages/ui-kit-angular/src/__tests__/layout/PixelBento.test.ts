/**
 * PixelBento beyond the parity examples: numeric attributes, unset inputs,
 * its column marker and the row height an element style can override.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelBento } from '../../public-api';

describe('PixelBento', () => {
  it('reads numeric attributes and marks its column count', async () => {
    @Component({ imports: [PixelBento], template: '<pxl-bento columns="6" gap="2" class="own"></pxl-bento>' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const bento = fixture.nativeElement.querySelector('pxl-bento') as HTMLElement;
    expect(bento.getAttribute('data-columns')).toBe('6');
    expect(Array.from(bento.classList)).toEqual(expect.arrayContaining(['own', 'grid', 'lg:grid-cols-6', 'gap-2']));
    expect(bento.style.gridAutoRows).toBe('minmax(160px, 1fr)');
  });

  it('falls back to its defaults and keeps an own row height', async () => {
    @Component({
      imports: [PixelBento],
      template: '<pxl-bento [columns]="undefined" [gap]="undefined" style="grid-auto-rows: 120px"></pxl-bento>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const bento = fixture.nativeElement.querySelector('pxl-bento') as HTMLElement;
    expect(bento.getAttribute('data-columns')).toBe('3');
    expect(Array.from(bento.classList)).toEqual(expect.arrayContaining(['lg:grid-cols-3', 'gap-4']));
    expect(bento.style.gridAutoRows).toBe('120px');
  });
});
