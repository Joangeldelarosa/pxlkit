/**
 * PixelBareButton: the `type` default and override, classes and attributes
 * left to the consumer, and native clicks.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelBareButton } from '../../public-api';

describe('PixelBareButton', () => {
  it('defaults the type to button and adds no classes', async () => {
    @Component({ imports: [PixelBareButton], template: '<button pxlBareButton>Go</button>' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.type).toBe('button');
    expect(button.getAttribute('class')).toBeNull();
    expect(button.textContent).toBe('Go');
  });

  it('takes another type, static or bound, and falls back to button when unset', async () => {
    @Component({
      imports: [PixelBareButton],
      template: `
        <button pxlBareButton type="submit">Send</button>
        <button pxlBareButton [type]="type">Bound</button>
      `,
    })
    class Host {
      type: 'reset' | undefined = 'reset';
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [submit, bound] = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(submit!.type).toBe('submit');
    expect(bound!.type).toBe('reset');
    fixture.componentInstance.type = undefined;
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(bound!.type).toBe('button');
  });

  it('keeps the consumer classes and attributes, and emits native clicks', async () => {
    const clicked = vi.fn();
    @Component({
      imports: [PixelBareButton],
      template: '<button pxlBareButton class="own" aria-label="Close" disabled (click)="clicked()">x</button>',
    })
    class Host {
      readonly clicked = clicked;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.className).toBe('own');
    expect(button.getAttribute('aria-label')).toBe('Close');
    expect(button.disabled).toBe(true);
    button.disabled = false;
    button.click();
    expect(clicked).toHaveBeenCalledTimes(1);
  });
});
