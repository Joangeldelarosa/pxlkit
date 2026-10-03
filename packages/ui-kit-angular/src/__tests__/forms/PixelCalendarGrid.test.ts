/**
 * <pxl-calendar-grid> as an Angular form control, a two-way binding of the
 * day and the month, an uncontrolled grid, the renderDay template, the locale
 * and its host. Rendering and the shared interactions are covered against
 * React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelCalendarGrid, PxlKitLocaleProvider } from '../../public-api';

const cell = (label: string) => document.querySelector<HTMLButtonElement>(`[role="gridcell"][aria-label="${label}"]`)!;
const grid = () => document.querySelector('[role="grid"]')!;
const key = (element: Element, name: string, init: KeyboardEventInit = {}) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }));

async function render<T>(Host: Type<T>) {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  return { fixture, host: fixture.componentInstance, settle: () => fixture.whenStable() };
}

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('PixelCalendarGrid', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelCalendarGrid, ReactiveFormsModule],
      template: `<pxl-calendar-grid [formControl]="control" /><button type="button" data-testid="after">after</button>`,
    })
    class Host {
      readonly control = new FormControl<Date | null>(new Date(2026, 5, 3));
    }
    const { host, settle } = await render(Host);
    expect(grid().getAttribute('aria-label')).toBe('June 2026');
    expect(cell('June 3, 2026').getAttribute('aria-selected')).toBe('true');
    cell('June 18, 2026').click();
    await settle();
    expect(host.control.value).toEqual(new Date(2026, 5, 18));
    cell('June 18, 2026').focus();
    cell('June 18, 2026').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: cell('June 19, 2026') }));
    expect(host.control.touched).toBe(false);
    const after = document.querySelector<HTMLElement>('[data-testid="after"]')!;
    cell('June 18, 2026').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: after }));
    expect(host.control.touched).toBe(true);
    host.control.setValue(new Date(2026, 5, 9));
    await settle();
    expect(cell('June 9, 2026').getAttribute('aria-selected')).toBe('true');
    host.control.disable();
    await settle();
    expect(cell('June 10, 2026').disabled).toBe(true);
    expect(document.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!.disabled).toBe(true);
    cell('June 10, 2026').click();
    await settle();
    expect(host.control.value).toEqual(new Date(2026, 5, 9));
  });

  it('works with ngModel from the keyboard', async () => {
    @Component({
      imports: [PixelCalendarGrid, FormsModule],
      template: `<pxl-calendar-grid [(ngModel)]="day" />`,
    })
    class Host {
      day = new Date(2026, 0, 31);
    }
    const { host, settle } = await render(Host);
    // ngModel writes its value after the first render: the grid shows its month all the same.
    expect(grid().getAttribute('aria-label')).toBe('January 2026');
    cell('January 31, 2026').focus();
    key(cell('January 31, 2026'), 'PageDown');
    await settle();
    expect(document.activeElement).toBe(cell('February 28, 2026'));
    key(document.activeElement!, 'Enter');
    await settle();
    expect(host.day).toEqual(new Date(2026, 1, 28));
  });

  it('binds the day and the month two ways, and keeps them while uncontrolled', async () => {
    @Component({
      imports: [PixelCalendarGrid],
      template: `
        <pxl-calendar-grid data-testid="bound" [(value)]="value" [(month)]="month" />
        <pxl-calendar-grid data-testid="free" [defaultValue]="start" (valueChange)="changes.push($event)" />
      `,
    })
    class Host {
      readonly value = signal<Date | null | undefined>(null);
      readonly month = signal<Date | undefined>(new Date(2026, 9, 1));
      readonly start = new Date(2027, 2, 1);
      readonly changes: Array<Date | null | undefined> = [];
    }
    const { host, settle } = await render(Host);
    const bound = document.querySelector('[data-testid="bound"]')!;
    const free = document.querySelector('[data-testid="free"]')!;
    expect(bound.querySelector('[role="grid"]')!.getAttribute('aria-label')).toBe('October 2026');
    bound.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!.click();
    await settle();
    expect(host.month()).toEqual(new Date(2026, 10, 1));
    bound.querySelector<HTMLButtonElement>('[aria-label="November 11, 2026"]')!.click();
    await settle();
    expect(host.value()).toEqual(new Date(2026, 10, 11));
    host.month.set(new Date(2025, 0, 20));
    await settle();
    expect(bound.querySelector('[role="grid"]')!.getAttribute('aria-label')).toBe('January 2025');
    expect(free.querySelector('[role="grid"]')!.getAttribute('aria-label')).toBe('March 2027');
    free.querySelector<HTMLButtonElement>('[aria-label="March 2, 2027"]')!.click();
    await settle();
    expect(host.changes).toEqual([new Date(2027, 2, 2)]);
    expect(free.querySelector('[aria-label="March 2, 2027"]')!.getAttribute('aria-selected')).toBe('true');
  });

  it('draws days from a renderDay template, marks today and keeps its host attributes', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 5, 15, 12));
    @Component({
      imports: [PixelCalendarGrid],
      template: `
        <ng-template #day let-date><b>{{ date.getMonth() + 1 }}/{{ date.getDate() }}</b></ng-template>
        <pxl-calendar-grid data-testid="grid" class="mine" [renderDay]="day" />
      `,
    })
    class Host {}
    await render(Host);
    const root = document.querySelector<HTMLElement>('[data-testid="grid"]')!;
    expect(root.classList).toContain('mine');
    expect(root.classList).toContain('inline-block');
    expect(cell('June 15, 2026').querySelector('b')!.textContent).toBe('6/15');
    expect(cell('June 15, 2026').getAttribute('aria-current')).toBe('date');
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  it('takes its week and names from the locale provider', async () => {
    @Component({
      imports: [PixelCalendarGrid, PxlKitLocaleProvider],
      template: `<pxl-locale-provider locale="tr"><pxl-calendar-grid [defaultValue]="day" /></pxl-locale-provider>`,
    })
    class Host {
      readonly day = new Date(2026, 5, 20);
    }
    await render(Host);
    expect(grid().getAttribute('aria-label')).toBe('Haziran 2026');
    expect(Array.from(document.querySelectorAll('[role="columnheader"]')).map((header) => header.textContent)).toEqual([
      'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz',
    ]);
    expect(document.querySelector('[role="gridcell"]')!.getAttribute('aria-label')).toBe('1 Haziran 2026');
  });
});
