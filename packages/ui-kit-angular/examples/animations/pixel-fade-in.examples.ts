import { Component } from '@angular/core';
import { PixelFadeIn } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelFadeIn],
  template: `
    <pxl-fade-in>
      <div style="padding: 16px; background: #111; color: #fff">Fades in on mount</div>
    </pxl-fade-in>
  `,
})
export class Default {}

@Component({
  imports: [PixelFadeIn],
  template: `
    <pxl-fade-in [duration]="600" [delay]="200" easing="ease-out">
      <div style="padding: 16px; background: #0EA5E9; color: #000">Delayed fade-in</div>
    </pxl-fade-in>
  `,
})
export class Delayed {}

@Component({
  imports: [PixelFadeIn],
  template: `
    <pxl-fade-in trigger="hover" [duration]="300">
      <div style="padding: 16px; background: #222; color: #0EA5E9">Hover to fade in</div>
    </pxl-fade-in>
  `,
})
export class OnHover {}
