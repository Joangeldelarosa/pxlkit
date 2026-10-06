/**
 * <pxl-star-rating> as an Angular form control, as a two-way binding and
 * uncontrolled, with custom glyphs, and read-only.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { PixelStarRating } from '../../public-api';

const buttons = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-pxl-star]'));
const pressed = (root: HTMLElement) => buttons(root).map((button) => button.getAttribute('aria-pressed'));

describe('PixelStarRating', () => {
  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelStarRating, ReactiveFormsModule],
      template: '<pxl-star-rating interactive [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl(2);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(pressed(root)).toEqual(['true', 'true', 'false', 'false', 'false']);

    buttons(root)[3]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe(4);
    expect(root.querySelector('pxl-star-rating')!.getAttribute('aria-label')).toBe('Rating, 4 of 5');
    buttons(root)[3]!.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);

    fixture.componentInstance.control.setValue(1);
    await fixture.whenStable();
    expect(pressed(root)).toEqual(['true', 'false', 'false', 'false', 'false']);

    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(buttons(root).every((button) => button.disabled)).toBe(true);
    buttons(root)[4]!.click();
    expect(fixture.componentInstance.control.value).toBe(1);

    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(pressed(root).every((value) => value === 'false')).toBe(true);
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [PixelStarRating, FormsModule],
      template: '<pxl-star-rating interactive [max]="3" [(ngModel)]="rating" />',
    })
    class Host {
      rating = 1;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    buttons(fixture.nativeElement)[2]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.rating).toBe(3);
  });

  it('follows a two-way bound signal, and starts from defaultValue when uncontrolled', async () => {
    @Component({
      imports: [PixelStarRating],
      template: `
        <pxl-star-rating interactive [(value)]="rating" />
        <pxl-star-rating interactive defaultValue="2" max="4" (valueChange)="changes.push($event)" />
      `,
    })
    class Host {
      readonly rating = signal(3);
      readonly changes: number[] = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [bound, free] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('pxl-star-rating'));
    buttons(bound!)[0]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.rating()).toBe(1);
    fixture.componentInstance.rating.set(5);
    await fixture.whenStable();
    expect(pressed(bound!).every((value) => value === 'true')).toBe(true);

    expect(pressed(free!)).toEqual(['true', 'true', 'false', 'false']);
    buttons(free!)[3]!.click();
    await fixture.whenStable();
    expect(pressed(free!)).toEqual(['true', 'true', 'true', 'true']);
    expect(fixture.componentInstance.changes).toEqual([4]);
  });

  it('draws the filled and the empty stars with its glyph templates, given the size and tone', async () => {
    @Component({
      imports: [PixelStarRating],
      template: `
        <pxl-star-rating [value]="2" max="3" size="lg" tone="green" [starIcon]="full" [emptyStarIcon]="hollow" />
        <pxl-star-rating [value]="1" max="2" starIcon="♥" />
        <ng-template #full let-size="size" let-tone="tone" let-filled="filled"><b>{{ filled }}-{{ size }}-{{ tone }}</b></ng-template>
        <ng-template #hollow let-filled="filled" let-size="size"><i>{{ filled }}-{{ size }}</i></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [custom, text] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('pxl-star-rating'));
    expect(Array.from(custom!.querySelectorAll('[data-pxl-star]'), (star) => star.textContent!.trim())).toEqual([
      'true-24-green',
      'true-24-green',
      'false-24',
    ]);
    expect(custom!.querySelector('img')).toBeNull();
    const [heart, empty] = Array.from(text!.querySelectorAll('[data-pxl-star]'));
    expect(heart!.textContent!.trim()).toBe('♥');
    expect(empty!.querySelector('span.opacity-40 img')!.getAttribute('alt')).toBe('star');
  });

  it('is a single image when read-only, and keeps a role and a name of its own', async () => {
    @Component({
      imports: [PixelStarRating],
      template: `
        <pxl-star-rating [value]="3.6" showCount />
        <pxl-star-rating [value]="2" role="presentation" aria-label="Product rating" />
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [plain, named] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('pxl-star-rating'));
    expect([plain!.getAttribute('role'), plain!.getAttribute('aria-label')]).toEqual(['img', '4 out of 5']);
    expect(plain!.querySelector('button')).toBeNull();
    expect(plain!.textContent!.trim()).toBe('4/5');
    expect([named!.getAttribute('role'), named!.getAttribute('aria-label')]).toEqual(['presentation', 'Product rating']);
  });
});
