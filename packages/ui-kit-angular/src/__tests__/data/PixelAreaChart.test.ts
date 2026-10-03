/**
 * svg[pxlAreaChart]: its accessible name, a series that changes, and
 * smoothing on each surface.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelAreaChart, type PixelChartDataPoint, type Surface, type ToneKey } from '../../public-api';

describe('PixelAreaChart', () => {
  it('draws nothing without data, then the area closed to the baseline, named by a summary', async () => {
    @Component({
      imports: [PixelAreaChart],
      template: `<svg pxlAreaChart [data]="data()"></svg>`,
    })
    class Host {
      readonly data = signal<PixelChartDataPoint[]>([]);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.querySelector('polygon')).toBeNull();
    expect(svg.getAttribute('aria-label')).toBe('area chart, no data');
    fixture.componentInstance.data.set([
      { x: 0, y: 10 },
      { x: 1, y: 30 },
    ]);
    await fixture.whenStable();
    expect(svg.querySelector('polygon')!.getAttribute('points')).toBe('2.00,56.00 2.00,56.00 238.00,4.00 238.00,56.00');
    expect(svg.getAttribute('aria-label')).toBe('area chart with 2 points, range 10 to 30');
  });

  it('rounds its joins only when smooth on the linear surface, and exposes its tone glow', async () => {
    @Component({
      imports: [PixelAreaChart],
      template: `<svg pxlAreaChart [data]="data" [smooth]="smooth()" [surface]="surface()" [tone]="tone()"></svg>`,
    })
    class Host {
      readonly data = [{ x: 0, y: 1 }];
      readonly smooth = signal(true);
      readonly surface = signal<Surface>('pixel');
      readonly tone = signal<ToneKey>('cyan');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.getAttribute('data-smooth')).toBe('true');
    expect(svg.querySelector('polygon')!.getAttribute('stroke-linejoin')).toBe('miter');
    fixture.componentInstance.surface.set('linear');
    await fixture.whenStable();
    expect(svg.querySelector('polygon')!.getAttribute('stroke-linejoin')).toBe('round');
    fixture.componentInstance.smooth.set(false);
    fixture.componentInstance.tone.set('gold');
    await fixture.whenStable();
    expect(svg.hasAttribute('data-smooth')).toBe(false);
    expect(svg.getAttribute('data-tone-glow')).toBe('shadow-[0_0_24px_-8px_rgba(234,179,8,0.45)]');
  });

  it('leaves out values that are not finite: they draw nothing and the summary skips them', async () => {
    @Component({
      imports: [PixelAreaChart],
      template: `<svg pxlAreaChart [data]="data()"></svg>`,
    })
    class Host {
      readonly data = signal<PixelChartDataPoint[]>([
        { x: 0, y: 10 },
        { x: 1, y: Number.NaN },
        { x: 2, y: 30 },
        { x: 3, y: -Infinity },
      ]);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.querySelector('polygon')!.getAttribute('points')).toBe('2.00,56.00 2.00,56.00 159.33,4.00 159.33,56.00');
    expect(svg.getAttribute('aria-label')).toBe('area chart with 2 points, range 10 to 30');
    fixture.componentInstance.data.set([{ x: 0, y: Infinity }]);
    await fixture.whenStable();
    expect(svg.querySelector('polygon')).toBeNull();
    expect(svg.getAttribute('aria-label')).toBe('area chart, no data');
  });
});
