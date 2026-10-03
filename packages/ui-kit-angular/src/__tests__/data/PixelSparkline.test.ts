/**
 * svg[pxlSparkline]: its accessible name, static and bound, a series that
 * changes, the surface of the nearest provider and the svg's own classes.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelSparkline, PxlKitSurfaceProvider, type PixelChartDataPoint } from '../../public-api';

const DATA: PixelChartDataPoint[] = [
  { x: 0, y: 10 },
  { x: 1, y: 30 },
  { x: 2, y: 20 },
];

describe('PixelSparkline', () => {
  it('is an image named by a summary of its series, by a static aria-label, or a bound one', async () => {
    @Component({
      imports: [PixelSparkline],
      template: `
        <svg pxlSparkline [data]="data"></svg>
        <svg pxlSparkline [data]="data" aria-label="Weekly revenue"></svg>
        <svg pxlSparkline [data]="data" [aria-label]="label()"></svg>
      `,
    })
    class Host {
      readonly data = DATA;
      readonly label = signal<string | undefined>('Bound');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const labels = () =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('svg'), (svg) => svg.getAttribute('aria-label'));
    expect(labels()).toEqual(['sparkline with 3 points, range 10 to 30', 'Weekly revenue', 'Bound']);
    fixture.componentInstance.label.set(undefined);
    await fixture.whenStable();
    expect(labels()[2]).toBe('sparkline with 3 points, range 10 to 30');
    expect((fixture.nativeElement as HTMLElement).querySelector('svg')!.getAttribute('role')).toBe('img');
  });

  it('redraws when its series changes, with an area once asked and two points exist', async () => {
    @Component({
      imports: [PixelSparkline],
      template: `<svg pxlSparkline [data]="data()" [size]="size()" showArea></svg>`,
    })
    class Host {
      readonly data = signal<PixelChartDataPoint[]>([{ x: 0, y: 1 }]);
      readonly size = signal<'sm' | 'md'>('md');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.querySelector('polyline')!.getAttribute('points')).toBe('2.00,56.00');
    expect(svg.querySelector('polygon')).toBeNull();
    fixture.componentInstance.data.set(DATA);
    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();
    expect(svg.getAttribute('viewBox')).toBe('0 0 120 32');
    expect(svg.querySelector('polyline')!.getAttribute('points')).toBe('2.00,28.00 60.00,4.00 118.00,16.00');
    expect(svg.querySelector('polygon')!.getAttribute('points')).toBe(
      '2.00,28.00 2.00,28.00 60.00,4.00 118.00,16.00 118.00,28.00',
    );
  });

  it("takes its provider's surface and keeps the svg's own classes", async () => {
    @Component({
      imports: [PixelSparkline, PxlKitSurfaceProvider],
      template: `<ng-container pxlKitSurface="linear"><svg pxlSparkline class="w-full" [data]="data" bordered></svg></ng-container>`,
    })
    class Host {
      readonly data = DATA;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.getAttribute('shape-rendering')).toBe('geometricPrecision');
    expect(svg.getAttribute('class')!.split(' ')).toEqual(
      expect.arrayContaining(['overflow-visible', 'border', 'rounded-md', 'w-full']),
    );
    expect(svg.querySelector('polyline')!.getAttribute('stroke-linecap')).toBe('round');
  });
});
