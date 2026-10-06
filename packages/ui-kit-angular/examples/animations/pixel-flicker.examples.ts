import { Component } from '@angular/core';
import { PixelFlicker } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelFlicker],
  template: `
    <pxl-flicker>
      <span>OPEN 24/7</span>
    </pxl-flicker>
  `,
})
export class Default {}

@Component({
  imports: [PixelFlicker],
  template: `
    <pxl-flicker [duration]="900">
      <span>NEON</span>
    </pxl-flicker>
  `,
})
export class FasterFlicker {}

@Component({
  imports: [PixelFlicker],
  template: `
    <pxl-flicker trigger="hover" [repeat]="1">
      <span>Hover me</span>
    </pxl-flicker>
  `,
})
export class HoverTrigger {}
