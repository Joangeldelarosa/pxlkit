/**
 * svg[pxlBarChart]: its accessible name, its value labels and a series that
 * changes.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelBarChart, type PixelChartDataPoint } from '../../public-api';

describe('PixelBarChart', () => {
  it('draws a bar per point, labels them on demand and follows its series', async () => {
    @Component({
      imports: [PixelBarChart],
      template: `<svg pxlBarChart [data]="data()" size="sm" orientation="horizontal" [showValues]="values()" aria-label="Sales"></svg>`,
    })
    class Host {
      readonly data = signal<PixelChartDataPoint[]>([
        { x: 'a', y: 4 },
        { x: 'b', y: -4 },
      ]);
      readonly values = signal(true);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.getAttribute('aria-label')).toBe('Sales');
    expect(Array.from(svg.querySelectorAll('rect'), (rect) => [rect.getAttribute('x'), rect.getAttribute('width')])).toEqual([
      ['4', '152'],
      ['4', '2'],
    ]);
    expect(Array.from(svg.querySelectorAll('text'), (text) => [text.textContent, text.getAttribute('text-anchor')])).toEqual([
      ['4', 'start'],
      ['-4', 'start'],
    ]);
    fixture.componentInstance.data.update((data) => [...data, { x: 'c', y: 0 }]);
    fixture.componentInstance.values.set(false);
    await fixture.whenStable();
    expect(svg.querySelectorAll('rect')).toHaveLength(3);
    expect(svg.querySelector('text')).toBeNull();
  });

  it('is named by a summary of its series and rounds its bars on the linear surface', async () => {
    @Component({
      imports: [PixelBarChart],
      template: `<svg pxlBarChart [data]="data" surface="linear"></svg>`,
    })
    class Host {
      readonly data = [{ x: 'a', y: 3 }];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(svg.getAttribute('aria-label')).toBe('bar chart with 1 point, range 3 to 3');
    expect(svg.querySelector('rect')!.getAttribute('rx')).toBe('2');
    expect(svg.getAttribute('shape-rendering')).toBe('geometricPrecision');
  });

  it('leaves the slot of a value that is not finite empty, without a bar or a label', async () => {
    @Component({
      imports: [PixelBarChart],
      template: `<svg pxlBarChart [data]="data" size="sm" showValues></svg>`,
    })
    class Host {
      readonly data: PixelChartDataPoint[] = [
        { x: 'a', y: 4 },
        { x: 'b', y: Number.NaN },
        { x: 'c', y: 2 },
        { x: 'd', y: Infinity },
      ];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg')!;
    expect(
      Array.from(svg.querySelectorAll('rect'), (rect) => ['x', 'y', 'width', 'height'].map((name) => rect.getAttribute(name))),
    ).toEqual([
      ['4', '14', '36.5', '36'],
      ['81', '32', '36.5', '18'],
    ]);
    expect(Array.from(svg.querySelectorAll('text'), (text) => text.textContent)).toEqual(['4', '2']);
    expect(svg.getAttribute('aria-label')).toBe('bar chart with 2 points, range 2 to 4');
  });
});
