/**
 * PixelSegmented as an Angular form control, a two-way binding and an
 * uncontrolled control; its group name and hidden input.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelSegmented } from '../../public-api';

const OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];
const buttonsOf = (root: Element) => Array.from(root.querySelectorAll<HTMLButtonElement>('button'));
const pressedOf = (root: Element) => buttonsOf(root).map((button) => button.getAttribute('aria-pressed'));

describe('PixelSegmented', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelSegmented, ReactiveFormsModule],
      template: '<pxl-segmented label="Range" [options]="options" [formControl]="control" />',
    })
    class Host {
      readonly options = OPTIONS;
      readonly control = new FormControl('day');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    buttonsOf(root)[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('week');
    expect(pressedOf(root)).toEqual(['false', 'true', 'false']);
    buttonsOf(root)[1]!.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(buttonsOf(root).every((button) => button.disabled)).toBe(true);
    expect(root.querySelector('pxl-segmented')!.classList).toContain('opacity-50');
    buttonsOf(root)[2]!.dispatchEvent(new MouseEvent('click'));
    expect(fixture.componentInstance.control.value).toBe('week');
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelSegmented, FormsModule],
      template: '<pxl-segmented [options]="options" [(ngModel)]="value" />',
    })
    class Host {
      readonly options = OPTIONS;
      value = 'day';
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    buttonsOf(fixture.nativeElement)[2]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe('month');
  });

  it('follows a two-way bound signal, or keeps its own selection, and submits it when named', async () => {
    @Component({
      imports: [PixelSegmented],
      template: `
        <pxl-segmented id="bound" name="range" [options]="options" [(value)]="value" />
        <pxl-segmented id="free" [options]="options" (valueChange)="changes.push($event)" />
      `,
    })
    class Host {
      readonly options = OPTIONS;
      readonly value = signal<string | undefined>('week');
      readonly changes: Array<string | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const bound = fixture.nativeElement.querySelector('#bound') as HTMLElement;
    const free = fixture.nativeElement.querySelector('#free') as HTMLElement;
    expect((bound.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('week');
    buttonsOf(bound)[0]!.click();
    expect(pressedOf(free)).toEqual(['false', 'false', 'false']);
    buttonsOf(free)[2]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('day');
    expect((bound.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('day');
    expect(pressedOf(free)).toEqual(['false', 'false', 'true']);
    expect(fixture.componentInstance.changes).toEqual(['month']);
  });

  it('names the segments, not its host, and keeps form attributes off the host', async () => {
    @Component({
      imports: [PixelSegmented],
      template: `
        <pxl-segmented id="aria" label="" aria-label="Range" name="r" required [options]="options" />
        <pxl-segmented id="caption" label="View" [options]="options" />
        <pxl-segmented id="none" [options]="options" />
      `,
    })
    class Host {
      readonly options = OPTIONS;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    for (const name of ['aria-label', 'name', 'required']) expect(host('aria').hasAttribute(name)).toBe(false);
    expect(host('aria').querySelector('p')).toBeNull();
    expect(host('aria').querySelector('[role="group"]')!.getAttribute('aria-label')).toBe('Range');
    expect(host('caption').querySelector('[role="group"]')!.getAttribute('aria-label')).toBe('View');
    expect(host('none').querySelector('[role="group"]')).toBeNull();
  });
});
