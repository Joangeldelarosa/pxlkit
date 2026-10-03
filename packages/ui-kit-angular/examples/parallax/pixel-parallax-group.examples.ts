import { Component } from '@angular/core';
import { PixelParallaxGroup } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelParallaxGroup],
  template: `
    <div pxlParallaxGroup style="height: 240px; background: #0b0b0f; color: #e5e7eb">
      <div style="position: absolute; inset: 0; display: grid; place-items: center">Parallax viewport</div>
    </div>
  `,
})
export class Default {}

@Component({
  imports: [PixelParallaxGroup],
  template: `
    <section pxlParallaxGroup style="height: 200px; background: #111827; color: #e5e7eb">
      <div style="position: absolute; inset: 0; display: grid; place-items: center">Section variant</div>
    </section>
  `,
})
export class AsSection {}
