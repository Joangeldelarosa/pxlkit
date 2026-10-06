/**
 * PixelSlider: two-way binding, Angular forms, pointer dragging (which the
 * parity scenarios cannot drive: jsdom has no pointer capture and no
 * layout) and template labels for the marks.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reactExamples } from '../../../../../scripts/parity/catalog';
import { canonicalPage } from '../../../../../scripts/parity/canonical';
import { mountReact, type Mounted } from '../../../../../scripts/parity/react';
import { PixelSlider } from '../../public-api';
import { mountAngular } from '../angular';
import { angularDomRules } from '../dom-rules';
import { angularExamples } from '../examples';

/** A 200px track from x = 100, so a pointer at x = 100 + 2v sits on value v (0–100). */
function layOut(root: ParentNode): HTMLElement {
  const track = root.querySelector<HTMLElement>('.touch-none')!;
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 0, 200, 10));
  return track;
}

const pointer = (type: string, clientX: number) =>
  new PointerEvent(type, { clientX, pointerId: 7, bubbles: true, cancelable: true, pointerType: 'mouse' });
const thumbsOf = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('[role="slider"]'));

beforeEach(() => {
  // jsdom implements no pointer capture.
  HTMLElement.prototype.setPointerCapture = vi.fn();
});

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'setPointerCapture');
  vi.restoreAllMocks();
});

describe('PixelSlider', () => {
  it('follows a two-way bound value and a dragging pointer', async () => {
    @Component({
      imports: [PixelSlider],
      template: '<pxl-slider label="Level" [step]="5" showTooltip="drag" [(value)]="value" />',
    })
    class Host {
      readonly value = signal(40);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const track = layOut(root);
    track.dispatchEvent(pointer('pointerdown', 100 + 2 * 61));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(60);
    expect(HTMLElement.prototype.setPointerCapture).toHaveBeenCalledWith(7);
    expect(root.querySelector('[role="tooltip"]')!.textContent).toBe('60');
    track.dispatchEvent(pointer('pointermove', 999));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(100);
    track.dispatchEvent(pointer('pointerup', 999));
    await fixture.whenStable();
    expect(root.querySelector('[role="tooltip"]')).toBeNull();
    track.dispatchEvent(pointer('pointermove', 100));
    expect(fixture.componentInstance.value()).toBe(100);
    fixture.componentInstance.value.set(15);
    await fixture.whenStable();
    expect(thumbsOf(root)[0]!.getAttribute('aria-valuenow')).toBe('15');
  });

  it('works with a reactive form control on a range, including disabling and touched', async () => {
    @Component({
      imports: [PixelSlider, ReactiveFormsModule],
      template: '<pxl-slider label="Price" name="price" [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl<[number, number]>([20, 80]);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const { control } = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const [low, high] = thumbsOf(root);
    expect(Array.from(root.querySelectorAll('input'), (input) => `${input.name}=${input.value}`)).toEqual([
      'price[0]=20',
      'price[1]=80',
    ]);
    high!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    // The upper thumb stops at the lower one.
    expect(control.value).toEqual([20, 20]);
    high!.dispatchEvent(new FocusEvent('blur'));
    expect(control.touched).toBe(true);
    control.setValue([10, 90]);
    await fixture.whenStable();
    expect(low!.getAttribute('aria-valuenow')).toBe('10');

    control.disable();
    await fixture.whenStable();
    expect(low!.getAttribute('tabindex')).toBe('-1');
    expect(root.querySelector('pxl-slider')!.classList).toContain('opacity-50');
    low!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    layOut(root).dispatchEvent(pointer('pointerdown', 100));
    expect(control.value).toEqual([10, 90]);
  });

  it('works with ngModel, and starts from min without a value', async () => {
    @Component({
      imports: [PixelSlider, FormsModule],
      template: `
        <pxl-slider label="Bound" [(ngModel)]="value" />
        <pxl-slider id="free" label="Free" [min]="10" />
      `,
    })
    class Host {
      value = 30;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [bound, free] = thumbsOf(fixture.nativeElement);
    bound!.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe(40);
    expect(free!.getAttribute('aria-valuenow')).toBe('10');
  });

  it('puts its id on the thumb, not on the host, and labels marks with templates', async () => {
    @Component({
      imports: [PixelSlider],
      template: `
        <pxl-slider id="volume" label="Volume" [value]="50" [marks]="[{ value: 0, label: 'Low' }, { value: 100, label: loud }]" />
        <ng-template #loud><strong>Loud</strong></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('pxl-slider')!.hasAttribute('id')).toBe(false);
    expect(thumbsOf(root)[0]!.id).toBe('volume');
    const marks = Array.from(root.querySelectorAll<HTMLElement>('[data-testid="pxl-slider-marks"] > span'));
    expect(marks.map((mark) => [mark.textContent!.trim(), mark.style.left])).toEqual([
      ['Low', '0%'],
      ['Loud', '100%'],
    ]);
    expect(marks[1]!.querySelector('strong')!.textContent).toBe('Loud');
  });

  it('renders what React renders while a range is dragged', async () => {
    const reference = reactExamples().find((e) => e.component === 'PixelSlider' && e.exportName === 'RangeWithMarks')!;
    const drag = async ({ container, flush }: Mounted, rules = {}) => {
      const track = layOut(container);
      const snapshots: string[] = [];
      for (const event of [pointer('pointerdown', 100 + 2 * 60), pointer('pointermove', 100 + 2 * 12), pointer('pointerup', 0)]) {
        track.dispatchEvent(event);
        await flush();
        snapshots.push(canonicalPage(document, { ...rules, unwrap: (element) => element.hasAttribute('data-parity-root') }));
      }
      return snapshots;
    };
    const react = await mountReact(reference.Component);
    const expected = await drag(react);
    await react.unmount();
    const angular = await mountAngular(await angularExamples.get('PixelSlider/RangeWithMarks')!.load());
    const actual = await drag(angular, angularDomRules);
    await angular.unmount();
    expect(actual).toEqual(expected);
  });
});
