/**
 * PixelOTPInput: two-way binding, Angular forms, the `complete` output,
 * pasting (which the parity scenarios cannot drive) and autofocus.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { reactExamples } from '../../../../../scripts/parity/catalog';
import { canonicalPage } from '../../../../../scripts/parity/canonical';
import { useRealTime, useSimulatedTime } from '../../../../../scripts/parity/clock';
import { mountReact, type Mounted } from '../../../../../scripts/parity/react';
import { PixelOTPInput } from '../../public-api';
import { mountAngular } from '../angular';
import { angularDomRules } from '../dom-rules';
import { angularExamples } from '../examples';

const cellsOf = (root: ParentNode) => Array.from(root.querySelectorAll<HTMLInputElement>('input[data-pxl-otp-cell]'));

function type(cell: HTMLInputElement, text: string): void {
  cell.value = text;
  cell.dispatchEvent(new Event('input', { bubbles: true }));
}

/** A paste of `text`, built by hand: jsdom has no ClipboardEvent. */
function paste(text: string): Event {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', { value: { getData: (kind: string) => (kind === 'text' ? text : '') } });
  return event;
}

afterEach(() => {
  useRealTime();
});

describe('PixelOTPInput', () => {
  it('follows a two-way bound code, moving on as it is typed', async () => {
    @Component({
      imports: [PixelOTPInput],
      template: '<pxl-otp-input [length]="4" [(value)]="code" />',
    })
    class Host {
      readonly code = signal('');
    }
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const cells = cellsOf(fixture.nativeElement);
    cells[0]!.focus();
    type(cells[0]!, '7');
    await fixture.whenStable();
    expect(fixture.componentInstance.code()).toBe('7');
    expect(document.activeElement).toBe(cells[1]);
    // A letter is turned away, and the cell shows nothing.
    type(cells[1]!, 'x');
    await fixture.whenStable();
    expect([cells[1]!.value, fixture.componentInstance.code()]).toEqual(['', '7']);
    fixture.componentInstance.code.set('1234');
    await fixture.whenStable();
    expect(cells.map((cell) => cell.value)).toEqual(['1', '2', '3', '4']);
  });

  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelOTPInput, ReactiveFormsModule],
      template: '<pxl-otp-input name="otp" [length]="3" [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl('12');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const { control } = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const cells = cellsOf(root);
    cells[2]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(control.value).toBe('1');
    cells[0]!.dispatchEvent(new FocusEvent('blur'));
    expect(control.touched).toBe(true);
    control.setValue('987');
    await fixture.whenStable();
    expect(root.querySelector<HTMLInputElement>('input[type="hidden"]')!.value).toBe('987');
    expect(root.querySelector('pxl-otp-input')!.hasAttribute('name')).toBe(false);
    control.disable();
    await fixture.whenStable();
    expect(cells.every((cell) => cell.disabled)).toBe(true);
  });

  it('works with ngModel, and reports each code that fills every cell', async () => {
    @Component({
      imports: [PixelOTPInput, FormsModule],
      template: '<pxl-otp-input [length]="2" [(ngModel)]="code" (complete)="completed.push($event)" />',
    })
    class Host {
      code = '4';
      readonly completed: string[] = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const cells = cellsOf(fixture.nativeElement);
    type(cells[1]!, '2');
    await fixture.whenStable();
    expect(fixture.componentInstance.code).toBe('42');
    expect(fixture.componentInstance.completed).toEqual(['42']);
    cells[1]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    type(cells[1]!, '7');
    await fixture.whenStable();
    expect(fixture.componentInstance.completed).toEqual(['42', '47']);
  });

  it('fills the cells from the one pasted into, then focuses the cell after the code', async () => {
    useSimulatedTime();
    @Component({
      imports: [PixelOTPInput],
      template: '<pxl-otp-input defaultValue="9" (valueChange)="changes.push($event)" />',
    })
    class Host {
      readonly changes: Array<string | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const cells = cellsOf(fixture.nativeElement);
    cells[1]!.focus();
    const event = paste('12-34a');
    cells[1]!.dispatchEvent(event);
    fixture.detectChanges();
    expect(event.defaultPrevented).toBe(true);
    expect(cells.map((cell) => cell.value)).toEqual(['9', '1', '2', '3', '4', '']);
    expect(document.activeElement).toBe(cells[1]);
    await vi.advanceTimersByTimeAsync(16);
    expect(document.activeElement).toBe(cells[5]);
    cells[0]!.dispatchEvent(paste('abc'));
    expect(fixture.componentInstance.changes).toEqual(['91234']);
  });

  it('focuses its first cell when asked to, and shows a separator between cells', async () => {
    @Component({
      imports: [PixelOTPInput],
      template: `
        <pxl-otp-input [length]="3" autoFocus [separator]="dot" variant="alphanumeric" mask />
        <ng-template #dot><i>·</i></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const cells = cellsOf(root);
    expect(document.activeElement).toBe(cells[0]);
    expect([cells[0]!.type, cells[0]!.inputMode, cells[0]!.pattern]).toEqual(['password', 'text', '[0-9a-zA-Z]*']);
    const separators = root.querySelectorAll('span[aria-hidden="true"]');
    expect(separators).toHaveLength(2);
    expect(separators[0]!.innerHTML).toContain('<i>·</i>');
    const group = root.querySelector('pxl-otp-input')!;
    expect([group.getAttribute('role'), group.getAttribute('aria-label')]).toEqual(['group', 'One-time passcode']);
  });

  it('renders what React renders once a code is pasted', async () => {
    const reference = reactExamples().find((e) => e.component === 'PixelOTPInput' && e.exportName === 'WithSeparator')!;
    const snapshot = (rules = {}) =>
      canonicalPage(document, { ...rules, unwrap: (element) => element.hasAttribute('data-parity-root') });
    const pasteCode = async ({ container, flush }: Mounted, rules = {}) => {
      const cells = cellsOf(container);
      cells[2]!.focus();
      cells[2]!.dispatchEvent(paste('1 2 3 4 5 6'));
      await flush();
      const pasted = snapshot(rules);
      await vi.advanceTimersByTimeAsync(16);
      await flush();
      return [pasted, snapshot(rules)];
    };
    useSimulatedTime();
    const react = await mountReact(reference.Component);
    const expected = await pasteCode(react);
    await react.unmount();
    // The examples file is named for the docs (`pixel-otpinput`), which the registry may not capitalise as React does.
    const example = [...angularExamples.values()].find(
      (candidate) => candidate.component.toLowerCase() === 'pixelotpinput' && candidate.exportName === 'WithSeparator',
    )!;
    const angular = await mountAngular(await example.load());
    const actual = await pasteCode(angular, angularDomRules);
    await angular.unmount();
    expect(actual).toEqual(expected);
  });
});
