/**
 * PixelTwoColumn beyond the parity examples: text or template content, any
 * host element, swapping the columns and the cleared legacy `align`
 * attribute.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelTwoColumn } from '../../public-api';

describe('PixelTwoColumn', () => {
  it('fills the columns with text or a template on its own element', async () => {
    @Component({
      imports: [PixelTwoColumn],
      template: `
        <section pxlTwoColumn ratio="30/70" stackBelow="sm" align="end" gap="2" left="Menu" [right]="body" class="own"></section>
        <ng-template #body><article>Body</article></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(Array.from(section.classList)).toEqual(
      expect.arrayContaining(['own', 'grid', 'grid-cols-1', 'sm:grid-cols-[3fr_7fr]', 'gap-2', 'items-end']),
    );
    expect(section.hasAttribute('align')).toBe(false);
    const [left, right] = Array.from(section.children) as HTMLElement[];
    expect(left!.textContent).toBe('Menu');
    expect(right!.querySelector('article')?.textContent).toBe('Body');
  });

  it('swaps the columns on screen, keeping their order in the document', async () => {
    @Component({
      imports: [PixelTwoColumn],
      template: '<div pxlTwoColumn left="L" right="R" [reverse]="reverse()" [ratio]="undefined"></div>',
    })
    class Host {
      readonly reverse = signal(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const grid = fixture.nativeElement.querySelector('div') as HTMLElement;
    const columns = () => Array.from(grid.children) as HTMLElement[];
    expect(grid.classList.contains('md:grid-cols-[1fr_1fr]')).toBe(true);
    expect(columns().map((column) => column.className)).toEqual(['', '']);
    fixture.componentInstance.reverse.set(true);
    await fixture.whenStable();
    expect(columns().map((column) => [column.textContent, column.className])).toEqual([
      ['L', 'order-2'],
      ['R', 'order-1'],
    ]);
  });
});
