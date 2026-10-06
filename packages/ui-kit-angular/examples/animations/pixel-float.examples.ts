import { Component } from '@angular/core';
import { PixelFloat } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelFloat],
  template: `
    <pxl-float>
      <span>Float</span>
    </pxl-float>
  `,
})
export class Default {}

@Component({
  imports: [PixelFloat],
  template: `
    <pxl-float [distance]="14" [duration]="2800">
      <span>Drifting Higher</span>
    </pxl-float>
  `,
})
export class FartherTravel {}

@Component({
  imports: [PixelFloat],
  template: `
    <pxl-float trigger="hover" [repeat]="3">
      <span>Hover me</span>
    </pxl-float>
  `,
})
export class HoverTrigger {}
