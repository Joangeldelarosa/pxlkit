import { Component } from '@angular/core';
import { PixelSlideIn } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelSlideIn],
  template: `
    <pxl-slide-in>
      <div style="padding: 16px; background: #111; color: #fff">Slides in from below on mount</div>
    </pxl-slide-in>
  `,
})
export class Default {}

@Component({
  imports: [PixelSlideIn],
  template: `
    <pxl-slide-in from="left" [duration]="500" [distance]="20">
      <div style="padding: 16px; background: #0EA5E9; color: #000">Slides in from the left</div>
    </pxl-slide-in>
  `,
})
export class FromLeft {}

@Component({
  imports: [PixelSlideIn],
  template: `
    <pxl-slide-in trigger="hover" from="right" [duration]="300">
      <div style="padding: 16px; background: #222; color: #0EA5E9">Hover to slide in from the right</div>
    </pxl-slide-in>
  `,
})
export class OnHover {}
