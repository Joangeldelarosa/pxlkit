/**
 * PixelInput as an Angular form control, a two-way binding and an
 * uncontrolled input; its clear output, template inputs and native
 * attributes.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelInput } from '../../public-api';

const inputOf = (root: HTMLElement) => root.querySelector('input') as HTMLInputElement;
const clearOf = (root: HTMLElement) => root.querySelector<HTMLButtonElement>('[aria-label="Clear input"]');

function type(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('PixelInput', () => {
  it('works with a reactive form control, including disabling, touched and reset', async () => {
    @Component({
      imports: [PixelInput, ReactiveFormsModule],
      template: '<pxl-input label="Name" clearable [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl('Ada');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = inputOf(root);
    expect(input.value).toBe('Ada');
    type(input, 'Grace');
    expect(fixture.componentInstance.control.value).toBe('Grace');
    input.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);

    clearOf(root)!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('');
    expect(input.value).toBe('');

    fixture.componentInstance.control.setValue('Linus');
    await fixture.whenStable();
    expect(input.value).toBe('Linus');
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(clearOf(root)).toBeNull();
    fixture.componentInstance.control.enable();
    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(input.value).toBe('');
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelInput, FormsModule],
      template: '<pxl-input label="Code" [(ngModel)]="value" />',
    })
    class Host {
      value = 'start';
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = inputOf(fixture.nativeElement);
    expect(input.value).toBe('start');
    type(input, 'ABCD');
    expect(fixture.componentInstance.value).toBe('ABCD');
  });

  it('feeds the Angular validators through its native attribute inputs', async () => {
    @Component({
      imports: [PixelInput, ReactiveFormsModule],
      template: '<pxl-input label="Code" required maxlength="4" [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl('');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const { control } = fixture.componentInstance;
    const input = inputOf(fixture.nativeElement);
    expect(input.required).toBe(true);
    expect(input.maxLength).toBe(4);
    expect(control.hasError('required')).toBe(true);
    type(input, 'ABCDE');
    expect(control.hasError('maxlength')).toBe(true);
  });

  it('follows a two-way bound signal and clears it', async () => {
    @Component({
      imports: [PixelInput],
      template: '<pxl-input label="Name" clearable [(value)]="value" (clear)="clears = clears + 1" />',
    })
    class Host {
      readonly value = signal('a');
      clears = 0;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = inputOf(root);
    type(input, 'ab');
    expect(fixture.componentInstance.value()).toBe('ab');
    fixture.componentInstance.value.set('reset');
    await fixture.whenStable();
    expect(input.value).toBe('reset');
    clearOf(root)!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('');
    expect(fixture.componentInstance.clears).toBe(1);
  });

  it('starts from defaultValue when uncontrolled, counts and reports edits', async () => {
    @Component({
      imports: [PixelInput],
      template: `<pxl-input defaultValue="abc" showCount clearable (valueChange)="changes.push($event)" />`,
    })
    class Host {
      readonly changes: Array<string | number | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = inputOf(root);
    expect(input.value).toBe('abc');
    expect(root.textContent).toContain('3');
    type(input, 'abcd');
    await fixture.whenStable();
    expect(root.textContent).toContain('4');
    clearOf(root)!.click();
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(fixture.componentInstance.changes).toEqual(['abcd', '']);
  });

  it('renders text and template content inside and around the shell', async () => {
    @Component({
      imports: [PixelInput],
      template: `
        <pxl-input [prefix]="dollar" suffix="USD" addonLeft="https://" [addonRight]="tld" />
        <ng-template #dollar><b>$</b></ng-template>
        <ng-template #tld><i>.xyz</i></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('b')!.textContent).toBe('$');
    expect(root.querySelector('i')!.textContent).toBe('.xyz');
    expect(root.textContent).toContain('USD');
    expect(root.textContent).toContain('https://');
    expect(inputOf(root).className).toContain('rounded-l-none');
  });

  it('puts native attributes on the input, not on its host', async () => {
    @Component({
      imports: [PixelInput],
      template: `
        <pxl-input
          id="mail"
          name="mail"
          type="email"
          placeholder="you@pxlkit.xyz"
          autocomplete="email"
          pattern=".+@.+"
          minlength="3"
          readonly
          aria-label="Work email"
          aria-describedby="mail-help"
          [showCount]="{ max: 40 }"
        />
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('pxl-input') as HTMLElement;
    const input = inputOf(fixture.nativeElement);
    for (const name of ['id', 'name', 'aria-label', 'aria-describedby', 'readonly']) expect(host.hasAttribute(name)).toBe(false);
    expect(input.id).toBe('mail');
    expect(input.name).toBe('mail');
    expect(input.type).toBe('email');
    expect(input.placeholder).toBe('you@pxlkit.xyz');
    expect(input.getAttribute('autocomplete')).toBe('email');
    expect(input.getAttribute('pattern')).toBe('.+@.+');
    expect(input.minLength).toBe(3);
    expect(input.maxLength).toBe(40);
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('aria-label')).toBe('Work email');
    expect(input.getAttribute('aria-describedby')).toBe('mail-help');
  });

  it('describes the input with the hint or the error, after the ids passed to it', async () => {
    @Component({
      imports: [PixelInput],
      template: `<pxl-input id="email" label="Email" [hint]="hint()" [error]="error()" [aria-describedby]="describedBy()" />`,
    })
    class Host {
      readonly hint = signal<string | undefined>('We never share it');
      readonly error = signal<string | undefined>(undefined);
      readonly describedBy = signal<string | undefined>('email-rules');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const control = inputOf(root);
    const message = () => root.querySelector('#email-msg')?.textContent;
    expect(control.getAttribute('aria-describedby')).toBe('email-rules email-msg');
    expect(message()).toBe('We never share it');
    fixture.componentInstance.error.set('Enter a valid email');
    await fixture.whenStable();
    expect(control.getAttribute('aria-describedby')).toBe('email-rules email-msg');
    expect(message()).toBe('Enter a valid email');
    fixture.componentInstance.hint.set(undefined);
    fixture.componentInstance.error.set(undefined);
    fixture.componentInstance.describedBy.set('email-policy');
    await fixture.whenStable();
    expect(control.getAttribute('aria-describedby')).toBe('email-policy');
    expect(message()).toBeUndefined();
    fixture.componentInstance.describedBy.set(undefined);
    await fixture.whenStable();
    expect(control.hasAttribute('aria-describedby')).toBe(false);
  });
});

describe('PixelInput — one class per property', () => {
  it("takes its surface's font family and border width, once each", async () => {
    @Component({ imports: [PixelInput], template: '<pxl-input data-testid="pixel" /><pxl-input data-testid="linear" surface="linear" />' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    for (const [surface, family, border] of [['pixel', 'font-mono', 'border-2'], ['linear', 'font-sans', 'border']] as const) {
      const classes = Array.from(inputOf((fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${surface}"]`)!).classList);
      expect(classes.filter((name) => /^font-(sans|serif|mono|pixel)$/.test(name))).toEqual([family]);
      expect(classes.filter((name) => /^border(-[0248])?$/.test(name))).toEqual([border]);
    }
  });

  it('turns its loading spinner only for a reader who allows motion', async () => {
    @Component({ imports: [PixelInput], template: '<pxl-input loading />' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[class~="motion-safe:animate-spin"]')).not.toBeNull();
    expect(root.querySelector('.animate-spin')).toBeNull();
  });
});
