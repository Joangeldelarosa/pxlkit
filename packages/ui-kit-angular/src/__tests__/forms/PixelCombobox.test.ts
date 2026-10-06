/**
 * <pxl-combobox> as an Angular form control, a two-way binding and an
 * uncontrolled combobox; the closed trigger's keys, filtering, disabled state
 * and native attributes. Rendering and the shared interactions are covered
 * against React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it } from 'vitest';
import { PixelCombobox } from '../../public-api';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
];
const triggerOf = () => document.querySelector<HTMLButtonElement>('[role="combobox"]')!;
const options = () => Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
const key = (element: Element, name: string) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
const type = (input: HTMLInputElement, text: string) => {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

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

describe('PixelCombobox', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelCombobox, ReactiveFormsModule],
      template: `<pxl-combobox label="Fruit" [options]="options" [formControl]="control" />`,
    })
    class Host {
      readonly options = OPTIONS;
      readonly control = new FormControl('apple');
    }
    const { host, settle } = await render(Host);
    expect(triggerOf().textContent).toContain('Apple');
    triggerOf().click();
    await settle();
    options()[1]!.click();
    await settle();
    expect(host.control.value).toBe('banana');
    triggerOf().dispatchEvent(new FocusEvent('blur'));
    expect(host.control.touched).toBe(true);
    host.control.setValue('apple');
    await settle();
    expect(triggerOf().textContent).toContain('Apple');
    host.control.disable();
    await settle();
    expect(triggerOf().disabled).toBe(true);
    key(triggerOf(), 'ArrowDown');
    triggerOf().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it('works with ngModel: opens with Enter, filters in its focused search field and selects with Enter', async () => {
    @Component({
      imports: [PixelCombobox, FormsModule],
      template: `<pxl-combobox [options]="options" [(ngModel)]="fruit" />`,
    })
    class Host {
      readonly options = OPTIONS;
      fruit = 'apple';
    }
    const { host, settle } = await render(Host);
    key(triggerOf(), 'Enter');
    await settle();
    expect(triggerOf().getAttribute('aria-expanded')).toBe('true');
    expect(host.fruit).toBe('apple');
    const search = document.querySelector<HTMLInputElement>('[role="searchbox"]')!;
    expect(document.activeElement).toBe(search);
    type(search, 'rr');
    await settle();
    expect(options().map((option) => option.textContent?.trim())).toEqual(['Cherry']);
    key(search, 'Enter');
    await settle();
    expect(host.fruit).toBe('apple');
    type(search, 'an');
    await settle();
    expect(search.getAttribute('aria-activedescendant')).toBe(options()[0]!.id);
    key(search, 'Enter');
    await settle();
    expect(host.fruit).toBe('banana');
    expect(document.activeElement).toBe(triggerOf());
  });

  it('follows a two-way bound signal, or keeps its own value and reports it', async () => {
    @Component({
      imports: [PixelCombobox],
      template: `
        <pxl-combobox id="bound" name="bound" [options]="options" [(value)]="value" />
        <pxl-combobox id="free" [options]="options" defaultValue="banana" [searchable]="false" (valueChange)="changes.push($event)" />
      `,
    })
    class Host {
      readonly options = OPTIONS;
      readonly value = signal<string | undefined>('banana');
      readonly changes: Array<string | undefined> = [];
    }
    const { host, settle } = await render(Host);
    const [bound, free] = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="combobox"]'));
    expect((document.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('banana');
    host.value.set('apple');
    await settle();
    expect(bound!.textContent).toContain('Apple');
    expect(free!.textContent).toContain('Banana');
    key(free!, 'ArrowUp');
    await settle();
    key(free!, 'End');
    key(free!, 'ArrowUp');
    await settle();
    key(free!, 'Enter');
    await settle();
    expect(host.changes).toEqual(['banana']);
  });

  it('puts native attributes on the trigger, not on its host', async () => {
    @Component({
      imports: [PixelCombobox],
      template: `<pxl-combobox id="fruit" name="fruit" label="Fruit" hint="Pick one" aria-describedby="help" [options]="options" />`,
    })
    class Host {
      readonly options = OPTIONS;
    }
    await render(Host);
    const host = document.querySelector('pxl-combobox')!;
    for (const name of ['id', 'name', 'aria-describedby']) expect(host.hasAttribute(name)).toBe(false);
    expect(triggerOf().id).toBe('fruit');
    expect(document.querySelector('label')!.getAttribute('for')).toBe('fruit');
    expect(triggerOf().getAttribute('aria-describedby')).toBe('help fruit-msg');
    expect(triggerOf().getAttribute('aria-controls')).toMatch(/-listbox$/);
  });
});
