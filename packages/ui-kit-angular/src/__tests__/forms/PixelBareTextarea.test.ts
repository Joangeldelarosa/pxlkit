/**
 * PixelBareTextarea as an Angular form control, a two-way binding and an
 * uncontrolled textarea.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelBareTextarea } from '../../public-api';

const textareaOf = (root: HTMLElement) => root.querySelector('textarea') as HTMLTextAreaElement;

function type(textarea: HTMLTextAreaElement, value: string): void {
  textarea.value = value;
  textarea.dispatchEvent(new Event('input'));
}

describe('PixelBareTextarea', () => {
  it('works with a reactive form control, including disabling, touched and reset', async () => {
    @Component({
      imports: [PixelBareTextarea, ReactiveFormsModule],
      template: '<textarea pxlBareTextarea aria-label="Notes" [formControl]="control"></textarea>',
    })
    class Host {
      readonly control = new FormControl('first');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const textarea = textareaOf(fixture.nativeElement);
    expect(textarea.value).toBe('first');
    type(textarea, 'second');
    expect(fixture.componentInstance.control.value).toBe('second');
    textarea.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);

    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(textarea.value).toBe('');
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(textarea.disabled).toBe(true);
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelBareTextarea, FormsModule],
      template: '<textarea pxlBareTextarea aria-label="Notes" [(ngModel)]="value"></textarea>',
    })
    class Host {
      value = '';
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    type(textareaOf(fixture.nativeElement), 'pixel art');
    expect(fixture.componentInstance.value).toBe('pixel art');
  });

  it('follows a two-way bound signal and starts from defaultValue otherwise', async () => {
    @Component({
      imports: [PixelBareTextarea],
      template: `
        <textarea pxlBareTextarea aria-label="Bound" [(value)]="value"></textarea>
        <textarea pxlBareTextarea aria-label="Free" defaultValue="draft"></textarea>
      `,
    })
    class Host {
      readonly value = signal('a');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [bound, free] = Array.from(fixture.nativeElement.querySelectorAll('textarea')) as HTMLTextAreaElement[];
    type(bound!, 'ab');
    expect(fixture.componentInstance.value()).toBe('ab');
    fixture.componentInstance.value.set('reset');
    await fixture.whenStable();
    expect(bound!.value).toBe('reset');
    expect(free!.value).toBe('draft');
  });
});
