/**
 * PixelToggle standalone (two-way binding, uncontrolled, form control) and
 * inside a toggle group, through the context the group provides.
 */
import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it, vi } from 'vitest';
import { PixelToggle } from '../../public-api';
import { PIXEL_TOGGLE_GROUP, type PixelToggleGroupContext } from '../../lib/forms/toggle-group-context';

const buttonsOf = (root: HTMLElement) => Array.from(root.querySelectorAll('button'));

function groupStub(type: 'single' | 'multiple', pressed: string[]): PixelToggleGroupContext {
  return {
    type: computed(() => type),
    size: computed(() => 'sm' as const),
    variant: computed(() => 'outline' as const),
    surface: computed(() => 'linear' as const),
    rovingFocus: computed(() => true),
    focusedValue: signal<string | null>('b'),
    isPressed: (value) => pressed.includes(value),
    toggle: vi.fn(),
    registerItem: vi.fn(),
    unregisterItem: vi.fn(),
    onItemKeydown: vi.fn(),
  };
}

describe('PixelToggle', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelToggle, ReactiveFormsModule],
      template: '<button pxlToggle value="bold" [formControl]="control">B</button>',
    })
    class Host {
      readonly control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [button] = buttonsOf(fixture.nativeElement);
    button!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe(true);
    expect(button!.getAttribute('aria-pressed')).toBe('true');
    button!.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(button!.disabled).toBe(true);
    button!.dispatchEvent(new MouseEvent('click'));
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it('works with ngModel, a two-way bound signal, or on its own', async () => {
    @Component({
      imports: [PixelToggle, FormsModule],
      template: `
        <button pxlToggle value="a" [(ngModel)]="model">A</button>
        <button pxlToggle value="b" [(pressed)]="bound">B</button>
        <button pxlToggle value="c" (pressedChange)="changes.push($event)">C</button>
      `,
    })
    class Host {
      model = false;
      readonly bound = signal(true);
      readonly changes: Array<boolean | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [a, b, c] = buttonsOf(fixture.nativeElement);
    a!.click();
    b!.click();
    c!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model).toBe(true);
    expect(fixture.componentInstance.bound()).toBe(false);
    expect(c!.getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.changes).toEqual([true]);
  });

  it('is a type=button that keeps its own attributes but no native value', async () => {
    @Component({
      imports: [PixelToggle],
      template: `
        <button pxlToggle value="x" class="mine" tabindex="3" data-testid="tg">X</button>
        <button pxlToggle value="y" type="submit">Y</button>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [x, y] = buttonsOf(fixture.nativeElement);
    expect(x!.getAttribute('type')).toBe('button');
    expect(x!.hasAttribute('value')).toBe(false);
    expect(x!.getAttribute('data-pxl-toggle-value')).toBe('x');
    expect(x!.getAttribute('tabindex')).toBe('3');
    expect(x!.classList).toContain('mine');
    expect(y!.getAttribute('type')).toBe('submit');
  });

  it('is a radio of a single-select group, which owns its state, size, variant, surface and focus', async () => {
    const group = groupStub('single', ['a']);
    @Component({
      imports: [PixelToggle],
      providers: [{ provide: PIXEL_TOGGLE_GROUP, useValue: group }],
      template: '<button pxlToggle value="a">A</button><button pxlToggle value="b">B</button>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [a, b] = buttonsOf(fixture.nativeElement);
    expect(a!.getAttribute('role')).toBe('radio');
    expect(a!.getAttribute('aria-checked')).toBe('true');
    expect(a!.hasAttribute('aria-pressed')).toBe(false);
    expect(a!.getAttribute('tabindex')).toBe('-1');
    expect(b!.getAttribute('aria-checked')).toBe('false');
    expect(b!.getAttribute('tabindex')).toBe('0');
    expect(a!.classList).toContain('h-8');
    expect(a!.classList).toContain('rounded-md');
    expect(group.registerItem).toHaveBeenCalledWith('a', a);
    b!.click();
    expect(group.toggle).toHaveBeenCalledWith('b');
    b!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(group.onItemKeydown).toHaveBeenCalledWith(expect.objectContaining({ key: 'ArrowLeft' }), 'b');
    fixture.destroy();
    expect(group.unregisterItem).toHaveBeenCalledWith('b');
  });

  it('stays a pressed button in a multiple-select group', async () => {
    @Component({
      imports: [PixelToggle],
      providers: [{ provide: PIXEL_TOGGLE_GROUP, useValue: groupStub('multiple', ['b']) }],
      template: '<button pxlToggle value="b">B</button>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [b] = buttonsOf(fixture.nativeElement);
    expect(b!.hasAttribute('role')).toBe(false);
    expect(b!.getAttribute('aria-pressed')).toBe('true');
  });
});
