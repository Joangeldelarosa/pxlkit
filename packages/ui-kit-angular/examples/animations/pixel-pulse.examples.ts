import { Component } from '@angular/core';
import { PixelPulse } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelPulse],
  template: `
    <pxl-pulse>
      <span>Pulse</span>
    </pxl-pulse>
  `,
})
export class Default {}

@Component({
  imports: [PixelPulse],
  template: `
    <pxl-pulse [duration]="1000">
      <span>Quick Pulse</span>
    </pxl-pulse>
  `,
})
export class FasterPulse {}

@Component({
  imports: [PixelPulse],
  template: `
    <pxl-pulse trigger="hover" [repeat]="1">
      <span>Hover me</span>
    </pxl-pulse>
  `,
})
export class HoverTrigger {}
