/**
 * PixelRibbon beyond the parity examples: tilts set inline, from bindings and
 * attributes, and the consumer's own style on the host.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelRibbon } from '../../public-api';

describe('PixelRibbon', () => {
  it('rotates by a Tailwind step, or inline for a tilt without one', async () => {
    @Component({
      imports: [PixelRibbon],
      template: '<pxl-ribbon position="corner-tl" [tilt]="tilt()">Hot</pxl-ribbon>',
    })
    class Host {
      readonly tilt = signal<number | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const ribbon = fixture.nativeElement.querySelector('pxl-ribbon') as HTMLElement;
    expect(ribbon.classList.contains('-rotate-12')).toBe(true);
    expect(ribbon.style.transform).toBe('');
    fixture.componentInstance.tilt.set(7);
    await fixture.whenStable();
    expect(Array.from(ribbon.classList).some((name) => name.includes('rotate'))).toBe(false);
    expect(ribbon.style.transform).toBe('rotate(7deg)');
  });

  it('reads a tilt attribute and keeps the consumer style and attributes', async () => {
    @Component({
      imports: [PixelRibbon],
      template: `
        <pxl-ribbon tilt="-2" style="color: red" role="status">Sale</pxl-ribbon>
        <pxl-ribbon tilt="6" style="transform: translateY(2px)">New</pxl-ribbon>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [inline, stepped] = Array.from(fixture.nativeElement.querySelectorAll('pxl-ribbon')) as HTMLElement[];
    expect(inline!.style.transform).toBe('rotate(-2deg)');
    expect(inline!.style.color).toBe('red');
    expect(inline!.getAttribute('role')).toBe('status');
    expect(stepped!.classList.contains('rotate-6')).toBe(true);
    expect(stepped!.style.transform).toBe('translateY(2px)');
  });
});

describe('PixelRibbon — letter spacing', () => {
  it('spaces its label wide on linear too, where the display face is tight', async () => {
    const tracking = (element: Element) => Array.from(element.classList).filter((name) => name.startsWith('tracking-'));
    @Component({ imports: [PixelRibbon], template: '<pxl-ribbon surface="linear">New</pxl-ribbon>' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(tracking(fixture.nativeElement.querySelector('pxl-ribbon'))).toEqual(['tracking-wider']);
  });
});
