import { Component } from '@angular/core';
import { PixelZoomIn } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelZoomIn],
  template: `
    <pxl-zoom-in>
      <div style="padding: 16px; background: #0EA5E9; color: #fff; border-radius: 8px">Zoom in content</div>
    </pxl-zoom-in>
  `,
})
export class Default {}

@Component({
  imports: [PixelZoomIn],
  template: `
    <pxl-zoom-in [startScale]="0.6" [duration]="500">
      <div style="padding: 16px; background: #A855F7; color: #fff; border-radius: 8px">Bigger zoom from 0.6</div>
    </pxl-zoom-in>
  `,
})
export class CustomStartScale {}

@Component({
  imports: [PixelZoomIn],
  template: `
    <pxl-zoom-in trigger="hover" repeat="infinite" [duration]="600">
      <button style="padding: 12px; background: #111; color: #fff; border-radius: 6px">Hover me</button>
    </pxl-zoom-in>
  `,
})
export class HoverTrigger {}
