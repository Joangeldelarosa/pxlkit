import { Component } from '@angular/core';
import { PixelAreaChart, type PixelChartDataPoint } from '@pxlkit/ui-kit-angular';

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
  imports: [PixelAreaChart],
  template: `<svg pxlAreaChart [data]="sample"></svg>`,
})
export class Default {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelAreaChart],
  template: `
    <div class="flex flex-wrap items-end gap-4">
      <svg pxlAreaChart [data]="sample" tone="cyan"></svg>
      <svg pxlAreaChart [data]="sample" tone="green"></svg>
      <svg pxlAreaChart [data]="sample" tone="gold"></svg>
      <svg pxlAreaChart [data]="sample" tone="red"></svg>
      <svg pxlAreaChart [data]="sample" tone="purple"></svg>
      <svg pxlAreaChart [data]="sample" tone="pink"></svg>
    </div>
  `,
})
export class Tones {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelAreaChart],
  template: `
    <div class="flex flex-wrap items-end gap-4">
      <svg pxlAreaChart [data]="sample" size="sm" tone="cyan"></svg>
      <svg pxlAreaChart [data]="sample" size="md" tone="cyan"></svg>
      <svg pxlAreaChart [data]="sample" size="lg" tone="cyan"></svg>
    </div>
  `,
})
export class Sizes {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelAreaChart],
  template: `<svg pxlAreaChart [data]="sample" smooth tone="green"></svg>`,
})
export class Smooth {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelAreaChart],
  template: `
    <div class="flex flex-wrap items-end gap-4">
      <svg pxlAreaChart [data]="sample" surface="pixel" tone="purple"></svg>
      <svg pxlAreaChart [data]="sample" surface="linear" tone="purple"></svg>
    </div>
  `,
})
export class Surfaces {
  readonly sample = SAMPLE;
}
