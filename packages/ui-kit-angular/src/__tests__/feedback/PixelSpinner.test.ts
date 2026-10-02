/**
 * <pxl-spinner>: reduced motion and the decorative mode. Rendering is
 * covered against React by the parity suite.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { PixelSpinner } from '../../public-api';
import { installMatchMedia } from '../match-media';

const blade = (root: Element) => root.querySelector<HTMLElement>('[data-pxl-spinner-blade]')!;

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('PixelSpinner', () => {
  it('turns until the user asks for reduced motion, keeping its shape', async () => {
    const lists = installMatchMedia(() => false);
    @Component({ imports: [PixelSpinner], template: `<pxl-spinner surface="linear" />` })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(blade(root).style.animation).toContain('pxl-spinner-smooth');
    for (const list of lists) list.fire(true);
    await fixture.whenStable();
    expect(blade(root).style.animation).toBe('');
    expect(blade(root).classList).toContain('rounded-full');
  });

  it('is a named status, or pure decoration', async () => {
    @Component({
      imports: [PixelSpinner],
      template: `<pxl-spinner label="Cargando" [decorative]="decorative()" />`,
    })
    class Host {
      readonly decorative = signal(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const spinner = (fixture.nativeElement as HTMLElement).querySelector('pxl-spinner')!;
    expect(spinner.getAttribute('role')).toBe('status');
    expect(spinner.getAttribute('aria-label')).toBe('Cargando');
    expect(spinner.querySelector('.sr-only')!.textContent).toBe('Cargando');
    fixture.componentInstance.decorative.set(true);
    await fixture.whenStable();
    expect(spinner.hasAttribute('role')).toBe(false);
    expect(spinner.hasAttribute('aria-label')).toBe(false);
    expect(spinner.getAttribute('aria-hidden')).toBe('true');
    expect(spinner.querySelector('.sr-only')).toBeNull();
  });
});
