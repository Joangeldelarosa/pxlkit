/**
 * <pxl-chip-group> as a form control, with a two-way bound signal and
 * uncontrolled.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelChip, PixelChipGroup, PixelChipGroupItem } from '../../public-api';

const PARTS = [PixelChip, PixelChipGroup, PixelChipGroupItem];
const CHIPS = `
  <pxl-chip *pxlChipGroupItem="'a'" label="Alpha" />
  <pxl-chip *pxlChipGroupItem="'b'" label="Bravo" />
`;
const buttonsOf = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>('[data-value]'));

describe('PixelChipGroup', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [...PARTS, ReactiveFormsModule],
      template: `<pxl-chip-group multiple aria-label="Tags" [formControl]="control">${CHIPS}</pxl-chip-group>`,
    })
    class Host {
      readonly control = new FormControl<string[]>(['a']);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [alpha, bravo] = buttonsOf(fixture.nativeElement);
    expect(alpha!.getAttribute('aria-checked')).toBe('true');
    bravo!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toEqual(['a', 'b']);
    bravo!.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);

    fixture.componentInstance.control.setValue(['b']);
    await fixture.whenStable();
    expect(alpha!.getAttribute('aria-checked')).toBe('false');

    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(alpha!.disabled).toBe(true);
    alpha!.click();
    expect(fixture.componentInstance.control.value).toEqual(['b']);
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [...PARTS, FormsModule],
      template: `<pxl-chip-group aria-label="Letters" [(ngModel)]="selection">${CHIPS}</pxl-chip-group>`,
    })
    class Host {
      selection: string[] = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    buttonsOf(fixture.nativeElement)[1]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selection).toEqual(['b']);
  });

  it('follows a two-way bound signal', async () => {
    @Component({
      imports: PARTS,
      template: `<pxl-chip-group aria-label="Letters" [(value)]="selection">${CHIPS}</pxl-chip-group>`,
    })
    class Host {
      readonly selection = signal(['a']);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [alpha, bravo] = buttonsOf(fixture.nativeElement);
    bravo!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.selection()).toEqual(['a']);
    alpha!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selection()).toEqual([]);
    fixture.componentInstance.selection.set(['b']);
    await fixture.whenStable();
    expect(bravo!.getAttribute('aria-checked')).toBe('true');
    expect(bravo!.getAttribute('tabindex')).toBe('0');
  });

  it('starts from defaultValue when uncontrolled and reports changes', async () => {
    @Component({
      imports: PARTS,
      template: `<pxl-chip-group aria-label="Letters" [defaultValue]="['b']" (valueChange)="changes.push($event)">${CHIPS}</pxl-chip-group>`,
    })
    class Host {
      readonly changes: Array<string[] | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [alpha, bravo] = buttonsOf(fixture.nativeElement);
    expect(bravo!.getAttribute('aria-checked')).toBe('true');
    alpha!.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await fixture.whenStable();
    expect(alpha!.getAttribute('aria-checked')).toBe('true');
    expect(fixture.componentInstance.changes).toEqual([['a']]);
  });

  it('is a radio group for single selection and a group only when named for multiple', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-chip-group data-testid="single">${CHIPS}</pxl-chip-group>
        <pxl-chip-group data-testid="multiple" multiple>${CHIPS}</pxl-chip-group>
        <pxl-chip-group data-testid="named" multiple aria-labelledby="tags">${CHIPS}</pxl-chip-group>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const group = (id: string) => (fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${id}"]`)!;
    expect(group('single').getAttribute('role')).toBe('radiogroup');
    expect(group('multiple').hasAttribute('role')).toBe(false);
    expect(group('named').getAttribute('role')).toBe('group');
    expect(group('multiple').querySelector('[data-value]')!.hasAttribute('tabindex')).toBe(false);
  });

  // Regression: on the linear surface the selection ring and the focus ring
  // were the same; on the pixel surface the cut corners clipped the selection
  // ring, the only mark of a selected chip.
  it('marks the selected chip apart from keyboard focus on both surfaces', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-chip-group aria-label="Pixel" surface="pixel" [defaultValue]="['a']">${CHIPS}</pxl-chip-group>
        <pxl-chip-group aria-label="Linear" surface="linear" [defaultValue]="['a']">${CHIPS}</pxl-chip-group>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [pixelSelected, pixelOther, linearSelected, linearOther] = buttonsOf(fixture.nativeElement).map((item) => Array.from(item.classList));
    // Pixel: a frame inside the selected chip, which the cut corners leave
    // whole; focus lights up the chip's edge from a layer over the chip.
    expect(pixelSelected).toEqual(expect.arrayContaining(['pxl-corner-sm', '*:outline-2', '*:-outline-offset-4', '*:outline-retro-cyan/60']));
    expect(pixelSelected!.filter((c) => c.includes('ring'))).toEqual([]);
    expect(pixelOther!.filter((c) => c.startsWith('*:'))).toEqual([]);
    for (const chip of [pixelSelected!, pixelOther!]) expect(chip).toContain('focus-visible:after:pxl-focus-inset');
    // Linear: the selection ring hugs the chip; the focus ring stands off it.
    expect(linearSelected).toEqual(expect.arrayContaining(['ring-2', 'ring-retro-cyan/60', 'focus-visible:ring-offset-2']));
    expect(linearOther).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:ring-offset-2']));
    expect(linearOther).not.toContain('ring-2');
  });
});
