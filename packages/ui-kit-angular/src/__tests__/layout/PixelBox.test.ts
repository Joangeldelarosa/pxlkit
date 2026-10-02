/**
 * PixelBox beyond the parity examples: the tri-state border, unset inputs
 * and the development warning for an unnamed landmark.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelBox, type Variant } from '../../public-api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PixelBox', () => {
  it('borders an outline box unless opted out, and other variants on request', async () => {
    @Component({
      imports: [PixelBox],
      template: '<div pxlBox tone="gold" [variant]="variant()" [border]="border()"></div>',
    })
    class Host {
      readonly variant = signal<Variant | undefined>('outline');
      readonly border = signal<boolean | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const box = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(Array.from(box.classList)).toEqual(expect.arrayContaining(['border-2', 'border-retro-gold/30']));
    fixture.componentInstance.border.set(false);
    await fixture.whenStable();
    expect(box.classList.contains('border-2')).toBe(false);
    fixture.componentInstance.variant.set(undefined);
    fixture.componentInstance.border.set(true);
    await fixture.whenStable();
    expect(Array.from(box.classList)).toEqual(expect.arrayContaining(['bg-retro-gold/18', 'border-2', 'px-4', 'py-3']));
  });

  it('reads a bare border attribute as on', async () => {
    @Component({ imports: [PixelBox], template: '<div pxlBox variant="soft" border radius="sm"></div>' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const box = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(Array.from(box.classList)).toEqual(expect.arrayContaining(['border-2', 'rounded-sm']));
  });

  it('warns in development about a landmark without an accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    @Component({
      imports: [PixelBox],
      template: `
        <nav pxlBox></nav>
        <nav pxlBox [attr.aria-labelledby]="'nav-title'"></nav>
        <main pxlBox title="Content"></main>
        <article pxlBox></article>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain('PixelBox as="nav" is a landmark/sectioning element');
  });
});
