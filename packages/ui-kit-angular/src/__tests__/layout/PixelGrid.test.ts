/**
 * PixelGrid beyond the parity examples: any host element, numeric attribute
 * coercion, the auto-fit template next to the element's own styles, and the
 * cleared legacy `align` attribute.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelGrid } from '../../public-api';

describe('PixelGrid', () => {
  it('reads numeric attributes, styles its own element and drops the legacy align attribute', async () => {
    @Component({
      imports: [PixelGrid],
      template: '<ul pxlGrid cols="3" rows="2" colGap="0" rowGap="6" align="center" justify="end" class="own"></ul>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const list = fixture.nativeElement.querySelector('ul') as HTMLElement;
    expect(Array.from(list.classList)).toEqual(
      expect.arrayContaining(['own', 'grid', 'grid-cols-3', 'grid-rows-2', 'gap-x-0', 'gap-y-6', 'items-center', 'justify-items-end']),
    );
    expect(list.classList.contains('gap-4')).toBe(false);
    expect(list.hasAttribute('align')).toBe(false);
  });

  it('swaps the column classes for an auto-fit template and keeps the element styles', async () => {
    @Component({
      imports: [PixelGrid],
      template: '<div pxlGrid [cols]="2" [autoFit]="fit()" [minColWidth]="undefined" style="grid-auto-rows: 8rem"></div>',
    })
    class Host {
      readonly fit = signal(true);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const div = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(div.style.gridTemplateColumns).toBe('repeat(auto-fit, minmax(min(16rem, 100%), 1fr))');
    expect(div.style.gridAutoRows).toBe('8rem');
    expect(div.classList.contains('grid-cols-2')).toBe(false);
    fixture.componentInstance.fit.set(false);
    await fixture.whenStable();
    expect(div.style.gridTemplateColumns).toBe('');
    expect(div.style.gridAutoRows).toBe('8rem');
    expect(div.classList.contains('grid-cols-2')).toBe(true);
  });
});
