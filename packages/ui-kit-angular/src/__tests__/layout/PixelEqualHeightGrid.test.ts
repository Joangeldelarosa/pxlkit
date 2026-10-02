/**
 * PixelEqualHeightGrid beyond the parity examples: items rendered later or
 * styled by bindings of their own, and the grid inputs it shares with
 * `pxlGrid`.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelEqualHeightGrid, type EqualHeightGridRowAlign } from '../../public-api';

const ITEM = ['grid', 'grid-rows-[auto_1fr_auto]'];

describe('PixelEqualHeightGrid', () => {
  it('lays out items rendered later, next to their own class bindings', async () => {
    @Component({
      imports: [PixelEqualHeightGrid],
      template: `
        <div pxlEqualHeightGrid>
          @for (plan of plans(); track plan) {
            <article [class.featured]="plan === featured()">{{ plan }}</article>
          }
        </div>
      `,
    })
    class Host {
      readonly plans = signal(['Free']);
      readonly featured = signal('Free');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    fixture.componentInstance.plans.set(['Free', 'Pro']);
    fixture.componentInstance.featured.set('Pro');
    await fixture.whenStable();
    const items = Array.from(fixture.nativeElement.querySelectorAll('article')) as HTMLElement[];
    expect(items).toHaveLength(2);
    for (const item of items) expect(Array.from(item.classList)).toEqual(expect.arrayContaining(ITEM));
    expect(items[0]!.classList.contains('featured')).toBe(false);
    expect(items[1]!.classList.contains('featured')).toBe(true);
  });

  it('takes the grid inputs and stretches rows unless aligned to the top', async () => {
    @Component({
      imports: [PixelEqualHeightGrid],
      template: '<ul pxlEqualHeightGrid cols="4" gap="6" autoFill [rowAlign]="rowAlign()" class="own"></ul>',
    })
    class Host {
      readonly rowAlign = signal<EqualHeightGridRowAlign | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const list = fixture.nativeElement.querySelector('ul') as HTMLElement;
    expect(Array.from(list.classList)).toEqual(expect.arrayContaining(['own', 'grid', 'gap-6', 'items-stretch']));
    expect(list.classList.contains('grid-cols-4')).toBe(false);
    expect(list.style.gridTemplateColumns).toBe('repeat(auto-fill, minmax(min(16rem, 100%), 1fr))');
    expect(list.classList.contains('items-start')).toBe(false);
    fixture.componentInstance.rowAlign.set('top');
    await fixture.whenStable();
    expect(list.classList.contains('items-start')).toBe(true);
  });
});
