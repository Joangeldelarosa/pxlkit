/**
 * PixelTextarea as an Angular form control, a two-way binding and an
 * uncontrolled textarea; auto-grow, the counter and native attributes.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelTextarea } from '../../public-api';

const textareaOf = (root: HTMLElement) => root.querySelector('textarea') as HTMLTextAreaElement;

function type(textarea: HTMLTextAreaElement, value: string): void {
  textarea.value = value;
  textarea.dispatchEvent(new Event('input'));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PixelTextarea', () => {
  it('works with a reactive form control, including disabling, touched and reset', async () => {
    @Component({
      imports: [PixelTextarea, ReactiveFormsModule],
      template: '<pxl-textarea label="Notes" [formControl]="control" />',
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
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(textarea.disabled).toBe(true);
    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(textarea.value).toBe('');
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelTextarea, FormsModule],
      template: '<pxl-textarea label="Notes" [(ngModel)]="value" />',
    })
    class Host {
      value = 'start';
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const textarea = textareaOf(fixture.nativeElement);
    expect(textarea.value).toBe('start');
    type(textarea, 'pixel art');
    expect(fixture.componentInstance.value).toBe('pixel art');
  });

  it('follows a two-way bound signal and counts against its limit', async () => {
    @Component({
      imports: [PixelTextarea],
      template: '<pxl-textarea [(value)]="value" [showCount]="{ max: 6 }" />',
    })
    class Host {
      readonly value = signal('hello');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const textarea = textareaOf(root);
    expect(textarea.maxLength).toBe(6);
    expect(root.textContent).toContain('5/6');
    type(textarea, 'hello world');
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('hello world');
    expect(root.textContent).toContain('11/6');
    expect(root.querySelector('[aria-live="polite"]')!.classList).toContain('text-retro-red');
  });

  it('grows with its content once rendered and as the value changes', async () => {
    const content = { height: 120 };
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => content.height,
    });
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      lineHeight: '20px',
      paddingTop: '0px',
      paddingBottom: '0px',
    } as CSSStyleDeclaration);
    try {
      @Component({
        imports: [PixelTextarea],
        template: '<pxl-textarea autosize [minRows]="2" [maxRows]="4" defaultValue="a" />',
      })
      class Host {}
      const fixture = TestBed.createComponent(Host);
      await fixture.whenStable();
      const textarea = textareaOf(fixture.nativeElement);
      expect(textarea.rows).toBe(2);
      expect(textarea.style.height).toBe('80px');
      expect(textarea.style.overflowY).toBe('auto');
      content.height = 50;
      type(textarea, 'b');
      await fixture.whenStable();
      expect(textarea.style.height).toBe('50px');
      expect(textarea.style.overflowY).toBe('hidden');
    } finally {
      delete (HTMLTextAreaElement.prototype as { scrollHeight?: number }).scrollHeight;
    }
  });

  it('puts native attributes on the textarea, not on its host', async () => {
    @Component({
      imports: [PixelTextarea],
      template: `
        <pxl-textarea id="bio" name="bio" placeholder="About you" rows="6" minlength="10" required readonly aria-label="Bio" />
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('pxl-textarea') as HTMLElement;
    const textarea = textareaOf(fixture.nativeElement);
    for (const name of ['id', 'name', 'required', 'readonly', 'aria-label']) expect(host.hasAttribute(name)).toBe(false);
    expect(textarea.id).toBe('bio');
    expect(textarea.name).toBe('bio');
    expect(textarea.placeholder).toBe('About you');
    expect(textarea.rows).toBe(6);
    expect(textarea.minLength).toBe(10);
    expect(textarea.required).toBe(true);
    expect(textarea.readOnly).toBe(true);
    expect(textarea.getAttribute('aria-label')).toBe('Bio');
  });
});
