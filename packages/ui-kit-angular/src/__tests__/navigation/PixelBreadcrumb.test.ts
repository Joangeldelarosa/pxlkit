/**
 * <pxl-breadcrumb> beyond the parity examples: the host is the landmark, the
 * crumbs' handlers run, and the trail follows its input.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelBreadcrumb, type PixelBreadcrumbItem } from '../../public-api';

describe('PixelBreadcrumb', () => {
  it('is a navigation landmark named "Breadcrumb" unless told otherwise', async () => {
    @Component({
      imports: [PixelBreadcrumb],
      template: '<pxl-breadcrumb [items]="[]" [ariaLabel]="label()" />',
    })
    class Host {
      readonly label = signal<string | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('pxl-breadcrumb')!;
    expect(host.getAttribute('role')).toBe('navigation');
    expect(host.getAttribute('aria-label')).toBe('Breadcrumb');
    fixture.componentInstance.label.set('Miga de pan');
    await fixture.whenStable();
    expect(host.getAttribute('aria-label')).toBe('Miga de pan');
  });

  it("runs a button crumb's handler, which wins over its href", async () => {
    const onClick = vi.fn();
    @Component({
      imports: [PixelBreadcrumb],
      template: '<pxl-breadcrumb [items]="items" />',
    })
    class Host {
      readonly items: PixelBreadcrumbItem[] = [{ label: 'Back', href: '/back', onClick }, { label: 'Here', active: true }];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('a')).toBeNull();
    root.querySelector('button')!.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('follows a trail that changes', async () => {
    @Component({
      imports: [PixelBreadcrumb],
      template: '<pxl-breadcrumb [items]="items()" />',
    })
    class Host {
      readonly items = signal<PixelBreadcrumbItem[]>([{ label: 'Home', active: true }]);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    fixture.componentInstance.items.set([{ label: 'Home', href: '/' }, { label: 'Docs', active: true }]);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('a')!.getAttribute('href')).toBe('/');
    expect(root.querySelector('[aria-current="page"]')!.textContent).toBe('Docs');
    expect(root.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  });
});
