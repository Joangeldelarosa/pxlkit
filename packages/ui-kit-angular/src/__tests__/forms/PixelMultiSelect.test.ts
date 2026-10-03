/**
 * <pxl-multi-select> as an Angular form control, a two-way binding and an
 * uncontrolled multi-select; its cap, chip, keyboard and clear removal,
 * option icons and native attributes. Rendering and the shared interactions
 * are covered against React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it } from 'vitest';
import { PixelMultiSelect } from '../../public-api';

const OPTIONS = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
];
const triggerOf = () => document.querySelector<HTMLButtonElement>('[role="combobox"]')!;
const option = (label: string) =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find((element) => element.textContent?.includes(label))!;
const key = (element: Element, name: string) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

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

describe('PixelMultiSelect', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelMultiSelect, ReactiveFormsModule],
      template: `<pxl-multi-select [options]="options" [formControl]="control" />`,
    })
    class Host {
      readonly options = OPTIONS;
      readonly control = new FormControl(['a']);
    }
    const { host, settle } = await render(Host);
    triggerOf().click();
    await settle();
    option('Cherry').click();
    await settle();
    expect(host.control.value).toEqual(['a', 'c']);
    triggerOf().dispatchEvent(new FocusEvent('blur'));
    expect(host.control.touched).toBe(true);
    host.control.setValue(['b']);
    await settle();
    expect(Array.from(document.querySelectorAll('[data-pxl-chip-remove]')).map((chip) => chip.getAttribute('data-pxl-chip-remove'))).toEqual(['b']);
    host.control.disable();
    await settle();
    expect(triggerOf().disabled).toBe(true);
  });

  it('works with ngModel from the keyboard: Enter toggles, Backspace removes the last value', async () => {
    @Component({
      imports: [PixelMultiSelect, FormsModule],
      template: `<pxl-multi-select [options]="options" searchable [(ngModel)]="fruits" />`,
    })
    class Host {
      readonly options = OPTIONS;
      fruits = ['a'];
    }
    const { host, settle } = await render(Host);
    key(triggerOf(), 'ArrowDown');
    await settle();
    const search = document.querySelector<HTMLInputElement>('[role="searchbox"]')!;
    expect(document.activeElement).toBe(search);
    key(search, 'ArrowDown');
    await settle();
    expect(search.getAttribute('aria-activedescendant')).toBe(option('Banana').id);
    key(search, 'Enter');
    await settle();
    expect(host.fruits).toEqual(['a', 'b']);
    // Space types in the search field: it toggles nothing.
    expect(key(search, ' ')).toBe(true);
    key(search, 'Backspace');
    await settle();
    expect(host.fruits).toEqual(['a']);
  });

  it('follows a two-way bound signal, caps the selection and clears it', async () => {
    @Component({
      imports: [PixelMultiSelect],
      template: `<pxl-multi-select name="fruits" clearable [max]="2" [options]="options" [(value)]="value" />`,
    })
    class Host {
      readonly options = OPTIONS;
      readonly value = signal<string[] | undefined>(['a', 'b']);
    }
    const { host, settle } = await render(Host);
    const submitted = () => Array.from(document.querySelectorAll<HTMLInputElement>('input[type="hidden"]')).map((input) => input.value);
    expect(submitted()).toEqual(['a', 'b']);
    triggerOf().click();
    await settle();
    expect(option('Cherry').getAttribute('aria-disabled')).toBe('true');
    option('Cherry').click();
    await settle();
    expect(host.value()).toEqual(['a', 'b']);
    expect(document.body.textContent).toContain('2/2 selected');
    document.querySelector<HTMLElement>('[data-pxl-chip-remove="a"]')!.click();
    await settle();
    expect(host.value()).toEqual(['b']);
    expect(submitted()).toEqual(['b']);
    document.querySelector<HTMLElement>('[aria-label="Clear selection"]')!.click();
    await settle();
    expect(host.value()).toEqual([]);
  });

  it('renders option icons from templates and text, on the options and the chips', async () => {
    @Component({
      imports: [PixelMultiSelect],
      template: `
        <ng-template #dot><b>●</b></ng-template>
        <pxl-multi-select [options]="[{ value: 'a', label: 'Apple', icon: dot }, { value: 'b', label: 'Banana', icon: '◆' }]" [defaultValue]="['a']" />
      `,
    })
    class Host {}
    const { settle } = await render(Host);
    expect(triggerOf().querySelector('b')!.textContent).toBe('●');
    triggerOf().click();
    await settle();
    expect(option('Banana').textContent).toContain('◆');
  });

  it('puts native attributes on the trigger, not on its host', async () => {
    @Component({
      imports: [PixelMultiSelect],
      template: `<pxl-multi-select id="fruits" name="fruits" label="Fruits" aria-describedby="help" error="Too many" [options]="options" />`,
    })
    class Host {
      readonly options = OPTIONS;
    }
    await render(Host);
    const host = document.querySelector('pxl-multi-select')!;
    for (const name of ['id', 'name', 'aria-describedby']) expect(host.hasAttribute(name)).toBe(false);
    expect(triggerOf().id).toBe('fruits');
    expect(triggerOf().getAttribute('aria-describedby')).toBe('help fruits-msg');
    expect(triggerOf().getAttribute('aria-invalid')).toBe('true');
  });
});
