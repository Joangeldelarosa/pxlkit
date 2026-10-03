/**
 * PixelForm on reactive forms: when errors show (submission, then changes,
 * never blur), focus on a failed submission, the submitted value, the
 * control binding both ways, and the submission flow against React's on
 * React Hook Form, which the parity scenarios cannot drive (the example has
 * no submit button, and jsdom no implicit submission).
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators, type AbstractControl } from '@angular/forms';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { reactExamples } from '../../../../../scripts/parity/catalog';
import { canonicalPage } from '../../../../../scripts/parity/canonical';
import { mountReact, type Mounted } from '../../../../../scripts/parity/react';
import {
  PixelForm,
  PixelFormControl,
  PixelFormDescription,
  PixelFormField,
  PixelFormItem,
  PixelFormLabel,
  PixelFormMessage,
  PixelInput,
} from '../../public-api';
import { mountAngular } from '../angular';
import { angularDomRules } from '../dom-rules';
import { angularExamples } from '../examples';

const PARTS = [PixelForm, PixelFormControl, PixelFormDescription, PixelFormField, PixelFormItem, PixelFormLabel, PixelFormMessage, PixelInput];

/** Types into an input as a user does: through the native setter, which React's value tracking sees. */
function type(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

@Component({
  imports: PARTS,
  template: `
    <form #login="pxlForm" [pxlForm]="form" (submitted)="submitted.push($event)" class="mine">
      <pxl-form-item pxlFormField="email" #field="pxlFormField" [messages]="{ required: 'Email is required' }">
        <label pxlFormLabel>Email</label>
        <pxl-input pxlFormControl name="email" />
        <p pxlFormDescription>We never spam.</p>
        <pxl-form-message />
      </pxl-form-item>
      <span data-testid="state">{{ field.invalid() }}:{{ field.error() ?? '' }}</span>
      <button type="submit">Go</button>
    </form>
  `,
})
class Login {
  readonly form = new FormGroup({ email: new FormControl('', { nonNullable: true, validators: Validators.required }) });
  readonly submitted: unknown[] = [];
}

async function login() {
  const fixture = TestBed.createComponent(Login);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    root,
    input: root.querySelector('input')!,
    form: root.querySelector('form')!,
    state: () => root.querySelector('[data-testid="state"]')!.textContent,
    alert: () => root.querySelector('[role="alert"]')?.textContent ?? null,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PixelForm', () => {
  it('links the label, control, description and message with ids of the item', async () => {
    const { fixture, root, input, form } = await login();
    const label = root.querySelector('label')!;
    const description = root.querySelector('p')!;
    expect(label.htmlFor).toBe(input.id);
    expect(input.id).toMatch(/-control$/);
    expect(input.getAttribute('aria-describedby')).toBe(description.id);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(form.noValidate).toBe(true);
    expect([...form.classList].sort()).toEqual(['font-mono', 'mine', 'space-y-4']);
    form.requestSubmit();
    await fixture.whenStable();
    const message = root.querySelector('[role="alert"]')!;
    expect(message.textContent).toBe('Email is required');
    expect(input.getAttribute('aria-describedby')).toBe(`${description.id} ${message.id}`);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows errors from the first submission, then as the value changes, never on blur', async () => {
    const { fixture, input, form, state, alert } = await login();
    type(input, 'x');
    type(input, '');
    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect([state(), alert()]).toEqual(['false:', null]);
    form.requestSubmit();
    await fixture.whenStable();
    expect([state(), alert()]).toEqual(['true:Email is required', 'Email is required']);
    type(input, 'me@pxlkit.xyz');
    await fixture.whenStable();
    expect([state(), alert()]).toEqual(['false:', null]);
    type(input, '');
    await fixture.whenStable();
    expect(alert()).toBe('Email is required');
  });

  it('focuses the first field with an error, and emits the value once there is none', async () => {
    const { fixture, input, form, root } = await login();
    root.querySelector('button')!.focus();
    form.requestSubmit();
    await fixture.whenStable();
    expect(document.activeElement).toBe(input);
    expect(fixture.componentInstance.submitted).toEqual([]);
    type(input, 'me@pxlkit.xyz');
    form.requestSubmit();
    await fixture.whenStable();
    expect(fixture.componentInstance.submitted).toEqual([{ email: 'me@pxlkit.xyz' }]);
  });

  it('binds the field control both ways: values, touched and disabled', async () => {
    const { fixture, input } = await login();
    const control = fixture.componentInstance.form.controls.email;
    type(input, 'pxl');
    expect([control.value, control.dirty]).toEqual(['pxl', true]);
    input.dispatchEvent(new FocusEvent('blur'));
    expect(control.touched).toBe(true);
    control.setValue('hero@pxlkit.xyz');
    await fixture.whenStable();
    expect(input.value).toBe('hero@pxlkit.xyz');
    control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    control.enable();
    await fixture.whenStable();
    expect(input.disabled).toBe(false);
  });

  it('hides the errors again once reset, until the next submission', async () => {
    const { fixture, form, alert } = await login();
    form.requestSubmit();
    await fixture.whenStable();
    expect(alert()).toBe('Email is required');
    const pxlForm = fixture.debugElement.children[0]!.injector.get(PixelForm);
    pxlForm.reset();
    await fixture.whenStable();
    expect(alert()).toBeNull();
    form.requestSubmit();
    await fixture.whenStable();
    expect(alert()).toBe('Email is required');
  });

  it('waits for pending validators before it emits or focuses', async () => {
    let settle!: (errors: Record<string, true> | null) => void;
    const taken = () => new Promise<Record<string, true> | null>((resolve) => (settle = resolve));
    @Component({
      imports: PARTS,
      template: `
        <form [pxlForm]="form" (submitted)="submitted.push($event)">
          <pxl-form-item pxlFormField="nick" [messages]="{ taken: 'Taken' }">
            <pxl-input pxlFormControl />
            <pxl-form-message />
          </pxl-form-item>
        </form>
      `,
    })
    class Signup {
      readonly form = new FormGroup({
        nick: new FormControl('pxl', { nonNullable: true, asyncValidators: (_: AbstractControl) => taken() }),
      });
      readonly submitted: unknown[] = [];
    }
    const fixture = TestBed.createComponent(Signup);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector('form')!.requestSubmit();
    await fixture.whenStable();
    expect(fixture.componentInstance.submitted).toEqual([]);
    settle({ taken: true });
    await vi.waitFor(() => expect(root.querySelector('[role="alert"]')?.textContent).toBe('Taken'));
    expect(fixture.componentInstance.submitted).toEqual([]);
  });

  it('needs a form around a field and an item around its parts', () => {
    @Component({ imports: PARTS, template: '<pxl-form-item pxlFormField="x" />' })
    class Orphan {}
    expect(() => TestBed.createComponent(Orphan)).toThrow('PixelFormField must be used inside a form[pxlForm].');
    @Component({ imports: PARTS, template: '<label pxlFormLabel>x</label>' })
    class Loose {}
    expect(() => TestBed.createComponent(Loose)).toThrow('PixelFormLabel must be used inside a <pxl-form-item>.');
  });

  it('renders what React renders through a submission, a fix and a valid submission', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const reference = reactExamples().find((e) => e.component === 'PixelForm' && e.exportName === 'Default')!;
    const flow = async ({ container, flush }: Mounted, rules = {}) => {
      const snapshots: string[] = [];
      const step = async (act: () => void) => {
        act();
        for (let round = 0; round < 4; round++) await flush();
        snapshots.push(canonicalPage(document, { ...rules, unwrap: (element) => element.hasAttribute('data-parity-root') }));
      };
      const form = container.querySelector('form')!;
      const [username, email] = Array.from(container.querySelectorAll('input'));
      await step(() => form.requestSubmit());
      await step(() => type(username!, 'pxl'));
      await step(() => username!.blur());
      await step(() => type(email!, 'hero@'));
      await step(() => form.requestSubmit());
      await step(() => type(email!, 'hero@pxlkit.xyz'));
      await step(() => form.requestSubmit());
      return snapshots;
    };
    const react = await mountReact(reference.Component);
    const expected = await flow(react);
    await react.unmount();
    const angular = await mountAngular(await angularExamples.get('PixelForm/Default')!.load());
    const actual = await flow(angular, angularDomRules);
    await angular.unmount();
    expect(actual).toEqual(expected);
    expect(log.mock.calls).toEqual([
      ['submit', { username: 'pxl', email: 'hero@pxlkit.xyz' }],
      ['submit', { username: 'pxl', email: 'hero@pxlkit.xyz' }],
    ]);
  });
});

describe('PixelForm field state', () => {
  it('names no error without a message for it', async () => {
    @Component({
      imports: PARTS,
      template: `
        <form [pxlForm]="form">
          <pxl-form-item pxlFormField="code" #field="pxlFormField">
            <pxl-input pxlFormControl />
            <pxl-form-message />
          </pxl-form-item>
          <output>{{ field.invalid() }}</output>
        </form>
      `,
    })
    class Untold {
      readonly form = new FormGroup({ code: new FormControl('', Validators.required) });
    }
    const fixture = TestBed.createComponent(Untold);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector('form')!.requestSubmit();
    await fixture.whenStable();
    // Invalid, so described by the message id, though there is no text to show.
    expect(root.querySelector('output')!.textContent).toBe('true');
    expect(root.querySelector('[role="alert"]')).toBeNull();
    expect(root.querySelector('input')!.getAttribute('aria-describedby')).toMatch(/-description \S+-message$/);
  });
});
