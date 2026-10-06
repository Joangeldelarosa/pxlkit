import { Component } from '@angular/core';
import { PixelGlitch, PixelGlitchContent } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelGlitch, PixelGlitchContent],
  template: `
    <pxl-glitch>
      <span *pxlGlitchContent class="text-2xl font-bold">SYSTEM ONLINE</span>
    </pxl-glitch>
  `,
})
export class Default {}

@Component({
  imports: [PixelGlitch, PixelGlitchContent],
  template: `
    <pxl-glitch [intensity]="8" [duration]="2000">
      <span *pxlGlitchContent class="text-2xl font-bold">CRITICAL ERROR</span>
    </pxl-glitch>
  `,
})
export class HighIntensity {}

@Component({
  imports: [PixelGlitch, PixelGlitchContent],
  template: `
    <pxl-glitch trigger="hover">
      <span *pxlGlitchContent class="text-2xl font-bold">HOVER ME</span>
    </pxl-glitch>
  `,
})
export class HoverTrigger {}

@Component({
  imports: [PixelGlitch],
  template: `
    <h2 class="text-2xl font-bold">
      <span pxlGlitch label="SIGNAL LOST"></span>
    </h2>
  `,
})
export class HeadingLabel {}
