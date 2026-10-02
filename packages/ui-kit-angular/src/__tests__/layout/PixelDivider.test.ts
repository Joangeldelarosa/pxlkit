/**
 * PixelDivider beyond the parity examples: switching between the bare rule
 * and the labelled separator, and the ornaments of the pixel surface.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelDivider, PxlKitSurfaceProvider } from '../../public-api';

describe('PixelDivider', () => {
  it('becomes a labelled separator when given a label, and a bare rule again without one', async () => {
    @Component({
      imports: [PixelDivider],
      template: '<pxl-divider [label]="label()" tone="red" spacing="sm" />',
    })
    class Host {
      readonly label = signal<string | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('pxl-divider') as HTMLElement;
    expect(host.style.display).toBe('contents');
    expect(host.firstElementChild?.tagName).toBe('HR');
    expect(host.firstElementChild?.classList.contains('py-3')).toBe(true);
    fixture.componentInstance.label.set('Settings');
    await fixture.whenStable();
    const separator = host.querySelector('[role="separator"]') as HTMLElement;
    expect(separator.getAttribute('aria-orientation')).toBe('horizontal');
    expect(separator.getAttribute('aria-label')).toBe('Settings');
    expect(separator.querySelectorAll('hr[aria-hidden="true"]')).toHaveLength(2);
    expect(separator.querySelector('span')?.classList.contains('text-retro-red')).toBe(true);
    fixture.componentInstance.label.set('');
    await fixture.whenStable();
    expect(host.querySelector('[role="separator"]')).toBeNull();
    expect(host.firstElementChild?.tagName).toBe('HR');
  });

  it('frames the label with hidden diamonds only on the pixel surface', async () => {
    @Component({
      imports: [PixelDivider, PxlKitSurfaceProvider],
      template: `
        <pxl-divider id="pixel" label="Loot" />
        <ng-container pxlKitSurface="linear"><pxl-divider id="linear" label="Loot" /></ng-container>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const ornaments = (id: string) =>
      Array.from(fixture.nativeElement.querySelectorAll(`#${id} span[aria-hidden="true"]`) as NodeListOf<HTMLElement>);
    expect(ornaments('pixel').map((ornament) => ornament.textContent)).toEqual(['◆', '◆']);
    expect(ornaments('linear')).toHaveLength(0);
  });
});
