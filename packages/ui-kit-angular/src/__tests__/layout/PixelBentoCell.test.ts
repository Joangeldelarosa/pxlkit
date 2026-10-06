/**
 * PixelBentoCell beyond the parity examples: the deprecated `kind` alias,
 * the tone chrome and surface inheritance.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelBentoCell, PxlKitSurfaceProvider, type BentoKind } from '../../public-api';

describe('PixelBentoCell', () => {
  it('prefers variant over the deprecated kind alias and marks its kind and span', async () => {
    @Component({
      imports: [PixelBentoCell],
      template: '<pxl-bento-cell kind="stat" span="3x1" [variant]="variant()"></pxl-bento-cell>',
    })
    class Host {
      readonly variant = signal<BentoKind | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const cell = fixture.nativeElement.querySelector('pxl-bento-cell') as HTMLElement;
    expect(cell.getAttribute('data-kind')).toBe('stat');
    expect(cell.getAttribute('data-span')).toBe('3x1');
    expect(Array.from(cell.classList)).toEqual(expect.arrayContaining(['justify-center', 'lg:col-span-3']));
    fixture.componentInstance.variant.set('media');
    await fixture.whenStable();
    expect(cell.getAttribute('data-kind')).toBe('media');
    expect(cell.classList.contains('overflow-hidden')).toBe(true);
  });

  it('draws the tone chrome on the surface of the nearest provider when bordered', async () => {
    @Component({
      imports: [PixelBentoCell, PxlKitSurfaceProvider],
      template: '<ng-container pxlKitSurface="linear"><pxl-bento-cell tone="pink" bordered></pxl-bento-cell></ng-container>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const cell = fixture.nativeElement.querySelector('pxl-bento-cell') as HTMLElement;
    expect(cell.getAttribute('data-kind')).toBe('feature');
    expect(Array.from(cell.classList)).toEqual(
      expect.arrayContaining(['border', 'rounded-xl', 'border-retro-pink/30', 'bg-retro-pink/18', 'text-retro-pink']),
    );
  });
});
