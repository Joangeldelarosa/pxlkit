/**
 * <pxl-icon-frame> beyond the parity examples: the pulse and reduced motion,
 * the accent's content and corner, and attribute inputs.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { PixelIconFrame } from '../../public-api';
import { installMatchMedia } from '../match-media';

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('PixelIconFrame', () => {
  it('pulses when animated until the user asks for reduced motion', async () => {
    const lists = installMatchMedia(() => false);
    @Component({ imports: [PixelIconFrame], template: '<pxl-icon-frame icon="i" animated />' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const frame = (fixture.nativeElement as HTMLElement).querySelector('pxl-icon-frame')!;
    expect(frame.classList.contains('animate-pulse')).toBe(true);
    for (const list of lists) list.fire(true);
    await fixture.whenStable();
    expect(frame.classList.contains('animate-pulse')).toBe(false);
  });

  it('hides the icon and the accent from assistive technology, the accent in its corner', async () => {
    @Component({
      imports: [PixelIconFrame],
      template: '<pxl-icon-frame icon="i" size="112" shape="circle" [accent]="accent()" />',
    })
    class Host {
      readonly accent = signal<{ icon: string; position?: 'top-right' | 'bottom-right' } | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const frame = (fixture.nativeElement as HTMLElement).querySelector('pxl-icon-frame')!;
    expect(Array.from(frame.classList)).toEqual(expect.arrayContaining(['w-28', 'h-28', 'rounded-full']));
    expect(frame.querySelectorAll('span')).toHaveLength(1);
    expect(frame.querySelector('span')!.getAttribute('aria-hidden')).toBe('true');

    fixture.componentInstance.accent.set({ icon: '3', position: 'bottom-right' });
    await fixture.whenStable();
    const accent = frame.querySelectorAll('span')[1]!;
    expect(accent.getAttribute('aria-hidden')).toBe('true');
    expect(accent.textContent).toBe('3');
    expect(Array.from(accent.classList)).toEqual(expect.arrayContaining(['bottom-0', 'rounded-full']));
  });
});
