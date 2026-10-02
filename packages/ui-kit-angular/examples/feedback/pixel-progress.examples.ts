import { Component } from '@angular/core';
import { PixelProgress } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelProgress],
  template: `<pxl-progress [value]="60" label="HP" />`,
})
export class Default {}

@Component({
  imports: [PixelProgress],
  template: `
    <div class="space-y-3">
      <pxl-progress [value]="70" tone="neutral" label="Neutral" />
      <pxl-progress [value]="70" tone="green" label="Green" />
      <pxl-progress [value]="70" tone="cyan" label="Cyan" />
      <pxl-progress [value]="70" tone="gold" label="Gold" />
      <pxl-progress [value]="70" tone="red" label="Red" />
      <pxl-progress [value]="70" tone="purple" label="Purple" />
      <pxl-progress [value]="70" tone="pink" label="Pink" />
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelProgress],
  template: `
    <div class="space-y-4">
      <pxl-progress [value]="55" label="Pixel (segmented)" surface="pixel" />
      <pxl-progress [value]="55" label="Linear (smooth)" surface="linear" />
    </div>
  `,
})
export class Surfaces {}

@Component({
  imports: [PixelProgress],
  template: `<pxl-progress [value]="45" label="Loading assets" [showValue]="false" />`,
})
export class WithoutValue {}

@Component({
  imports: [PixelProgress],
  template: `<pxl-progress [value]="80" />`,
})
export class WithoutLabel {}

@Component({
  imports: [PixelProgress],
  template: `<pxl-progress [value]="0" label="Working…" indeterminate />`,
})
export class Indeterminate {}

@Component({
  imports: [PixelProgress],
  template: `
    <div class="space-y-3">
      <pxl-progress [value]="-25" label="Below 0 (clamped to 0)" />
      <pxl-progress [value]="150" label="Above 100 (clamped to 100)" />
    </div>
  `,
})
export class Clamped {}

@Component({
  imports: [PixelProgress],
  template: `
    <div class="space-y-3">
      <pxl-progress [value]="0" label="0%" />
      <pxl-progress [value]="25" label="25%" />
      <pxl-progress [value]="50" label="50%" />
      <pxl-progress [value]="75" label="75%" />
      <pxl-progress [value]="100" label="100%" />
    </div>
  `,
})
export class Steps {}
