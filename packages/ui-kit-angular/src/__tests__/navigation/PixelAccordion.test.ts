/**
 * <pxl-accordion> beyond the parity examples: a content template receives
 * its item, boolean attributes, the wiring between headers and panels, and
 * the first-render state that later inputs do not reset.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelAccordion, type AccordionItem } from '../../public-api';

describe('PixelAccordion', () => {
  it('gives a content template its item', async () => {
    @Component({
      imports: [PixelAccordion],
      template: `
        <pxl-accordion [items]="[{ id: 'faq', title: 'FAQ', content: body }]" />
        <ng-template #body let-item><em>{{ item.title }} answers</em></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('em')!.textContent).toBe('FAQ answers');
  });

  it('wires each header to its panel, which takes no name', async () => {
    @Component({
      imports: [PixelAccordion],
      template: `<pxl-accordion [items]="[{ id: 'one', title: 'One', content: 'First' }]" />`,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const header = root.querySelector('button')!;
    const panel = root.querySelector(`#${header.getAttribute('aria-controls')}`)!;
    expect(panel.textContent!.trim()).toBe('First');
    expect(panel.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('reads the items open on first render once, and follows allowMultiple as it changes', async () => {
    @Component({
      imports: [PixelAccordion],
      template: `<pxl-accordion [items]="items" [collapsedByDefault]="collapsed()" [allowMultiple]="multiple()" />`,
    })
    class Host {
      readonly items: AccordionItem[] = [
        { id: 'one', title: 'One', content: 'First' },
        { id: 'two', title: 'Two', content: 'Second' },
      ];
      readonly collapsed = signal(true);
      readonly multiple = signal<boolean | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    fixture.componentInstance.collapsed.set(false);
    await fixture.whenStable();
    expect(root.querySelectorAll('[aria-expanded="true"]')).toHaveLength(0);
    const [one, two] = Array.from(root.querySelectorAll('button'));
    one!.click();
    two!.click();
    await fixture.whenStable();
    expect(root.querySelectorAll('[aria-expanded="true"]')).toHaveLength(1);
    fixture.componentInstance.multiple.set(true);
    await fixture.whenStable();
    one!.click();
    await fixture.whenStable();
    expect(root.querySelectorAll('[aria-expanded="true"]')).toHaveLength(2);
  });
});
