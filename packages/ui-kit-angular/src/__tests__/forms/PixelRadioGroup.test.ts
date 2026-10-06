/**
 * PixelRadioGroup as an Angular form control, a two-way binding and an
 * uncontrolled group.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelRadioGroup } from '../../public-api';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
];
const radiosOf = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
const checkedOf = (root: HTMLElement) => radiosOf(root).map((radio) => radio.getAttribute('aria-checked'));

describe('PixelRadioGroup', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelRadioGroup, ReactiveFormsModule],
      template: '<fieldset pxlRadioGroup label="Pick" [options]="options" [formControl]="control"></fieldset>',
    })
    class Host {
      readonly options = OPTIONS;
      readonly control = new FormControl('a');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(checkedOf(root)).toEqual(['true', 'false', 'false']);
    radiosOf(root)[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('b');
    radiosOf(root)[1]!.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);

    fixture.componentInstance.control.setValue('c');
    await fixture.whenStable();
    expect(checkedOf(root)).toEqual(['false', 'false', 'true']);
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(radiosOf(root).every((radio) => radio.disabled)).toBe(true);
    expect(root.querySelector('fieldset')!.getAttribute('aria-disabled')).toBe('true');
    radiosOf(root)[0]!.dispatchEvent(new MouseEvent('click'));
    expect(fixture.componentInstance.control.value).toBe('c');
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelRadioGroup, FormsModule],
      template: '<fieldset pxlRadioGroup label="Pick" [options]="options" [(ngModel)]="value"></fieldset>',
    })
    class Host {
      readonly options = OPTIONS;
      value = 'a';
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    radiosOf(fixture.nativeElement)[2]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe('c');
  });

  it('follows a two-way bound signal, or keeps its own selection, and submits it when named', async () => {
    @Component({
      imports: [PixelRadioGroup],
      template: `
        <fieldset id="bound" pxlRadioGroup label="Bound" name="bound" [options]="options" [(value)]="value"></fieldset>
        <fieldset id="free" pxlRadioGroup label="Free" [options]="options" (valueChange)="changes.push($event)"></fieldset>
      `,
    })
    class Host {
      readonly options = OPTIONS;
      readonly value = signal<string | undefined>('b');
      readonly changes: Array<string | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const bound = fixture.nativeElement.querySelector('#bound') as HTMLElement;
    const free = fixture.nativeElement.querySelector('#free') as HTMLElement;
    expect((bound.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('b');
    radiosOf(bound)[0]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('a');
    expect((bound.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('a');
    expect(checkedOf(free)).toEqual(['false', 'false', 'false']);
    radiosOf(free)[2]!.click();
    await fixture.whenStable();
    expect(checkedOf(free)).toEqual(['false', 'false', 'true']);
    expect(fixture.componentInstance.changes).toEqual(['c']);
  });

  it('is the radiogroup fieldset itself, without native form attributes', async () => {
    @Component({
      imports: [PixelRadioGroup],
      template: `<fieldset pxlRadioGroup label="Plan" name="plan" disabled required [options]="options"></fieldset>`,
    })
    class Host {
      readonly options = OPTIONS;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const fieldset = fixture.nativeElement.querySelector('fieldset') as HTMLFieldSetElement;
    expect(fieldset.getAttribute('role')).toBe('radiogroup');
    expect(fieldset.getAttribute('aria-required')).toBe('true');
    expect(fieldset.querySelector('legend')!.textContent).toBe('Plan');
    for (const name of ['name', 'disabled', 'required']) expect(fieldset.hasAttribute(name)).toBe(false);
    expect(radiosOf(fixture.nativeElement).every((radio) => radio.disabled)).toBe(true);
  });

  it("draws a radio's keyboard focus on its indicator: inside it on the pixel surface, a ring in the tone on the linear one", async () => {
    @Component({
      imports: [PixelRadioGroup],
      template: `
        <fieldset pxlRadioGroup label="Pixel" tone="gold" surface="pixel" [options]="options"></fieldset>
        <fieldset pxlRadioGroup label="Linear" tone="gold" surface="linear" [options]="options"></fieldset>
      `,
    })
    class Host {
      readonly options = OPTIONS;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const indicators = radiosOf(fixture.nativeElement).map((radio) => Array.from(radio.firstElementChild!.classList));
    for (const pixel of indicators.slice(0, 3)) expect(pixel).toContain('group-focus-visible:pxl-focus-inset');
    for (const linear of indicators.slice(3)) {
      expect(linear).toEqual(expect.arrayContaining(['group-focus-visible:ring-2', 'group-focus-visible:ring-retro-gold/40']));
    }
  });
});
