import { Component } from '@angular/core';
import { PixelParallaxLayer } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelParallaxLayer],
  template: `
    <pxl-parallax-layer [speed]="0.5" axis="y">
      <div style="padding: 24px; background: #111; color: #fff">Scroll to see this layer move at half speed.</div>
    </pxl-parallax-layer>
  `,
})
export class Default {}

@Component({
  imports: [PixelParallaxLayer],
  template: `
    <pxl-parallax-layer [speed]="-0.3" axis="y">
      <div style="padding: 24px; background: #222; color: #fff">Foreground float-up (negative speed).</div>
    </pxl-parallax-layer>
  `,
})
export class Foreground {}

@Component({
  imports: [PixelParallaxLayer],
  template: `
    <div class="relative w-full overflow-hidden">
      <pxl-parallax-layer [speed]="0.4" axis="x">
        <div style="padding: 24px; background: #0EA5E9; color: #fff">Horizontal parallax drift.</div>
      </pxl-parallax-layer>
    </div>
  `,
})
export class Horizontal {}
