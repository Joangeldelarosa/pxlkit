import { Component } from '@angular/core';
import { PixelBarChart, type PixelChartDataPoint } from '@pxlkit/ui-kit-angular';

const SAMPLE: PixelChartDataPoint[] = [
  { x: 'Mon', y: 12 },
  { x: 'Tue', y: 18 },
  { x: 'Wed', y: 9 },
  { x: 'Thu', y: 24 },
  { x: 'Fri', y: 16 },
  { x: 'Sat', y: 21 },
  { x: 'Sun', y: 14 },
];

@Component({
  imports: [PixelBarChart],
  template: `<svg pxlBarChart [data]="sample"></svg>`,
})
export class Default {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelBarChart],
  template: `
    <div class="flex flex-wrap items-end gap-4">
      <svg pxlBarChart [data]="sample" tone="cyan"></svg>
      <svg pxlBarChart [data]="sample" tone="green"></svg>
      <svg pxlBarChart [data]="sample" tone="gold"></svg>
      <svg pxlBarChart [data]="sample" tone="red"></svg>
      <svg pxlBarChart [data]="sample" tone="purple"></svg>
      <svg pxlBarChart [data]="sample" tone="pink"></svg>
    </div>
  `,
})
export class Tones {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelBarChart],
  template: `
    <div class="flex flex-wrap items-end gap-4">
      <svg pxlBarChart [data]="sample" size="sm" tone="cyan"></svg>
      <svg pxlBarChart [data]="sample" size="md" tone="cyan"></svg>
      <svg pxlBarChart [data]="sample" size="lg" tone="cyan"></svg>
    </div>
  `,
})
export class Sizes {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelBarChart],
  template: `<svg pxlBarChart [data]="sample" orientation="horizontal" tone="green"></svg>`,
})
export class Horizontal {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelBarChart],
  template: `<svg pxlBarChart [data]="sample" tone="gold" showValues></svg>`,
})
export class WithValues {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelBarChart],
  template: `
    <div class="flex flex-wrap items-end gap-4">
      <svg pxlBarChart [data]="sample" surface="pixel" tone="purple"></svg>
      <svg pxlBarChart [data]="sample" surface="linear" tone="purple"></svg>
    </div>
  `,
})
export class Surfaces {
  readonly sample = SAMPLE;
}
