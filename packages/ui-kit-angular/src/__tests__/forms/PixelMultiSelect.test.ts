/**
 * <pxl-multi-select> as an Angular form control, a two-way binding and an
 * uncontrolled multi-select; its cap, chip, keyboard and clear removal, the
 * field's controls and where focus goes, option icons and native attributes.
 * Rendering and the shared interactions are covered against React by the
 * parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { getFocusableElements } from '@pxlkit/ui-kit-core';
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
const button = (name: string) => document.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;
// The field holds the chips and the combobox, then the clear button.
const fieldOf = (combobox: Element) => combobox.parentElement!.parentElement!;
// Enter on a focused button, which the browser follows with a click.
const pressEnter = (element: HTMLElement) => {
  element.focus();
  key(element, 'Enter');
  element.click();
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
    expect(button('Remove Apple').parentElement!.querySelector('b')!.textContent).toBe('●');
    expect(triggerOf().querySelector('b')).toBeNull();
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

  it("holds each chip's remove button, the combobox and the clear button side by side, in that tab order", async () => {
    @Component({
      imports: [PixelMultiSelect],
      template: `<pxl-multi-select clearable [options]="options" [defaultValue]="['a', 'b']" />`,
    })
    class Host {
      readonly options = OPTIONS;
    }
    await render(Host);
    const controls = [button('Remove Apple'), button('Remove Banana'), triggerOf(), button('Clear selection')];
    expect(getFocusableElements(fieldOf(triggerOf()))).toEqual(controls);
    for (const control of controls) expect(control.type).toBe('button');
    expect(triggerOf().querySelector('button, [role="button"], [tabindex]')).toBeNull();
    expect(triggerOf().textContent!.trim()).toBe('Apple, Banana');
    expect(triggerOf().getAttribute('aria-expanded')).toBe('false');
    expect(fieldOf(triggerOf()).hasAttribute('aria-expanded')).toBe(false);
  });

  it("removes chips and clears from the keyboard, focus moving to the next chip's button, then to the combobox", async () => {
    @Component({
      imports: [PixelMultiSelect],
      template: `<pxl-multi-select clearable [options]="options" [(value)]="value" />`,
    })
    class Host {
      readonly options = OPTIONS;
      readonly value = signal<string[] | undefined>(['a', 'b']);
    }
    const { host, settle } = await render(Host);
    pressEnter(button('Remove Apple'));
    await settle();
    expect(host.value()).toEqual(['b']);
    expect(document.activeElement).toBe(button('Remove Banana'));
    pressEnter(button('Remove Banana'));
    await settle();
    expect(host.value()).toEqual([]);
    expect(document.activeElement).toBe(triggerOf());
    host.value.set(['c']);
    await settle();
    pressEnter(button('Clear selection'));
    await settle();
    expect(host.value()).toEqual([]);
    expect(document.activeElement).toBe(triggerOf());
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it('removes a chip and clears under the pointer, leaving focus and the open listbox as they are', async () => {
    @Component({
      imports: [PixelMultiSelect],
      template: `<pxl-multi-select clearable searchable [options]="options" [(value)]="value" />`,
    })
    class Host {
      readonly options = OPTIONS;
      readonly value = signal<string[] | undefined>(['a', 'b']);
    }
    const { host, settle } = await render(Host);
    triggerOf().click();
    await settle();
    const search = document.querySelector<HTMLInputElement>('[role="searchbox"]')!;
    expect(document.activeElement).toBe(search);
    for (const name of ['Remove Banana', 'Clear selection']) {
      const target = button(name);
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      expect(target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))).toBe(false);
      target.click();
      await settle();
      expect(document.activeElement).toBe(search);
      expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    }
    expect(host.value()).toEqual([]);
  });

  it('opens and closes the listbox from a press anywhere on the field, focusing the combobox', async () => {
    @Component({
      imports: [PixelMultiSelect],
      template: `<pxl-multi-select [options]="options" [defaultValue]="['a']" />`,
    })
    class Host {
      readonly options = OPTIONS;
    }
    const { settle } = await render(Host);
    fieldOf(triggerOf()).click();
    await settle();
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    expect(document.activeElement).toBe(triggerOf());
    expect(triggerOf().getAttribute('aria-expanded')).toBe('true');
    // A press on the field, a chip's label here, is not one outside the popover.
    const chipLabel = button('Remove Apple').previousElementSibling as HTMLElement;
    chipLabel.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle();
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    chipLabel.click();
    await settle();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it('hands focus back to the combobox when Escape closes the listbox from the search field', async () => {
    @Component({
      imports: [PixelMultiSelect],
      template: `<pxl-multi-select searchable [options]="options" />`,
    })
    class Host {
      readonly options = OPTIONS;
    }
    const { settle } = await render(Host);
    triggerOf().click();
    await settle();
    key(document.querySelector('[role="searchbox"]')!, 'Escape');
    await settle();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(document.activeElement).toBe(triggerOf());
  });

  it('disables the whole field with the form control', async () => {
    @Component({
      imports: [PixelMultiSelect, ReactiveFormsModule],
      template: `<pxl-multi-select clearable [options]="options" [formControl]="control" />`,
    })
    class Host {
      readonly options = OPTIONS;
      readonly control = new FormControl(['a']);
    }
    const { host, settle } = await render(Host);
    host.control.disable();
    await settle();
    expect([triggerOf(), button('Remove Apple'), button('Clear selection')].map((control) => control.disabled)).toEqual([true, true, true]);
    fieldOf(triggerOf()).click();
    await settle();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(document.activeElement).not.toBe(triggerOf());
  });

  it("shows the combobox's keyboard focus on the field: inside its cut corners on the pixel surface, a ring on the linear one", async () => {
    @Component({
      imports: [PixelMultiSelect],
      template: `
        <pxl-multi-select label="Pixel" surface="pixel" [options]="options" />
        <pxl-multi-select label="Linear" surface="linear" [options]="options" />
      `,
    })
    class Host {
      readonly options = OPTIONS;
    }
    await render(Host);
    const [pixel, linear] = Array.from(document.querySelectorAll('[role="combobox"]'), (combobox) => Array.from(fieldOf(combobox).classList));
    expect(pixel).toEqual(expect.arrayContaining(['pxl-corner-sm', 'has-[[role=combobox]:focus-visible]:pxl-focus-inset']));
    expect(pixel!.filter((c) => c.includes('ring'))).toEqual([]);
    expect(linear).toEqual(expect.arrayContaining(['has-[[role=combobox]:focus-visible]:ring-2']));
  });
});
