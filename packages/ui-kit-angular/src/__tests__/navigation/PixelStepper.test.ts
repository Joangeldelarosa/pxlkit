/**
 * <pxl-stepper> beyond the parity examples: `clickable` and `(stepClick)`,
 * which reports steps without moving the active one, the vertical arrow
 * keys, a custom icon, and steps added or removed later.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelStepper, PixelStepperStep } from '../../public-api';

const stepsOf = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('[data-pxl-step]'));
const key = (element: HTMLElement, name: string) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

describe('PixelStepper', () => {
  it("shows a step's label, description and icon only: a step has no content of its own, as in React", async () => {
    @Component({
      imports: [PixelStepper, PixelStepperStep],
      template: `
        <pxl-stepper [active]="0">
          <pxl-stepper-step label="Account">Ignored</pxl-stepper-step>
        </pxl-stepper>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(stepsOf(root)[0]!.textContent).toContain('Account');
    expect(root.textContent).not.toContain('Ignored');
  });

  it('emits (stepClick) for steps up to the active one when clickable, without moving the active step', async () => {
    @Component({
      imports: [PixelStepper, PixelStepperStep],
      template: `
        <pxl-stepper [active]="1" [clickable]="clickable()" (stepClick)="clicks.push($event)">
          <pxl-stepper-step label="One" />
          <pxl-stepper-step label="Two" />
          <pxl-stepper-step label="Three" />
        </pxl-stepper>
      `,
    })
    class Host {
      readonly clickable = signal(false);
      readonly clicks: number[] = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(stepsOf(root).map((step) => step.getAttribute('tabindex'))).toEqual([null, null, null]);
    stepsOf(root)[0]!.click();
    fixture.componentInstance.clickable.set(true);
    await fixture.whenStable();
    expect(stepsOf(root).map((step) => step.getAttribute('tabindex'))).toEqual(['0', '0', null]);
    expect(stepsOf(root).map((step) => step.getAttribute('role'))).toEqual(['button', 'button', null]);
    stepsOf(root)[0]!.click();
    stepsOf(root)[2]!.click();
    key(stepsOf(root)[1]!, 'Enter');
    expect(fixture.componentInstance.clicks).toEqual([0, 1]);
    expect(stepsOf(root)[1]!.getAttribute('aria-current')).toBe('step');
  });

  it('moves focus with the up and down arrows when vertical', async () => {
    @Component({
      imports: [PixelStepper, PixelStepperStep],
      template: `
        <pxl-stepper [active]="2" orientation="vertical" clickable>
          <pxl-stepper-step label="One" />
          <pxl-stepper-step label="Two" />
          <pxl-stepper-step label="Three" />
        </pxl-stepper>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [first, second] = stepsOf(fixture.nativeElement as HTMLElement);
    first!.focus();
    key(first!, 'ArrowRight');
    expect(document.activeElement).toBe(first);
    key(first!, 'ArrowDown');
    expect(document.activeElement).toBe(second);
    key(second!, 'ArrowUp');
    expect(document.activeElement).toBe(first);
  });

  it('shows a custom icon until the step is completed', async () => {
    @Component({
      imports: [PixelStepper, PixelStepperStep],
      template: `
        <pxl-stepper [active]="0">
          <pxl-stepper-step label="Custom" [icon]="star" [completed]="done()" />
        </pxl-stepper>
        <ng-template #star><i>★</i></ng-template>
      `,
    })
    class Host {
      readonly done = signal(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-pxl-step-icon="custom"]')!.textContent!.trim()).toBe('★');
    fixture.componentInstance.done.set(true);
    await fixture.whenStable();
    expect(root.querySelector('[data-pxl-step-icon="custom"]')).toBeNull();
    expect(root.querySelector('[data-pxl-step-icon="check"]')).not.toBeNull();
  });

  it('renumbers the steps and their connectors as steps come and go', async () => {
    @Component({
      imports: [PixelStepper, PixelStepperStep],
      template: `
        <pxl-stepper [active]="0">
          @for (label of labels(); track label) {
            <pxl-stepper-step [label]="label" />
          }
        </pxl-stepper>
      `,
    })
    class Host {
      readonly labels = signal(['One', 'Two']);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    fixture.componentInstance.labels.set(['One', 'Two', 'Three']);
    await fixture.whenStable();
    // Not clickable: the position and state are visually hidden text, not a name.
    const hiddenText = (step: HTMLElement) => Array.from(step.querySelectorAll('.sr-only'), (text) => text.textContent);
    expect(stepsOf(root).map(hiddenText)).toEqual([
      ['Step 1 of 3: ', ' (current)'],
      ['Step 2 of 3: '],
      ['Step 3 of 3: '],
    ]);
    expect(root.querySelectorAll('hr')).toHaveLength(2);
  });
});
