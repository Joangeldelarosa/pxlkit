/**
 * <pxl-date-range-picker> as an Angular form control, a two-way binding and
 * an uncontrolled picker; presets, clearing with the button over the trigger
 * and from the popover, form serialisation and native attributes. Rendering
 * and the shared interactions are covered against React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it } from 'vitest';
import { PixelDateRangePicker, type DateRangeValue } from '../../public-api';

const trigger = () => document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
const cell = (label: string) => document.querySelector<HTMLButtonElement>(`[role="gridcell"][aria-label="${label}"]`)!;
const button = (text: string) =>
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find((element) => element.textContent?.trim() === text)!;
const key = (name: string) =>
  document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
const clearButton = () => document.querySelector<HTMLButtonElement>('button[aria-label="Clear range"]');

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
  document.body.innerHTML = '';
});

describe('PixelDateRangePicker', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelDateRangePicker, ReactiveFormsModule],
      template: `<pxl-date-range-picker [formControl]="control" />`,
    })
    class Host {
      readonly control = new FormControl<DateRangeValue>({ from: new Date(2026, 9, 5), to: new Date(2026, 9, 9) });
    }
    const { host, settle } = await render(Host);
    expect(trigger().textContent).toContain('October 5, 2026 → October 9, 2026');
    trigger().focus();
    trigger().click();
    await settle();
    expect(document.activeElement).toBe(cell('October 5, 2026'));
    expect(host.control.touched).toBe(true);
    cell('October 20, 2026').click();
    await settle();
    expect(host.control.value).toEqual({ from: new Date(2026, 9, 20), to: undefined });
    cell('October 12, 2026').click();
    await settle();
    expect(host.control.value).toEqual({ from: new Date(2026, 9, 12), to: new Date(2026, 9, 20) });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    host.control.disable();
    await settle();
    expect(trigger().disabled).toBe(true);
  });

  it('works with ngModel from the keyboard across both months', async () => {
    @Component({
      imports: [PixelDateRangePicker, FormsModule],
      template: `<pxl-date-range-picker [(ngModel)]="range" />`,
    })
    class Host {
      range: DateRangeValue = { from: new Date(2026, 9, 29) };
    }
    const { host, settle } = await render(Host);
    trigger().click();
    await settle();
    key('Enter');
    await settle();
    key('ArrowDown');
    await settle();
    // November 5 is in the right-hand month, which keeps the view.
    expect(document.activeElement).toBe(document.querySelectorAll('[role="grid"]')[1]!.querySelector('[aria-label="November 5, 2026"]'));
    key(' ');
    await settle();
    expect(host.range).toEqual({ from: new Date(2026, 9, 29), to: new Date(2026, 10, 5) });
  });

  it('follows a two-way bound signal, picks presets, submits both days and clears with the button over the trigger', async () => {
    @Component({
      imports: [PixelDateRangePicker],
      template: `<pxl-date-range-picker name="stay" clearable [presets]="presets" [(value)]="range" />`,
    })
    class Host {
      readonly range = signal<DateRangeValue | undefined>({ from: new Date(2026, 0, 2), to: new Date(2026, 0, 4) });
      readonly presets = [{ label: 'Spring', value: { from: new Date(2026, 3, 30), to: new Date(2026, 2, 21) } }];
    }
    const { host, settle } = await render(Host);
    const submitted = () =>
      Array.from(document.querySelectorAll<HTMLInputElement>('input[type="hidden"]')).map((input) => [input.name, input.value]);
    expect(submitted()).toEqual([
      ['stay.from', '2026-01-02'],
      ['stay.to', '2026-01-04'],
    ]);
    trigger().click();
    await settle();
    button('Spring').click();
    await settle();
    expect(host.range()).toEqual({ from: new Date(2026, 2, 21), to: new Date(2026, 3, 30) });
    expect(submitted()).toEqual([
      ['stay.from', '2026-03-21'],
      ['stay.to', '2026-04-30'],
    ]);
    const clear = clearButton()!;
    expect(clear.type).toBe('button');
    // Beside the trigger, in the span that anchors both.
    expect(clear.parentElement!.contains(trigger())).toBe(true);
    expect(trigger().querySelector('button, [role="button"], [tabindex]')).toBeNull();
    expect(trigger().classList).toContain('pr-7');
    // Enter on the focused button, which the browser follows with a click.
    clear.focus();
    key('Enter');
    clear.click();
    await settle();
    expect(host.range()).toEqual({});
    expect(clearButton()).toBeNull();
    expect(document.activeElement).toBe(trigger());
    expect(trigger().classList).toContain('px-3');
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    host.range.set({ from: new Date(2026, 6, 1) });
    await settle();
    expect(trigger().textContent).toContain('July 1, 2026 → …');
  });

  it('closes the open popover when its clear button is pressed, focusing the trigger, and disables the button with the form control', async () => {
    @Component({
      imports: [PixelDateRangePicker, ReactiveFormsModule],
      template: `<pxl-date-range-picker clearable [formControl]="control" />`,
    })
    class Host {
      readonly control = new FormControl<DateRangeValue>({ from: new Date(2026, 0, 2), to: new Date(2026, 0, 4) });
    }
    const { host, settle } = await render(Host);
    trigger().click();
    await settle();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    clearButton()!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    clearButton()!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    clearButton()!.click();
    await settle();
    expect(host.control.value).toEqual({});
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger());
    host.control.setValue({ from: new Date(2026, 0, 2) });
    host.control.disable();
    await settle();
    expect(clearButton()!.disabled).toBe(true);
  });

  it('keeps its own range while uncontrolled and clears it from the popover', async () => {
    @Component({
      imports: [PixelDateRangePicker],
      template: `<pxl-date-range-picker clearable [numberOfMonths]="1" [defaultValue]="start" (valueChange)="changes.push($event)" />`,
    })
    class Host {
      readonly start = { from: new Date(2026, 0, 2), to: new Date(2026, 0, 4) };
      readonly changes: Array<DateRangeValue | undefined> = [];
    }
    const { host, settle } = await render(Host);
    trigger().click();
    await settle();
    expect(document.querySelectorAll('[role="grid"]')).toHaveLength(1);
    button('Clear').click();
    await settle();
    expect(host.changes).toEqual([{}]);
    expect(trigger().textContent).toContain('Select date range');
  });

  it('puts native attributes on the trigger, not on its host, and names the dialog', async () => {
    @Component({
      imports: [PixelDateRangePicker],
      template: `<pxl-date-range-picker id="stay" name="stay" data-testid="picker" aria-describedby="help" error="Pick both days" />`,
    })
    class Host {}
    const { settle } = await render(Host);
    const host = document.querySelector('pxl-date-range-picker')!;
    for (const name of ['id', 'name', 'data-testid', 'aria-describedby']) expect(host.hasAttribute(name)).toBe(false);
    expect(trigger().id).toBe('stay');
    expect(trigger().getAttribute('data-testid')).toBe('picker');
    expect(trigger().getAttribute('aria-describedby')).toBe('help stay-msg');
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
    trigger().click();
    await settle();
    expect(document.querySelector('[role="dialog"]')!.getAttribute('aria-label')).toBe('Choose date range');
  });
});
