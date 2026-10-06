import { Component } from '@angular/core';
import { PixelSparkline, type PixelChartDataPoint } from '@pxlkit/ui-kit-angular';

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
  imports: [PixelSparkline],
  template: `<svg pxlSparkline [data]="sample"></svg>`,
})
export class Default {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelSparkline],
  template: `
    <div class="flex flex-wrap items-center gap-4">
      <svg pxlSparkline [data]="sample" tone="cyan"></svg>
      <svg pxlSparkline [data]="sample" tone="green"></svg>
      <svg pxlSparkline [data]="sample" tone="gold"></svg>
      <svg pxlSparkline [data]="sample" tone="red"></svg>
      <svg pxlSparkline [data]="sample" tone="purple"></svg>
      <svg pxlSparkline [data]="sample" tone="pink"></svg>
    </div>
  `,
})
export class Tones {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelSparkline],
  template: `
    <div class="flex flex-wrap items-center gap-4">
      <svg pxlSparkline [data]="sample" size="sm" tone="cyan"></svg>
      <svg pxlSparkline [data]="sample" size="md" tone="cyan"></svg>
      <svg pxlSparkline [data]="sample" size="lg" tone="cyan"></svg>
    </div>
  `,
})
export class Sizes {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelSparkline],
  template: `<svg pxlSparkline [data]="sample" tone="green" showArea></svg>`,
})
export class WithArea {
  readonly sample = SAMPLE;
}

@Component({
  imports: [PixelSparkline],
  template: `
    <div class="flex flex-wrap items-center gap-4">
      <svg pxlSparkline [data]="sample" surface="pixel" tone="purple"></svg>
      <svg pxlSparkline [data]="sample" surface="linear" tone="purple"></svg>
    </div>
  `,
})
export class Surfaces {
  readonly sample = SAMPLE;
}
