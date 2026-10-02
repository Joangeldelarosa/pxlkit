/**
 * <pxl-avatar> behaviour the parity examples cannot trigger: the fallback to
 * the initials when the image fails, locale-aware initials and unset inputs.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelAvatar, PxlKitLocaleProvider } from '../../public-api';

const frameOf = (root: HTMLElement) => root.querySelector('[data-shape]') as HTMLElement;

describe('PixelAvatar', () => {
  it('falls back to the initials when the image fails, and tries a new src again', async () => {
    @Component({ imports: [PixelAvatar], template: '<pxl-avatar name="Jane Doe" [src]="src()" />' })
    class Host {
      readonly src = signal('/broken.png');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(frameOf(root).hasAttribute('role')).toBe(false);
    root.querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(root.querySelector('img')).toBeNull();
    expect(frameOf(root).textContent).toBe('JD');

    fixture.componentInstance.src.set('/jane.png');
    await fixture.whenStable();
    expect(root.querySelector('img')!.getAttribute('src')).toBe('/jane.png');
    expect(root.querySelector('img')!.getAttribute('alt')).toBe('Jane Doe');
  });

  it('upper-cases the initials for the locale of the nearest provider', async () => {
    @Component({
      imports: [PixelAvatar, PxlKitLocaleProvider],
      template: '<pxl-locale-provider locale="tr"><pxl-avatar name="işıl gündüz" /></pxl-locale-provider>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(frameOf(fixture.nativeElement).textContent).toBe('İG');
  });

  it('falls back to its defaults for unset inputs', async () => {
    @Component({
      imports: [PixelAvatar],
      template: '<pxl-avatar name="Jane Doe" [size]="undefined" [shape]="undefined" status="away" />',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const frame = frameOf(fixture.nativeElement);
    expect(frame.className).toContain('h-10');
    expect(frame.getAttribute('data-shape')).toBe('circle');
    expect(frame.getAttribute('aria-label')).toBe('Jane Doe (away)');
    expect(frame.getAttribute('role')).toBe('img');
  });
});
