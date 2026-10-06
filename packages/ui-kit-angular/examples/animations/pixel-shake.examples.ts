import { Component } from '@angular/core';
import { PixelShake } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelShake],
  template: `
    <pxl-shake>
      <span>Shake on mount</span>
    </pxl-shake>
  `,
})
export class Default {}

@Component({
  imports: [PixelShake],
  template: `
    <pxl-shake trigger="hover" repeat="infinite" [duration]="300">
      <span>Hover to shake</span>
    </pxl-shake>
  `,
})
export class OnHover {}

@Component({
  imports: [PixelShake],
  template: `
    <pxl-shake [distance]="6" [duration]="600" [repeat]="3">
      <span>Stronger shake</span>
    </pxl-shake>
  `,
})
export class StrongShake {}
