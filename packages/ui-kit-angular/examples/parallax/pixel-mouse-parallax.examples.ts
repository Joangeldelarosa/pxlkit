import { Component } from '@angular/core';
import { PixelMouseParallax } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelMouseParallax],
  template: `
    <div class="relative h-64 w-full overflow-hidden rounded border border-retro-border bg-retro-bg">
      <pxl-mouse-parallax [strength]="20">
        <div
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-retro-cyan/20 px-4 py-2 text-sm text-retro-cyan"
        >
          Follows the cursor
        </div>
      </pxl-mouse-parallax>
    </div>
  `,
})
export class Default {}

@Component({
  imports: [PixelMouseParallax],
  template: `
    <div class="relative h-64 w-full overflow-hidden rounded border border-retro-border bg-retro-bg">
      <pxl-mouse-parallax [strength]="30" invert>
        <div
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-retro-purple/20 px-4 py-2 text-sm text-retro-purple"
        >
          Repels from the cursor
        </div>
      </pxl-mouse-parallax>
    </div>
  `,
})
export class Inverted {}
