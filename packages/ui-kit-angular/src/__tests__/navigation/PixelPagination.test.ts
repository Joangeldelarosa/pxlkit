/**
 * <pxl-pagination> beyond the parity examples: `[(page)]` in both
 * directions, the `(pageChange)` output, numeric attributes and the landmark.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelPagination } from '../../public-api';

const current = (root: HTMLElement) => root.querySelector('[aria-current="page"]')!.textContent!.trim();

describe('PixelPagination', () => {
  it('binds the page with [(page)] in both directions', async () => {
    @Component({
      imports: [PixelPagination],
      template: '<pxl-pagination [(page)]="page" [total]="12" />',
    })
    class Host {
      readonly page = signal(3);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('button[aria-label="Next"]')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.page()).toBe(4);
    expect(current(root)).toBe('4');
    fixture.componentInstance.page.set(12);
    await fixture.whenStable();
    expect(current(root)).toBe('12');
    expect(root.querySelector<HTMLButtonElement>('button[aria-label="Next"]')!.disabled).toBe(true);
  });

  it('emits (pageChange) with the picked page', async () => {
    @Component({
      imports: [PixelPagination],
      template: '<pxl-pagination [page]="1" total="10" (pageChange)="picked.push($event)" />',
    })
    class Host {
      readonly picked: number[] = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('button')).toHaveLength(5);
    root.querySelectorAll('button')[2]!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.picked).toEqual([2]);
  });

  it('is a navigation landmark with named steps', async () => {
    @Component({
      imports: [PixelPagination],
      template: '<pxl-pagination [page]="2" [total]="3" [ariaLabel]="label" prevLabel="Anterior" nextLabel="Siguiente" />',
    })
    class Host {
      readonly label: string | undefined = undefined;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('pxl-pagination')!;
    expect(host.getAttribute('role')).toBe('navigation');
    expect(host.getAttribute('aria-label')).toBe('Pagination');
    expect(host.querySelector('button[aria-label="Anterior"]')!.textContent).toBe('Anterior');
    expect(host.querySelector('button[aria-label="Siguiente"]')!.textContent).toBe('Siguiente');
  });
});
