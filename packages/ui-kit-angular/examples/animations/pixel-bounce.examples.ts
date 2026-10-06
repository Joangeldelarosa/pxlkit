import { Component } from '@angular/core';
import { PixelBounce } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelBounce],
  template: `
    <pxl-bounce>
      <span>Bounce</span>
    </pxl-bounce>
  `,
})
export class Default {}

@Component({
  imports: [PixelBounce],
  template: `
    <pxl-bounce [height]="16" [duration]="1000">
      <span>Higher Jump</span>
    </pxl-bounce>
  `,
})
export class TallerBounce {}

@Component({
  imports: [PixelBounce],
  template: `
    <pxl-bounce trigger="hover" [repeat]="1">
      <span>Hover me</span>
    </pxl-bounce>
  `,
})
export class HoverTrigger {}
