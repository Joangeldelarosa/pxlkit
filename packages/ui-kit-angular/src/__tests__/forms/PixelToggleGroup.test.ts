/**
 * PixelToggleGroup: two-way bindings in single and multiple mode, Angular
 * forms, uncontrolled use, the row's role and name, and the shared tab stop.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelToggle, PixelToggleGroup } from '../../public-api';

const buttonsOf = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>('button'));
const keydown = (element: HTMLElement, key: string) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('PixelToggleGroup', () => {
  it('follows a two-way bound value, and unsets it when the pressed toggle is pressed again', async () => {
    @Component({
      imports: [PixelToggle, PixelToggleGroup],
      template: `
        <pxl-toggle-group [(value)]="value">
          <button pxlToggle value="a">A</button>
          <button pxlToggle value="b">B</button>
        </pxl-toggle-group>
      `,
    })
    class Host {
      readonly value = signal('a');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [a, b] = buttonsOf(fixture.nativeElement);
    expect(a!.getAttribute('role')).toBe('radio');
    b!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('b');
    expect([a!.getAttribute('aria-checked'), b!.getAttribute('aria-checked')]).toEqual(['false', 'true']);
    b!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('');
    fixture.componentInstance.value.set('a');
    await fixture.whenStable();
    expect(a!.getAttribute('aria-checked')).toBe('true');
  });

  it('presses any number of toggles in multiple mode', async () => {
    @Component({
      imports: [PixelToggle, PixelToggleGroup],
      template: `
        <pxl-toggle-group type="multiple" [(value)]="value">
          <button pxlToggle value="bold">Bold</button>
          <button pxlToggle value="italic">Italic</button>
        </pxl-toggle-group>
      `,
    })
    class Host {
      readonly value = signal(['bold']);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [bold, italic] = buttonsOf(fixture.nativeElement);
    expect(bold!.getAttribute('aria-pressed')).toBe('true');
    expect(bold!.hasAttribute('role')).toBe(false);
    italic!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual(['bold', 'italic']);
    bold!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual(['italic']);
  });

  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelToggle, PixelToggleGroup, ReactiveFormsModule],
      template: `
        <pxl-toggle-group [formControl]="control">
          <button pxlToggle value="a">A</button>
          <button pxlToggle value="b" disabled>B</button>
          <button pxlToggle value="c">C</button>
        </pxl-toggle-group>
      `,
    })
    class Host {
      readonly control = new FormControl('a');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const { control } = fixture.componentInstance;
    const [a, b, c] = buttonsOf(fixture.nativeElement);
    c!.click();
    await fixture.whenStable();
    expect(control.value).toBe('c');
    c!.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(control.touched).toBe(true);
    control.setValue('a');
    await fixture.whenStable();
    expect(a!.getAttribute('aria-checked')).toBe('true');

    control.disable();
    await fixture.whenStable();
    expect([a!.disabled, b!.disabled, c!.disabled]).toEqual([true, true, true]);
    c!.dispatchEvent(new MouseEvent('click'));
    expect(control.value).toBe('a');
    control.enable();
    await fixture.whenStable();
    // The toggle disabled of its own stays disabled.
    expect([a!.disabled, b!.disabled, c!.disabled]).toEqual([false, true, false]);
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelToggle, PixelToggleGroup, FormsModule],
      template: `
        <pxl-toggle-group type="multiple" [(ngModel)]="value">
          <button pxlToggle value="a">A</button>
          <button pxlToggle value="b">B</button>
        </pxl-toggle-group>
      `,
    })
    class Host {
      value = ['a'];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    buttonsOf(fixture.nativeElement)[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toEqual(['a', 'b']);
  });

  it('keeps its own value from defaultValue while uncontrolled, and reports changes', async () => {
    @Component({
      imports: [PixelToggle, PixelToggleGroup],
      template: `
        <pxl-toggle-group defaultValue="b" (valueChange)="changes.push($event)">
          <button pxlToggle value="a">A</button>
          <button pxlToggle value="b">B</button>
        </pxl-toggle-group>
      `,
    })
    class Host {
      readonly changes: unknown[] = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [a, b] = buttonsOf(fixture.nativeElement);
    expect(b!.getAttribute('aria-checked')).toBe('true');
    a!.click();
    await fixture.whenStable();
    expect(a!.getAttribute('aria-checked')).toBe('true');
    expect(fixture.componentInstance.changes).toEqual(['a']);
  });

  it('is a radiogroup in single mode, and a group in multiple mode only with a name', async () => {
    @Component({
      imports: [PixelToggleGroup],
      template: `
        <pxl-toggle-group id="single" />
        <pxl-toggle-group id="unnamed" type="multiple" />
        <pxl-toggle-group id="named" type="multiple" [aria-label]="name()" class="mine" />
        <pxl-toggle-group id="labelled" type="multiple" aria-labelledby="caption" />
      `,
    })
    class Host {
      readonly name = signal('Formatting');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const group = (id: string) => root.querySelector(`#${id}`)!;
    expect(group('single').getAttribute('role')).toBe('radiogroup');
    expect(group('unnamed').hasAttribute('role')).toBe(false);
    expect(group('named').getAttribute('role')).toBe('group');
    expect(group('named').getAttribute('aria-label')).toBe('Formatting');
    expect([...group('named').classList].sort()).toEqual(['gap-1', 'inline-flex', 'items-center', 'mine']);
    expect(group('labelled').getAttribute('role')).toBe('group');
    fixture.componentInstance.name.set('');
    await fixture.whenStable();
    // An empty name names nothing: the group role goes, as in React.
    expect(group('named').hasAttribute('role')).toBe(false);
  });

  it('moves a single tab stop with the arrow keys, and hands it on when its toggle goes', async () => {
    @Component({
      imports: [PixelToggle, PixelToggleGroup],
      template: `
        <pxl-toggle-group rovingFocus>
          @for (value of shown(); track value) {
            <button pxlToggle [value]="value">{{ value }}</button>
          }
        </pxl-toggle-group>
      `,
    })
    class Host {
      readonly shown = signal(['a', 'b', 'c']);
    }
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const tabStops = () => buttonsOf(fixture.nativeElement).map((button) => `${button.textContent}:${button.tabIndex}`);
    expect(tabStops()).toEqual(['a:0', 'b:-1', 'c:-1']);
    const [a] = buttonsOf(fixture.nativeElement);
    a!.focus();
    keydown(a!, 'End');
    await fixture.whenStable();
    expect(tabStops()).toEqual(['a:-1', 'b:-1', 'c:0']);
    expect(document.activeElement?.textContent).toBe('c');
    fixture.componentInstance.shown.set(['a', 'b']);
    await fixture.whenStable();
    expect(tabStops()).toEqual(['a:0', 'b:-1']);
  });
});
