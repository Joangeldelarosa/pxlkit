/**
 * PixelInputGroup joining its items, its role and its dev warning.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelInputGroup, PixelInputGroupItem } from '../../public-api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PixelInputGroup', () => {
  it('joins its items, with a divider except after the last, which follows the items', async () => {
    @Component({
      imports: [PixelInputGroup, PixelInputGroupItem],
      template: `
        <pxl-input-group aria-label="Parts">
          <input pxlInputGroupItem class="mine" />
          <input pxlInputGroupItem />
          @if (third()) {
            <input pxlInputGroupItem />
          }
        </pxl-input-group>
      `,
    })
    class Host {
      readonly third = signal(true);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const inputs = () => Array.from(fixture.nativeElement.querySelectorAll('input')) as HTMLInputElement[];
    expect(inputs()[0]!.classList).toContain('mine');
    expect(inputs()[0]!.classList).toContain('border-0');
    expect(inputs()[1]!.classList).toContain('border-r');
    expect(inputs()[2]!.classList).not.toContain('border-r');
    fixture.componentInstance.third.set(false);
    await fixture.whenStable();
    expect(inputs()).toHaveLength(2);
    expect(inputs()[1]!.classList).not.toContain('border-r');
  });

  it('is a named group only when it has a name, unless given a role', async () => {
    @Component({
      imports: [PixelInputGroup, PixelInputGroupItem],
      template: `
        <pxl-input-group id="named" aria-label="Website"><input pxlInputGroupItem /></pxl-input-group>
        <pxl-input-group id="labelled" aria-labelledby="title"><input pxlInputGroupItem /></pxl-input-group>
        <pxl-input-group id="unnamed"><input pxlInputGroupItem /></pxl-input-group>
        <pxl-input-group id="toolbar" role="toolbar" size="lg" surface="linear"><input pxlInputGroupItem /></pxl-input-group>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const group = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
    expect(group('named').getAttribute('role')).toBe('group');
    expect(group('named').getAttribute('aria-label')).toBe('Website');
    expect(group('labelled').getAttribute('role')).toBe('group');
    expect(group('unnamed').hasAttribute('role')).toBe(false);
    expect(group('toolbar').getAttribute('role')).toBe('toolbar');
    expect(group('toolbar').classList).toContain('h-12');
    expect(group('toolbar').classList).toContain('rounded-md');
  });

  it('warns about several controls without a name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    @Component({
      imports: [PixelInputGroup, PixelInputGroupItem],
      template: `
        <pxl-input-group><input pxlInputGroupItem /><input pxlInputGroupItem /></pxl-input-group>
        <pxl-input-group aria-label="Pair"><input pxlInputGroupItem /><input pxlInputGroupItem /></pxl-input-group>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain('[PixelInputGroup] missing aria-label');
  });

  // Regression: the shell clips its controls (`overflow-hidden`), so their
  // focus rings were cut off.
  it('shows keyboard focus inside each control, on both surfaces', async () => {
    @Component({
      imports: [PixelInputGroup, PixelInputGroupItem],
      template: `
        <pxl-input-group aria-label="Pixel" surface="pixel">
          <input pxlInputGroupItem aria-label="Pixel query" />
          <button pxlInputGroupItem>Go</button>
        </pxl-input-group>
        <pxl-input-group aria-label="Linear" surface="linear">
          <input pxlInputGroupItem aria-label="Linear query" />
          <button pxlInputGroupItem>Go</button>
        </pxl-input-group>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const controls = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('input, button'));
    expect(controls).toHaveLength(4);
    for (const control of controls) expect(control.classList).toContain('focus-visible:pxl-focus-inset');
  });
});
