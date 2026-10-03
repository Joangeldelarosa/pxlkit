/**
 * <pxl-date-picker> as an Angular form control, a two-way binding and an
 * uncontrolled picker; presets, Clear, the trigger's text, focus moving into
 * the dialog and native attributes. Rendering and the shared interactions are
 * covered against React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelDatePicker } from '../../public-api';

const trigger = () => document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
const cell = (label: string) => document.querySelector<HTMLButtonElement>(`[role="gridcell"][aria-label="${label}"]`)!;
const button = (text: string) =>
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find((element) => element.textContent?.trim() === text)!;
const key = (name: string) =>
  document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

async function render<T>(Host: Type<T>) {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((done) => setTimeout(done, 0));
    await fixture.whenStable();
  };
  await settle();
  return { fixture, host: fixture.componentInstance, settle };
}

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('PixelDatePicker', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelDatePicker, ReactiveFormsModule],
      template: `<pxl-date-picker label="Due" [formControl]="control" />`,
    })
    class Host {
      readonly control = new FormControl<Date | null>(new Date(2026, 5, 15));
    }
    const { host, settle } = await render(Host);
    expect(trigger().textContent).toContain('June 15, 2026');
    trigger().focus();
    trigger().click();
    await settle();
    // Focus moves into the grid: the trigger is left, and the control touched.
    expect(document.activeElement).toBe(cell('June 15, 2026'));
    expect(host.control.touched).toBe(true);
    cell('June 22, 2026').click();
    await settle();
    expect(host.control.value).toEqual(new Date(2026, 5, 22));
    expect(document.querySelector('[role="grid"]')).toBeNull();
    host.control.setValue(new Date(2027, 0, 9));
    await settle();
    expect(trigger().textContent).toContain('January 9, 2027');
    host.control.disable();
    await settle();
    expect(trigger().disabled).toBe(true);
  });

  it('stays shut while its form control is disabled, whatever clicks the trigger', async () => {
    @Component({
      imports: [PixelDatePicker, ReactiveFormsModule],
      template: `<pxl-date-picker label="Due" [formControl]="control" />`,
    })
    class Host {
      readonly control = new FormControl<Date | null>({ value: null, disabled: true });
    }
    const { settle } = await render(Host);
    expect(trigger().disabled).toBe(true);
    // A click a script dispatches still reaches the listeners of a disabled button.
    trigger().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
    expect(document.querySelector('[role="grid"]')).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('works with ngModel from the keyboard, and closes on Escape with focus back on the trigger', async () => {
    @Component({
      imports: [PixelDatePicker, FormsModule],
      template: `<pxl-date-picker [(ngModel)]="due" />`,
    })
    class Host {
      due: Date | null = new Date(2026, 0, 31);
    }
    const { host, settle } = await render(Host);
    trigger().click();
    await settle();
    key('PageDown');
    await settle();
    expect(document.activeElement).toBe(cell('February 28, 2026'));
    key('Enter');
    await settle();
    expect(host.due).toEqual(new Date(2026, 1, 28));
    expect(document.activeElement).toBe(trigger());
    trigger().click();
    await settle();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await settle();
    expect(document.querySelector('[role="grid"]')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('follows a two-way bound signal, or keeps its own day, picks presets and clears', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 5, 15, 9));
    @Component({
      imports: [PixelDatePicker],
      template: `
        <pxl-date-picker
          name="due"
          clearable
          [presets]="presets"
          [format]="format"
          [defaultValue]="start"
          (valueChange)="changes.push($event)"
        />
      `,
    })
    class Host {
      readonly start = new Date(2026, 1, 3);
      readonly presets = [{ label: 'New year', value: new Date(2027, 0, 1, 12) }];
      readonly format = (date: Date) => `Year ${date.getFullYear()}`;
      readonly changes: Array<Date | null | undefined> = [];
    }
    const { host, settle } = await render(Host);
    const hidden = document.querySelector<HTMLInputElement>('input[type="hidden"]')!;
    expect([hidden.name, hidden.value]).toEqual(['due', '2026-02-03']);
    expect(trigger().textContent).toContain('Year 2026');
    trigger().click();
    await settle();
    expect(cell('June 15, 2026')).toBeNull();
    button('New year').click();
    await settle();
    expect(host.changes).toEqual([new Date(2027, 0, 1)]);
    expect(hidden.value).toBe('2027-01-01');
    trigger().click();
    await settle();
    button('Clear').click();
    await settle();
    expect(host.changes.at(-1)).toBeNull();
    expect(hidden.value).toBe('');
    expect(trigger().textContent).toContain('Select date');
  });

  it('marks today, and moves focus to it as it opens without a value', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 5, 15, 9));
    @Component({
      imports: [PixelDatePicker],
      template: `<pxl-date-picker [(value)]="value" />`,
    })
    class Host {
      readonly value = signal<Date | null>(null);
    }
    const { settle } = await render(Host);
    trigger().click();
    await settle();
    expect(document.activeElement).toBe(cell('June 15, 2026'));
    expect(cell('June 15, 2026').getAttribute('aria-current')).toBe('date');
  });

  it('puts native attributes on the trigger, not on its host, and names the dialog', async () => {
    @Component({
      imports: [PixelDatePicker],
      template: `<pxl-date-picker id="due" name="due" data-testid="picker" aria-describedby="help" hint="Weekdays only" />`,
    })
    class Host {}
    const { settle } = await render(Host);
    const host = document.querySelector('pxl-date-picker')!;
    for (const name of ['id', 'name', 'data-testid', 'aria-describedby']) expect(host.hasAttribute(name)).toBe(false);
    expect(trigger().id).toBe('due');
    expect(trigger().getAttribute('data-testid')).toBe('picker');
    expect(trigger().getAttribute('aria-describedby')).toBe('help due-msg');
    trigger().click();
    await settle();
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-label')).toBe('Choose date');
    expect(trigger().getAttribute('aria-controls')).toBe(dialog.id);
  });
});
