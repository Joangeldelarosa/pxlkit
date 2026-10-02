/**
 * PixelPasswordInput as an Angular form control, a two-way binding and an
 * uncontrolled input; its toggle and native attributes.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelPasswordInput } from '../../public-api';

const inputOf = (root: HTMLElement) => root.querySelector('input') as HTMLInputElement;
const toggleOf = (root: HTMLElement) => root.querySelector('button') as HTMLButtonElement;

function type(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('PixelPasswordInput', () => {
  it('works with a reactive form control, including disabling, touched and reset', async () => {
    @Component({
      imports: [PixelPasswordInput, ReactiveFormsModule],
      template: '<pxl-password-input label="Password" [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl('hunter2');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = inputOf(root);
    expect(input.value).toBe('hunter2');
    type(input, 'hunter3');
    expect(fixture.componentInstance.control.value).toBe('hunter3');
    input.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);

    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(toggleOf(root).disabled).toBe(true);
    toggleOf(root).click();
    await fixture.whenStable();
    expect(input.type).toBe('password');
    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(input.value).toBe('');
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelPasswordInput, FormsModule],
      template: '<pxl-password-input label="Password" [(ngModel)]="value" />',
    })
    class Host {
      value = '';
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    type(inputOf(fixture.nativeElement), 'swordfish');
    expect(fixture.componentInstance.value).toBe('swordfish');
  });

  it('follows a two-way bound signal and starts from defaultValue otherwise', async () => {
    @Component({
      imports: [PixelPasswordInput],
      template: `
        <pxl-password-input id="bound" [(value)]="value" />
        <pxl-password-input id="free" defaultValue="draft" />
      `,
    })
    class Host {
      readonly value = signal('a');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const bound = fixture.nativeElement.querySelector('#bound') as HTMLInputElement;
    type(bound, 'ab');
    expect(fixture.componentInstance.value()).toBe('ab');
    fixture.componentInstance.value.set('reset');
    await fixture.whenStable();
    expect(bound.value).toBe('reset');
    expect((fixture.nativeElement.querySelector('#free') as HTMLInputElement).value).toBe('draft');
  });

  it('toggles visibility with custom labels', async () => {
    @Component({
      imports: [PixelPasswordInput],
      template: `<pxl-password-input [toggleLabels]="['Ver', 'Ocultar']" />`,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(toggleOf(root).getAttribute('aria-label')).toBe('Ver');
    expect(toggleOf(root).getAttribute('aria-pressed')).toBe('false');
    toggleOf(root).click();
    await fixture.whenStable();
    expect(inputOf(root).type).toBe('text');
    expect(toggleOf(root).getAttribute('aria-label')).toBe('Ocultar');
    expect(toggleOf(root).getAttribute('aria-pressed')).toBe('true');
    expect(toggleOf(root).tabIndex).toBe(-1);
  });

  it('puts native attributes on the input, not on its host', async () => {
    @Component({
      imports: [PixelPasswordInput],
      template: `
        <pxl-password-input
          id="pw"
          name="pw"
          placeholder="Secret"
          autocomplete="new-password"
          minlength="8"
          maxlength="64"
          required
          aria-label="New password"
          aria-describedby="pw-help"
        />
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('pxl-password-input') as HTMLElement;
    const input = inputOf(fixture.nativeElement);
    for (const name of ['id', 'name', 'required', 'aria-label', 'aria-describedby']) expect(host.hasAttribute(name)).toBe(false);
    expect(input.id).toBe('pw');
    expect(input.name).toBe('pw');
    expect(input.placeholder).toBe('Secret');
    expect(input.getAttribute('autocomplete')).toBe('new-password');
    expect(input.minLength).toBe(8);
    expect(input.maxLength).toBe(64);
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-label')).toBe('New password');
    expect(input.getAttribute('aria-describedby')).toBe('pw-help');
  });

  it('describes the input with the hint or the error, after the ids passed to it', async () => {
    @Component({
      imports: [PixelPasswordInput],
      template: `<pxl-password-input id="pw" label="Password" [hint]="hint()" [error]="error()" [aria-describedby]="describedBy()" />`,
    })
    class Host {
      readonly hint = signal<string | undefined>('At least 12 characters');
      readonly error = signal<string | undefined>(undefined);
      readonly describedBy = signal<string | undefined>('pw-rules');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const control = inputOf(root);
    const message = () => root.querySelector('#pw-msg')?.textContent;
    expect(control.getAttribute('aria-describedby')).toBe('pw-rules pw-msg');
    expect(message()).toBe('At least 12 characters');
    fixture.componentInstance.error.set('Too short');
    await fixture.whenStable();
    expect(control.getAttribute('aria-describedby')).toBe('pw-rules pw-msg');
    expect(message()).toBe('Too short');
    fixture.componentInstance.hint.set(undefined);
    fixture.componentInstance.error.set(undefined);
    fixture.componentInstance.describedBy.set('pw-policy');
    await fixture.whenStable();
    expect(control.getAttribute('aria-describedby')).toBe('pw-policy');
    expect(message()).toBeUndefined();
    fixture.componentInstance.describedBy.set(undefined);
    await fixture.whenStable();
    expect(control.hasAttribute('aria-describedby')).toBe(false);
  });
});
