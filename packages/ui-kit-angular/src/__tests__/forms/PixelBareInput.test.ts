/**
 * PixelBareInput as an Angular form control, a two-way binding and an
 * uncontrolled input.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelBareInput } from '../../public-api';

const inputOf = (root: HTMLElement) => root.querySelector('input') as HTMLInputElement;

function type(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('PixelBareInput', () => {
  it('works with a reactive form control, including disabling, touched and reset', async () => {
    @Component({
      imports: [PixelBareInput, ReactiveFormsModule],
      template: '<input pxlBareInput aria-label="Name" [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl('Ada');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = inputOf(fixture.nativeElement);
    expect(input.value).toBe('Ada');
    type(input, 'Grace');
    expect(fixture.componentInstance.control.value).toBe('Grace');
    input.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);

    fixture.componentInstance.control.setValue('Linus');
    await fixture.whenStable();
    expect(input.value).toBe('Linus');
    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(input.value).toBe('');

    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelBareInput, FormsModule],
      template: '<input pxlBareInput aria-label="Name" [(ngModel)]="value" />',
    })
    class Host {
      value = 'start';
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = inputOf(fixture.nativeElement);
    expect(input.value).toBe('start');
    type(input, 'typed');
    expect(fixture.componentInstance.value).toBe('typed');
  });

  it('follows a two-way bound signal', async () => {
    @Component({
      imports: [PixelBareInput],
      template: '<input pxlBareInput aria-label="Name" [(value)]="value" />',
    })
    class Host {
      readonly value = signal('a');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = inputOf(fixture.nativeElement);
    type(input, 'ab');
    expect(fixture.componentInstance.value()).toBe('ab');
    fixture.componentInstance.value.set('reset');
    await fixture.whenStable();
    expect(input.value).toBe('reset');
  });

  it('starts from defaultValue when uncontrolled and reports edits', async () => {
    @Component({
      imports: [PixelBareInput],
      template: `<input pxlBareInput type="number" [defaultValue]="42" (valueChange)="changes.push($event)" />`,
    })
    class Host {
      readonly changes: Array<string | number | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = inputOf(fixture.nativeElement);
    expect(input.value).toBe('42');
    type(input, '43');
    await fixture.whenStable();
    expect(input.value).toBe('43');
    expect(fixture.componentInstance.changes).toEqual(['43']);
  });

  it('keeps the native attributes of its host and a native default without a value', async () => {
    @Component({
      imports: [PixelBareInput],
      template: '<input pxlBareInput type="checkbox" disabled aria-label="Agree" />',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = inputOf(fixture.nativeElement);
    expect(input.value).toBe('on');
    expect(input.disabled).toBe(true);
    expect(input.getAttribute('aria-label')).toBe('Agree');
  });
});
