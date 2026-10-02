import { Component } from '@angular/core';
import { PixelRotate } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelRotate],
  template: `
    <pxl-rotate>
      <span>Rotate</span>
    </pxl-rotate>
  `,
})
export class Default {}

@Component({
  imports: [PixelRotate],
  template: `
    <pxl-rotate direction="reverse" [duration]="2400">
      <span>Reverse</span>
    </pxl-rotate>
  `,
})
export class ReverseDirection {}

@Component({
  imports: [PixelRotate],
  template: `
    <pxl-rotate trigger="hover" [repeat]="1" [duration]="900">
      <span>Hover me</span>
    </pxl-rotate>
  `,
})
export class HoverTrigger {}
