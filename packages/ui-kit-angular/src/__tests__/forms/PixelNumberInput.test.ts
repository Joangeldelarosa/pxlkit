/**
 * PixelNumberInput as an Angular form control, a two-way binding and an
 * uncontrolled field; steps, clamping, the hidden input and native
 * attributes.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelNumberInput } from '../../public-api';

const inputOf = (root: HTMLElement) => root.querySelector('[role="spinbutton"]') as HTMLInputElement;
const stepper = (root: HTMLElement, name: 'Increment' | 'Decrement') =>
  root.querySelector(`[aria-label="${name}"]`) as HTMLButtonElement;

function type(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('PixelNumberInput', () => {
  it('works with a reactive form control, including disabling, touched and reset', async () => {
    @Component({
      imports: [PixelNumberInput, ReactiveFormsModule],
      template: '<pxl-number-input label="Qty" [min]="0" [max]="10" [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl<number | null>(4);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = inputOf(root);
    expect(input.value).toBe('4');
    stepper(root, 'Increment').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe(5);
    input.dispatchEvent(new FocusEvent('focus'));
    type(input, '12');
    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe(10);
    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(input.value).toBe('10');

    fixture.componentInstance.control.setValue(7);
    await fixture.whenStable();
    expect(input.value).toBe('7');
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(stepper(root, 'Increment').disabled).toBe(true);
    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(input.value).toBe('');
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelNumberInput, FormsModule],
      template: '<pxl-number-input label="Qty" [(ngModel)]="value" />',
    })
    class Host {
      value = 1;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    type(inputOf(fixture.nativeElement), '30');
    expect(fixture.componentInstance.value).toBe(30);
  });

  it('follows a two-way bound signal and steps from the keyboard while focused', async () => {
    @Component({
      imports: [PixelNumberInput],
      template: '<pxl-number-input [(value)]="value" [step]="0.25" [precision]="2" thousandsSeparator="," />',
    })
    class Host {
      readonly value = signal<number | undefined>(999.5);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = inputOf(fixture.nativeElement);
    expect(input.value).toBe('999.50');
    input.dispatchEvent(new FocusEvent('focus'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(1000);
    expect(input.value).toBe('1,000.00');
    fixture.componentInstance.value.set(5);
    await fixture.whenStable();
    // While focused the field keeps what it shows; blur settles it.
    expect(input.value).toBe('1,000.00');
    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(input.value).toBe('5.00');
  });

  it('starts from defaultValue when uncontrolled, submits through a hidden input and reports changes', async () => {
    @Component({
      imports: [PixelNumberInput],
      template: `<pxl-number-input name="qty" [defaultValue]="3" (valueChange)="changes.push($event)" />`,
    })
    class Host {
      readonly changes: Array<number | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const hidden = root.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden.name).toBe('qty');
    expect(hidden.value).toBe('3');
    stepper(root, 'Decrement').click();
    await fixture.whenStable();
    expect(hidden.value).toBe('2');
    expect(fixture.componentInstance.changes).toEqual([2]);
  });

  it('ignores the steppers at a bound and while disabled', async () => {
    @Component({
      imports: [PixelNumberInput],
      template: `
        <pxl-number-input id="max" [(value)]="atMax" [min]="0" [max]="100" />
        <pxl-number-input id="off" [(value)]="off" disabled />
      `,
    })
    class Host {
      readonly atMax = signal<number | undefined>(150);
      readonly off = signal<number | undefined>(1);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const [maxIncrement, offIncrement] = Array.from(root.querySelectorAll<HTMLButtonElement>('[aria-label="Increment"]'));
    expect(maxIncrement!.disabled).toBe(true);
    maxIncrement!.dispatchEvent(new MouseEvent('click'));
    offIncrement!.dispatchEvent(new MouseEvent('click'));
    (root.querySelector('#off') as HTMLInputElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.atMax()).toBe(150);
    expect(fixture.componentInstance.off()).toBe(1);
  });

  it('puts native attributes on the input, not on its host', async () => {
    @Component({
      imports: [PixelNumberInput],
      template: `
        <pxl-number-input
          id="qty"
          name="qty"
          placeholder="0"
          required
          readonly
          aria-label="Quantity"
          aria-describedby="qty-help"
        />
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('pxl-number-input') as HTMLElement;
    const input = inputOf(fixture.nativeElement);
    for (const name of ['id', 'name', 'required', 'readonly', 'aria-label', 'aria-describedby']) {
      expect(host.hasAttribute(name)).toBe(false);
    }
    expect(input.id).toBe('qty');
    expect(input.hasAttribute('name')).toBe(false);
    expect(input.placeholder).toBe('0');
    expect(input.required).toBe(true);
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('aria-label')).toBe('Quantity');
    expect(input.getAttribute('aria-describedby')).toBe('qty-help');
  });

  it('describes the spinbutton with the hint or the error, after the ids passed to it', async () => {
    @Component({
      imports: [PixelNumberInput],
      template: `<pxl-number-input id="qty" label="Quantity" [hint]="hint()" [error]="error()" [aria-describedby]="describedBy()" />`,
    })
    class Host {
      readonly hint = signal<string | undefined>('Up to 10 per order');
      readonly error = signal<string | undefined>(undefined);
      readonly describedBy = signal<string | undefined>('qty-note');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const control = inputOf(root);
    const message = () => root.querySelector('#qty-msg')?.textContent;
    expect(control.getAttribute('aria-describedby')).toBe('qty-note qty-msg');
    expect(message()).toBe('Up to 10 per order');
    fixture.componentInstance.error.set('Out of stock');
    await fixture.whenStable();
    expect(control.getAttribute('aria-describedby')).toBe('qty-note qty-msg');
    expect(message()).toBe('Out of stock');
    fixture.componentInstance.hint.set(undefined);
    fixture.componentInstance.error.set(undefined);
    fixture.componentInstance.describedBy.set('qty-policy');
    await fixture.whenStable();
    expect(control.getAttribute('aria-describedby')).toBe('qty-policy');
    expect(message()).toBeUndefined();
    fixture.componentInstance.describedBy.set(undefined);
    await fixture.whenStable();
    expect(control.hasAttribute('aria-describedby')).toBe(false);
  });
});
