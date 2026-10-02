/**
 * <pxl-progress>: the progressbar's value, name and busy state across input
 * changes. Rendering is covered against React by the parity suite.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelProgress } from '../../public-api';

describe('PixelProgress', () => {
  it('reports the clamped value, is named by its label or "Progress", and turns busy while indeterminate', async () => {
    @Component({
      imports: [PixelProgress],
      template: `
        <pxl-progress [value]="value()" [label]="label()" [indeterminate]="indeterminate()" [surface]="surface()" />
      `,
    })
    class Host {
      readonly value = signal(150);
      readonly label = signal<string | undefined>(undefined);
      readonly indeterminate = signal(false);
      readonly surface = signal<'pixel' | 'linear'>('pixel');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const bar = () => root.querySelector<HTMLElement>('[role="progressbar"]')!;
    expect(bar().getAttribute('aria-valuenow')).toBe('100');
    expect(bar().getAttribute('aria-valuemin')).toBe('0');
    expect(bar().getAttribute('aria-valuemax')).toBe('100');
    expect(bar().getAttribute('aria-label')).toBe('Progress');

    fixture.componentInstance.value.set(42);
    fixture.componentInstance.label.set('HP');
    fixture.componentInstance.surface.set('linear');
    await fixture.whenStable();
    expect(bar().getAttribute('aria-valuenow')).toBe('42');
    expect(bar().getAttribute('aria-label')).toBe('HP');
    expect(bar().querySelector('div')!.style.width).toBe('42%');
    expect(root.textContent).toContain('42%');

    fixture.componentInstance.indeterminate.set(true);
    await fixture.whenStable();
    expect(bar().hasAttribute('aria-valuenow')).toBe(false);
    expect(bar().getAttribute('aria-busy')).toBe('true');
    expect(bar().querySelector('div')!.style.width).toBe('100%');
    expect(root.textContent).not.toContain('42%');
  });

  it('hides the percentage with showValue false, and the header without a label too', () => {
    @Component({
      imports: [PixelProgress],
      template: `
        <pxl-progress id="label" [value]="75" label="XP" [showValue]="false" />
        <pxl-progress id="none" [value]="75" [showValue]="false" />
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#label')!.textContent!.trim()).toBe('XP');
    expect(root.querySelector('#none')!.children).toHaveLength(1);
  });
});
