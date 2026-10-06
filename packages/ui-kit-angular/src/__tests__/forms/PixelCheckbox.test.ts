/**
 * PixelCheckbox as an Angular form control, a two-way binding and an
 * uncontrolled checkbox.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelCheckbox } from '../../public-api';

const checkboxOf = (root: HTMLElement) => root.querySelector('[role="checkbox"]') as HTMLButtonElement;

describe('PixelCheckbox', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelCheckbox, ReactiveFormsModule],
      template: '<pxl-checkbox label="Accept" [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl(true);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = checkboxOf(fixture.nativeElement);
    expect(button.getAttribute('aria-checked')).toBe('true');
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe(false);
    button.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);

    fixture.componentInstance.control.setValue(true);
    await fixture.whenStable();
    expect(button.getAttribute('aria-checked')).toBe('true');
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.className).toContain('opacity-50');
    button.dispatchEvent(new MouseEvent('click'));
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelCheckbox, FormsModule],
      template: '<pxl-checkbox label="Accept" [(ngModel)]="value" />',
    })
    class Host {
      value = false;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    checkboxOf(fixture.nativeElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe(true);
  });

  it('starts from defaultChecked when uncontrolled, reports changes and submits while checked', async () => {
    @Component({
      imports: [PixelCheckbox],
      template: `<pxl-checkbox label="News" name="news" value="yes" defaultChecked (checkedChange)="changes.push($event)" />`,
    })
    class Host {
      readonly changes: Array<boolean | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect((root.querySelector('input[type="hidden"]') as HTMLInputElement).value).toBe('yes');
    checkboxOf(root).click();
    await fixture.whenStable();
    expect(checkboxOf(root).getAttribute('aria-checked')).toBe('false');
    expect(root.querySelector('input[type="hidden"]')).toBeNull();
    expect(fixture.componentInstance.changes).toEqual([false]);
  });

  it('follows a two-way bound signal and keeps its id off the host', async () => {
    @Component({
      imports: [PixelCheckbox],
      template: '<pxl-checkbox label="Accept" id="accept" required [(checked)]="on" />',
    })
    class Host {
      readonly on = signal(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('pxl-checkbox') as HTMLElement;
    const button = checkboxOf(fixture.nativeElement);
    expect(host.hasAttribute('id')).toBe(false);
    expect(host.hasAttribute('required')).toBe(false);
    expect(button.id).toBe('accept');
    expect(button.getAttribute('aria-required')).toBe('true');
    fixture.componentInstance.on.set(true);
    await fixture.whenStable();
    expect(button.getAttribute('aria-checked')).toBe('true');
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.on()).toBe(false);
  });

  it('draws keyboard focus on its box: inside the cut corners on the pixel surface, a ring in its tone on the linear one', async () => {
    @Component({
      imports: [PixelCheckbox],
      template: '<pxl-checkbox label="Pixel" tone="red" surface="pixel" /><pxl-checkbox label="Linear" tone="red" surface="linear" />',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [pixel, linear] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[role="checkbox"] > span:first-child'), (box) =>
      Array.from(box.classList),
    );
    expect(pixel).toContain('group-focus-visible:pxl-focus-inset');
    expect(pixel!.filter((c) => c.includes('ring'))).toEqual([]);
    expect(linear).toEqual(expect.arrayContaining(['group-focus-visible:ring-2', 'group-focus-visible:ring-retro-red/40']));
  });
});
