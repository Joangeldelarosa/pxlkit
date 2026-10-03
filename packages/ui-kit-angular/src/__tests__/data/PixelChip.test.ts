/**
 * <pxl-chip> / button[pxlChip]: the delete and clicked outputs, the clickable
 * deletable chip's sibling buttons, the button type and unset inputs.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelChip } from '../../public-api';

const deleteButton = (root: HTMLElement) => root.querySelector('button[aria-label="Remove React"]') as HTMLButtonElement | null;

describe('PixelChip', () => {
  it('splits a clickable deletable chip into sibling label and delete buttons, each with its own output', async () => {
    const clicked = vi.fn();
    const deleted = vi.fn();
    @Component({
      imports: [PixelChip],
      template: '<pxl-chip label="React" clickable deletable (clicked)="clicked($event)" (delete)="deleted()" />',
    })
    class Host {
      readonly clicked = clicked;
      readonly deleted = deleted;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('button button')).toBeNull();
    const chip = root.querySelector('pxl-chip')!;
    expect(chip.className).toContain('has-[[data-chip-action]:focus-visible]:pxl-focus-inset');
    const action = chip.querySelector<HTMLButtonElement>('[data-chip-action]')!;
    expect(action.parentElement).toBe(chip);
    expect(action.getAttribute('type')).toBe('button');
    expect(action.textContent!.trim()).toBe('React');
    deleteButton(root)!.click();
    expect(deleted).toHaveBeenCalledTimes(1);
    expect(clicked).not.toHaveBeenCalled();
    action.click();
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(clicked.mock.calls[0]![0]).toBeInstanceOf(MouseEvent);
  });

  it('never nests the delete button in a button[pxlChip]', async () => {
    @Component({ imports: [PixelChip], template: '<button pxlChip label="React" deletable></button>' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(deleteButton(fixture.nativeElement)).toBeNull();
  });

  it('shows the delete button only when deletable', async () => {
    @Component({
      imports: [PixelChip],
      template: '<pxl-chip label="React" /><pxl-chip label="React" [deletable]="false" />',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(deleteButton(fixture.nativeElement)).toBeNull();
  });

  it('defaults a clickable chip to a plain button, keeping an own type', async () => {
    @Component({
      imports: [PixelChip],
      template: '<button pxlChip label="A"></button><button pxlChip label="B" type="submit"></button>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [plain, submit] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    expect(plain!.getAttribute('type')).toBe('button');
    expect(plain!.className).toContain('focus-visible:ring-2');
    expect(submit!.getAttribute('type')).toBe('submit');
  });

  it('falls back to its defaults for unset inputs', async () => {
    @Component({
      imports: [PixelChip],
      template: '<pxl-chip label="React" [tone]="undefined" [variant]="undefined" [size]="undefined" />',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const chip = (fixture.nativeElement as HTMLElement).querySelector('pxl-chip')!;
    expect(chip.className).toContain('text-retro-cyan');
    expect(chip.className).toContain('bg-retro-cyan/8');
    expect(chip.className).toContain('px-2.5');
    expect(chip.hasAttribute('type')).toBe(false);
  });

  it("shows the label button's keyboard focus on the frame: inside its cut corners on the pixel surface, a ring in the tone on the linear one", async () => {
    @Component({
      imports: [PixelChip],
      template: `
        <pxl-chip label="Pixel" tone="pink" surface="pixel" clickable deletable />
        <pxl-chip label="Linear" tone="pink" surface="linear" clickable deletable />
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [pixel, linear] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('pxl-chip'), (frame) => Array.from(frame.classList));
    expect(pixel).toEqual(expect.arrayContaining(['pxl-corner-sm', 'has-[[data-chip-action]:focus-visible]:pxl-focus-inset']));
    expect(pixel!.filter((c) => c.includes('ring'))).toEqual([]);
    expect(linear).toEqual(
      expect.arrayContaining(['has-[[data-chip-action]:focus-visible]:ring-2', 'has-[[data-chip-action]:focus-visible]:ring-retro-pink/40']),
    );
  });
});
