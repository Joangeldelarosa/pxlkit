/**
 * PixelSwitch as an Angular form control and as an uncontrolled input.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelSwitch } from '../../public-api';

const switchOf = (root: HTMLElement) => root.querySelector('[role="switch"]') as HTMLButtonElement;

describe('PixelSwitch', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelSwitch, ReactiveFormsModule],
      template: '<pxl-switch label="Notify" [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl(true);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = switchOf(fixture.nativeElement);
    expect(button.getAttribute('aria-checked')).toBe('true');
    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe(false);
    expect(button.getAttribute('aria-checked')).toBe('false');
    button.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);

    fixture.componentInstance.control.setValue(true);
    await fixture.whenStable();
    expect(button.getAttribute('aria-checked')).toBe('true');

    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
    button.click();
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelSwitch, FormsModule],
      template: '<pxl-switch label="Notify" [(ngModel)]="value" />',
    })
    class Host {
      value = false;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    switchOf(fixture.nativeElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe(true);
  });

  it('starts from defaultChecked when uncontrolled and reports changes', async () => {
    @Component({
      imports: [PixelSwitch],
      template: '<pxl-switch label="Notify" defaultChecked (checkedChange)="changes.push($event)" />',
    })
    class Host {
      readonly changes: boolean[] = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = switchOf(fixture.nativeElement);
    expect(button.getAttribute('aria-checked')).toBe('true');
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-checked')).toBe('false');
    expect(fixture.componentInstance.changes).toEqual([false]);
  });

  it('follows a two-way bound signal', async () => {
    @Component({
      imports: [PixelSwitch],
      template: '<pxl-switch label="Notify" id="notify" [(checked)]="on" />',
    })
    class Host {
      readonly on = signal(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('pxl-switch') as HTMLElement;
    expect(host.hasAttribute('id')).toBe(false);
    expect(switchOf(fixture.nativeElement).id).toBe('notify');
    fixture.componentInstance.on.set(true);
    await fixture.whenStable();
    expect(switchOf(fixture.nativeElement).getAttribute('aria-checked')).toBe('true');
    expect(fixture.componentInstance.on()).toBe(true);
  });

  it('rings keyboard focus, keeping an outline for forced-colors mode, which drops the ring', async () => {
    @Component({ imports: [PixelSwitch], template: '<pxl-switch label="Sound" />' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const classes = Array.from(switchOf(fixture.nativeElement).classList);
    expect(classes).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:outline-hidden']));
    expect(classes.filter((c) => c.endsWith('outline-none'))).toEqual([]);
  });
});
