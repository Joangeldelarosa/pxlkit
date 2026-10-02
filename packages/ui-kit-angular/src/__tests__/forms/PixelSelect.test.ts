/**
 * PixelSelect as an Angular form control, a two-way binding and an
 * uncontrolled select; keyboard and pointer use, option icons and native
 * attributes.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelSelect } from '../../public-api';

const OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];
const triggerOf = (root: HTMLElement) => root.querySelector('[role="combobox"]') as HTMLButtonElement;
const optionsOf = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>('[role="option"]'));
const key = (element: HTMLElement, name: string) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

describe('PixelSelect', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelSelect, ReactiveFormsModule],
      template: '<pxl-select label="Color" [options]="options" [formControl]="control" />',
    })
    class Host {
      readonly options = OPTIONS;
      readonly control = new FormControl('red');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = triggerOf(root);
    expect(trigger.textContent).toContain('Red');
    trigger.click();
    await fixture.whenStable();
    optionsOf(root)[2]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('blue');
    trigger.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);
    fixture.componentInstance.control.setValue('green');
    await fixture.whenStable();
    expect(trigger.textContent).toContain('Green');
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(trigger.disabled).toBe(true);
    key(trigger, 'ArrowDown');
    await fixture.whenStable();
    expect(optionsOf(root)).toHaveLength(0);
  });

  it('works with ngModel from the keyboard', async () => {
    @Component({
      imports: [PixelSelect, FormsModule],
      template: '<pxl-select [options]="options" [(ngModel)]="value" />',
    })
    class Host {
      readonly options = OPTIONS;
      value = 'red';
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = triggerOf(root);
    key(trigger, 'ArrowDown');
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-controls')).toBe(root.querySelector('[role="listbox"]')!.id);
    key(trigger, 'ArrowDown');
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-activedescendant')).toBe(optionsOf(root)[1]!.id);
    key(trigger, 'Enter');
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe('green');
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('follows a two-way bound signal, or keeps its own value and reports it', async () => {
    @Component({
      imports: [PixelSelect],
      template: `
        <pxl-select id="bound" name="bound" [options]="options" [(value)]="value" />
        <pxl-select id="free" [options]="options" defaultValue="green" (valueChange)="changes.push($event)" />
      `,
    })
    class Host {
      readonly options = OPTIONS;
      readonly value = signal<string | undefined>('blue');
      readonly changes: Array<string | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const [bound, free] = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="combobox"]'));
    expect((root.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('blue');
    fixture.componentInstance.value.set('red');
    await fixture.whenStable();
    expect(bound!.textContent).toContain('Red');
    expect((root.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('red');
    expect(free!.textContent).toContain('Green');
    key(free!, 'Home');
    key(free!, 'Enter');
    await fixture.whenStable();
    expect(free!.textContent).toContain('Red');
    expect(fixture.componentInstance.changes).toEqual(['red']);
  });

  it('closes on a press outside and renders option icons from templates and text', async () => {
    @Component({
      imports: [PixelSelect],
      template: `
        <ng-template #dot><b>●</b></ng-template>
        <pxl-select
          [options]="[{ value: 'red', label: 'Red', icon: dot }, { value: 'green', label: 'Green', icon: '◆' }]"
          defaultValue="red"
        />
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    expect(triggerOf(root).querySelector('b')!.textContent).toBe('●');
    triggerOf(root).click();
    await fixture.whenStable();
    expect(optionsOf(root)[1]!.textContent).toContain('◆');
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await fixture.whenStable();
    expect(optionsOf(root)).toHaveLength(0);
  });

  it('puts native attributes on the trigger, not on its host', async () => {
    @Component({
      imports: [PixelSelect],
      template: `<pxl-select id="color" name="color" required aria-describedby="help" [options]="options" />`,
    })
    class Host {
      readonly options = OPTIONS;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('pxl-select') as HTMLElement;
    const trigger = triggerOf(fixture.nativeElement);
    for (const name of ['id', 'name', 'required', 'aria-describedby']) expect(host.hasAttribute(name)).toBe(false);
    expect(trigger.id).toBe('color');
    expect(trigger.getAttribute('aria-describedby')).toBe('help');
    expect(trigger.getAttribute('aria-required')).toBe('true');
    expect((fixture.nativeElement.querySelector('input[type="hidden"]') as HTMLInputElement).name).toBe('color');
  });

  it('describes the trigger with the hint or the error, after the ids passed to it', async () => {
    @Component({
      imports: [PixelSelect],
      template: `<pxl-select id="color" label="Color" [options]="options" [hint]="hint()" [error]="error()" [aria-describedby]="describedBy()" />`,
    })
    class Host {
      readonly hint = signal<string | undefined>('Used for the badge');
      readonly error = signal<string | undefined>(undefined);
      readonly describedBy = signal<string | undefined>('color-note');
      readonly options = OPTIONS;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const control = triggerOf(root);
    const message = () => root.querySelector('#color-msg')?.textContent;
    expect(control.getAttribute('aria-describedby')).toBe('color-note color-msg');
    expect(message()).toBe('Used for the badge');
    fixture.componentInstance.error.set('Required');
    await fixture.whenStable();
    expect(control.getAttribute('aria-describedby')).toBe('color-note color-msg');
    expect(message()).toBe('Required');
    fixture.componentInstance.hint.set(undefined);
    fixture.componentInstance.error.set(undefined);
    fixture.componentInstance.describedBy.set('color-policy');
    await fixture.whenStable();
    expect(control.getAttribute('aria-describedby')).toBe('color-policy');
    expect(message()).toBeUndefined();
    fixture.componentInstance.describedBy.set(undefined);
    await fixture.whenStable();
    expect(control.hasAttribute('aria-describedby')).toBe(false);
  });
});
